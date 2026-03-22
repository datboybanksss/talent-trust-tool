import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
        .select("id, client_name, client_email, client_phone, client_type, status, pre_populated_data")
        .eq("invitation_token", token)
        .maybeSingle();

      if (error || !invitation) {
        return new Response(
          JSON.stringify({ error: "Invalid or expired activation link." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
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

      for (const doc of documents) {
        try {
          // Download from agent bucket
          const { data: fileData, error: dlError } = await supabaseAdmin.storage
            .from("agent-client-documents")
            .download(doc.storage_path);

          if (dlError || !fileData) continue;

          // Upload to client's life-file-documents bucket
          const clientPath = `${userId}/${doc.file_name}`;
          const { error: upError } = await supabaseAdmin.storage
            .from("life-file-documents")
            .upload(clientPath, fileData, { upsert: true });

          if (upError) continue;

          // Get public URL for the file
          const { data: urlData } = supabaseAdmin.storage
            .from("life-file-documents")
            .getPublicUrl(clientPath);

          // Create a life_file_documents record for the client
          await supabaseAdmin.from("life_file_documents").insert({
            user_id: userId,
            title: doc.file_name.replace(/\.[^/.]+$/, ""),
            document_type: doc.document_type || "other",
            file_name: doc.file_name,
            file_url: clientPath,
            status: "complete",
            notes: "Pre-loaded by your agent/manager.",
          });
        } catch {
          // Continue with other documents if one fails
          continue;
        }
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

      return new Response(
        JSON.stringify({ success: true, documentsTransferred: documents.length }),
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
