import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
    const userEmail = claimsData.claims.email;

    // Parse request body for confirmation
    let body: { confirmation?: string } = {};
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.confirmation !== "DELETE MY ACCOUNT") {
      return new Response(
        JSON.stringify({ error: "Confirmation text must be exactly 'DELETE MY ACCOUNT'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role for deletion
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    console.log(`Starting account deletion for user ${userId} (${userEmail})`);

    // Delete data from all tables (order matters for any potential FK references)
    const tablesToDelete = [
      "email_notifications",
      "compliance_reminders",
      "life_file_shares",
      "shared_access",
      "life_file_assets",
      "life_file_documents",
      "beneficiaries",
      "emergency_contacts",
      "social_media_accounts",
      "athlete_contracts",
      "athlete_endorsements",
      "artist_projects",
      "artist_royalties",
      "payslip_tax_documents",
      "client_invitations",
      "portal_staff_access",
      "agent_manager_profiles",
      "user_subscriptions",
      "user_roles",
      "profiles",
    ];

    const errors: string[] = [];

    for (const table of tablesToDelete) {
      // Some tables use different user columns
      let column = "user_id";
      if (table === "life_file_shares" || table === "shared_access") {
        column = "owner_id";
      } else if (table === "client_invitations" || table === "portal_staff_access") {
        column = "agent_id";
      }

      const { error } = await supabase.from(table).delete().eq(column, userId);
      if (error) {
        console.error(`Error deleting from ${table}:`, error.message);
        errors.push(`${table}: ${error.message}`);
      }
    }

    // Also delete shares/access where user is recipient
    await supabase.from("life_file_shares").delete().eq("shared_with_user_id", userId);
    await supabase.from("shared_access").delete().eq("shared_with_user_id", userId);
    await supabase.from("portal_staff_access").delete().eq("staff_user_id", userId);

    // Delete storage files from all buckets
    const buckets = ["life-file-documents", "payslip-tax-documents", "contract-files", "agent-client-documents"];

    for (const bucket of buckets) {
      try {
        const { data: files } = await supabase.storage.from(bucket).list(userId);
        if (files && files.length > 0) {
          const filePaths = files.map((f) => `${userId}/${f.name}`);
          await supabase.storage.from(bucket).remove(filePaths);
        }
      } catch (err) {
        console.error(`Error cleaning storage bucket ${bucket}:`, err);
      }
    }

    // Audit log: record account deletion BEFORE deleting auth user (so the row persists for admin review)
    await supabase.from("audit_log").insert({
      user_id: userId,
      action: "account_deletion",
      entity_type: "user_account",
      entity_id: userId,
      metadata: {
        email: userEmail,
        tables_cleaned: tablesToDelete,
        warnings: errors.length > 0 ? errors : undefined,
      },
    });

    // Delete the auth user
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      console.error("Error deleting auth user:", deleteUserError.message);
      return new Response(
        JSON.stringify({ error: "Failed to delete authentication account", details: deleteUserError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Account deletion complete for user ${userId}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your account and all associated data have been permanently deleted.",
        warnings: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Delete account error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
