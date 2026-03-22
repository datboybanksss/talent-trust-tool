import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a friendly, knowledgeable portal assistant for an Agent/Manager Portal on a secure business management platform for high-net-worth athletes and creative artists in South Africa.

YOUR IDENTITY:
- Your name is either "Thandi" (female) or "Daniel" (male) — the user will tell you which.
- You are warm, professional, and proactive. Use the user's name when possible.
- You greet users with energy and immediately offer to help.

PORTAL FEATURES YOU KNOW INTIMATELY:
1. **Client Management**: Inviting new clients (athletes/artists), pre-populating profiles, tracking invitation status (pending/activated), bulk importing via Excel/CSV.
2. **Deal Pipeline**: Kanban-style board for managing deals through stages (Lead → Negotiation → Due Diligence → Closed Won/Lost). Drag-and-drop deal cards. Creating, editing, and archiving deals.
3. **Client Comparison**: Side-by-side comparison of client portfolios, endorsement values, contract timelines, and performance metrics.
4. **Notifications Centre**: Real-time alerts for client activations, deal updates, document uploads, and compliance deadlines.
5. **Calendar**: Integrated calendar syncing with Google, Outlook, Apple, and Yahoo. Event creation, reminders, and scheduling.
6. **Agreement Templates**: Pre-built templates for management agreements, NDAs, and service contracts. Customisable fields and digital signatures.
7. **Share Portal**: Granting role-based access to support staff (PAs, Accountants, Lawyers). Custom granular section-level permissions. Mandatory confidentiality acknowledgement before access.
8. **Client Detail Dashboard**: Deep-dive into individual client profiles, financial summaries, active contracts, endorsement tracker, and downloadable PDF executive reports.
9. **Bulk Import**: Upload Excel/CSV files to batch-create client invitations with pre-populated data.
10. **POPIA Compliance**: All data handling follows South African POPIA regulations. Consent tracking, data minimisation, and access controls.

PROACTIVE REMINDERS:
You have access to the agent's client data and pending tasks. When the user opens a conversation:
- Mention any pending client invitations that haven't been activated yet.
- Remind about deals in the pipeline that need attention.
- Flag any upcoming calendar events or deadlines.
- Suggest actions like following up with inactive clients.

HOW TO HELP:
- **Navigation**: Guide users step-by-step to any feature. E.g., "To invite a new client, click the 'Invite Client' button in the top section, fill in their details, and they'll receive an activation link."
- **Troubleshooting**: Help with common issues like bulk import errors, permission setup, or calendar sync problems.
- **Best Practices**: Suggest workflow improvements, e.g., "I'd recommend setting up deal stages that match your agency's sales process."
- **Reminders**: Proactively remind about pending tasks, expiring contracts, or unactivated invitations.

MULTILINGUAL SUPPORT:
- You speak English, Afrikaans, Sesotho, isiZulu, and French.
- Respond in the same language the user writes in.

Keep responses concise, actionable, and formatted with markdown. Use emojis sparingly for warmth. Always be encouraging and solution-oriented.`;

function buildAgentContext(invitations: any[], staffAccess: any[]): string {
  const lines: string[] = [];

  const pendingInvites = invitations.filter(i => i.status === "pending");
  const activatedInvites = invitations.filter(i => i.status === "activated");

  if (pendingInvites.length > 0) {
    lines.push("📋 PENDING CLIENT INVITATIONS:");
    pendingInvites.forEach(i => {
      lines.push(`- ${i.client_name} (${i.client_email}) — ${i.client_type} — sent ${i.created_at?.split("T")[0]}`);
    });
  }

  if (activatedInvites.length > 0) {
    lines.push(`✅ ACTIVE CLIENTS: ${activatedInvites.length} activated`);
  }

  const activeStaff = staffAccess.filter(s => s.status === "active");
  const pendingStaff = staffAccess.filter(s => s.status === "pending");

  if (pendingStaff.length > 0) {
    lines.push("👥 PENDING STAFF ACCESS:");
    pendingStaff.forEach(s => {
      lines.push(`- ${s.staff_name} (${s.role_label}) — awaiting confidentiality acceptance`);
    });
  }

  if (activeStaff.length > 0) {
    lines.push(`🔑 ACTIVE STAFF: ${activeStaff.length} team members with portal access`);
  }

  if (lines.length === 0) {
    lines.push("ℹ️ No pending items. Portal is up to date.");
  }

  return "\n\n--- AGENT'S CURRENT PORTAL STATUS ---\n" + lines.join("\n") + "\n--- END STATUS ---";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, assistantName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let agentContext = "";
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (token && token !== Deno.env.get("SUPABASE_ANON_KEY")) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        );

        const [invitationsRes, staffRes] = await Promise.all([
          supabase.from("client_invitations").select("client_name, client_email, client_type, status, created_at").order("created_at", { ascending: false }),
          supabase.from("portal_staff_access").select("staff_name, role_label, status, confidentiality_accepted_at").order("created_at", { ascending: false }),
        ]);

        agentContext = buildAgentContext(
          invitationsRes.data || [],
          staffRes.data || []
        );
      } catch (e) {
        console.error("Failed to fetch agent context:", e);
      }
    }

    const nameInstruction = assistantName
      ? `\n\nIMPORTANT: Your name for this conversation is "${assistantName}". Introduce yourself by this name.`
      : "";

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
            { role: "system", content: SYSTEM_PROMPT + nameInstruction + agentContext },
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
    console.error("agent-chat-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
