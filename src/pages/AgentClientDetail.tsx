import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, FileText, Bell, Handshake, BarChart3, Download,
  Calendar, DollarSign, Shield, Clock, CheckCircle2, AlertTriangle,
  TrendingUp, Mail, Phone, Globe, HeartPulse, Lock, Loader2,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { getLifeFileSummary } from "@/data/mockLifeFileData";
import { generateLifeFilePDF } from "@/utils/lifeFilePdfExport";
import { INSURANCE_TYPES, INVESTMENT_TYPES, type LifeFileAsset } from "@/types/lifeFileAsset";
import type { Beneficiary, EmergencyContact, LifeFileDocument } from "@/types/lifeFile";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fetchBeneficiaries, fetchEmergencyContacts, fetchLifeFileDocuments } from "@/services/lifeFileService";
import { fetchLifeFileAssets } from "@/services/lifeFileAssetService";
import StaffContextBanner from "@/components/agent/StaffContextBanner";

interface Invitation {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  client_type: string;
  status: string;
  activated_user_id: string | null;
  pre_populated_data: Record<string, unknown> | null;
  created_at: string;
  activated_at: string | null;
  requested_share_sections: string[] | null;
}

interface Deal {
  id: string;
  brand: string;
  deal_type: string;
  value_amount: number | null;
  value_text: string;
  currency: string;
  start_date: string | null;
  end_date: string | null;
  status: string;
}

interface ShareRow {
  status: string;
  sections: string[] | null;
  expires_at: string | null;
}

const formatCurrency = (amount: number | null, currency = "ZAR") => {
  if (amount === null || amount === undefined) return "—";
  if (currency === "ZAR") return `R${amount.toLocaleString()}`;
  return `${currency} ${amount.toLocaleString()}`;
};

const dealStatusColor = (s: string) => {
  if (s === "active" || s === "closed_won") return "bg-green-500/10 text-green-700 border-green-200";
  if (s === "negotiating" || s === "prospecting") return "bg-amber-500/10 text-amber-700 border-amber-200";
  return "bg-muted text-muted-foreground";
};

