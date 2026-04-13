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

    // Attempt to send email
    let success = false;
    let errorMessage: string | null = null;

    try {
      // Try Lovable Cloud's native email sending
      const emailResponse = await fetch(`${supabaseUrl}/functions/v1/process-email-queue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({
          to: body.to,
          subject: body.subject,
          html: body.html,
          replyTo: body.replyTo,
        }),
      });

      if (emailResponse.ok) {
        success = true;
      } else {
        const errText = await emailResponse.text();
        errorMessage = `Email service responded with ${emailResponse.status}: ${errText}`;
        console.warn("Email send failed (domain may not be configured yet):", errorMessage);
      }
    } catch (sendErr) {
      errorMessage = sendErr instanceof Error ? sendErr.message : "Unknown send error";
      console.warn("Email send error (domain may not be configured yet):", errorMessage);
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
        status: success ? "sent" : "failed",
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
    });

    return new Response(
      JSON.stringify({
        success,
        error: success ? undefined : (errorMessage || "Email domain not configured"),
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
