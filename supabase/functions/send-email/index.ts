import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const body: SendEmailRequest = await req.json();

    // Validate input
    if (!body.to || !body.subject || !body.html) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enqueue email via pgmq → process-email-queue worker (cron) sends it
    let success = false;
    let errorMessage: string | null = null;
    const messageId = crypto.randomUUID();

    const { error: enqueueError } = await supabase.rpc("enqueue_email", {
      queue_name: "transactional_emails",
      payload: {
        message_id: messageId,
        idempotency_key: messageId,
        to: body.to,
        subject: body.subject,
        html: body.html,
        replyTo: body.replyTo ?? null,
        label: "transactional",
        purpose: "transactional",
        queued_at: new Date().toISOString(),
      },
    });

    if (enqueueError) {
      errorMessage = enqueueError.message;
      console.error("Enqueue failed:", errorMessage);
    } else {
      success = true;
    }

    // Trigger the worker once so the email goes out within seconds
    // (instead of waiting up to 1 min for the cron tick)
    if (success) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/process-email-queue`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${supabaseServiceKey}`,
          },
          body: "{}",
        });
      } catch (kickErr) {
        // Worker kick is best-effort; cron will pick it up
        console.warn("Worker kick failed (cron will retry):", kickErr);
      }
    }

    // Log to audit_log regardless of outcome
    await supabase.from("audit_log").insert({
      action: "email_sent",
      entity_type: "email",
      entity_id: body.to,
      metadata: {
        to: body.to,
        subject: body.subject,
        replyTo: body.replyTo || null,
        status: success ? "queued" : "failed",
        error: errorMessage,
        message_id: messageId,
        timestamp: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success,
        message_id: success ? messageId : undefined,
        error: success ? undefined : (errorMessage || "Failed to queue email"),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("send-email unexpected error:", err);

    // Still try to log
    try {
      await supabase.from("audit_log").insert({
        action: "email_sent",
        entity_type: "email",
        metadata: {
          status: "error",
          error: err instanceof Error ? err.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
      });
    } catch (_) { /* best effort */ }

    return new Response(
      JSON.stringify({ success: false, error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
