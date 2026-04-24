import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import EmailVerificationGate from "@/components/auth/EmailVerificationGate";
import { useAccountSetupGate } from "@/hooks/useAccountSetupGate";
import { Button } from "@/components/ui/button";

interface AgentRouteProps {
  children: React.ReactNode;
}

/**
 * Access precedence for /agent-dashboard:
 *   1. admin role  → always allowed
 *   2. agent role  → always allowed
 *   3. active staff member of an agency → allowed (view-only via OwnerOnly wrappers)
 *   4. anyone else → redirected to /dashboard
 *
 * If a user happens to have BOTH an admin role AND an active staff row for
 * another agency, admin wins (precedence #1). They view the dashboard as
 * themselves, not as that agency's staff.
 */
const AgentRoute = ({ children }: AgentRouteProps) => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, loading: roleLoading, errored: roleErrored } = useUserRole();
  const staff = useStaffAccess();
  const location = useLocation();
  const gate = useAccountSetupGate();

  if (authLoading || roleLoading || staff.loading || gate.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!user.email_confirmed_at) {
    return <EmailVerificationGate />;
  }

  if (gate.errored || staff.errored || roleErrored) {
    const message = gate.errored
      ? (gate.errorMessage ?? "Failed to load account data.")
      : "Failed to load account data.";
    const code = gate.errored ? gate.errorCode : null;
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-medium text-destructive">We couldn't load your account.</p>
        <p className="text-sm text-muted-foreground">{message}</p>
        {code && <p className="text-xs text-muted-foreground font-mono">Code: {code}</p>}
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()}>Retry</Button>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>
      </div>
    );
  }

  // Setup gate (pending staff → /staff-activate, no role → /welcome) takes
  // precedence over the agent-allow check, so users finish setup first.
  if (gate.redirectTo && gate.redirectTo !== location.pathname) {
    return <Navigate to={gate.redirectTo} replace />;
  }

  const isAllowed = role === "admin" || role === "agent" || staff.isStaff;
  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AgentRoute;
