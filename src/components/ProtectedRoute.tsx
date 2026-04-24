import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import EmailVerificationGate from "@/components/auth/EmailVerificationGate";
import { useAccountSetupGate } from "@/hooks/useAccountSetupGate";
import { Button } from "@/components/ui/button";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();
  const gate = useAccountSetupGate();

  if (loading) {
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

  if (gate.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (gate.errored) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="font-medium text-destructive">We couldn't load your account.</p>
        <p className="text-sm text-muted-foreground">{gate.errorMessage ?? "Failed to load account data."}</p>
        {gate.errorCode && <p className="text-xs text-muted-foreground font-mono">Code: {gate.errorCode}</p>}
        <div className="flex gap-2">
          <Button onClick={() => window.location.reload()}>Retry</Button>
          <Button variant="outline" onClick={signOut}>Sign Out</Button>
        </div>
      </div>
    );
  }

  if (gate.redirectTo && gate.redirectTo !== location.pathname) {
    return <Navigate to={gate.redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
