
## Final execution plan — two-phase seed with name preview gate

### Phase 1: Audit + name preview (no writes)
`POST /seed-demo-profiles` (no `?confirm=true`)
- Validates `x-admin-token` header
- Conflict audit: queries `auth.users` for the 5 demo emails; queries `profiles.display_name` for collisions
- Generates 5 SA legal names + 1 artist stage name + fictional org names (club, agency, label) deterministically per-call
- Returns JSON and **stops** before any write:

```json
{
  "phase": "preview",
  "audit": {
    "email_conflicts": [],
    "display_name_conflicts": [],
    "rls_enabled_check": { "athlete_contracts": true, ... },
    "estate_path": "derivation_only (no user_onboarding/trust_wizard_state tables)"
  },
  "would_create": {
    "athlete":  { "display_name": "...", "email": "athlete.demo@themvpbuilder.co.za",  "user_role": "individual", "club":   "..." },
    "agent":    { "display_name": "...", "email": "agent.demo@themvpbuilder.co.za",    "user_role": "partner",    "agency": "..." },
    "artist":   { "display_name": "...", "stage_name": "...", "email": "artist.demo@themvpbuilder.co.za", "user_role": "individual", "label": "..." },
    "rugby":    { "display_name": "...", "email": "rugby.demo@themvpbuilder.co.za",    "user_role": "individual", "club":   "..." },
    "sprinter": { "display_name": "...", "email": "sprinter.demo@themvpbuilder.co.za", "user_role": "individual" }
  },
  "next_step": "Review names. If any collide with real PSL/music/agency figures you recognise, change DEMO_SEED_NAME_SALT secret to regenerate. To execute, repeat with ?confirm=true."
}
```

If email conflicts exist → halt with `phase: "halted_email_conflict"` and do not return names.

