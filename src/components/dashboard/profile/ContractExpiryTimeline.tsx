import { FileText, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Contract {
  name: string;
  type: string;
  expiryDate: string;
  daysUntilExpiry: number;
  value?: string;
}

interface ContractExpiryTimelineProps {
  contracts: Contract[];
}

const ContractExpiryTimeline = ({ contracts }: ContractExpiryTimelineProps) => {
  const getUrgencyColor = (days: number) => {
    if (days <= 30) return "border-destructive bg-destructive/10";
    if (days <= 90) return "border-warning bg-warning/10";
    return "border-success bg-success/10";
  };

  const getUrgencyBadge = (days: number) => {
    if (days <= 30) return { bg: "bg-destructive/20 text-destructive", label: "Urgent" };
    if (days <= 90) return { bg: "bg-warning/20 text-warning", label: "Soon" };
    return { bg: "bg-success/20 text-success", label: "On Track" };
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Contract Expiry</h3>
            <p className="text-xs text-muted-foreground">Upcoming renewal dates</p>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{contracts.length} active</span>
      </div>

      <div className="space-y-4">
        {contracts.map((contract, index) => {
          const urgency = getUrgencyBadge(contract.daysUntilExpiry);
          return (
            <div
              key={index}
              className={cn(
                "p-4 rounded-xl border-l-4 transition-all hover:shadow-md",
                getUrgencyColor(contract.daysUntilExpiry)
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-foreground">{contract.name}</h4>
                  <p className="text-xs text-muted-foreground">{contract.type}</p>
                </div>
                <span className={cn("text-xs px-2 py-1 rounded-full font-medium", urgency.bg)}>
                  {urgency.label}
                </span>
              </div>
              
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{contract.expiryDate}</span>
                </div>
                {contract.value && (
                  <span className="text-sm font-semibold text-foreground">{contract.value}</span>
                )}
              </div>
              
              {contract.daysUntilExpiry <= 30 && (
                <div className="flex items-center gap-2 mt-3 text-xs text-destructive">
                  <AlertCircle className="w-3 h-3" />
                  <span>{contract.daysUntilExpiry} days until expiry</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContractExpiryTimeline;
