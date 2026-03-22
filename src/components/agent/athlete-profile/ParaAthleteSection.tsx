import { ParaAthleteInfo } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accessibility, Wrench, Plane, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import EditableField from "./EditableField";

interface Props {
  data: ParaAthleteInfo;
  editMode?: boolean;
  onChange?: (data: ParaAthleteInfo) => void;
}

const ParaAthleteSection = ({ data, editMode = false, onChange }: Props) => {
  const update = (field: keyof ParaAthleteInfo, value: any) => {
    onChange?.({ ...data, [field]: value });
  };

  if (!data.enabled && !editMode) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Accessibility className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground font-medium">Para-Athlete Module Not Enabled</p>
        <p className="text-sm text-muted-foreground mt-1">Enable this module to capture disability, classification, and accessibility information.</p>
      </div>
    );
  }

  const classColor = data.classificationStatus === "confirmed" ? "bg-success/15 text-success" : data.classificationStatus === "review" ? "bg-warning/15 text-warning" : "bg-info/15 text-info";

  return (
    <div className="space-y-6">
      {editMode && (
        <Card className="border-border">
          <CardContent className="pt-4">
            <EditableField label="Module Enabled" value={data.enabled ? "yes" : "no"} editMode={true} onChange={(v) => update("enabled", v === "yes")} type="select" options={[
              { label: "Yes", value: "yes" }, { label: "No", value: "no" }
            ]} />
          </CardContent>
        </Card>
      )}

      {/* Disability & Classification */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-primary" /> Disability & Classification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <EditableField label="Disability Description" value={data.disabilityDescription || ""} editMode={editMode} onChange={(v) => update("disabilityDescription", v)} />
            <EditableField label="Disability Type" value={data.disabilityType || ""} editMode={editMode} onChange={(v) => update("disabilityType", v)} />
            {editMode ? (
              <>
                <EditableField label="Sport Classification" value={data.sportClassification || ""} editMode={true} onChange={(v) => update("sportClassification", v)} />
                <EditableField label="Classification Status" value={data.classificationStatus || "new"} editMode={true} onChange={(v) => update("classificationStatus", v as any)} type="select" options={[
                  { label: "Confirmed", value: "confirmed" }, { label: "Review", value: "review" }, { label: "New", value: "new" }
                ]} />
              </>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sport Classification</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{data.sportClassification || "—"}</span>
                  {data.classificationStatus && (
                    <Badge className={`${classColor} border-0 text-xs`}>{data.classificationStatus}</Badge>
                  )}
                </div>
              </div>
            )}
            <EditableField label="Classification Expiry" value={data.classificationExpiry || ""} editMode={editMode} onChange={(v) => update("classificationExpiry", v)} type="date" />
          </div>
        </CardContent>
      </Card>

      {/* Assistive Devices */}
      {((data.assistiveDevices && data.assistiveDevices.length > 0) || editMode) && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" /> Assistive Devices & Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <EditableField label="Devices (comma-separated)" value={(data.assistiveDevices || []).join(", ")} editMode={true} onChange={(v) => update("assistiveDevices", v.split(",").map(s => s.trim()).filter(Boolean))} />
            ) : (
              <div className="flex flex-wrap gap-2">
                {(data.assistiveDevices || []).map((d, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Accessibility & Travel */}
      <div className="grid lg:grid-cols-2 gap-6">
        {((data.accessibilityNeeds && data.accessibilityNeeds.length > 0) || editMode) && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-info" /> Accessibility Needs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <EditableField label="Needs (comma-separated)" value={(data.accessibilityNeeds || []).join(", ")} editMode={true} onChange={(v) => update("accessibilityNeeds", v.split(",").map(s => s.trim()).filter(Boolean))} />
              ) : (
                <ul className="space-y-1.5">
                  {(data.accessibilityNeeds || []).map((n, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-info mt-1.5 shrink-0" />
                      {n}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
        {((data.travelRequirements && data.travelRequirements.length > 0) || editMode) && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plane className="w-4 h-4 text-info" /> Travel Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {editMode ? (
                <EditableField label="Requirements (comma-separated)" value={(data.travelRequirements || []).join(", ")} editMode={true} onChange={(v) => update("travelRequirements", v.split(",").map(s => s.trim()).filter(Boolean))} />
              ) : (
                <ul className="space-y-1.5">
                  {(data.travelRequirements || []).map((r, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Support Personnel */}
      {((data.supportPersonnel && data.supportPersonnel.length > 0) || editMode) && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Support Personnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(data.supportPersonnel || []).map((p, i) => (
                <div key={i} className="p-3 bg-muted/50 rounded-xl">
                  {editMode ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <Input value={p.name} onChange={(e) => { const u = [...(data.supportPersonnel || [])]; u[i] = { ...p, name: e.target.value }; update("supportPersonnel", u); }} placeholder="Name" className="text-sm h-8" />
                      <Input value={p.role} onChange={(e) => { const u = [...(data.supportPersonnel || [])]; u[i] = { ...p, role: e.target.value }; update("supportPersonnel", u); }} placeholder="Role" className="text-sm h-8" />
                      <Input value={p.phone} onChange={(e) => { const u = [...(data.supportPersonnel || [])]; u[i] = { ...p, phone: e.target.value }; update("supportPersonnel", u); }} placeholder="Phone" className="text-sm h-8" />
                      <EditableField label="" value={p.travelsWith ? "yes" : "no"} editMode={true} onChange={(v) => { const u = [...(data.supportPersonnel || [])]; u[i] = { ...p, travelsWith: v === "yes" }; update("supportPersonnel", u); }} type="select" options={[
                        { label: "Travels with athlete", value: "yes" }, { label: "Does not travel", value: "no" }
                      ]} />
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.role}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{p.phone}</span>
                        {p.travelsWith && <Badge variant="outline" className="text-xs">Travels with athlete</Badge>}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ParaAthleteSection;
