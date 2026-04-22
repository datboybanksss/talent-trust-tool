

## Final hardened plan: identity-tied role resolution + first-load-only timeout

### 1. Hook changes — `src/hooks/useUserRole.tsx`

New shape:
```ts
{ role, loading, dashboardPath, timedOut }
```

Internal state:
- `resolvedForUserId: string | null`
- `timedOut: boolean`
- `hasEverResolvedRef = useRef(false)` — reset to `false` whenever `user?.id` changes

Loading derivation:
```ts
const loading = !!user && resolvedForUserId !== user.id && !timedOut;
```

`dashboardPath` is `null` whenever `loading` is true; otherwise `/admin | /agent-dashboard | /dashboard` based on resolved role.

Effect logic on every `user` change:
1. If `!user` → clear `role`, `resolvedForUserId`, `timedOut`, set `hasEverResolvedRef.current = false`, return.
2. If `user.id` differs from the previous run → reset `resolvedForUserId = null`, `timedOut = false`, `hasEverResolvedRef.current = false`.
3. Use a `cancelled` flag + a captured `currentUserId` so a stale async response from a previous user is dropped.
4. Run the existing role lookup chain (admin → agent → active staff → client_type → metadata fallback). On success, only commit if `!cancelled && currentUserId === user.id`, then `setResolvedForUserId(currentUserId)` and `hasEverResolvedRef.current = true`.
5. Start a 5s `setTimeout`. On fire, if still unresolved AND `!cancelled`:
   - **First-load failure** (`!hasEverResolvedRef.current`):
     - `console.error("[useUserRole] Role resolution timeout for user", user.id)`
     - `setTimedOut(true)`
     - Trigger sign-out + redirect (see effect 2 below)
   - **Mid-session re-resolution timeout** (`hasEverResolvedRef.current === true`):
     - `console.warn("[useUserRole] Role re-resolution timeout — falling back to cached role", user.id)`
     - Do NOT setTimedOut, do NOT sign out, keep last-known `role` and `resolvedForUserId` so consumers continue to see the cached role and `loading` stays false.
6. Cleanup: clear timeout, set `cancelled = true`.

Sign-out side-effect (separate effect inside hook, runs only when `timedOut === true`):
```ts
useEffect(() => {
  if (!timedOut) return;
  toast.error(
    "We couldn't determine your account type. Please sign in again.",
    { description: "Reference: role-resolution-timeout", duration: 8000 }
  );
  supabase.auth.signOut().finally(() => {
    window.location.replace("/auth");
  });
}, [timedOut]);
```
(`window.location.replace` instead of `useNavigate` so the hook doesn't require Router context for every consumer.)

### 2. Consumer changes

**`src/pages/AgentRegister.tsx`** — redirect effect becomes:
```ts
useEffect(() => {
  if (user && !roleLoading && dashboardPath) {
    navigate(dashboardPath, { replace: true });
  }
}, [user, roleLoading, dashboardPath, navigate]);
```

**`src/pages/Auth.tsx`** — identical guard with `&& dashboardPath` and `replace: true`.

**`src/components/AdminRoute.tsx`** and **`src/components/AgentRoute.tsx`** — no logic changes needed; they already gate render on `roleLoading`. Identity-tied `loading` from the hook makes their existing pattern race-free automatically. (Confirmed via re-read of both files in the codebase context above.)

No other call sites of `useUserRole` exist (`grep` of `src/**/*.{ts,tsx}` for `useUserRole(` returns exactly these four files). `ProtectedRoute.tsx`, `Dashboard.tsx`, `useAdminRole.tsx`, `useAgencyScope.tsx`, `useStaffAccess.tsx` do not consume it and are unaffected.

### 3. Files to edit

- `src/hooks/useUserRole.tsx`
- `src/pages/AgentRegister.tsx`
- `src/pages/Auth.tsx`

### 4. Verification — to run after implementation, results pasted into report-back

a–i. Role-switch transitions on one tab (Naledi → out → client → out → Naledi → out → owner → out → admin), watching for any flash of the wrong dashboard.
j. Hard-refresh while signed in as Naledi on `/agent-dashboard`.
k. Throttled network (Slow 3G) sign-in — confirm Loading screen, no premature redirect, eventual correct landing.
l. **Forced >5s hang via DevTools Request Blocking** of the `has_role` / `agent_manager_profiles` / `portal_staff_access` requests. Pasted observations in the report:
   - UI state during 0–5s
   - Exact toast copy + reference code
   - Console line: `[useUserRole] Role resolution timeout for user <uuid>`
   - Final route after sign-out

m. Mid-session re-resolution timeout (simulate by signing in successfully, then blocking requests and forcing a re-run) — confirm warning log fires, user is NOT signed out, cached role remains active.

### Report-back deliverables

- Adjusted timeout scope (first-load sign-out vs mid-session warning) — implemented as specified above
- Pasted scenario (l) observed output
- Results table for all 12 scenarios (a–l) plus mid-session test (m)
- Screenshot/transcript of the timeout toast with exact copy and reference code

