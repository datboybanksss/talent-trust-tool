import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Log cron run start
  const { data: cronRun } = await supabase
    .from("cron_job_runs")
    .insert({ job_name: "document-expiry-reminders", status: "running" })
    .select("id")
    .single();

  try {
    const now = new Date();

    const { data: documents, error } = await supabase
      .from("life_file_documents")
      .select("*, profiles!life_file_documents_user_id_fkey(display_name)")
      .eq("is_expired", false)
      .not("expiry_date", "is", null)
      .or(
        "reminder_30_days.eq.true,reminder_60_days.eq.true,reminder_90_days.eq.true,reminder_6_months.eq.true,reminder_1_year.eq.true"
      );

    if (error) {
      console.error("Error fetching documents:", error);
      if (cronRun?.id) {
        await supabase.from("cron_job_runs").update({
          status: "failed",
          completed_at: now.toISOString(),
          error_message: error.message,
        }).eq("id", cronRun.id);
      }
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const reminderIntervals = [
      { key: "reminder_30_days", days: 30, label: "30 days" },
      { key: "reminder_60_days", days: 60, label: "60 days" },
      { key: "reminder_90_days", days: 90, label: "90 days" },
      { key: "reminder_6_months", days: 182, label: "6 months" },
      { key: "reminder_1_year", days: 365, label: "1 year" },
    ];

    let remindersSent = 0;
    const sendEmailUrl = `${supabaseUrl}/functions/v1/send-email`;

    for (const doc of documents || []) {
      const expiryDate = new Date(doc.expiry_date);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const sentAt: Record<string, string> = doc.reminder_sent_at || {};

      for (const interval of reminderIntervals) {
        if (!doc[interval.key]) continue;
        if (sentAt[interval.key]) continue;
        if (daysUntilExpiry > interval.days) continue;

        // Get user email
        const { data: userData } = await supabase.auth.admin.getUserById(doc.user_id);
        const userEmail = userData?.user?.email;
        const displayName = (doc as any).profiles?.display_name || "there";

        const emailHtml = `
          <h2>Document Expiry Reminder</h2>
          <p>Hi ${displayName},</p>
          <p>Your document <strong>${doc.title}</strong> expires in <strong>${interval.label}</strong> (${doc.expiry_date}).</p>
          <p>Please review and renew this document before it expires.</p>
          <p>— LegacyBuilder</p>
        `;

        if (userEmail) {
          // Send via send-email wrapper
          try {
            await fetch(sendEmailUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                to: userEmail,
                subject: `Document Expiry Reminder: ${doc.title} expires in ${interval.label}`,
                html: emailHtml,
              }),
            });
          } catch (e) {
            console.warn("Failed to send email via wrapper:", e);
          }
          remindersSent++;
        }

        // Send to notify_email too
        if (doc.notify_email && doc.notify_email !== userEmail) {
          try {
            await fetch(sendEmailUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${supabaseServiceKey}`,
              },
              body: JSON.stringify({
                to: doc.notify_email,
                subject: `Document Expiry Reminder: ${doc.title} expires in ${interval.label}`,
                html: emailHtml,
              }),
            });
          } catch (e) {
            console.warn("Failed to send notify email:", e);
          }
          remindersSent++;
        }

        sentAt[interval.key] = now.toISOString();
      }

      // Update reminder_sent_at if changed
      if (Object.keys(sentAt).length > Object.keys(doc.reminder_sent_at || {}).length) {
        await supabase
          .from("life_file_documents")
          .update({ reminder_sent_at: sentAt })
          .eq("id", doc.id);
      }
    }

    const result = {
      success: true,
      documentsChecked: documents?.length || 0,
      remindersSent,
    };

    // Update cron run
    if (cronRun?.id) {
      await supabase.from("cron_job_runs").update({
        status: "completed",
        completed_at: new Date().toISOString(),
        result,
      }).eq("id", cronRun.id);
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    if (cronRun?.id) {
      await supabase.from("cron_job_runs").update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: err instanceof Error ? err.message : "Unknown error",
      }).eq("id", cronRun.id);
    }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
