import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a helpful platform assistant for a secure business management platform designed for high-net-worth athletes and creative artists in South Africa. You help users navigate features like the Life File (document vault), compliance tracking, beneficiary management, sharing controls, executive reports, and more.

You have access to real-time information and can research topics on the internet to provide helpful, accurate answers.

PROACTIVE COMPLIANCE & EXPIRY AWARENESS:
You have access to the user's compliance reminders and document expiry dates. When the user opens a conversation or asks general questions:
- Proactively mention any OVERDUE compliance reminders or documents that have already expired.
- Warn about items due within the next 14 days.
- Provide actionable advice on how to address each item.
- Prioritise by urgency: overdue items first, then upcoming deadlines.
- If there are no urgent items, briefly reassure the user that their compliance status looks good.
- When discussing specific reminders or documents, reference them by name and date.

SPORTS & ENTERTAINMENT LAW EXPERTISE:
You are knowledgeable about general legal concepts relevant to athletes and creative artists, including but not limited to:
- **Contracts**: Endorsement deals, sponsorship agreements, management contracts, agency agreements, recording contracts, publishing deals, licensing agreements, performance contracts, image rights agreements, and merchandising deals.
- **Rights**: Intellectual property rights (copyright, trademarks, image rights, likeness rights), moral rights for artists, broadcasting rights, digital content rights, NFT and Web3 considerations, and residual/royalty entitlements.
- **Obligations**: Contractual obligations (exclusivity clauses, non-compete agreements, morality clauses, appearance obligations), tax obligations (including SARS compliance for international earnings), regulatory obligations with sporting bodies or arts councils, and anti-doping compliance for athletes.
- **Common Red Flags**: Perpetuity clauses, 360 deals, excessive commission rates, assignment of all IP without reversion, lack of audit rights, automatic renewal without opt-out, and vague "best efforts" language.
- **South African Context**: Labour Relations Act protections, Consumer Protection Act implications, BBBEE considerations, exchange control regulations for offshore earnings, and the role of bodies like SAMRO, CAPASSO, and various sporting federations.

When answering legal questions:
1. Provide thorough, well-researched general information about the topic.
2. Explain relevant legal concepts in plain, accessible language.
3. Highlight common pitfalls and red flags specific to athletes and artists.
4. Reference relevant South African legislation or regulations where applicable.
5. ALWAYS end legal responses with: "⚠️ **Disclaimer:** This is general legal information, not legal advice. Every situation is unique. Please consult a qualified attorney specialising in sports/entertainment law for advice specific to your circumstances."

MULTILINGUAL SUPPORT:
- You are fluent in English, Afrikaans, Sesotho, isiZulu, and French.
- If the user writes in any of these languages, respond in the SAME language they used.
- If the user explicitly asks you to switch to a specific language, comply and continue in that language until told otherwise.
- Maintain the same quality, accuracy, and helpfulness regardless of language.
- Legal disclaimers must also be provided in the language being used.

IMPORTANT DISCLAIMERS YOU MUST FOLLOW:
- You are NOT a licensed legal practitioner. Never claim to provide legal advice. Provide general legal information and strongly recommend consulting a qualified attorney.
- You are NOT a tax advisor. Never provide specific tax advice. Provide general information and strongly recommend consulting a qualified tax professional or accountant.
- You CAN research and share publicly available information about regulations, deadlines, contract norms, and general legal concepts in sports and entertainment.

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

function buildUserContext(reminders: any[], documents: any[]): string {
  const now = new Date();
  const lines: string[] = [];

  // Process compliance reminders
  const overdueReminders = reminders.filter(r => new Date(r.due_date) < now && r.status !== 'completed');
  const upcomingReminders = reminders.filter(r => {
    const due = new Date(r.due_date);
    const daysUntil = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntil >= 0 && daysUntil <= 14 && r.status !== 'completed';
  });

  // Process documents with expiry dates
  const expiredDocs = documents.filter(d => d.expiry_date && new Date(d.expiry_date) < now);
  const expiringDocs = documents.filter(d => {
    if (!d.expiry_date) return false;
    const exp = new Date(d.expiry_date);
    const daysUntil = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntil >= 0 && daysUntil <= 30;
  });

  if (overdueReminders.length > 0) {
    lines.push("🚨 OVERDUE COMPLIANCE REMINDERS:");
    overdueReminders.forEach(r => {
      lines.push(`- "${r.title}" (${r.category}) — was due ${r.due_date} [Priority: ${r.priority}]${r.description ? ` — ${r.description}` : ''}`);
    });
  }

  if (upcomingReminders.length > 0) {
    lines.push("⏰ UPCOMING COMPLIANCE DEADLINES (next 14 days):");
    upcomingReminders.forEach(r => {
      lines.push(`- "${r.title}" (${r.category}) — due ${r.due_date} [Priority: ${r.priority}]${r.description ? ` — ${r.description}` : ''}`);
    });
  }

  if (expiredDocs.length > 0) {
    lines.push("🚨 EXPIRED DOCUMENTS:");
    expiredDocs.forEach(d => {
      lines.push(`- "${d.title}" (${d.document_type}) — expired ${d.expiry_date}`);
    });
  }

  if (expiringDocs.length > 0) {
    lines.push("⚠️ DOCUMENTS EXPIRING SOON (next 30 days):");
    expiringDocs.forEach(d => {
      lines.push(`- "${d.title}" (${d.document_type}) — expires ${d.expiry_date}`);
    });
  }

  if (lines.length === 0) {
    lines.push("✅ No overdue or upcoming compliance items. The user's compliance status looks good.");
  }

  return "\n\n--- USER'S CURRENT COMPLIANCE & DOCUMENT STATUS ---\n" + lines.join("\n") + "\n--- END STATUS ---";
}

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

    // Try to get user context from their auth token
    let userContext = "";
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (token && token !== Deno.env.get("SUPABASE_ANON_KEY")) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        );

        const [remindersRes, documentsRes] = await Promise.all([
          supabase.from("compliance_reminders").select("title, category, due_date, priority, status, description").order("due_date", { ascending: true }),
          supabase.from("life_file_documents").select("title, document_type, expiry_date, status").not("expiry_date", "is", null).order("expiry_date", { ascending: true }),
        ]);

        userContext = buildUserContext(
          remindersRes.data || [],
          documentsRes.data || []
        );
      } catch (e) {
        console.error("Failed to fetch user context:", e);
      }
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
            { role: "system", content: SYSTEM_PROMPT + userContext },
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
