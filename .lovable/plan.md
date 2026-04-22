

## Staff data-visibility fix — RLS + UI gating (revised)

Approved plan with two adjustments baked in: audit_log dropped from staff RLS; revocation handled via Realtime on `portal_staff_access`.

### Migration (additive RLS only)

```sql
-- Helper: active, confidentiality-accepted staff link with the named section
CREATE OR REPLACE FUNCTION public.staff_has_section(_agent_id uuid, _section text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.portal_staff_access
    WHERE staff_user_id = auth.uid()
      AND agent_id = _agent_id
      AND status = 'active'
      AND confidentiality_accepted_at IS NOT NULL
      AND activated_at IS NOT NULL
      AND _section = ANY(sections)
  )
$$;

CREATE POLICY "Active staff can view agency invitations"
  ON public.client_invitations FOR SELECT TO authenticated
  USING (public.staff_has_section(agent_id, 'clients'));

CREATE POLICY "Active staff can view agency deals"
  ON public.agent_deals FOR SELECT TO authenticated
  USING (public.staff_has_section(agent_id, 'pipeline'));

CREATE POLICY "Active staff can view agency client shares"
  ON public.life_file_shares FOR SELECT TO authenticated
  USING (public.staff_has_section(shared_with_user_id, 'clients'));

CREATE POLICY "Active staff can view agency meetings"
  ON public.shared_meetings FOR SELECT TO authenticated
  USING (public.staff_has_section(created_by, 'calendar'));

CREATE POLICY "Active staff can view their agency profile"
  ON public.agent_manager_profiles FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.portal_staff_access
    WHERE staff_user_id = auth.uid()
      AND agent_id = agent_manager_profiles.user_id
      AND status = 'active'
      AND activated_at IS NOT NULL
  ));

-- Realtime: ensure DELETE/UPDATE events on portal_staff_access reach staff
ALTER TABLE public.portal_staff_access REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.portal_staff_access;
```

**No `audit_log` staff policy.** Owner-only continues to apply. Per-category staff visibility is a future sprint requiring schema work on `audit_log`.

### Table → section mapping

| Table | Owner column | Section |
|---|---|---|
| `client_invitations` | `agent_id` | `clients` |
| `agent_deals` | `agent_id` | `pipeline` |
| `life_file_shares` | `shared_with_user_id` | `clients` |
| `shared_meetings` | `created_by` | `calendar` |
| `agent_manager_profiles` | `user_id` | (any active link — needed for footer identity) |
| `audit_log` | — | **owner-only, excluded** |

### `useStaffAccess` hook (`src/hooks/useStaffAccess.tsx`)

Returns: `{ isStaff, agencyOwnerId, agencyName, sections, roleLabel, loading }`.

- Initial load: query `portal_staff_access` for `staff_user_id = auth.uid() AND status='active' AND confidentiality_accepted_at IS NOT NULL`. If found, also fetch `agent_manager_profiles.company_name` for that `agent_id`.
- Owner branch: returns `{ isStaff: false, sections: ALL_SECTIONS }` so consumers gate uniformly.
- **Realtime watch** on `portal_staff_access` filtered by `staff_user_id=eq.${auth.uid()}`:
  - `DELETE` → `supabase.auth.signOut()` → `navigate('/auth')` → toast "Your access to this agency has been revoked."
  - `UPDATE` → if new `status !== 'active'` OR `confidentiality_accepted_at` cleared → same sign-out flow. Otherwise refetch to pick up new sections/role.
- Channel torn down on unmount.
- Fallback: if Realtime channel `SUBSCRIBED` event never fires within 10s, start a 2-minute polling interval as a safety net (logged once via console).

### UI changes

**`AgentSidebar.tsx`**
- Each `mainNavItems` entry gains `section?: string` and `ownerOnly?: boolean`.
- Filter rule: owner sees all; staff sees only items where `section ∈ sections` AND `!ownerOnly`.
- Owner-only: Executive Overview, Share Portal, My Agency.
- Quick actions ("Add New Client", "Bulk Import", "Resend All Pending") hidden for staff lacking `clients`.
- Footer (when `isStaff`): top line `Staff of {agencyName}`, second line `{user.email} · {roleLabel}`.

**`AgentDashboard.tsx`**
- Replace inline `checkStaffAccess` logic with `useStaffAccess()`.
- Default `activeView` for staff = first allowed section (lawyer with `['clients','templates']` lands on `clients`).
- Wrap each rendered panel in `<SectionGuard section="..." ownerOnly={...}>` for defense-in-depth if user manipulates state.
- **Recent Activity widget**: explicitly hide when `isStaff === true` (do not render — empty state would be misleading and the underlying RLS now blocks rows anyway).

**`SectionGuard.tsx`** (new, `src/components/agent/SectionGuard.tsx`)
- Props: `section?: string`, `ownerOnly?: boolean`, children.
- Reads `useStaffAccess()`. Owners always pass through. Staff: render children if section is granted; otherwise render an "Access denied — ask your agency admin to grant access from Share Portal" card.

**`MyAgency.tsx`**
- Top guard: if `isStaff`, redirect to `/agent-dashboard` with toast "This section is only available to agency owners."

### Edge cases (acknowledged)

- Multi-agency staff → most-recent-active row wins; UI switcher is future work.
- Sections changed (not revoked) → Realtime UPDATE triggers refetch, sidebar re-renders within seconds.
- Demo staff → all 7 `portal_staff_access` rows have `staff_user_id = NULL` (verified earlier); zero risk to real users.
- Confidentiality not accepted → `StaffActivate.tsx` already blocks dashboard entry until `<ConfidentialityGate />` resolves.

### Files

**New**
- `supabase/migrations/<ts>_staff_select_policies.sql`
- `src/hooks/useStaffAccess.tsx`
- `src/components/agent/SectionGuard.tsx`

**Modified**
- `src/components/agent/AgentSidebar.tsx` (section filter + footer identity)
- `src/pages/AgentDashboard.tsx` (use hook, default view, SectionGuard wrapping, hide Recent Activity for staff)
- `src/pages/MyAgency.tsx` (owner-only redirect)

### Post-deploy verification

1. Owner (`agent.demo`) → all sidebar items visible, all panels populated. Unchanged.
2. Lawyer-role staff signed in → only `clients` + `templates` in sidebar; no Recent Activity widget on dashboard; manual `/myagency` navigation redirects with toast.
3. Two-browser revocation test: owner deletes staff row → within ~5s the staff browser signs out and redirects to `/auth` with toast.
4. Section update test: owner ticks an additional section → staff sidebar updates within ~5s without manual refresh.
5. RLS sanity: as authenticated staff, `select count(*) from agent_deals` returns the agency owner's deal count; as the same user after revocation, returns 0.

### Out of scope
Staff write access, per-category audit log visibility, multi-agency switcher, polling-based fallback being the primary path.

