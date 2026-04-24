import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import EmailVerificationGate from "@/components/auth/EmailVerificationGate";
import { Button } from "@/components/ui/button";

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const { user, loading: authLoading, signOut } = useAuth();
  const { role, loading: roleLoading, errored: roleErrored } = useUserRole();
  const location = useLocation();

  if (authLoading || roleLoading) {
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

  if (roleErrored) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-medium text-destructive">We couldn't load your account.</p>
        <p className="text-sm text-muted-foreground">Failed to load account data.</p>
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()}>Retry</Button>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>
      </div>
    );
  }

  if (role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
