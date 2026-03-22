import { TravelLogistics } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, CreditCard, MapPin, Accessibility } from "lucide-react";

interface Props { data: TravelLogistics }

const TravelSection = ({ data }: Props) => (
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
          <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
            <div>
              <p className="text-sm font-medium text-foreground">{p.country}</p>
              <p className="text-xs text-muted-foreground">{p.number}</p>
            </div>
            <div className="flex items-center gap-2">
              {p.biometricEnabled && <Badge variant="outline" className="text-xs">Biometric</Badge>}
              <span className="text-xs text-muted-foreground">exp. {p.expiryDate}</span>
            </div>
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
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-foreground">{v.country}</p>
                <p className="text-xs text-muted-foreground">{v.type}{v.multiEntry ? " (Multi-entry)" : ""}</p>
              </div>
              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                <span className="text-xs text-muted-foreground">exp. {v.expiryDate}</span>
                <Badge variant={statusColor} className="text-xs">{v.status}</Badge>
              </div>
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
          <Field label="Seat Preference" value={data.travelPreferences.seatPreference} />
          <Field label="Meal Preference" value={data.travelPreferences.mealPreference} />
          <Field label="Frequent Flyer" value={data.travelPreferences.frequentFlyerPrograms.join(", ")} />
          {data.travelPreferences.hotelPreferences && <Field label="Hotel Preferences" value={data.travelPreferences.hotelPreferences} />}
          {data.travelPreferences.specialRequirements && (
            <div className="sm:col-span-2">
              <Field label="Special Requirements" value={data.travelPreferences.specialRequirements} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Accessibility */}
    {data.accessibilityRequirements && data.accessibilityRequirements.length > 0 && (
      <Card className="border-border border-info/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-info">
            <Accessibility className="w-4 h-4" /> Accessibility Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {data.accessibilityRequirements.map((r, i) => (
              <li key={i} className="text-sm text-foreground flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-info mt-1.5 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    )}
  </div>
);

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

export default TravelSection;
