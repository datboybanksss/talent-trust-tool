import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, FileText, Bell, Handshake, BarChart3, User, Download,
  Calendar, DollarSign, Shield, Clock, CheckCircle2, AlertTriangle,
  Trophy, Music, TrendingUp, MapPin, Phone, Mail, Globe, Star,
  Briefcase, WifiOff, Wifi, HeartPulse, PhoneCall
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { mockBeneficiaries, mockEmergencyContacts, mockDocuments, mockAssets, getLifeFileSummary } from "@/data/mockLifeFileData";
import { generateLifeFilePDF } from "@/utils/lifeFilePdfExport";
import { INSURANCE_TYPES, INVESTMENT_TYPES } from "@/types/lifeFileAsset";

// ─── Mock Client Data ───────────────────────────────────────────────
const MOCK_CLIENTS: Record<string, any> = {
  "1": {
    id: "1", name: "Siya Kolisi", email: "siya@example.com", phone: "+27 81 234 5678",
    type: "athlete", sport: "Rugby", team: "Racing 92 / Springboks", status: "activated",
    marketValue: "R45,000,000", age: 34, nationality: "South African",
    location: "Cape Town, SA", socialFollowers: "3.2M",
    bio: "World Cup-winning Springbok captain. Global rugby icon and philanthropist.",
    documents: [
      { id: "d1", name: "Team Contract — Racing 92", type: "contract", date: "2025-06-01", status: "active", size: "2.4MB" },
      { id: "d2", name: "Nike Endorsement Agreement", type: "endorsement", date: "2025-01-15", status: "active", size: "1.8MB" },
      { id: "d3", name: "SA Rugby Image Rights", type: "image_rights", date: "2024-11-20", status: "active", size: "980KB" },
      { id: "d4", name: "Tax Clearance Certificate 2025", type: "compliance", date: "2025-03-01", status: "valid", size: "340KB" },
      { id: "d5", name: "Medical Insurance Policy", type: "insurance", date: "2025-02-10", status: "active", size: "1.2MB" },
      { id: "d6", name: "Kolisi Foundation Trust Deed", type: "trust", date: "2023-08-15", status: "active", size: "3.1MB" },
    ],
    reminders: [
      { id: "r1", title: "Racing 92 contract renewal discussion", due: "2026-04-15", priority: "high", status: "upcoming" },
      { id: "r2", title: "Nike deal annual review", due: "2026-05-01", priority: "medium", status: "upcoming" },
      { id: "r3", title: "Tax return submission — SARS", due: "2026-06-30", priority: "high", status: "upcoming" },
      { id: "r4", title: "Medical assessment — team clearance", due: "2026-04-01", priority: "medium", status: "overdue" },
      { id: "r5", title: "Foundation annual report deadline", due: "2026-07-15", priority: "low", status: "upcoming" },
    ],
    deals: [
      { id: "dl1", brand: "Nike", type: "Endorsement", value: "R8,500,000/yr", start: "2025-01-15", end: "2027-01-14", status: "active" },
      { id: "dl2", brand: "Racing 92", type: "Player Contract", value: "R18,000,000/yr", start: "2024-07-01", end: "2026-06-30", status: "active" },
      { id: "dl3", brand: "SA Rugby", type: "Image Rights", value: "R3,200,000/yr", start: "2024-11-20", end: "2026-11-19", status: "active" },
      { id: "dl4", brand: "BMW South Africa", type: "Brand Ambassador", value: "R2,500,000/yr", start: "2025-06-01", end: "2026-05-31", status: "negotiating" },
      { id: "dl5", brand: "Kolisi Foundation", type: "NPO", value: "—", start: "2020-01-01", end: "ongoing", status: "active" },
    ],
    stats: { contractsActive: 4, totalDealValue: "R32,200,000", complianceScore: 92, documentsCount: 6 },
    serviceActive: true, lastDataSync: "2026-04-06T08:30:00Z",
    commissionRate: 5, commissionEarned: "R1,610,000",
  },
  "2": {
    id: "2", name: "Zozibini Tunzi", email: "zozi@example.com", phone: "+27 82 345 6789",
    type: "artist", discipline: "Model / Public Figure", agency: "Independent", status: "activated",
    marketValue: "R12,000,000", age: 33, nationality: "South African",
    location: "New York, USA", socialFollowers: "5.1M",
    bio: "Miss Universe 2019. Activist, model, and media personality championing diversity in beauty.",
    documents: [
      { id: "d1", name: "Estée Lauder Global Contract", type: "endorsement", date: "2025-03-01", status: "active", size: "2.1MB" },
      { id: "d2", name: "IMG Models Representation", type: "contract", date: "2024-09-15", status: "active", size: "1.5MB" },
      { id: "d3", name: "US Work Visa (O-1B)", type: "compliance", date: "2025-08-20", status: "valid", size: "450KB" },
      { id: "d4", name: "Tax Residency Declaration", type: "compliance", date: "2025-01-10", status: "valid", size: "280KB" },
    ],
    reminders: [
      { id: "r1", title: "Estée Lauder campaign shoot — NYC", due: "2026-04-10", priority: "high", status: "upcoming" },
      { id: "r2", title: "O-1B Visa renewal application", due: "2026-06-01", priority: "high", status: "upcoming" },
      { id: "r3", title: "SA tax return filing", due: "2026-06-30", priority: "medium", status: "upcoming" },
    ],
    deals: [
      { id: "dl1", brand: "Estée Lauder", type: "Global Ambassador", value: "$500,000/yr", start: "2025-03-01", end: "2027-02-28", status: "active" },
      { id: "dl2", brand: "IMG Models", type: "Representation", value: "Commission-based", start: "2024-09-15", end: "2026-09-14", status: "active" },
      { id: "dl3", brand: "Netflix SA", type: "Production Deal", value: "R4,500,000", start: "2026-01-01", end: "2026-12-31", status: "negotiating" },
    ],
    stats: { contractsActive: 2, totalDealValue: "$500K + R4.5M", complianceScore: 88, documentsCount: 4 },
  },
  "4": {
    id: "4", name: "Tyla Seethal", email: "tyla@example.com", phone: "+27 84 567 8901",
    type: "artist", discipline: "Recording Artist", agency: "Epic Records / Columbia", status: "activated",
    marketValue: "R85,000,000", age: 22, nationality: "South African",
    location: "Johannesburg, SA", socialFollowers: "12.8M",
    bio: "Grammy-winning artist. Global pop sensation blending Amapiano with mainstream pop.",
    documents: [
      { id: "d1", name: "Epic Records — Recording Agreement", type: "contract", date: "2024-03-15", status: "active", size: "4.2MB" },
      { id: "d2", name: "Publishing Deal — Sony/ATV", type: "contract", date: "2024-06-01", status: "active", size: "3.8MB" },
      { id: "d3", name: "US Tour Insurance Policy", type: "insurance", date: "2025-11-01", status: "active", size: "1.1MB" },
      { id: "d4", name: "Trademark Registration — TYLA", type: "ip", date: "2024-08-20", status: "active", size: "560KB" },
      { id: "d5", name: "Grammy Nomination Documents", type: "achievement", date: "2025-01-20", status: "archived", size: "780KB" },
    ],
    reminders: [
      { id: "r1", title: "Album 2 delivery deadline — Epic Records", due: "2026-06-01", priority: "high", status: "upcoming" },
      { id: "r2", title: "World tour insurance renewal", due: "2026-10-15", priority: "medium", status: "upcoming" },
      { id: "r3", title: "Royalty audit — Q1 2026", due: "2026-04-30", priority: "high", status: "upcoming" },
    ],
    deals: [
      { id: "dl1", brand: "Epic Records", type: "Recording Contract", value: "R35,000,000 (3-album)", start: "2024-03-15", end: "2028-03-14", status: "active" },
      { id: "dl2", brand: "Sony/ATV", type: "Publishing", value: "R12,000,000 advance", start: "2024-06-01", end: "2029-05-31", status: "active" },
      { id: "dl3", brand: "Pepsi Africa", type: "Brand Ambassador", value: "R6,000,000/yr", start: "2025-09-01", end: "2026-08-31", status: "active" },
      { id: "dl4", brand: "Fashion Nova", type: "Collaboration", value: "R3,500,000", start: "2026-02-01", end: "2026-07-31", status: "negotiating" },
    ],
    stats: { contractsActive: 3, totalDealValue: "R56,500,000", complianceScore: 95, documentsCount: 5 },
  },
};

