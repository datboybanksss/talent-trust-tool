import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import EmailVerificationGate from "@/components/auth/EmailVerificationGate";

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
  const { user, loading: authLoading } = useAuth();
  const { role, loading: roleLoading } = useUserRole();
  const staff = useStaffAccess();
  const location = useLocation();

  if (authLoading || roleLoading || staff.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/agent-register" replace state={{ from: location }} />;
  }

  if (!user.email_confirmed_at) {
    return <EmailVerificationGate />;
  }

  const isAllowed = role === "admin" || role === "agent" || staff.isStaff;
  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AgentRoute;
