import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Trophy,
  Building2,
  Save,
  Camera
} from "lucide-react";
import { useState } from "react";

const Profile = () => {
  const [clientType, setClientType] = useState<"athlete" | "artist" | "entrepreneur">("athlete");

  return (
    <DashboardLayout 
      title="My Profile" 
      subtitle="Manage your personal information and preferences"
    >
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
          <div className="text-center mb-6">
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-3xl font-bold text-primary-foreground">
                JD
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-gold rounded-full flex items-center justify-center text-forest-dark hover:bg-gold-light transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mt-4">John Doe</h2>
            <p className="text-muted-foreground">Professional Athlete</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">john.doe@email.com</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">+27 82 123 4567</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">Johannesburg, South Africa</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">Member since Jan 2026</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border">
            <h4 className="text-sm font-medium text-foreground mb-3">Profile Completion</h4>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gold rounded-full" style={{ width: "85%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">85% complete</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client Type Selection */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-foreground mb-4">Client Type</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select your primary profession to customize your experience
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <ClientTypeOption
                icon={Trophy}
                title="Athlete"
                selected={clientType === "athlete"}
                onClick={() => setClientType("athlete")}
              />
              <ClientTypeOption
                icon={User}
                title="Artist"
                selected={clientType === "artist"}
                onClick={() => setClientType("artist")}
              />
              <ClientTypeOption
                icon={Building2}
                title="Entrepreneur"
                selected={clientType === "entrepreneur"}
                onClick={() => setClientType("entrepreneur")}
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-foreground mb-6">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="First Name" defaultValue="John" />
              <FormField label="Last Name" defaultValue="Doe" />
              <FormField label="Email Address" defaultValue="john.doe@email.com" type="email" />
              <FormField label="Phone Number" defaultValue="+27 82 123 4567" type="tel" />
              <FormField label="ID Number" defaultValue="9001015009087" />
              <FormField label="Date of Birth" defaultValue="1990-01-01" type="date" />
            </div>
          </div>

          {/* Address Information */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
            <h3 className="text-lg font-semibold text-foreground mb-6">Address</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <FormField label="Street Address" defaultValue="123 Main Street, Sandton" />
              </div>
              <FormField label="City" defaultValue="Johannesburg" />
              <FormField label="Province" defaultValue="Gauteng" />
              <FormField label="Postal Code" defaultValue="2196" />
              <FormField label="Country" defaultValue="South Africa" />
            </div>
          </div>

          {/* Athlete-Specific Fields */}
          {clientType === "athlete" && (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-foreground mb-6">Athletic Profile</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Sport" defaultValue="Rugby" />
                <FormField label="Team/Club" defaultValue="Bulls Rugby" />
                <FormField label="Agent Name" defaultValue="Mike Smith" />
                <FormField label="Agent Contact" defaultValue="+27 82 555 1234" />
              </div>
            </div>
          )}

          {/* Artist-Specific Fields */}
          {clientType === "artist" && (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-foreground mb-6">Artist Profile</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <FormField label="Art Form" defaultValue="" placeholder="e.g., Music, Visual Art, Acting" />
                <FormField label="Stage Name" defaultValue="" placeholder="Your professional name" />
                <FormField label="Label/Gallery" defaultValue="" placeholder="Representation" />
                <FormField label="Manager Contact" defaultValue="" placeholder="Manager phone/email" />
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button variant="gold" size="lg">
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

interface ClientTypeOptionProps {
  icon: React.ElementType;
  title: string;
  selected: boolean;
  onClick: () => void;
}

const ClientTypeOption = ({ icon: Icon, title, selected, onClick }: ClientTypeOptionProps) => (
  <button
    onClick={onClick}
    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
      selected
        ? "border-gold bg-gold/10"
        : "border-border hover:border-gold/50"
    }`}
  >
    <div
      className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-3 ${
        selected ? "bg-gold text-forest-dark" : "bg-secondary text-muted-foreground"
      }`}
    >
      <Icon className="w-6 h-6" />
    </div>
    <p className={`font-medium ${selected ? "text-gold" : "text-foreground"}`}>{title}</p>
  </button>
);

interface FormFieldProps {
  label: string;
  defaultValue?: string;
  type?: string;
  placeholder?: string;
}

const FormField = ({ label, defaultValue, type = "text", placeholder }: FormFieldProps) => (
  <div>
    <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
    <input
      type={type}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 bg-secondary rounded-lg border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
    />
  </div>
);

export default Profile;
