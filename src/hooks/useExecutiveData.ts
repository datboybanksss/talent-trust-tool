import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface LiveInvitation {
  id: string;
  client_name: string;
  client_type: string;
  status: string;
  archived_at: string | null;
  created_at: string;
  pre_populated_data: Record<string, unknown> | null;
}

export interface LiveDeal {
  id: string;
  client_name: string;
  client_type: string;
  brand: string;
  deal_type: string;
  status: string;
  value_amount: number | null;
  value_text: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

export interface ExecutiveDataset {
  invitations: LiveInvitation[];
  deals: LiveDeal[];
}

export const useExecutiveData = () => {
  const { user } = useAuth();

  return useQuery<ExecutiveDataset>({
    queryKey: ["executive-data", user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<ExecutiveDataset> => {
      if (!user?.id) return { invitations: [], deals: [] };

      const [invRes, dealRes] = await Promise.all([
        supabase
          .from("client_invitations")
          .select("id, client_name, client_type, status, archived_at, created_at, pre_populated_data")
          .eq("agent_id", user.id),
        supabase
          .from("agent_deals")
          .select("id, client_name, client_type, brand, deal_type, status, value_amount, value_text, start_date, end_date, created_at")
          .eq("agent_id", user.id),
      ]);

      return {
        invitations: (invRes.data ?? []) as LiveInvitation[],
        deals: (dealRes.data ?? []) as LiveDeal[],
      };
    },
  });
};