// Fallback for pending clients
const PENDING_FALLBACK = (id: string) => ({
  id, name: id === "3" ? "Kagiso Rabada" : "Eben Etzebeth",
  email: id === "3" ? "kagiso@example.com" : "eben@example.com",
  phone: id === "3" ? "+27 83 456 7890" : "+27 85 678 9012",
  type: "athlete", sport: "Cricket", team: id === "3" ? "Proteas / Punjab Kings" : "Sharks / Springboks",
  status: "pending", marketValue: id === "3" ? "R28,000,000" : "R22,000,000",
  age: id === "3" ? 30 : 34, nationality: "South African",
  location: id === "3" ? "Centurion, SA" : "Durban, SA", socialFollowers: id === "3" ? "1.8M" : "1.2M",
  bio: id === "3" ? "Premier fast bowler. ICC No.1 ranked bowler." : "Legendary Springbok lock. World Cup winner.",
  documents: [], reminders: [], deals: [],
  stats: { contractsActive: 0, totalDealValue: "—", complianceScore: 0, documentsCount: 0 },
});

const AgentClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedReportSections, setSelectedReportSections] = useState<string[]>([
    "bio", "deals", "stats", "documents",
  ]);

  const client = MOCK_CLIENTS[clientId || ""] || PENDING_FALLBACK(clientId || "1");
  const isPending = client.status === "pending";

  const toggleReportSection = (section: string) => {
    setSelectedReportSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const generateProfileReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const gold: [number, number, number] = [196, 155, 45];
    const dark: [number, number, number] = [30, 30, 30];
    let y = 20;

    // Header
    doc.setFillColor(...gold);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Client Profile Report", 20, 20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${client.name} — ${client.type === "athlete" ? client.sport : client.discipline}`, 20, 30);
    doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, pageWidth - 20, 30, { align: "right" });

    y = 52;
    doc.setTextColor(...dark);

    if (selectedReportSections.includes("bio")) {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Client Overview", 20, y);
      y += 10;
      autoTable(doc, {
        startY: y,
        body: [
          ["Full Name", client.name],
          ["Type", client.type === "athlete" ? `Athlete — ${client.sport}` : `Artist — ${client.discipline}`],
          ["Age", `${client.age}`],
          ["Market Value", client.marketValue],
          ["Nationality", client.nationality],
          ["Location", client.location],
          ["Social Following", client.socialFollowers],
          [client.type === "athlete" ? "Team" : "Agency", client.team || client.agency || "—"],
        ],
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
        margin: { left: 20, right: 20 },
      });
      y = (doc as any).lastAutoTable.finalY + 12;
    }

    if (selectedReportSections.includes("stats")) {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Key Metrics", 20, y);
      y += 10;
      autoTable(doc, {
        startY: y,
        body: [
          ["Active Contracts", `${client.stats.contractsActive}`],
          ["Total Deal Value", client.stats.totalDealValue],
          ["Compliance Score", `${client.stats.complianceScore}%`],
          ["Documents on File", `${client.stats.documentsCount}`],
        ],
        theme: "grid",
        headStyles: { fillColor: gold },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
        margin: { left: 20, right: 20 },
      });
      y = (doc as any).lastAutoTable.finalY + 12;
    }

    if (selectedReportSections.includes("deals") && client.deals.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Active Deals & Partnerships", 20, y);
      y += 10;
      autoTable(doc, {
        startY: y,
        head: [["Brand / Partner", "Deal Type", "Value", "Period", "Status"]],
        body: client.deals.map((d: any) => [d.brand, d.type, d.value, `${d.start} → ${d.end}`, d.status]),
        theme: "grid",
        headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 4 },
        margin: { left: 20, right: 20 },
      });
      y = (doc as any).lastAutoTable.finalY + 12;
    }

    if (selectedReportSections.includes("documents") && client.documents.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Documents on File", 20, y);
      y += 10;
      autoTable(doc, {
        startY: y,
        head: [["Document", "Type", "Date", "Status"]],
        body: client.documents.map((d: any) => [d.name, d.type, d.date, d.status]),
        theme: "grid",
        headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 4 },
        margin: { left: 20, right: 20 },
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`CONFIDENTIAL — ${client.name} Profile Report`, 20, doc.internal.pageSize.getHeight() - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    doc.save(`ProfileReport_${client.name.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast({ title: "Report Generated", description: `Profile report for ${client.name} downloaded.` });
  };

  const priorityColor = (p: string) => {
    if (p === "high") return "text-red-600 bg-red-500/10 border-red-200";
    if (p === "medium") return "text-amber-600 bg-amber-500/10 border-amber-200";
    return "text-green-600 bg-green-500/10 border-green-200";
  };

  const dealStatusColor = (s: string) => {
    if (s === "active") return "bg-green-500/10 text-green-700 border-green-200";
    if (s === "negotiating") return "bg-amber-500/10 text-amber-700 border-amber-200";
    return "bg-muted text-muted-foreground";
  };

  const docTypeIcon = (type: string) => {
    if (type === "contract" || type === "endorsement" || type === "image_rights") return Handshake;
    if (type === "compliance") return Shield;
    if (type === "insurance") return Shield;
    return FileText;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card sticky top-0 z-40">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/agent-dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
              {client.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-display font-bold text-foreground">{client.name}</h1>
                <Badge variant={isPending ? "outline" : "default"} className={isPending ? "text-amber-600 border-amber-200" : "bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/10"}>
                  {isPending ? "Pending" : "Active"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {client.type === "athlete" ? `${client.sport} — ${client.team}` : `${client.discipline} — ${client.agency}`}
              </p>
            </div>
          </div>
          <Button onClick={generateProfileReport} disabled={isPending} className="bg-primary text-primary-foreground">
            <Download className="w-4 h-4 mr-2" /> Generate Report
          </Button>
        </div>
      </header>

      <div className="container py-6 max-w-6xl mx-auto space-y-6">
        {isPending && (
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="py-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                This client hasn't activated their profile yet. Full dashboard data will be available after activation.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { icon: DollarSign, label: "Market Value", value: client.marketValue, color: "text-primary" },
            { icon: Handshake, label: "Active Deals", value: client.stats.contractsActive, color: "text-green-600" },
            { icon: TrendingUp, label: "Total Deal Value", value: client.stats.totalDealValue, color: "text-primary" },
            { icon: Shield, label: "Compliance", value: `${client.stats.complianceScore}%`, color: "text-blue-600" },
            { icon: Globe, label: "Social Reach", value: client.socialFollowers, color: "text-purple-600" },
          ].map((stat, i) => (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                <p className="text-xl font-display font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="deals" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deals" className="text-xs sm:text-sm">
              <Handshake className="w-4 h-4 mr-1.5 hidden sm:inline" /> Deals
            </TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm">
              <FileText className="w-4 h-4 mr-1.5 hidden sm:inline" /> Documents
            </TabsTrigger>
            <TabsTrigger value="reminders" className="text-xs sm:text-sm">
              <Bell className="w-4 h-4 mr-1.5 hidden sm:inline" /> Reminders
            </TabsTrigger>
            <TabsTrigger value="report" className="text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4 mr-1.5 hidden sm:inline" /> Report
            </TabsTrigger>
          </TabsList>

          {/* ─── Deals Tab ─── */}
          <TabsContent value="deals">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deals & Partnerships</CardTitle>
                <CardDescription>Active and negotiating deals for {client.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {client.deals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No deals on record yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Brand / Partner</TableHead>
                        <TableHead>Deal Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="hidden md:table-cell">Period</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.deals.map((deal: any) => (
                        <TableRow key={deal.id}>
                          <TableCell className="font-medium">{deal.brand}</TableCell>
                          <TableCell>{deal.type}</TableCell>
                          <TableCell className="font-semibold">{deal.value}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                            {deal.start} → {deal.end}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={dealStatusColor(deal.status)}>
                              {deal.status === "active" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                              {deal.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Documents Tab ─── */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Documents</CardTitle>
                <CardDescription>{client.documents.length} documents on file</CardDescription>
              </CardHeader>
              <CardContent>
                {client.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {client.documents.map((doc: any) => {
                      const Icon = docTypeIcon(doc.type);
                      return (
                        <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.type} · {doc.date} · {doc.size}</p>
                          </div>
                          <Badge variant="outline" className={doc.status === "active" || doc.status === "valid" ? "text-green-600 border-green-200" : "text-muted-foreground"}>
                            {doc.status}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Reminders Tab ─── */}
          <TabsContent value="reminders">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Reminders</CardTitle>
                <CardDescription>Deadlines and key dates for {client.name}</CardDescription>
              </CardHeader>
              <CardContent>
                {client.reminders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No reminders set.</p>
                ) : (
                  <div className="space-y-3">
                    {client.reminders.map((rem: any) => (
                      <div key={rem.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          rem.status === "overdue" ? "bg-red-500" : rem.priority === "high" ? "bg-amber-500" : "bg-green-500"
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{rem.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{rem.due}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className={priorityColor(rem.priority)}>
                            {rem.priority}
                          </Badge>
                          {rem.status === "overdue" && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="w-3 h-3 mr-1" /> Overdue
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── Report Generator Tab ─── */}
          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Profile Report Generator
                </CardTitle>
                <CardDescription>
                  Select which sections to include when generating a client profile report for deal negotiations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Section selector */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "bio", label: "Client Overview", description: "Name, type, market value, location, bio" },
                    { id: "stats", label: "Key Metrics", description: "Active deals, compliance, document count" },
                    { id: "deals", label: "Deals & Partnerships", description: "All current and negotiating deals" },
                    { id: "documents", label: "Documents on File", description: "Contracts, compliance, insurance" },
                  ].map((section) => (
                    <div
                      key={section.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedReportSections.includes(section.id)
                          ? "border-primary bg-primary/5"
                          : "border-border/50 hover:border-border"
                      }`}
                      onClick={() => toggleReportSection(section.id)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Checkbox checked={selectedReportSections.includes(section.id)} />
                        <span className="text-sm font-medium text-foreground">{section.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-6">{section.description}</p>
                    </div>
                  ))}
                </div>

                {/* Report Preview Table */}
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Report Preview</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Field</TableHead>
                        <TableHead>Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Client Name</TableCell>
                        <TableCell>{client.name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Category</TableCell>
                        <TableCell className="capitalize">{client.type === "athlete" ? `Athlete — ${client.sport}` : `Artist — ${client.discipline}`}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Market Value</TableCell>
                        <TableCell className="font-semibold">{client.marketValue}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Active Deals</TableCell>
                        <TableCell>{client.stats.contractsActive}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Total Deal Value</TableCell>
                        <TableCell className="font-semibold">{client.stats.totalDealValue}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Compliance Score</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={client.stats.complianceScore} className="h-2 w-20" />
                            <span>{client.stats.complianceScore}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Social Reach</TableCell>
                        <TableCell>{client.socialFollowers}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Sections Included</TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {selectedReportSections.map((s) => (
                              <Badge key={s} variant="secondary" className="text-[10px] capitalize">{s}</Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <Button
                  onClick={generateProfileReport}
                  disabled={isPending || selectedReportSections.length === 0}
                  className="w-full bg-primary text-primary-foreground"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Generate & Download Profile Report ({selectedReportSections.length} sections)
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentClientDetail;
