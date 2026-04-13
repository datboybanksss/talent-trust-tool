

## Work Stream D — Build Without Email Domain

### Approach
Build all infrastructure, edge functions, and UI now. The `send-email` wrapper will attempt to send but gracefully handle failures — logging the attempt to `audit_log` regardless. When you later add your GoDaddy domain via the email setup dialog, all email paths will start working without any code changes.

### Phase 1: send-email Edge Function + audit_log wiring
- Create `supabase/functions/send-email/index.ts`
- Accepts `{ to, subject, html, replyTo? }`, validates input
- Attempts to send via Lovable Cloud's email infrastructure
- Logs every attempt (success or failure) to `audit_log`
- Returns `{ success, messageId?, error? }` — callers handle gracefully

### Phase 2: Contact Form (D7)
- **Migration**: Create `contact_submissions` table with RLS (public insert, admin read)
- **Wire `Contact.tsx`**: On submit → insert into `contact_submissions` + call `send-email` twice (admin notification + user confirmation)
- Add honeypot spam field (hidden input, discard if filled)
- Show success toast regardless of email delivery status (submission is stored either way)

### Phase 3: Financial Integrations Waitlist (D9)
- **Migration**: Create `financial_integrations_waitlist` table
- **Replace** mock connections UI in `FinancialIntegrations.tsx` with coming-soon state + waitlist form
- On submit → insert row + call `send-email` for confirmation

### Phase 4: Scheduled Reminders (D10)
- **Migration**: Enable `pg_cron` + `pg_net`, create `cron_job_runs` table
- Update `document-expiry-reminders` to use `send-email` wrapper and log to `cron_job_runs`
- Schedule daily 04:00 UTC cron jobs

### Phase 5: Auth Email Retrofit (D-retrofit)
- Scaffold auth email templates using the built-in tooling
- Brand them to match LegacyBuilder design
- These will activate automatically once the domain is verified

### Email behavior before domain setup
- All submissions still get stored in the database
- `send-email` logs attempts to `audit_log` with status `failed` / `no_domain`
- Users see success toasts (the form worked; email delivery is a background concern)
- Once you add your GoDaddy domain, emails start flowing — zero code changes needed

### Files to create/modify
- `supabase/functions/send-email/index.ts` (new)
- `src/pages/Contact.tsx` (wire real submission)
- `src/pages/FinancialIntegrations.tsx` (replace mock UI)
- `supabase/functions/document-expiry-reminders/index.ts` (update to use send-email)
- Database migrations for `contact_submissions`, `financial_integrations_waitlist`, `cron_job_runs`, pg_cron/pg_net
- Auth email templates (scaffold + brand)

