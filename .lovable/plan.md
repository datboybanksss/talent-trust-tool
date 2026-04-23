

## Collapse `/agent-register` into `/auth` + safety net for existing role-less accounts

One door for everyone. New users pick a role on `/welcome`. Existing users go straight to their dashboard. **Existing accounts that are stuck without a role get caught and routed to a friendly recovery screen instead of a broken page.**

### User flows

**Existing user with a role** (admin, agent, staff, athlete, artist) — signs in at `/auth` → straight to their dashboard. Never sees `/welcome`.

**Brand-new user** (email or Google) — signs up at `/auth` → email verify if needed → `/welcome` shows the role picker (Athlete / Artist / Agent-Manager) → routed to their dashboard.

**Existing user with NO role** (the safety-net case — signed up before, never finished, or hit an error) — signs in at `/auth` → `useAccountSetupGate` detects no role anywhere → routed to `/welcome` which now opens in a **"Recovery" mode** showing:

> **"Looks like your account isn't fully set up yet"**
> *We couldn't find a role on your profile. This usually means setup was interrupted last time. Pick what describes you to finish setting up — your existing account, email, and any data are safe.*
> [Athlete] [Artist] [Agent / Manager]

Same three cards as the new-user flow, but with recovery copy at the top so they understand why they're seeing this and that nothing is broken. Picking a card writes the role to their existing account (no new signup) and routes them in.

### What changes

**1. `src/pages/Auth.tsx` — single entry point**
- Header copy: "Welcome to Life File" / "Sign in or create your account".
- Sign In tab: unchanged (email + password + Google + forgot password).
- Sign Up tab: simplified to Display Name, Email, Password, Confirm Password, Google. **Role picker removed** — that decision moves to `/welcome` for both email and Google signups so the experience is consistent.
- Agent/Manager-specific fields (Company, Registration Number, Phone, POPIA disclaimer) move out of `/auth` entirely and into `/welcome`'s Agent/Manager flow.

**2. `src/pages/Welcome.tsx` — extended for three cards + recovery mode + agency form**
- Add a third card: **Agent / Manager** (briefcase icon, "Manage clients across athletes or artists").
- **Recovery banner**: on mount, check if the user is an existing account that lacks a role. If `profiles.created_at` is older than ~10 minutes AND there's no `client_type`, no `agent_manager_profiles` row, no admin role, and no active staff row, show the recovery copy at the top of the page. Otherwise, show the standard "Welcome — let's set up your account" copy from your screenshot. Same three cards either way.
- Athlete / Artist cards: one click → write `client_type` to `profiles` (insert if missing, update if present) → route to `/dashboard`.
- Agent / Manager card: clicking it (then Continue) reveals an inline mini-form on the same page: Company / Agency Name (required), Athletes' Agent vs Artists' Manager sub-toggle, Registration Number (optional), Phone (optional), POPIA disclaimer. Submit writes `auth.user_metadata` (`client_type`, `company_name`, `registration_number`, `phone`) and the existing `useAccountSetupGate` self-heal creates the `agent_manager_profiles` row → routes to `/agent-dashboard`. This is the same backend path `AgentRegister` uses today, so no DB schema changes.

**3. `src/hooks/useAccountSetupGate.tsx` — already handles the recovery case correctly**
- Existing logic: if no admin role, no `agent_manager_profiles` row, no active staff row, and no `profiles.client_type` → redirect to `/welcome`. This already catches stuck existing accounts. We're just making the `/welcome` page friendlier when they land there. Update the bypass-route doc comment to drop `/agent-register`. No logic change.

**4. `src/components/AgentRoute.tsx`**
- Line 39: change unauthenticated redirect from `/agent-register` to `/auth`.

**5. `src/App.tsx`**
- Remove `AgentRegister` import.
- Replace the `/agent-register` route with `<Navigate to="/auth" replace />` so old links and bookmarks still work.

**6. Public CTA links → `/auth`**
- `src/pages/Landing.tsx` lines 136, 564, 570, 1118.
- `src/pages/Pricing.tsx` line 500.

**7. Delete `src/pages/AgentRegister.tsx`**

### Why no existing accounts will have a broken journey

```text
Sign in → AgentRoute / ProtectedRoute → useAccountSetupGate runs
                                                │
                  ┌─────────────────────────────┼─────────────────────────────┐
                  ▼                             ▼                             ▼
         Has role / client_type        No role anywhere                 Pending staff
                  │                             │                             │
                  ▼                             ▼                             ▼
            Their dashboard           /welcome (RECOVERY MODE)         /staff-activate
                                       "Account isn't set up yet"
                                       Pick role → routed in
```

`useAccountSetupGate` already reads from all four sources (`user_roles` admin, `agent_manager_profiles`, `portal_staff_access`, `profiles.client_type`). Any pre-existing role-less account is automatically caught on next sign-in and shown the recovery picker — no manual data fix needed for those users.

### Files modified

1. `src/pages/Auth.tsx` (simplify sign-up, drop role picker, update header)
2. `src/pages/Welcome.tsx` (three cards, recovery-mode copy, inline agency form)
3. `src/App.tsx` (redirect old `/agent-register` route)
4. `src/components/AgentRoute.tsx` (redirect target → `/auth`)
5. `src/components/ProtectedRoute.tsx` (verify unauthenticated redirect target → `/auth`)
6. `src/pages/Landing.tsx` (4 CTA links → `/auth`)
7. `src/pages/Pricing.tsx` (1 CTA link → `/auth`)
8. `src/hooks/useAccountSetupGate.tsx` (comment only)
9. `src/pages/AgentRegister.tsx` — **deleted**

### Out of scope

No database changes, no edge function changes, no auth changes, no changes to `useUserRole` or `useAuth`. Reset password flow, email verification gate, Google OAuth wiring all unchanged.

### Report-back checklist after implementation

1. Files modified (list above).
2. `/agent-register` → redirects to `/auth` (no 404 on bookmarks).
3. Sign In on `/auth` for an existing agent / athlete / artist / staff / admin → straight to correct dashboard, never sees `/welcome`.
4. Brand-new email signup → verify → sign in → `/welcome` standard copy + 3 cards.
5. Brand-new Google signup → consent → `/welcome` standard copy + 3 cards.
6. Existing role-less account → sign in → `/welcome` **recovery copy** + 3 cards → picking one completes setup and routes them in.
7. Picking Agent/Manager on `/welcome` → reveals agency form → submit creates `agent_manager_profiles` row → lands on `/agent-dashboard`.

