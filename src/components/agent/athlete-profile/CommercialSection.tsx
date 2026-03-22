import { CommercialLegal } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Handshake, DollarSign, Image } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  data: CommercialLegal;
  editMode?: boolean;
  onChange?: (data: CommercialLegal) => void;
}

const CommercialSection = ({ data, editMode = false, onChange }: Props) => {
  const update = (field: keyof CommercialLegal, value: any) => {
    onChange?.({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Contracts */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" /> Contracts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Title</TableHead>
                <TableHead className="text-xs">Counterparty</TableHead>
                <TableHead className="text-xs">Type</TableHead>
                <TableHead className="text-xs">Period</TableHead>
                <TableHead className="text-xs">Value</TableHead>
                <TableHead className="text-xs">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.contracts.map((c, i) => (
                <TableRow key={i}>
                  {editMode ? (
                    <>
                      <TableCell><Input value={c.title} onChange={(e) => { const u = [...data.contracts]; u[i] = { ...c, title: e.target.value }; update("contracts", u); }} className="text-sm h-8" /></TableCell>
                      <TableCell><Input value={c.counterparty} onChange={(e) => { const u = [...data.contracts]; u[i] = { ...c, counterparty: e.target.value }; update("contracts", u); }} className="text-sm h-8" /></TableCell>
                      <TableCell><Input value={c.type} onChange={(e) => { const u = [...data.contracts]; u[i] = { ...c, type: e.target.value }; update("contracts", u); }} className="text-sm h-8 w-24" /></TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Input value={c.startDate} onChange={(e) => { const u = [...data.contracts]; u[i] = { ...c, startDate: e.target.value }; update("contracts", u); }} className="text-xs h-8 w-24" />
                          <Input value={c.endDate} onChange={(e) => { const u = [...data.contracts]; u[i] = { ...c, endDate: e.target.value }; update("contracts", u); }} className="text-xs h-8 w-24" />
                        </div>
                      </TableCell>
                      <TableCell><Input value={c.value} onChange={(e) => { const u = [...data.contracts]; u[i] = { ...c, value: e.target.value }; update("contracts", u); }} className="text-sm h-8 w-28" /></TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell className="text-sm font-medium">{c.title}</TableCell>
                      <TableCell className="text-sm">{c.counterparty}</TableCell>
                      <TableCell className="text-sm">{c.type}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.startDate} → {c.endDate}</TableCell>
                      <TableCell className="text-sm font-medium">{c.value}</TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                    </>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sponsors */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Handshake className="w-4 h-4 text-primary" /> Sponsors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.sponsors.map((s, i) => (
            <div key={i} className="p-4 bg-muted/50 rounded-xl">
              {editMode ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  <Input value={s.brand} onChange={(e) => { const u = [...data.sponsors]; u[i] = { ...s, brand: e.target.value }; update("sponsors", u); }} placeholder="Brand" className="text-sm h-8" />
                  <Input value={s.type} onChange={(e) => { const u = [...data.sponsors]; u[i] = { ...s, type: e.target.value }; update("sponsors", u); }} placeholder="Type" className="text-sm h-8" />
                  <Input value={s.value} onChange={(e) => { const u = [...data.sponsors]; u[i] = { ...s, value: e.target.value }; update("sponsors", u); }} placeholder="Value" className="text-sm h-8" />
                  <Input value={s.startDate} onChange={(e) => { const u = [...data.sponsors]; u[i] = { ...s, startDate: e.target.value }; update("sponsors", u); }} placeholder="Start" className="text-sm h-8" />
                  <Input value={s.endDate} onChange={(e) => { const u = [...data.sponsors]; u[i] = { ...s, endDate: e.target.value }; update("sponsors", u); }} placeholder="End" className="text-sm h-8" />
                  <Input value={s.deliverables} onChange={(e) => { const u = [...data.sponsors]; u[i] = { ...s, deliverables: e.target.value }; update("sponsors", u); }} placeholder="Deliverables" className="text-sm h-8" />
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{s.brand}</p>
                      <p className="text-xs text-muted-foreground">{s.type}</p>
                    </div>
                    <p className="text-sm font-medium text-primary">{s.value}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{s.startDate} → {s.endDate}</p>
                  <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Deliverables:</span> {s.deliverables}</p>
                </>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Endorsements */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-success" /> Endorsements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.endorsements.map((e, i) => (
              <div key={i} className="p-2 bg-muted/50 rounded-lg">
                {editMode ? (
                  <div className="grid grid-cols-3 gap-2">
                    <Input value={e.brand} onChange={(ev) => { const u = [...data.endorsements]; u[i] = { ...e, brand: ev.target.value }; update("endorsements", u); }} placeholder="Brand" className="text-sm h-8" />
                    <Input value={e.category} onChange={(ev) => { const u = [...data.endorsements]; u[i] = { ...e, category: ev.target.value }; update("endorsements", u); }} placeholder="Category" className="text-sm h-8" />
                    <Input value={e.annualValue} onChange={(ev) => { const u = [...data.endorsements]; u[i] = { ...e, annualValue: ev.target.value }; update("endorsements", u); }} placeholder="Annual value" className="text-sm h-8" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{e.brand}</p>
                      <p className="text-xs text-muted-foreground">{e.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{e.annualValue}</span>
                      <StatusBadge status={e.status} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Image Rights */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Image className="w-4 h-4 text-primary" /> Image Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.imageRights.map((r, i) => (
              <div key={i} className="p-2 bg-muted/50 rounded-lg">
                {editMode ? (
                  <div className="grid grid-cols-3 gap-2">
                    <Input value={r.holder} onChange={(e) => { const u = [...data.imageRights]; u[i] = { ...r, holder: e.target.value }; update("imageRights", u); }} placeholder="Holder" className="text-sm h-8" />
                    <Input value={r.territory} onChange={(e) => { const u = [...data.imageRights]; u[i] = { ...r, territory: e.target.value }; update("imageRights", u); }} placeholder="Territory" className="text-sm h-8" />
                    <Input value={r.expiryDate} onChange={(e) => { const u = [...data.imageRights]; u[i] = { ...r, expiryDate: e.target.value }; update("imageRights", u); }} placeholder="Expiry" className="text-sm h-8" />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.holder}</p>
                      <p className="text-xs text-muted-foreground">{r.territory}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">exp. {r.expiryDate}</span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Rate Card */}
      {data.rateCard && data.rateCard.length > 0 && (
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" /> Rate Card
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Activity</TableHead>
                  <TableHead className="text-xs">Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rateCard.map((r, i) => (
                  <TableRow key={i}>
                    {editMode ? (
                      <>
                        <TableCell><Input value={r.activity} onChange={(e) => { const u = [...(data.rateCard || [])]; u[i] = { ...r, activity: e.target.value }; update("rateCard", u); }} className="text-sm h-8" /></TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Input value={r.rate} onChange={(e) => { const u = [...(data.rateCard || [])]; u[i] = { ...r, rate: e.target.value }; update("rateCard", u); }} className="text-sm h-8 w-28" />
                            <Input value={r.currency} onChange={(e) => { const u = [...(data.rateCard || [])]; u[i] = { ...r, currency: e.target.value }; update("rateCard", u); }} className="text-sm h-8 w-16" />
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="text-sm">{r.activity}</TableCell>
                        <TableCell className="text-sm font-medium">{r.rate} {r.currency}</TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const v = status === "active" ? "default" : status === "expired" ? "destructive" : "secondary";
  return <Badge variant={v} className="text-xs">{status}</Badge>;
};

export default CommercialSection;
