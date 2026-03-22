import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DollarSign, TrendingUp, Shield, Globe, Handshake, Trophy, Users,
  ArrowUpDown, Download, Eye
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface ClientProfile {
  id: string;
  name: string;
  type: string;
  sport?: string;
  discipline?: string;
  marketValue: string;
  marketValueNum: number;
  totalDealValue: string;
  totalDealValueNum: number;
  activeDeals: number;
  complianceScore: number;
  socialFollowers: string;
  socialFollowersNum: number;
  documentsCount: number;
  age: number;
  location: string;
}

const MOCK_PROFILES: ClientProfile[] = [
  {
    id: "1", name: "Siya Kolisi", type: "athlete", sport: "Rugby",
    marketValue: "R45,000,000", marketValueNum: 45000000,
    totalDealValue: "R32,200,000", totalDealValueNum: 32200000,
    activeDeals: 4, complianceScore: 92, socialFollowers: "3.2M", socialFollowersNum: 3200000,
    documentsCount: 6, age: 34, location: "Cape Town",
  },
  {
    id: "2", name: "Zozibini Tunzi", type: "artist", discipline: "Model / Public Figure",
    marketValue: "R12,000,000", marketValueNum: 12000000,
    totalDealValue: "R13,500,000", totalDealValueNum: 13500000,
    activeDeals: 2, complianceScore: 88, socialFollowers: "5.1M", socialFollowersNum: 5100000,
    documentsCount: 4, age: 33, location: "New York",
  },
  {
    id: "4", name: "Tyla Seethal", type: "artist", discipline: "Recording Artist",
    marketValue: "R85,000,000", marketValueNum: 85000000,
    totalDealValue: "R56,500,000", totalDealValueNum: 56500000,
    activeDeals: 3, complianceScore: 95, socialFollowers: "12.8M", socialFollowersNum: 12800000,
    documentsCount: 5, age: 22, location: "Johannesburg",
  },
];

type SortKey = "name" | "marketValueNum" | "totalDealValueNum" | "complianceScore" | "socialFollowersNum" | "activeDeals";

