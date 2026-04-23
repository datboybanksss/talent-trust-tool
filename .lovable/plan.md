

## Stop existing users being stranded on `/welcome`

### Problem
`/welcome` currently renders for any signed-in user. The recovery heuristic (`profile.created_at > 10 minutes`) only swaps copy — it does not gate access. Combined with role/setup logic split across `useAccountSetupGate` and `useUserRole`, fully set-up users can land on `/welcome` and stay there.

### Goal
Make `/welcome` a true setup-and-repair route. Users with valid roles must never remain on it. All routing decisions must come from one canonical source of truth.

---

### 1. Canonical account-state resolver (new)
Create `src/lib/accountState.ts` exporting one function that returns a deterministic state for the current user:

```text
unauthenticated
unverified
pending_staff
admin
agent
staff
athlete
artist
incomplete_new        // no role + no profile row yet OR very fresh signup
incomplete_existing   // no role but profile already exists (legacy account)
```

Resolution order (first match wins):
1. no `user` → `unauthenticated`
2. no `email_confirmed_at` → `unverified`
3. unaccepted `portal_staff_access` row → `pending_staff`
4. `has_role(user, 'admin')` → `admin`
5. `agent_manager_profiles` row exists → `agent`
6. active accepted `portal_staff_access` row → `staff`
7. `profiles.client_type = 'athlete'` → `athlete`
8. `profiles.client_type = 'artist'` → `artist`
9. profile row exists, no role → `incomplete_existing`
10. otherwise → `incomplete_new`

Sources used: `has_role` RPC, `agent_manager_profiles`, `portal_staff_access`, `profiles.client_type`. `auth.user_metadata.client_type` is consulted only for self-heal (see step 5), not for the canonical state.

A small `useAccountState()` hook wraps it with `{ state, loading }` and identity-tied caching (same pattern `useUserRole` uses today).

### 2. Make `/welcome` self-protecting
Update `src/pages/Welcome.tsx`:
- On mount, read canonical state.
- If state is `admin` → `Navigate` to `/admin`.
- `agent` or `staff` → `/agent-dashboard`.
- `athlete` or `artist` → `/dashboard`.
- `pending_staff` → `/staff-activate/:token`.
- `unauthenticated` → `/auth`.
- `unverified` → render `EmailVerificationGate`.
- `incomplete_new` → render standard onboarding copy + 3 role cards.
- `incomplete_existing` → render recovery banner + 3 role cards.

Drop the `created_at > 10 min` heuristic entirely.

### 3. Refactor `useAccountSetupGate`
- Replace its internal queries with the canonical resolver.
- Keep the existing **agent self-heal** step (auto-insert `agent_manager_profiles` from metadata when `client_type ∈ {athlete_agent, artist_manager}`) — run it before computing final state so self-healed users never appear `incomplete_*`.
- Return `redirectTo`:
  - `pending_staff` → `/staff-activate/:token`
  - `incomplete_new` or `incomplete_existing` → `/welcome`
  - otherwise → `null`

### 4. Refactor `useUserRole`
- Make it a thin adapter over the canonical resolver.
- Map canonical state → `UserRole` (`admin`, `agent`, `staff`, `athlete`, `artist`, `user`/`null` for incomplete).
- Keep the existing first-load timeout sign-out behavior.
- `dashboardPath` keeps current mapping (`admin → /admin`, `agent`/`staff → /agent-dashboard`, else `/dashboard`).

### 5. Align `ProtectedRoute` and `AgentRoute`
No structural change — both already delegate to `useAccountSetupGate`. They automatically benefit from the unified resolver. Verify:
- `ProtectedRoute`: redirects only when `gate.redirectTo` is set.
- `AgentRoute`: precedence stays `admin > agent > staff`, then setup gate, then allow check.

### 6. Tighten `/auth` post-login redirect
In `src/pages/Auth.tsx`:
- After successful sign-in, await canonical state (do not redirect on stale `null`).
- Route by final state:
  - `admin` → `/admin`
  - `agent` / `staff` → `/agent-dashboard`
  - `athlete` / `artist` → `/dashboard`
  - `pending_staff` → `/staff-activate/:token`
  - `incomplete_new` / `incomplete_existing` → `/welcome`

This eliminates the "flash to /welcome" race for fully set-up users.

### 7. Preserve recovery flow
On `/welcome` for `incomplete_existing`:
- Keep the recovery banner copy ("Your account isn't fully set up").
- Keep the 3-card picker.
- Repair actions stay as-is:
  - Athlete/Artist → update `profiles.client_type`.
  - Agent/Manager → upsert `agent_manager_profiles` (with `onConflict: 'user_id'`).
- After repair, route by the freshly-resolved state.

---

### Files touched
- `src/lib/accountState.ts` — new canonical resolver + `useAccountState` hook
- `src/pages/Welcome.tsx` — self-guarding redirects, drop time heuristic, two-mode rendering
- `src/hooks/useAccountSetupGate.tsx` — consume resolver, keep self-heal
- `src/hooks/useUserRole.tsx` — adapter over resolver
- `src/pages/Auth.tsx` — wait for canonical state before navigating
- `src/components/ProtectedRoute.tsx` — verify behavior, no logic change expected
- `src/components/AgentRoute.tsx` — verify behavior, no logic change expected

### Behavior contract

| User type | Sign in lands on | Visiting `/welcome` directly |
|---|---|---|
| Admin | `/admin` | redirected to `/admin` |
| Agent / manager | `/agent-dashboard` | redirected to `/agent-dashboard` |
| Active staff | `/agent-dashboard` | redirected to `/agent-dashboard` |
| Athlete | `/dashboard` | redirected to `/dashboard` |
| Artist | `/dashboard` | redirected to `/dashboard` |
| Pending staff | `/staff-activate/:token` | redirected to activation |
| Incomplete legacy (no role, profile exists) | `/welcome` recovery copy | stays on `/welcome` |
| Brand-new signup | `/welcome` standard copy | stays on `/welcome` |

### Validation
1. Sign in as the account that prompted this complaint → lands on its real dashboard, not `/welcome`.
2. While signed in with a role, type `/welcome` in the URL → instant redirect away.
3. Athlete (`client_type='athlete'`) → `/dashboard`; visiting `/welcome` redirects.
4. Artist (`client_type='artist'`) → `/dashboard`; visiting `/welcome` redirects.
5. Agent with `agent_manager_profiles` row → `/agent-dashboard`; visiting `/welcome` redirects.
6. Active staff → `/agent-dashboard`; visiting `/welcome` redirects.
7. Pending staff → `/staff-activate/:token` first.
8. Legacy account with no role → `/welcome` with recovery copy; picking a role repairs and routes.
9. Brand-new signup → `/welcome` with standard copy; picking a role completes setup.
10. Old `/agent-register` bookmarks still redirect to `/auth` (already in place).

### Implementation guardrails
- Page copy logic must never double as access control.
- `created_at` must not influence whether `/welcome` renders.
- Role logic lives in exactly one place after this change (`accountState.ts`).
- Agent self-heal still runs before any "incomplete" verdict.
- `pending_staff` precedence is preserved above all dashboard routing.

