import { RepresentationDetails } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ShieldCheck } from "lucide-react";
import EditableField from "./EditableField";

interface Props {
  data: RepresentationDetails;
  editMode?: boolean;
  onChange?: (data: RepresentationDetails) => void;
}

const RepresentationSection = ({ data, editMode = false, onChange }: Props) => {
  const update = (field: keyof RepresentationDetails, value: any) => {
    onChange?.({ ...data, [field]: value });
  };

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
            <EditableField label="Agent / Manager" value={data.agentName} editMode={editMode} onChange={(v) => update("agentName", v)} />
            <EditableField label="Company" value={data.agentCompany} editMode={editMode} onChange={(v) => update("agentCompany", v)} />
            <EditableField label="Mandate Type" value={data.mandateType} editMode={editMode} onChange={(v) => update("mandateType", v)} type="select" options={[
              { label: "Exclusive", value: "Exclusive" }, { label: "Non-Exclusive", value: "Non-Exclusive" }, { label: "Co-Mandate", value: "Co-Mandate" }
            ]} />
            <EditableField label="Mandate Start" value={data.mandateStart} editMode={editMode} onChange={(v) => update("mandateStart", v)} type="date" />
            <EditableField label="Mandate End" value={data.mandateEnd || ""} editMode={editMode} onChange={(v) => update("mandateEnd", v)} type="date" />
            <EditableField label="Commission Rate" value={data.commissionRate} editMode={editMode} onChange={(v) => update("commissionRate", v)} />
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
            <EditableField label="Club" value={data.club || ""} editMode={editMode} onChange={(v) => update("club", v)} />
            <EditableField label="Federation" value={data.federation || ""} editMode={editMode} onChange={(v) => update("federation", v)} />
            <EditableField label="Federation ID" value={data.federationId || ""} editMode={editMode} onChange={(v) => update("federationId", v)} />
            {editMode ? (
              <EditableField label="Anti-Doping Status" value={data.antiDopingStatus} editMode={editMode} onChange={(v) => update("antiDopingStatus", v as any)} type="select" options={[
                { label: "Compliant", value: "compliant" }, { label: "Pending", value: "pending" }, { label: "Suspended", value: "suspended" }
              ]} />
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Anti-Doping Status</p>
                <Badge className={`${dopingColor} border-0`}>{data.antiDopingStatus.toUpperCase()}</Badge>
              </div>
            )}
            <EditableField label="Last Test Date" value={data.antiDopingLastTest || ""} editMode={editMode} onChange={(v) => update("antiDopingLastTest", v)} type="date" />
            {editMode ? (
              <EditableField label="Whereabouts" value={data.whereaboutsSubmitted ? "yes" : "no"} editMode={editMode} onChange={(v) => update("whereaboutsSubmitted", v === "yes")} type="select" options={[
                { label: "Submitted", value: "yes" }, { label: "Outstanding", value: "no" }
              ]} />
            ) : (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Whereabouts</p>
                <Badge variant={data.whereaboutsSubmitted ? "default" : "destructive"} className="text-xs">
                  {data.whereaboutsSubmitted ? "Submitted" : "Outstanding"}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepresentationSection;
