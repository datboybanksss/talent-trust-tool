import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Landmark,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  CreditCard,
  BarChart3,
  Target,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import FinancialCharts from "./FinancialCharts";

// Mock SA financial data
const bankAccounts = [
  { id: "1", bank: "FNB", name: "Cheque Account", number: "****4521", balance: 87450.32, type: "cheque", change: 12.5 },
  { id: "2", bank: "Nedbank", name: "Savings Account", number: "****8903", balance: 245000.0, type: "savings", change: 3.2 },
  { id: "3", bank: "Standard Bank", name: "Money Market", number: "****1267", balance: 520000.0, type: "investment", change: 8.7 },
  { id: "4", bank: "Absa", name: "Credit Card", number: "****6734", balance: -34520.0, type: "credit", change: -5.1 },
  { id: "5", bank: "Investec", name: "Private Portfolio", number: "****9901", balance: 1350000.0, type: "investment", change: 15.3 },
  { id: "6", bank: "Allan Gray", name: "Unit Trust", number: "****3312", balance: 890000.0, type: "investment", change: 11.2 },
];

const financialGoals = [
  { id: "1", name: "Emergency Fund", target: 300000, current: 245000, category: "savings", deadline: "Jun 2026", priority: "high" },
  { id: "2", name: "Home Deposit", target: 500000, current: 320000, category: "savings", deadline: "Dec 2026", priority: "high" },
  { id: "3", name: "Credit Card Payoff", target: 34520, current: 18200, category: "debt", deadline: "Sep 2026", priority: "urgent" },
  { id: "4", name: "Retirement (R5M)", target: 5000000, current: 2240000, category: "investment", deadline: "Dec 2045", priority: "medium" },
  { id: "5", name: "Children's Education", target: 1000000, current: 450000, category: "savings", deadline: "Jan 2035", priority: "medium" },
  { id: "6", name: "Vehicle Replacement", target: 450000, current: 120000, category: "savings", deadline: "Mar 2027", priority: "low" },
  { id: "7", name: "Tax-Free Savings Max", target: 36000, current: 36000, category: "investment", deadline: "Feb 2027", priority: "medium" },
  { id: "8", name: "Car Loan Payoff", target: 180000, current: 95000, category: "debt", deadline: "Nov 2027", priority: "high" },
  { id: "9", name: "Offshore Portfolio", target: 800000, current: 350000, category: "investment", deadline: "Dec 2028", priority: "medium" },
  { id: "10", name: "Business Expansion", target: 750000, current: 200000, category: "investment", deadline: "Jun 2027", priority: "high" },
  { id: "11", name: "Holiday Fund", target: 80000, current: 65000, category: "savings", deadline: "Dec 2026", priority: "low" },
  { id: "12", name: "Store Card Payoff", target: 12000, current: 10500, category: "debt", deadline: "Apr 2026", priority: "urgent" },
];

const monthlyHeatmapData = [
  { month: "Jan", savings: 85, debt: 70, investment: 60 },
  { month: "Feb", savings: 78, debt: 75, investment: 65 },
  { month: "Mar", savings: 90, debt: 80, investment: 70 },
  { month: "Apr", savings: 82, debt: 72, investment: 75 },
  { month: "May", savings: 88, debt: 85, investment: 80 },
  { month: "Jun", savings: 95, debt: 78, investment: 82 },
  { month: "Jul", savings: 70, debt: 60, investment: 85 },
  { month: "Aug", savings: 75, debt: 65, investment: 78 },
  { month: "Sep", savings: 92, debt: 88, investment: 90 },
  { month: "Oct", savings: 80, debt: 82, investment: 72 },
  { month: "Nov", savings: 85, debt: 90, investment: 88 },
  { month: "Dec", savings: 65, debt: 55, investment: 95 },
];

const formatZAR = (amount: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);

const getHeatColor = (value: number) => {
  if (value >= 90) return "bg-emerald-500/90 text-primary-foreground";
  if (value >= 75) return "bg-emerald-400/70 text-foreground";
  if (value >= 60) return "bg-gold/60 text-foreground";
  if (value >= 40) return "bg-warning/60 text-foreground";
  return "bg-destructive/50 text-foreground";
};

const getGoalStatus = (current: number, target: number) => {
  const pct = (current / target) * 100;
  if (pct >= 100) return { label: "Complete", color: "bg-emerald-500/20 text-emerald-700" };
  if (pct >= 75) return { label: "On Track", color: "bg-emerald-400/20 text-emerald-600" };
  if (pct >= 50) return { label: "In Progress", color: "bg-gold/20 text-gold-dark" };
  if (pct >= 25) return { label: "Behind", color: "bg-warning/20 text-warning" };
  return { label: "At Risk", color: "bg-destructive/20 text-destructive" };
};

