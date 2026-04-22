import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useStaffAccess } from "@/hooks/useStaffAccess";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Briefcase,
  Users,
  Kanban,
  BarChart3,
  CalendarDays,
  UserPlus,
  FileSpreadsheet,
  Mail,
  LogOut,
  Shield,
  Settings,
  FileText,
  Share2,
  Crown,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AgentSidebarProps {
  onNewClient: () => void;
  onBulkImport: () => void;
  agentProfile: { role: string; company_name: string } | null;
  activeView: "clients" | "pipeline" | "compare" | "calendar" | "templates" | "share" | "executive";
  setActiveView: (view: "clients" | "pipeline" | "compare" | "calendar" | "templates" | "share" | "executive") => void;
}

const mainNavItems = [
  { title: "Executive Overview", icon: Crown, view: "executive" as const, ownerOnly: true },
  { title: "Clients", icon: Users, view: "clients" as const, section: "clients" },
  { title: "Compare", icon: BarChart3, view: "compare" as const, section: "compare" },
  { title: "Calendar", icon: CalendarDays, view: "calendar" as const, section: "calendar" },
  { title: "Deal Pipeline", icon: Kanban, view: "pipeline" as const, section: "pipeline" },
  { title: "Agreement Templates", icon: FileText, view: "templates" as const, section: "templates" },
  { title: "Share Portal", icon: Share2, view: "share" as const, ownerOnly: true },
];

const AgentSidebar = ({ onNewClient, onBulkImport, agentProfile, activeView, setActiveView }: AgentSidebarProps) => {
  const { state, isMobile, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const staff = useStaffAccess();

  const visibleNavItems = mainNavItems.filter((item) => {
    if (!staff.isStaff) return true;
    if (item.ownerOnly) return false;
    return item.section ? staff.sections.includes(item.section) : false;
  });

  // Quick Actions: New Client + Bulk Import are write actions on client_invitations.
  // Show them when viewer is the owner OR staff with the 'clients' section.
  const canCreateClients = !staff.isStaff || staff.sections.includes("clients");
  const showQuickActions = canCreateClients;
  const showOwnerOnly = !staff.isStaff;

  const handleNavClick = (view: typeof activeView) => {
    setActiveView(view);
    if (isMobile) toggleSidebar();
  };

  const handleAction = (action: () => void) => {
    action();
    if (isMobile) toggleSidebar();
  };

  const roleLabel = agentProfile?.role === "athlete_agent" ? "Athletes' Agent" : "Artists' Manager";
  const footerRoleLabel = staff.isStaff ? (staff.roleLabel ?? "Staff") : roleLabel;

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        {/* Brand */}
        <SidebarGroup>
          <div className="flex items-center gap-2 px-2 py-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shrink-0">
              <Briefcase className="w-4.5 h-4.5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p
                  className="text-sm font-display font-bold text-foreground truncate"
                  title={
                    staff.isStaff
                      ? staff.agencyName ?? "Agent Portal"
                      : agentProfile?.company_name ?? "Agent Portal"
                  }
                >
                  {staff.isStaff
                    ? staff.agencyName ?? "Agent Portal"
                    : agentProfile?.company_name ?? "Agent Portal"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{footerRoleLabel}</p>
              </div>
            )}
          </div>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    onClick={() => handleNavClick(item.view)}
                    className={`hover:bg-muted/50 ${activeView === item.view ? "bg-primary/10 text-primary font-medium" : ""}`}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {showOwnerOnly && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => { navigate("/myagency"); if (isMobile) toggleSidebar(); }}
                    className="hover:bg-muted/50"
                  >
                    <Building2 className="mr-2 h-4 w-4" />
                    {!collapsed && <span>My Agency</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        {showQuickActions && (
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => handleAction(onNewClient)} className="hover:bg-muted/50">
                  <UserPlus className="mr-2 h-4 w-4 text-primary" />
                  {!collapsed && <span>Add New Client</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => handleAction(onBulkImport)} className="hover:bg-muted/50">
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-primary" />
                  {!collapsed && <span>Bulk Import</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled className="hover:bg-muted/50 opacity-50">
                  <Mail className="mr-2 h-4 w-4 text-primary" />
                  {!collapsed && <span>Resend All Pending</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {/* Compliance */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-start gap-2 px-2 py-2 text-xs text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {!collapsed && (
                    <span className="leading-tight">POPIA compliant — clients control their own access.</span>
                  )}
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 pb-2 pt-1">
          <button
            type="button"
            onClick={() => { navigate("/agent-account"); if (isMobile) toggleSidebar(); }}
            className="w-full text-left bg-secondary hover:bg-secondary/80 transition-colors rounded-xl p-3 flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-primary/40"
            aria-label="Open account settings"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <UserCircle2 className="w-4 h-4 text-primary" />
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">
                  {user?.email ?? "My account"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {footerRoleLabel} · Account settings
                </p>
              </div>
            )}
            {!collapsed && <Settings className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground shrink-0" />}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AgentSidebar;
