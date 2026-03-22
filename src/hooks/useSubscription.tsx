import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type ClientTier = "starter" | "pro" | "elite" | "legacy";
export type AgentTier = "solo_agent" | "agency" | "association";
export type TierType = "client" | "agent";

export interface Subscription {
  id: string;
  user_id: string;
  tier_type: TierType;
  tier_name: string;
  status: string;
  trial_ends_at: string | null;
  started_at: string;
}

export const CLIENT_TIERS: Record<ClientTier, { label: string; priceZAR: number; order: number }> = {
  starter: { label: "Starter", priceZAR: 0, order: 0 },
  pro: { label: "Pro", priceZAR: 499, order: 1 },
  elite: { label: "Elite", priceZAR: 1499, order: 2 },
  legacy: { label: "Legacy", priceZAR: 4999, order: 3 },
};

export const AGENT_TIERS: Record<AgentTier, { label: string; priceZAR: number; order: number; clientLimit: string }> = {
  solo_agent: { label: "Solo Agent", priceZAR: 799, order: 0, clientLimit: "Up to 10 clients" },
  agency: { label: "Agency", priceZAR: 2499, order: 1, clientLimit: "Up to 50 clients" },
  association: { label: "Association / Guild", priceZAR: 7999, order: 2, clientLimit: "Unlimited members" },
};

export const useSubscription = (tierType: TierType = "client") => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    if (!user) { setSubscription(null); setLoading(false); return; }
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("tier_type", tierType)
      .maybeSingle();

    if (!error && data) {
      setSubscription(data as Subscription);
    }
    setLoading(false);
  }, [user, tierType]);

  useEffect(() => { fetchSubscription(); }, [fetchSubscription]);

  const upgradeTier = async (newTier: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    // Check if subscription exists
    if (subscription) {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ tier_name: newTier, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("tier_type", tierType);
      if (!error) {
        setSubscription(prev => prev ? { ...prev, tier_name: newTier } : prev);
      }
      return { error };
    } else {
      // Create subscription (e.g., agent creating their first agent sub)
      const trialEnd = new Date();
      trialEnd.setMonth(trialEnd.getMonth() + 2);
      const { error } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: user.id,
          tier_type: tierType,
          tier_name: newTier,
          status: "trial",
          trial_ends_at: trialEnd.toISOString(),
        });
      if (!error) {
        await fetchSubscription();
      }
      return { error };
    }
  };

  const currentTier = subscription?.tier_name || (tierType === "client" ? "starter" : null);
  const isTrialing = subscription?.status === "trial" && subscription?.trial_ends_at
    ? new Date(subscription.trial_ends_at) > new Date()
    : false;

  const canUpgradeTo = (targetTier: string): boolean => {
    if (!currentTier) return true;
    const tiers = tierType === "client" ? CLIENT_TIERS : AGENT_TIERS;
    const current = (tiers as any)[currentTier];
    const target = (tiers as any)[targetTier];
    return target && current ? target.order > current.order : false;
  };

  return { subscription, loading, currentTier, isTrialing, upgradeTier, canUpgradeTo, refetch: fetchSubscription };
};
