import { ParaAthleteInfo } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accessibility, Wrench, Plane, Users } from "lucide-react";

interface Props { data: ParaAthleteInfo }

const ParaAthleteSection = ({ data }: Props) => {
  if (!data.enabled) {
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
      {/* Disability & Classification */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Accessibility className="w-4 h-4 text-primary" /> Disability & Classification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Disability Description" value={data.disabilityDescription || "—"} />
            <Field label="Disability Type" value={data.disabilityType || "—"} />
            <div>
              <p className="text-xs text-muted-foreground mb-1">Sport Classification</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{data.sportClassification || "—"}</span>
                {data.classificationStatus && (
                  <Badge className={`${classColor} border-0 text-xs`}>{data.classificationStatus}</Badge>
                )}
              </div>
            </div>
            {data.classificationExpiry && <Field label="Classification Expiry" value={data.classificationExpiry} />}
          </div>
        </CardContent>
      </Card>

      {/* Assistive Devices */}
      {data.assistiveDevices && data.assistiveDevices.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Wrench className="w-4 h-4 text-primary" /> Assistive Devices & Equipment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.assistiveDevices.map((d, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Accessibility & Travel */}
      <div className="grid lg:grid-cols-2 gap-6">
        {data.accessibilityNeeds && data.accessibilityNeeds.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Accessibility className="w-4 h-4 text-info" /> Accessibility Needs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {data.accessibilityNeeds.map((n, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-info mt-1.5 shrink-0" />
                    {n}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        {data.travelRequirements && data.travelRequirements.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Plane className="w-4 h-4 text-info" /> Travel Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5">
                {data.travelRequirements.map((r, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Support Personnel */}
      {data.supportPersonnel && data.supportPersonnel.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Support Personnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.supportPersonnel.map((p, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-muted/50 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.role}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{p.phone}</span>
                    {p.travelsWith && <Badge variant="outline" className="text-xs">Travels with athlete</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

export default ParaAthleteSection;
