import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Mail, AlertTriangle, LogOut } from "lucide-react";

const COOLDOWN_SECONDS = 60;

const EmailVerificationGate = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!user?.email || cooldown > 0) return;
    setIsSending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email,
    });
    setIsSending(false);

    if (error) {
      toast({
        title: "Failed to resend",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setCooldown(COOLDOWN_SECONDS);
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and spam folder.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-dark via-forest to-forest-light flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-gold/20">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-forest-dark" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Email Verification Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Warning banner */}
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-destructive">
                Action Required — Verify Your Email
              </p>
              <p className="text-muted-foreground mt-1">
                To keep access to your account, please verify your email address.
                Unverified accounts — including athletes, artists, agents, and
                managers — may be restricted or lose access to existing data.
              </p>
            </div>
          </div>

          <div className="text-center space-y-2">
            <Mail className="w-10 h-10 text-gold mx-auto" />
            <p className="text-sm text-muted-foreground">
              We sent a verification link to{" "}
              <span className="font-medium text-foreground">{user?.email}</span>.
              Please check your inbox and spam/junk folder.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="gold"
              className="w-full"
              onClick={handleResend}
              disabled={isSending || cooldown > 0}
            >
              {cooldown > 0
                ? `Resend in ${cooldown}s`
                : isSending
                  ? "Sending..."
                  : "Resend Verification Email"}
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => signOut()}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailVerificationGate;
