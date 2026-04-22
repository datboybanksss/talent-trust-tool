import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useExecutiveData } from "@/hooks/useExecutiveData";

export interface DrillDownFilter {
  category: string;
  segment: string;
}

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
  const { data } = useExecutiveData();
  if (!filter) return null;

  const dataset = data ?? { invitations: [], deals: [] };

  // Aggregate revenue per client_name from deals.
  const revenueByClient = new Map<string, { revenue: number; type: string; brand: string }>();
  dataset.deals.forEach((d) => {
    const cur = revenueByClient.get(d.client_name) ?? { revenue: 0, type: d.client_type, brand: d.brand };
    cur.revenue += d.value_amount ?? 0;
    revenueByClient.set(d.client_name, cur);
  });

  let rows = [...revenueByClient.entries()].map(([name, v]) => ({ name, ...v }));

  if (filter.category === "Client Type") {
    rows = rows.filter((r) => (r.type || "").toLowerCase().startsWith(filter.segment.toLowerCase().replace(/s$/, "")));
  } else if (filter.category === "Revenue Stream") {
    const matchingNames = new Set(
      dataset.deals.filter((d) => d.deal_type === filter.segment).map((d) => d.client_name),
    );
    rows = rows.filter((r) => matchingNames.has(r.name));
  } else if (filter.category === "Industry") {
    rows = rows.filter((r) => r.brand === filter.segment);
  }

  rows.sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = rows.reduce((s, c) => s + c.revenue, 0);

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
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8 text-sm">
                    No matching clients yet.
                  </TableCell>
                </TableRow>
              ) : rows.map((c) => (
                <TableRow key={c.name} className="cursor-default">
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>
                    <Badge variant={typeBadgeVariant(c.type)} className="text-xs capitalize">{c.type}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{c.brand}</TableCell>
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
