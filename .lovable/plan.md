

## Workspace Model — Audit Report + Implementation Plan

### Audit 1: Current RLS posture (agency-scoped tables)

| Table | SELECT (staff?) | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `agent_deals` | owner ✓ + **staff via `staff_has_section('pipeline')`** ✓ | owner only | owner only | owner only |
| `client_invitations` | owner ✓ + **staff via `staff_has_section('clients')`** ✓ | owner only | owner only | owner only |
| `shared_meetings` | owner+attendees ✓ + **staff via `staff_has_section('calendar')`** ✓ | owner only (`created_by`) | owner only | owner only |
| `athlete_contracts` | owner + life_file_share recipients | owner only (`user_id` = auth.uid) | owner only | owner only |
| `athlete_endorsements` | owner + life_file_share recipients | owner only | owner only | owner only |
| `artist_royalties` | owner + life_file_share recipients | owner only | owner only | owner only |
| `artist_projects` | owner + life_file_share recipients | owner only | owner only | owner only |
| `life_file_shares` | owner + recipient + **staff via `clients` section** (read) | owner only — **stays owner-only** | owner+recipient | owner only |
| `portal_staff_access` | owner + staff (own row) | owner only — **stays owner-only** | owner + staff (own row) | owner only |
| `agent_manager_profiles` | owner + active staff (read) | owner only — **stays owner-only** | owner only | owner only |

**Conclusion:** SELECT was opened to staff last sprint for `agent_deals`, `client_invitations`, `shared_meetings`, `agent_manager_profiles`, `life_file_shares`. The athlete/artist tables (contracts, endorsements, royalties, projects) have **no staff SELECT policy** today — they need both SELECT and write policies added. Writes are owner-only everywhere.

### Audit 2: Write paths in code (every CRUD that hardcodes user.id)

| File | Line(s) | Operation | Current owner key | Needs change |
|---|---|---|---|---|
| `src/pages/AgentDashboard.tsx` | 369–380 | Storage upload to `agent-client-documents` | path includes `user.id` | path → `scopedAgentId` |
| `src/pages/AgentDashboard.tsx` | 384 | `client_invitations` insert | `agent_id: user.id` | `agent_id: scopedAgentId`, add `created_by: user.id` |
| `src/pages/AgentDashboard.tsx` | 467 | `client_invitations` update (resend expiry) | `.eq(id)` | add `updated_by: user.id` |
| `src/pages/AgentDashboard.tsx` | 479 | `audit_log` insert | `user_id: user.id` ✓ | leave as-is (attribution source) |
| `src/pages/AgentDashboard.tsx` | 576 | bulk `client_invitations` insert | `agent_id: user.id` | same as 384 |
| `src/components/dashboard/DealPipeline.tsx` | 91 | `agent_deals` update status | `.eq(id)` | add `updated_by: user.id` |
| `src/components/dashboard/DealDialog.tsx` | (insert/update) | create/edit deals | `agent_id: user.id` | `agent_id: scopedAgentId`, stamp created_by/updated_by |
| `src/components/dashboard/DeleteDealDialog.tsx` | delete deal | RLS-scoped delete | — | RLS handles via new policy |
| `src/components/agent/AgentCalendar.tsx` | 134 | `shared_meetings` insert | `created_by: user.id` | `created_by: user.id` ✓ stays for attribution; add separate `agency_owner_id` column scoped to `scopedAgentId` (see migration §4) |
| `src/components/agent/AgentCalendar.tsx` | 155 | `shared_meetings` delete | RLS-scoped | RLS expanded |
| `src/components/agent/SharePortal.tsx` | 142, 208, 231, 257 | `portal_staff_access` insert/update/delete | `agent_id: user.id` | **owner-only** — gate UI on `workspaceRole === 'owner'`, no RLS change |
| `src/components/myagency/AgencyIdentityHeader.tsx` | 45, 82 | `agent_manager_profiles` update | `.eq(user_id, user.id)` | **owner-only** — already redirected on staff |
| `src/pages/ContractManager.tsx` | 150, 206 | `athlete_contracts` update file | `.eq(id)` | needs new RLS for staff write + agency scope rethink (see §4 below) |
| `src/pages/AgentClientDetail.tsx` / `AgentAthleteProfile.tsx` / `athlete-profile/*` | inline edits to client athlete/artist data | writes to `athlete_contracts`, `athlete_endorsements`, etc. keyed on **client `user_id`** | These tables are owned by the **client**, not the agency. Staff write here only when client has shared that section with the agency owner. Sprint scope: **defer client-data writes by staff** to next sprint; staff read-only on client-owned tables this sprint. |
| `src/components/dashboard/ClientComparison.tsx` | reads | already scoped | none |

