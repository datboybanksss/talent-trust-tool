import { HealthWelfare } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Shield, AlertTriangle, Pill } from "lucide-react";

interface Props { data: HealthWelfare }

const HealthWelfareSection = ({ data }: Props) => {
  const clearanceColor = data.medicalClearance?.status === "cleared" ? "bg-success/15 text-success" : data.medicalClearance?.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";

  return (
    <div className="space-y-6">
      <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl flex items-start gap-2">
        <Shield className="w-4 h-4 text-warning mt-0.5 shrink-0" />
        <p className="text-xs text-warning">This section contains restricted health data. Access is limited to authorised Medical/Welfare personnel and the agent.</p>
      </div>

      {/* Medical Clearance */}
      {data.medicalClearance && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-primary" /> Medical Clearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className={`${clearanceColor} border-0`}>{data.medicalClearance.status.toUpperCase()}</Badge>
              <span className="text-sm text-muted-foreground">as of {data.medicalClearance.date}</span>
            </div>
            {data.medicalClearance.notes && <p className="text-sm text-muted-foreground mt-2">{data.medicalClearance.notes}</p>}
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.bloodType && (
          <Card className="border-border">
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">Blood Type</p>
              <p className="text-2xl font-bold text-foreground mt-1">{data.bloodType}</p>
            </CardContent>
          </Card>
        )}
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Allergies</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {(data.allergies || ["None known"]).map((a, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Pill className="w-3 h-3" /> Medications</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {(data.medications && data.medications.length > 0 ? data.medications : ["None"]).map((m, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{m}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insurance */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" /> Insurance Policies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.insurancePolicies.map((p, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-foreground">{p.type}</p>
                <p className="text-xs text-muted-foreground">{p.provider} — {p.policyNumber}</p>
              </div>
              <div className="flex items-center gap-3 mt-1 sm:mt-0">
                <span className="text-xs font-medium text-foreground">{p.coverAmount}</span>
                <span className="text-xs text-muted-foreground">exp. {p.expiryDate}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emergency Action Plan */}
      {data.emergencyActionPlan && (
        <Card className="border-border border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" /> Emergency Action Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-line">{data.emergencyActionPlan}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HealthWelfareSection;
