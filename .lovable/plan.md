

## Three-stream agent portal — approved with three adjustments

### Adjustment 1 — `agency-logos` bucket is PUBLIC

- Migration creates bucket `agency-logos` with `public = true`.
- RLS on `storage.objects` (scoped to `bucket_id = 'agency-logos'`):
  - **SELECT** → role `public`, `USING (bucket_id = 'agency-logos')` (open read).
  - **INSERT / UPDATE / DELETE** → role `authenticated`, gated by `(storage.foldername(name))[1] = auth.uid()::text` (only the owner of the path can mutate).
- Path convention `${auth.uid()}/logo-${timestamp}.{ext}`. Use `storage.from('agency-logos').getPublicUrl(path).data.publicUrl` and persist that string straight into `agent_manager_profiles.logo_url`. No signed URLs anywhere — sidebar / dashboard / share portal / emails just read the column.

### Adjustment 2 — Client dedupe by client `user_id`

In `AgentDashboard.tsx` Stream 2 stats, "total clients" is computed as a `Set` of client `user_id`s, unioned across the two sources, NOT a sum of invitation rows + share rows.

```text
client_user_ids = new Set<string>()
  ← client_invitations.activated_user_id   (where agent_id = me AND status='activated' AND activated_user_id IS NOT NULL)
  ← life_file_shares.owner_id              (where shared_with_user_id = me AND status='accepted')
totalClients = client_user_ids.size
```

A client present in BOTH sources counts ONCE. An inline comment in the query/derivation block will explicitly state: `// Dedupe key = client user_id. A client with both an activated invitation AND a share grant must count as ONE.`

### Adjustment 3 — Delete RPC ordering + edge-function orphan safety

**RPC `public.delete_agent_account()`** — `SECURITY DEFINER`, `search_path = public`. The `is_demo` guard is **statement #1** (only `auth.uid()` resolution and the `is_demo` lookup precede it; no DELETE, no other writes). Body to be pasted in the Stream 1 report-back, shape:

```sql
CREATE OR REPLACE FUNCTION public.delete_agent_account()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_is_demo boolean;
BEGIN
  -- STATEMENT #1: demo guard. No deletes occur before this passes.
  SELECT is_demo INTO v_is_demo FROM public.profiles WHERE user_id = v_user_id;
  IF v_is_demo IS TRUE THEN
    RAISE EXCEPTION 'Demo accounts cannot be deleted from the UI'
      USING ERRCODE = '42501';
  END IF;

  -- Then, and only then, the cascade:
  DELETE FROM public.life_file_shares       WHERE shared_with_user_id = v_user_id;
  DELETE FROM public.client_invitations     WHERE agent_id = v_user_id;
  DELETE FROM public.portal_staff_access    WHERE agent_id = v_user_id;
  DELETE FROM public.agent_manager_profiles WHERE user_id = v_user_id;
  DELETE FROM public.user_roles             WHERE user_id = v_user_id;
  DELETE FROM public.profiles               WHERE user_id = v_user_id;

  RETURN v_user_id;
END;
$$;
```

**Edge function `delete-agent-account/index.ts`** — partial-failure handling around `supabase.auth.admin.deleteUser(userId)`:

```text
1. Validate JWT, capture userId + email.
2. Call rpc('delete_agent_account') with the user's session.
   - If RPC throws (e.g. demo guard) → 403, no audit row written for orphan.
3. Call supabase.auth.admin.deleteUser(userId).
   - On success: insert audit_log {action:'delete_agent_account', user_id, metadata:{email}}.
   - On failure:
       a. Insert audit_log {action:'delete_agent_account_orphaned',
            user_id, metadata:{email, error: err.message, occurred_at: now}}
          — capture returned id as log_id.
       b. Return HTTP 500 with body
            { error: 'auth_cleanup_failed', orphaned: true, reference: log_id,
              message: 'Your account data was removed but auth cleanup failed — contact support.' }
       c. DO NOT sign the user out (auth.users still has the row).
4. On full success, client signs the user out and navigates to /.
```

UI handling in `DeleteAgencyDialog`:
- 200 success → `signOut()` → `navigate("/")` → success toast.
- 500 with `orphaned:true` → keep dialog open, show inline error banner with the `reference` id + "contact support" copy. No sign-out.
- 403 (demo) → toast "Demo accounts cannot be deleted from the UI." (Belt-and-braces; UI button is already disabled for demo users.)

### Order of operations + report-back

**Stream 1** (build → commit → test):
- Migration: bucket + 4 storage policies + `logo_url` column + `delete_agent_account` RPC.
- New files: `src/pages/MyAgency.tsx`, `src/components/myagency/{AgencyIdentityHeader,AgencyStatsRow,POPIACompliancePanel,DeleteAgencyDialog}.tsx`, `supabase/functions/delete-agent-account/index.ts`.
- Modified: `src/App.tsx` (add `/myagency` route under `AgentRoute`), `src/components/agent/AgentSidebar.tsx` (nav entry).

  **Report-back will include:**
  - Full RPC body (verifying `is_demo` is statement #1).
  - The 4 storage policy definitions for `agency-logos` (public SELECT; auth.uid()-gated INSERT/UPDATE/DELETE).
  - Test log: throwaway agent created → logo uploaded → public URL renders in sidebar → delete flow runs → SQL queries confirming `agent_manager_profiles`, `user_roles`, `profiles`, `client_invitations` (agent_id), `life_file_shares` (shared_with_user_id), `portal_staff_access` (agent_id) rows are gone AND `auth.users` row is gone.

**Stream 2** (build → commit → test):
- Modify only `src/pages/AgentDashboard.tsx`. Remove `MOCK_INVITATIONS` / `MOCK_STATS` / `MOCK_RECENT_ACTIVITY`. Add React Query hooks for `client_invitations` (agent_id = me), `life_file_shares` (shared_with_user_id = me, status='accepted'), and `audit_log` (user_id = me, recent 10) with derived `recent_at` fallback. Stats derived with the documented dedupe-by-`user_id` rule.

  **Report-back will include:**
  - Raw SQL union query result for `agent.demo@themvpbuilder.co.za` showing exactly 3 distinct client `user_id`s (with row count).
  - Markdown-described render of the empty state for a fresh zero-client agent (no mock fallback).

**Stream 3**: explicitly no changes to `ExecutiveOverview.tsx` or related admin files.

