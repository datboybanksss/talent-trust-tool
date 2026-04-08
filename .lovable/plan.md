

## Task A3: Enforce Email Verification (with Existing User Alert)

### What
Block unverified users from accessing protected routes. Show a verification gate with a "Resend verification email" option. Additionally, display a prominent alert banner for existing users who haven't verified yet, warning them they may lose access.

### How

1. **Create `EmailVerificationGate` component** (`src/components/auth/EmailVerificationGate.tsx`)
   - Full-screen gate shown when `user.email_confirmed_at` is null
   - Displays a warning banner: "Action Required: Verify your email to keep access to your account. Unverified accounts may be restricted."
   - Personalised messaging for all user types (athletes, artists, agents, managers)
   - "Resend verification email" button calling `supabase.auth.resend({ type: 'signup', email })`
   - Cooldown timer to prevent spam clicks
   - "Sign out" button to switch accounts

2. **Update `ProtectedRoute`** (`src/components/ProtectedRoute.tsx`)
   - After confirming `user` exists, check `user.email_confirmed_at`
   - If null, render `EmailVerificationGate` instead of children

3. **Update sign-up success toast** (`src/pages/Auth.tsx`)
   - Improve message clarity: mention checking spam folder and that access requires verification

### Files
- `src/components/auth/EmailVerificationGate.tsx` — new
- `src/components/ProtectedRoute.tsx` — modified
- `src/pages/Auth.tsx` — minor toast text update

