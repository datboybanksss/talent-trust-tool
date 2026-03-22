import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  UserPlus, Trash2, Shield, Eye, Users, Kanban, CalendarDays,
  FileText, Mail, Copy, CheckCircle2, Clock, Settings2
} from "lucide-react";

type PortalSection = "clients" | "pipeline" | "calendar" | "compare" | "templates";

interface RolePreset {
  id: string;
  label: string;
  description: string;
  sections: PortalSection[];
}

const ROLE_PRESETS: RolePreset[] = [
  {
    id: "pa",
    label: "Personal Assistant (PA)",
    description: "Full access to manage clients, calendar, and pipeline on the agent's behalf.",
    sections: ["clients", "pipeline", "calendar", "compare", "templates"],
  },
  {
    id: "accountant",
    label: "Accountant",
    description: "View-only access to client financials and deal pipeline.",
    sections: ["clients", "pipeline", "compare"],
  },
  {
    id: "lawyer",
    label: "Legal / Lawyer",
    description: "Access to contracts, agreement templates, and client profiles.",
    sections: ["clients", "templates"],
  },
  {
    id: "custom",
    label: "Custom Role",
    description: "Choose which sections this person can access.",
    sections: [],
  },
];

const ALL_SECTIONS: { id: PortalSection; label: string; icon: React.ElementType }[] = [
  { id: "clients", label: "Clients", icon: Users },
  { id: "pipeline", label: "Deal Pipeline", icon: Kanban },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "compare", label: "Compare", icon: Settings2 },
  { id: "templates", label: "Agreement Templates", icon: FileText },
];

interface SharedStaffMember {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  sections: PortalSection[];
  status: "pending" | "active";
  invitedAt: string;
  confidentialityAcceptedAt: string | null;
}

