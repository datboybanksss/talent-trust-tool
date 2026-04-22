import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Users, Clock, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { GUARDIAN_RESTRICTIONS } from "@/types/guardianAccess";

const GuardianOverviewTab = () => {
  return (
    <div className="space-y-6 mt-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: Calendar, label: "Current Age", value: "—" },
          { icon: Clock, label: "Days to Majority", value: "—" },
          { icon: Users, label: "Active Guardians", value: "0" },
          { icon: AlertTriangle, label: "Pending Verification", value: "0" },
        ].map((s, i) => (
          <Card key={i} className="border-border">
            <CardContent className="pt-5 pb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Guardian restrictions */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-4 h-4 text-destructive" />
            Guardian Restrictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">Guardians are strictly limited. They <strong>cannot</strong>:</p>
          <div className="space-y-2">
            {GUARDIAN_RESTRICTIONS.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <span className="text-foreground">{r}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            No guardian activity yet. Invite a guardian to begin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuardianOverviewTab;
