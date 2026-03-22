import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, Lock, Eye, FileText, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ConfidentialityGateProps {
  staffAccessId: string;
  agentCompany: string;
  roleName: string;
  sections: string[];
  onAccepted: () => void;
}

const TERMS = [
  {
    icon: Lock,
    title: "Strict Confidentiality",
    text: "All client information, financial data, contracts, personal details, and any other data accessed through this portal are strictly confidential and proprietary.",
  },
  {
    icon: Eye,
    title: "Authorised Use Only",
    text: "Information may only be used for the specific purpose related to your designated role. You may not copy, share, forward, screenshot, print, or disclose any information to any third party without express written consent from the agent.",
  },
  {
    icon: FileText,
    title: "Legal Compliance (POPIA)",
    text: "Unauthorised use, distribution, or reproduction of any information constitutes a breach of confidentiality and may result in legal action under the Protection of Personal Information Act (POPIA), 2013 and applicable common law.",
  },
  {
    icon: AlertTriangle,
    title: "Access Revocation & Data Return",
    text: "Access may be revoked at any time without notice. Upon revocation or termination of your role, all data in your possession must be returned or permanently destroyed. You may not retain copies in any format.",
  },
];

const ConfidentialityGate = ({ staffAccessId, agentCompany, roleName, sections, onAccepted }: ConfidentialityGateProps) => {
  const [checked1, setChecked1] = useState(false);
  const [checked2, setChecked2] = useState(false);
  const [checked3, setChecked3] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const allChecked = checked1 && checked2 && checked3;

  const handleAccept = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("portal_staff_access")
        .update({ confidentiality_accepted_at: new Date().toISOString(), status: "active" })
        .eq("id", staffAccessId);

      if (error) throw error;
      toast({ title: "Terms Accepted", description: "You now have access to the portal." });
      onAccepted();
    } catch {
      toast({ title: "Error", description: "Could not record acceptance. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">Confidentiality Agreement</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Before accessing the <span className="font-medium text-foreground">{agentCompany}</span> portal as{" "}
            <span className="font-medium text-foreground">{roleName}</span>, you must acknowledge and accept the following terms.
          </p>
        </div>

        {/* Terms */}
        <div className="space-y-3">
          {TERMS.map((term, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="py-4 flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <term.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground mb-1">{term.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{term.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Access scope summary */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Your access scope:</span>{" "}
              {sections.length > 0 ? sections.join(", ") : "As defined by the agent."}
            </p>
          </CardContent>
        </Card>

        {/* Acknowledgement checkboxes */}
        <div className="space-y-3 rounded-xl border border-border p-5 bg-card">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Digital Acknowledgement</p>

          <div className="flex items-start gap-3">
            <Checkbox id="term1" checked={checked1} onCheckedChange={(c) => setChecked1(c === true)} />
            <label htmlFor="term1" className="text-xs leading-relaxed cursor-pointer text-foreground">
              I have read and understand all confidentiality terms set out above.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox id="term2" checked={checked2} onCheckedChange={(c) => setChecked2(c === true)} />
            <label htmlFor="term2" className="text-xs leading-relaxed cursor-pointer text-foreground">
              I agree to use all information solely for authorised purposes and will not disclose, copy, or share any data with unauthorised parties.
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox id="term3" checked={checked3} onCheckedChange={(c) => setChecked3(c === true)} />
            <label htmlFor="term3" className="text-xs leading-relaxed cursor-pointer text-foreground">
              I understand that breach of these terms may result in immediate access revocation and legal action under POPIA and applicable laws.
            </label>
          </div>
        </div>

        <Button
          variant="gold"
          size="lg"
          className="w-full"
          disabled={!allChecked || submitting}
          onClick={handleAccept}
        >
          <Shield className="w-4 h-4 mr-2" />
          {submitting ? "Recording acceptance..." : "I Accept — Grant Me Access"}
        </Button>

        <p className="text-[10px] text-muted-foreground text-center">
          Your acceptance is digitally recorded with a timestamp for audit and compliance purposes.
        </p>
      </div>
    </div>
  );
};

export default ConfidentialityGate;