const ClientComparison = () => {
  const navigate = useNavigate();
  const [selectedIds, setSelectedIds] = useState<string[]>(MOCK_PROFILES.map((p) => p.id));
  const [sortKey, setSortKey] = useState<SortKey>("marketValueNum");
  const [sortAsc, setSortAsc] = useState(false);

  const toggleClient = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const selected = MOCK_PROFILES
    .filter((p) => selectedIds.includes(p.id))
    .sort((a, b) => {
      const mul = sortAsc ? 1 : -1;
      if (sortKey === "name") return mul * a.name.localeCompare(b.name);
      return mul * ((b[sortKey] as number) - (a[sortKey] as number));
    });

  const maxMarket = Math.max(...selected.map((p) => p.marketValueNum), 1);
  const maxDeal = Math.max(...selected.map((p) => p.totalDealValueNum), 1);
  const maxSocial = Math.max(...selected.map((p) => p.socialFollowersNum), 1);

  const SortButton = ({ label, field }: { label: string; field: SortKey }) => (
    <button
      className="flex items-center gap-1 text-left hover:text-foreground transition-colors"
      onClick={() => handleSort(field)}
    >
      {label}
      <ArrowUpDown className={`w-3 h-3 ${sortKey === field ? "text-primary" : "text-muted-foreground/50"}`} />
    </button>
  );

  const exportComparison = () => {
    const doc = new jsPDF("landscape");
    const pageWidth = doc.internal.pageSize.getWidth();
    const gold: [number, number, number] = [196, 155, 45];

    doc.setFillColor(...gold);
    doc.rect(0, 0, pageWidth, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Client Portfolio Comparison", 20, 18);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}  •  ${selected.length} clients compared`, 20, 28);

    autoTable(doc, {
      startY: 45,
      head: [["Client", "Type", "Market Value", "Deal Value", "Active Deals", "Compliance", "Social Reach", "Documents", "Location"]],
      body: selected.map((p) => [
        p.name,
        p.type === "athlete" ? `Athlete — ${p.sport}` : `Artist — ${p.discipline}`,
        p.marketValue, p.totalDealValue, `${p.activeDeals}`,
        `${p.complianceScore}%`, p.socialFollowers, `${p.documentsCount}`, p.location,
      ]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 5 },
      margin: { left: 15, right: 15 },
    });

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("CONFIDENTIAL — LegacyBuilder Portfolio Analysis", 15, doc.internal.pageSize.getHeight() - 10);
    doc.save(`PortfolioComparison_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  return (
    <div className="space-y-4">
      {/* Client Selector */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Select clients to compare</p>
            <Button variant="outline" size="sm" onClick={exportComparison} disabled={selected.length === 0}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {MOCK_PROFILES.map((p) => {
              const initials = p.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
              const isSelected = selectedIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-all ${
                    isSelected ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"
                  }`}
                  onClick={() => toggleClient(p.id)}
                >
                  <Checkbox checked={isSelected} />
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{p.type}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selected.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Select at least one client to compare.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Comparison Table */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Portfolio Comparison</CardTitle>
              <CardDescription>Click column headers to sort · Click a row to view client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[160px]"><SortButton label="Client" field="name" /></TableHead>
                      <TableHead><SortButton label="Market Value" field="marketValueNum" /></TableHead>
                      <TableHead><SortButton label="Deal Value" field="totalDealValueNum" /></TableHead>
                      <TableHead><SortButton label="Active Deals" field="activeDeals" /></TableHead>
                      <TableHead><SortButton label="Compliance" field="complianceScore" /></TableHead>
                      <TableHead><SortButton label="Social Reach" field="socialFollowersNum" /></TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.map((p) => {
                      const initials = p.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                      return (
                        <TableRow
                          key={p.id}
                          className="cursor-pointer hover:bg-secondary/50"
                          onClick={() => navigate(`/agent-dashboard/client/${p.id}`)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                                {initials}
                              </div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{p.name}</p>
                                <p className="text-[10px] text-muted-foreground capitalize">{p.type === "athlete" ? p.sport : p.discipline}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-foreground">{p.marketValue}</p>
                              <Progress value={(p.marketValueNum / maxMarket) * 100} className="h-1.5 w-20" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-foreground">{p.totalDealValue}</p>
                              <Progress value={(p.totalDealValueNum / maxDeal) * 100} className="h-1.5 w-20" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">{p.activeDeals}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={p.complianceScore} className="h-1.5 w-16" />
                              <span className={`text-xs font-medium ${
                                p.complianceScore >= 90 ? "text-green-600" : p.complianceScore >= 80 ? "text-amber-600" : "text-red-600"
                              }`}>{p.complianceScore}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">{p.socialFollowers}</p>
                              <Progress value={(p.socialFollowersNum / maxSocial) * 100} className="h-1.5 w-20" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); navigate(`/agent-dashboard/client/${p.id}`); }}>
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Visual Comparison Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Highest Market Value", icon: DollarSign, client: [...selected].sort((a, b) => b.marketValueNum - a.marketValueNum)[0], value: (c: ClientProfile) => c.marketValue },
              { label: "Most Active Deals", icon: Handshake, client: [...selected].sort((a, b) => b.activeDeals - a.activeDeals)[0], value: (c: ClientProfile) => `${c.activeDeals} deals` },
              { label: "Best Compliance", icon: Shield, client: [...selected].sort((a, b) => b.complianceScore - a.complianceScore)[0], value: (c: ClientProfile) => `${c.complianceScore}%` },
            ].map((item, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-bold text-foreground truncate">{item.client?.name}</p>
                    <p className="text-xs text-primary font-medium">{item.client ? item.value(item.client) : "—"}</p>
                  </div>
                  <Trophy className="w-5 h-5 text-amber-500 shrink-0 ml-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientComparison;
