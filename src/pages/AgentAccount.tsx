import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, Mail, Lock, LogOut, Shield, Building2, AlertTriangle, Loader2, KeyRound, Clock, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import { supabase } from "@/integrations/supabase/client";

const AgentAccount = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, signOut } = useAuth();
  const staff = useStaffAccess();

  const [displayName, setDisplayName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [agencyName, setAgencyName] = useState<string | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSubmitting, setPwSubmitting] = useState(false);

  const [leaving, setLeaving] = useState(false);

  // Load profile + agency name (owner) once
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (prof?.display_name) setDisplayName(prof.display_name);

      // Owner agency name (only meaningful if not staff)
      const { data: agency } = await supabase
        .from("agent_manager_profiles")
        .select("company_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (agency?.company_name) setAgencyName(agency.company_name);
    })();
  }, [user]);

  const lastSignIn = useMemo(() => {
    const ts = user?.last_sign_in_at;
    return ts ? format(new Date(ts), "PPpp") : "—";
  }, [user?.last_sign_in_at]);

  const provider = user?.app_metadata?.provider ?? "email";

  const handleSaveName = async () => {
    if (!user) return;
    if (!displayName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }
    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim(), updated_at: new Date().toISOString() })
      .eq("user_id", user.id);
    setSavingName(false);
    if (error) {
      toast({ title: "Could not save", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Profile updated" });
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }
    setEmailSubmitting(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    setEmailSubmitting(false);
    if (error) {
      toast({ title: "Could not request change", description: error.message, variant: "destructive" });
      return;
    }
    toast({
      title: "Verification sent",
      description: `We've emailed ${newEmail.trim()}. Click the link there to confirm the change. Your current email stays active until then.`,
    });
    setNewEmail("");
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setPwSubmitting(true);
    // Re-authenticate to confirm identity before changing password.
    const { error: reauthErr } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (reauthErr) {
      setPwSubmitting(false);
      toast({ title: "Current password incorrect", variant: "destructive" });
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPwSubmitting(false);
    if (error) {
      toast({ title: "Could not change password", description: error.message, variant: "destructive" });
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast({ title: "Password updated", description: "Use your new password next time you sign in." });
  };

  const handleLeaveAgency = async () => {
    if (!user || !staff.isStaff || !staff.agencyOwnerId) return;
    if (!window.confirm(`Leave ${staff.agencyName}? You'll lose access immediately. The owner can re-invite you later.`)) return;
    setLeaving(true);
    const { error } = await supabase
      .from("portal_staff_access")
      .update({ status: "revoked", updated_at: new Date().toISOString() })
      .eq("staff_user_id", user.id)
      .eq("agent_id", staff.agencyOwnerId);
    setLeaving(false);
    if (error) {
      toast({ title: "Could not leave", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "You've left the agency" });
    await signOut();
    navigate("/auth");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const brandLine = staff.isStaff
    ? staff.agencyName ?? "Agency"
    : agencyName ?? "Your Agency";
  const roleLine = staff.isStaff ? (staff.roleLabel ?? "Staff") : "Owner";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Account Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your personal sign-in, identity, and access.</p>
          </div>
        </div>

        {/* Identity summary (replaces the redundant sidebar block) */}
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-foreground truncate">{brandLine}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email} · {roleLine}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0 capitalize">{provider}</Badge>
          </CardContent>
        </Card>

        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><UserCircle2 className="w-4 h-4 text-primary" /> Profile</CardTitle>
            <CardDescription>How your name appears across the portal and on records you create.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="display_name">Display name</Label>
              <Input id="display_name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <Button onClick={handleSaveName} disabled={savingName}>
              {savingName ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save changes
            </Button>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Mail className="w-4 h-4 text-primary" /> Email address</CardTitle>
            <CardDescription>Used for sign-in and notifications. We'll send a verification link to confirm any change.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Current email</Label>
              <Input value={user?.email ?? ""} disabled />
            </div>
            <div>
              <Label htmlFor="new_email">New email</Label>
              <Input id="new_email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <Button onClick={handleRequestEmailChange} disabled={emailSubmitting || !newEmail}>
              {emailSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Send verification
            </Button>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Lock className="w-4 h-4 text-primary" /> Password</CardTitle>
            <CardDescription>Use at least 8 characters. We re-check your current password before saving.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="current_pw">Current password</Label>
              <Input id="current_pw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <div>
              <Label htmlFor="new_pw">New password</Label>
              <Input id="new_pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div>
              <Label htmlFor="confirm_pw">Confirm new password</Label>
              <Input id="confirm_pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleChangePassword} disabled={pwSubmitting || !currentPassword || !newPassword}>
                {pwSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                Update password
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  if (!user?.email) return;
                  await supabase.auth.resetPasswordForEmail(user.email, {
                    redirectTo: `${window.location.origin}/reset-password`,
                  });
                  toast({ title: "Reset email sent", description: `Check ${user.email} for a reset link.` });
                }}
              >
                Send me a reset link instead
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Session */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base"><Clock className="w-4 h-4 text-primary" /> Active session</CardTitle>
            <CardDescription>Signing out ends this session on this device.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Last sign-in</span><span className="text-foreground">{lastSignIn}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Sign-in method</span><span className="text-foreground capitalize">{provider}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Session expires</span><span className="text-foreground">{session?.expires_at ? format(new Date(session.expires_at * 1000), "PPpp") : "—"}</span></div>
            <Separator />
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" /> Sign out
            </Button>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="w-4 h-4" /> Danger zone
            </CardTitle>
            <CardDescription>
              {staff.isStaff
                ? "Leaving the agency revokes your own access. The owner can re-invite you later."
                : "To delete your agency account and all data, open My Agency → Account & Data."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {staff.isStaff ? (
              <Button variant="destructive" onClick={handleLeaveAgency} disabled={leaving}>
                {leaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                Leave {staff.agencyName ?? "this agency"}
              </Button>
            ) : (
              <Button variant="outline" onClick={() => navigate("/myagency")}>
                Go to My Agency
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgentAccount;
