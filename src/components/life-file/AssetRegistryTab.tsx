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
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LifeFileAsset,
  INSURANCE_TYPES,
  INVESTMENT_TYPES,
  PREMIUM_FREQUENCIES,
} from "@/types/lifeFileAsset";
import ImportFromIntegrationsDialog from "./ImportFromIntegrationsDialog";
import { cn } from "@/lib/utils";
import {
  LifeFileAsset,
  INSURANCE_TYPES,
  INVESTMENT_TYPES,
  PREMIUM_FREQUENCIES,
} from "@/types/lifeFileAsset";

interface AssetRegistryTabProps {
  assets: LifeFileAsset[];
  onAdd: (category: "insurance" | "investment") => void;
  onEdit: (asset: LifeFileAsset) => void;
  onDelete: (asset: LifeFileAsset) => void;
}

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(amount);

const AssetRegistryTab = ({ assets, onAdd, onEdit, onDelete }: AssetRegistryTabProps) => {
  const insurances = assets.filter((a) => a.asset_category === "insurance");
  const investments = assets.filter((a) => a.asset_category === "investment");

  const totalInsuranceCover = insurances.reduce((s, a) => s + (a.amount || 0), 0);
  const totalInvestmentValue = investments.reduce((s, a) => s + (a.amount || 0), 0);

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
    </div>
  );
};

export default AssetRegistryTab;
