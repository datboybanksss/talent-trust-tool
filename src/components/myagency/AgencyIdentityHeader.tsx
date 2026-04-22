import { useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import type { AgencyProfile } from "@/pages/MyAgency";
import { useToast } from "@/hooks/use-toast";

interface Props {
  profile: AgencyProfile;
  userEmail: string;
  onUpdated: () => void;
  onError: (msg: string) => void;
}

const SA_PHONE = /^(?:\+27|0)[0-9]{9}$/;

const AgencyIdentityHeader = ({ profile, userEmail, onUpdated, onError }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState(profile.company_name);
  const [registration, setRegistration] = useState(profile.registration_number ?? "");
  const [role, setRole] = useState(profile.role);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dirty =
    companyName !== profile.company_name ||
    (registration || "") !== (profile.registration_number ?? "") ||
    role !== profile.role ||
    (phone || "") !== (profile.phone ?? "");

  const handleSave = async () => {
    const trimmedName = companyName.trim();
    if (!trimmedName) return onError("Company name is required.");
    if (phone && !SA_PHONE.test(phone)) return onError("Phone must be SA format (+27… or 0…).");

    setSaving(true);
    const { error } = await supabase
      .from("agent_manager_profiles")
      .update({
        company_name: trimmedName,
        registration_number: registration.trim() || null,
        role,
        phone: phone.trim() || null,
      })
      .eq("user_id", profile.user_id);
    setSaving(false);
    if (error) {
      console.error("[MyAgency] update failed", error);
      return onError(error.message);
    }
    toast({ title: "Agency updated" });
    onUpdated();
  };

  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) return onError("Logo must be under 2MB.");
    if (!/^image\/(png|jpeg|jpg|webp|svg\+xml)$/.test(file.type)) {
      return onError("Logo must be PNG, JPG, WEBP or SVG.");
    }
    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/logo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("agency-logos")
      .upload(path, file, { upsert: true, contentType: file.type });
    if (upErr) {
      setUploading(false);
      console.error("[MyAgency] logo upload failed", upErr);
      return onError(upErr.message);
    }
    const { data: pub } = supabase.storage.from("agency-logos").getPublicUrl(path);
    const { error: updErr } = await supabase
      .from("agent_manager_profiles")
      .update({ logo_url: pub.publicUrl })
      .eq("user_id", user.id);
    setUploading(false);
    if (updErr) {
      console.error("[MyAgency] logo URL save failed", updErr);
      return onError(updErr.message);
    }
    toast({ title: "Logo updated" });
    onUpdated();
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="relative w-24 h-24 shrink-0 rounded-2xl bg-secondary border border-border overflow-hidden flex items-center justify-center">
            {profile.logo_url ? (
              <img src={profile.logo_url} alt="Agency logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-bold text-xl">Agency identity</h2>
            <p className="text-xs text-muted-foreground mb-3">These details appear across the portal and shared reports.</p>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={handleLogo} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <Upload className="w-3 h-3 mr-1" />}
              {profile.logo_url ? "Replace logo" : "Upload logo"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Company name</Label>
            <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>
          <div>
            <Label>Registration number</Label>
            <Input value={registration} onChange={(e) => setRegistration(e.target.value)} placeholder="YYYY/NNNNNN/NN" />
          </div>
          <div>
            <Label>Role within agency</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="athlete_agent">Athletes' Agent</SelectItem>
                <SelectItem value="artist_manager">Artists' Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+27 81 234 5678" />
          </div>
          <div className="md:col-span-2">
            <Label>Contact email</Label>
            <Input value={userEmail} disabled />
            <p className="text-xs text-muted-foreground mt-1">Change your email from your account settings.</p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={!dirty || saving}>
            {saving && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
            Save changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AgencyIdentityHeader;