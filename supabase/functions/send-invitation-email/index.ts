import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";
import {
  staffInvitationEmail,
  clientInvitationEmail,
} from "../_shared/email-templates.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RequestBody {
  invitation_type: "staff" | "client";
  invitation_id: string;
  app_origin: string;
}

function bad(message: string, status = 400) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // 1. Parse + validate body
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return bad("Invalid JSON body.");
  }
  if (!body.invitation_type || !["staff", "client"].includes(body.invitation_type)) {
    return bad("invitation_type must be 'staff' or 'client'.");
  }
  if (!body.invitation_id || typeof body.invitation_id !== "string") return bad("invitation_id is required.");
  if (!body.app_origin || typeof body.app_origin !== "string") return bad("app_origin is required.");

  // 2. Identify caller (allow service-role or owning agent)
  const authHeader = req.headers.get("Authorization") ?? "";
  let callerId: string | null = null;
  let isServiceRole = false;
  if (authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    if (token === serviceKey) {
      isServiceRole = true;
    } else {
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data, error } = await userClient.auth.getClaims(token);
      if (!error && data?.claims?.sub) callerId = data.claims.sub as string;
    }
  }
  if (!isServiceRole && !callerId) return bad("Unauthorized.", 401);

  // 3. Load invitation
  let invitation: Record<string, unknown> | null = null;
  let agencyAgentId: string | null = null;
  let recipientEmail = "";
  let recipientName = "";
  let expiresAt: string | null = null;
  let token = "";
  let roleLabel = "";
  let sections: string[] = [];
  let clientType = "";

  if (body.invitation_type === "staff") {
    const { data, error } = await admin
      .from("portal_staff_access")
      .select("id, agent_id, staff_email, staff_name, role_label, sections, invitation_token, expires_at")
      .eq("id", body.invitation_id)
      .maybeSingle();
    if (error || !data) return bad("Invitation not found.", 404);
    invitation = data as Record<string, unknown>;
    agencyAgentId = data.agent_id as string;
    recipientEmail = data.staff_email as string;
    recipientName = data.staff_name as string;
    expiresAt = (data.expires_at as string) ?? null;
    token = data.invitation_token as string;
    roleLabel = (data.role_label as string) ?? "Custom Role";
    sections = (data.sections as string[]) ?? [];
  } else {
    const { data, error } = await admin
      .from("client_invitations")
      .select("id, agent_id, client_email, client_name, client_type, invitation_token, expires_at")
      .eq("id", body.invitation_id)
      .maybeSingle();
    if (error || !data) return bad("Invitation not found.", 404);
    invitation = data as Record<string, unknown>;
    agencyAgentId = data.agent_id as string;
    recipientEmail = data.client_email as string;
    recipientName = data.client_name as string;
    expiresAt = (data.expires_at as string) ?? null;
    token = data.invitation_token as string;
    clientType = (data.client_type as string) ?? "athlete";
  }

  // 4. Ownership check
  if (!isServiceRole && callerId !== agencyAgentId) {
    return bad("Forbidden.", 403);
  }

  // 5. is_demo guard
  const { data: inviterProfile } = await admin
    .from("profiles")
    .select("is_demo, display_name")
    .eq("user_id", agencyAgentId!)
    .maybeSingle();
  const inviterName = (inviterProfile?.display_name as string) || "Your agent";

  const { data: agencyProfile } = await admin
    .from("agent_manager_profiles")
    .select("company_name")
    .eq("user_id", agencyAgentId!)
    .maybeSingle();
  const agencyName = (agencyProfile?.company_name as string) || inviterName;

  if (inviterProfile?.is_demo === true) {
    await admin.from("audit_log").insert({
      action: "invitation_email_skipped_demo",
      entity_type: "invitation",
      entity_id: body.invitation_id,
      user_id: agencyAgentId,
      metadata: { invitation_type: body.invitation_type, recipient: recipientEmail },
    });
    return new Response(
      JSON.stringify({ success: true, demo: true, message: "Demo mode — email not actually sent." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // 6. Returning-user detection (profiles → auth.users join, service-role only)
  let isReturningUser = false;
  const { data: existingUser } = await admin
    .schema("auth" as never)
    .from("users" as never)
    .select("id")
    .ilike("email" as never, recipientEmail)
    .maybeSingle();
  if (existingUser) isReturningUser = true;

  // 7. Build template + activation URL
  // Always use the published public domain so invitees (who don't have Lovable accounts)
  // never get routed through the Lovable preview login. The caller's app_origin is ignored
  // for activation links to keep external users on a public, auth-free landing page.
  const PUBLIC_APP_ORIGIN = "https://themvpbuilder.co.za";
  const path = body.invitation_type === "staff" ? "staff-activate" : "client-activate";
  const activationUrl = `${PUBLIC_APP_ORIGIN}/${path}/${token}`;

  const tpl = body.invitation_type === "staff"
    ? staffInvitationEmail({
        recipientName, agencyName, inviterName, roleLabel, sections,
        activationUrl, expiresAt, isReturningUser,
      })
    : clientInvitationEmail({
        recipientName, agencyName, inviterName, clientType,
        activationUrl, expiresAt, isReturningUser,
      });

  // 8. Send via existing send-email wrapper
  let success = false;
  let errorMessage: string | null = null;
  try {
    const sendRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${serviceKey}` },
      body: JSON.stringify({ to: recipientEmail, subject: tpl.subject, html: tpl.html }),
    });
    const result = await sendRes.json();
    success = !!result.success;
    if (!success) errorMessage = result.error ?? `send-email returned ${sendRes.status}`;
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : "Unknown send error";
  }

  await admin.from("audit_log").insert({
    action: success ? "invitation_email_sent" : "invitation_email_failed",
    entity_type: "invitation",
    entity_id: body.invitation_id,
    user_id: agencyAgentId,
    metadata: {
      invitation_type: body.invitation_type,
      recipient: recipientEmail,
      is_returning_user: isReturningUser,
      error: errorMessage,
    },
  });

  return new Response(
    JSON.stringify({
      success,
      isReturningUser,
      activationUrl,
      error: success ? undefined : (errorMessage ?? "Email delivery failed"),
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});