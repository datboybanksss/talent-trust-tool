import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Landmark, TrendingUp, Bitcoin, ShieldCheck, RefreshCw, Plus, Unplug, AlertCircle,
  CheckCircle2, Loader2, XCircle, Clock, Wifi, WifiOff, ArrowUpRight, ArrowDownRight, Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  mockConnectedAccounts,
  AVAILABLE_PROVIDERS,
  formatTimeAgo,
  isFresh,
  type IntegrationCategory,
  type IntegrationStatus,
  type FinancialIntegration,
} from "@/data/mockIntegrationData";

const CATEGORY_META: Record<IntegrationCategory, { label: string; icon: React.ElementType; color: string }> = {
  banking: { label: "Banking", icon: Landmark, color: "text-blue-500" },
  investments: { label: "Investments", icon: TrendingUp, color: "text-emerald-500" },
  crypto: { label: "Crypto Wallets", icon: Bitcoin, color: "text-amber-500" },
  insurance: { label: "Insurance", icon: ShieldCheck, color: "text-violet-500" },
};

const STATUS_CONFIG: Record<IntegrationStatus, { label: string; icon: React.ElementType; cls: string }> = {
  connected: { label: "Connected", icon: CheckCircle2, cls: "bg-emerald-500/10 text-emerald-600" },
  syncing: { label: "Syncing…", icon: Loader2, cls: "bg-blue-500/10 text-blue-600" },
  error: { label: "Error", icon: XCircle, cls: "bg-destructive/10 text-destructive" },
  disconnected: { label: "Disconnected", icon: WifiOff, cls: "bg-muted text-muted-foreground" },
};

const formatZAR = (amount: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);

