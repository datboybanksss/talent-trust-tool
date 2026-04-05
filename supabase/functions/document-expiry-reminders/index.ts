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

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();

    // Fetch all non-expired documents with expiry dates and at least one reminder enabled
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

    for (const doc of documents || []) {
      const expiryDate = new Date(doc.expiry_date);
      const daysUntilExpiry = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      const sentAt: Record<string, string> = doc.reminder_sent_at || {};

      for (const interval of reminderIntervals) {
        if (!doc[interval.key]) continue;
        if (sentAt[interval.key]) continue; // Already sent
        if (daysUntilExpiry > interval.days) continue; // Not yet time

        // Time to send this reminder
        // Get user email from auth
        const { data: userData } = await supabase.auth.admin.getUserById(
          doc.user_id
        );
        const userEmail = userData?.user?.email;

        if (userEmail) {
          // Log the reminder notification
          await supabase.from("email_notifications").insert({
            user_id: doc.user_id,
            recipient_email: userEmail,
            subject: `Document Expiry Reminder: ${doc.title} expires in ${interval.label}`,
            status: "sent",
            sent_at: now.toISOString(),
          });
          remindersSent++;
        }

        // Send to notify_email too
        if (doc.notify_email) {
          await supabase.from("email_notifications").insert({
            user_id: doc.user_id,
            recipient_email: doc.notify_email,
            subject: `Document Expiry Reminder: ${doc.title} expires in ${interval.label}`,
            status: "sent",
            sent_at: now.toISOString(),
          });
          remindersSent++;
        }

        // Mark this reminder as sent
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

    return new Response(
      JSON.stringify({
        success: true,
        documentsChecked: documents?.length || 0,
        remindersSent,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
