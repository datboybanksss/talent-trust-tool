import { Card, CardContent } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

const ConsentRecordsTab = () => (
  <div className="space-y-6 mt-4">
    <div>
      <h2 className="text-lg font-semibold text-foreground">Consent Records</h2>
      <p className="text-xs text-muted-foreground">Full record of all consents granted, in compliance with GDPR & POPIA</p>
    </div>

    <Card className="border-border border-dashed">
      <CardContent className="py-12 text-center space-y-2">
        <ScrollText className="w-8 h-8 text-muted-foreground mx-auto" />
        <p className="text-sm font-medium text-foreground">No consent records yet</p>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          When guardians grant or revoke consent, the full audit trail will appear here.
        </p>
      </CardContent>
    </Card>
  </div>
);

export default ConsentRecordsTab;
