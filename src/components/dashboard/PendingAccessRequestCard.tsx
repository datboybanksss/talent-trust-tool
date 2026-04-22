import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Shield, Check, Settings2, X, Loader2 } from "lucide-react";

interface PendingShareRow {
  id: string;
  sections: string[];
  shared_with_user_id: string | null;
  agent_company: string | null;
  agent_name: string | null;
}

const SECTION_LABELS: Record<string, string> = {
  contracts: "Contracts",
  endorsements: "Endorsements",
  tax: "Tax",
  documents: "Documents",
  beneficiaries: "Beneficiaries",
  contacts: "Emergency Contacts",
  assets: "Assets",
  royalties: "Royalties",
};

const PendingAccessRequestCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [pending, setPending] = useState<PendingShareRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);
  const [declineFor, setDeclineFor] = useState<PendingShareRow | null>(null);
  const [declineReason, setDeclineReason] = useState("");

  const load = async () => {
    if (!user) return;
    const { data: shares } = await supabase
      .from("life_file_shares")
      .select("id, sections, shared_with_user_id")
      .eq("owner_id", user.id)
      .eq("status", "pending_client_approval");

    if (!shares || shares.length === 0) {
      setPending([]);
      setLoading(false);
      return;
    }

    const agentIds = shares.map((s) => s.shared_with_user_id).filter((x): x is string => !!x);
    const { data: agents } = await supabase
      .from("agent_manager_profiles")
      .select("user_id, company_name")
      .in("user_id", agentIds);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, display_name")
      .in("user_id", agentIds);

    const enriched: PendingShareRow[] = shares.map((s) => ({
      id: s.id,
      sections: s.sections ?? [],
      shared_with_user_id: s.shared_with_user_id,
      agent_company: agents?.find((a) => a.user_id === s.shared_with_user_id)?.company_name ?? null,
      agent_name: profiles?.find((p) => p.user_id === s.shared_with_user_id)?.display_name ?? null,
    }));

    setPending(enriched);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const accept = async (row: PendingShareRow) => {
    setWorking(row.id);
    const { error } = await supabase
      .from("life_file_shares")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("id", row.id);
    setWorking(null);
    if (error) {
      toast({ title: "Could not accept", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Access granted", description: `${row.agent_name ?? "Your agent"} can now view the selected sections.` });
    load();
  };

  const submitDecline = async () => {
    if (!declineFor) return;
    setWorking(declineFor.id);
    const { error } = await supabase
      .from("life_file_shares")
      .update({ status: "declined", decline_reason: declineReason.trim() || null })
      .eq("id", declineFor.id);
    setWorking(null);
    if (error) {
      toast({ title: "Could not decline", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Access declined", description: "Your agent has been notified." });
    setDeclineFor(null);
    setDeclineReason("");
    load();
  };

  if (loading || pending.length === 0) return null;

  return (
    <>
      {pending.map((row) => (
        <Card key={row.id} className="mb-6 border-primary/40 bg-primary/5 shadow-soft">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground">
                  {row.agent_name ?? "Your agent"}
                  {row.agent_company ? ` from ${row.agent_company}` : ""} would like access to your profile
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {row.sections.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {SECTION_LABELS[s] ?? s}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => accept(row)} disabled={working === row.id}>
                {working === row.id ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                Accept
              </Button>
              <Button size="sm" variant="outline" disabled title="Use Sharing page to customise" >
                <Settings2 className="w-4 h-4 mr-1" /> Customise
              </Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setDeclineFor(row)} disabled={working === row.id}>
                <X className="w-4 h-4 mr-1" /> Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!declineFor} onOpenChange={(o) => { if (!o) { setDeclineFor(null); setDeclineReason(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline access request</DialogTitle>
            <DialogDescription>
              Optionally tell your agent why. They'll see this in their portal.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value.slice(0, 200))}
            placeholder="e.g. Trial period only — I'd like to share later."
            maxLength={200}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">{declineReason.length}/200</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setDeclineFor(null); setDeclineReason(""); }}>Cancel</Button>
            <Button variant="destructive" onClick={submitDecline} disabled={working !== null}>
              {working ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
              Decline access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingAccessRequestCard;