const FinancialIntegrations = () => {
  const [accounts, setAccounts] = useState<FinancialIntegration[]>(mockConnectedAccounts);
  const [connectDialogOpen, setConnectDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory | null>(null);

  const categories: IntegrationCategory[] = ["banking", "investments", "crypto", "insurance"];

  const totalByCategory = (cat: IntegrationCategory) =>
    accounts.filter((a) => a.category === cat && a.balance && a.balance > 0).reduce((s, a) => s + (a.balance ?? 0), 0);

  const connectedCount = accounts.filter((a) => a.status === "connected" || a.status === "syncing").length;
  const errorCount = accounts.filter((a) => a.status === "error").length;
  const freshCount = accounts.filter((a) => isFresh(a.lastSynced)).length;

  const handleRefreshAll = () => {
    toast.success("Refreshing all connected accounts…", { description: "Demo — data will update shortly." });
  };

  const handleDisconnect = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    toast.info("Account disconnected.");
  };

  const handleReconnect = (id: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "syncing" as IntegrationStatus, lastSynced: new Date().toISOString() } : a))
    );
    toast.success("Re-authenticating…");
    setTimeout(() => {
      setAccounts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "connected" as IntegrationStatus } : a))
      );
    }, 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Financial Integrations</h1>
            <p className="text-sm text-muted-foreground">
              Connect your banking, investment, crypto & insurance accounts for a unified view. Data refreshed every 3 hours.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={handleRefreshAll}>
              <RefreshCw className="w-4 h-4" /> Refresh All
            </Button>
            <Button size="sm" className="gap-2" onClick={() => { setSelectedCategory(null); setConnectDialogOpen(true); }}>
              <Plus className="w-4 h-4" /> Connect Account
            </Button>
          </div>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SummaryCard label="Connected" value={connectedCount.toString()} sub={`${errorCount} error${errorCount !== 1 ? "s" : ""}`} icon={Wifi} />
          <SummaryCard label="Fresh Data" value={`${freshCount}/${accounts.length}`} sub="within 3 hrs" icon={Clock} />
          <SummaryCard label="Total Assets" value={formatZAR(totalByCategory("banking") + totalByCategory("investments") + totalByCategory("crypto"))} icon={ArrowUpRight} positive />
          <SummaryCard label="Insurance Cover" value={formatZAR(totalByCategory("insurance"))} icon={ShieldCheck} />
        </div>

        {/* Freshness notice */}
        {errorCount > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorCount} account{errorCount > 1 ? "s" : ""} need{errorCount === 1 ? "s" : ""} re-authentication. Data may be stale.</span>
          </div>
        )}

        {/* Tabs by category */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({accounts.length})</TabsTrigger>
            {categories.map((cat) => {
              const meta = CATEGORY_META[cat];
              const count = accounts.filter((a) => a.category === cat).length;
              return (
                <TabsTrigger key={cat} value={cat} className="gap-1.5">
                  <meta.icon className="w-4 h-4" /> {meta.label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          {["all", ...categories].map((tab) => (
            <TabsContent key={tab} value={tab}>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accounts
                  .filter((a) => tab === "all" || a.category === tab)
                  .map((account) => (
                    <AccountCard
                      key={account.id}
                      account={account}
                      onDisconnect={handleDisconnect}
                      onReconnect={handleReconnect}
                    />
                  ))}

                {/* Add account card */}
                <Card
                  className="border-dashed border-2 border-muted-foreground/20 hover:border-primary/40 cursor-pointer transition-colors flex items-center justify-center min-h-[180px]"
                  onClick={() => {
                    setSelectedCategory(tab === "all" ? null : (tab as IntegrationCategory));
                    setConnectDialogOpen(true);
                  }}
                >
                  <CardContent className="flex flex-col items-center gap-2 py-8">
                    <Plus className="w-8 h-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground font-medium">Connect New Account</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Data notice */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground p-3 rounded-lg bg-muted/50">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Demo Mode:</strong> All data shown is illustrative. In production, accounts are connected via secure Open Banking (PSD2/POPIA-compliant) APIs,
            OAuth tokens, or read-only API keys. Data is encrypted at rest (AES-256) and refreshed every 3 hours. No transaction or login credentials are stored.
          </p>
        </div>
      </div>

      {/* Connect dialog */}
      <ConnectProviderDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        category={selectedCategory}
        onConnect={(provider) => {
          const prov = AVAILABLE_PROVIDERS.find((p) => p.id === provider);
          if (!prov) return;
          const newAccount: FinancialIntegration = {
            id: crypto.randomUUID(),
            provider: prov.id,
            logo: prov.logo,
            category: prov.category,
            status: "syncing",
            lastSynced: new Date().toISOString(),
            accountName: `${prov.name} Account`,
            balance: null,
            currency: "ZAR",
            details: {},
          };
          setAccounts((prev) => [...prev, newAccount]);
          toast.success(`Connecting to ${prov.name}…`);
          setTimeout(() => {
            setAccounts((prev) =>
              prev.map((a) => (a.id === newAccount.id ? { ...a, status: "connected", balance: Math.round(Math.random() * 500000) } : a))
            );
            toast.success(`${prov.name} connected successfully!`);
          }, 2500);
        }}
      />
    </DashboardLayout>
  );
};

/* ---- Sub-components ---- */

const SummaryCard = ({ label, value, sub, icon: Icon, positive }: { label: string; value: string; sub?: string; icon: React.ElementType; positive?: boolean }) => (
  <Card className="shadow-soft">
    <CardContent className="p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-lg font-display font-bold text-foreground truncate">{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </CardContent>
  </Card>
);

const AccountCard = ({
  account,
  onDisconnect,
  onReconnect,
}: {
  account: FinancialIntegration;
  onDisconnect: (id: string) => void;
  onReconnect: (id: string) => void;
}) => {
  const status = STATUS_CONFIG[account.status];
  const StatusIcon = status.icon;
  const catMeta = CATEGORY_META[account.category];
  const CatIcon = catMeta.icon;
  const fresh = isFresh(account.lastSynced);

  return (
    <Card className="shadow-soft hover:-translate-y-0.5 transition-all duration-300">
      <CardContent className="p-5 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{account.logo}</span>
            <div>
              <p className="text-sm font-medium text-foreground">{account.accountName}</p>
              <p className="text-xs text-muted-foreground capitalize">{catMeta.label}</p>
            </div>
          </div>
          <Badge className={cn("text-xs gap-1", status.cls)}>
            <StatusIcon className={cn("w-3 h-3", account.status === "syncing" && "animate-spin")} />
            {status.label}
          </Badge>
        </div>

        {/* Balance */}
        {account.balance !== null && (
          <p className={cn("text-xl font-display font-bold", account.balance < 0 ? "text-destructive" : "text-foreground")}>
            {formatZAR(account.balance)}
          </p>
        )}

        {/* Details chips */}
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(account.details)
            .filter(([k]) => k !== "error")
            .slice(0, 3)
            .map(([k, v]) => (
              <span key={k} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
                {String(v)}
              </span>
            ))}
        </div>

        {/* Freshness + actions */}
        <div className="flex items-center justify-between pt-1 border-t border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={cn("text-xs flex items-center gap-1", fresh ? "text-emerald-600" : "text-warning")}>
                <Clock className="w-3 h-3" />
                {account.lastSynced ? formatTimeAgo(account.lastSynced) : "Never"}
              </span>
            </TooltipTrigger>
            <TooltipContent>{fresh ? "Data is fresh (< 3 hrs)" : "Data may be stale (> 3 hrs)"}</TooltipContent>
          </Tooltip>

          <div className="flex gap-1">
            {account.status === "error" && (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-primary" onClick={() => onReconnect(account.id)}>
                <RefreshCw className="w-3 h-3" /> Reconnect
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => onDisconnect(account.id)}>
              <Unplug className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Error message */}
        {account.status === "error" && account.details.error && (
          <p className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {String(account.details.error)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const ConnectProviderDialog = ({
  open,
  onOpenChange,
  category,
  onConnect,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category: IntegrationCategory | null;
  onConnect: (providerId: string) => void;
}) => {
  const [step, setStep] = useState<"select" | "auth">("select");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [authValue, setAuthValue] = useState("");

  const providers = category ? AVAILABLE_PROVIDERS.filter((p) => p.category === category) : AVAILABLE_PROVIDERS;

  const handleClose = () => {
    setStep("select");
    setSelectedProvider(null);
    setAuthValue("");
    onOpenChange(false);
  };

  const prov = AVAILABLE_PROVIDERS.find((p) => p.id === selectedProvider);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        {step === "select" ? (
          <>
            <DialogHeader>
              <DialogTitle>Connect a Financial Account</DialogTitle>
              <DialogDescription>Choose a provider to link. Your credentials are encrypted and never stored in plain text.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              {(["banking", "investments", "crypto", "insurance"] as IntegrationCategory[])
                .filter((cat) => !category || cat === category)
                .map((cat) => {
                  const meta = CATEGORY_META[cat];
                  const catProviders = providers.filter((p) => p.category === cat);
                  if (catProviders.length === 0) return null;
                  return (
                    <div key={cat}>
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <meta.icon className={cn("w-4 h-4", meta.color)} /> {meta.label}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {catProviders.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => { setSelectedProvider(p.id); setStep("auth"); }}
                            className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
                          >
                            <span className="text-lg">{p.logo}</span>
                            <div>
                              <p className="text-sm font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1">{p.description}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-lg">{prov?.logo}</span> Connect {prov?.name}
              </DialogTitle>
              <DialogDescription>
                Enter your read-only credentials. We use OAuth / secure token exchange where available.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <div>
                <Label>{prov?.fields[0] || "Identifier"}</Label>
                <Input
                  value={authValue}
                  onChange={(e) => setAuthValue(e.target.value)}
                  placeholder={`Enter your ${prov?.fields[0]?.toLowerCase() || "identifier"}`}
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground space-y-1">
                <p className="font-medium text-foreground">🔒 Security Notice</p>
                <p>• Read-only access — no transactions can be initiated</p>
                <p>• AES-256 encryption at rest</p>
                <p>• POPIA & GDPR compliant</p>
                <p>• You can disconnect at any time</p>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setStep("select")}>Back</Button>
              <Button
                disabled={!authValue.trim()}
                onClick={() => {
                  onConnect(selectedProvider!);
                  handleClose();
                }}
              >
                Connect Account
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FinancialIntegrations;
