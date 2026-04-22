import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu, ArrowLeft } from "lucide-react";
import AgentSidebar from "@/components/agent/AgentSidebar";
import AgencyIdentityHeader from "@/components/myagency/AgencyIdentityHeader";
import AgencyStatsRow from "@/components/myagency/AgencyStatsRow";
import POPIACompliancePanel from "@/components/myagency/POPIACompliancePanel";
import { useStaffAccess } from "@/hooks/useStaffAccess";

export interface AgencyProfile {
  id: string;
  user_id: string;
  company_name: string;
  registration_number: string | null;
  role: string;
  phone: string | null;
  logo_url: string | null;
  created_at: string;
}

const MyAgency = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const staff = useStaffAccess();
  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = async () => {
    if (!user) return;
    const [{ data: agent }, { data: prof }] = await Promise.all([
      supabase
        .from("agent_manager_profiles")
        .select("id, user_id, company_name, registration_number, role, phone, logo_url, created_at")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("is_demo")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);
    if (agent) setProfile(agent as AgencyProfile);
    setIsDemo(Boolean(prof?.is_demo));
    setLoading(false);
  };

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Owner-only page: redirect staff away
  useEffect(() => {
    if (staff.loading) return;
    if (staff.isStaff) {
      toast({ title: "Owner-only section", description: "This section is only available to agency owners." });
      navigate("/agent-dashboard");
    }
  }, [staff.loading, staff.isStaff, navigate, toast]);

  if (loading || staff.loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading agency…</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">No agency profile found for this account.</p>
        <Button onClick={() => navigate("/agent-dashboard")}>Back to dashboard</Button>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AgentSidebar
          agentProfile={{ role: profile.role, company_name: profile.company_name }}
          activeView={"clients"}
          setActiveView={() => navigate("/agent-dashboard")}
          onNewClient={() => navigate("/agent-dashboard")}
          onBulkImport={() => navigate("/agent-dashboard")}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border h-14 flex items-center px-4 gap-3">
            <SidebarTrigger>
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <Button variant="ghost" size="sm" onClick={() => navigate("/agent-dashboard")}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Dashboard
            </Button>
            <h1 className="font-display font-bold text-lg ml-2">My Agency</h1>
          </header>
          <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full space-y-6">
            <AgencyIdentityHeader
              profile={profile}
              userEmail={user?.email ?? ""}
              onUpdated={reload}
              onError={(msg) =>
                toast({ title: "Update failed", description: msg, variant: "destructive" })
              }
            />
            <AgencyStatsRow agentUserId={profile.user_id} memberSince={profile.created_at} />
            <POPIACompliancePanel
              profile={profile}
              isDemo={isDemo}
              userEmail={user?.email ?? ""}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MyAgency;