**Critical finding:** `athlete_contracts` / `athlete_endorsements` / `artist_*` are keyed by the **client's** `user_id` — they are not agency-scoped tables. The original prompt assumed they were. They are exposed to the agency via `life_file_shares`, not via agency ownership. **Recommendation:** treat them as read-only for staff this sprint (matches owner's current relationship to them). Owner still edits via the impersonation paths that already exist. No RLS change for these four tables.

The genuine agency-scoped tables that get the staff-write expansion this sprint:
- `agent_deals` (section: pipeline)
- `client_invitations` (section: clients)
- `shared_meetings` (section: calendar)

### Audit 3: Attribution column inventory

| Table | created_at | updated_at | created_by | updated_by | Action needed |
|---|---|---|---|---|---|
| `agent_deals` | ✓ | ✓ | — | — | ADD both |
| `client_invitations` | ✓ | — | — | — | ADD `updated_at`, `created_by`, `updated_by` |
| `shared_meetings` | ✓ | ✓ | ✓ (= `created_by`) | — | ADD `updated_by`; reuse existing `created_by` |
| `agent_manager_profiles` | ✓ | ✓ | n/a (owner-only) | n/a | none |
| `portal_staff_access` | ✓ | ✓ | n/a (owner-only) | n/a | none |

Backfill: `UPDATE agent_deals SET created_by = agent_id WHERE created_by IS NULL;` and analogous for `client_invitations`, `shared_meetings.updated_by = created_by`.

### Audit 4: Owner-only surface confirmation

Confirmed owner-only this sprint regardless of sections:
- `agent_manager_profiles` writes (agency identity, logo)
- `portal_staff_access` writes (invite/revoke/edit staff)
- Agency deletion (`delete_agent_account` RPC — already uses `auth.uid()`, RPC stays unchanged)
- Subscription/billing (`user_subscriptions` — already keyed to `user_id`)
- `/myagency` page route (already redirects staff)
- `life_file_shares` writes (client-grant mechanism, never staff)

Additional surfaces to flag as owner-only:
- `system_announcements` (admin only — separate from staff model)
- `delete-agent-account` edge function (already owner-gated)

### Decisions on open items

- **Activity log placement:** New `WorkspaceActivityPanel` mounted in `MyAgency.tsx` between Team and POPIA Compliance. Owner-only (page already gates staff). New edge function `get-workspace-activity` reads `audit_log` filtered to workspace members. **Ship this sprint.**
- **Demo staff auth approach:** Create real auth users for `assistant.demo@legacybuilder.test` and `accountant.demo@legacybuilder.test` in `seed-demo-profiles`, link `staff_user_id`, mark profiles `is_demo = true`. Why: cleaner attribution, matches production data shape, allows demo of cross-account collaboration without placeholder fallbacks. Password matches existing demo password.
- **Client-owned tables (contracts/endorsements/royalties/projects):** Out of scope this sprint. Logged in `KNOWN_LIMITATIONS.md`.

### Implementation Plan

**Step 1 — Migration (additive, single transaction):**

