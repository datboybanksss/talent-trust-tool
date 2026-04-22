import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAgencyScope } from "@/hooks/useAgencyScope";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const STATUSES = [
  { value: "prospecting", label: "Prospecting" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiating", label: "Negotiating" },
  { value: "active", label: "Active / Won" },
  { value: "closed_won", label: "Closed (Won)" },
  { value: "closed_lost", label: "Closed (Lost)" },
];

const DEAL_TYPE_SUGGESTIONS = [
  "Endorsement", "Sponsorship", "Player Contract", "Brand Ambassador",
  "Image Rights", "Recording Contract", "Production Deal", "TV Commercial",
  "Collaboration", "Launch Event",
];

const MANUAL = "__manual__";

interface DealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealId?: string | null;
  initialData?: any;
}

const DealDialog = ({ open, onOpenChange, dealId, initialData }: DealDialogProps) => {
  const { user } = useAuth();
  const { scopedAgentId } = useAgencyScope();
  const queryClient = useQueryClient();
  const isEdit = Boolean(dealId);

  const [clientChoice, setClientChoice] = useState<string>(MANUAL);
  const [clientName, setClientName] = useState("");
  const [clientType, setClientType] = useState("athlete");
  const [brand, setBrand] = useState("");
  const [dealType, setDealType] = useState("Endorsement");
  const [valueText, setValueText] = useState("");
  const [status, setStatus] = useState("prospecting");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: invitations = [] } = useQuery({
    queryKey: ["client_invitations_for_deals", scopedAgentId],
    queryFn: async () => {
      if (!scopedAgentId) return [];
      const { data } = await supabase
        .from("client_invitations")
        .select("id, client_name, client_type")
        .eq("agent_id", scopedAgentId)
        .is("archived_at", null)
        .order("client_name");
      return data ?? [];
    },
    enabled: open && !!scopedAgentId,
  });

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setClientChoice(initialData.client_invitation_id || MANUAL);
      setClientName(initialData.client_name || "");
      setClientType(initialData.client_type || "athlete");
      setBrand(initialData.brand || "");
      setDealType(initialData.deal_type || "Endorsement");
      setValueText(initialData.value_text || "");
      setStatus(initialData.status || "prospecting");
      setStartDate(initialData.start_date || "");
      setEndDate(initialData.end_date || "");
      setNotes(initialData.notes || "");
    } else {
      setClientChoice(MANUAL);
      setClientName("");
      setClientType("athlete");
      setBrand("");
      setDealType("Endorsement");
      setValueText("");
      setStatus("prospecting");
      setStartDate("");
      setEndDate("");
      setNotes("");
    }
  }, [open, initialData]);

  const handleClientChange = (val: string) => {
    setClientChoice(val);
    if (val !== MANUAL) {
      const inv = invitations.find((i) => i.id === val);
      if (inv) {
        setClientName(inv.client_name);
        setClientType(inv.client_type);
      }
    }
  };

  const isValid = brand.trim() && dealType.trim() && valueText.trim() && clientName.trim();

  const handleSubmit = async () => {
    if (!user || !scopedAgentId || !isValid) return;
    setSubmitting(true);

    const basePayload = {
      agent_id: scopedAgentId,
      client_invitation_id: clientChoice === MANUAL ? null : clientChoice,
      client_name: clientName.trim(),
      client_type: clientType,
      brand: brand.trim(),
      deal_type: dealType.trim(),
      value_text: valueText.trim(),
      status,
      start_date: startDate || null,
      end_date: endDate || null,
      notes: notes.trim() || null,
    };

    const { error } = isEdit
      ? await supabase
          .from("agent_deals")
          .update({ ...basePayload, updated_by: user.id })
          .eq("id", dealId!)
      : await supabase
          .from("agent_deals")
          .insert({ ...basePayload, created_by: user.id, updated_by: user.id });

    setSubmitting(false);

    if (error) {
      toast.error(isEdit ? "Failed to update deal" : "Failed to create deal", {
        description: error.message,
      });
      return;
    }

    toast.success(isEdit ? "Deal updated" : "Deal added to pipeline");
    queryClient.invalidateQueries({ queryKey: ["agent_deals"] });
    // Audit trail
    await supabase.from("audit_log").insert({
      action: isEdit ? "deal_updated" : "deal_created",
      entity_type: "deal",
      entity_id: dealId ?? null,
      user_id: user.id,
      metadata: {
        agency_id: scopedAgentId,
        brand: basePayload.brand,
        client_name: basePayload.client_name,
        status: basePayload.status,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Deal" : "Add New Deal"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the deal details below." : "Track a new opportunity in your pipeline."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select value={clientChoice} onValueChange={handleClientChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={MANUAL}>Other (manual entry)</SelectItem>
                {invitations.map((inv) => (
                  <SelectItem key={inv.id} value={inv.id}>
                    {inv.client_name} ({inv.client_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {clientChoice === MANUAL && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="client_name">Client name *</Label>
                <Input
                  id="client_name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. John Smith"
                />
              </div>
              <div className="space-y-2">
                <Label>Client type</Label>
                <Select value={clientType} onValueChange={setClientType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="athlete">Athlete</SelectItem>
                    <SelectItem value="artist">Artist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="brand">Brand / Counterparty *</Label>
            <Input
              id="brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Nike"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deal_type">Deal type *</Label>
            <Input
              id="deal_type"
              value={dealType}
              onChange={(e) => setDealType(e.target.value)}
              list="deal-type-suggestions"
              placeholder="e.g. Endorsement"
            />
            <datalist id="deal-type-suggestions">
              {DEAL_TYPE_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
            </datalist>
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Value *</Label>
            <Input
              id="value"
              value={valueText}
              onChange={(e) => setValueText(e.target.value)}
              placeholder='e.g. R2,500,000/yr'
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date">End date</Label>
              <Input id="end_date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this deal"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid || submitting}>
            {submitting ? "Saving…" : isEdit ? "Save changes" : "Add deal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DealDialog;