import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface RequestBody {
  before?: string | null;
  member_filter?: string | null;
  action_filter?: string | null;
  limit?: number;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Identify caller via their JWT
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userRes, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userRes?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = userRes.user.id;

    // Caller must be the agency owner
    const admin = createClient(supabaseUrl, serviceKey);
    const { data: agencyRow } = await admin
      .from("agent_manager_profiles")
      .select("user_id, company_name")
      .eq("user_id", callerId)
      .maybeSingle();
    if (!agencyRow) {
      return new Response(JSON.stringify({ error: "Owner-only endpoint" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body: RequestBody = await req.json().catch(() => ({}));
    const limit = Math.min(Math.max(body.limit ?? 20, 1), 100);

    // Workspace members: owner + ALL staff EVER linked (active OR revoked) so
    // former members still appear in audit history. Active set is computed
    // separately for the "Current vs Former" UI grouping.
    const { data: allStaffRows } = await admin
      .from("portal_staff_access")
      .select("staff_user_id, staff_name, role_label, status")
      .eq("agent_id", callerId)
      .not("staff_user_id", "is", null);

    const memberMap = new Map<string, { name: string; role: string; active: boolean }>();
    memberMap.set(callerId, { name: "Owner", role: "Owner", active: true });
    (allStaffRows ?? []).forEach((r) => {
      memberMap.set(r.staff_user_id as string, {
        name: r.staff_name,
        role: r.role_label,
        active: r.status === "active",
      });
    });

    // Owner display name
    const { data: ownerProfile } = await admin
      .from("profiles").select("display_name").eq("user_id", callerId).maybeSingle();
    if (ownerProfile?.display_name) {
      memberMap.set(callerId, { name: ownerProfile.display_name, role: "Owner", active: true });
    }

    // Workspace audit scope = anything authored by owner, current staff, or
    // former staff. We constrain to audit entries whose metadata.agency_id
    // matches the caller (owner). Fallback for older rows: filter by user_id
    // membership in the union set we know about.
    const knownMemberIds = Array.from(memberMap.keys());

    let q = admin
      .from("audit_log")
      .select("id, action, entity_type, entity_id, user_id, metadata, created_at")
      .or(`metadata->>agency_id.eq.${callerId},user_id.in.(${knownMemberIds.join(",")})`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (body.before) q = q.lt("created_at", body.before);
    if (body.member_filter) q = q.eq("user_id", body.member_filter);
    if (body.action_filter) q = q.ilike("action", `%${body.action_filter}%`);

    const { data: rows, error } = await q;
    if (error) throw error;

    // Resolve any author uuids we don't already know about (defensive — covers
    // edge case where a row's user_id isn't in portal_staff_access at all).
    const unknownAuthors = Array.from(
      new Set((rows ?? []).map((r) => r.user_id as string).filter((u) => u && !memberMap.has(u))),
    );
    if (unknownAuthors.length) {
      const { data: extraProfiles } = await admin
        .from("profiles").select("user_id, display_name").in("user_id", unknownAuthors);
      (extraProfiles ?? []).forEach((p) => {
        memberMap.set(p.user_id, {
          name: p.display_name ?? "Former member",
          role: "Former member",
          active: false,
        });
      });
    }

    const enriched = (rows ?? []).map((r) => ({
      id: r.id,
      action: r.action,
      entity_type: r.entity_type,
      entity_id: r.entity_id,
      created_at: r.created_at,
      metadata: r.metadata,
      member_name: memberMap.get(r.user_id as string)?.name ?? "Unknown",
      member_role: memberMap.get(r.user_id as string)?.role ?? "—",
      user_id: r.user_id,
    }));

    const members = Array.from(memberMap.entries()).map(([id, v]) => ({
      user_id: id, name: v.name, role: v.role, active: v.active,
    }));

    return new Response(JSON.stringify({ entries: enriched, members, agency_name: agencyRow.company_name }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[get-workspace-activity]", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});