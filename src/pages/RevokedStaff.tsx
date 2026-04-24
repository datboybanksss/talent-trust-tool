import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

const RevokedStaff = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-6 text-center">
      <ShieldOff className="w-12 h-12 text-muted-foreground" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Access removed</h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          Your access to this agency portal has been removed. If you believe this is a mistake, please contact your agency directly.
        </p>
      </div>
      <Button variant="outline" onClick={signOut}>Sign Out</Button>
    </div>
  );
};

export default RevokedStaff;
