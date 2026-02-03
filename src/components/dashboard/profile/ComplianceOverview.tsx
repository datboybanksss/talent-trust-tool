import { CheckCircle2, AlertTriangle, XCircle, Shield } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ComplianceItem {
  name: string;
  status: "compliant" | "warning" | "critical";
  dueDate?: string;
}

interface ComplianceOverviewProps {
  score: number;
  items: ComplianceItem[];
}

const ComplianceOverview = ({ score, items }: ComplianceOverviewProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Attention";
    return "Critical";
  };

  const getStatusIcon = (status: ComplianceItem["status"]) => {
    switch (status) {
      case "compliant":
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "critical":
        return <XCircle className="w-4 h-4 text-destructive" />;
    }
  };

  const getStatusBg = (status: ComplianceItem["status"]) => {
    switch (status) {
      case "compliant":
        return "bg-success/10";
      case "warning":
        return "bg-warning/10";
      case "critical":
        return "bg-destructive/10";
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Compliance Health</h3>
          <p className="text-xs text-muted-foreground">Overall business compliance status</p>
        </div>
      </div>

      {/* Score Circle */}
      <div className="flex items-center gap-6 mb-6">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-secondary"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${score * 2.51} 251`}
              strokeLinecap="round"
              className={getScoreColor(score)}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-2xl font-bold", getScoreColor(score))}>{score}%</span>
          </div>
        </div>
        <div>
          <p className={cn("text-lg font-semibold", getScoreColor(score))}>
            {getScoreLabel(score)}
          </p>
          <p className="text-sm text-muted-foreground">
            {items.filter(i => i.status === "compliant").length} of {items.length} items compliant
          </p>
        </div>
      </div>

      {/* Compliance Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center justify-between p-3 rounded-xl",
              getStatusBg(item.status)
            )}
          >
            <div className="flex items-center gap-3">
              {getStatusIcon(item.status)}
              <span className="text-sm font-medium text-foreground">{item.name}</span>
            </div>
            {item.dueDate && (
              <span className="text-xs text-muted-foreground">{item.dueDate}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComplianceOverview;
