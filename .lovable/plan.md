

## Client activation UX — final approved plan (incorporating 3 adjustments + welcome card)

### Adjustments locked in
1. **Drop `requested_share_response`** — keep only `requested_share_sections` on `client_invitations`. Agent badge reads from `life_file_shares.status` directly.
2. **Shadow-column approach kept.** No change to `life_file_shares.owner_id` nullability. Coupling documented inline.
3. **Badge copy** uses explicit subject: *"Waiting for client response"* / *"Client granted access"* / *"Client declined access: {reason}"*.

### Welcome card decision: **INCLUDED** in this sprint
One new component (`<FirstLoginWelcomeCard />`), one column (`profiles.first_login_seen_at`), one mount point in `Dashboard.tsx`. ~60 lines, ~20 minutes. Counts the agent-loaded docs from `life_file_documents` where `notes ILIKE 'Pre-loaded by your agent%'`. Three checklist items are static (not wired to live state — purely guidance). Dismissed via UPDATE on `profiles.first_login_seen_at = now()`.

### Migration

```sql
-- 1. Stage agent's requested share sections on the invitation.
-- COUPLING NOTE: This column exists because life_file_shares.owner_id is NOT NULL
-- and the client's user_id doesn't exist until activation. At activation the value
-- is consumed to create the life_file_shares row, then remains as a historical
-- record of the original request. Do NOT also store a "response" column here —
-- life_file_shares.status is the single source of truth post-activation.
ALTER TABLE public.client_invitations
  ADD COLUMN IF NOT EXISTS requested_share_sections text[] NULL;

COMMENT ON COLUMN public.client_invitations.requested_share_sections IS
  'Agent-requested sections staged pre-activation. Consumed at activation to create life_file_shares row. Historical record only after activation; do not mutate.';

-- 2. Optional decline reason captured by the client.
ALTER TABLE public.life_file_shares
  ADD COLUMN IF NOT EXISTS decline_reason text NULL;

-- 3. First-login banner dismissal flag.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS first_login_seen_at timestamptz NULL;
```

No enum changes. No new tables. Additive only.

### Edge function: `activate-client-profile`

**`lookup` action**
- Add `expires_at < now()` check → return `{ error: 'expired', agent_email, agent_name }` (resolved by joining `agent_manager_profiles` on `agent_id`).

**`activate` action**
1. Re-validate token + not expired + status pending.
2. `auth.admin.createUser` with `email_confirm: true`.
3. Patch `profiles.phone`.
4. Transfer documents — track `documentsRequested`, `documentsTransferred`, `documentsFailed: [{ filename, error }]`.
5. **If `requested_share_sections` non-null and non-empty:** insert into `life_file_shares` with `owner_id = newUserId`, `shared_with_user_id = agent_id`, `shared_with_email = agent_email`, `sections = requested_share_sections`, `status = 'pending_client_approval'`, `relationship = 'agent'`. Add same coupling comment in code.
6. Mark invitation activated.
7. **Generate magic-link** via `auth.admin.generateLink({ type: 'magiclink', email })` → return `{ success, magic_link_token_hash, documentsRequested, documentsTransferred, documentsFailed }`.
8. If doc failures → write one `audit_log` entry: `action='client_activation_document_transfer_failed'`, `user_id = invitation.agent_id`, `entity_type='client_invitation'`, `entity_id=invitation.id`, `metadata={ failed, transferred }`.

### Frontend changes

**`src/pages/ActivateProfile.tsx`**
- Expired-link branch with `mailto:` to agent.
- Success branch:
  - Try `supabase.auth.verifyOtp({ token_hash, type: 'magiclink' })`.
  - On success → 1.5s success card → `navigate('/dashboard')`.
  - On failure → fallback to current "Sign In Now" card → `/auth`.
  - If `documentsFailed.length > 0`, prepend warning card listing failed filenames (non-blocking).

