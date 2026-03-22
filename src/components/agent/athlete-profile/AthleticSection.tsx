import { AthleticProfile } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Activity, Calendar } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import EditableField from "./EditableField";

interface Props {
  data: AthleticProfile;
  editMode?: boolean;
  onChange?: (data: AthleticProfile) => void;
}

const AthleticSection = ({ data, editMode = false, onChange }: Props) => {
  const update = (field: keyof AthleticProfile, value: any) => {
    onChange?.({ ...data, [field]: value });
  };

  return (
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
            <EditableField label="Sport" value={data.sport} editMode={editMode} onChange={(v) => update("sport", v)} />
            <EditableField label="Discipline" value={data.discipline || ""} editMode={editMode} onChange={(v) => update("discipline", v)} />
            <EditableField label="Position / Category" value={data.position || ""} editMode={editMode} onChange={(v) => update("position", v)} />
            <EditableField label="Current Team" value={data.currentTeam || ""} editMode={editMode} onChange={(v) => update("currentTeam", v)} />
            <EditableField label="Coach" value={data.coach || ""} editMode={editMode} onChange={(v) => update("coach", v)} />
            <EditableField label="Career Start" value={data.careerStart} editMode={editMode} onChange={(v) => update("careerStart", v)} />
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
                  {editMode ? (
                    <>
                      <TableCell><Input value={p.year} onChange={(e) => { const u = [...data.performanceHistory]; u[i] = { ...p, year: e.target.value }; update("performanceHistory", u); }} className="text-sm h-8 w-20" /></TableCell>
                      <TableCell><Input value={p.event} onChange={(e) => { const u = [...data.performanceHistory]; u[i] = { ...p, event: e.target.value }; update("performanceHistory", u); }} className="text-sm h-8" /></TableCell>
                      <TableCell><Input value={p.result} onChange={(e) => { const u = [...data.performanceHistory]; u[i] = { ...p, result: e.target.value }; update("performanceHistory", u); }} className="text-sm h-8" /></TableCell>
                      <TableCell><Input value={p.achievement || ""} onChange={(e) => { const u = [...data.performanceHistory]; u[i] = { ...p, achievement: e.target.value }; update("performanceHistory", u); }} className="text-sm h-8" /></TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-sm font-medium">{p.year}</TableCell>
                      <TableCell className="text-sm">{p.event}</TableCell>
                      <TableCell className="text-sm">{p.result}</TableCell>
                      <TableCell className="text-sm">{p.achievement || "—"}</TableCell>
                    </>
                  )}
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
              <div key={i} className="p-2 bg-muted/50 rounded-lg">
                {editMode ? (
                  <div className="grid grid-cols-3 gap-2">
                    <Input value={r.ranking} onChange={(e) => { const u = [...data.rankings]; u[i] = { ...r, ranking: e.target.value }; update("rankings", u); }} placeholder="Ranking" className="text-sm h-8" />
                    <Input value={r.organization} onChange={(e) => { const u = [...data.rankings]; u[i] = { ...r, organization: e.target.value }; update("rankings", u); }} placeholder="Organization" className="text-sm h-8" />
                    <Input value={r.asOf} onChange={(e) => { const u = [...data.rankings]; u[i] = { ...r, asOf: e.target.value }; update("rankings", u); }} placeholder="As of" className="text-sm h-8" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.ranking}</p>
                      <p className="text-xs text-muted-foreground">{r.organization}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{r.asOf}</span>
                  </div>
                )}
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
              <div key={i} className="p-2 bg-muted/50 rounded-lg">
                {editMode ? (
                  <div className="grid grid-cols-3 gap-2">
                    <Input value={inj.description} onChange={(e) => { const u = [...data.injuries]; u[i] = { ...inj, description: e.target.value }; update("injuries", u); }} placeholder="Description" className="text-sm h-8" />
                    <Input value={inj.date} onChange={(e) => { const u = [...data.injuries]; u[i] = { ...inj, date: e.target.value }; update("injuries", u); }} placeholder="Date" className="text-sm h-8" />
                    <Input value={inj.returnDate || ""} onChange={(e) => { const u = [...data.injuries]; u[i] = { ...inj, returnDate: e.target.value }; update("injuries", u); }} placeholder="Return date" className="text-sm h-8" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{inj.description}</p>
                      <p className="text-xs text-muted-foreground">{inj.date}</p>
                    </div>
                    <Badge variant={inj.status === "recovered" ? "default" : inj.status === "active" ? "destructive" : "secondary"} className="text-xs">
                      {inj.status}
                    </Badge>
                  </div>
                )}
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
              <div key={i} className="p-3 bg-muted/50 rounded-xl">
                {editMode ? (
                  <div className="grid sm:grid-cols-3 gap-2">
                    <Input value={c.name} onChange={(e) => { const u = [...data.competitionCalendar]; u[i] = { ...c, name: e.target.value }; update("competitionCalendar", u); }} placeholder="Event name" className="text-sm h-8" />
                    <Input value={c.location} onChange={(e) => { const u = [...data.competitionCalendar]; u[i] = { ...c, location: e.target.value }; update("competitionCalendar", u); }} placeholder="Location" className="text-sm h-8" />
                    <Input value={c.date} onChange={(e) => { const u = [...data.competitionCalendar]; u[i] = { ...c, date: e.target.value }; update("competitionCalendar", u); }} placeholder="Date" className="text-sm h-8" />
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between">
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
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AthleticSection;
