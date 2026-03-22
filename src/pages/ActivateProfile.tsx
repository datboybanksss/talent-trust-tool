import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface InvitationData {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  client_type: string;
  status: string;
  pre_populated_data: Record<string, any>;
}

const ActivateProfile = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isActivating, setIsActivating] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const fetchInvitation = async () => {
    // Use the edge function to look up the invitation by token (bypasses RLS)
    const { data, error: fnError } = await supabase.functions.invoke("activate-client-profile", {
      body: { action: "lookup", token },
    });

    if (fnError || !data?.invitation) {
      setError(data?.error || "Invalid or expired activation link.");
      setLoading(false);
      return;
    }

    if (data.invitation.status === "activated") {
      setError("This profile has already been activated. Please sign in instead.");
      setLoading(false);
      return;
    }

    setInvitation(data.invitation);
    setLoading(false);
  };

  const handleActivate = async () => {
    if (!invitation || !password || !token) return;
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords don't match.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
      return;
    }

    setIsActivating(true);

    const { data, error: fnError } = await supabase.functions.invoke("activate-client-profile", {
      body: {
        action: "activate",
        token,
        password,
      },
    });

    setIsActivating(false);

    if (fnError || data?.error) {
      toast({
        title: "Activation failed",
        description: data?.error || "An error occurred. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setActivated(true);
    toast({ title: "Profile Activated!", description: "You can now sign in with your email and password." });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-gold/20 p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-gold mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying your activation link...</p>
        </Card>
      </div>
    );
  }

  if (error) {
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

  if (activated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-gold/20">
          <CardContent className="pt-8 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Profile Activated!</h2>
            <p className="text-muted-foreground text-sm">
              Your LegacyBuilder profile is ready. Sign in with your email ({invitation?.client_email}) and the password you just set.
            </p>
            <Button variant="gold" className="w-full" onClick={() => navigate("/auth")}>
              Sign In Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-gold/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-forest-dark" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Activate Your Profile</CardTitle>
          <CardDescription className="text-muted-foreground">
            Welcome, {invitation?.client_name}! Set a password to activate your LegacyBuilder profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pre-populated info preview */}
          <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-foreground">Your Profile Details</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><span className="font-medium">Name:</span> {invitation?.client_name}</p>
              <p><span className="font-medium">Email:</span> {invitation?.client_email}</p>
              {invitation?.client_phone && <p><span className="font-medium">Phone:</span> {invitation?.client_phone}</p>}
              <p><span className="font-medium">Type:</span> {invitation?.client_type === "athlete" ? "Athlete" : "Artist"}</p>
            </div>
          </div>

          {/* Password Setup */}
          <div className="space-y-4">
            <div>
              <Label>Create Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" className="pl-10" />
              </div>
            </div>
            <div>
              <Label>Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="pl-10" />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Your profile was prepared by your agent/manager. After activation, you have full control of your profile.
            Your agent/manager will not have automatic access — you may grant view access from your settings if you choose.
          </p>

          <Button variant="gold" className="w-full" onClick={handleActivate} disabled={isActivating || !password || !confirmPassword}>
            {isActivating ? "Activating..." : "Activate My Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivateProfile;
