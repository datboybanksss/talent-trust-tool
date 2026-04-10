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

    const tables = [
      "profiles",
      "beneficiaries",
      "emergency_contacts",
      "life_file_documents",
      "life_file_assets",
      "life_file_shares",
      "social_media_accounts",
      "athlete_contracts",
      "athlete_endorsements",
      "artist_projects",
      "artist_royalties",
      "compliance_reminders",
      "email_notifications",
      "payslip_tax_documents",
      "shared_access",
      "user_subscriptions",
    ];

    const exportData: Record<string, unknown> = {
      exported_at: new Date().toISOString(),
      user_id: userId,
    };

    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", userId);

      if (error) {
        console.error(`Error fetching ${table}:`, error.message);
        exportData[table] = { error: error.message };
      } else {
        exportData[table] = data;
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
