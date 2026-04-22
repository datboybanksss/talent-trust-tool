import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function res(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  let body: { invitation_type?: string; token?: string };
  try {
    body = await req.json();
  } catch {
    return res({ error: "Invalid JSON body." }, 400);
  }
  const { invitation_type, token } = body;
  if (!invitation_type || !["staff", "client"].includes(invitation_type)) {
    return res({ error: "invitation_type must be 'staff' or 'client'." }, 400);
  }
  if (!token || typeof token !== "string") {
    return res({ error: "token is required." }, 400);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  if (invitation_type === "staff") {
    const { data, error } = await admin
      .from("portal_staff_access")
      .select("id, agent_id, staff_email, staff_name, role, role_label, sections, status, invitation_token, expires_at, activated_at, confidentiality_accepted_at")
      .eq("invitation_token", token)
      .maybeSingle();
    if (error || !data) return res({ error: "Invalid invitation link." }, 404);
    if (data.activated_at) return res({ error: "This invitation has already been activated. Please sign in instead.", code: "already_activated" }, 410);
    if (data.expires_at && new Date(data.expires_at as string) < new Date()) {
      return res({ error: "This invitation has expired. Ask the agent to send a new one.", code: "expired", expired_at: data.expires_at }, 410);
    }

    // Look up agency name
    const { data: agency } = await admin
      .from("agent_manager_profiles")
      .select("company_name")
      .eq("user_id", data.agent_id as string)
      .maybeSingle();

    return res({
      invitation: {
        id: data.id,
        recipient_email: data.staff_email,
        recipient_name: data.staff_name,
        role: data.role,
        role_label: data.role_label,
        sections: data.sections,
        agency_name: agency?.company_name ?? "Agent Portal",
        status: data.status,
        confidentiality_accepted_at: data.confidentiality_accepted_at,
      },
    });
  }

  // client
  const { data, error } = await admin
    .from("client_invitations")
    .select("id, agent_id, client_email, client_name, client_phone, client_type, status, invitation_token, expires_at, activated_at, archived_at, pre_populated_data")
    .eq("invitation_token", token)
    .maybeSingle();
  if (error || !data) return res({ error: "Invalid invitation link." }, 404);
  if (data.activated_at || data.status === "activated") {
    return res({ error: "This profile has already been activated. Please sign in instead.", code: "already_activated" }, 410);
  }
  if (data.expires_at && new Date(data.expires_at as string) < new Date()) {
    return res({ error: "This invitation has expired. Ask the agent to send a new one.", code: "expired", expired_at: data.expires_at }, 410);
  }

  return res({
    invitation: {
      id: data.id,
      recipient_email: data.client_email,
      recipient_name: data.client_name,
      client_phone: data.client_phone,
      client_type: data.client_type,
      status: data.status,
      pre_populated_data: data.pre_populated_data,
    },
  });
});