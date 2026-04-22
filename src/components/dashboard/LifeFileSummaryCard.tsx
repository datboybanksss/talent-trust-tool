import { Heart, Shield, TrendingUp, Users, Phone, FileText, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { fetchBeneficiaries, fetchEmergencyContacts, fetchLifeFileDocuments } from "@/services/lifeFileService";
import { fetchLifeFileAssets } from "@/services/lifeFileAssetService";
import { getLifeFileSummary } from "@/data/mockLifeFileData";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(amount);

const LifeFileSummaryCard = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ["life-file-summary", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [beneficiaries, contacts, documents, assets] = await Promise.all([
        fetchBeneficiaries(userId!),
        fetchEmergencyContacts(userId!),
        fetchLifeFileDocuments(userId!),
        fetchLifeFileAssets(userId!),
      ]);
      return { beneficiaries, contacts, documents, assets };
    },
  });

  const summary = data
    ? getLifeFileSummary(data.beneficiaries as any, data.contacts as any, data.documents as any, data.assets as any)
    : null;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
            <Heart className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Life File</h3>
            <p className="text-xs text-muted-foreground">Estate planning snapshot</p>
          </div>
        </div>
        {summary.needsAttention > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium text-warning bg-warning/10 px-2 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            {summary.needsAttention} pending
          </span>
        )}
      </div>

      {/* Progress */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-muted-foreground">Document completion</span>
          <span className={cn(
            "font-medium",
            summary.completedDocs >= summary.documentCount * 0.8 ? "text-success" : "text-warning"
          )}>
            {summary.completedDocs}/{summary.documentCount}
          </span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              summary.completedDocs >= summary.documentCount * 0.8 ? "bg-success" : "bg-warning"
            )}
            style={{ width: `${(summary.completedDocs / Math.max(summary.documentCount, 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <Users className="w-4 h-4 mx-auto text-primary mb-1" />
          <p className="text-lg font-bold text-foreground">{summary.beneficiaryCount}</p>
          <p className="text-xs text-muted-foreground">Beneficiaries</p>
          <span className={cn(
            "text-[10px] font-medium mt-1 inline-block px-1.5 py-0.5 rounded-full",
            summary.allocationComplete ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
          )}>
            {summary.totalAllocation}% allocated
          </span>
        </div>
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <Phone className="w-4 h-4 mx-auto text-gold mb-1" />
          <p className="text-lg font-bold text-foreground">{summary.contactCount}</p>
          <p className="text-xs text-muted-foreground">Emergency Contacts</p>
        </div>
      </div>

      {/* Insurance & Investments */}
      <div className="space-y-2.5 mb-5">
        <div className="flex items-center justify-between p-2.5 bg-secondary/30 rounded-xl">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground font-medium">Insurance Cover</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">{formatCurrency(summary.totalInsuranceCover)}</p>
            <p className="text-[10px] text-muted-foreground">{summary.insurancePolicies} policies</p>
          </div>
        </div>
        <div className="flex items-center justify-between p-2.5 bg-secondary/30 rounded-xl">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gold" />
            <span className="text-sm text-foreground font-medium">Investments</span>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-foreground">{formatCurrency(summary.totalInvestmentValue)}</p>
            <p className="text-[10px] text-muted-foreground">{summary.investmentCount} holdings</p>
          </div>
        </div>
      </div>

      <Button variant="outline" className="w-full" size="sm" asChild>
        <Link to="/dashboard/life-file">
          <FileText className="w-4 h-4" />
          Manage Life File
        </Link>
      </Button>
    </div>
  );
};

export default LifeFileSummaryCard;