const SharePortal = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [staff, setStaff] = useState<SharedStaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchStaff = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("portal_staff_access")
      .select("*")
      .eq("agent_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setStaff(data.map((d: any) => ({
        id: d.id,
        name: d.staff_name,
        email: d.staff_email,
        role: d.role,
        roleLabel: d.role_label,
        sections: (d.sections || []) as PortalSection[],
        status: d.status === "active" ? "active" : "pending",
        invitedAt: d.created_at,
        confidentialityAcceptedAt: d.confidentiality_accepted_at,
      })));
    }
    setLoadingStaff(false);
  }, [user]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [customSections, setCustomSections] = useState<PortalSection[]>([]);
  const [confidentialityAccepted, setConfidentialityAccepted] = useState(false);

  const activePreset = ROLE_PRESETS.find((r) => r.id === selectedRole);
  const effectiveSections = selectedRole === "custom" ? customSections : (activePreset?.sections ?? []);

  const toggleSection = (s: PortalSection) => {
    setCustomSections((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleInvite = async () => {
    if (!name || !email || !selectedRole || !confidentialityAccepted || !user) return;
    const preset = ROLE_PRESETS.find((r) => r.id === selectedRole)!;
    const roleLabel = selectedRole === "custom" ? "Custom Role" : preset.label;

    const { error } = await supabase.from("portal_staff_access").insert({
      agent_id: user.id,
      staff_email: email,
      staff_name: name,
      role: selectedRole,
      role_label: roleLabel,
      sections: effectiveSections,
      status: "pending",
    });

    if (error) {
      toast({ title: "Error", description: "Could not send invitation.", variant: "destructive" });
      return;
    }

    toast({ title: "Invitation sent", description: `${name} has been invited as ${roleLabel}. They must accept the confidentiality terms before accessing the portal.` });
    setName("");
    setEmail("");
    setSelectedRole("");
    setCustomSections([]);
    setConfidentialityAccepted(false);
    setDialogOpen(false);
    fetchStaff();
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase.from("portal_staff_access").delete().eq("id", id);
    if (!error) {
      setStaff((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Access revoked", description: "Staff member's access has been removed." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Share Portal Access</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Invite support staff, PAs, accountants, or lawyers with pre-determined access levels.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Invite Support Staff</DialogTitle>
              <DialogDescription>Grant access to your Agent Portal with role-based permissions.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input placeholder="e.g. Nomsa Dlamini" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="e.g. nomsa@agency.co.za" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger><SelectValue placeholder="Select a role..." /></SelectTrigger>
                  <SelectContent>
                    {ROLE_PRESETS.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activePreset && <p className="text-xs text-muted-foreground">{activePreset.description}</p>}
              </div>

              {/* Section toggles */}
              {selectedRole && (
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                    {selectedRole === "custom" ? "Choose sections" : "Sections included (customisable)"}
                  </Label>
                  <div className="space-y-2">
                    {ALL_SECTIONS.map((sec) => {
                      const enabled = effectiveSections.includes(sec.id);
                      return (
                        <div key={sec.id} className="flex items-center justify-between p-2 rounded-lg border border-border">
                          <div className="flex items-center gap-2">
                            <sec.icon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">{sec.label}</span>
                          </div>
                          <Switch
                            checked={enabled}
                            onCheckedChange={() => {
                              if (selectedRole !== "custom") {
                                // Allow overriding preset
                                if (!customSections.length) setCustomSections(activePreset?.sections ?? []);
                                setSelectedRole("custom");
                              }
                              toggleSection(sec.id);
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Confidentiality Acknowledgement */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold text-foreground">Confidentiality & Data Use Acknowledgement</p>
                </div>
                <div className="text-xs text-muted-foreground space-y-2 pl-6">
                  <p>By accepting this invitation, the invited person acknowledges and agrees to the following:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>All client information, financial data, contracts, and personal details accessed through this portal are strictly confidential.</li>
                    <li>Information may only be used for the specific purpose related to their designated role and may not be copied, shared, or disclosed to any third party.</li>
                    <li>Unauthorised use, distribution, or reproduction of any information constitutes a breach of confidentiality and may result in legal action under the Protection of Personal Information Act (POPIA) and common law.</li>
                    <li>Access may be revoked at any time without notice, and all data must be returned or destroyed upon revocation.</li>
                  </ul>
                </div>
                <div className="flex items-start gap-2 pl-6 pt-1">
                  <Checkbox
                    id="confidentiality"
                    checked={confidentialityAccepted}
                    onCheckedChange={(checked) => setConfidentialityAccepted(checked === true)}
                  />
                  <label htmlFor="confidentiality" className="text-xs leading-tight cursor-pointer text-foreground">
                    I confirm that the invited person will be required to acknowledge these confidentiality terms before accessing the portal.
                  </label>
                </div>
              </div>

              <Button onClick={handleInvite} disabled={!name || !email || !selectedRole || effectiveSections.length === 0 || !confidentialityAccepted} className="w-full" variant="gold">
                <Mail className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Compliance note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">POPIA Compliant.</span> Shared staff can only see sections you grant.
            Client data remains protected — staff access is view-only unless explicitly upgraded.
          </p>
        </CardContent>
      </Card>

      {/* Role legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ROLE_PRESETS.filter((r) => r.id !== "custom").map((role) => (
          <Card key={role.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">{role.label}</CardTitle>
              <CardDescription className="text-xs">{role.description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1">
                {role.sections.map((s) => (
                  <Badge key={s} variant="secondary" className="text-[10px]">
                    {ALL_SECTIONS.find((x) => x.id === s)?.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Staff table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Shared Staff ({staff.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStaff ? (
            <p className="text-center text-muted-foreground py-8 animate-pulse">Loading staff...</p>
          ) : staff.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No staff members invited yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Sections</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {staff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">{member.roleLabel}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.sections.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">
                            {ALL_SECTIONS.find((x) => x.id === s)?.label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {member.status === "active" ? (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" /> Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleRevoke(member.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SharePortal;
