import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, ShieldAlert, Settings2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { AgencyProfile } from "@/pages/MyAgency";
import DeleteAgencyDialog from "./DeleteAgencyDialog";

interface Props {
  profile: AgencyProfile;
  isDemo: boolean;
  userEmail: string;
}

const POPIACompliancePanel = ({ profile, isDemo, userEmail }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    const [{ data: agent }, { data: invitations }, { data: shares }] = await Promise.all([
      supabase.from("agent_manager_profiles").select("*").eq("user_id", user.id),
      supabase.from("client_invitations").select("*").eq("agent_id", user.id),
      supabase.from("life_file_shares").select("*").eq("shared_with_user_id", user.id),
    ]);
    const payload = {
      exported_at: new Date().toISOString(),
      account_email: userEmail,
      agency_profile: agent ?? [],
      invitations_sent: invitations ?? [],
      shares_received: shares ?? [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `myagency-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    await supabase.from("audit_log").insert({
      action: "export_agency_data",
      entity_type: "agent_account",
      entity_id: user.id,
      user_id: user.id,
    });
    setExporting(false);
    toast({ title: "Export downloaded" });
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div>
          <h2 className="font-display font-bold text-xl flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-primary" /> POPIA &amp; data rights
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Your clients own their own data. These tools cover your agency's data only.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button variant="outline" onClick={handleExport} disabled={exporting} className="justify-start">
            <Download className="w-4 h-4 mr-2" />
            {exporting ? "Exporting…" : "Export my data"}
          </Button>
          <Button variant="outline" disabled className="justify-start opacity-60">
            <Settings2 className="w-4 h-4 mr-2" />
            Privacy settings (coming soon)
          </Button>
          {isDemo ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button variant="destructive" disabled className="w-full justify-start opacity-60">
                      Delete agency account
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Demo accounts cannot be deleted from the UI.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button variant="destructive" onClick={() => setDeleteOpen(true)} className="justify-start">
              Delete agency account
            </Button>
          )}
        </div>
      </CardContent>
      <DeleteAgencyDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        companyName={profile.company_name}
      />
    </Card>
  );
};

export default POPIACompliancePanel;