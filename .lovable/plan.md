

## Restore demo data + keep demo accounts in sync going forward

### Goal
Make the 5 seeded demo accounts feel "lived-in" again so they're presentation-ready, and lock in a rule that any future feature/logic/UI change ships with matching demo content.

### Part 1 — Repopulate the 5 demo accounts

Extend `supabase/functions/seed-demo-profiles` to insert realistic transactional data for each demo user, on top of the auth + Life File scaffolding it already creates. All inserts use `service_role` and are scoped by `user_id` / `agent_id`.

**Per-account seed plan:**

| Demo account | What gets seeded |
|---|---|
| `agent.demo@…` (Agent) | 8–10 `client_invitations` (mix of athlete/artist/executive, varied `engagement_type` in `pre_populated_data`, mostly `active`, 1 `archived`); 12–18 `agent_deals` across those clients (mix of statuses: `prospecting`, `negotiating`, `active`, `completed`; spread `start_date` over the last 18 months for revenue trendlines); 4–6 `shared_meetings` (past + upcoming); 3 `compliance_reminders` |
| `athlete.demo@…` | 4 `athlete_contracts`, 3 `athlete_endorsements`, 6 `life_file_assets` (RA, life cover, TFSA, property, vehicle, emergency fund), 3 `beneficiaries`, 2 `emergency_contacts`, 4 `compliance_reminders` |
| `artist.demo@…` | 3 `artist_projects`, 6 `artist_royalties` (last 6 months), 2 `social_media_accounts`, 4 `life_file_assets`, 2 `beneficiaries`, 2 `emergency_contacts` |
| `rugby.demo@…` | 3 `athlete_contracts`, 2 `athlete_endorsements`, 5 `life_file_assets`, 2 `beneficiaries`, 2 `emergency_contacts` |
| `sprinter.demo@…` | 2 `athlete_contracts`, 4 `athlete_endorsements` (kit/nutrition/eyewear/watches), 4 `life_file_assets`, 2 `beneficiaries`, 1 `emergency_contact` |

**Idempotency**: Before each insert block, `DELETE … WHERE user_id = <demo_user_id>` on that table so re-running the seeder always produces the same dataset (no duplicate rows on repeat runs). Demo guard already in place via `is_demo` + `delete_agent_account` RPC.

**Realism**: 
- All ZAR amounts in believable bands (deals R75k–R1.2M; assets R150k–R8M).
- Names/brands stay fictional per existing `DEMO_SEED_NAME_SALT` rule.
- Date spread anchored to "today minus N days" so KPIs always show recent activity regardless of when the seeder runs.

**Files touched**:
- Modify: `supabase/functions/seed-demo-profiles/index.ts` (orchestrator)
- Modify: `supabase/functions/seed-demo-profiles/seed-data.ts` (add deal/invitation/asset/contract/royalty constants)
- Possibly add: `supabase/functions/seed-demo-profiles/transactional-seed.ts` to keep it under the 50-line guideline

**Verification**:
- Re-run the seeder → log into `agent.demo@…` → Executive Overview KPIs, Book Value pie, Revenue Analytics bars, Demographics, Compare, and Calendar all render populated.
- Log into `athlete.demo@…` → Life File Summary, Asset Registry, Contracts all show data.
- Re-run seeder a second time → no duplicate rows; counts identical.

### Part 2 — Lock in the "demo accounts stay in sync" rule

Save a project memory rule so every future feature/UI/logic change automatically extends the seeder.

**New memory file**: `mem://features/demo-profiles-sync-rule`
> Whenever a new table, field, feature, or UI surface is added, also extend `seed-demo-profiles` with realistic demo content for the relevant accounts (agent.demo, athlete.demo, artist.demo, rugby.demo, sprinter.demo). Re-run the seeder after schema/data changes. These accounts are used for live sales demos — empty states are not acceptable on them.

**Update `mem://index.md` Core section** with a one-liner:
> Demo accounts (agent/athlete/artist/rugby/sprinter `.demo@themvpbuilder.co.za`) must always be populated — extend `seed-demo-profiles` whenever features change.

### Out of scope
- No schema changes (every table needed already exists).
- No changes to non-demo user data.
- No UI changes — this is purely backend seeding + a memory rule.
- Athlete profile mock purge (`AgentAthleteProfile.tsx`) is still pending; not bundled here.

