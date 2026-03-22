import { PersonalInfo } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, Globe, Shield, AlertTriangle } from "lucide-react";

interface Props { data: PersonalInfo }

const PersonalInfoSection = ({ data }: Props) => (
  <div className="space-y-6">
    {/* Identity */}
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Identity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Full Name" value={`${data.firstName} ${data.lastName}`} />
          {data.preferredName && <Field label="Preferred Name" value={data.preferredName} />}
          <Field label="Date of Birth" value={data.dateOfBirth} />
          <Field label="Gender" value={data.gender} />
          <Field label="Nationality" value={data.nationality} />
          {data.secondNationality && <Field label="2nd Nationality" value={data.secondNationality} />}
          {data.idNumber && <Field label="ID Number" value={data.idNumber} />}
          {data.passportNumber && <Field label="Passport" value={data.passportNumber} />}
          {data.passportExpiry && <Field label="Passport Expiry" value={data.passportExpiry} />}
          <Field label="Languages" value={data.languages.join(", ")} />
        </div>
      </CardContent>
    </Card>

    {/* Contact */}
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" /> Contact Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Email" value={data.email} icon={<Mail className="w-3.5 h-3.5" />} />
          <Field label="Phone" value={data.phone} icon={<Phone className="w-3.5 h-3.5" />} />
          <Field label="Address" value={data.address} icon={<MapPin className="w-3.5 h-3.5" />} className="sm:col-span-2" />
        </div>
      </CardContent>
    </Card>

    {/* Emergency Contacts */}
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-warning" /> Emergency Contacts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.emergencyContacts.map((c, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-muted/50 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.relationship}</p>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{c.phone}</span>
                {c.email && <span>{c.email}</span>}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const Field = ({ label, value, icon, className }: { label: string; value: string; icon?: React.ReactNode; className?: string }) => (
  <div className={className}>
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
      {icon}{value}
    </p>
  </div>
);

export default PersonalInfoSection;