const AgentClientDetail = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [profile, setProfile] = useState<{ avatar_url: string | null; client_type: string | null } | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [share, setShare] = useState<ShareRow | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [documents, setDocuments] = useState<LifeFileDocument[]>([]);
  const [assets, setAssets] = useState<LifeFileAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedReportSections, setSelectedReportSections] = useState<string[]>([
    "bio", "deals", "stats", "documents",
  ]);

  const isPending = !invitation?.activated_user_id;
  const activatedUserId = invitation?.activated_user_id ?? null;
  const shareAccepted = share?.status === "accepted";

  // Fetch invitation + dependent data
  const loadAll = useCallback(async () => {
    if (!clientId || !user) return;
    setLoading(true);

    const { data: inv, error: invErr } = await supabase
      .from("client_invitations")
      .select("id, client_name, client_email, client_phone, client_type, status, activated_user_id, pre_populated_data, created_at, activated_at, requested_share_sections")
      .eq("id", clientId)
      .maybeSingle();

    if (invErr || !inv) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    setInvitation(inv as unknown as Invitation);

    // Deals belong to this agent + client name regardless of activation
    const { data: dealsData } = await supabase
      .from("agent_deals")
      .select("id, brand, deal_type, value_amount, value_text, currency, start_date, end_date, status")
      .eq("agent_id", user.id)
      .eq("client_name", inv.client_name)
      .order("created_at", { ascending: false });
    setDeals((dealsData as Deal[]) ?? []);

    if (inv.activated_user_id) {
      const [profileRes, shareRes, b, c, d, a] = await Promise.all([
        supabase.from("profiles").select("avatar_url, client_type").eq("user_id", inv.activated_user_id).maybeSingle(),
        supabase.from("life_file_shares").select("status, sections, expires_at")
          .eq("owner_id", inv.activated_user_id).eq("shared_with_user_id", user.id).maybeSingle(),
        fetchBeneficiaries(inv.activated_user_id).catch(() => []),
        fetchEmergencyContacts(inv.activated_user_id).catch(() => []),
        fetchLifeFileDocuments(inv.activated_user_id).catch(() => []),
        fetchLifeFileAssets(inv.activated_user_id).catch(() => []),
      ]);
      setProfile(profileRes.data);
      setShare(shareRes.data as ShareRow | null);
      setBeneficiaries(b as Beneficiary[]);
      setEmergencyContacts(c as EmergencyContact[]);
      setDocuments(d as LifeFileDocument[]);
      setAssets(a as LifeFileAsset[]);
    } else {
      setProfile(null);
      setShare(null);
      setBeneficiaries([]); setEmergencyContacts([]); setDocuments([]); setAssets([]);
    }

    setLoading(false);
  }, [clientId, user]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Realtime subscriptions
  useEffect(() => {
    if (!activatedUserId || !user) return;
    const channel = supabase
      .channel(`client-detail-${activatedUserId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "life_file_documents", filter: `user_id=eq.${activatedUserId}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "life_file_assets", filter: `user_id=eq.${activatedUserId}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "agent_deals", filter: `agent_id=eq.${user.id}` }, () => loadAll())
      .on("postgres_changes", { event: "*", schema: "public", table: "life_file_shares", filter: `owner_id=eq.${activatedUserId}` }, () => loadAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activatedUserId, user, loadAll]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (notFound || !invitation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
            <h2 className="text-lg font-semibold">Client not found</h2>
            <p className="text-sm text-muted-foreground">This invitation may have been removed or you don't have access.</p>
            <Button onClick={() => navigate("/agent-dashboard")}><ArrowLeft className="w-4 h-4 mr-2" /> Back to dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const lifeFileSummary = getLifeFileSummary(beneficiaries, emergencyContacts, documents, assets);
  const insuranceAssets = assets.filter((a) => a.asset_category === "insurance");
  const investmentAssets = assets.filter((a) => a.asset_category === "investment");
  const hasLifeFileData = beneficiaries.length + emergencyContacts.length + documents.length + assets.length > 0;

  const activeDealsCount = deals.filter((d) => d.status === "active" || d.status === "negotiating").length;
  const totalDealValue = deals.reduce((sum, d) => sum + (d.value_amount ?? 0), 0);
  const expiredDocs = documents.filter((d) => d.is_expired || (d.expiry_date && new Date(d.expiry_date) < new Date())).length;
  const complianceScore = documents.length > 0
    ? Math.round(((documents.length - expiredDocs) / documents.length) * 100)
    : null;

  const clientTypeLabel = invitation.client_type.charAt(0).toUpperCase() + invitation.client_type.slice(1);
  const statusLabel = isPending ? "Pending" : "Activated";
  const initials = invitation.client_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const handleDownloadLifeFile = () => {
    if (!shareAccepted) {
      toast({ title: "Access not granted", description: "The client has not accepted your Life File share yet.", variant: "destructive" });
      return;
    }
    if (!hasLifeFileData) {
      toast({ title: "No Life File data", description: "This client has not populated their Life File yet.", variant: "destructive" });
      return;
    }
    generateLifeFilePDF({ beneficiaries, emergencyContacts, documents, assets, userName: invitation.client_name });
    toast({ title: "Life File PDF Generated", description: `Full Life File report for ${invitation.client_name} downloaded.` });
  };

  const toggleReportSection = (section: string) => {
    setSelectedReportSections((prev) => prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]);
  };

  const generateProfileReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const gold: [number, number, number] = [196, 155, 45];
    const dark: [number, number, number] = [30, 30, 30];
    let y = 20;

    doc.setFillColor(...gold);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Client Profile Report", 20, 20);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${invitation.client_name} — ${clientTypeLabel}`, 20, 30);
    doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, pageWidth - 20, 30, { align: "right" });

    y = 52;
    doc.setTextColor(...dark);

    if (selectedReportSections.includes("bio")) {
      doc.setFontSize(13); doc.setFont("helvetica", "bold");
      doc.text("Client Overview", 20, y); y += 10;
      autoTable(doc, {
        startY: y,
        body: [
          ["Full Name", invitation.client_name],
          ["Type", clientTypeLabel],
          ["Email", invitation.client_email],
          ["Phone", invitation.client_phone || "—"],
          ["Status", statusLabel],
          ["Activated On", invitation.activated_at ? format(new Date(invitation.activated_at), "MMM d, yyyy") : "—"],
        ],
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
        margin: { left: 20, right: 20 },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
    }

    if (selectedReportSections.includes("stats")) {
      doc.setFontSize(13); doc.setFont("helvetica", "bold");
      doc.text("Key Metrics", 20, y); y += 10;
      autoTable(doc, {
        startY: y,
        body: [
          ["Active Deals", `${activeDealsCount}`],
          ["Total Deal Value", formatCurrency(totalDealValue)],
          ["Compliance Score", complianceScore !== null ? `${complianceScore}%` : "—"],
          ["Documents on File", `${documents.length}`],
        ],
        theme: "grid",
        headStyles: { fillColor: gold },
        styles: { fontSize: 9, cellPadding: 5 },
        columnStyles: { 0: { fontStyle: "bold", cellWidth: 55 } },
        margin: { left: 20, right: 20 },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
    }

    if (selectedReportSections.includes("deals") && deals.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFontSize(13); doc.setFont("helvetica", "bold");
      doc.text("Deals & Partnerships", 20, y); y += 10;
      autoTable(doc, {
        startY: y,
        head: [["Brand", "Type", "Value", "Period", "Status"]],
        body: deals.map((d) => [
          d.brand,
          d.deal_type,
          d.value_text || formatCurrency(d.value_amount, d.currency),
          `${d.start_date || "—"} → ${d.end_date || "ongoing"}`,
          d.status,
        ]),
        theme: "grid",
        headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 4 },
        margin: { left: 20, right: 20 },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;
    }

    if (selectedReportSections.includes("documents") && documents.length > 0) {
      if (y > 220) { doc.addPage(); y = 20; }
      doc.setFontSize(13); doc.setFont("helvetica", "bold");
      doc.text("Documents on File", 20, y); y += 10;
      autoTable(doc, {
        startY: y,
        head: [["Document", "Type", "Expiry", "Status"]],
        body: documents.map((d) => [d.title, d.document_type, d.expiry_date || "—", d.status]),
        theme: "grid",
        headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 4 },
        margin: { left: 20, right: 20 },
      });
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8); doc.setTextColor(150, 150, 150);
      doc.text(`CONFIDENTIAL — ${invitation.client_name} Profile Report`, 20, doc.internal.pageSize.getHeight() - 10);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10, { align: "right" });
    }

    doc.save(`ProfileReport_${invitation.client_name.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    toast({ title: "Report Generated", description: `Profile report for ${invitation.client_name} downloaded.` });
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
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={invitation.client_name} className="w-12 h-12 rounded-full object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-lg">
                {initials}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-display font-bold text-foreground">{invitation.client_name}</h1>
                <Badge variant={isPending ? "outline" : "default"} className={isPending ? "text-amber-600 border-amber-200" : "bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/10"}>
                  {statusLabel}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">{clientTypeLabel}</p>
            </div>
          </div>
          <Button onClick={generateProfileReport} disabled={isPending} className="bg-primary text-primary-foreground">
            <Download className="w-4 h-4 mr-2" /> Generate Report
          </Button>
        </div>
      </header>

      <StaffContextBanner />

      <div className="container py-6 max-w-6xl mx-auto space-y-6">
        {/* Pending banner */}
        {isPending && (
          <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
            <CardContent className="py-4 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {invitation.client_name} hasn't activated their profile yet. Full dashboard data will appear after activation.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Contact strip */}
        <Card>
          <CardContent className="py-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" /> {invitation.client_email}</span>
            {invitation.client_phone && (
              <span className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4" /> {invitation.client_phone}</span>
            )}
            <span className="flex items-center gap-2 text-muted-foreground"><Calendar className="w-4 h-4" /> Invited {format(new Date(invitation.created_at), "MMM d, yyyy")}</span>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Handshake, label: "Active Deals", value: isPending ? "—" : `${activeDealsCount}`, color: "text-green-600" },
            { icon: TrendingUp, label: "Total Deal Value", value: isPending ? "—" : formatCurrency(totalDealValue), color: "text-primary" },
            { icon: Shield, label: "Compliance", value: complianceScore !== null ? `${complianceScore}%` : "—", color: "text-blue-600" },
            { icon: Globe, label: "Documents", value: isPending ? "—" : `${documents.length}`, color: "text-purple-600" },
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="deals" className="text-xs sm:text-sm"><Handshake className="w-4 h-4 mr-1.5 hidden sm:inline" /> Deals</TabsTrigger>
            <TabsTrigger value="lifefile" className="text-xs sm:text-sm"><HeartPulse className="w-4 h-4 mr-1.5 hidden sm:inline" /> Life File</TabsTrigger>
            <TabsTrigger value="documents" className="text-xs sm:text-sm"><FileText className="w-4 h-4 mr-1.5 hidden sm:inline" /> Documents</TabsTrigger>
            <TabsTrigger value="reminders" className="text-xs sm:text-sm"><Bell className="w-4 h-4 mr-1.5 hidden sm:inline" /> Reminders</TabsTrigger>
            <TabsTrigger value="report" className="text-xs sm:text-sm"><BarChart3 className="w-4 h-4 mr-1.5 hidden sm:inline" /> Report</TabsTrigger>
          </TabsList>

          {/* Deals Tab — live agent_deals */}
          <TabsContent value="deals">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deals & Partnerships</CardTitle>
                <CardDescription>Deals you've recorded for {invitation.client_name}</CardDescription>
              </CardHeader>
              <CardContent>
                {deals.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No deals on record yet. Add deals from the Pipeline.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Brand</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead className="hidden md:table-cell">Period</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deals.map((deal) => (
                        <TableRow key={deal.id}>
                          <TableCell className="font-medium">{deal.brand}</TableCell>
                          <TableCell>{deal.deal_type}</TableCell>
                          <TableCell className="font-semibold">{deal.value_text || formatCurrency(deal.value_amount, deal.currency)}</TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground text-xs">
                            {deal.start_date || "—"} → {deal.end_date || "ongoing"}
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

          {/* Life File Tab — gated by share status */}
          <TabsContent value="lifefile">
            {isPending ? (
              <Card><CardContent className="py-12 text-center text-sm text-muted-foreground">Awaiting client activation.</CardContent></Card>
            ) : !shareAccepted ? (
              <Card className="border-amber-300/50">
                <CardContent className="py-12 text-center space-y-3">
                  <Lock className="w-10 h-10 text-amber-600 mx-auto" />
                  <h3 className="text-lg font-semibold text-foreground">Access not granted</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {invitation.client_name} hasn't accepted your Life File share request yet. Once they grant access, their estate snapshot will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleDownloadLifeFile} className="bg-primary text-primary-foreground">
                    <Download className="w-4 h-4 mr-2" /> Download Life File PDF
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estate Planning Snapshot</CardTitle>
                    <CardDescription>Live overview of {invitation.client_name}'s Life File</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Beneficiaries", value: lifeFileSummary.beneficiaryCount, sub: lifeFileSummary.allocationComplete ? "100% allocated" : `${lifeFileSummary.totalAllocation}% allocated` },
                        { label: "Emergency Contacts", value: lifeFileSummary.contactCount, sub: "On record" },
                        { label: "Documents", value: `${lifeFileSummary.completedDocs}/${lifeFileSummary.documentCount}`, sub: `${lifeFileSummary.needsAttention} need attention` },
                        { label: "Insurance Policies", value: lifeFileSummary.insurancePolicies, sub: `R${(lifeFileSummary.totalInsuranceCover / 1000000).toFixed(1)}M cover` },
                      ].map((item, i) => (
                        <div key={i} className="p-3 rounded-lg bg-muted/50 text-center">
                          <p className="text-2xl font-display font-bold text-foreground">{item.value}</p>
                          <p className="text-xs font-medium text-foreground">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Insurance Policies</CardTitle>
                    <CardDescription>{insuranceAssets.length} policies · Total cover R{(lifeFileSummary.totalInsuranceCover / 1000000).toFixed(1)}M</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {insuranceAssets.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No insurance policies on file yet.</p>
                    ) : (
                      <Table>
                        <TableHeader><TableRow>
                          <TableHead>Type</TableHead><TableHead>Institution</TableHead><TableHead>Cover</TableHead>
                          <TableHead className="hidden md:table-cell">Premium</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {insuranceAssets.map((asset) => (
                            <TableRow key={asset.id}>
                              <TableCell className="font-medium">{INSURANCE_TYPES.find((t) => t.value === asset.asset_type)?.label || asset.asset_type}</TableCell>
                              <TableCell>{asset.institution}</TableCell>
                              <TableCell className="font-semibold">R{(asset.amount || 0).toLocaleString()}</TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground">
                                {asset.premium_or_contribution ? `R${asset.premium_or_contribution.toLocaleString()}/m` : "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Investments</CardTitle>
                    <CardDescription>{investmentAssets.length} investments · R{(lifeFileSummary.totalInvestmentValue / 1000000).toFixed(1)}M</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {investmentAssets.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No investments on file yet.</p>
                    ) : (
                      <Table>
                        <TableHeader><TableRow>
                          <TableHead>Type</TableHead><TableHead>Institution</TableHead><TableHead>Value</TableHead>
                          <TableHead className="hidden md:table-cell">Contribution</TableHead>
                        </TableRow></TableHeader>
                        <TableBody>
                          {investmentAssets.map((asset) => (
                            <TableRow key={asset.id}>
                              <TableCell className="font-medium">{INVESTMENT_TYPES.find((t) => t.value === asset.asset_type)?.label || asset.asset_type}</TableCell>
                              <TableCell>{asset.institution}</TableCell>
                              <TableCell className="font-semibold">R{(asset.amount || 0).toLocaleString()}</TableCell>
                              <TableCell className="hidden md:table-cell text-muted-foreground">
                                {asset.premium_or_contribution ? `R${asset.premium_or_contribution.toLocaleString()}/m` : "Lump sum"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Documents Tab — live life_file_documents */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Documents</CardTitle>
                <CardDescription>{documents.length} documents on file</CardDescription>
              </CardHeader>
              <CardContent>
                {isPending ? (
                  <p className="text-sm text-muted-foreground text-center py-8">Awaiting client activation.</p>
                ) : !shareAccepted ? (
                  <div className="text-center py-8 space-y-2">
                    <Lock className="w-8 h-8 text-amber-600 mx-auto" />
                    <p className="text-sm text-muted-foreground">Client has not granted access to documents.</p>
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-colors">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.document_type}{doc.expiry_date ? ` · expires ${doc.expiry_date}` : ""}
                          </p>
                        </div>
                        <Badge variant="outline" className={doc.is_expired ? "text-destructive border-destructive/30" : "text-green-600 border-green-200"}>
                          {doc.is_expired ? "expired" : doc.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reminders Tab */}
          <TabsContent value="reminders">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
                <CardDescription>Document expiries and deal end dates for {invitation.client_name}</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const upcoming: { id: string; title: string; due: string; kind: string }[] = [];
                  documents.forEach((d) => {
                    if (d.expiry_date) upcoming.push({ id: `doc-${d.id}`, title: `${d.title} expires`, due: d.expiry_date, kind: "Document" });
                  });
                  deals.forEach((d) => {
                    if (d.end_date) upcoming.push({ id: `deal-${d.id}`, title: `${d.brand} deal ends`, due: d.end_date, kind: "Deal" });
                  });
                  upcoming.sort((a, b) => a.due.localeCompare(b.due));
                  if (upcoming.length === 0) {
                    return <p className="text-sm text-muted-foreground text-center py-8">No upcoming deadlines.</p>;
                  }
                  return (
                    <div className="space-y-3">
                      {upcoming.slice(0, 10).map((rem) => {
                        const overdue = new Date(rem.due) < new Date();
                        return (
                          <div key={rem.id} className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${overdue ? "bg-red-500" : "bg-green-500"}`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{rem.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">{rem.due}</span>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-xs">{rem.kind}</Badge>
                            {overdue && <Badge variant="destructive" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" /> Overdue</Badge>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Report Tab */}
          <TabsContent value="report">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Profile Report Generator</CardTitle>
                <CardDescription>Select sections to include in the PDF.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "bio", label: "Client Overview", description: "Name, type, contact, status" },
                    { id: "stats", label: "Key Metrics", description: "Deals, compliance, document count" },
                    { id: "deals", label: "Deals & Partnerships", description: "All recorded deals" },
                    { id: "documents", label: "Documents on File", description: "Life File documents" },
                  ].map((section) => (
                    <div key={section.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedReportSections.includes(section.id) ? "border-primary bg-primary/5" : "border-border/50 hover:border-border"
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

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-3">Report Preview</h4>
                  <Table>
                    <TableHeader><TableRow><TableHead>Field</TableHead><TableHead>Value</TableHead></TableRow></TableHeader>
                    <TableBody>
                      <TableRow><TableCell className="font-medium">Client Name</TableCell><TableCell>{invitation.client_name}</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium">Type</TableCell><TableCell className="capitalize">{clientTypeLabel}</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium">Status</TableCell><TableCell>{statusLabel}</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium">Active Deals</TableCell><TableCell>{activeDealsCount}</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium">Total Deal Value</TableCell><TableCell className="font-semibold">{formatCurrency(totalDealValue)}</TableCell></TableRow>
                      <TableRow><TableCell className="font-medium">Compliance</TableCell>
                        <TableCell>{complianceScore !== null ? (
                          <div className="flex items-center gap-2"><Progress value={complianceScore} className="h-2 w-20" /><span>{complianceScore}%</span></div>
                        ) : "—"}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <Button onClick={generateProfileReport} disabled={isPending || selectedReportSections.length === 0}
                  className="w-full bg-primary text-primary-foreground" size="lg">
                  <Download className="w-4 h-4 mr-2" /> Generate & Download Profile Report ({selectedReportSections.length} sections)
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
