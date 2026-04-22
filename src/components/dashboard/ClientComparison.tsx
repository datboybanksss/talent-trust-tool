import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Handshake, Trophy, Users, ArrowUpDown, Download, Eye } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface ClientRow {
  id: string;
  name: string;
  type: string;
  totalDealValue: number;
  activeDeals: number;
  totalDeals: number;
  latestStatus: string;
}

const fmt = (n: number) =>
  n >= 1_000_000 ? `R${(n / 1_000_000).toFixed(1)}M` : `R${(n / 1_000).toFixed(0)}K`;

type SortKey = "name" | "totalDealValue" | "activeDeals" | "totalDeals";

const ClientComparison = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("totalDealValue");
  const [sortAsc, setSortAsc] = useState(false);

  const { data: rows = [] } = useQuery<ClientRow[]>({
    queryKey: ["compare-clients", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const [{ data: invites }, { data: deals }] = await Promise.all([
        supabase
          .from("client_invitations")
          .select("id, client_name, client_type")
          .eq("agent_id", user.id)
          .is("archived_at", null),
        supabase
          .from("agent_deals")
          .select("client_invitation_id, client_name, value_amount, status")
          .eq("agent_id", user.id),
      ]);

      return (invites ?? []).map((inv) => {
        const cd = (deals ?? []).filter((d) => d.client_invitation_id === inv.id || d.client_name === inv.client_name);
        const active = cd.filter((d) => d.status === "active" || d.status === "won");
        return {
          id: inv.id,
          name: inv.client_name,
          type: inv.client_type,
          totalDealValue: cd.reduce((s, d) => s + (Number(d.value_amount) || 0), 0),
          activeDeals: active.length,
          totalDeals: cd.length,
          latestStatus: cd[0]?.status ?? "—",
        };
      });
    },
  });

  const toggleClient = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 4 ? prev : [...prev, id],
    );
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const selected = useMemo(() => {
    return rows
      .filter((p) => selectedIds.includes(p.id))
      .sort((a, b) => {
        const mul = sortAsc ? 1 : -1;
        if (sortKey === "name") return mul * a.name.localeCompare(b.name);
        return mul * ((b[sortKey] as number) - (a[sortKey] as number));
      });
  }, [rows, selectedIds, sortKey, sortAsc]);

  const maxDeal = Math.max(...selected.map((p) => p.totalDealValue), 1);

  const SortButton = ({ label, field }: { label: string; field: SortKey }) => (
    <button className="flex items-center gap-1 text-left hover:text-foreground transition-colors" onClick={() => handleSort(field)}>
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
      head: [["Client", "Type", "Deal Value", "Active Deals", "Total Deals", "Latest Status"]],
      body: selected.map((p) => [p.name, p.type, fmt(p.totalDealValue), `${p.activeDeals}`, `${p.totalDeals}`, p.latestStatus]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 5 },
      margin: { left: 15, right: 15 },
    });
    doc.save(`PortfolioComparison_${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  if (rows.length === 0) {
    return (
      <Card className="border-border/50">
        <CardContent className="py-12 text-center">
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Add clients first to compare them here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Select up to 4 clients to compare</p>
            <Button variant="outline" size="sm" onClick={exportComparison} disabled={selected.length === 0}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Export PDF
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {rows.map((p) => {
              const initials = p.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
              const isSelected = selectedIds.includes(p.id);
              const disabled = !isSelected && selectedIds.length >= 4;
              return (
                <div
                  key={p.id}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all ${
                    isSelected ? "border-primary bg-primary/5 cursor-pointer" : disabled ? "border-border/30 opacity-40" : "border-border/50 hover:border-border cursor-pointer"
                  }`}
                  onClick={() => !disabled && toggleClient(p.id)}
                >
                  <Checkbox checked={isSelected} disabled={disabled} />
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">{initials}</div>
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

      {selected.length < 2 ? (
        <Card className="border-border/50">
          <CardContent className="py-12 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Select at least 2 clients to compare.</p>
          </CardContent>
        </Card>
      ) : (
        <>
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
                      <TableHead><SortButton label="Deal Value" field="totalDealValue" /></TableHead>
                      <TableHead><SortButton label="Active Deals" field="activeDeals" /></TableHead>
                      <TableHead><SortButton label="Total Deals" field="totalDeals" /></TableHead>
                      <TableHead>Latest Status</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.map((p) => {
                      const initials = p.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
                      return (
                        <TableRow key={p.id} className="cursor-pointer hover:bg-secondary/50" onClick={() => navigate(`/agent-dashboard/client/${p.id}`)}>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">{initials}</div>
                              <div>
                                <p className="font-medium text-foreground text-sm">{p.name}</p>
                                <p className="text-[10px] text-muted-foreground capitalize">{p.type}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-foreground">{fmt(p.totalDealValue)}</p>
                              <Progress value={(p.totalDealValue / maxDeal) * 100} className="h-1.5 w-20" />
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="secondary" className="text-xs">{p.activeDeals}</Badge></TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{p.totalDeals}</Badge></TableCell>
                          <TableCell className="text-xs capitalize text-muted-foreground">{p.latestStatus}</TableCell>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Highest Deal Value", icon: DollarSign, client: [...selected].sort((a, b) => b.totalDealValue - a.totalDealValue)[0], value: (c: ClientRow) => fmt(c.totalDealValue) },
              { label: "Most Active Deals", icon: Handshake, client: [...selected].sort((a, b) => b.activeDeals - a.activeDeals)[0], value: (c: ClientRow) => `${c.activeDeals} deals` },
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
