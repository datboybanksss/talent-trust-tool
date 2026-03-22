import { RepresentationDetails } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ShieldCheck } from "lucide-react";

interface Props { data: RepresentationDetails }

const RepresentationSection = ({ data }: Props) => {
  const dopingColor = data.antiDopingStatus === "compliant" ? "bg-success/15 text-success" : data.antiDopingStatus === "pending" ? "bg-warning/15 text-warning" : "bg-destructive/15 text-destructive";

  return (
    <div className="space-y-6">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-primary" /> Agent & Mandate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Agent / Manager" value={data.agentName} />
            <Field label="Company" value={data.agentCompany} />
            <Field label="Mandate Type" value={data.mandateType} />
            <Field label="Mandate Start" value={data.mandateStart} />
            {data.mandateEnd && <Field label="Mandate End" value={data.mandateEnd} />}
            <Field label="Commission Rate" value={data.commissionRate} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" /> Federation & Anti-Doping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.club && <Field label="Club" value={data.club} />}
            {data.federation && <Field label="Federation" value={data.federation} />}
            {data.federationId && <Field label="Federation ID" value={data.federationId} />}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Anti-Doping Status</p>
              <Badge className={`${dopingColor} border-0`}>{data.antiDopingStatus.toUpperCase()}</Badge>
            </div>
            {data.antiDopingLastTest && <Field label="Last Test Date" value={data.antiDopingLastTest} />}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Whereabouts</p>
              <Badge variant={data.whereaboutsSubmitted ? "default" : "destructive"} className="text-xs">
                {data.whereaboutsSubmitted ? "Submitted" : "Outstanding"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

export default RepresentationSection;