```sql
-- Add attribution columns
ALTER TABLE agent_deals ADD COLUMN created_by uuid, ADD COLUMN updated_by uuid;
ALTER TABLE client_invitations ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN created_by uuid, ADD COLUMN updated_by uuid;
ALTER TABLE shared_meetings ADD COLUMN updated_by uuid;

-- Backfill
UPDATE agent_deals SET created_by = agent_id, updated_by = agent_id WHERE created_by IS NULL;
UPDATE client_invitations SET created_by = agent_id, updated_by = agent_id WHERE created_by IS NULL;
UPDATE shared_meetings SET updated_by = created_by WHERE updated_by IS NULL;

-- Staff write policies (pattern: owner OR active staff with section)
-- Tables explicitly EXCLUDED from this pattern:
--   life_file_shares, portal_staff_access, agent_manager_profiles,
--   athlete_contracts, athlete_endorsements, artist_royalties, artist_projects
CREATE POLICY "Staff with pipeline section can insert deals" ON agent_deals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = agent_id OR staff_has_section(agent_id, 'pipeline'));
CREATE POLICY "Staff with pipeline section can update deals" ON agent_deals
  FOR UPDATE TO authenticated USING (auth.uid() = agent_id OR staff_has_section(agent_id, 'pipeline'));
CREATE POLICY "Staff with pipeline section can delete deals" ON agent_deals
  FOR DELETE TO authenticated USING (auth.uid() = agent_id OR staff_has_section(agent_id, 'pipeline'));

-- Repeat pattern for client_invitations (section: clients)
-- Repeat pattern for shared_meetings (section: calendar) — note: created_by stays = auth.uid for attribution; agent_id derived
```

For `shared_meetings`, since it has no `agent_id` column, the staff write policy keys off `created_by` being either auth.uid OR resolved through the staff link. Simpler approach: add `agency_owner_id` column on `shared_meetings`, default to `created_by`, and gate staff policies on `staff_has_section(agency_owner_id, 'calendar')`.

**Step 2 — Hook extension (`src/hooks/useAgencyScope.tsx`):**

Add to return type:
```ts
workspaceRole: 'owner' | 'staff';
canEdit: (section: string) => boolean;
canDelete: (section: string) => boolean;
```
`canEdit/canDelete` returns `true` for owner; for staff returns `sections.includes(section)`.

**Step 3 — Mutation rewrites:** Every `.insert/.update` listed in Audit 2 (agency-scoped subset) gets:
- `agent_id` → `scopedAgentId` (was `user.id`)
- INSERT adds `created_by: user.id, updated_by: user.id`
- UPDATE adds `updated_by: user.id, updated_at: new Date().toISOString()`
- Storage upload paths key on `scopedAgentId`

**Step 4 — UI gating:**
- Remove `<OwnerOnly>` from section-scoped write buttons in `AgentDashboard`, `DealPipeline`, `AgentCalendar`. Replace with `canEdit('pipeline'|'clients'|'calendar')`.
- Keep `<OwnerOnly>` (or `workspaceRole === 'owner'`) on: SharePortal staff invites, MyAgency edits, agency deletion.
- Update `StaffContextBanner.tsx` copy: *"You're working in {agencyOwnerName}'s workspace at {agencyName}. Edit access: {sectionLabels}. Your actions are attributed to you."*
- Update `AgentSidebar.tsx` footer badge: *"Staff of {agencyName} · {roleLabel}"* (remove "View-only access").

**Step 5 — Attribution display:** New `<RecordAttribution createdBy createdAt updatedBy updatedAt />` component shown on deal cards, invitation rows, meeting items. Resolves UUIDs → display names via a single `useWorkspaceMembers(scopedAgentId)` hook (cached per session). Tooltip on hover for full timestamp.

**Step 6 — Polling:** In `AgentDashboard`, `DealPipeline`, `AgentCalendar` React Query hooks, add `refetchInterval: 30000, refetchOnWindowFocus: true`.

**Step 7 — Workspace Activity Panel (`/myagency`):**
- New edge function `supabase/functions/get-workspace-activity/index.ts`. Auth: validates caller has `agent_manager_profiles` row. Service-role queries `audit_log` filtered by workspace member user_ids. Inputs: `before`, `member_filter`, `action_filter`, `limit`. Returns enriched entries (member name, role label, action, entity).
- New component `src/components/myagency/WorkspaceActivityPanel.tsx`: filter dropdowns (member, action, date range), paginated list (20 per page, "Load more"), CSV export button.
- Mount in `MyAgency.tsx` between `AgencyStatsRow` and `POPIACompliancePanel`.

