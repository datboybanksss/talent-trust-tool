import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plug, ArrowRight, CheckCircle2, AlertCircle, Clock, Shield, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockConnectedAccounts, formatTimeAgo, isFresh, AVAILABLE_PROVIDERS, type FinancialIntegration } from "@/data/mockIntegrationData";
import { LifeFileAsset } from "@/types/lifeFileAsset";

/** Maps integration provider IDs → life file asset_type values */
const PROVIDER_TO_ASSET_MAP: Record<string, { category: "insurance" | "investment"; assetType: string; typeLabel: string }> = {
  // Insurance providers
  discovery: { category: "insurance", assetType: "life", typeLabel: "Life Insurance" },
  sanlam: { category: "insurance", assetType: "funeral", typeLabel: "Funeral Cover" },
  old_mutual: { category: "insurance", assetType: "life", typeLabel: "Life Insurance" },
  liberty: { category: "insurance", assetType: "life", typeLabel: "Life Insurance" },
  momentum: { category: "insurance", assetType: "life", typeLabel: "Life Insurance" },
  hollard: { category: "insurance", assetType: "short_term", typeLabel: "Short-Term Insurance" },
  // Investment providers
  easyequities: { category: "investment", assetType: "share_portfolio", typeLabel: "Share Portfolio" },
  allan_gray: { category: "investment", assetType: "unit_trust", typeLabel: "Unit Trust / Collective Investment" },
  coronation: { category: "investment", assetType: "unit_trust", typeLabel: "Unit Trust / Collective Investment" },
  sanlam_invest: { category: "investment", assetType: "unit_trust", typeLabel: "Unit Trust / Collective Investment" },
  ninety_one: { category: "investment", assetType: "unit_trust", typeLabel: "Unit Trust / Collective Investment" },
  satrix: { category: "investment", assetType: "unit_trust", typeLabel: "Unit Trust / Collective Investment" },
  // Crypto
  luno: { category: "investment", assetType: "crypto", typeLabel: "Cryptocurrency" },
  valr: { category: "investment", assetType: "crypto", typeLabel: "Cryptocurrency" },
  altcointrader: { category: "investment", assetType: "crypto", typeLabel: "Cryptocurrency" },
};

export interface ImportableAccount {
  integration: FinancialIntegration;
  mapping: { category: "insurance" | "investment"; assetType: string; typeLabel: string };
  alreadyImported: boolean;
}

const getImportableAccounts = (existingAssets: LifeFileAsset[]): ImportableAccount[] => {
  const connected = mockConnectedAccounts.filter(
    (a) => (a.status === "connected" || a.status === "syncing") && PROVIDER_TO_ASSET_MAP[a.provider]
  );

  return connected.map((integration) => {
    const mapping = PROVIDER_TO_ASSET_MAP[integration.provider];
    const alreadyImported = existingAssets.some(
      (asset) =>
        asset.institution.toLowerCase().includes(integration.accountName?.split(" ")[0]?.toLowerCase() || "") &&
        asset.asset_category === mapping.category
    );
    return { integration, mapping, alreadyImported };
  });
};

const formatZAR = (amount: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);

interface ImportFromIntegrationsDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  existingAssets: LifeFileAsset[];
  onImport: (assets: Omit<LifeFileAsset, "id" | "created_at" | "updated_at">[]) => void;
}

const ImportFromIntegrationsDialog = ({ open, onOpenChange, existingAssets, onImport }: ImportFromIntegrationsDialogProps) => {
  const importable = getImportableAccounts(existingAssets);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    const available = importable.filter((a) => !a.alreadyImported).map((a) => a.integration.id);
    setSelected(new Set(available));
  };

  const handleImport = () => {
    const toImport = importable
      .filter((a) => selected.has(a.integration.id))
      .map((item) => {
        const { integration, mapping } = item;
        const providerInfo = AVAILABLE_PROVIDERS.find((p) => p.id === integration.provider);
        const premium = integration.details.premium
          ? parseFloat(String(integration.details.premium).replace(/[^\d.]/g, ""))
          : null;

        return {
          user_id: "", // will be set by caller
          asset_category: mapping.category as "insurance" | "investment",
          asset_type: mapping.assetType,
          institution: providerInfo?.name || integration.provider,
          policy_or_account_number: String(integration.details.policyNumber || integration.details.accountNumber || integration.details.investorNumber || ""),
          description: `Auto-imported from ${providerInfo?.name || integration.provider} integration. ${integration.details.coverType || integration.details.fundType || ""}`.trim(),
          amount: Math.abs(integration.balance || 0),
          currency: integration.currency,
          premium_or_contribution: premium,
          premium_frequency: premium ? "monthly" : null,
          beneficiary_names: null,
          beneficiary_allocation: null,
          start_date: null,
          maturity_or_expiry_date: null,
          status: "active",
          notes: `Synced from Financial Integrations on ${new Date().toLocaleDateString("en-ZA")}. Last data refresh: ${integration.lastSynced ? formatTimeAgo(integration.lastSynced) : "unknown"}.`,
          file_url: null,
          file_name: null,
        };
      });

    onImport(toImport);
    setSelected(new Set());
    onOpenChange(false);
  };

  const newCount = importable.filter((a) => !a.alreadyImported).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plug className="w-5 h-5 text-primary" /> Import from Financial Integrations
          </DialogTitle>
          <DialogDescription>
            Auto-populate your Asset Registry with data from connected accounts. {newCount} new account{newCount !== 1 ? "s" : ""} available to import.
          </DialogDescription>
        </DialogHeader>

        {importable.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Plug className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No connected insurance or investment accounts found.</p>
            <p className="text-xs mt-1">Connect accounts in Financial Integrations first.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{selected.size} selected</p>
              <Button variant="ghost" size="sm" className="text-xs" onClick={selectAll}>
                Select all new
              </Button>
            </div>

            <ScrollArea className="max-h-[340px]">
              <div className="space-y-2">
                {importable.map(({ integration, mapping, alreadyImported }) => (
                  <label
                    key={integration.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                      alreadyImported
                        ? "border-border bg-muted/30 opacity-60 cursor-default"
                        : selected.has(integration.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <Checkbox
                      checked={alreadyImported || selected.has(integration.id)}
                      disabled={alreadyImported}
                      onCheckedChange={() => !alreadyImported && toggleSelect(integration.id)}
                    />
                    <span className="text-lg">{integration.logo}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{integration.accountName}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ArrowRight className="w-3 h-3" />
                        <span className="flex items-center gap-1">
                          {mapping.category === "insurance" ? <Shield className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                          {mapping.typeLabel}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">
                        {integration.balance ? formatZAR(Math.abs(integration.balance)) : "—"}
                      </p>
                      {alreadyImported ? (
                        <Badge variant="secondary" className="text-xs gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Imported
                        </Badge>
                      ) : (
                        <span className={cn("text-xs flex items-center gap-1 justify-end", isFresh(integration.lastSynced) ? "text-emerald-600" : "text-warning")}>
                          <Clock className="w-3 h-3" />
                          {integration.lastSynced ? formatTimeAgo(integration.lastSynced) : "—"}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={selected.size === 0} onClick={handleImport} className="gap-2">
            <Plug className="w-4 h-4" /> Import {selected.size} Account{selected.size !== 1 ? "s" : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportFromIntegrationsDialog;
