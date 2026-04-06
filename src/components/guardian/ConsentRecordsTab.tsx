import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollText, CheckCircle2, XCircle, Clock } from "lucide-react";
import { mockConsentRecords } from "@/data/mockGuardianData";
import { format, parseISO } from "date-fns";

const ConsentRecordsTab = () => (
  <div className="space-y-6 mt-4">
    <div>
      <h2 className="text-lg font-semibold text-foreground">Consent Records</h2>
      <p className="text-xs text-muted-foreground">Full record of all consents granted, in compliance with GDPR & POPIA</p>
    </div>

    {mockConsentRecords.map((c) => {
      const icon = c.status === "active" ? <CheckCircle2 className="w-4 h-4 text-success" /> : c.status === "revoked" ? <XCircle className="w-4 h-4 text-destructive" /> : <Clock className="w-4 h-4 text-warning" />;
      return (
        <Card key={c.id} className="border-border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <ScrollText className="w-4 h-4 text-primary" />
                {c.consentType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </CardTitle>
              <Badge variant={c.status === "active" ? "default" : c.status === "revoked" ? "destructive" : "secondary"} className="flex items-center gap-1 text-xs">
                {icon} {c.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-foreground">{c.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">Legal Basis</p>
                <p className="text-xs text-foreground">{c.legalBasis}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-1">Data Minimisation</p>
                <p className="text-xs text-foreground">{c.dataMinimisation}</p>
              </div>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>Granted: {format(parseISO(c.grantedAt), "dd MMM yyyy")}</span>
              {c.expiresAt && <span>Expires: {format(parseISO(c.expiresAt), "dd MMM yyyy")}</span>}
              {c.revokedAt && <span>Revoked: {format(parseISO(c.revokedAt), "dd MMM yyyy")}</span>}
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

export default ConsentRecordsTab;