### Phase 2: Execute (only with `?confirm=true`)
`POST /seed-demo-profiles?confirm=true` runs the same audit, then:
1. Creates 5 auth users (`email_confirm: true`)
2. Sets `is_demo=true` on the 5 profiles, fills `display_name` + `client_type`
3. Inserts `user_roles` rows
4. Inserts athlete payload (1 contract, 3 endorsements, ~11 royalty rows for image_rights/merch/appearances, 8 documents, 2 beneficiaries, emergency contacts, compliance reminders)
5. Inserts artist payload (recording deal as `athlete_contracts`-style row stored in athlete_contracts? No — artist uses no athlete_contracts. **Artist contracts go in `artist_projects`** with `project_type='recording'` / `'publishing'` / `'sync'`, deal terms in `metadata` JSONB. 18 royalty rows across spotify/apple/youtube, 5 past-show projects + tour expense JSONB on most recent, 2 brand/sync rows, 7 documents, 1 beneficiary, compliance reminders)
6. Inserts rugby + sprinter minimal payloads
7. Inserts `life_file_shares` (athlete→agent, rugby→agent, sprinter→agent) with `sections=['contracts','endorsements','royalties','documents','meetings','contacts']`, `document_type_allowlist=['contract','tax']`, `status='accepted'`, `expires_at='2028-06-30'`. **No share for artist.**
8. Inserts `shared_meetings` rows (athlete↔agent meetings × 2, agent-only × 3, plus secondary-client meetings)
9. Generates placeholder PDFs with pdf-lib, uploads to `life-file-documents` bucket under `{user_id}/`, inserts `life_file_documents` rows
10. Runs verification queries via service-role client with explicit `WHERE` predicates that simulate RLS (filters by the agent's `auth.uid()` against the share table — same logic the RLS policy uses)
11. Returns full JSON report with the verification block specified

### Migration: `<ts>_seed_demo_setup.sql` (additive only)

```sql
-- 1. is_demo flag
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
COMMENT ON COLUMN profiles.is_demo IS 'TRUE for sales-demo seeded accounts. Filter is_demo=false in production reports.';

-- 2. shared_meetings + RLS
CREATE TABLE IF NOT EXISTS shared_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  meeting_type TEXT NOT NULL DEFAULT 'general',
  attendee_user_ids UUID[] NOT NULL DEFAULT '{}',
  created_by UUID NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE shared_meetings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Attendees and creator can view"   ON shared_meetings FOR SELECT TO authenticated USING (auth.uid() = created_by OR auth.uid() = ANY(attendee_user_ids));
CREATE POLICY "Creator can insert"                ON shared_meetings FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Creator can update"                ON shared_meetings FOR UPDATE TO authenticated USING (auth.uid() = created_by);
CREATE POLICY "Creator can delete"                ON shared_meetings FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- 3. metadata JSONB on artist_projects
ALTER TABLE artist_projects ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 4. dual-purpose income table comment
COMMENT ON TABLE artist_royalties IS 'TODO: rename to income_streams. Stores artist royalty AND athlete image rights/merch/appearance income.';

-- 5. document_type_allowlist on shares
ALTER TABLE life_file_shares ADD COLUMN IF NOT EXISTS document_type_allowlist TEXT[] DEFAULT NULL;
COMMENT ON COLUMN life_file_shares.document_type_allowlist IS 'When non-null, restricts shared document SELECT to rows where document_type = ANY(allowlist). NULL = all types.';

-- 6. ADDITIVE permissive SELECT policies (allow-list via sections)
CREATE POLICY "Shared users can view athlete contracts"
  ON athlete_contracts FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM life_file_shares WHERE owner_id = athlete_contracts.user_id AND shared_with_user_id = auth.uid() AND status = 'accepted' AND 'contracts' = ANY(sections) AND (expires_at IS NULL OR expires_at > now())));

CREATE POLICY "Shared users can view athlete endorsements"
  ON athlete_endorsements FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM life_file_shares WHERE owner_id = athlete_endorsements.user_id AND shared_with_user_id = auth.uid() AND status = 'accepted' AND 'endorsements' = ANY(sections) AND (expires_at IS NULL OR expires_at > now())));

CREATE POLICY "Shared users can view artist royalties"
  ON artist_royalties FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM life_file_shares WHERE owner_id = artist_royalties.user_id AND shared_with_user_id = auth.uid() AND status = 'accepted' AND 'royalties' = ANY(sections) AND (expires_at IS NULL OR expires_at > now())));

CREATE POLICY "Shared users can view artist projects"
  ON artist_projects FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM life_file_shares WHERE owner_id = artist_projects.user_id AND shared_with_user_id = auth.uid() AND status = 'accepted' AND 'contracts' = ANY(sections) AND (expires_at IS NULL OR expires_at > now())));

-- 7. RESTRICTIVE policy: enforces document_type_allowlist when set
CREATE POLICY "Document allowlist restriction"
  ON life_file_documents AS RESTRICTIVE FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR NOT EXISTS (SELECT 1 FROM life_file_shares WHERE owner_id = life_file_documents.user_id AND shared_with_user_id = auth.uid() AND document_type_allowlist IS NOT NULL)
    OR EXISTS (SELECT 1 FROM life_file_shares WHERE owner_id = life_file_documents.user_id AND shared_with_user_id = auth.uid() AND document_type_allowlist IS NOT NULL AND life_file_documents.document_type = ANY(document_type_allowlist))
  );
```

### Files to create
1. `supabase/migrations/<ts>_seed_demo_setup.sql` — schema + RLS above
2. `supabase/functions/seed-demo-profiles/index.ts` — orchestrator with two-phase gate
3. `supabase/functions/seed-demo-profiles/seed-data.ts` — payload constants + name pool
4. `supabase/functions/seed-demo-profiles/pdf-helpers.ts` — pdf-lib placeholder generator
5. `supabase/functions/seed-demo-profiles/audit.ts` — conflict checks + name generator
6. New secret: `DEMO_SEED_ADMIN_TOKEN` (will request before deploy)
7. Memory: `mem://features/demo-profiles` + index.md update

### Verification block (returned only in confirm-phase response)
```json
{
  "agent_can_see_athlete_contracts": <expect >0>,
  "agent_can_see_athlete_endorsements": <expect >0>,
  "agent_can_see_athlete_royalties": <expect >0>,
  "agent_can_see_athlete_contract_docs": <expect >0>,
  "agent_can_see_athlete_tax_docs": <expect >0>,
  "agent_can_see_athlete_identity_docs": 0,
  "agent_can_see_athlete_medical_docs": 0,
  "agent_can_see_athlete_beneficiaries": 0,
  "agent_can_see_artist_anything": 0,
  "shared_meeting_visible_to_both": true,
  "agent_share_sections": ["contracts","endorsements","royalties","documents","meetings","contacts"],
  "agent_share_document_type_allowlist": ["contract","tax"]
}
```
Any mismatch → `task_status: "failed"` in response.

### Usage
```
# Phase 1 (preview, no writes)
curl -X POST https://yeljdtuwbpnuywwxfiyh.supabase.co/functions/v1/seed-demo-profiles \
  -H "x-admin-token: <token>"

# Review names. If acceptable, run Phase 2:
curl -X POST "https://yeljdtuwbpnuywwxfiyh.supabase.co/functions/v1/seed-demo-profiles?confirm=true" \
  -H "x-admin-token: <token>"
```

Will request `DEMO_SEED_ADMIN_TOKEN` secret on switch to default mode, then deploy migration + edge function.
