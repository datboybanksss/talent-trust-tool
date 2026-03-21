import DashboardLayout from "@/components/dashboard/DashboardLayout";
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
  Download
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const handleGenerateReport = () => {
    generateExecutiveReportPDF({
      userName: "Client",
      totalPortfolioValue: "R 4,250,000",
      quarterlyChange: "+12.5%",
      companiesCount: 3,
      contractsCount: 8,
      complianceScore: undefined,
      assets: [
        { title: "Business Assets", value: "R 2,500,000", count: 3, trend: { value: 8.2, positive: true } },
        { title: "Investments", value: "R 850,000", count: 5, trend: { value: 15.3, positive: true } },
        { title: "Property", value: "R 650,000", count: 1, trend: { value: 3.1, positive: true } },
        { title: "Liquid Assets", value: "R 250,000", trend: { value: 2.4, positive: false } },
      ],
      complianceItems: [],
      contracts,
      quickStats: quickStats.map(s => ({ label: s.label, value: s.value })),
      lifeFileItems: lifeFileItems.map(i => ({ name: i.name, status: i.status, lastUpdated: i.lastUpdated })),
      beneficiariesCount: 4,
      emergencyContactsCount: 3,
      advisors: { count: 4, types: "Lawyer, Accountant, Agent, Financial Advisor" },
      documentsStored: 24,
      nextDeadline: { date: "Feb 15", description: "Annual Return Due" },
      insurancePolicies: 3,
    });
    toast({ title: "Executive Report Generated", description: "Your PDF report has been downloaded." });
  };

  return (
    <DashboardLayout 
      title="My Profile" 
      subtitle="Overview of your assets and business health"
    >
      {/* Generate Report Button */}
      <div className="flex justify-end mb-6">
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
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs opacity-80">Companies</p>
            </div>
            <div className="h-12 w-px bg-primary-foreground/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs opacity-80">Contracts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Asset Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <AssetSummaryCard
          icon={Building2}
          title="Business Assets"
          value="R 2,500,000"
          count={3}
          trend={{ value: 8.2, positive: true }}
          variant="gold"
        />
        <AssetSummaryCard
          icon={Landmark}
          title="Investments"
          value="R 850,000"
          count={5}
          trend={{ value: 15.3, positive: true }}
        />
        <AssetSummaryCard
          icon={Home}
          title="Property"
          value="R 650,000"
          count={1}
          trend={{ value: 3.1, positive: true }}
        />
        <AssetSummaryCard
          icon={Wallet}
          title="Liquid Assets"
          value="R 250,000"
          trend={{ value: 2.4, positive: false }}
        />
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Contract Expiry Timeline */}
        <ContractExpiryTimeline contracts={contracts} />

        {/* Life File */}
        <LifeFile 
          items={lifeFileItems}
          beneficiaries={4}
          emergencyContacts={3}
        />

        {/* Quick Stats */}
        <QuickStats stats={quickStats} />
      </div>

      {/* Additional Info Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        <div className="bg-card rounded-2xl border border-border p-5 shadow-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-info/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Advisors</p>
              <p className="text-lg font-bold text-foreground">4 Active</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Lawyer, Accountant, Agent, Financial Advisor</p>
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
          <p className="text-xs text-muted-foreground">Annual Return Due</p>
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
          <p className="text-xs text-muted-foreground">Life, Business, Vehicle covered</p>
        </div>
      </div>
    </DashboardLayout>
  );
};

// Mock data
const contracts = [
  {
    name: "Nike Endorsement Deal",
    type: "Endorsement Contract",
    expiryDate: "Mar 15, 2026",
    daysUntilExpiry: 40,
    value: "R 500,000/yr"
  },
  {
    name: "Bulls Rugby Contract",
    type: "Team Contract",
    expiryDate: "Dec 31, 2026",
    daysUntilExpiry: 332,
    value: "R 1,200,000/yr"
  },
  {
    name: "Sports Agency Agreement",
    type: "Agent Contract",
    expiryDate: "Feb 20, 2026",
    daysUntilExpiry: 17,
    value: "15% commission"
  },
];

const quickStats = [
  { label: "Active Companies", value: 3, icon: Building2, color: "success" as const },
  { label: "Pending Tasks", value: 5, icon: FileCheck, color: "warning" as const },
  { label: "This Month Revenue", value: "R 85K", color: "success" as const },
  { label: "Expiring Soon", value: 2, color: "destructive" as const },
];

const lifeFileItems = [
  { name: "Last Will & Testament", status: "complete" as const, lastUpdated: "Jan 2026", icon: FileText },
  { name: "Power of Attorney", status: "complete" as const, lastUpdated: "Dec 2025", icon: Key },
  { name: "Living Will", status: "incomplete" as const, icon: Heart },
  { name: "Trust Documents", status: "complete" as const, lastUpdated: "Nov 2025", icon: Briefcase },
  { name: "Insurance Policies", status: "needs-update" as const, lastUpdated: "Jun 2024", icon: Shield },
];

export default Profile;
