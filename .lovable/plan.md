

## Invitation email system — final approved plan

### Pre-deploy check (run before migration)

```sql
SELECT COUNT(*) FROM client_invitations
  WHERE created_at >= now() - interval '14 days'
    AND activated_at IS NULL AND archived_at IS NULL;
```

If non-zero, pause and report per-case before touching anything else. If zero, proceed.

### Migration (additive, force-expires entire pre-email-infra batch)

```sql
ALTER TABLE public.portal_staff_access
  ADD COLUMN invitation_token uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN activated_at     timestamptz NULL,
  ADD COLUMN expires_at       timestamptz NULL DEFAULT (now() + interval '7 days');
CREATE UNIQUE INDEX portal_staff_access_invitation_token_key
  ON public.portal_staff_access(invitation_token);

ALTER TABLE public.client_invitations
  ADD COLUMN expires_at timestamptz NULL DEFAULT (now() + interval '14 days');

UPDATE public.portal_staff_access
  SET expires_at = created_at + interval '7 days' WHERE expires_at IS NULL;
UPDATE public.client_invitations
  SET expires_at = created_at + interval '14 days' WHERE expires_at IS NULL;

-- Force-expire ALL pending staff invites (pre-email-infra batch needs deliberate resend)
UPDATE public.portal_staff_access
  SET expires_at = now() WHERE status = 'pending';

-- Force-expire stale client invites (>14d, not activated/archived)
UPDATE public.client_invitations
  SET expires_at = now()
  WHERE created_at < now() - interval '14 days'
    AND activated_at IS NULL AND archived_at IS NULL;
```

### Post-migration verification (must match exactly)

| Query | Expected |
|---|---|
| `portal_staff_access` pending | 3 |
| `client_invitations` not activated/archived | 2 |
| `portal_staff_access expires_at <= now()` | 3 |
| `client_invitations expires_at <= now() AND activated_at IS NULL` | 2 |

If any number is off, halt and report before code.

### Edge functions

**`send-invitation-email/index.ts`** — single entry, two templates. Order:
1. Validate body
2. Load invitation (service role)
3. Verify caller owns it (or is service role)
4. **`is_demo` guard** on inviter → short-circuit + audit log
5. **Then** profiles → auth.users join for returning-user detection
6. Build template → send via existing `send-email` wrapper → audit log

**`get-invitation-by-token/index.ts`** — service-role lookup for both activation pages. Validates expiry/status, returns minimal payload.

### Email templates (added to `_shared/email-templates.ts`)
- `staffInvitationEmail` — agency, inviter, role label, sections list, activation URL, expiry, returning-user variant
- `clientInvitationEmail` — agency, inviter, client_type framing, activation URL, expiry, returning-user variant

### UI changes
- **`SharePortal.tsx`**: invoke email after insert; per-row **Copy Link** + **Resend** (resend on expired row pushes `expires_at = now() + 7d` first); failure toast keeps row + offers Copy Link
- **`AgentDashboard.tsx`** (`handleCreateInvitation` + bulk import): same pattern; existing clipboard fallback stays; **Resend** on non-activated rows (refreshes `expires_at + 14d` if expired); bulk via `Promise.allSettled` with summary toast
- Audit actions: `invitation_email_sent`, `invitation_resent`, `invitation_email_skipped_demo`, `invitation_email_failed`. Resend rate-limit: 1/min per `invitation_id`

### Routes
- **NEW** `/staff-activate/:token` → `StaffActivate.tsx` (lookup → signup or sign-in → set `staff_user_id` + `activated_at` + `status='active_pending_confidentiality'` → `<ConfidentialityGate />` → `confidentiality_accepted_at` → `/agent-dashboard`)
- **NEW** `/client-activate/:token` → existing `ActivateProfile` (canonical for new emails)
- **PERMANENT ALIAS** `/activate/:token` → existing `ActivateProfile` (no deprecation, no removal — old WhatsApp/email links resolve forever)

### Demo seed (per sync rule)
Add to `seed-demo-profiles/index.ts` — 2 `portal_staff_access` rows on `agent.demo`:
- `assistant.demo@themvpbuilder.co.za` (Personal Assistant, status=`active`, confidentiality_accepted_at populated)
- `accountant.demo@themvpbuilder.co.za` (Accountant, status=`pending`)

Both use the `@themvpbuilder.co.za` fake domain so even a defense-in-depth guard failure cannot hit a real inbox. The `is_demo` short-circuit in `send-invitation-email` is the primary block.

### Files

**New**: `supabase/migrations/<ts>_invitation_email_columns.sql`, `supabase/functions/send-invitation-email/index.ts`, `supabase/functions/get-invitation-by-token/index.ts`, `src/pages/StaffActivate.tsx`

**Modified**: `supabase/functions/_shared/email-templates.ts`, `src/components/agent/SharePortal.tsx`, `src/pages/AgentDashboard.tsx`, `src/App.tsx`, `supabase/functions/seed-demo-profiles/index.ts`

### Out of scope
`Sharing.tsx` mock rewrite, `ShareLifeFileDialog`/`InviteGuardianDialog` email wiring (separate flows), automated mass-resend (agents self-serve via Resend buttons).

