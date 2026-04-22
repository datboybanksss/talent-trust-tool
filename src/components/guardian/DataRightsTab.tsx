import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, Eye, Pencil, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";

const rightIcons: Record<string, React.ElementType> = {
  access: Eye,
  rectification: Pencil,
  restriction: Lock,
  erasure: Trash2,
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
      <CardContent>
        <p className="text-sm text-muted-foreground text-center py-6">
          No data rights requests submitted yet.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default DataRightsTab;
