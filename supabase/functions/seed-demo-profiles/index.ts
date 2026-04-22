// Demo profile seeder — two-phase: preview (default) and execute (?confirm=true).
// Auth: requires x-admin-token header matching DEMO_SEED_ADMIN_TOKEN secret.
//
// Phase 1: returns audit + would-create names. No writes.
// Phase 2 (?confirm=true): creates 5 demo users, payloads, shares, meetings,
// PDFs, then runs RLS-equivalent verification queries and returns counts.

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { runAudit } from "./audit.ts";
import {
  DEMO_EMAILS, DEMO_PASSWORD, AGENT_SHARE_SECTIONS, AGENT_DOC_ALLOWLIST,
  SHARE_EXPIRES_AT, ATHLETE_DOCS, ARTIST_DOCS,
} from "./seed-data.ts";
import { makePlaceholderPdf } from "./pdf-helpers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body, null, 2), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const adminToken = Deno.env.get("DEMO_SEED_ADMIN_TOKEN");
  const salt = Deno.env.get("DEMO_SEED_NAME_SALT") ?? "default-2026-04";
  if (!adminToken) return json({ error: "DEMO_SEED_ADMIN_TOKEN not configured" }, 500);
  if (req.headers.get("x-admin-token") !== adminToken) return json({ error: "unauthorized" }, 401);

  const url = new URL(req.url);
  const confirm = url.searchParams.get("confirm") === "true";

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // ---- Phase 1: audit ----
  const audit = await runAudit(admin, salt);
  if (audit.email_conflicts.length > 0) {
    return json({
      phase: "halted_email_conflict",
      audit: { email_conflicts: audit.email_conflicts },
      message: "Demo emails already exist. Delete them or rotate emails before seeding.",
    }, 409);
  }

  if (!confirm) {
    return json({
      phase: "preview",
      audit: {
        email_conflicts: audit.email_conflicts,
        display_name_conflicts: audit.display_name_conflicts,
        rls_enabled_check: audit.rls_enabled_check,
        estate_path: audit.estate_path,
      },
      would_create: {
        athlete: {
          display_name: audit.names.athlete.display_name,
          email: DEMO_EMAILS.athlete, user_role: "user",
          client_type: "athlete", club: audit.names.athlete.club,
        },
        agent: {
          display_name: audit.names.agent.display_name,
          email: DEMO_EMAILS.agent, user_role: "user",
          client_type: "agent", agency: audit.names.agent.agency,
        },
        artist: {
          display_name: audit.names.artist.display_name,
          stage_name: audit.names.artist.stage_name,
          email: DEMO_EMAILS.artist, user_role: "user",
          client_type: "artist", label: audit.names.artist.label,
        },
        rugby: {
          display_name: audit.names.rugby.display_name,
          email: DEMO_EMAILS.rugby, user_role: "user",
          client_type: "athlete", club: audit.names.rugby.club,
        },
        sprinter: {
          display_name: audit.names.sprinter.display_name,
          email: DEMO_EMAILS.sprinter, user_role: "user", client_type: "athlete",
        },
      },
      next_step: "Review names. If any collide with real PSL/music/agency figures, set DEMO_SEED_NAME_SALT secret to a different value and re-run preview. To execute, repeat with ?confirm=true.",
      password_for_all_demo_accounts: DEMO_PASSWORD,
    });
  }

  // ---- Phase 2: execute ----
  const report: Record<string, unknown> = { phase: "execute", warnings: [] };
  const warnings = report.warnings as string[];

  // 1. Create auth users
  const userIds: Record<string, string> = {};
  for (const [key, email] of Object.entries(DEMO_EMAILS)) {
    const display_name = (audit.names as Record<string, { display_name: string }>)[key].display_name;
    const client_type = key === "agent" ? "agent" : key === "artist" ? "artist" : "athlete";
    const { data, error } = await admin.auth.admin.createUser({
      email, password: DEMO_PASSWORD, email_confirm: true,
      user_metadata: { display_name, client_type },
    });
    if (error || !data.user) {
      return json({ phase: "failed", step: "create_user", key, error: error?.message }, 500);
    }
    userIds[key] = data.user.id;
  }

  // 2. Update profiles: is_demo + display_name + client_type already set via trigger
  for (const [key, uid] of Object.entries(userIds)) {
    const client_type = key === "agent" ? "agent" : key === "artist" ? "artist" : "athlete";
    await admin.from("profiles").update({
      is_demo: true,
      display_name: (audit.names as Record<string, { display_name: string }>)[key].display_name,
      client_type,
    }).eq("user_id", uid);
  }

  // 3. user_roles (default 'user' enum)
  for (const uid of Object.values(userIds)) {
    await admin.from("user_roles").insert({ user_id: uid, role: "user" });
  }

  // 4. Athlete payload
  const athleteId = userIds.athlete;
  const agentId = userIds.agent;
  await admin.from("athlete_contracts").insert({
    user_id: athleteId, title: "Player Employment Contract",
    counterparty: audit.names.athlete.club, contract_type: "team",
    start_date: "2024-07-01", end_date: "2026-06-30",
    value: 4_800_000, currency: "ZAR", status: "active",
    notes: "DEMO. 24-month deal with image-rights clause.",
  });
  await admin.from("athlete_endorsements").insert([
    { user_id: athleteId, brand_name: "Velocity Sportswear (DEMO)", deal_type: "apparel", annual_value: 750000, currency: "ZAR", start_date: "2024-01-01", end_date: "2026-12-31", status: "active", deliverables: "4 social posts/quarter, 2 brand events/yr" },
    { user_id: athleteId, brand_name: "Nguni Energy Drinks (DEMO)", deal_type: "sponsorship", annual_value: 450000, currency: "ZAR", start_date: "2024-03-01", end_date: "2025-12-31", status: "active" },
    { user_id: athleteId, brand_name: "Highveld Bank (DEMO)", deal_type: "ambassador", annual_value: 600000, currency: "ZAR", start_date: "2024-06-01", end_date: "2026-05-31", status: "active" },
  ]);
  // Athlete income via artist_royalties (reused table)
  const athleteIncome = [
    { source_name: "Image Rights Pool 2024", source_type: "image_rights", amount: 320000, period_start: "2024-01-01", period_end: "2024-12-31" },
    { source_name: "Replica Jersey Royalties Q1", source_type: "merch_royalty", amount: 48500, period_start: "2025-01-01", period_end: "2025-03-31" },
    { source_name: "Replica Jersey Royalties Q2", source_type: "merch_royalty", amount: 52100, period_start: "2025-04-01", period_end: "2025-06-30" },
    { source_name: "Pre-season Friendly Appearance", source_type: "appearance_fee", amount: 75000, period_start: "2025-07-15", period_end: "2025-07-15" },
    { source_name: "Charity Match Appearance", source_type: "appearance_fee", amount: 45000, period_start: "2025-08-22", period_end: "2025-08-22" },
    { source_name: "Brand Event - Velocity", source_type: "appearance_fee", amount: 60000, period_start: "2025-09-10", period_end: "2025-09-10" },
    { source_name: "Image Rights Q1 2025", source_type: "image_rights", amount: 95000, period_start: "2025-01-01", period_end: "2025-03-31" },
    { source_name: "Image Rights Q2 2025", source_type: "image_rights", amount: 88000, period_start: "2025-04-01", period_end: "2025-06-30" },
    { source_name: "Boot Sponsorship Royalty", source_type: "merch_royalty", amount: 35000, period_start: "2025-01-01", period_end: "2025-06-30" },
    { source_name: "School Visit Appearance", source_type: "appearance_fee", amount: 25000, period_start: "2025-10-05", period_end: "2025-10-05" },
    { source_name: "Pre-season Image Rights 2026", source_type: "image_rights", amount: 110000, period_start: "2026-01-01", period_end: "2026-03-31" },
  ];
  await admin.from("artist_royalties").insert(athleteIncome.map((r) => ({ ...r, user_id: athleteId, currency: "ZAR" })));

  await admin.from("beneficiaries").insert([
    { user_id: athleteId, full_name: "Spouse Name (DEMO)", relationship: "spouse", allocation_percentage: 60 },
    { user_id: athleteId, full_name: "Child One (DEMO)", relationship: "child", allocation_percentage: 40 },
  ]);
  await admin.from("emergency_contacts").insert([
    { user_id: athleteId, full_name: "Club Physio (DEMO)", relationship: "medical", phone: "+27 11 555 0100", priority: 1 },
    { user_id: athleteId, full_name: "Family Next-of-Kin (DEMO)", relationship: "family", phone: "+27 82 555 0101", priority: 2 },
  ]);
  await admin.from("compliance_reminders").insert([
    { user_id: athleteId, title: "SARS Provisional Tax (Aug)", category: "tax", due_date: "2026-08-31T00:00:00Z", priority: "high" },
    { user_id: athleteId, title: "Image Rights Renewal Review", category: "contract", due_date: "2026-05-01T00:00:00Z", priority: "medium" },
  ]);

  // 5. Artist payload — projects with metadata, royalties, beneficiary
  const artistId = userIds.artist;
  await admin.from("artist_projects").insert([
    { user_id: artistId, title: "Album: Echoes (3-album deal)", project_type: "recording", status: "completed", release_date: "2024-09-15", metadata: { label: audit.names.artist.label, advance: 350000, royalty_split: { artist: 18, label: 82 } } },
    { user_id: artistId, title: "Publishing Admin Deal", project_type: "publishing", status: "active", start_date: "2024-01-01", metadata: { admin_split: { writer: 80, publisher: 20 }, term_years: 5 } },
    { user_id: artistId, title: "Sync: Heritage Brand Campaign", project_type: "sync", status: "completed", release_date: "2025-06-10", metadata: { client: "DEMO Brand", territory: "RSA", term_months: 12, fee: 180000 } },
    { user_id: artistId, title: "Tour: Coastal Cities 2025 (4 shows)", project_type: "live", status: "completed", start_date: "2025-03-01", release_date: "2025-03-22", metadata: { shows: 4, gross_revenue: 620000 } },
    { user_id: artistId, title: "Tour: Highveld Run 2025 (3 shows)", project_type: "live", status: "completed", start_date: "2025-07-10", release_date: "2025-07-20", metadata: {
      shows: 3, gross_revenue: 480000,
      expenses: [
        { category: "travel", description: "Flights & ground transport", amount: 65000, paid_to: "Travel Agent (DEMO)" },
        { category: "accommodation", description: "Hotels for 3 cities", amount: 48000, paid_to: "Hotel Group (DEMO)" },
        { category: "production", description: "Sound + lighting hire", amount: 92000, paid_to: "Stage Co (DEMO)" },
        { category: "crew", description: "Per diems & fees", amount: 78000, paid_to: "Crew (DEMO)" },
        { category: "venue", description: "Hall & promoter splits", amount: 56000, paid_to: "Promoter (DEMO)" },
      ],
    } },
  ]);

  // Artist royalties — 18 rows across streaming + sync + live
  const artistIncome = [
    ...["spotify", "apple", "youtube"].flatMap((p) =>
      [1, 2, 3, 4, 5, 6].map((m) => ({
        source_name: `Streaming - ${p} ${2025}-${String(m).padStart(2, "0")}`,
        source_type: `streaming_${p}`,
        amount: 12000 + Math.floor(Math.random() * 8000),
        period_start: `2025-${String(m).padStart(2, "0")}-01`,
        period_end: `2025-${String(m).padStart(2, "0")}-28`,
      }))
    ),
  ];
  await admin.from("artist_royalties").insert(artistIncome.map((r) => ({ ...r, user_id: artistId, currency: "ZAR" })));

  await admin.from("beneficiaries").insert([
    { user_id: artistId, full_name: "Mother (DEMO)", relationship: "parent", allocation_percentage: 100 },
  ]);
  await admin.from("compliance_reminders").insert([
    { user_id: artistId, title: "ITR12 Filing", category: "tax", due_date: "2026-10-31T00:00:00Z", priority: "high" },
  ]);

  // 6. Rugby + sprinter minimal payloads
  const rugbyId = userIds.rugby;
  const sprinterId = userIds.sprinter;
  await admin.from("athlete_contracts").insert([
    { user_id: rugbyId, title: "Player Contract", counterparty: audit.names.rugby.club, contract_type: "team", start_date: "2024-04-01", end_date: "2026-03-31", value: 2_400_000, currency: "ZAR", status: "active" },
    { user_id: sprinterId, title: "Athletics SA Funding Agreement", counterparty: "Athletics SA (DEMO)", contract_type: "federation", start_date: "2024-01-01", end_date: "2026-12-31", value: 480_000, currency: "ZAR", status: "active" },
  ]);
  await admin.from("athlete_endorsements").insert([
    { user_id: rugbyId, brand_name: "Boot Co (DEMO)", deal_type: "equipment", annual_value: 180000, currency: "ZAR", start_date: "2025-01-01", end_date: "2026-12-31", status: "active" },
    { user_id: sprinterId, brand_name: "Performance Apparel (DEMO)", deal_type: "apparel", annual_value: 120000, currency: "ZAR", start_date: "2025-01-01", end_date: "2026-12-31", status: "active" },
  ]);
  await admin.from("artist_royalties").insert([
    { user_id: rugbyId, source_name: "Image Rights 2025", source_type: "image_rights", amount: 60000, period_start: "2025-01-01", period_end: "2025-12-31", currency: "ZAR" },
    { user_id: sprinterId, source_name: "Appearance - School Tour", source_type: "appearance_fee", amount: 18000, period_start: "2025-05-12", period_end: "2025-05-12", currency: "ZAR" },
  ]);

  // 7. life_file_shares (athlete, rugby, sprinter -> agent). NO artist share.
  await admin.from("life_file_shares").insert([
    { owner_id: athleteId, shared_with_email: DEMO_EMAILS.agent, shared_with_user_id: agentId, relationship: "agent", sections: AGENT_SHARE_SECTIONS, document_type_allowlist: AGENT_DOC_ALLOWLIST, status: "accepted", accepted_at: new Date().toISOString(), expires_at: SHARE_EXPIRES_AT, access_level: "view" },
    { owner_id: rugbyId, shared_with_email: DEMO_EMAILS.agent, shared_with_user_id: agentId, relationship: "agent", sections: AGENT_SHARE_SECTIONS, document_type_allowlist: AGENT_DOC_ALLOWLIST, status: "accepted", accepted_at: new Date().toISOString(), expires_at: SHARE_EXPIRES_AT, access_level: "view" },
    { owner_id: sprinterId, shared_with_email: DEMO_EMAILS.agent, shared_with_user_id: agentId, relationship: "agent", sections: AGENT_SHARE_SECTIONS, document_type_allowlist: AGENT_DOC_ALLOWLIST, status: "accepted", accepted_at: new Date().toISOString(), expires_at: SHARE_EXPIRES_AT, access_level: "view" },
  ]);

  // 8. shared_meetings
  const now = Date.now();
  const inDays = (n: number) => new Date(now + n * 86400000).toISOString();
  const sharedMeetings = [
    { title: "Quarterly Contract Review", starts_at: inDays(7), ends_at: inDays(7), meeting_type: "review", attendee_user_ids: [athleteId, agentId], created_by: agentId, notes: "DEMO" },
    { title: "Endorsement Negotiation Prep", starts_at: inDays(14), ends_at: inDays(14), meeting_type: "strategy", attendee_user_ids: [athleteId, agentId], created_by: agentId },
    { title: "Rugby - Pre-season Check-in", starts_at: inDays(10), ends_at: inDays(10), meeting_type: "review", attendee_user_ids: [rugbyId, agentId], created_by: agentId },
    { title: "Sprinter - Funding Renewal", starts_at: inDays(21), ends_at: inDays(21), meeting_type: "strategy", attendee_user_ids: [sprinterId, agentId], created_by: agentId },
    { title: "Agent Internal: Q3 Pipeline", starts_at: inDays(3), ends_at: inDays(3), meeting_type: "internal", attendee_user_ids: [agentId], created_by: agentId },
    { title: "Agent Internal: Compliance Review", starts_at: inDays(5), ends_at: inDays(5), meeting_type: "internal", attendee_user_ids: [agentId], created_by: agentId },
    { title: "Agent Internal: New Client Outreach", starts_at: inDays(12), ends_at: inDays(12), meeting_type: "internal", attendee_user_ids: [agentId], created_by: agentId },
  ];
  await admin.from("shared_meetings").insert(sharedMeetings);

  // 8b. Agent roster: client_invitations + agent_deals (powers Executive Overview, Compare).
  // NOTE: client_invitations.client_type and agent_deals.client_type only allow 'athlete'|'artist'.
  const daysAgo = (n: number) => new Date(now - n * 86400000).toISOString();
  const dateAgo = (n: number) => new Date(now - n * 86400000).toISOString().slice(0, 10);
  const dateAhead = (n: number) => new Date(now + n * 86400000).toISOString().slice(0, 10);
  const roster = [
    { name: "Thabo Mokoena", email: "thabo.mokoena.demo@example.com", type: "athlete", status: "activated", meta: { sport: "Football", province: "Gauteng", gender: "male", age_band: "25-34", industry: "Sports" }, ageDays: 450 },
    { name: "Lindiwe Dube", email: "lindiwe.dube.demo@example.com", type: "athlete", status: "activated", meta: { sport: "Athletics", province: "Western Cape", gender: "female", age_band: "18-24", industry: "Sports", para_athlete: "true" }, ageDays: 380 },
    { name: "Sipho Nkosi", email: "sipho.nkosi.demo@example.com", type: "athlete", status: "activated", meta: { sport: "Rugby", province: "KwaZulu-Natal", gender: "male", age_band: "25-34", industry: "Sports" }, ageDays: 300 },
    { name: "Naledi Mthembu", email: "naledi.mthembu.demo@example.com", type: "artist", status: "activated", meta: { genre: "Amapiano", province: "Gauteng", gender: "female", age_band: "25-34", industry: "Music" }, ageDays: 220 },
    { name: "Kabelo Molefe", email: "kabelo.molefe.demo@example.com", type: "artist", status: "activated", meta: { genre: "Afro-pop", province: "Free State", gender: "male", age_band: "18-24", industry: "Music" }, ageDays: 180 },
    { name: "Palesa Sithole", email: "palesa.sithole.demo@example.com", type: "artist", status: "activated", meta: { genre: "Spoken Word", province: "Gauteng", gender: "female", age_band: "35-44", industry: "Music" }, ageDays: 140 },
    { name: "Andile Maseko", email: "andile.maseko.demo@example.com", type: "athlete", status: "pending", meta: { sport: "Cricket", province: "Western Cape", gender: "male", age_band: "25-34", industry: "Sports" }, ageDays: 90 },
    { name: "Asanda Dlamini", email: "asanda.dlamini.demo@example.com", type: "artist", status: "pending", meta: { genre: "Hip-hop", province: "Gauteng", gender: "female", age_band: "18-24", industry: "Music" }, ageDays: 45 },
    { name: "Lwazi Nkomo", email: "lwazi.nkomo.demo@example.com", type: "athlete", status: "expired", meta: { sport: "Football", province: "Eastern Cape", gender: "male", age_band: "25-34", industry: "Sports" }, ageDays: 500, archivedDays: 60 },
  ];
  await admin.from("client_invitations").insert(roster.map((r) => ({
    agent_id: agentId, client_email: r.email, client_name: r.name, client_phone: "+27 82 555 0200",
    client_type: r.type, status: r.status, pre_populated_data: r.meta,
    created_at: daysAgo(r.ageDays),
    activated_at: r.status === "pending" ? null : daysAgo(r.ageDays - 10),
    archived_at: r.archivedDays ? daysAgo(r.archivedDays) : null,
  })));
  const dealRows = [
    ["Thabo Mokoena", "athlete", "Velocity Sportswear (DEMO)", "Endorsement", "active", 850000, "R850K", 420, 280],
    ["Thabo Mokoena", "athlete", "Highveld Bank (DEMO)", "Sponsorship", "active", 1200000, "R1.2M", 300, 420],
    ["Thabo Mokoena", "athlete", "Nguni Energy (DEMO)", "Endorsement", "closed_won", 450000, "R450K", 540, -180],
    ["Lindiwe Dube", "athlete", "Performance Apparel (DEMO)", "Endorsement", "active", 380000, "R380K", 240, 480],
    ["Lindiwe Dube", "athlete", "Mzansi Health (DEMO)", "Sponsorship", "negotiating", 220000, "R220K", 30, 365],
    ["Sipho Nkosi", "athlete", "Karoo Outdoor (DEMO)", "Endorsement", "active", 620000, "R620K", 180, 540],
    ["Sipho Nkosi", "athlete", "Cape Beverages (DEMO)", "Appearance", "closed_won", 95000, "R95K", 90, -60],
    ["Naledi Mthembu", "artist", "Indaba House (DEMO)", "Recording", "active", 750000, "R750K", 200, 530],
    ["Naledi Mthembu", "artist", "Heritage Brand (DEMO)", "Sync", "closed_won", 180000, "R180K", 150, -30],
    ["Kabelo Molefe", "artist", "Mzansi Soundwave (DEMO)", "Recording", "active", 320000, "R320K", 120, 600],
    ["Kabelo Molefe", "artist", "Drakensberg Festival (DEMO)", "Live", "closed_won", 145000, "R145K", 75, -60],
    ["Palesa Sithole", "artist", "Apex Capital (DEMO)", "Advisory", "active", 950000, "R950K", 100, 265],
    ["Andile Maseko", "athlete", "Continental Cricket (DEMO)", "Sponsorship", "active", 480000, "R480K", 60, 305],
    ["Asanda Dlamini", "artist", "Vista Music (DEMO)", "Publishing", "negotiating", 280000, "R280K", 20, 720],
    ["Asanda Dlamini", "artist", "Highveld Audio (DEMO)", "Sync", "closed_won", 75000, "R75K", 10, -5],
  ] as const;
  await admin.from("agent_deals").insert(dealRows.map((d) => ({
    agent_id: agentId, client_name: d[0], client_type: d[1], brand: d[2], deal_type: d[3], status: d[4],
    value_amount: d[5], value_text: d[6], currency: "ZAR",
    start_date: dateAgo(d[7] as number), end_date: (d[8] as number) >= 0 ? dateAhead(d[8] as number) : dateAgo(-(d[8] as number)),
    notes: "DEMO seeded deal",
  })));

  // 8c. life_file_assets for athlete/artist/rugby/sprinter (powers Asset Registry, Estate Snapshot).
  await admin.from("life_file_assets").insert([
    { user_id: athleteId, asset_category: "retirement", asset_type: "Retirement Annuity", institution: "Allan Gray (DEMO)", amount: 1850000, currency: "ZAR", premium_or_contribution: 8500, premium_frequency: "monthly", beneficiary_names: "Spouse, Child One", beneficiary_allocation: "60/40", status: "active", notes: "DEMO" },
    { user_id: athleteId, asset_category: "insurance", asset_type: "Life Cover", institution: "Discovery Life (DEMO)", amount: 10000000, currency: "ZAR", premium_or_contribution: 4200, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: athleteId, asset_category: "investment", asset_type: "TFSA", institution: "Easy Equities (DEMO)", amount: 320000, currency: "ZAR", premium_or_contribution: 3000, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: athleteId, asset_category: "property", asset_type: "Primary Residence", institution: "Standard Bank (DEMO)", amount: 5800000, currency: "ZAR", premium_or_contribution: 38000, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: athleteId, asset_category: "vehicle", asset_type: "Vehicle", institution: "Wesbank (DEMO)", amount: 950000, currency: "ZAR", premium_or_contribution: 14500, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: athleteId, asset_category: "savings", asset_type: "Emergency Fund", institution: "FNB (DEMO)", amount: 480000, currency: "ZAR", status: "active", notes: "DEMO" },
    { user_id: artistId, asset_category: "retirement", asset_type: "Retirement Annuity", institution: "Sygnia (DEMO)", amount: 420000, currency: "ZAR", premium_or_contribution: 4500, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: artistId, asset_category: "insurance", asset_type: "Life Cover", institution: "Old Mutual (DEMO)", amount: 5000000, currency: "ZAR", premium_or_contribution: 2100, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: artistId, asset_category: "investment", asset_type: "Unit Trust", institution: "Coronation (DEMO)", amount: 680000, currency: "ZAR", premium_or_contribution: 5000, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: artistId, asset_category: "savings", asset_type: "Tour Income Reserve", institution: "Investec (DEMO)", amount: 920000, currency: "ZAR", status: "active", notes: "DEMO" },
    { user_id: rugbyId, asset_category: "retirement", asset_type: "Provident Fund", institution: "Alexander Forbes (DEMO)", amount: 780000, currency: "ZAR", premium_or_contribution: 12000, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: rugbyId, asset_category: "insurance", asset_type: "Life + Disability", institution: "Sanlam (DEMO)", amount: 8000000, currency: "ZAR", premium_or_contribution: 3800, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: rugbyId, asset_category: "investment", asset_type: "TFSA", institution: "Easy Equities (DEMO)", amount: 220000, currency: "ZAR", premium_or_contribution: 3000, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: rugbyId, asset_category: "property", asset_type: "Investment Property", institution: "Nedbank (DEMO)", amount: 3200000, currency: "ZAR", premium_or_contribution: 22000, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: rugbyId, asset_category: "vehicle", asset_type: "Vehicle", institution: "Wesbank (DEMO)", amount: 620000, currency: "ZAR", premium_or_contribution: 9500, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: sprinterId, asset_category: "retirement", asset_type: "Retirement Annuity", institution: "Sygnia (DEMO)", amount: 180000, currency: "ZAR", premium_or_contribution: 2500, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: sprinterId, asset_category: "insurance", asset_type: "Life Cover", institution: "Discovery (DEMO)", amount: 3000000, currency: "ZAR", premium_or_contribution: 1400, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: sprinterId, asset_category: "investment", asset_type: "TFSA", institution: "Easy Equities (DEMO)", amount: 95000, currency: "ZAR", premium_or_contribution: 2000, premium_frequency: "monthly", status: "active", notes: "DEMO" },
    { user_id: sprinterId, asset_category: "savings", asset_type: "Funding Reserve", institution: "Capitec (DEMO)", amount: 145000, currency: "ZAR", status: "active", notes: "DEMO" },
  ]);

  // 8d. social_media_accounts for the artist
  await admin.from("social_media_accounts").insert([
    { user_id: artistId, platform: "instagram", handle: "@refilwe.demo", follower_count: 185000, verified: true, account_status: "active", notes: "DEMO" },
    { user_id: artistId, platform: "tiktok", handle: "@refilwe.demo", follower_count: 240000, verified: false, account_status: "active", notes: "DEMO" },
  ]);

  // 9. Generate PDFs + insert life_file_documents
  const docPlans: Array<{ owner: string; ownerName: string; docs: typeof ATHLETE_DOCS }> = [
    { owner: athleteId, ownerName: audit.names.athlete.display_name, docs: ATHLETE_DOCS },
    { owner: artistId, ownerName: audit.names.artist.display_name, docs: ARTIST_DOCS },
  ];
  for (const plan of docPlans) {
    for (const d of plan.docs) {
      const pdf = await makePlaceholderPdf(d.title, plan.ownerName);
      const path = `${plan.owner}/${crypto.randomUUID()}.pdf`;
      const up = await admin.storage.from("life-file-documents").upload(path, pdf, { contentType: "application/pdf", upsert: false });
      if (up.error) { warnings.push(`upload failed for ${d.title}: ${up.error.message}`); continue; }
      await admin.from("life_file_documents").insert({
        user_id: plan.owner, document_type: d.document_type, title: d.title,
        file_url: path, file_name: `${d.title}.pdf`, status: "complete",
      });
    }
  }

  // 10. Verification — service-role queries that mirror the RLS predicates
  const v = await runVerification(admin, { athleteId, agentId, artistId });
  const verification = {
    ...v,
    agent_share_sections: AGENT_SHARE_SECTIONS,
    agent_share_document_type_allowlist: AGENT_DOC_ALLOWLIST,
  };
  const failed = verification.agent_can_see_athlete_contracts === 0
    || verification.agent_can_see_athlete_endorsements === 0
    || verification.agent_can_see_athlete_royalties === 0
    || verification.agent_can_see_athlete_contract_docs === 0
    || verification.agent_can_see_athlete_tax_docs === 0
    || verification.agent_can_see_athlete_identity_docs !== 0
    || verification.agent_can_see_athlete_medical_docs !== 0
    || verification.agent_can_see_athlete_beneficiaries !== 0
    || verification.agent_can_see_artist_anything !== 0
    || verification.shared_meeting_visible_to_both !== true;

  return json({
    ...report,
    task_status: failed ? "failed" : "ok",
    user_ids: userIds,
    names: audit.names,
    verification,
    credentials: { password: DEMO_PASSWORD, emails: DEMO_EMAILS },
  });
});

