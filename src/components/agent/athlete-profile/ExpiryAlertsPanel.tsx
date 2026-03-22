import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle, Clock, CheckCircle2, FileText, Plane,
  Shield, HeartPulse, Briefcase, Accessibility, ChevronDown, ChevronUp, Bell
} from "lucide-react";
import { ExpiryAlert, AlertSeverity, AlertCategory, computeExpiryAlerts } from "@/utils/expiryAlerts";
import { AthleteFullProfile } from "@/types/athleteProfile";
import { format, parseISO } from "date-fns";

interface Props {
  athlete: AthleteFullProfile;
  onNavigateToTab?: (tab: string) => void;
}

const severityConfig: Record<AlertSeverity, { icon: typeof AlertTriangle; color: string; bg: string; label: string }> = {
  critical: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10 border-destructive/20", label: "Critical" },
  warning: { icon: Clock, color: "text-warning", bg: "bg-warning/10 border-warning/20", label: "Warning" },
  info: { icon: CheckCircle2, color: "text-info", bg: "bg-info/10 border-info/20", label: "Upcoming" },
};

const categoryConfig: Record<AlertCategory, { icon: typeof FileText; label: string; tab: string }> = {
  contract: { icon: Briefcase, label: "Contract", tab: "commercial" },
  visa: { icon: Plane, label: "Visa", tab: "travel" },
  passport: { icon: Plane, label: "Passport", tab: "travel" },
  classification: { icon: Accessibility, label: "Classification", tab: "para_athlete" },
  insurance: { icon: HeartPulse, label: "Insurance", tab: "health" },
  consent: { icon: Shield, label: "Consent", tab: "access" },
  document: { icon: FileText, label: "Document", tab: "documents" },
  mandate: { icon: Briefcase, label: "Mandate", tab: "representation" },
};

const ExpiryAlertsPanel = ({ athlete, onNavigateToTab }: Props) => {
  const [expanded, setExpanded] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | "all">("all");

  const alerts = useMemo(() => computeExpiryAlerts(athlete), [athlete]);

  const filtered = filterSeverity === "all" ? alerts : alerts.filter(a => a.severity === filterSeverity);

  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const warningCount = alerts.filter(a => a.severity === "warning").length;

  if (alerts.length === 0) return null;

  return (
    <Card className={`border ${criticalCount > 0 ? "border-destructive/30 bg-destructive/5" : warningCount > 0 ? "border-warning/30 bg-warning/5" : "border-border"}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            Expiry Alerts
            {criticalCount > 0 && (
              <Badge variant="destructive" className="text-xs px-1.5 py-0">{criticalCount} critical</Badge>
            )}
            {warningCount > 0 && (
              <Badge className="bg-warning/15 text-warning border-0 text-xs px-1.5 py-0">{warningCount} warning</Badge>
            )}
            <Badge variant="outline" className="text-xs px-1.5 py-0">{alerts.length} total</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="h-7 w-7 p-0">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="pt-0">
          {/* Filter chips */}
          <div className="flex gap-1.5 mb-3 flex-wrap">
            {(["all", "critical", "warning", "info"] as const).map(sev => (
              <Button
                key={sev}
                variant={filterSeverity === sev ? "default" : "outline"}
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => setFilterSeverity(sev)}
              >
                {sev === "all" ? `All (${alerts.length})` : `${sev.charAt(0).toUpperCase() + sev.slice(1)} (${alerts.filter(a => a.severity === sev).length})`}
              </Button>
            ))}
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {filtered.map(alert => {
              const sev = severityConfig[alert.severity];
              const cat = categoryConfig[alert.category];
              const SevIcon = sev.icon;
              const CatIcon = cat.icon;

              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border ${sev.bg} cursor-pointer hover:opacity-80 transition-opacity`}
                  onClick={() => onNavigateToTab?.(cat.tab)}
                >
                  <SevIcon className={`w-4 h-4 mt-0.5 shrink-0 ${sev.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-foreground">{alert.title}</span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0 gap-0.5">
                        <CatIcon className="w-2.5 h-2.5" /> {cat.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{alert.detail}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-xs font-bold ${sev.color}`}>
                      {alert.daysUntilExpiry <= 0 ? "EXPIRED" : `${alert.daysUntilExpiry}d`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{format(parseISO(alert.expiryDate), "dd MMM yyyy")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ExpiryAlertsPanel;
