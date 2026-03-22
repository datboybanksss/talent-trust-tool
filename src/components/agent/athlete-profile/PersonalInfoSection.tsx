import { PersonalInfo } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, MapPin, AlertTriangle } from "lucide-react";
import EditableField from "./EditableField";
import { Input } from "@/components/ui/input";

interface Props {
  data: PersonalInfo;
  editMode?: boolean;
  onChange?: (data: PersonalInfo) => void;
}

const PersonalInfoSection = ({ data, editMode = false, onChange }: Props) => {
  const update = (field: keyof PersonalInfo, value: any) => {
    onChange?.({ ...data, [field]: value });
  };

  return (
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
            <EditableField label="First Name" value={data.firstName} editMode={editMode} onChange={(v) => update("firstName", v)} />
            <EditableField label="Last Name" value={data.lastName} editMode={editMode} onChange={(v) => update("lastName", v)} />
            <EditableField label="Preferred Name" value={data.preferredName || ""} editMode={editMode} onChange={(v) => update("preferredName", v)} />
            <EditableField label="Date of Birth" value={data.dateOfBirth} editMode={editMode} onChange={(v) => update("dateOfBirth", v)} type="date" />
            <EditableField label="Gender" value={data.gender} editMode={editMode} onChange={(v) => update("gender", v)} type="select" options={[
              { label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }
            ]} />
            <EditableField label="Nationality" value={data.nationality} editMode={editMode} onChange={(v) => update("nationality", v)} />
            <EditableField label="2nd Nationality" value={data.secondNationality || ""} editMode={editMode} onChange={(v) => update("secondNationality", v)} />
            <EditableField label="ID Number" value={data.idNumber || ""} editMode={editMode} onChange={(v) => update("idNumber", v)} />
            <EditableField label="Passport Number" value={data.passportNumber || ""} editMode={editMode} onChange={(v) => update("passportNumber", v)} />
            <EditableField label="Passport Expiry" value={data.passportExpiry || ""} editMode={editMode} onChange={(v) => update("passportExpiry", v)} type="date" />
            <EditableField label="Languages" value={data.languages.join(", ")} editMode={editMode} onChange={(v) => update("languages", v.split(",").map(s => s.trim()).filter(Boolean))} />
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
            <EditableField label="Email" value={data.email} editMode={editMode} onChange={(v) => update("email", v)} type="email" icon={!editMode ? <Mail className="w-3.5 h-3.5" /> : undefined} />
            <EditableField label="Phone" value={data.phone} editMode={editMode} onChange={(v) => update("phone", v)} type="tel" icon={!editMode ? <Phone className="w-3.5 h-3.5" /> : undefined} />
            <EditableField label="Address" value={data.address} editMode={editMode} onChange={(v) => update("address", v)} icon={!editMode ? <MapPin className="w-3.5 h-3.5" /> : undefined} className="sm:col-span-2" />
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
              <div key={i} className="p-3 bg-muted/50 rounded-xl">
                {editMode ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Input value={c.name} onChange={(e) => {
                      const updated = [...data.emergencyContacts];
                      updated[i] = { ...c, name: e.target.value };
                      update("emergencyContacts", updated);
                    }} placeholder="Name" className="text-sm h-9" />
                    <Input value={c.relationship} onChange={(e) => {
                      const updated = [...data.emergencyContacts];
                      updated[i] = { ...c, relationship: e.target.value };
                      update("emergencyContacts", updated);
                    }} placeholder="Relationship" className="text-sm h-9" />
                    <Input value={c.phone} onChange={(e) => {
                      const updated = [...data.emergencyContacts];
                      updated[i] = { ...c, phone: e.target.value };
                      update("emergencyContacts", updated);
                    }} placeholder="Phone" className="text-sm h-9" />
                    <Input value={c.email || ""} onChange={(e) => {
                      const updated = [...data.emergencyContacts];
                      updated[i] = { ...c, email: e.target.value };
                      update("emergencyContacts", updated);
                    }} placeholder="Email" className="text-sm h-9" />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.relationship}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{c.phone}</span>
                      {c.email && <span>{c.email}</span>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfoSection;
