import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accessibility } from "lucide-react";
import { DrillDownFilter, filterClients, DrillDownClient } from "@/data/executiveDrillDownData";

interface DrillDownSheetProps {
  filter: DrillDownFilter | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fmt = (n: number) =>
  n >= 1_000_000 ? `R${(n / 1_000_000).toFixed(1)}M` : `R${(n / 1_000).toFixed(0)}K`;

const typeBadgeVariant = (type: string) => {
  switch (type) {
    case "Athlete": return "default";
    case "Artist": return "secondary";
    case "Brand": return "outline";
    default: return "secondary";
  }
};

const DrillDownSheet = ({ filter, open, onOpenChange }: DrillDownSheetProps) => {
  if (!filter) return null;

  const clients = filterClients(filter);
  const totalRevenue = clients.reduce((s, c) => s + c.revenue, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-lg font-display">
            {filter.segment}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2 text-sm">
            <Badge variant="outline" className="text-xs">{filter.category}</Badge>
            <span>{clients.length} clients • {fmt(totalRevenue)} total revenue</span>
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.name} className="cursor-default">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-1.5">
                      {c.name}
                      {c.paraAthlete && (
                        <Accessibility className="w-3.5 h-3.5 text-primary shrink-0" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeBadgeVariant(c.type)} className="text-xs">{c.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{c.industry}</TableCell>
                  <TableCell className="text-right font-mono text-sm">{fmt(c.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default DrillDownSheet;
