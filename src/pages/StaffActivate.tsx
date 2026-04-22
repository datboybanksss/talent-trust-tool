import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import ConfidentialityGate from "@/components/agent/ConfidentialityGate";
import { Shield, Lock, AlertCircle, Loader2 } from "lucide-react";

interface StaffInvitationData {
  id: string;
  recipient_email: string;
  recipient_name: string;
  role_label: string;
  sections: string[];
  agency_name: string;
}

const StaffActivate = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [invitation, setInvitation] = useState<StaffInvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReturningUser, setIsReturningUser] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [accountReady, setAccountReady] = useState(false);

  useEffect(() => {
    if (!token) return;
    (async () => {
      const { data, error: fnError } = await supabase.functions.invoke("get-invitation-by-token", {
        body: { invitation_type: "staff", token },
      });
      if (fnError || data?.error) {
        setError(data?.error || "Invalid or expired invitation link.");
        setLoading(false);
        return;
      }
      setInvitation(data.invitation);

      // Detect existing account by attempting sign-in flow check via session
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session?.user?.email?.toLowerCase() === data.invitation.recipient_email.toLowerCase()) {
        // Already signed in as this user
        setIsReturningUser(true);
        setAccountReady(true);
      }
      setLoading(false);
    })();
  }, [token]);

  const acceptInvitation = async (userId: string) => {
    const { error: updErr } = await supabase
      .from("portal_staff_access")
      .update({
        staff_user_id: userId,
        // activated_at is set by ConfidentialityGate so all three RLS-required
        // fields (status, confidentiality_accepted_at, activated_at) land in
        // one atomic UPDATE on the same row.
      })
      .eq("id", invitation!.id);
    if (updErr) {
      toast({ title: "Error", description: "Could not link your account. Please try again.", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSignUp = async () => {
    if (!invitation) return;
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { data, error: signErr } = await supabase.auth.signUp({
      email: invitation.recipient_email,
      password,
      options: {
        data: { display_name: invitation.recipient_name },
        emailRedirectTo: `${window.location.origin}/staff-activate/${token}`,
      },
    });
    if (signErr || !data.user) {
      // Maybe account already exists — flip to sign-in mode
      if (signErr?.message?.toLowerCase().includes("registered")) {
        setIsReturningUser(true);
        toast({ title: "Account already exists", description: "Please sign in to accept this invitation." });
      } else {
        toast({ title: "Sign-up failed", description: signErr?.message ?? "Try again.", variant: "destructive" });
      }
      setSubmitting(false);
      return;
    }
    // Auto-accept once we have a user id
    const ok = await acceptInvitation(data.user.id);
    setSubmitting(false);
    if (ok) setAccountReady(true);
  };

  const handleSignIn = async () => {
    if (!invitation) return;
    if (!password) {
      toast({ title: "Password required", description: "Enter your password to sign in.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { data, error: signErr } = await supabase.auth.signInWithPassword({
      email: invitation.recipient_email,
      password,
    });
    if (signErr || !data.user) {
      toast({ title: "Sign-in failed", description: signErr?.message ?? "Try again.", variant: "destructive" });
      setSubmitting(false);
      return;
    }
    const ok = await acceptInvitation(data.user.id);
    setSubmitting(false);
    if (ok) setAccountReady(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-gold/20 p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your invitation…</p>
        </Card>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-gold/20">
          <CardContent className="pt-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
            <p className="text-foreground font-medium">{error}</p>
            <Button variant="gold" onClick={() => navigate("/auth")}>Go to Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Account ready → confidentiality gate, then redirect
  if (accountReady) {
    return (
      <ConfidentialityGate
        staffAccessId={invitation.id}
        agentCompany={invitation.agency_name}
        roleName={invitation.role_label}
        sections={invitation.sections}
        onAccepted={() => navigate("/agent-dashboard")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-gold/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-forest-dark" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            {isReturningUser ? "Sign in to accept" : "Activate Your Access"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {invitation.agency_name} invited you as <span className="font-medium text-foreground">{invitation.role_label}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-secondary/50 rounded-xl p-4 space-y-1 text-sm">
            <p><span className="font-medium">Name:</span> {invitation.recipient_name}</p>
            <p><span className="font-medium">Email:</span> {invitation.recipient_email}</p>
            <p><span className="font-medium">Sections:</span> {invitation.sections.join(", ") || "—"}</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label>{isReturningUser ? "Password" : "Create Password"}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isReturningUser ? "Your password" : "Min 6 characters"} className="pl-10" />
              </div>
            </div>
            {!isReturningUser && (
              <div>
                <Label>Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="pl-10" />
                </div>
              </div>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            After signing in you'll be asked to acknowledge a brief confidentiality agreement before accessing the portal.
          </p>

          <Button variant="gold" className="w-full" onClick={isReturningUser ? handleSignIn : handleSignUp} disabled={submitting || !password}>
            {submitting ? "Working…" : (isReturningUser ? "Sign In & Continue" : "Create Account & Continue")}
          </Button>

          <button
            type="button"
            onClick={() => { setIsReturningUser((v) => !v); setPassword(""); setConfirmPassword(""); }}
            className="text-xs text-muted-foreground hover:text-foreground underline w-full text-center"
          >
            {isReturningUser ? "I don't have an account yet" : "I already have an account — sign in instead"}
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffActivate;