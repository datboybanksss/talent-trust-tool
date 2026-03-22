import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useProfile, ClientType } from "@/hooks/useProfile";
import CurrentTierBadge from "@/components/subscription/CurrentTierBadge";
import AssetSummaryCard from "@/components/dashboard/profile/AssetSummaryCard";
import ContractExpiryTimeline from "@/components/dashboard/profile/ContractExpiryTimeline";
import QuickStats from "@/components/dashboard/profile/QuickStats";
import LifeFile from "@/components/dashboard/profile/LifeFile";
import { Button } from "@/components/ui/button";
import { generateExecutiveReportPDF } from "@/utils/executiveReportPdf";
import { 
  Building2, 
  Landmark, 
  Home,
  Wallet,
  TrendingUp,
  FileCheck,
  Users,
  Calendar,
  Shield,
  FileText,
  Heart,
  Key,
  Briefcase,
  Download,
  Trophy,
  Palette,
  Music,
  Target,
  Settings
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const Profile = () => {
  const { isAthlete, isArtist, clientType, updateClientType } = useProfile();
  const [saving, setSaving] = useState(false);

  const handleClientTypeChange = async (value: string) => {
    setSaving(true);
    const newType = (value === "default" ? null : value) as ClientType;
    const result = await updateClientType(newType);
    setSaving(false);
    if (result?.error) {
      toast({ title: "Error", description: "Failed to update client type.", variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Profile switched to ${value === "default" ? "General" : value}.` });
    }
  };

  const handleGenerateReport = () => {
    generateExecutiveReportPDF({
      userName: "Client",
      totalPortfolioValue: "R 4,250,000",
      quarterlyChange: "+12.5%",
      companiesCount: 3,
      contractsCount: 8,
      complianceScore: undefined,
      assets: assetCards,
      complianceItems: [],
      contracts: isAthlete ? athleteContracts : isArtist ? artistContracts : defaultContracts,
      quickStats: (isAthlete ? athleteQuickStats : isArtist ? artistQuickStats : defaultQuickStats).map(s => ({ label: s.label, value: s.value })),
      lifeFileItems: lifeFileItems.map(i => ({ name: i.name, status: i.status, lastUpdated: i.lastUpdated })),
      beneficiariesCount: 4,
      emergencyContactsCount: 3,
      advisors: { count: 4, types: isAthlete ? "Lawyer, Agent, Financial Advisor, Sports Doctor" : isArtist ? "Lawyer, Manager, Accountant, Publicist" : "Lawyer, Accountant, Agent, Financial Advisor" },
      documentsStored: 24,
      nextDeadline: { date: "Feb 15", description: "Annual Return Due" },
      insurancePolicies: 3,
    });
    toast({ title: "Executive Report Generated", description: "Your PDF report has been downloaded." });
  };

  const contracts = isAthlete ? athleteContracts : isArtist ? artistContracts : defaultContracts;
  const stats = isAthlete ? athleteQuickStats : isArtist ? artistQuickStats : defaultQuickStats;
  const advisorLabel = isAthlete ? "Lawyer, Agent, Financial Advisor, Sports Doctor" : isArtist ? "Lawyer, Manager, Accountant, Publicist" : "Lawyer, Accountant, Agent, Financial Advisor";

  return (
    <DashboardLayout 
      title="My Profile" 
      subtitle={
        isAthlete ? "Overview of your athletic career assets and business health" 
        : isArtist ? "Overview of your creative career assets and business health" 
        : "Overview of your assets and business health"
      }
    >
      {/* Subscription Tier */}
      <div className="mb-4">
        <CurrentTierBadge tierType="client" />
      </div>

      {/* Settings & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        {/* Client Type Switcher */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-soft flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-accent/50 flex items-center justify-center">
            <Settings className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <Label className="text-sm text-muted-foreground whitespace-nowrap">Profile Type:</Label>
            <RadioGroup
              value={clientType ?? "default"}
              onValueChange={handleClientTypeChange}
              className="flex gap-4"
              disabled={saving}
            >
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="default" id="type-default" />
                <Label htmlFor="type-default" className="text-sm cursor-pointer">General</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="athlete" id="type-athlete" />
                <Label htmlFor="type-athlete" className="text-sm cursor-pointer">Athlete</Label>
              </div>
              <div className="flex items-center gap-1.5">
                <RadioGroupItem value="artist" id="type-artist" />
                <Label htmlFor="type-artist" className="text-sm cursor-pointer">Artist</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <Button onClick={handleGenerateReport} variant="outline" className="gap-2 border-primary/30 hover:bg-primary/10 text-foreground">
          <Download className="w-4 h-4 text-primary" />
          Generate Executive Report
        </Button>
      </div>

      {/* Total Net Worth Banner */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 mb-8 text-primary-foreground">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm opacity-80 uppercase tracking-wider">Total Portfolio Value</p>
            <p className="text-4xl font-display font-bold mt-1">R 4,250,000</p>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+12.5% from last quarter</span>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{isAthlete ? "2" : isArtist ? "1" : "3"}</p>
              <p className="text-xs opacity-80">{isAthlete ? "Teams" : isArtist ? "Labels" : "Companies"}</p>
            </div>
            <div className="h-12 w-px bg-primary-foreground/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">{contracts.length}</p>
              <p className="text-xs opacity-80">Contracts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {(isAthlete ? athleteAssets : isArtist ? artistAssets : defaultAssets).map((asset, i) => (
          <AssetSummaryCard key={i} {...asset} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
        <ContractExpiryTimeline contracts={contracts} />
        <LifeFile items={lifeFileItems} beneficiaries={4} emergencyContacts={3} />
        <QuickStats stats={stats} />
      </div>

      {/* Additional Info Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{isAthlete ? "Team & Advisors" : isArtist ? "Management" : "Advisors"}</p>
              <p className="text-lg font-bold text-foreground">4 Active</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{advisorLabel}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Documents</p>
              <p className="text-lg font-bold text-foreground">24 Stored</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">All documents securely encrypted</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next Deadline</p>
              <p className="text-lg font-bold text-foreground">Feb 15</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{isAthlete ? "Contract Renewal Due" : isArtist ? "Royalty Filing Due" : "Annual Return Due"}</p>
        </div>

        <div className="bg-card rounded-2xl border border-border p-5 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Insurance</p>
              <p className="text-lg font-bold text-foreground">3 Policies</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {isAthlete ? "Career, Injury, Vehicle covered" : isArtist ? "Life, Equipment, Liability covered" : "Life, Business, Vehicle covered"}
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

// ── Asset Cards ──

const assetCards = [
  { title: "Business Assets", value: "R 2,500,000", count: 3, trend: { value: 8.2, positive: true } },
  { title: "Investments", value: "R 850,000", count: 5, trend: { value: 15.3, positive: true } },
  { title: "Property", value: "R 650,000", count: 1, trend: { value: 3.1, positive: true } },
  { title: "Liquid Assets", value: "R 250,000", trend: { value: 2.4, positive: false } },
];

const defaultAssets = [
  { icon: Building2, title: "Business Assets", value: "R 2,500,000", count: 3, trend: { value: 8.2, positive: true }, variant: "gold" as const },
  { icon: Landmark, title: "Investments", value: "R 850,000", count: 5, trend: { value: 15.3, positive: true } },
  { icon: Home, title: "Property", value: "R 650,000", count: 1, trend: { value: 3.1, positive: true } },
  { icon: Wallet, title: "Liquid Assets", value: "R 250,000", trend: { value: 2.4, positive: false } },
];

const athleteAssets = [
  { icon: Trophy, title: "Contract Value", value: "R 1,700,000", count: 3, trend: { value: 12.0, positive: true }, variant: "gold" as const },
  { icon: Target, title: "Endorsements", value: "R 800,000", count: 4, trend: { value: 18.5, positive: true } },
  { icon: Home, title: "Property", value: "R 650,000", count: 1, trend: { value: 3.1, positive: true } },
  { icon: Wallet, title: "Savings & Investments", value: "R 1,100,000", trend: { value: 8.7, positive: true } },
];

const artistAssets = [
  { icon: Music, title: "Royalty Portfolio", value: "R 950,000", count: 12, trend: { value: 22.0, positive: true }, variant: "gold" as const },
  { icon: Palette, title: "Creative Assets", value: "R 1,200,000", count: 3, trend: { value: 15.3, positive: true } },
  { icon: Landmark, title: "Investments", value: "R 850,000", count: 5, trend: { value: 9.1, positive: true } },
  { icon: Wallet, title: "Liquid Assets", value: "R 1,250,000", trend: { value: 4.2, positive: true } },
];

// ── Contracts ──

const defaultContracts = [
  { name: "Nike Endorsement Deal", type: "Endorsement Contract", expiryDate: "Mar 15, 2026", daysUntilExpiry: 40, value: "R 500,000/yr" },
  { name: "Bulls Rugby Contract", type: "Team Contract", expiryDate: "Dec 31, 2026", daysUntilExpiry: 332, value: "R 1,200,000/yr" },
  { name: "Sports Agency Agreement", type: "Agent Contract", expiryDate: "Feb 20, 2026", daysUntilExpiry: 17, value: "15% commission" },
];

const athleteContracts = [
  { name: "Nike Endorsement Deal", type: "Endorsement", expiryDate: "Mar 15, 2026", daysUntilExpiry: 40, value: "R 500,000/yr" },
  { name: "Bulls Rugby Contract", type: "Team Contract", expiryDate: "Dec 31, 2026", daysUntilExpiry: 332, value: "R 1,200,000/yr" },
  { name: "Adidas Boot Deal", type: "Equipment Sponsor", expiryDate: "Jun 30, 2026", daysUntilExpiry: 101, value: "R 300,000/yr" },
  { name: "Sports Agency Agreement", type: "Agent", expiryDate: "Feb 20, 2026", daysUntilExpiry: 17, value: "15% commission" },
];

const artistContracts = [
  { name: "Sony Music Publishing", type: "Publishing Deal", expiryDate: "Sep 30, 2026", daysUntilExpiry: 193, value: "R 600,000/yr" },
  { name: "Gallery X Representation", type: "Gallery Contract", expiryDate: "Mar 15, 2026", daysUntilExpiry: 40, value: "30% commission" },
  { name: "Spotify Licensing Agreement", type: "Streaming", expiryDate: "Dec 31, 2026", daysUntilExpiry: 332, value: "R 120,000/yr" },
];

// ── Quick Stats ──

const defaultQuickStats = [
  { label: "Active Companies", value: 3, icon: Building2, color: "success" as const },
  { label: "Pending Tasks", value: 5, icon: FileCheck, color: "warning" as const },
  { label: "This Month Revenue", value: "R 85K", color: "success" as const },
  { label: "Expiring Soon", value: 2, color: "destructive" as const },
];

const athleteQuickStats = [
  { label: "Active Contracts", value: 4, icon: Trophy, color: "success" as const },
  { label: "Pending Actions", value: 5, icon: FileCheck, color: "warning" as const },
  { label: "Season Earnings", value: "R 1.7M", color: "success" as const },
  { label: "Contracts Expiring", value: 2, color: "destructive" as const },
];

const artistQuickStats = [
  { label: "Active Projects", value: 4, icon: Music, color: "success" as const },
  { label: "Pending Actions", value: 3, icon: FileCheck, color: "warning" as const },
  { label: "Quarterly Royalties", value: "R 85K", color: "success" as const },
  { label: "Deals Expiring", value: 1, color: "destructive" as const },
];

// ── Life File Items ──

const lifeFileItems = [
  { name: "Last Will & Testament", status: "complete" as const, lastUpdated: "Jan 2026", icon: FileText },
  { name: "Power of Attorney", status: "complete" as const, lastUpdated: "Dec 2025", icon: Key },
  { name: "Living Will", status: "incomplete" as const, icon: Heart },
  { name: "Trust Documents", status: "complete" as const, lastUpdated: "Nov 2025", icon: Briefcase },
  { name: "Insurance Policies", status: "needs-update" as const, lastUpdated: "Jun 2024", icon: Shield },
];

export default Profile;
