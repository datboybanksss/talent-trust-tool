import { HealthWelfare } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HeartPulse, Shield, AlertTriangle, Pill } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import EditableField from "./EditableField";

interface Props {
  data: HealthWelfare;
  editMode?: boolean;
  onChange?: (data: HealthWelfare) => void;
}

const HealthWelfareSection = ({ data, editMode = false, onChange }: Props) => {
  const update = (field: keyof HealthWelfare, value: any) => {
    onChange?.({ ...data, [field]: value });
  };

  const clearanceColor = data.medicalClearance?.status === "cleared" ? "bg-success/15 text-success" : data.medicalClearance?.status === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";

  return (
    <div className="space-y-6">
      <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl flex items-start gap-2">
        <Shield className="w-4 h-4 text-warning mt-0.5 shrink-0" />
        <p className="text-xs text-warning">This section contains restricted health data. Access is limited to authorised Medical/Welfare personnel and the agent.</p>
      </div>

      {/* Medical Clearance */}
      {(data.medicalClearance || editMode) && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-primary" /> Medical Clearance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <div className="grid sm:grid-cols-3 gap-4">
                <EditableField label="Status" value={data.medicalClearance?.status || "pending"} editMode={true} onChange={(v) => update("medicalClearance", { ...data.medicalClearance, status: v, date: data.medicalClearance?.date || new Date().toISOString().split("T")[0] })} type="select" options={[
                  { label: "Cleared", value: "cleared" }, { label: "Pending", value: "pending" }, { label: "Restricted", value: "restricted" }
                ]} />
                <EditableField label="Date" value={data.medicalClearance?.date || ""} editMode={true} onChange={(v) => update("medicalClearance", { ...data.medicalClearance, status: data.medicalClearance?.status || "pending", date: v })} type="date" />
                <EditableField label="Notes" value={data.medicalClearance?.notes || ""} editMode={true} onChange={(v) => update("medicalClearance", { ...data.medicalClearance, status: data.medicalClearance?.status || "pending", date: data.medicalClearance?.date || "", notes: v })} />
              </div>
            ) : data.medicalClearance ? (
              <>
                <div className="flex items-center gap-4">
                  <Badge className={`${clearanceColor} border-0`}>{data.medicalClearance.status.toUpperCase()}</Badge>
                  <span className="text-sm text-muted-foreground">as of {data.medicalClearance.date}</span>
                </div>
                {data.medicalClearance.notes && <p className="text-sm text-muted-foreground mt-2">{data.medicalClearance.notes}</p>}
              </>
            ) : null}
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="pt-4">
            {editMode ? (
              <EditableField label="Blood Type" value={data.bloodType || ""} editMode={true} onChange={(v) => update("bloodType", v)} />
            ) : (
              <>
                <p className="text-xs text-muted-foreground">Blood Type</p>
                <p className="text-2xl font-bold text-foreground mt-1">{data.bloodType || "—"}</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Allergies</p>
            {editMode ? (
              <Input value={(data.allergies || []).join(", ")} onChange={(e) => update("allergies", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="Comma-separated" className="text-sm h-9 mt-2" />
            ) : (
              <div className="flex flex-wrap gap-1 mt-2">
                {(data.allergies || ["None known"]).map((a, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Pill className="w-3 h-3" /> Medications</p>
            {editMode ? (
              <Input value={(data.medications || []).join(", ")} onChange={(e) => update("medications", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} placeholder="Comma-separated" className="text-sm h-9 mt-2" />
            ) : (
              <div className="flex flex-wrap gap-1 mt-2">
                {(data.medications && data.medications.length > 0 ? data.medications : ["None"]).map((m, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{m}</Badge>
                ))}
              </div>
            )}
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
            <div key={i} className="p-3 bg-muted/50 rounded-xl">
              {editMode ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-2">
                  <Input value={p.type} onChange={(e) => { const u = [...data.insurancePolicies]; u[i] = { ...p, type: e.target.value }; update("insurancePolicies", u); }} placeholder="Type" className="text-sm h-8" />
                  <Input value={p.provider} onChange={(e) => { const u = [...data.insurancePolicies]; u[i] = { ...p, provider: e.target.value }; update("insurancePolicies", u); }} placeholder="Provider" className="text-sm h-8" />
                  <Input value={p.policyNumber} onChange={(e) => { const u = [...data.insurancePolicies]; u[i] = { ...p, policyNumber: e.target.value }; update("insurancePolicies", u); }} placeholder="Policy #" className="text-sm h-8" />
                  <Input value={p.coverAmount} onChange={(e) => { const u = [...data.insurancePolicies]; u[i] = { ...p, coverAmount: e.target.value }; update("insurancePolicies", u); }} placeholder="Cover" className="text-sm h-8" />
                  <Input value={p.expiryDate} onChange={(e) => { const u = [...data.insurancePolicies]; u[i] = { ...p, expiryDate: e.target.value }; update("insurancePolicies", u); }} placeholder="Expiry" className="text-sm h-8" />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.type}</p>
                    <p className="text-xs text-muted-foreground">{p.provider} — {p.policyNumber}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1 sm:mt-0">
                    <span className="text-xs font-medium text-foreground">{p.coverAmount}</span>
                    <span className="text-xs text-muted-foreground">exp. {p.expiryDate}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Emergency Action Plan */}
      <Card className="border-border border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" /> Emergency Action Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editMode ? (
            <Textarea value={data.emergencyActionPlan || ""} onChange={(e) => update("emergencyActionPlan", e.target.value)} placeholder="Describe emergency action plan..." className="text-sm min-h-[100px]" />
          ) : (
            <p className="text-sm text-foreground whitespace-pre-line">{data.emergencyActionPlan || "No plan documented"}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HealthWelfareSection;
