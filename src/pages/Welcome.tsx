import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Music2, Briefcase, Loader2, AlertTriangle } from "lucide-react";

type Choice = "athlete" | "artist" | "agent_manager" | null;

const Welcome = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [choice, setChoice] = useState<Choice>(null);
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [agentRole, setAgentRole] = useState<"athlete_agent" | "artist_manager">(
    "athlete_agent",
  );
  const [submitting, setSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [authLoading, user, navigate]);

  // Detect if this is an existing account that landed here because their
  // role was lost / never set (recovery mode). Heuristic: profile row exists
  // and was created more than 10 minutes ago. Brand-new signups will have a
  // very recent profile row (created by handle_new_user trigger).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("created_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled || !data?.created_at) return;
      const ageMs = Date.now() - new Date(data.created_at).getTime();
      if (ageMs > 10 * 60 * 1000) setIsRecovery(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSubmit = async () => {
    if (!user || !choice) return;
    setSubmitting(true);

    if (choice === "athlete" || choice === "artist") {
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
      return;
    }

    // Agent / Manager
    if (!companyName.trim()) {
      setSubmitting(false);
      toast({
        title: "Company name required",
        description: "Please enter your agency or company name.",
        variant: "destructive",
      });
      return;
    }
    const { error } = await supabase.from("agent_manager_profiles").insert({
      user_id: user.id,
      role: agentRole,
      company_name: companyName.trim(),
      phone: phone.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    window.location.replace("/agent-dashboard");
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
          <ChoiceCard
            active={choice === "agent_manager"}
            onClick={() => setChoice("agent_manager")}
            icon={<Briefcase className="w-7 h-7" />}
            title="Agent / Manager"
            description="Manage clients across athletes or artists."
          />
        </div>

        {choice === "agent_manager" && (
          <Card className="bg-card/95 backdrop-blur-sm border-gold/20 mb-6">
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label className="text-foreground">I primarily represent</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setAgentRole("athlete_agent")}
                    className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                      agentRole === "athlete_agent"
                        ? "border-gold bg-gold/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-gold/50"
                    }`}
                  >
                    Athletes
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgentRole("artist_manager")}
                    className={`rounded-lg border-2 p-3 text-sm font-medium transition-all ${
                      agentRole === "artist_manager"
                        ? "border-gold bg-gold/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-gold/50"
                    }`}
                  >
                    Artists
                  </button>
                </div>
              </div>
              <div>
                <Label htmlFor="company" className="text-foreground">Company / Agency name</Label>
                <Input
                  id="company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Roc Nation Sports SA"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-foreground">Phone (optional)</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+27..."
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>
        )}

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
