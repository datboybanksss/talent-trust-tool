import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Use service role to fetch all data
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const tables: Array<{ name: string; column: string }> = [
      { name: "profiles", column: "user_id" },
      { name: "beneficiaries", column: "user_id" },
      { name: "emergency_contacts", column: "user_id" },
      { name: "life_file_documents", column: "user_id" },
      { name: "life_file_assets", column: "user_id" },
      { name: "life_file_shares", column: "owner_id" },
      { name: "shared_access", column: "owner_id" },
      { name: "social_media_accounts", column: "user_id" },
      { name: "athlete_contracts", column: "user_id" },
      { name: "athlete_endorsements", column: "user_id" },
      { name: "artist_projects", column: "user_id" },
      { name: "artist_royalties", column: "user_id" },
      { name: "compliance_reminders", column: "user_id" },
      { name: "email_notifications", column: "user_id" },
      { name: "payslip_tax_documents", column: "user_id" },
      { name: "user_subscriptions", column: "user_id" },
    ];

    const exportData: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      user_id: userId,
    };

    for (const { name, column } of tables) {
      const { data, error } = await supabase
        .from(name)
        .select("*")
        .eq(column, userId);

      if (error) {
        console.error(`Error fetching ${name}:`, error.message);
        exportData[name] = { error: error.message };
      } else {
        exportData[name] = data;
      }
    }

    // Also fetch shares where user is recipient
    const { data: receivedShares } = await supabase
      .from("life_file_shares")
      .select("*")
      .eq("shared_with_user_id", userId);

    exportData["life_file_shares_received"] = receivedShares || [];

    const { data: receivedAccess } = await supabase
      .from("shared_access")
      .select("*")
      .eq("shared_with_user_id", userId);

    exportData["shared_access_received"] = receivedAccess || [];

    return new Response(JSON.stringify(exportData, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="my-data-export-${new Date().toISOString().split("T")[0]}.json"`,
      },
    });
  } catch (err) {
    console.error("Export error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
