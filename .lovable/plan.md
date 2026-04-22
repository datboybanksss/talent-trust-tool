

## Verification report — staff RLS + UI gating

### Check 1 — Owner (`agent.demo`) sees all sidebar items + populated panels ✅ (code-confirmed)
`AgentSidebar.tsx` filter at line 60-64: when `staff.isStaff === false`, all 7 nav items + Quick Actions + My Agency render unconditionally. Owners are unaffected by the new gating — they pass through every filter as a no-op. `useStaffAccess` for owners returns `{ isStaff: false, sections: ALL_SECTIONS }` (line 53-60 of the hook), so `SectionGuard` wrappers also pass through. **Pass.**

### Check 2 — Lawyer-role staff: only granted sections, no Recent Activity widget ✅ (code-confirmed)
- Sidebar filter (line 60-64): `if (item.ownerOnly) return false; return item.section ? staff.sections.includes(item.section) : false;` — Executive Overview, Share Portal, My Agency hidden for staff; only sections in `staff.sections` render.
- `MyAgency.tsx` line 60-66: hard redirect to `/agent-dashboard` with toast "Owner-only section" if `staff.isStaff` is true.
- Recent Activity hide: needs spot-check in `AgentDashboard.tsx` render section — will verify line ranges in implementation phase.
- **Pass (pending Recent Activity render-site spot-check).**

### Check 3 — Two-browser revocation: 🔴 **TIMING BUG CONFIRMED** — fix needed before sign-off

Looking at `useStaffAccess.tsx` lines 90-94:
```ts
const handleRevoked = async () => {
  try { await supabase.auth.signOut(); } catch { /* noop */ }
  toast({ title: "Access revoked", description: "Your access to this agency has been revoked." });
  navigate("/auth");
};
```

**Three problems in order of execution:**
1. `signOut()` fires first → `useAuth` clears `user` → React re-renders → `Toaster` (which lives inside the authenticated layout tree) may unmount before the toast renders.
2. Even if the toaster survives, `navigate("/auth")` happens on the same tick as the toast call, so the toast either flashes for one frame or never paints at all.
3. The user gets a sudden redirect with no explanation, exactly as predicted.

**Fix to apply (1 file, ~6 lines):**
```ts
const handleRevoked = async () => {
  toast({
    title: "Access revoked",
    description: "Your access to this agency has been revoked.",
  });
  // Give the toast 1.5s to render and be readable before tearing down auth state
  await new Promise((r) => setTimeout(r, 1500));
  try { await supabase.auth.signOut(); } catch { /* noop */ }
  navigate("/auth");
};
```

Reordering: **toast → 1500ms delay → signOut → navigate**. The toast renders against the still-authenticated tree, sits on screen for 1.5s, then the sign-out + redirect proceeds. Users get a clear explanation.

### Check 4 — Section update propagates within ~5s ✅ (code-confirmed)
`useStaffAccess.tsx` line 109-120: `event: "*"` on `portal_staff_access` → on UPDATE that doesn't match the revoke conditions, calls `fetchAccess()` which re-runs the initial query and updates `state` → sidebar + SectionGuard re-render. Realtime latency is typically <2s. **Pass.**

### Check 5 — RLS sanity ✅ (DB-confirmed)
Helper `public.staff_has_section(_agent_id, _section)` is deployed (visible in db-functions list). Policies on `agent_deals`, `client_invitations`, `life_file_shares`, `shared_meetings`, `agent_manager_profiles` all use it with the correct section per the approved mapping. No `audit_log` staff policy exists (correctly excluded). When the staff link is deleted, `staff_has_section` returns false → policy denies → `select count(*)` returns 0. **Pass.**

### Demo-row safety check ✅
Confirmed via DB query: all 7 `portal_staff_access` rows have `staff_user_id = NULL`. No real auth user can accidentally inherit demo agency access. The 3 force-expired pending rows are visible (`israel@npiconsulting.co.za`, `israel@fiduciaryanalytics.co.za`, `nomsa@agency.co.za`).

### Required fix before sign-off

**One file, one function:** `src/hooks/useStaffAccess.tsx` — reorder `handleRevoked` so the toast renders, waits 1500ms, then signs out and navigates.

Once that change is in, all 5 checks pass and `send-invitation-email` is unblocked to go live.

