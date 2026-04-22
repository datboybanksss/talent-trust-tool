import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// COUPLING NOTE (mirrors client_invitations.requested_share_sections column comment):
// life_file_shares.owner_id is NOT NULL. We can't pre-create the share row at
// invitation time because the client's user_id doesn't exist yet. Instead we
// stage the agent's requested sections on client_invitations.requested_share_sections,
// then consume them here at activation to create the life_file_shares row.
// life_file_shares.status is the single source of truth for the client's response;
// we never write a "response" column back to client_invitations.

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, token, password } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "lookup") {
      const { data: invitation, error } = await supabaseAdmin
        .from("client_invitations")
        .select("id, client_name, client_email, client_phone, client_type, status, pre_populated_data, expires_at, agent_id")
        .eq("invitation_token", token)
        .maybeSingle();

      if (error || !invitation) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired activation link." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Expiry check — block before password form ever renders.
      if (invitation.expires_at && new Date(invitation.expires_at as string) < new Date()) {
        // Resolve agent contact for the "ask your agent" copy.
        const { data: agentProfile } = await supabaseAdmin
          .from("agent_manager_profiles")
          .select("company_name, user_id")
          .eq("user_id", invitation.agent_id)
          .maybeSingle();

        let agent_email: string | null = null;
        let agent_name: string | null = agentProfile?.company_name ?? null;
        if (agentProfile?.user_id) {
          const { data: agentUser } = await supabaseAdmin.auth.admin.getUserById(agentProfile.user_id);
          agent_email = agentUser?.user?.email ?? null;
        }

        return new Response(
          JSON.stringify({ error: "expired", agent_email, agent_name }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 410 }
        );
      }

      return new Response(
        JSON.stringify({ invitation }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "activate") {
      const { data: invitation, error: invError } = await supabaseAdmin
        .from("client_invitations")
        .select("*")
        .eq("invitation_token", token)
        .eq("status", "pending")
        .maybeSingle();

      if (invError || !invitation) {
        return new Response(
          JSON.stringify({ error: "Invalid or already activated invitation." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Re-check expiry at activation time too.
      if (invitation.expires_at && new Date(invitation.expires_at as string) < new Date()) {
        return new Response(
          JSON.stringify({ error: "This activation link has expired." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 410 }
        );
      }

      // Create user account with auto-confirm
      const { data: userData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: invitation.client_email,
        password: password,
        email_confirm: true,
        user_metadata: {
          display_name: invitation.client_name,
          client_type: invitation.client_type,
        },
      });

      if (signUpError) {
        if (signUpError.message.includes("already been registered")) {
          return new Response(
            JSON.stringify({ error: "An account with this email already exists. Please sign in instead." }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        return new Response(
          JSON.stringify({ error: signUpError.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      const userId = userData.user.id;

      // Update the profile with pre-populated data
      if (invitation.client_phone) {
        await supabaseAdmin
          .from("profiles")
          .update({ phone: invitation.client_phone })
          .eq("user_id", userId);
      }

      // Transfer agent-uploaded documents to client's life-file-documents
      const preData = invitation.pre_populated_data as Record<string, unknown> | null;
      const documents = (preData?.documents as Array<{ file_name: string; storage_path: string; document_type: string }>) || [];

      const documentsRequested = documents.length;
      let documentsTransferred = 0;
      const documentsFailed: Array<{ filename: string; error: string }> = [];

      for (const doc of documents) {
        try {
          const { data: fileData, error: dlError } = await supabaseAdmin.storage
            .from("agent-client-documents")
            .download(doc.storage_path);

          if (dlError || !fileData) {
            documentsFailed.push({ filename: doc.file_name, error: dlError?.message ?? "download failed" });
            continue;
          }

          const clientPath = `${userId}/${doc.file_name}`;
          const { error: upError } = await supabaseAdmin.storage
            .from("life-file-documents")
            .upload(clientPath, fileData, { upsert: true });

          if (upError) {
            documentsFailed.push({ filename: doc.file_name, error: upError.message });
            continue;
          }

          await supabaseAdmin.from("life_file_documents").insert({
            user_id: userId,
            title: doc.file_name.replace(/\.[^/.]+$/, ""),
            document_type: doc.document_type || "other",
            file_name: doc.file_name,
            file_url: clientPath,
            status: "complete",
            notes: "Pre-loaded by your agent/manager.",
          });

          documentsTransferred++;
        } catch (e) {
          documentsFailed.push({ filename: doc.file_name, error: (e as Error).message });
        }
      }

      // Create pending share row if the agent requested one.
      // See coupling note at top of file.
      const requestedSections = (invitation as { requested_share_sections?: string[] | null }).requested_share_sections;
      if (requestedSections && Array.isArray(requestedSections) && requestedSections.length > 0) {
        const { data: agentUser } = await supabaseAdmin.auth.admin.getUserById(invitation.agent_id);
        const agentEmail = agentUser?.user?.email ?? "";
        await supabaseAdmin.from("life_file_shares").insert({
          owner_id: userId,
          shared_with_user_id: invitation.agent_id,
          shared_with_email: agentEmail,
          sections: requestedSections,
          status: "pending_client_approval",
          relationship: "Agent",
          access_level: "view",
        });
      }

      // Mark invitation as activated
      await supabaseAdmin
        .from("client_invitations")
        .update({
          status: "activated",
          activated_at: new Date().toISOString(),
          activated_user_id: userId,
        })
        .eq("id", invitation.id);

      // Audit log for any document transfer failures (visible to agent).
      if (documentsFailed.length > 0) {
        await supabaseAdmin.from("audit_log").insert({
          action: "client_activation_document_transfer_failed",
          entity_type: "client_invitation",
          entity_id: invitation.id,
          user_id: invitation.agent_id,
          metadata: {
            failed: documentsFailed,
            transferred: documentsTransferred,
            requested: documentsRequested,
          },
        });
      }

      // Auto-sign-in: generate a magic link the client can verify in-browser.
      let magic_link_token_hash: string | null = null;
      try {
        const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: invitation.client_email,
        });
        magic_link_token_hash = (linkData?.properties as { hashed_token?: string } | undefined)?.hashed_token ?? null;
      } catch {
        // Non-fatal — frontend falls back to manual sign-in.
        magic_link_token_hash = null;
      }

      return new Response(
        JSON.stringify({
          success: true,
          documentsRequested,
          documentsTransferred,
          documentsFailed,
          magic_link_token_hash,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
