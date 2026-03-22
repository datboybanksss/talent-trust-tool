import { TravelLogistics } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, CreditCard, MapPin, Accessibility } from "lucide-react";
import { Input } from "@/components/ui/input";
import EditableField from "./EditableField";

interface Props {
  data: TravelLogistics;
  editMode?: boolean;
  onChange?: (data: TravelLogistics) => void;
}

const TravelSection = ({ data, editMode = false, onChange }: Props) => {
  const update = (field: keyof TravelLogistics, value: any) => {
    onChange?.({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Passports */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" /> Passports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.passports.map((p, i) => (
            <div key={i} className="p-3 bg-muted/50 rounded-xl">
              {editMode ? (
                <div className="grid sm:grid-cols-3 gap-2">
                  <Input value={p.country} onChange={(e) => { const u = [...data.passports]; u[i] = { ...p, country: e.target.value }; update("passports", u); }} placeholder="Country" className="text-sm h-8" />
                  <Input value={p.number} onChange={(e) => { const u = [...data.passports]; u[i] = { ...p, number: e.target.value }; update("passports", u); }} placeholder="Number" className="text-sm h-8" />
                  <Input value={p.expiryDate} onChange={(e) => { const u = [...data.passports]; u[i] = { ...p, expiryDate: e.target.value }; update("passports", u); }} placeholder="Expiry" className="text-sm h-8" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.country}</p>
                    <p className="text-xs text-muted-foreground">{p.number}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {p.biometricEnabled && <Badge variant="outline" className="text-xs">Biometric</Badge>}
                    <span className="text-xs text-muted-foreground">exp. {p.expiryDate}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Visas */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Visas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.visas.map((v, i) => {
            const statusColor = v.status === "valid" ? "default" : v.status === "expired" ? "destructive" : "secondary";
            return (
              <div key={i} className="p-3 bg-muted/50 rounded-xl">
                {editMode ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    <Input value={v.country} onChange={(e) => { const u = [...data.visas]; u[i] = { ...v, country: e.target.value }; update("visas", u); }} placeholder="Country" className="text-sm h-8" />
                    <Input value={v.type} onChange={(e) => { const u = [...data.visas]; u[i] = { ...v, type: e.target.value }; update("visas", u); }} placeholder="Type" className="text-sm h-8" />
                    <Input value={v.expiryDate} onChange={(e) => { const u = [...data.visas]; u[i] = { ...v, expiryDate: e.target.value }; update("visas", u); }} placeholder="Expiry" className="text-sm h-8" />
                    <EditableField label="" value={v.status} editMode={true} onChange={(val) => { const u = [...data.visas]; u[i] = { ...v, status: val as any }; update("visas", u); }} type="select" options={[
                      { label: "Valid", value: "valid" }, { label: "Expired", value: "expired" }, { label: "Pending", value: "pending" }
                    ]} />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{v.country}</p>
                      <p className="text-xs text-muted-foreground">{v.type}{v.multiEntry ? " (Multi-entry)" : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 sm:mt-0">
                      <span className="text-xs text-muted-foreground">exp. {v.expiryDate}</span>
                      <Badge variant={statusColor} className="text-xs">{v.status}</Badge>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Travel Preferences */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Plane className="w-4 h-4 text-primary" /> Travel Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4">
            <EditableField label="Seat Preference" value={data.travelPreferences.seatPreference} editMode={editMode} onChange={(v) => update("travelPreferences", { ...data.travelPreferences, seatPreference: v })} />
            <EditableField label="Meal Preference" value={data.travelPreferences.mealPreference} editMode={editMode} onChange={(v) => update("travelPreferences", { ...data.travelPreferences, mealPreference: v })} />
            <EditableField label="Frequent Flyer" value={data.travelPreferences.frequentFlyerPrograms.join(", ")} editMode={editMode} onChange={(v) => update("travelPreferences", { ...data.travelPreferences, frequentFlyerPrograms: v.split(",").map(s => s.trim()).filter(Boolean) })} />
            <EditableField label="Hotel Preferences" value={data.travelPreferences.hotelPreferences || ""} editMode={editMode} onChange={(v) => update("travelPreferences", { ...data.travelPreferences, hotelPreferences: v })} />
            <EditableField label="Special Requirements" value={data.travelPreferences.specialRequirements || ""} editMode={editMode} onChange={(v) => update("travelPreferences", { ...data.travelPreferences, specialRequirements: v })} className="sm:col-span-2" />
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      {(data.accessibilityRequirements && data.accessibilityRequirements.length > 0) || editMode ? (
        <Card className="border-border border-info/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-info">
              <Accessibility className="w-4 h-4" /> Accessibility Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editMode ? (
              <EditableField label="Requirements (comma-separated)" value={(data.accessibilityRequirements || []).join(", ")} editMode={true} onChange={(v) => update("accessibilityRequirements", v.split(",").map(s => s.trim()).filter(Boolean))} />
            ) : (
              <ul className="space-y-1.5">
                {(data.accessibilityRequirements || []).map((r, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-info mt-1.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default TravelSection;
