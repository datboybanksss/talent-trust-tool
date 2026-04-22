

## Smoke test: staff invitation email end-to-end

### What we're proving
1. Clicking "Invite" in SharePortal writes the row + invokes `send-invitation-email`
2. The email actually lands in a real inbox
3. The activation link in the email opens `/staff-activate/:token` and works

### Blocker we already see in logs
`send-email` is returning **401 UNAUTHORIZED_INVALID_JWT_FORMAT** from the Lovable Cloud email gateway. That means the Resend on element 1712 from your last attempt produced a "Resend failed" toast — the email never left the platform. We must fix this before any smoke test can succeed.

Likely cause: the `LOVABLE_API_KEY` secret used by `send-email` to call the Cloud email gateway is either missing, stale, or being sent in the wrong header. We'll inspect `send-email/index.ts` and the secret, then patch.

### Test plan (3 phases)

**Phase 0 — Fix the 401 (mandatory prerequisite)**
- Read `supabase/functions/send-email/index.ts` to confirm how it authenticates to the Cloud email service
- Check the secret it uses (likely `LOVABLE_API_KEY`) is present and valid
- Patch + redeploy `send-email` so it returns `{ success: true }` for a basic test send
- Re-run a 1-line `curl` test against `send-email` directly to confirm 200 OK

**Phase 1 — Send a real invite to YOUR inbox**
You provide one real email address you control (Gmail, Outlook, etc. — NOT a `.demo@themvpbuilder.co.za` address, since the `is_demo` guard blocks demo agents).

Steps you take in the preview:
1. Log in as a **non-demo** agent account
2. Navigate to **SharePortal** (Agent Dashboard → Share Portal section)
3. Click "Invite Staff Member", enter:
   - Name: `Test Staffer`
   - Email: *your real address*
   - Role: `Personal Assistant` (or any)
   - Sections: tick 2-3
4. Submit

Expected:
- Toast: "Invitation emailed to Test Staffer"
- New row appears in the staff table with status `pending`
- Email arrives within ~30 seconds in your inbox

I will verify on my side:
- `audit_log` row with `action='invitation_email_sent'`, recipient = your email
- `portal_staff_access` row exists with `invitation_token`, `expires_at` ~7 days out
- `send-email` and `send-invitation-email` logs show no errors

**Phase 2 — Activate via the email link**
1. Open the email, click the activation button
2. Browser should land on `/staff-activate/<token>`
3. Page shows the agency name + role + signup form (your real email pre-filled)
4. Set a password and submit
5. Confidentiality gate appears — accept it
6. You land on `/agent-dashboard` as the staff member

I will verify:
- `portal_staff_access.staff_user_id` is now populated
- `activated_at` is set
- `confidentiality_accepted_at` is set
- `status` = `active`
- A new `auth.users` row exists for that email

**Phase 3 — Failure-mode check (optional but recommended)**
- On the SharePortal table, click **Copy Link** on a row → confirm the link in clipboard matches `/staff-activate/<token>`
- Click **Resend** on an expired row (one of the 3 force-expired ones) → confirm a fresh email arrives with a new `expires_at` ~7 days out
- Try to reuse the original activation link after it's already been used → should show "already activated" message

### What I need from you to start
1. **One real email address** you can read (for Phases 1-3)
2. **Confirmation** that you want me to fix the `send-email` 401 first (Phase 0) — this is unavoidable, the smoke test can't pass without it
3. Confirmation of which **non-demo** agent account you'll log in as (so I can correlate audit logs)

Once you reply with those, I'll switch to default mode, fix the 401, and walk through Phases 1-3 with you live.

