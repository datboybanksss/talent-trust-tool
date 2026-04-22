import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, CalendarClock, Pencil, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CurrentTierBadge from "@/components/subscription/CurrentTierBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { clientTypeValues } from "@/data/executiveMockData";

interface Props {
  agentUserId: string;
  memberSince: string;
}

const STORAGE_KEY = "myagency:clientCountOverride";

const AgencyStatsRow = ({ agentUserId, memberSince }: Props) => {
  // Default = total clients from Executive Overview dataset (sum of client-type counts)
  const executiveTotal = useMemo(
    () => clientTypeValues.reduce((sum, c) => sum + c.count, 0),
    []
  );
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [override, setOverride] = useState<number | null>(() => {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

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
      setLiveCount(ids.size);
    };
    load();
  }, [agentUserId]);

  // Display: manual override > real count if > 0 > executive overview default
  const displayCount = override ?? (liveCount && liveCount > 0 ? liveCount : executiveTotal);

  const startEdit = () => {
    setDraft(String(displayCount));
    setEditing(true);
  };
  const saveEdit = () => {
    const n = Number(draft);
    if (Number.isFinite(n) && n >= 0) {
      setOverride(n);
      localStorage.setItem(STORAGE_KEY, String(n));
    }
    setEditing(false);
  };
  const resetOverride = () => {
    setOverride(null);
    localStorage.removeItem(STORAGE_KEY);
    setEditing(false);
  };

  const memberDate = new Date(memberSince).toLocaleDateString("en-ZA", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1">
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Clients under management
            </div>
            {!editing && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={startEdit}
                aria-label="Edit client count"
              >
                <Pencil className="w-3 h-3" />
              </Button>
            )}
          </div>
          {editing ? (
            <div className="flex items-center gap-2 mt-1">
              <Input
                type="number"
                min={0}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-9 w-24 font-display font-bold text-lg"
                autoFocus
              />
              <Button size="icon" className="h-8 w-8" onClick={saveEdit} aria-label="Save">
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={() => setEditing(false)}
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <p className="font-display font-bold text-2xl">{displayCount}</p>
          )}
          {override !== null && !editing && (
            <button
              type="button"
              onClick={resetOverride}
              className="text-[10px] text-muted-foreground underline mt-1 hover:text-foreground"
            >
              Reset to default
            </button>
          )}
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