// Mirrors the RLS predicates by joining to life_file_shares with the agent's id.
async function runVerification(
  admin: SupabaseClient,
  ids: { athleteId: string; agentId: string; artistId: string },
) {
  const { athleteId, agentId, artistId } = ids;

  // Agent's accepted share row to the athlete (fetch sections + allowlist)
  const { data: shareRows } = await admin.from("life_file_shares")
    .select("sections, document_type_allowlist, expires_at, status")
    .eq("owner_id", athleteId).eq("shared_with_user_id", agentId).eq("status", "accepted");
  const share = shareRows?.[0];
  const shareValid = !!share && (!share.expires_at || new Date(share.expires_at) > new Date());

  const sectionAllows = (s: string) => shareValid && (share!.sections as string[]).includes(s);

  // Counts (service role bypasses RLS, so we apply the predicate manually)
  const count = async (table: string, ownerId: string) => {
    const { count } = await admin.from(table).select("*", { count: "exact", head: true }).eq("user_id", ownerId);
    return count ?? 0;
  };

  const agent_can_see_athlete_contracts = sectionAllows("contracts") ? await count("athlete_contracts", athleteId) : 0;
  const agent_can_see_athlete_endorsements = sectionAllows("endorsements") ? await count("athlete_endorsements", athleteId) : 0;
  const agent_can_see_athlete_royalties = sectionAllows("royalties") ? await count("artist_royalties", athleteId) : 0;
  const agent_can_see_athlete_beneficiaries = sectionAllows("beneficiaries") ? await count("beneficiaries", athleteId) : 0;

  // Document allowlist enforcement
  const allowlist = (share?.document_type_allowlist ?? null) as string[] | null;
  const docCount = async (type: string) => {
    const { count } = await admin.from("life_file_documents").select("*", { count: "exact", head: true })
      .eq("user_id", athleteId).eq("document_type", type);
    return count ?? 0;
  };
  const docVisible = (type: string) => sectionAllows("documents") && (allowlist === null || allowlist.includes(type));
  const agent_can_see_athlete_contract_docs = docVisible("contract") ? await docCount("contract") : 0;
  const agent_can_see_athlete_tax_docs = docVisible("tax") ? await docCount("tax") : 0;
  const agent_can_see_athlete_identity_docs = docVisible("identity") ? await docCount("identity") : 0;
  const agent_can_see_athlete_medical_docs = docVisible("medical") ? await docCount("medical") : 0;

  // Artist not shared at all
  const { data: artistShareRows } = await admin.from("life_file_shares")
    .select("id").eq("owner_id", artistId).eq("shared_with_user_id", agentId).eq("status", "accepted");
  const agent_can_see_artist_anything = (artistShareRows?.length ?? 0);

  // Shared meeting visible to both (creator + attendee)
  const { count: sharedMeetingCount } = await admin.from("shared_meetings")
    .select("*", { count: "exact", head: true })
    .contains("attendee_user_ids", [athleteId])
    .contains("attendee_user_ids", [agentId]);
  const shared_meeting_visible_to_both = (sharedMeetingCount ?? 0) > 0;

  return {
    agent_can_see_athlete_contracts,
    agent_can_see_athlete_endorsements,
    agent_can_see_athlete_royalties,
    agent_can_see_athlete_contract_docs,
    agent_can_see_athlete_tax_docs,
    agent_can_see_athlete_identity_docs,
    agent_can_see_athlete_medical_docs,
    agent_can_see_athlete_beneficiaries,
    agent_can_see_artist_anything,
    shared_meeting_visible_to_both,
  };
}