**`src/pages/AgentDashboard.tsx`**
- Add-client form: new checkbox **"Request access to this client's profile after activation"** (default ON). When ON, show sections selector with **Contracts, Endorsements, Tax** pre-checked; **Estate, Identity, Medical** rendered locked with label *"Protected — client can grant later"*.
- On invitation insert, set `requested_share_sections` (only when checkbox ON; demo agents already blocked by existing `is_demo` guards).
- For each pending client row, fetch the corresponding `life_file_shares` row (if any) where `shared_with_user_id = me AND owner_id = activated_user_id` and render badge:
  - `pending_client_approval` → **"Waiting for client response"** (amber)
  - `accepted` → **"Client granted access"** (green)
  - `declined` → **"Client declined access: {decline_reason ?? 'no reason given'}"** (muted)
- Verify "Resend invitation" button exists on each pending client row with the existing 60-second rate limit.

**`src/components/dashboard/PendingAccessRequestCard.tsx`** (NEW)
- Reads `life_file_shares` where `owner_id = me AND status = 'pending_client_approval'`.
- Renders agent name (from `agent_manager_profiles` joined via `shared_with_user_id`) + agency + requested sections chips.
- Buttons: **Accept** / **Customise** / **Decline**.
  - Accept → `update life_file_shares set status='accepted', accepted_at=now()`.
  - Customise → opens `ShareLifeFileDialog` pre-filled; on save, status → `accepted`.
  - Decline → prompt for optional reason (textarea, max 200 chars) → `status='declined', decline_reason=<text>`.

**`src/components/dashboard/FirstLoginWelcomeCard.tsx`** (NEW, ~60 lines)
- Mount in `Dashboard.tsx` above all widgets.
- Render only when `profiles.first_login_seen_at IS NULL`.
- Copy:
  > **Welcome to Legacy Builder, {name}!** Your agent has uploaded {N} documents to get you started. Here are your next three steps:
  > ☐ Upload any additional personal documents
  > ☐ Add at least one beneficiary
  > ☐ Add an emergency contact
- Buttons: **[Get Started]** (scroll to My Life File / dismiss) and **[Dismiss for now]** (UPDATE `first_login_seen_at = now()`).
- {N} = `count(*) from life_file_documents where user_id = me and notes ilike 'Pre-loaded by your agent%'`.

**`src/components/life-file/ShareLifeFileDialog.tsx`**
- Accept optional `prefilledShareId` + `prefilledSections` props for the Customise path; on save against an existing pending row, UPDATE instead of INSERT and set status to `accepted`.

### Files

**New**
- `supabase/migrations/<ts>_client_activation_ux.sql`
- `src/components/dashboard/PendingAccessRequestCard.tsx`
- `src/components/dashboard/FirstLoginWelcomeCard.tsx`

**Modified**
- `supabase/functions/activate-client-profile/index.ts`
- `src/pages/ActivateProfile.tsx`
- `src/pages/AgentDashboard.tsx`
- `src/pages/Dashboard.tsx`
- `src/components/life-file/ShareLifeFileDialog.tsx`

### Post-deploy verification (the 7 checks)

1. Real client clicks valid invitation → enters password → lands on `/dashboard` with no manual sign-in. Refresh persists session.
2. Agent unchecked "Request access" → no `PendingAccessRequestCard` renders.
3. Agent ticks Contracts+Endorsements → client sees card → **Accept** → `life_file_shares.status='accepted'`; agent badge flips to **"Client granted access"** within seconds.
4. Same flow → client clicks **Decline** with reason "Trial period only" → agent badge shows **"Client declined access: Trial period only"**.
5. Force-expire token in DB → activation page shows expired card with `mailto:` to agent.
6. Pre-upload 5 docs, force-fail 2 in storage → success card lists 2 failed filenames; one `audit_log` entry visible to agent.
7. Resend button on pending client row works and respects 60-second cooldown.

Plus welcome-card spot check: first dashboard load after activation shows the card with correct N; click Dismiss → never reappears across sessions.

### Out of scope
- Onboarding wizard (deferred — welcome card replaces nothing, just bridges the gap).
- Auth provider changes.
- Making `life_file_shares.owner_id` nullable.
- Per-section response tracking on the invitation row.

