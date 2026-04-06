import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { mockAuditLog } from "@/data/mockGuardianData";
import { format, parseISO } from "date-fns";

const roleColors: Record<string, "default" | "secondary" | "outline"> = {
  minor: "default",
  guardian: "secondary",
  system: "outline",
};

const AuditLogTab = () => (
  <div className="space-y-6 mt-4">
    <div>
      <h2 className="text-lg font-semibold text-foreground">Audit Log</h2>
      <p className="text-xs text-muted-foreground">Complete, immutable record of all guardian-related actions</p>
    </div>

    <Card className="border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <History className="w-4 h-4 text-primary" /> Activity Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {mockAuditLog.map((entry, idx) => (
            <div key={entry.id} className="flex gap-4 pb-6 last:pb-0">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0 mt-1.5" />
                {idx < mockAuditLog.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={roleColors[entry.performedByRole] || "outline"} className="text-[10px]">
                    {entry.performedByRole}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(parseISO(entry.timestamp), "dd MMM yyyy · HH:mm")}
                  </span>
                </div>
                <p className="text-sm text-foreground mt-1">{entry.details}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  By: {entry.performedByName} {entry.ipAddress && `· IP: ${entry.ipAddress}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default AuditLogTab;
