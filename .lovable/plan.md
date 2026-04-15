

## Work Stream C-rest: RLS Audit Remediation + Audit Log Coverage

### What this does
Fixes security policy gaps across the database, adds audit trail entries to all sensitive operations, wires the Guardian audit log UI to real data, and enables leaked password protection.

---

### Part 1: Database Migration (RLS + Function Fixes)

The migration SQL will be shown in full before execution so you have a record. Here is exactly what will run:

```sql
-- =============================================
-- PART A: Fix "Shared users can view" policies
-- These 4 tables have SELECT policies granted TO public (includes anon).
-- Re-scope them TO authenticated.
-- =============================================

-- beneficiaries
DROP POLICY "Shared users can view beneficiaries" ON public.beneficiaries;
CREATE POLICY "Shared users can view beneficiaries" ON public.beneficiaries
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM life_file_shares
    WHERE life_file_shares.owner_id = beneficiaries.user_id
      AND life_file_shares.shared_with_user_id = auth.uid()
      AND life_file_shares.status = 'accepted'
      AND 'beneficiaries' = ANY(life_file_shares.sections)
      AND (life_file_shares.expires_at IS NULL OR life_file_shares.expires_at > now())
  ));

-- emergency_contacts
DROP POLICY "Shared users can view emergency contacts" ON public.emergency_contacts;
CREATE POLICY "Shared users can view emergency contacts" ON public.emergency_contacts
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM life_file_shares
    WHERE life_file_shares.owner_id = emergency_contacts.user_id
      AND life_file_shares.shared_with_user_id = auth.uid()
      AND life_file_shares.status = 'accepted'
      AND 'contacts' = ANY(life_file_shares.sections)
      AND (life_file_shares.expires_at IS NULL OR life_file_shares.expires_at > now())
  ));

-- life_file_documents
DROP POLICY "Shared users can view life file documents" ON public.life_file_documents;
CREATE POLICY "Shared users can view life file documents" ON public.life_file_documents
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM life_file_shares
    WHERE life_file_shares.owner_id = life_file_documents.user_id
      AND life_file_shares.shared_with_user_id = auth.uid()
      AND life_file_shares.status = 'accepted'
      AND 'documents' = ANY(life_file_shares.sections)
      AND (life_file_shares.expires_at IS NULL OR life_file_shares.expires_at > now())
  ));

-- life_file_assets
DROP POLICY "Shared users can view life file assets" ON public.life_file_assets;
CREATE POLICY "Shared users can view life file assets" ON public.life_file_assets
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM life_file_shares
    WHERE life_file_shares.owner_id = life_file_assets.user_id
      AND life_file_shares.shared_with_user_id = auth.uid()
      AND life_file_shares.status = 'accepted'
      AND 'assets' = ANY(life_file_shares.sections)
      AND (life_file_shares.expires_at IS NULL OR life_file_shares.expires_at > now())
  ));

-- =============================================
-- PART B: Add INSERT policy on audit_log for authenticated users
-- (needed for client-side audit logging)
-- =============================================
CREATE POLICY "Authenticated users can insert audit logs"
  ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

Note: The 4 functions (`update_profile_timestamp`, `update_compliance_reminder_timestamp`, `link_staff_on_signup`, `create_default_subscription`) already have `SET search_path TO 'public'` based on current db state -- no changes needed there.

**Tables with policy changes: 4** (beneficiaries, emergency_contacts, life_file_documents, life_file_assets) + 1 new INSERT policy on audit_log.

---

### Part 2: Edge Function Updates

**`supabase/functions/export-my-data/index.ts`**
- Add audit_log insert (via service role client) before returning the export JSON:
  - action: `data_export`, entity_type: `user_data`, entity_id: userId, metadata: `{ tables_exported: [...] }`

**`supabase/functions/delete-my-account/index.ts`**
- Add audit_log insert (via service role client) **before** deleting the auth user (so the row persists for admin review):
  - action: `account_deletion`, entity_type: `user_account`, entity_id: userId, metadata: `{ email, tables_cleaned: [...], warnings: errors }`

---

### Part 3: Client-side Audit Logging

**`src/services/lifeFileShareService.ts`**
- Add a private `logAudit` helper that inserts into `audit_log` via the supabase client
- After each successful mutation, fire-and-forget an audit insert:
  - `createLifeFileShare` -> action `share_created`, metadata: `{ shared_with_email, sections, access_level }`
  - `revokeLifeFileShare` -> action `share_revoked`, metadata: `{ share_id }`
  - `acceptLifeFileShare` -> action `share_accepted`, metadata: `{ share_id }`
  - `declineLifeFileShare` -> action `share_declined`, metadata: `{ share_id }`
  - `deleteLifeFileShare` -> action `share_deleted`, metadata: `{ share_id }`

---

### Part 4: Guardian AuditLogTab Wiring

**`src/components/guardian/AuditLogTab.tsx`**
- Replace `mockAuditLog` import with a real query to `audit_log` table filtered by the current user
- Add `useEffect` + `useState` for loading/fetching
- Map database columns (`action`, `metadata`, `created_at`, `user_id`) to the existing timeline UI
- Add loading skeleton and empty state

---

### Part 5: Leaked Password Protection

- Use `configure_auth` tool to enable `password_hibp_enabled: true`

---

### Part 6: Follow-up Flag

The contact form server-side honeypot validation (Issue C) will be flagged as a follow-up item for **Work Stream D7** when the contact form is wired to production email sending.

---

### Summary of changes (post-completion)

| Category | Count/Detail |
|---|---|
| RLS policies dropped + recreated | 4 (shared-user SELECT on beneficiaries, emergency_contacts, life_file_documents, life_file_assets) |
| New RLS policies added | 1 (audit_log INSERT for authenticated) |
| Functions verified | 4 (all already have search_path set) |
| Edge functions updated | 2 (export-my-data, delete-my-account) |
| Audit log actions added | 7 (data_export, account_deletion, share_created, share_revoked, share_accepted, share_declined, share_deleted) |
| UI components updated | 1 (AuditLogTab wired to real data) |
| Auth hardening | Leaked password protection enabled |

### Files modified
- 1 new migration file
- `supabase/functions/export-my-data/index.ts`
- `supabase/functions/delete-my-account/index.ts`
- `src/services/lifeFileShareService.ts`
- `src/components/guardian/AuditLogTab.tsx`

