import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Pencil,
  Trash2,
  Shield,
  TrendingUp,
  Building,
  BadgeDollarSign,
  Users,
  Plug,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LifeFileAsset,
  INSURANCE_TYPES,
  INVESTMENT_TYPES,
  PREMIUM_FREQUENCIES,
} from "@/types/lifeFileAsset";
import ImportFromIntegrationsDialog from "./ImportFromIntegrationsDialog";

interface AssetRegistryTabProps {
  assets: LifeFileAsset[];
  onAdd: (category: "insurance" | "investment") => void;
  onEdit: (asset: LifeFileAsset) => void;
  onDelete: (asset: LifeFileAsset) => void;
  onImportFromIntegrations?: (assets: Omit<LifeFileAsset, "id" | "created_at" | "updated_at">[]) => void;
}

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(amount);

const AssetRegistryTab = ({ assets, onAdd, onEdit, onDelete, onImportFromIntegrations }: AssetRegistryTabProps) => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [shortfallExpanded, setShortfallExpanded] = useState(false);
  const insurances = assets.filter((a) => a.asset_category === "insurance");
  const investments = assets.filter((a) => a.asset_category === "investment");

  const totalInsuranceCover = insurances.reduce((s, a) => s + (a.amount || 0), 0);
  const totalInvestmentValue = investments.reduce((s, a) => s + (a.amount || 0), 0);

  // Shortfall analysis against SA benchmarks
  const activeIns = insurances.filter(a => a.status === "active");
  const activeInv = investments.filter(a => a.status === "active");

  const shortfalls = [
    {
      area: "Life Cover",
      current: activeIns.filter(a => ["life", "credit_life"].includes(a.asset_type)).reduce((s, a) => s + (a.amount || 0), 0),
      recommended: 5_000_000,
      products: ["Term Life Insurance", "Whole Life Insurance"],
    },
    {
      area: "Disability / Income Protection",
      current: activeIns.filter(a => a.asset_type === "disability").reduce((s, a) => s + (a.amount || 0), 0),
      recommended: 2_000_000,
      products: ["Income Protection Policy", "Disability Lump-Sum Cover"],
    },
    {
      area: "Key-Man Cover",
      current: activeIns.filter(a => a.asset_type === "keyman").reduce((s, a) => s + (a.amount || 0), 0),
      recommended: 3_000_000,
      products: ["Key-Man Insurance Policy"],
    },
    {
      area: "Funeral Cover",
      current: activeIns.filter(a => a.asset_type === "funeral").reduce((s, a) => s + (a.amount || 0), 0),
      recommended: 50_000,
      products: ["Funeral Cover Policy"],
    },
    {
      area: "Retirement Savings",
      current: activeInv.filter(a => ["retirement_annuity", "pension_fund", "provident_fund", "preservation_fund", "living_annuity"].includes(a.asset_type)).reduce((s, a) => s + (a.amount || 0), 0),
      recommended: 8_000_000,
      products: ["Retirement Annuity (RA)", "Pension / Provident Fund"],
    },
    {
      area: "Investment Portfolio",
      current: activeInv.reduce((s, a) => s + (a.amount || 0), 0),
      recommended: 3_000_000,
      products: ["Tax-Free Savings", "Unit Trust", "Offshore Investment"],
    },
  ].map(s => ({ ...s, gap: Math.max(0, s.recommended - s.current) }));

  const gaps = shortfalls.filter(s => s.gap > 0);
  const adequateCount = shortfalls.length - gaps.length;

  const getTypeLabel = (category: string, type: string) => {
    const list = category === "insurance" ? INSURANCE_TYPES : INVESTMENT_TYPES;
    return list.find((t) => t.value === type)?.label || type;
  };

  const getFrequencyLabel = (freq: string | null) =>
    PREMIUM_FREQUENCIES.find((f) => f.value === freq)?.label || freq || "—";

  const renderAssetCard = (asset: LifeFileAsset) => (
    <div
      key={asset.id}
      className={cn(
        "bg-card rounded-2xl border p-5 shadow-soft",
        asset.status === "active" ? "border-success/30" :
        asset.status === "lapsed" ? "border-destructive/30" : "border-border"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            asset.asset_category === "insurance" ? "bg-primary/10" : "bg-gold/10"
          )}>
            {asset.asset_category === "insurance" ? (
              <Shield className="w-5 h-5 text-primary" />
            ) : (
              <TrendingUp className="w-5 h-5 text-gold" />
            )}
          </div>
          <div>
            <p className="font-medium text-foreground">{getTypeLabel(asset.asset_category, asset.asset_type)}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building className="w-3 h-3" />
              <span>{asset.institution}</span>
            </div>
          </div>
        </div>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full font-medium",
          asset.status === "active" ? "bg-success/10 text-success" :
          asset.status === "lapsed" ? "bg-destructive/10 text-destructive" :
          "bg-muted text-muted-foreground"
        )}>
          {asset.status}
        </span>
      </div>

      {asset.description && (
        <p className="text-sm text-muted-foreground mb-3">{asset.description}</p>
      )}

      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <p className="text-xs text-muted-foreground">
            {asset.asset_category === "insurance" ? "Cover Amount" : "Value"}
          </p>
          <p className="font-semibold text-foreground">
            {formatCurrency(asset.amount || 0, asset.currency)}
          </p>
        </div>
        {asset.premium_or_contribution != null && asset.premium_or_contribution > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">
              {asset.asset_category === "insurance" ? "Premium" : "Contribution"}
            </p>
            <p className="font-medium text-foreground">
              {formatCurrency(asset.premium_or_contribution, asset.currency)}{" "}
              <span className="text-xs text-muted-foreground">/{getFrequencyLabel(asset.premium_frequency)}</span>
            </p>
          </div>
        )}
        {asset.policy_or_account_number && (
          <div>
            <p className="text-xs text-muted-foreground">
              {asset.asset_category === "insurance" ? "Policy No." : "Account No."}
            </p>
            <p className="font-medium text-foreground">{asset.policy_or_account_number}</p>
          </div>
        )}
        {asset.maturity_or_expiry_date && (
          <div>
            <p className="text-xs text-muted-foreground">
              {asset.asset_category === "insurance" ? "Expiry" : "Maturity"}
            </p>
            <p className="font-medium text-foreground">
              {new Date(asset.maturity_or_expiry_date).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {asset.beneficiary_names && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 p-2 bg-secondary/30 rounded-lg">
          <Users className="w-4 h-4 flex-shrink-0" />
          <span>
            <span className="font-medium text-foreground">{asset.beneficiary_names}</span>
            {asset.beneficiary_allocation && (
              <span className="ml-1">({asset.beneficiary_allocation})</span>
            )}
          </span>
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t border-border">
        <Button variant="outline" size="sm" onClick={() => onEdit(asset)}>
          <Pencil className="w-4 h-4" /> Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(asset)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderEmpty = (category: "insurance" | "investment") => (
    <div className="col-span-2 text-center py-12 bg-secondary/30 rounded-2xl">
      {category === "insurance" ? (
        <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      ) : (
        <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
      )}
      <p className="text-muted-foreground">
        No {category === "insurance" ? "insurance policies" : "investments"} registered yet
      </p>
      <Button variant="outline" className="mt-4" onClick={() => onAdd(category)}>
        <Plus className="w-4 h-4" />
        Add {category === "insurance" ? "Insurance Policy" : "Investment"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Import from Integrations banner */}
      {onImportFromIntegrations && (
        <div className="flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
          <div className="flex items-center gap-3">
            <Plug className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Auto-populate from Financial Integrations</p>
              <p className="text-xs text-muted-foreground">Import insurance & investment data from your connected accounts</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setImportDialogOpen(true)}>
            <Plug className="w-4 h-4" /> Import Accounts
          </Button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Shield className="w-6 h-6 mx-auto text-primary mb-1" />
          <p className="text-xl font-bold text-foreground">{insurances.length}</p>
          <p className="text-xs text-muted-foreground">Insurance Policies</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <BadgeDollarSign className="w-6 h-6 mx-auto text-primary mb-1" />
          <p className="text-xl font-bold text-foreground">{formatCurrency(totalInsuranceCover, "ZAR")}</p>
          <p className="text-xs text-muted-foreground">Total Cover</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto text-gold mb-1" />
          <p className="text-xl font-bold text-foreground">{investments.length}</p>
          <p className="text-xs text-muted-foreground">Investments</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <BadgeDollarSign className="w-6 h-6 mx-auto text-gold mb-1" />
          <p className="text-xl font-bold text-foreground">{formatCurrency(totalInvestmentValue, "ZAR")}</p>
          <p className="text-xs text-muted-foreground">Total Value</p>
        </div>
      </div>

      {/* Shortfall Alert Banner */}
      {assets.length > 0 && (
        <div className={cn(
          "rounded-xl border p-4",
          gaps.length > 0
            ? "border-amber-300 bg-amber-50 dark:bg-amber-950/20"
            : "border-green-300 bg-green-50 dark:bg-green-950/20"
        )}>
          <button
            className="w-full flex items-center justify-between"
            onClick={() => setShortfallExpanded(!shortfallExpanded)}
          >
            <div className="flex items-center gap-3">
              {gaps.length > 0 ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
              )}
              <div className="text-left">
                <p className={cn("text-sm font-semibold", gaps.length > 0 ? "text-amber-800 dark:text-amber-200" : "text-green-800 dark:text-green-200")}>
                  {gaps.length > 0
                    ? `${gaps.length} shortfall${gaps.length > 1 ? "s" : ""} detected against recommended benchmarks`
                    : `All ${adequateCount} areas meet recommended benchmarks`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {gaps.length > 0
                    ? `${adequateCount} of ${shortfalls.length} areas adequate · Tap to view details`
                    : "Based on illustrative South African financial planning benchmarks"}
                </p>
              </div>
            </div>
            {shortfallExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </button>

          {shortfallExpanded && (
            <div className="mt-4 space-y-2">
              {shortfalls.map((s, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg text-sm",
                    s.gap > 0 ? "bg-amber-100/50 dark:bg-amber-900/20" : "bg-green-100/50 dark:bg-green-900/20"
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {s.gap > 0 ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{s.area}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {formatCurrency(s.current, "ZAR")} of {formatCurrency(s.recommended, "ZAR")} recommended
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    {s.gap > 0 ? (
                      <div>
                        <p className="font-semibold text-amber-700 dark:text-amber-300">{formatCurrency(s.gap, "ZAR")}</p>
                        <p className="text-[10px] text-muted-foreground">shortfall</p>
                      </div>
                    ) : (
                      <p className="font-medium text-green-700 dark:text-green-300">✓ Adequate</p>
                    )}
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground pt-2 italic">
                ⚠ Illustrative benchmarks only. Contact a Certified Financial Planner (CFP®) for a personalised needs analysis.
              </p>
            </div>
          )}
        </div>
      )}

      <Tabs defaultValue="insurance">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="insurance" className="flex items-center gap-2">
            <Shield className="w-4 h-4" /> Insurance ({insurances.length})
          </TabsTrigger>
          <TabsTrigger value="investment" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Investments ({investments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insurance" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Insurance Policies</h3>
              <p className="text-sm text-muted-foreground">Register all insurance policies for traceability</p>
            </div>
            <Button onClick={() => onAdd("insurance")}>
              <Plus className="w-4 h-4" /> Add Policy
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {insurances.length > 0 ? insurances.map(renderAssetCard) : renderEmpty("insurance")}
          </div>
        </TabsContent>

        <TabsContent value="investment" className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Investments</h3>
              <p className="text-sm text-muted-foreground">Register all investments for traceability</p>
            </div>
            <Button onClick={() => onAdd("investment")}>
              <Plus className="w-4 h-4" /> Add Investment
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {investments.length > 0 ? investments.map(renderAssetCard) : renderEmpty("investment")}
          </div>
        </TabsContent>
      </Tabs>
      {onImportFromIntegrations && (
        <ImportFromIntegrationsDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          existingAssets={assets}
          onImport={onImportFromIntegrations}
        />
      )}
    </div>
  );
};

export default AssetRegistryTab;
