import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DollarSign, User, ArrowRight, Calendar, Handshake,
  Clock, CheckCircle2, FileSignature, PartyPopper, XCircle
} from "lucide-react";

interface Deal {
  id: string;
  brand: string;
  type: string;
  value: string;
  start: string;
  end: string;
  status: string;
}

interface ClientDeal extends Deal {
  clientId: string;
  clientName: string;
  clientType: string;
}

// Aggregate all deals from mock clients with pipeline stages
const ALL_PIPELINE_DEALS: ClientDeal[] = [
  // Siya Kolisi
  { id: "sk-dl4", clientId: "1", clientName: "Siya Kolisi", clientType: "athlete", brand: "BMW South Africa", type: "Brand Ambassador", value: "R2,500,000/yr", start: "2025-06-01", end: "2026-05-31", status: "negotiating" },
  { id: "sk-dl1", clientId: "1", clientName: "Siya Kolisi", clientType: "athlete", brand: "Nike", type: "Endorsement", value: "R8,500,000/yr", start: "2025-01-15", end: "2027-01-14", status: "active" },
  { id: "sk-dl2", clientId: "1", clientName: "Siya Kolisi", clientType: "athlete", brand: "Racing 92", type: "Player Contract", value: "R18,000,000/yr", start: "2024-07-01", end: "2026-06-30", status: "active" },
  { id: "sk-dl3", clientId: "1", clientName: "Siya Kolisi", clientType: "athlete", brand: "SA Rugby", type: "Image Rights", value: "R3,200,000/yr", start: "2024-11-20", end: "2026-11-19", status: "active" },
  // Zozibini Tunzi
  { id: "zt-dl3", clientId: "2", clientName: "Zozibini Tunzi", clientType: "artist", brand: "Netflix SA", type: "Production Deal", value: "R4,500,000", start: "2026-01-01", end: "2026-12-31", status: "negotiating" },
  { id: "zt-dl1", clientId: "2", clientName: "Zozibini Tunzi", clientType: "artist", brand: "Estée Lauder", type: "Global Ambassador", value: "$500,000/yr", start: "2025-03-01", end: "2027-02-28", status: "active" },
  // Tyla Seethal
  { id: "ts-dl4", clientId: "4", clientName: "Tyla Seethal", clientType: "artist", brand: "Fashion Nova", type: "Collaboration", value: "R3,500,000", start: "2026-02-01", end: "2026-07-31", status: "negotiating" },
  { id: "ts-dl1", clientId: "4", clientName: "Tyla Seethal", clientType: "artist", brand: "Epic Records", type: "Recording Contract", value: "R35,000,000", start: "2024-03-15", end: "2028-03-14", status: "active" },
  { id: "ts-dl3", clientId: "4", clientName: "Tyla Seethal", clientType: "artist", brand: "Pepsi Africa", type: "Brand Ambassador", value: "R6,000,000/yr", start: "2025-09-01", end: "2026-08-31", status: "active" },
  // Additional pipeline deals for demo
  { id: "sk-dl6", clientId: "1", clientName: "Siya Kolisi", clientType: "athlete", brand: "Vodacom", type: "TV Commercial", value: "R1,800,000", start: "", end: "", status: "prospecting" },
  { id: "zt-dl4", clientId: "2", clientName: "Zozibini Tunzi", clientType: "artist", brand: "L'Oréal Paris", type: "Campaign Feature", value: "$200,000", start: "", end: "", status: "prospecting" },
  { id: "ts-dl5", clientId: "4", clientName: "Tyla Seethal", clientType: "artist", brand: "Apple Music", type: "Exclusive Release", value: "R8,000,000", start: "", end: "", status: "proposal_sent" },
  { id: "sk-dl7", clientId: "1", clientName: "Siya Kolisi", clientType: "athlete", brand: "Adidas", type: "Footwear Line", value: "R5,000,000/yr", start: "", end: "", status: "proposal_sent" },
  { id: "zt-dl5", clientId: "2", clientName: "Zozibini Tunzi", clientType: "artist", brand: "Disney+", type: "Documentary Series", value: "R6,000,000", start: "", end: "", status: "proposal_sent" },
  // Closed / won
  { id: "ts-dl6", clientId: "4", clientName: "Tyla Seethal", clientType: "artist", brand: "Samsung Galaxy", type: "Launch Event", value: "R2,200,000", start: "2026-03-01", end: "2026-03-31", status: "closed_won" },
  // Lost
  { id: "sk-dl8", clientId: "1", clientName: "Siya Kolisi", clientType: "athlete", brand: "Under Armour", type: "Endorsement", value: "R4,000,000/yr", start: "", end: "", status: "closed_lost" },
];

