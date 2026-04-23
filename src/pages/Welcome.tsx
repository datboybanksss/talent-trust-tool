import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Music2, Loader2, AlertTriangle } from "lucide-react";
import EmailVerificationGate from "@/components/auth/EmailVerificationGate";
import {
  useAccountState,
  dashboardForState,
} from "@/lib/accountState";

type Choice = "athlete" | "artist" | null;

const Welcome = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const account = useAccountState();
  const [choice, setChoice] = useState<Choice>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!user || !choice) return;
    setSubmitting(true);

    const { error } = await supabase
      .from("profiles")
      .update({ client_type: choice })
      .eq("user_id", user.id);
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    // Hard reload so route guards re-evaluate with the fresh profile.
    window.location.replace("/dashboard");
  };

  // Loading guard while we resolve auth + canonical state.
  if (authLoading || account.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Self-protection: route by canonical state. Only incomplete_* renders the page.
  if (!user || account.state === "unauthenticated") {
    return <Navigate to="/auth" replace />;
  }
  if (account.state === "unverified") {
    return <EmailVerificationGate />;
  }
  if (account.state === "pending_staff" && account.pendingStaffToken) {
    return <Navigate to={`/staff-activate/${account.pendingStaffToken}`} replace />;
  }
  const dashPath = account.state ? dashboardForState(account.state) : null;
  if (dashPath) {
    return <Navigate to={dashPath} replace />;
  }

  const isRecovery = account.state === "incomplete_existing";

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {isRecovery && (
          <div className="mb-6 rounded-lg border border-gold/40 bg-gold/10 p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-semibold text-foreground mb-1">
                Looks like your account isn&apos;t fully set up yet
              </div>
              <div className="text-muted-foreground">
                We couldn&apos;t find a role on your profile — this usually means
                setup was interrupted last time. Pick what describes you below to
                finish setting up. Your existing account, email, and any data are
                safe.
              </div>
            </div>
          </div>
        )}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            {isRecovery ? "Finish setting up your account" : "Welcome — let\u2019s set up your account"}
          </h1>
          <p className="text-muted-foreground">
            Choose what describes you best. You can&apos;t change this later from this screen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <ChoiceCard
            active={choice === "athlete"}
            onClick={() => setChoice("athlete")}
            icon={<Trophy className="w-7 h-7" />}
            title="Athlete"
            description="Track contracts, endorsements, and career income."
          />
          <ChoiceCard
            active={choice === "artist"}
            onClick={() => setChoice("artist")}
            icon={<Music2 className="w-7 h-7" />}
            title="Artist"
            description="Manage projects, royalties, and creative income."
          />
        </div>

        <div className="flex justify-center">
          <Button
            variant="gold"
            size="lg"
            disabled={!choice || submitting}
            onClick={handleSubmit}
            className="min-w-48"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
              </>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ChoiceCardProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const ChoiceCard = ({ active, onClick, icon, title, description }: ChoiceCardProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left rounded-xl border-2 p-5 transition-all bg-card/95 backdrop-blur-sm ${
      active
        ? "border-gold shadow-lg shadow-gold/20"
        : "border-border hover:border-gold/50"
    }`}
  >
    <div className={`mb-3 ${active ? "text-gold" : "text-muted-foreground"}`}>{icon}</div>
    <div className="font-semibold text-foreground mb-1">{title}</div>
    <div className="text-sm text-muted-foreground">{description}</div>
  </button>
);

export default Welcome;
