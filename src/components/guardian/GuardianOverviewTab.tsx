import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, Users, Clock, AlertTriangle, CheckCircle2, Calendar } from "lucide-react";
import { mockMinorProfile, mockGuardianAccess, mockConsentRecords, mockAuditLog } from "@/data/mockGuardianData";
import { GUARDIAN_RESTRICTIONS } from "@/types/guardianAccess";
import { differenceInDays, differenceInYears, parseISO, format } from "date-fns";

const GuardianOverviewTab = () => {
  const profile = mockMinorProfile;
  const guardians = mockGuardianAccess;
  const activeGuardians = guardians.filter((g) => g.status === "active").length;
  const pendingGuardians = guardians.filter((g) => g.status === "pending_verification").length;
  const daysToMajority = differenceInDays(parseISO(profile.majorityDate), new Date());
  const currentAge = differenceInYears(new Date(), parseISO(profile.dateOfBirth));
  const totalDays = differenceInDays(parseISO(profile.majorityDate), parseISO(profile.dateOfBirth));
  const elapsed = totalDays - daysToMajority;
  const progressPct = Math.min(100, Math.max(0, (elapsed / totalDays) * 100));

  return (
    <div className="space-y-6 mt-4">
      {/* Status cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{currentAge}</p>
              <p className="text-xs text-muted-foreground">Current Age</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-info/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{daysToMajority}</p>
              <p className="text-xs text-muted-foreground">Days to Majority</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeGuardians}</p>
              <p className="text-xs text-muted-foreground">Active Guardians</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-5 pb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{pendingGuardians}</p>
              <p className="text-xs text-muted-foreground">Pending Verification</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Countdown to majority */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Auto-Revocation Countdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            All guardian access will be automatically revoked on <strong>{format(parseISO(profile.majorityDate), "dd MMMM yyyy")}</strong> when you reach the age of majority (18).
          </p>
          <Progress value={progressPct} className="h-2" />
          <div className="flex justify-between mt-1">
            <span className="text-[10px] text-muted-foreground">Birth: {format(parseISO(profile.dateOfBirth), "dd MMM yyyy")}</span>
            <span className="text-[10px] text-muted-foreground">Majority: {format(parseISO(profile.majorityDate), "dd MMM yyyy")}</span>
          </div>
        </CardContent>
      </Card>

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

      {/* Recent activity */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mockAuditLog.slice(0, 3).map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{entry.details.slice(0, 80)}…</p>
                <p className="text-xs text-muted-foreground">{entry.performedByName} • {format(parseISO(entry.timestamp), "dd MMM yyyy HH:mm")}</p>
              </div>
              <Badge variant={entry.performedByRole === "minor" ? "default" : "secondary"} className="text-xs shrink-0">
                {entry.performedByRole}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default GuardianOverviewTab;