**Step 8 — Audit logging on writes:** Each new mutation writes to `audit_log` with `action` (`deal_created`, `invitation_created`, `meeting_created`, etc.), `entity_type`, `entity_id`, `metadata` (deal/invite/meeting summary). The existing audit RLS already permits authenticated insert with `user_id = auth.uid()`.

**Step 9 — Demo seed updates (`supabase/functions/seed-demo-profiles`):**
- Create real auth users for `assistant.demo` (PA, sections: clients, pipeline, calendar, compare) and `accountant.demo` (Accountant, sections: pipeline, compare, executive). Mark profiles `is_demo = true`. Link `portal_staff_access.staff_user_id`. Set `confidentiality_accepted_at` and `activated_at`.
- Seed 2 demo deals with `created_by = owner_id`, 1 deal with `created_by = assistant.demo.user_id`.
- Update `mem://features/demo-profiles` after.

**Step 10 — KNOWN_LIMITATIONS.md updates:**
- Replace "Staff write access" deferral block with "Shipped in workspace sprint."
- Add: "Staff cannot write to client-owned tables (contracts, endorsements, royalties, artist projects). These remain read-only for staff this sprint pending model decision on client-grant chaining."
- Add: "Workspace activity log is owner-only (in MyAgency). Staff cannot see their own action history. Future sprint may add a 'My Activity' staff view."
- Add: "One user → one agency. Multi-agency switcher deferred."

### Files to touch

Created:
- `supabase/migrations/<ts>_workspace_writes.sql`
- `supabase/functions/get-workspace-activity/index.ts`
- `src/components/myagency/WorkspaceActivityPanel.tsx`
- `src/components/agent/RecordAttribution.tsx`
- `src/hooks/useWorkspaceMembers.tsx`

Edited:
- `src/hooks/useAgencyScope.tsx` (add workspaceRole, canEdit, canDelete)
- `src/components/agent/StaffContextBanner.tsx` (copy)
- `src/components/agent/AgentSidebar.tsx` (badge copy)
- `src/pages/AgentDashboard.tsx` (mutations, polling)
- `src/components/dashboard/DealPipeline.tsx` (mutations, attribution display, polling)
- `src/components/dashboard/DealDialog.tsx` (mutations)
- `src/components/dashboard/DeleteDealDialog.tsx` (no longer OwnerOnly)
- `src/components/agent/AgentCalendar.tsx` (mutations, polling, attribution)
- `src/pages/MyAgency.tsx` (mount activity panel)
- `KNOWN_LIMITATIONS.md`

Untouched (owner-only stays owner-only):
- `src/components/agent/SharePortal.tsx`
- `src/components/myagency/AgencyIdentityHeader.tsx`
- `src/pages/ContractManager.tsx` and athlete-profile section components

### Verification (post-merge)

1. Owner `agent.demo` → no regression on existing flows.
2. `assistant.demo` signs in at `/auth` → `/agent-dashboard` → sidebar reads "Staff of Roc Nation Sports SA · Personal Assistant" → banner shows edit access list → "Add Deal" button visible → creates deal → card shows "Added by Naledi Ntsane (PA) · just now".
3. Owner refreshes within 30s → sees PA's deal with attribution.
4. `accountant.demo` → no `clients` section → "Invite Client" hidden, but "Add Deal" present (has pipeline).
5. Staff direct console call to `agent_manager_profiles.update` → RLS rejects.
6. Owner revokes PA's pipeline section (existing realtime channel) → PA's UI loses pipeline writes within 5s.
7. SharePortal, MyAgency edits, agency deletion all gated to `workspaceRole === 'owner'`.
8. `/myagency` shows Workspace Activity panel with paginated entries; CSV export downloads correctly.

