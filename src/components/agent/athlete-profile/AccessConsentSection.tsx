import { ConsentRecord, ProfileRole, ROLE_PERMISSIONS, canAccessSection } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, CheckCircle2, XCircle, Clock } from "lucide-react";

interface Props {
  consents: ConsentRecord[];
  currentRole: ProfileRole;
  onRoleChange: (role: ProfileRole) => void;
}

const sections = [
  { id: "personal", label: "Personal Info" },
  { id: "representation", label: "Representation" },
  { id: "para_athlete", label: "Para-Athlete" },
  { id: "athletic", label: "Athletic Profile" },
  { id: "health", label: "Health & Welfare" },
  { id: "commercial", label: "Commercial & Legal" },
  { id: "media", label: "Media & Brand" },
  { id: "travel", label: "Travel & Logistics" },
  { id: "documents", label: "Document Vault" },
];

const AccessConsentSection = ({ consents, currentRole, onRoleChange }: Props) => (
  <div className="space-y-6">
    {/* Role Switcher */}
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="w-4 h-4 text-primary" /> View As Role
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">Preview what each role can see. This controls visibility across all tabs.</p>
        <div className="flex flex-wrap gap-2">
          {ROLE_PERMISSIONS.map((r) => (
            <button
              key={r.role}
              onClick={() => onRoleChange(r.role)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${currentRole === r.role ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Access Matrix */}
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Access Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-xs font-medium text-muted-foreground">Section</th>
                {ROLE_PERMISSIONS.map((r) => (
                  <th key={r.role} className="text-center py-2 px-2 text-xs font-medium text-muted-foreground">{r.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.id} className="border-b border-border/50">
                  <td className="py-2 pr-4 text-sm text-foreground">{s.label}</td>
                  {ROLE_PERMISSIONS.map((r) => (
                    <td key={r.role} className="text-center py-2 px-2">
                      {canAccessSection(r.role, s.id) ? (
                        <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    {/* Consent Tracking */}
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Shield className="w-4 h-4 text-info" /> Consent Records (POPIA / GDPR)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {consents.map((c) => {
          const statusIcon = c.status === "granted" ? <CheckCircle2 className="w-4 h-4 text-success" /> : c.status === "revoked" ? <XCircle className="w-4 h-4 text-destructive" /> : <Clock className="w-4 h-4 text-warning" />;
          return (
            <div key={c.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div className="flex items-start gap-2">
                {statusIcon}
                <div>
                  <p className="text-sm font-medium text-foreground capitalize">{c.type.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">{c.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                <span className="text-xs text-muted-foreground">Granted: {c.grantedAt}</span>
                {c.expiresAt && <span className="text-xs text-muted-foreground">Exp: {c.expiresAt}</span>}
                <Badge variant={c.status === "granted" ? "default" : c.status === "revoked" ? "destructive" : "secondary"} className="text-xs">{c.status}</Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  </div>
);

export default AccessConsentSection;
