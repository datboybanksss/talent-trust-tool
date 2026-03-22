import { AthleticProfile } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Activity, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Props { data: AthleticProfile }

const AthleticSection = ({ data }: Props) => (
  <div className="space-y-6">
    {/* Sport Overview */}
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" /> Sport Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Sport" value={data.sport} />
          {data.discipline && <Field label="Discipline" value={data.discipline} />}
          {data.position && <Field label="Position / Category" value={data.position} />}
          {data.currentTeam && <Field label="Current Team" value={data.currentTeam} />}
          {data.coach && <Field label="Coach" value={data.coach} />}
          <Field label="Career Start" value={data.careerStart} />
        </div>
      </CardContent>
    </Card>

    {/* Performance History */}
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="w-4 h-4 text-warning" /> Performance History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Year</TableHead>
              <TableHead className="text-xs">Event</TableHead>
              <TableHead className="text-xs">Result</TableHead>
              <TableHead className="text-xs">Achievement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.performanceHistory.map((p, i) => (
              <TableRow key={i}>
                <TableCell className="text-sm font-medium">{p.year}</TableCell>
                <TableCell className="text-sm">{p.event}</TableCell>
                <TableCell className="text-sm">{p.result}</TableCell>
                <TableCell className="text-sm">{p.achievement || "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <div className="grid lg:grid-cols-2 gap-6">
      {/* Rankings */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-success" /> Rankings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.rankings.map((r, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{r.ranking}</p>
                <p className="text-xs text-muted-foreground">{r.organization}</p>
              </div>
              <span className="text-xs text-muted-foreground">{r.asOf}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Injuries */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-destructive" /> Injury Log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {data.injuries.map((inj, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{inj.description}</p>
                <p className="text-xs text-muted-foreground">{inj.date}</p>
              </div>
              <Badge variant={inj.status === "recovered" ? "default" : inj.status === "active" ? "destructive" : "secondary"} className="text-xs">
                {inj.status}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>

    {/* Competition Calendar */}
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" /> Competition Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.competitionCalendar.map((c, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-foreground">{c.name}</p>
                <p className="text-xs text-muted-foreground">{c.location}</p>
              </div>
              <div className="flex items-center gap-2 mt-1 sm:mt-0">
                <span className="text-xs text-muted-foreground">{c.date}</span>
                <Badge variant={c.status === "confirmed" ? "default" : c.status === "tentative" ? "secondary" : "outline"} className="text-xs">
                  {c.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

const Field = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
    <p className="text-sm font-medium text-foreground">{value}</p>
  </div>
);

export default AthleticSection;
