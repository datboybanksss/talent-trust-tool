import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAgencyScope } from "@/hooks/useAgencyScope";
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
  FileText, Mail, Copy, CheckCircle2, Clock, Settings2, Pencil, Send, Crown
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
  invitationToken: string | null;
  expiresAt: string | null;
}

const SharePortal = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { scopedAgentId, workspaceRole, agencyOwnerName } = useAgencyScope();
  const isStaffViewer = workspaceRole === "staff";
  const [staff, setStaff] = useState<SharedStaffMember[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ownerRow, setOwnerRow] = useState<{ name: string; email: string | null; agencyName: string } | null>(null);

  const fetchStaff = useCallback(async () => {
    if (!user || !scopedAgentId) return;
    let query = supabase
      .from("portal_staff_access")
      .select("*")
      .eq("agent_id", scopedAgentId)
      .order("created_at", { ascending: false });
    if (isStaffViewer) {
      // Staff only see active members (not pending invites)
      query = query.eq("status", "active").not("activated_at", "is", null);
    }
    const { data, error } = await query;

    // Load owner card
    const [{ data: agency }, { data: ownerProfile }] = await Promise.all([
      supabase.from("agent_manager_profiles").select("company_name").eq("user_id", scopedAgentId).maybeSingle(),
      supabase.from("profiles").select("display_name").eq("user_id", scopedAgentId).maybeSingle(),
    ]);
    setOwnerRow({
      name: ownerProfile?.display_name ?? agencyOwnerName ?? "Agency Owner",
      email: isStaffViewer ? null : user.email ?? null,
      agencyName: agency?.company_name ?? "Your Agency",
    });

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
        invitationToken: d.invitation_token ?? null,
        expiresAt: d.expires_at ?? null,
      })));
    }
    setLoadingStaff(false);
  }, [user, scopedAgentId, isStaffViewer, agencyOwnerName]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  // Form state (invite)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [customSections, setCustomSections] = useState<PortalSection[]>([]);
  const [confidentialityAccepted, setConfidentialityAccepted] = useState(false);

  // Edit state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<SharedStaffMember | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editSections, setEditSections] = useState<PortalSection[]>([]);

  const activePreset = ROLE_PRESETS.find((r) => r.id === selectedRole);
  const effectiveSections = selectedRole === "custom" ? customSections : (activePreset?.sections ?? []);

  const toggleSection = (s: PortalSection) => {
    setCustomSections((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleInvite = async () => {
    if (!name || !email || !selectedRole || !confidentialityAccepted || !user) return;
    const preset = ROLE_PRESETS.find((r) => r.id === selectedRole)!;
    const roleLabel = selectedRole === "custom" ? "Custom Role" : preset.label;

    const { data: inserted, error } = await supabase.from("portal_staff_access").insert({
      agent_id: user.id,
      staff_email: email,
      staff_name: name,
      role: selectedRole,
      role_label: roleLabel,
      sections: effectiveSections,
      status: "pending",
    }).select("id").single();

    if (error || !inserted) {
      toast({ title: "Error", description: "Could not send invitation.", variant: "destructive" });
      return;
    }

    // Fire-and-track email
    const { data: emailRes, error: emailErr } = await supabase.functions.invoke("send-invitation-email", {
      body: {
        invitation_type: "staff",
        invitation_id: inserted.id,
        app_origin: window.location.origin,
      },
    });

    if (emailErr || (emailRes && !emailRes.success)) {
      toast({
        title: "Invitation saved — email failed",
        description: `${name}'s invitation is saved, but email delivery failed. Use the Copy Link button on their row to send it manually.`,
        variant: "destructive",
      });
    } else if (emailRes?.demo) {
      toast({ title: "Demo mode", description: "Invitation saved. Email was not sent because this is a demo account." });
    } else {
      toast({ title: "Invitation emailed", description: `${name} has been invited as ${roleLabel}. They'll receive a branded email with the activation link.` });
    }

    setName("");
    setEmail("");
    setSelectedRole("");
    setCustomSections([]);
    setConfidentialityAccepted(false);
    setDialogOpen(false);
    fetchStaff();
  };

  const buildActivationUrl = (token: string | null) =>
    token ? `${window.location.origin}/staff-activate/${token}` : null;

  const handleCopyLink = async (member: SharedStaffMember) => {
    const url = buildActivationUrl(member.invitationToken);
    if (!url) {
      toast({ title: "No link available", description: "Refresh the page and try again.", variant: "destructive" });
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied", description: `Activation link for ${member.name} is on your clipboard.` });
    } catch {
      toast({ title: "Copy failed", description: url, variant: "destructive" });
    }
  };

  const handleResend = async (member: SharedStaffMember) => {
    // If expired, refresh expires_at first
    if (member.expiresAt && new Date(member.expiresAt) <= new Date()) {
      const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from("portal_staff_access").update({ expires_at: newExpiry }).eq("id", member.id);
    }
    const { data: emailRes, error: emailErr } = await supabase.functions.invoke("send-invitation-email", {
      body: { invitation_type: "staff", invitation_id: member.id, app_origin: window.location.origin },
    });
    if (emailErr || (emailRes && !emailRes.success)) {
      toast({ title: "Resend failed", description: emailRes?.error ?? "Email delivery failed.", variant: "destructive" });
    } else if (emailRes?.demo) {
      toast({ title: "Demo mode", description: "Email not actually sent (demo account)." });
    } else {
      toast({ title: "Invitation resent", description: `Fresh invitation emailed to ${member.name}.` });
      await supabase.from("audit_log").insert({
        action: "invitation_resent",
        entity_type: "invitation",
        entity_id: member.id,
        user_id: user?.id ?? null,
        metadata: { invitation_type: "staff", recipient: member.email },
      });
    }
    fetchStaff();
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase.from("portal_staff_access").delete().eq("id", id);
    if (!error) {
      setStaff((prev) => prev.filter((s) => s.id !== id));
      toast({ title: "Access revoked", description: "Staff member's access has been removed." });
    }
  };

  const openEdit = (member: SharedStaffMember) => {
    setEditingMember(member);
    setEditRole(member.role);
    setEditSections([...member.sections]);
    setEditDialogOpen(true);
  };

  const editActivePreset = ROLE_PRESETS.find((r) => r.id === editRole);
  const editEffectiveSections = editRole === "custom" ? editSections : (editActivePreset?.sections ?? []);

  const toggleEditSection = (s: PortalSection) => {
    setEditSections((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleSaveEdit = async () => {
    if (!editingMember) return;
    const preset = ROLE_PRESETS.find((r) => r.id === editRole);
    const roleLabel = editRole === "custom" ? "Custom Role" : (preset?.label ?? "Custom Role");

    const { error } = await supabase
      .from("portal_staff_access")
      .update({
        role: editRole,
        role_label: roleLabel,
        sections: editEffectiveSections,
      })
      .eq("id", editingMember.id);

    if (error) {
      toast({ title: "Error", description: "Could not update staff member.", variant: "destructive" });
      return;
    }

    toast({ title: "Updated", description: `${editingMember.name}'s role has been updated.` });
    setEditDialogOpen(false);
    setEditingMember(null);
    fetchStaff();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Share Portal Access</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {isStaffViewer
              ? "View your agency's team. Only the owner can invite staff or change roles."
              : "Invite support staff, PAs, accountants, or lawyers with pre-determined access levels."}
          </p>
        </div>
        {!isStaffViewer && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
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
        )}
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
                  <TableHead>Confidentiality</TableHead>
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
                      {member.confidentialityAcceptedAt ? (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Accepted
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" /> Awaiting
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {member.status !== "active" && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => handleCopyLink(member)} title="Copy activation link">
                              <Copy className="w-4 h-4 text-muted-foreground" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleResend(member)} title="Resend invitation email">
                              <Send className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => openEdit(member)}>
                          <Pencil className="w-4 h-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleRevoke(member.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Staff Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Staff Access</DialogTitle>
            <DialogDescription>
              Update role and section access for {editingMember?.name}.
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4 pt-2">
              <div className="rounded-lg border border-border p-3">
                <p className="font-medium text-sm">{editingMember.name}</p>
                <p className="text-xs text-muted-foreground">{editingMember.email}</p>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editRole} onValueChange={(val) => {
                  setEditRole(val);
                  if (val !== "custom") {
                    const preset = ROLE_PRESETS.find((r) => r.id === val);
                    setEditSections(preset?.sections ?? []);
                  }
                }}>
                  <SelectTrigger><SelectValue placeholder="Select a role..." /></SelectTrigger>
                  <SelectContent>
                    {ROLE_PRESETS.map((r) => (
                      <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editActivePreset && <p className="text-xs text-muted-foreground">{editActivePreset.description}</p>}
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  {editRole === "custom" ? "Choose sections" : "Sections included (customisable)"}
                </Label>
                <div className="space-y-2">
                  {ALL_SECTIONS.map((sec) => {
                    const enabled = editEffectiveSections.includes(sec.id);
                    return (
                      <div key={sec.id} className="flex items-center justify-between p-2 rounded-lg border border-border">
                        <div className="flex items-center gap-2">
                          <sec.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{sec.label}</span>
                        </div>
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => {
                            if (editRole !== "custom") {
                              if (!editSections.length) setEditSections(editActivePreset?.sections ?? []);
                              setEditRole("custom");
                            }
                            toggleEditSection(sec.id);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button onClick={handleSaveEdit} disabled={editEffectiveSections.length === 0} className="w-full" variant="gold">
                Save Changes
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SharePortal;