const FinancialOverview = () => {
  const [lastRefresh] = useState(new Date().toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" }));

  const totalAssets = bankAccounts.filter((a) => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalLiabilities = Math.abs(bankAccounts.filter((a) => a.balance < 0).reduce((s, a) => s + a.balance, 0));
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Financial Position</h2>
          <p className="text-sm text-muted-foreground">
            Demo data • Last refreshed: {lastRefresh}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard icon={Wallet} title="Net Worth" value={formatZAR(netWorth)} change={9.4} />
        <SummaryCard icon={TrendingUp} title="Total Assets" value={formatZAR(totalAssets)} change={11.2} />
        <SummaryCard icon={CreditCard} title="Total Liabilities" value={formatZAR(totalLiabilities)} change={-5.1} negative />
        <SummaryCard icon={Target} title="Goals Progress" value="67%" subtitle="8 of 12 on track" />
      </div>

      {/* Accounts & Goals */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">
            <Landmark className="w-4 h-4 mr-2" /> Bank Accounts
          </TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="w-4 h-4 mr-2" /> Financial Goals
          </TabsTrigger>
          <TabsTrigger value="heatmap">
            <BarChart3 className="w-4 h-4 mr-2" /> Goals Heat Map
          </TabsTrigger>
          <TabsTrigger value="charts">
            <LineChart className="w-4 h-4 mr-2" /> Charts & Graphs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankAccounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <GoalsGrid />
        </TabsContent>

        <TabsContent value="heatmap">
          <HeatMap />
        </TabsContent>

        <TabsContent value="charts">
          <FinancialCharts />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// --- Sub-components ---

const SummaryCard = ({
  icon: Icon,
  title,
  value,
  change,
  negative,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  change?: number;
  negative?: boolean;
  subtitle?: string;
}) => (
  <Card className="shadow-soft">
    <CardContent className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        {change !== undefined && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              change >= 0 && !negative
                ? "bg-emerald-500/10 text-emerald-600"
                : "bg-destructive/10 text-destructive"
            )}
          >
            {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </CardContent>
  </Card>
);

const AccountCard = ({ account }: { account: (typeof bankAccounts)[0] }) => {
  const isNegative = account.balance < 0;
  return (
    <Card className="shadow-soft hover:-translate-y-1 transition-all duration-300">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="secondary" className="text-xs">{account.bank}</Badge>
          <span className="text-xs text-muted-foreground">{account.number}</span>
        </div>
        <p className="text-sm font-medium text-foreground mb-1">{account.name}</p>
        <p className={cn("text-xl font-display font-bold", isNegative ? "text-destructive" : "text-foreground")}>
          {formatZAR(account.balance)}
        </p>
        <div className="flex items-center gap-1 mt-2">
          {account.change >= 0 ? (
            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
          ) : (
            <ArrowDownRight className="w-3 h-3 text-destructive" />
          )}
          <span className={cn("text-xs font-medium", account.change >= 0 ? "text-emerald-500" : "text-destructive")}>
            {Math.abs(account.change)}% this month
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

const GoalsGrid = () => {
  const categories = ["all", "savings", "debt", "investment"] as const;
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? financialGoals : financialGoals.filter((g) => g.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(cat)}
            className="capitalize"
          >
            {cat === "all" ? "All Goals" : cat}
          </Button>
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((goal) => {
          const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
          const status = getGoalStatus(goal.current, goal.target);
          return (
            <Card key={goal.id} className="shadow-soft">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{goal.name}</p>
                    <p className="text-xs text-muted-foreground">Target: {goal.deadline}</p>
                  </div>
                  <Badge className={cn("text-xs", status.color)}>{status.label}</Badge>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>{formatZAR(goal.current)}</span>
                    <span>{formatZAR(goal.target)}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
                <p className="text-right text-xs font-semibold text-foreground">{pct}%</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const HeatMap = () => {
  const categories = ["savings", "debt", "investment"] as const;
  const categoryLabels = { savings: "Savings & Emergency", debt: "Debt Reduction", investment: "Investment Growth" };
  const categoryIcons = { savings: PiggyBank, debt: CreditCard, investment: TrendingUp };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="w-4 h-4" />
        <span>Heat map shows monthly goal achievement scores (0–100). Higher is better.</span>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Excellent (90+)", cls: "bg-emerald-500/90" },
          { label: "Good (75–89)", cls: "bg-emerald-400/70" },
          { label: "Fair (60–74)", cls: "bg-gold/60" },
          { label: "Poor (40–59)", cls: "bg-warning/60" },
          { label: "Critical (<40)", cls: "bg-destructive/50" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-2">
            <div className={cn("w-4 h-4 rounded", l.cls)} />
            <span className="text-xs text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Heat Map Grid */}
      <Card className="shadow-soft overflow-x-auto">
        <CardContent className="p-6">
          <div className="min-w-[600px]">
            {/* Month headers */}
            <div className="grid grid-cols-[140px_repeat(12,1fr)] gap-1 mb-1">
              <div />
              {monthlyHeatmapData.map((m) => (
                <div key={m.month} className="text-center text-xs font-medium text-muted-foreground py-1">
                  {m.month}
                </div>
              ))}
            </div>

            {/* Category rows */}
            {categories.map((cat) => {
              const Icon = categoryIcons[cat];
              return (
                <div key={cat} className="grid grid-cols-[140px_repeat(12,1fr)] gap-1 mb-1">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground pr-2">
                    <Icon className="w-4 h-4 text-primary" />
                    <span className="truncate">{categoryLabels[cat]}</span>
                  </div>
                  {monthlyHeatmapData.map((m) => {
                    const val = m[cat];
                    return (
                      <Tooltip key={m.month}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              "h-10 rounded-md flex items-center justify-center text-xs font-semibold cursor-default transition-all hover:scale-105",
                              getHeatColor(val)
                            )}
                          >
                            {val}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{categoryLabels[cat]} — {m.month}: {val}%</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Average scores */}
      <div className="grid sm:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const Icon = categoryIcons[cat];
          const avg = Math.round(monthlyHeatmapData.reduce((s, m) => s + m[cat], 0) / 12);
          return (
            <Card key={cat} className="shadow-soft">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{categoryLabels[cat]}</p>
                  <p className="text-2xl font-display font-bold text-foreground">{avg}%</p>
                  <p className="text-xs text-muted-foreground">12-month average</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default FinancialOverview;
