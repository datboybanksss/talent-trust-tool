

## Sprint Scope: Routing Fix + Staff Context Banner

Ship the routing bug fix and one persona-clarity banner. Defer the dedicated `/staff` dashboard until real PAs have used the platform.

### The Bug

Staff sign in via `/auth` and land on `/dashboard` (the client portal — "Welcome back, naledi · Member"). Root cause: `useUserRole.tsx` checks admin → agent → client_type, but never checks `portal_staff_access`. So `dashboardPath` resolves to `/dashboard` for staff, shipping them to the wrong portal entirely. Last sprint's fixes only kicked in *after* they reached `/agent-dashboard` — but nothing was sending them there.

### Files Changed

**Edit `src/hooks/useUserRole.tsx`**
- Add `"staff"` to `UserRole` union.
- After the agent-profile check (and before client_type fallback), query `portal_staff_access` for an active row with non-null `confidentiality_accepted_at` for `user.id`. If found → `role = "staff"`.
- Update `dashboardPath`: staff → `/agent-dashboard` (NOT `/staff` — that route does not exist this sprint).
- Precedence stays: admin > agent > staff > client.

**Verify `src/components/AgentRoute.tsx`** (no edit expected)
- Last sprint already allows `staff.isStaff`. Confirm `naledi` passes the gate after the `useUserRole` change routes her here.

**Edit `src/pages/Dashboard.tsx`**
- Add an early guard: if `useAgencyScope().isViewingAsStaff === true`, `<Navigate to="/agent-dashboard" replace />`. Prevents staff from manually typing `/dashboard` into the URL bar to escape into the client portal.

**Verify `src/pages/StaffActivate.tsx`** (no edit expected)
- Post-confidentiality redirect already targets `/agent-dashboard`. Confirm.

**Create `src/components/agent/StaffContextBanner.tsx`**
- Renders only when `useAgencyScope().isViewingAsStaff === true`.
- Copy: *"You're assisting {agencyOwnerName} from {agencyName}. View-only access."*
- Needs the agency owner's display name — extend `useStaffAccess` to also fetch `display_name` from the owner's `profiles` row (one extra select alongside the existing `agent_manager_profiles` query). Surface as `agencyOwnerName` on `useAgencyScope`.
- Small `×` dismiss button → sets `sessionStorage["staff-banner-dismissed"] = "1"`. Cleared automatically on sign-out (sessionStorage dies with the tab; also explicitly clear it inside `signOut` in `useAuth.tsx` for safety).
- Visual: amber/gold tinted strip at the very top of the page content, inside the main column, above the page header. Coexists with the existing sidebar footer badge — redundancy is intentional.

**Edit `src/pages/AgentDashboard.tsx`** + **`src/pages/MyAgency.tsx`** + **`src/pages/AgentClientDetail.tsx`** + **`src/pages/AgentAthleteProfile.tsx`**
- Mount `<StaffContextBanner />` as the first child of the main content area on every page reachable inside `AgentRoute`. The banner self-hides for non-staff so it's a no-op for owners and admins.
- (`MyAgency` is already owner-only; banner there is dead code but harmless — staff get redirected before render.)

**Edit `src/hooks/useAuth.tsx`**
- In the `signOut` flow, `sessionStorage.removeItem("staff-banner-dismissed")` so a fresh sign-in always re-shows the banner.

**Edit `KNOWN_LIMITATIONS.md`** — append:
> ## Dedicated staff dashboard deferred
> Staff currently use `/agent-dashboard` with view-only scoping (`useAgencyScope` + `<OwnerOnly>`) and a persistent `<StaffContextBanner>`. A dedicated `/staff` route with PA-specific layout (Today's Schedule, Action Queue, agency-owner framing, slimmer sidebar) was designed but deferred pending real-user feedback. Build after first 2–3 real PAs have used the platform for at least a week each — design from observed behaviour, not speculation.

### Verification After Ship

1. Sign in as `naledi` → lands on `/agent-dashboard` (not `/dashboard`, not `/staff`).
2. Amber banner at top of every agent-portal page reads *"You're assisting {Owner Name} from {Agency}. View-only access."*
3. Click `×` → banner gone for the rest of the session, persists across navigation.
4. Sign out, sign back in → banner reappears.
5. Direct visit to `/dashboard` as `naledi` → instant redirect to `/agent-dashboard`.
6. Sign in as the agency owner → no banner. Sign in as admin → routes to `/admin`, no banner.
7. Last sprint's behavior intact: data scoped to agency, write buttons hidden, sidebar footer badge present, revocation Realtime still fires.

### Explicitly NOT Building This Sprint

`/staff` route, `StaffDashboard`, `StaffRoute`, `StaffHeader`, `StaffStatsRow`, `TodayScheduleCard`, `ActionQueueCard`, `QuickAccessTiles`, `StaffSidebar`. Logged in `KNOWN_LIMITATIONS.md` for the post-dogfood revisit.

