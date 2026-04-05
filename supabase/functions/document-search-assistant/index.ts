import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a document search assistant embedded inside a secure digital document vault called "My Important Documents". Your ONLY job is to help users find documents stored in their vault.

DOCUMENT VAULT STRUCTURE:
The vault has these main folders and sub-categories:
- Personal ID: Passport, Identity Document, Birth Certificate
- Marriage & Family: Marriage Certificate, Antenuptial Agreement, Divorce Decree, Maintenance Order
- Children: Child Birth Certificate, Child Passport, School Enrolment/Reports, Child Medical Records, Custody Agreement
- Academic & Qualifications: Degree/Diploma, Matric Certificate, Professional Certification, Training Certificate
- Finance: Banking, Credit/Loans, Investments, Stocks & Shares, Cryptocurrency, Pension/Retirement, Retirement Annuity, Life Insurance, Medical Aid, Short-Term Insurance, Disability/Income Protection
- Health & Medical: Medical Records, Prescriptions, Specialist Reports, Dental Records, Mental Health Records
- Housing & Property: Title Deed, Lease/Rental Agreement, Bond/Mortgage Statement, Rates & Utilities, Homeowners Insurance
- Vehicles: Registration, License Disc, Insurance, Finance Agreement, Driver's License
- Work & Employment: Employment Contract, Payslip, Appointment Letter, Work Permit/Visa, NDA, Reference Letter
- Contracts: Endorsement, Sponsorship, Team Contract, Agent Agreement, Image Rights, Recording, Publishing, Royalty, Distribution, Performance Contract
- Tax: Payslip (Tax), Tax Return/ITR12, IRP5/IT3(a), Tax Certificate, Tax Clearance, Medical Tax Certificate, RA Certificate, VAT Return, Company Tax Return, Provisional Tax, PAYE Return, Business Tax Clearance
- Company: CIPC Registration, Memorandum of Incorporation, Director Resolution, Financial Statements
- Compliance: FICA Documents, B-BBEE Certificate

HOW TO HELP:
1. When a user describes what they need (e.g., "I need my passport", "where's my tax stuff?", "find insurance documents"), match their description to the documents in their vault.
2. Always respond with the specific document name(s), folder location, and any relevant details like expiry dates or version numbers.
3. If multiple documents match, list them all and ask which one they need.
4. If no documents match, suggest which folder they should upload the document to.
5. You can also help users understand the folder structure and where to find specific types of documents.
6. Keep responses concise and helpful. Use markdown formatting for clarity.

MULTILINGUAL SUPPORT:
- Respond in the same language the user writes in (English, Afrikaans, Sesotho, isiZulu, French).

You have access to the user's actual document inventory below. Use it to give precise answers.`;

function buildDocumentContext(documents: any[]): string {
  if (!documents || documents.length === 0) {
    return "\n\n--- USER'S DOCUMENT INVENTORY ---\nNo documents found in the vault.\n--- END INVENTORY ---";
  }

  const lines: string[] = [];
  const byCategory: Record<string, any[]> = {};

  for (const doc of documents) {
    const cat = doc.document_type || "uncategorized";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(doc);
  }

  for (const [cat, docs] of Object.entries(byCategory)) {
    lines.push(`\n[${cat}]`);
    for (const d of docs) {
      const parts = [`"${d.title}"`];
      if (d.file_name) parts.push(`(file: ${d.file_name})`);
      if (d.expiry_date) parts.push(`expires: ${d.expiry_date}`);
      if (d.is_expired) parts.push("[EXPIRED]");
      if (d.version && d.version > 1) parts.push(`v${d.version}`);
      if (d.status) parts.push(`[${d.status}]`);
      lines.push(`  - ${parts.join(" ")}`);
    }
  }

  return "\n\n--- USER'S DOCUMENT INVENTORY ---" + lines.join("\n") + "\n--- END INVENTORY ---";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let docContext = "";
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");

    if (token && token !== Deno.env.get("SUPABASE_ANON_KEY")) {
      try {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: `Bearer ${token}` } } }
        );

        const { data } = await supabase
          .from("life_file_documents")
          .select("title, document_type, file_name, expiry_date, is_expired, version, status")
          .order("created_at", { ascending: false });

        docContext = buildDocumentContext(data || []);
      } catch (e) {
        console.error("Failed to fetch documents:", e);
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT + docContext },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("document-search-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