const PIPELINE_STAGES = [
  { id: "prospecting", label: "Prospecting", icon: User, color: "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600", badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300" },
  { id: "proposal_sent", label: "Proposal Sent", icon: FileSignature, color: "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700", badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300" },
  { id: "negotiating", label: "Negotiating", icon: Handshake, color: "bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700", badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  { id: "active", label: "Active / Won", icon: CheckCircle2, color: "bg-green-50 dark:bg-green-950/30 border-green-300 dark:border-green-700", badgeClass: "bg-green-500/10 text-green-700 dark:text-green-300" },
  { id: "closed_won", label: "Closed (Won)", icon: PartyPopper, color: "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-600", badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  { id: "closed_lost", label: "Closed (Lost)", icon: XCircle, color: "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-700", badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400" },
];

const DealPipeline = () => {
  const navigate = useNavigate();

  const getDealsForStage = (stageId: string) =>
    ALL_PIPELINE_DEALS.filter((d) => d.status === stageId);

  const totalPipelineValue = ALL_PIPELINE_DEALS
    .filter((d) => !["active", "closed_won", "closed_lost"].includes(d.status))
    .length;

  return (
    <div className="space-y-4">
      {/* Pipeline Summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-foreground">{ALL_PIPELINE_DEALS.length}</p>
            <p className="text-xs text-muted-foreground">Total Deals</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-amber-600">{totalPipelineValue}</p>
            <p className="text-xs text-muted-foreground">In Pipeline</p>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-display font-bold text-green-600">
              {ALL_PIPELINE_DEALS.filter((d) => d.status === "active" || d.status === "closed_won").length}
            </p>
            <p className="text-xs text-muted-foreground">Won / Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4 -mx-4 px-4">
        <div className="flex gap-4 min-w-max">
          {PIPELINE_STAGES.map((stage) => {
            const deals = getDealsForStage(stage.id);
            const StageIcon = stage.icon;

            return (
              <div key={stage.id} className={`w-72 shrink-0 rounded-xl border p-3 ${stage.color}`}>
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <StageIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{stage.label}</span>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] ${stage.badgeClass}`}>
                    {deals.length}
                  </Badge>
                </div>

                {/* Deal Cards */}
                <div className="space-y-2">
                  {deals.length === 0 && (
                    <div className="py-8 text-center">
                      <p className="text-xs text-muted-foreground">No deals</p>
                    </div>
                  )}
                  {deals.map((deal) => {
                    const initials = deal.clientName.split(" ").map((n) => n[0]).join("").slice(0, 2);

                    return (
                      <Card
                        key={deal.id}
                        className="border-border/50 bg-card hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => navigate(`/agent-dashboard/client/${deal.clientId}`)}
                      >
                        <CardContent className="p-3 space-y-2.5">
                          {/* Brand & Value */}
                          <div className="flex items-start justify-between">
                            <p className="text-sm font-semibold text-foreground leading-tight">{deal.brand}</p>
                            <DollarSign className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                          </div>
                          <p className="text-xs font-medium text-primary">{deal.value}</p>

                          {/* Type */}
                          <Badge variant="outline" className="text-[10px]">{deal.type}</Badge>

                          {/* Client */}
                          <div className="flex items-center justify-between pt-1 border-t border-border/30">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                                {initials}
                              </div>
                              <span className="text-xs text-muted-foreground">{deal.clientName}</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>

                          {/* Dates if available */}
                          {deal.start && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              {deal.start} → {deal.end}
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
    </div>
  );
};

export default DealPipeline;
