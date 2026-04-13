import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Landmark, TrendingUp, Bitcoin, ShieldCheck, Bell, CheckCircle2, Loader2, Rocket
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const BANKS = [
  { value: "fnb", label: "FNB", logo: "🏦" },
  { value: "standard_bank", label: "Standard Bank", logo: "🏛️" },
  { value: "investec", label: "Investec", logo: "💎" },
  { value: "nedbank", label: "Nedbank", logo: "🟢" },
  { value: "absa", label: "Absa", logo: "🔴" },
  { value: "capitec", label: "Capitec", logo: "🔵" },
  { value: "discovery_bank", label: "Discovery Bank", logo: "🧬" },
  { value: "other", label: "Other", logo: "🏧" },
];

const FEATURES = [
  { icon: Landmark, title: "Banking", description: "Auto-sync balances from SA banks via Open Banking" },
  { icon: TrendingUp, title: "Investments", description: "Track unit trusts, ETFs, and retirement annuities" },
  { icon: Bitcoin, title: "Crypto", description: "Connect Luno, VALR, and hardware wallets" },
  { icon: ShieldCheck, title: "Insurance", description: "View life, disability, and short-term cover in one place" },
];

const FinancialIntegrations = () => {
  const { user } = useAuth();
  const [preferredBank, setPreferredBank] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleJoinWaitlist = async () => {
    if (!user) {
      toast.error("Please sign in to join the waitlist.");
      return;
    }
    if (!preferredBank) {
      toast.error("Please select your primary bank.");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("financial_integrations_waitlist").insert({
        user_id: user.id,
        email: user.email || "",
        preferred_bank: preferredBank,
        notes: notes.trim().slice(0, 500) || null,
      });

      if (error) {
        console.error("Waitlist error:", error);
        toast.error("Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      // Fire-and-forget confirmation email
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const sendEmailUrl = `https://${projectId}.supabase.co/functions/v1/send-email`;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      fetch(sendEmailUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}` },
        body: JSON.stringify({
          to: user.email,
          subject: "You're on the waitlist — LegacyBuilder Financial Integrations",
          html: `<h2>You're on the list! 🎉</h2><p>We'll notify you as soon as Financial Integrations go live. You selected <strong>${BANKS.find(b => b.value === preferredBank)?.label || preferredBank}</strong> as your primary bank.</p><p>— The LegacyBuilder Team</p>`,
        }),
      }).catch(() => {});

      setSubmitted(true);
      toast.success("You're on the waitlist!");
    } catch (err) {
      console.error("Waitlist error:", err);
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Financial Integrations" subtitle="Coming soon — connect your accounts for a unified financial view">
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 text-gold text-sm font-medium">
            <Rocket className="w-4 h-4" />
            Coming Soon
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Financial Integrations
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're building secure Open Banking integrations to give you a unified view of your banking, investments, crypto, and insurance — all in one place.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="border-border/50">
              <CardContent className="p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                </div>
                <Badge variant="outline" className="ml-auto text-xs shrink-0">Soon</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Waitlist form */}
        {submitted ? (
          <Card className="border-gold/30 bg-gold/5">
            <CardContent className="p-8 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-gold mx-auto" />
              <h2 className="text-xl font-display font-bold text-foreground">You're on the waitlist!</h2>
              <p className="text-muted-foreground">
                We'll notify you at <strong>{user?.email}</strong> as soon as Financial Integrations go live.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gold" />
                Join the Waitlist
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Be the first to know when we launch. Tell us which bank you'd like connected first.
              </p>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Bank *</Label>
                  <Select value={preferredBank} onValueChange={setPreferredBank}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your bank..." />
                    </SelectTrigger>
                    <SelectContent>
                      {BANKS.map((bank) => (
                        <SelectItem key={bank.value} value={bank.value}>
                          <span className="flex items-center gap-2">
                            <span>{bank.logo}</span> {bank.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Anything else? (optional)</Label>
                  <Textarea
                    placeholder="e.g. I also need crypto tracking..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                    maxLength={500}
                    rows={1}
                    className="min-h-[40px]"
                  />
                </div>
              </div>

              <Button
                onClick={handleJoinWaitlist}
                disabled={submitting || !preferredBank}
                className="gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                {submitting ? "Joining..." : "Join Waitlist"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Security note */}
        <div className="text-center text-xs text-muted-foreground space-y-1">
          <p>🔒 All future integrations will use read-only OAuth access, AES-256 encryption, and comply with POPIA & GDPR.</p>
          <p>No transaction credentials will ever be stored.</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FinancialIntegrations;
