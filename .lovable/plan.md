

## Add "The Agency" tab + make Share Portal visible to staff (read-only)

### Goal

1. Add a new sidebar entry **"The Agency"** (after Agreement Templates) visible to **both owners and staff**. It lists every member of the workspace — owner first, then all activated staff — with name, email, role label, sections granted, and status.
2. Make the existing **Share Portal** visible to staff in **read-only** mode so they see the same roster the owner sees (owner shown at the top, plus all activated staff). Only owners keep the "Invite Staff", "Edit", "Resend", "Revoke" controls.

This keeps invitation/permission management owner-only while giving staff transparency about who else is in their workspace.

### What the user will see

**New "The Agency" tab (`view: "agency"`)** — a clean directory page:

```text
The Agency · MVP Builder Talent Agency
─────────────────────────────────────────────────
[Owner badge] Kgosi Banks            Owner
              kgosi@…                All sections      Active

[Staff]       Naledi Ntsane          Personal Assistant
              naledi@…               Clients · Pipeline · Calendar · Compare · Templates
              Joined 22 Apr 2026     Active

(future staff appear here automatically once they activate)
```

- Owner row is always pinned at the top with a gold "Owner" badge.
- Staff rows appear only when `status = 'active'` AND `activated_at IS NOT NULL` (so unaccepted invites stay private to the owner).
- For staff viewers: pure read-only. No edit/revoke buttons.
- For owner viewers: same list, but each staff row gets a small "Manage in Share Portal" link that jumps to the Share Portal tab.

**Share Portal tab** — now also reachable by staff:
- Staff see the same roster table the owner sees, filtered to active members + the owner pinned at the top.
- The "Invite Staff" button, role-edit dialog, copy-link, resend, and revoke actions are hidden for staff.
- A small banner at the top reads: *"You're viewing your agency's team. Only the owner can invite or change roles."*

### Technical changes

**1. Sidebar — `src/components/agent/AgentSidebar.tsx`**
- Add new nav item `{ title: "The Agency", icon: Building2, view: "agency", section: "agency" }` placed after `templates`.
- Treat `agency` as an implicit section every viewer (owner and staff) can see — handle in the `visibleNavItems` filter by special-casing `view === "agency"` to always pass.

**2. New view in `src/pages/AgentDashboard.tsx`**
- Extend the `activeView` union with `"agency"`.
- Add a `<TabsContent value="agency">` (or matching conditional render) that renders a new `<AgencyDirectory />` component. No `SectionGuard` wrapper (visible to all workspace members).

**3. New component — `src/components/agent/AgencyDirectory.tsx`**
- Uses `useAgencyScope()` to get `scopedAgentId` (owner id) + `workspaceRole`.
- Loads:
  - Owner row: from `agent_manager_profiles` (company_name, role) + `profiles` (display_name) + auth email via `useAuth` if viewer is owner, otherwise `staff.agencyOwnerName`. Email for the owner shown only to the owner; for staff viewers we display the agency name + owner name (no email — owner email isn't in any RLS-readable table for staff today, so we skip it gracefully and show "—").
  - Staff rows: `select * from portal_staff_access where agent_id = scopedAgentId and status = 'active' and activated_at is not null`.
- Renders a card per member with avatar initials, role label, section chips, and joined date.

**4. RLS — staff need to read sibling staff rows**
- Currently `portal_staff_access` SELECT policies allow only:
  - `agent_id = auth.uid()` (the owner), or
  - `staff_user_id = auth.uid()` (their own row).
- Add a new policy so an active staff member can read **all active rows of the same agency**:

```sql
CREATE POLICY "Active staff can view agency roster"
ON public.portal_staff_access FOR SELECT TO authenticated
USING (
  status = 'active'
  AND activated_at IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.portal_staff_access me
    WHERE me.staff_user_id = auth.uid()
      AND me.agent_id = portal_staff_access.agent_id
      AND me.status = 'active'
      AND me.activated_at IS NOT NULL
      AND me.confidentiality_accepted_at IS NOT NULL
  )
);
```

Pending invitations remain owner-only because of the `status = 'active'` filter — staff never see who has been invited but hasn't accepted.

- Also add a policy on `agent_manager_profiles` so staff can read it (already exists per schema: *"Active staff can view their agency profile"* — no change needed).

**5. Share Portal — `src/components/agent/SharePortal.tsx`**
- Remove the `SectionGuard ownerOnly` wrapper currently around it in `AgentDashboard.tsx` (or change to pass-through for staff).
- Inside `SharePortal`, branch on `useAgencyScope().workspaceRole`:
  - Add an "Owner" pinned card at the top (same data source as AgencyDirectory's owner row) so the owner appears in the team list, not only the staff.
  - When `workspaceRole === 'staff'`: hide the "Invite Staff" trigger, the per-row "Edit / Copy / Resend / Revoke" action column, and the role-legend "Invite" CTAs. Show the read-only banner.
  - Filter the `staff` list to `status === 'active'` for staff viewers (owner still sees pending).

**6. Sidebar visibility for Share Portal**
- Change `{ title: "Share Portal", icon: Share2, view: "share", ownerOnly: true }` to `{ ..., section: "share-readonly" }` and special-case it in the filter so staff see it but in read-only.
- Simpler alternative we'll use: just remove `ownerOnly: true` and add `view === "share"` to the always-visible whitelist alongside `agency`.

### Verification

1. As owner Kgosi: sidebar shows new "The Agency" item; opens directory listing Kgosi (Owner) + Naledi (PA, active). Share Portal still has all admin controls.
2. As staff Naledi: sidebar shows "The Agency" + "Share Portal"; both display Kgosi (Owner, pinned) + Naledi (PA). No invite/edit/revoke buttons; banner explains read-only.
3. Invite a second staff member — they remain hidden from Naledi until they accept and activate; then they appear in both views automatically (staff list polls via existing realtime channel on Share Portal; Agency directory refetches on tab focus).
4. RLS check: a staff member from a different agency cannot see Kgosi's roster (the `EXISTS` clause in the new policy scopes to same `agent_id`).

