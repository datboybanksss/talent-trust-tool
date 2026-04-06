import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Eye, Pencil, ShieldAlert, Clock, CheckCircle2, XCircle, UserPlus } from "lucide-react";
import { mockGuardianAccess } from "@/data/mockGuardianData";
import { SHAREABLE_SECTIONS, type GuardianAccess } from "@/types/guardianAccess";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import InviteGuardianDialog from "./InviteGuardianDialog";

const statusConfig: Record<string, { color: "default" | "secondary" | "destructive"; icon: React.ElementType }> = {
  active: { color: "default", icon: CheckCircle2 },
  pending_verification: { color: "secondary", icon: Clock },
  revoked: { color: "destructive", icon: XCircle },
  expired: { color: "secondary", icon: Clock },
};

const GuardianAccessTab = () => {
  const guardians = mockGuardianAccess;
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRevoke = (g: GuardianAccess) => {
    toast.success(`Access for ${g.guardianName} has been revoked (demo).`);
  };

  return (
    <div className="space-y-6 mt-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Guardian Access</h2>
          <p className="text-xs text-muted-foreground">Manage who has oversight of your profile</p>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <UserPlus className="w-4 h-4 mr-1" /> Invite Guardian
        </Button>
      </div>

      <InviteGuardianDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {guardians.map((g) => {
        const cfg = statusConfig[g.status] || statusConfig.expired;
        const StatusIcon = cfg.icon;
        const sectionLabels = g.sections.map((s) => SHAREABLE_SECTIONS.find((ss) => ss.value === s)?.label || s);

        return (
          <Card key={g.id} className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  {g.guardianName}
                </CardTitle>
                <Badge variant={cfg.color} className="flex items-center gap-1 text-xs">
                  <StatusIcon className="w-3 h-3" /> {g.status.replace(/_/g, " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-foreground">{g.guardianEmail}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Relationship</p>
                  <p className="text-foreground capitalize">{g.relationship.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Access Level</p>
                  <div className="flex items-center gap-1">
                    {g.accessLevel === "view_only" ? <Eye className="w-3.5 h-3.5 text-info" /> : <Pencil className="w-3.5 h-3.5 text-warning" />}
                    <span className="text-foreground capitalize">{g.accessLevel.replace(/_/g, " ")}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Verification</p>
                  <p className="text-foreground capitalize">{g.verificationMethod.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Auto-Revoke</p>
                  <p className="text-foreground">{format(parseISO(g.autoRevokeAt), "dd MMM yyyy")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Coercion Safeguard</p>
                  <p className="text-foreground">{g.coercionSafeguard ? "✅ Confirmed independently" : "⚠️ Pending"}</p>
                </div>
              </div>

              {/* Purpose limitation */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Purpose Limitation
                </p>
                <p className="text-sm text-foreground">{g.purposeLimitation}</p>
              </div>

              {/* Sections */}
              <div>
                <p className="text-xs text-muted-foreground mb-2">Permitted Sections</p>
                <div className="flex flex-wrap gap-2">
                  {sectionLabels.map((label) => (
                    <Badge key={label} variant="outline" className="text-xs">{label}</Badge>
                  ))}
                </div>
              </div>

              {g.status === "active" && (
                <div className="flex justify-end">
                  <Button variant="destructive" size="sm" onClick={() => handleRevoke(g)}>
                    Revoke Access
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default GuardianAccessTab;
