import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Scale, Eye, Pencil, Lock, Trash2 } from "lucide-react";
import { mockDataSubjectRights } from "@/data/mockGuardianData";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";

const rightIcons: Record<string, React.ElementType> = {
  access: Eye,
  rectification: Pencil,
  restriction: Lock,
  erasure: Trash2,
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary",
  in_progress: "outline",
  completed: "default",
  denied: "destructive",
};

const DataRightsTab = () => (
  <div className="space-y-6 mt-4">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Data Subject Rights</h2>
        <p className="text-xs text-muted-foreground">Exercise your rights under GDPR & POPIA</p>
      </div>
      <Button size="sm" onClick={() => toast.info("Submit Data Rights Request flow coming soon.")}>
        <Scale className="w-4 h-4 mr-1" /> New Request
      </Button>
    </div>

    {/* Rights overview */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        { type: "access", label: "Right of Access", desc: "Request a copy of all your data" },
        { type: "rectification", label: "Right to Rectification", desc: "Correct inaccurate data" },
        { type: "restriction", label: "Right to Restriction", desc: "Limit processing of your data" },
        { type: "erasure", label: "Right to Erasure", desc: "Request deletion where applicable" },
      ].map((r) => {
        const Icon = rightIcons[r.type];
        return (
          <Card key={r.type} className="border-border hover:border-primary/30 transition-colors cursor-pointer" onClick={() => toast.info(`${r.label} request flow coming soon.`)}>
            <CardContent className="pt-4 pb-3 text-center">
              <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">{r.label}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{r.desc}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>

    {/* Existing requests */}
    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Request History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockDataSubjectRights.map((r) => {
          const Icon = rightIcons[r.requestType];
          return (
            <div key={r.id} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground capitalize">{r.requestType}</p>
                  <Badge variant={statusColors[r.status]} className="text-[10px]">{r.status}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>
                {r.responseNotes && <p className="text-xs text-foreground mt-1 bg-background p-2 rounded">{r.responseNotes}</p>}
                <p className="text-[10px] text-muted-foreground mt-1">
                  Requested: {format(parseISO(r.requestedAt), "dd MMM yyyy")}
                  {r.completedAt && ` · Completed: ${format(parseISO(r.completedAt), "dd MMM yyyy")}`}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  </div>
);

export default DataRightsTab;
