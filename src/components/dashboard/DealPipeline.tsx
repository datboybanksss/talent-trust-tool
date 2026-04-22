import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAgencyScope } from "@/hooks/useAgencyScope";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent,
  DropdownMenuSubTrigger, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DollarSign, User, ArrowRight, Calendar, Handshake, Plus,
  CheckCircle2, FileSignature, PartyPopper, XCircle, MoreHorizontal,
  Pencil, Trash2, MoveRight,
} from "lucide-react";
import DealDialog from "./DealDialog";
import DeleteDealDialog from "./DeleteDealDialog";

interface Deal {
  id: string;
  agent_id: string;
  client_invitation_id: string | null;
  client_name: string;
  client_type: string;
  brand: string;
  deal_type: string;
  value_text: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
}

const PIPELINE_STAGES = [
  { id: "prospecting", label: "Prospecting", icon: User, color: "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600", badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300" },
  { id: "proposal_sent", label: "Proposal Sent", icon: FileSignature, color: "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700", badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { id: "negotiating", label: "Negotiating", icon: Handshake, color: "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700", badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { id: "active", label: "Active / Won", icon: CheckCircle2, color: "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700", badgeClass: "bg-green-500/10 text-green-700 dark:text-green-300" },
  { id: "closed_won", label: "Closed (Won)", icon: PartyPopper, color: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-600", badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { id: "closed_lost", label: "Closed (Lost)", icon: XCircle, color: "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700", badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400" },
];

const stageLabel = (id: string) => PIPELINE_STAGES.find((s) => s.id === id)?.label ?? id;

const DealPipeline = () => {
  const navigate = useNavigate();
  const { scopedAgentId, loading: scopeLoading, canEdit, canDelete } = useAgencyScope();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const writePipeline = canEdit("pipeline");
  const deletePipeline = canDelete("pipeline");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingDeal, setDeletingDeal] = useState<Deal | null>(null);

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["agent_deals", scopedAgentId],
    queryFn: async () => {
      if (!scopedAgentId) return [] as Deal[];
      const { data, error } = await supabase
        .from("agent_deals")
        .select("*")
        .eq("agent_id", scopedAgentId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Deal[];
    },
    enabled: !scopeLoading && !!scopedAgentId,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const handleAdd = () => {
    setEditingDeal(null);
    setDialogOpen(true);
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setDialogOpen(true);
  };

  const handleDelete = (deal: Deal) => {
    setDeletingDeal(deal);
    setDeleteOpen(true);
  };

  const handleMoveStage = async (deal: Deal, newStatus: string) => {
    const { error } = await supabase
      .from("agent_deals")
      .update({ status: newStatus, updated_by: user?.id ?? null })
      .eq("id", deal.id);
    if (error) {
      toast.error("Failed to move deal", { description: error.message });
      return;
    }
    toast.success(`Moved to ${stageLabel(newStatus)}`);
    queryClient.invalidateQueries({ queryKey: ["agent_deals"] });
  };

  const totalInPipeline = deals.filter((d) => !["active", "closed_won", "closed_lost"].includes(d.status)).length;
  const wonOrActive = deals.filter((d) => d.status === "active" || d.status === "closed_won").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-display font-semibold text-foreground">Deal Pipeline</h2>
          <p className="text-xs text-muted-foreground">Track opportunities across stages</p>
        </div>
        {writePipeline && (
          <Button onClick={handleAdd} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> Add Deal
          </Button>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{deals.length}</p>
            <p className="text-xs text-muted-foreground">Total Deals</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-amber-600">{totalInPipeline}</p>
            <p className="text-xs text-muted-foreground">In Pipeline</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-green-600">{wonOrActive}</p>
            <p className="text-xs text-muted-foreground">Won / Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Empty state */}
      {!isLoading && deals.length === 0 && (
        <Card className="border-dashed border-2 border-border/60">
          <CardContent className="py-10 text-center">
            <Handshake className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">No deals yet</p>
            <p className="text-xs text-muted-foreground mb-4">
              Click <span className="font-medium">Add Deal</span> to start tracking your pipeline.
            </p>
            {writePipeline && (
              <Button onClick={handleAdd} size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" /> Add your first deal
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kanban */}
      {deals.length > 0 && (
        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-4 min-w-max">
            {PIPELINE_STAGES.map((stage) => {
              const stageDeals = deals.filter((d) => d.status === stage.id);
              const StageIcon = stage.icon;
              return (
                <div key={stage.id} className={`w-72 shrink-0 rounded-xl border p-3 ${stage.color}`}>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <StageIcon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                    </div>
                    <Badge variant="secondary" className={`text-[10px] ${stage.badgeClass}`}>
                      {stageDeals.length}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {stageDeals.length === 0 && (
                      <div className="py-8 text-center">
                        <p className="text-xs text-muted-foreground">No deals</p>
                      </div>
                    )}
                    {stageDeals.map((deal) => {
                      const initials = deal.client_name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                      const canNavigate = !!deal.client_invitation_id;

                      return (
                        <Card
                          key={deal.id}
                          className="border-border/50 bg-card hover:shadow-md transition-all group"
                        >
                          <CardContent className="p-3 space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm font-semibold text-foreground leading-tight flex-1">
                                {deal.brand}
                              </p>
                              {writePipeline && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                  <DropdownMenuItem onClick={() => handleEdit(deal)}>
                                    <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                      <MoveRight className="w-3.5 h-3.5 mr-2" /> Move to stage
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                      <DropdownMenuLabel className="text-xs">Stages</DropdownMenuLabel>
                                      {PIPELINE_STAGES.filter((s) => s.id !== deal.status).map((s) => (
                                        <DropdownMenuItem key={s.id} onClick={() => handleMoveStage(deal, s.id)}>
                                          {s.label}
                                        </DropdownMenuItem>
                                      ))}
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(deal)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3.5 h-3.5 text-muted-foreground" />
                              <p className="text-xs font-medium text-primary">{deal.value_text}</p>
                            </div>

                            <Badge variant="outline" className="text-[10px]">{deal.deal_type}</Badge>

                            <div
                              className={`flex items-center justify-between pt-1 border-t border-border/30 ${canNavigate ? "cursor-pointer" : ""}`}
                              onClick={() => canNavigate && navigate(`/agent-dashboard/client/${deal.client_invitation_id}`)}
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                                  {initials || "—"}
                                </div>
                                <span className="text-xs text-muted-foreground">{deal.client_name}</span>
                              </div>
                              {canNavigate && (
                                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                              )}
                            </div>

                            {deal.start_date && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {deal.start_date}{deal.end_date ? ` → ${deal.end_date}` : ""}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <DealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        dealId={editingDeal?.id ?? null}
        initialData={editingDeal}
      />
      <DeleteDealDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        dealId={deletingDeal?.id ?? null}
        dealLabel={deletingDeal ? `${deletingDeal.brand} — ${deletingDeal.client_name}` : ""}
      />
    </div>
  );
};

export default DealPipeline;