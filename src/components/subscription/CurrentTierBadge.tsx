import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Star, Rocket, ArrowUp } from "lucide-react";
import { useSubscription, CLIENT_TIERS, AGENT_TIERS, TierType } from "@/hooks/useSubscription";
import UpgradeTierDialog from "./UpgradeTierDialog";
import { cn } from "@/lib/utils";

interface CurrentTierBadgeProps {
  tierType?: TierType;
  showUpgrade?: boolean;
  className?: string;
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

const tierColors: Record<string, string> = {
  starter: "bg-muted text-muted-foreground",
  pro: "bg-primary/10 text-primary border-primary/30",
  elite: "bg-accent/10 text-accent-foreground border-accent/30",
  legacy: "bg-gold/10 text-gold border-gold/30",
  solo_agent: "bg-primary/10 text-primary border-primary/30",
  agency: "bg-accent/10 text-accent-foreground border-accent/30",
  association: "bg-gold/10 text-gold border-gold/30",
};

const CurrentTierBadge = ({ tierType = "client", showUpgrade = true, className }: CurrentTierBadgeProps) => {
  const { currentTier, loading, isTrialing } = useSubscription(tierType);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (loading || !currentTier) return null;

  const tiers = tierType === "client" ? CLIENT_TIERS : AGENT_TIERS;
  const tierInfo = (tiers as any)[currentTier];
  const Icon = tierIcons[currentTier] || Zap;
  const colorClass = tierColors[currentTier] || "";
  const isTopTier = tierType === "client" ? currentTier === "legacy" : currentTier === "association";

  return (
    <>
      <div className={cn("flex items-center gap-2", className)}>
        <Badge variant="outline" className={cn("flex items-center gap-1.5 px-3 py-1", colorClass)}>
          <Icon className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{tierInfo?.label || currentTier}</span>
          {isTrialing && <span className="text-[10px] opacity-70">(Trial)</span>}
        </Badge>
        {showUpgrade && !isTopTier && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-primary hover:text-primary"
            onClick={() => setUpgradeOpen(true)}
          >
            <ArrowUp className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        )}
      </div>
      <UpgradeTierDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} tierType={tierType} />
    </>
  );
};

export default CurrentTierBadge;
