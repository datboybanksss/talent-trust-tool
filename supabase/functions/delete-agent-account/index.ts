import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "missing_auth" }, 401);
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Caller-scoped client to validate JWT + run RPC as the user
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await userClient.auth.getUser();
    if (userErr || !userData.user) {
      return json({ error: "invalid_token" }, 401);
    }
    const userId = userData.user.id;
    const email = userData.user.email ?? null;

    // 1. RPC — performs is_demo guard FIRST and then cascade-deletes.
    const { error: rpcErr } = await userClient.rpc("delete_agent_account");
    if (rpcErr) {
      const msg = rpcErr.message ?? "rpc_failed";
      const isDemo = msg.toLowerCase().includes("demo");
      return json(
        { error: isDemo ? "demo_account" : "rpc_failed", message: msg },
        isDemo ? 403 : 400,
      );
    }

    // 2. Service-role client for auth.users cleanup + audit logging.
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

    const { error: delErr } = await admin.auth.admin.deleteUser(userId);
    if (delErr) {
      // Partial failure: data gone, auth.users row remains.
      const { data: log } = await admin
        .from("audit_log")
        .insert({
          action: "delete_agent_account_orphaned",
          entity_type: "agent_account",
          entity_id: userId,
          user_id: userId,
          metadata: {
            email,
            error: delErr.message,
            occurred_at: new Date().toISOString(),
          },
        })
        .select("id")
        .maybeSingle();

      return json(
        {
          error: "auth_cleanup_failed",
          orphaned: true,
          reference: log?.id ?? null,
          message:
            "Your account data was removed but auth cleanup failed — contact support.",
        },
        500,
      );
    }

    await admin.from("audit_log").insert({
      action: "delete_agent_account",
      entity_type: "agent_account",
      entity_id: userId,
      user_id: userId,
      metadata: { email },
    });

    return json({ success: true }, 200);
  } catch (e) {
    return json({ error: "unexpected", message: (e as Error).message }, 500);
  }
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}