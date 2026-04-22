

## Fix: Naledi (staff) being routed to `/dashboard` instead of `/agent-dashboard` after sign-in

### Root cause

A race condition in `src/hooks/useUserRole.tsx`. When the user signs in on `/agent-register`:

1. Initially `user = null`, the hook sets `role = null` and `loading = false`.
2. After sign-in, `user` becomes defined and the effect re-runs — but the hook **never resets `loading` back to `true`** at the start of the new run. So for a brief moment `roleLoading = false` while `role` is still the stale `null` from step 1.
3. The `useEffect` in `AgentRegister.tsx` (line 64) sees `user && !roleLoading` and immediately navigates to `dashboardPath`, which falls through the `switch` default to `/dashboard` because `role` is still `null`.
4. The hard-coded `navigate("/agent-dashboard")` on line 84 in `handleSignIn` runs first, but the auto-redirect effect then overrides it once `dashboardPath` recomputes to `/dashboard`.

That's why Naledi (a valid active staff member with `client_type = NULL`, confirmed in DB) lands on the client dashboard instead of the agent workspace.

### Fix

**`src/hooks/useUserRole.tsx`** — reset `loading` to `true` at the start of every effect run so consumers wait for the real role:

```ts
useEffect(() => {
  if (!user) {
    setRole(null);
    setLoading(false);
    return;
  }
  setLoading(true);   // ← add this line
  setRole(null);      // ← clear stale role too
  determine();
}, [user]);
```

**`src/pages/AgentRegister.tsx`** — remove the redundant hard-coded `navigate("/agent-dashboard")` on line 84 in `handleSignIn`. The `useEffect` on line 64 will route correctly once `useUserRole` returns the real role (`staff` → `/agent-dashboard`).

**`src/pages/Auth.tsx`** — apply the same cleanup if it has a hard-coded post-sign-in navigate (it relies only on the effect, so likely no change needed; will verify and only adjust if a similar hard-coded navigate exists).

### Verification

1. Sign out, then sign in as Naledi (`naledintsane01@gmail.com`) on `/agent-register` → should land on `/agent-dashboard` (staff workspace with The Agency, Share Portal, etc.).
2. Sign in as Kgosi (owner) → still lands on `/agent-dashboard`.
3. Sign in as a regular client user on `/auth` → still lands on `/dashboard`.
4. Sign in as admin → still lands on `/admin`.

