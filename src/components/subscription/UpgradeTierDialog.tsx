import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star, Rocket } from "lucide-react";
import { useSubscription, CLIENT_TIERS, AGENT_TIERS, ClientTier, AgentTier, TierType } from "@/hooks/useSubscription";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UpgradeTierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tierType?: TierType;
}

const tierIcons: Record<string, any> = {
  starter: Zap,
  pro: Star,
  elite: Crown,
  legacy: Rocket,
  solo_agent: Zap,
  agency: Star,
  association: Crown,
};

const clientFeatures: Record<ClientTier, string[]> = {
  starter: ["Basic dashboard", "1 Life File document", "Community access"],
  pro: ["Contract Manager", "Endorsement Tracker", "Monthly Budget", "Email reminders"],
  elite: ["Investment tracking", "Social media vault", "Advisor panel", "Priority support"],
  legacy: ["White-glove concierge", "Legacy planning", "Family office tools", "Dedicated advisor"],
};

const agentFeatures: Record<AgentTier, string[]> = {
  solo_agent: ["Up to 10 clients", "Client profiles", "Document vault", "Basic reporting"],
  agency: ["Up to 50 clients", "Staff portals", "Deal pipeline", "Advanced reporting", "Client comparison"],
  association: ["Unlimited members", "White-label portal", "API access", "Custom branding", "Bulk onboarding"],
};

const UpgradeTierDialog = ({ open, onOpenChange, tierType = "client" }: UpgradeTierDialogProps) => {
  const { currentTier, canUpgradeTo, upgradeTier, isTrialing } = useSubscription(tierType);
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState<string | null>(null);

  const tiers = tierType === "client" ? CLIENT_TIERS : AGENT_TIERS;
  const features = tierType === "client" ? clientFeatures : agentFeatures;

  const handleUpgrade = async (tierName: string) => {
    setUpgrading(tierName);
    const { error } = await upgradeTier(tierName);
    setUpgrading(null);
    if (error) {
      toast({ title: "Upgrade failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tier upgraded!", description: `You are now on the ${(tiers as any)[tierName].label} plan.` });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {tierType === "client" ? "Upgrade Your Plan" : "Upgrade Agent Plan"}
          </DialogTitle>
          <DialogDescription>
            {isTrialing
              ? "You're currently on a free trial. Choose a plan to continue after your trial ends."
              : "Select a plan that fits your needs. Upgrade anytime."}
          </DialogDescription>
        </DialogHeader>

        <div className={cn(
          "grid gap-4 mt-4",
          tierType === "client" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3"
        )}>
          {Object.entries(tiers).map(([key, tier]) => {
            const Icon = tierIcons[key] || Zap;
            const isCurrent = currentTier === key;
            const canUpgrade = canUpgradeTo(key);
            const tierFeatures = (features as any)[key] || [];

            return (
              <div
                key={key}
                className={cn(
                  "rounded-xl border p-4 flex flex-col gap-3 transition-all",
                  isCurrent
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : canUpgrade
                    ? "border-border hover:border-primary/40 hover:shadow-md"
                    : "border-border opacity-60"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn("w-5 h-5", isCurrent ? "text-primary" : "text-muted-foreground")} />
                    <span className="font-semibold text-sm">{tier.label}</span>
                  </div>
                  {isCurrent && (
                    <Badge variant="outline" className="text-xs border-primary text-primary">
                      Current
                    </Badge>
                  )}
                </div>

                <div className="text-2xl font-bold">
                  {tier.priceZAR === 0 ? "Free" : `R${tier.priceZAR.toLocaleString()}`}
                  {tier.priceZAR > 0 && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </div>

                {"clientLimit" in tier && (
                  <p className="text-xs text-muted-foreground">{(tier as any).clientLimit}</p>
                )}

                <ul className="space-y-1.5 flex-1">
                  {tierFeatures.map((f: string) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <Button variant="outline" size="sm" disabled className="w-full">
                    Current Plan
                  </Button>
                ) : canUpgrade ? (
                  <Button
                    variant="gold"
                    size="sm"
                    className="w-full"
                    disabled={upgrading === key}
                    onClick={() => handleUpgrade(key)}
                  >
                    {upgrading === key ? "Upgrading..." : "Upgrade"}
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" disabled className="w-full text-xs">
                    Included in current
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeTierDialog;
