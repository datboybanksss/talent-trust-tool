import { CommercialLegal } from "@/types/athleteProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Handshake, DollarSign, Image } from "lucide-react";

interface Props { data: CommercialLegal }

const CommercialSection = ({ data }: Props) => (
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
                <TableCell className="text-sm font-medium">{c.title}</TableCell>
                <TableCell className="text-sm">{c.counterparty}</TableCell>
                <TableCell className="text-sm">{c.type}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{c.startDate} → {c.endDate}</TableCell>
                <TableCell className="text-sm font-medium">{c.value}</TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
              <div>
                <p className="text-sm font-bold text-foreground">{s.brand}</p>
                <p className="text-xs text-muted-foreground">{s.type}</p>
              </div>
              <p className="text-sm font-medium text-primary">{s.value}</p>
            </div>
            <p className="text-xs text-muted-foreground">{s.startDate} → {s.endDate}</p>
            <p className="text-xs text-muted-foreground mt-1"><span className="font-medium">Deliverables:</span> {s.deliverables}</p>
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
            <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{e.brand}</p>
                <p className="text-xs text-muted-foreground">{e.category}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{e.annualValue}</span>
                <StatusBadge status={e.status} />
              </div>
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
            <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">{r.holder}</p>
                <p className="text-xs text-muted-foreground">{r.territory}</p>
              </div>
              <span className="text-xs text-muted-foreground">exp. {r.expiryDate}</span>
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
                  <TableCell className="text-sm">{r.activity}</TableCell>
                  <TableCell className="text-sm font-medium">{r.rate} {r.currency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )}
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const v = status === "active" ? "default" : status === "expired" ? "destructive" : "secondary";
  return <Badge variant={v} className="text-xs">{status}</Badge>;
};

export default CommercialSection;
