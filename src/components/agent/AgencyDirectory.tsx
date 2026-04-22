import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAgencyScope } from "@/hooks/useAgencyScope";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, UserCircle2, CheckCircle2, Shield, Users } from "lucide-react";

interface DirectoryMember {
  user_id: string | null;
  name: string;
  email: string | null;
  roleLabel: string;
  sections: string[];
  joinedAt: string | null;
  isOwner: boolean;
}

const SECTION_LABELS: Record<string, string> = {
  clients: "Clients",
  pipeline: "Deal Pipeline",
  calendar: "Calendar",
  compare: "Compare",
  templates: "Agreement Templates",
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("") || "?";

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : null;

const AgencyDirectory = () => {
  const { user } = useAuth();
  const scope = useAgencyScope();
  const [members, setMembers] = useState<DirectoryMember[]>([]);
  const [agencyName, setAgencyName] = useState<string>("Your Agency");
  const [agencyRole, setAgencyRole] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!scope.scopedAgentId) return;
    setLoading(true);

    const ownerId = scope.scopedAgentId;

    const [{ data: agency }, { data: ownerProfile }, { data: staffRows }] = await Promise.all([
      supabase
        .from("agent_manager_profiles")
        .select("company_name, role")
        .eq("user_id", ownerId)
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("display_name")
        .eq("user_id", ownerId)
        .maybeSingle(),
      supabase
        .from("portal_staff_access")
        .select("staff_user_id, staff_name, staff_email, role_label, sections, activated_at, status")
        .eq("agent_id", ownerId)
        .eq("status", "active")
        .not("activated_at", "is", null)
        .order("activated_at", { ascending: true }),
    ]);

    setAgencyName(agency?.company_name ?? "Your Agency");
    setAgencyRole(
      agency?.role === "athlete_agent" ? "Athletes' Agent" : agency?.role === "artist_manager" ? "Artists' Manager" : "",
    );

    const ownerName =
      (scope.workspaceRole === "owner" ? ownerProfile?.display_name : ownerProfile?.display_name) ??
      scope.agencyOwnerName ??
      "Agency Owner";
    const ownerEmail = scope.workspaceRole === "owner" ? user?.email ?? null : null;

    const ownerRow: DirectoryMember = {
      user_id: ownerId,
      name: ownerName,
      email: ownerEmail,
      roleLabel: "Owner",
      sections: ["clients", "pipeline", "calendar", "compare", "templates"],
      joinedAt: null,
      isOwner: true,
    };

    const staffMembers: DirectoryMember[] = (staffRows ?? []).map((r: any) => ({
      user_id: r.staff_user_id,
      name: r.staff_name,
      email: r.staff_email,
      roleLabel: r.role_label ?? "Staff",
      sections: (r.sections ?? []) as string[],
      joinedAt: r.activated_at,
      isOwner: false,
    }));

    setMembers([ownerRow, ...staffMembers]);
    setLoading(false);
  }, [scope.scopedAgentId, scope.workspaceRole, scope.agencyOwnerName, user?.email]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> The Agency
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          {agencyName}
          {agencyRole ? ` · ${agencyRole}` : ""}
        </p>
      </div>

      {/* Compliance note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="py-3 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Workspace roster.</span>{" "}
            Everyone listed here can collaborate on the data sections granted to them.
            {scope.workspaceRole === "staff" && " Only the agency owner can invite or change roles."}
          </p>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Workspace Members ({loading ? "…" : members.length})
          </CardTitle>
          <CardDescription>
            The owner is pinned at the top. Active staff members appear once they've accepted their invitation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8 animate-pulse">Loading members…</p>
          ) : (
            <ul className="space-y-3">
              {members.map((m) => (
                <li
                  key={(m.user_id ?? m.name) + m.roleLabel}
                  className={`flex items-start gap-4 p-4 rounded-xl border ${
                    m.isOwner ? "border-primary/30 bg-primary/5" : "border-border bg-card"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-semibold text-sm ${
                      m.isOwner ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                    }`}
                  >
                    {m.isOwner ? <Crown className="w-5 h-5" /> : initials(m.name)}
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground truncate">{m.name}</p>
                      {m.isOwner ? (
                        <Badge className="bg-primary text-primary-foreground text-[10px]">Owner</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" /> Active
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <UserCircle2 className="w-3.5 h-3.5" />
                        {m.roleLabel}
                      </span>
                      {m.email && <span className="truncate">{m.email}</span>}
                      {m.joinedAt && <span>Joined {formatDate(m.joinedAt)}</span>}
                    </div>

                    <div className="flex flex-wrap gap-1 pt-1">
                      {m.isOwner ? (
                        <Badge variant="secondary" className="text-[10px]">All sections</Badge>
                      ) : m.sections.length === 0 ? (
                        <span className="text-[10px] text-muted-foreground italic">No sections granted</span>
                      ) : (
                        m.sections.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">
                            {SECTION_LABELS[s] ?? s}
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyDirectory;