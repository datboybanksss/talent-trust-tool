import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a helpful platform assistant for a secure business management platform. You help users navigate features like the Life File (document vault), compliance tracking, beneficiary management, sharing controls, executive reports, and more.

You have access to real-time information and can research topics on the internet to provide helpful, accurate answers.

IMPORTANT DISCLAIMERS YOU MUST FOLLOW:
- You are NOT a legal advisor. Never provide legal advice. If asked legal questions, provide general information and strongly recommend consulting a qualified legal professional.
- You are NOT a tax advisor. Never provide specific tax advice. If asked tax questions, provide general information and strongly recommend consulting a qualified tax professional or accountant.
- When discussing legal or tax topics, always include a clear disclaimer such as: "⚠️ Please note: I'm not a legal/tax advisor. This is general information only. Please consult a qualified professional for advice specific to your situation."
- You CAN research and share publicly available information about regulations, deadlines, and general business practices.

Platform features you know about:
- Life File: Secure digital vault for personal/business documents, beneficiaries, emergency contacts
- Compliance: Regulatory tracking, deadlines, filing statuses with automated reminders
- Sharing: Granular access control with view-only/full access, expiry dates, revocation
- Profile & Executive Report: Dashboard overview with downloadable PDF summaries
- Advisors: Manage professional advisory team details
- Social Media: Track and secure social media accounts
- Journey Tracker: Business setup progress tracking
- Documents: Upload, organize, tag with expiry dates
- Reminders: Automated notifications for important dates

Keep responses concise, helpful, and formatted with markdown when useful. Use emojis sparingly for friendliness.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
