import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CurrentTierBadge from "@/components/subscription/CurrentTierBadge";

interface Props {
  agentUserId: string;
  memberSince: string;
}

const AgencyStatsRow = ({ agentUserId, memberSince }: Props) => {
  const [clientCount, setClientCount] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      // Dedupe key = client user_id. A client present in BOTH sources counts ONCE.
      const ids = new Set<string>();
      const [{ data: invites }, { data: shares }] = await Promise.all([
        supabase
          .from("client_invitations")
          .select("activated_user_id")
          .eq("agent_id", agentUserId)
          .eq("status", "activated")
          .not("activated_user_id", "is", null),
        supabase
          .from("life_file_shares")
          .select("owner_id")
          .eq("shared_with_user_id", agentUserId)
          .eq("status", "accepted"),
      ]);
      invites?.forEach((r) => r.activated_user_id && ids.add(r.activated_user_id));
      shares?.forEach((r) => r.owner_id && ids.add(r.owner_id));
      setClientCount(ids.size);
    };
    load();
  }, [agentUserId]);

  const memberDate = new Date(memberSince).toLocaleDateString("en-ZA", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Users className="w-3.5 h-3.5" /> Clients under management
          </div>
          <p className="font-display font-bold text-2xl">{clientCount ?? "—"}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <CalendarClock className="w-3.5 h-3.5" /> Member since
          </div>
          <p className="font-display font-bold text-base">{memberDate}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-5">
          <p className="text-xs text-muted-foreground mb-2">Subscription</p>
          <CurrentTierBadge tierType="agent" />
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyStatsRow;