import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Car,
  ShoppingCart,
  Utensils,
  Zap,
  Wifi,
  GraduationCap,
  HeartPulse,
  Shirt,
  Fuel,
  PiggyBank,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const formatZAR = (amount: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);

type BudgetCategory = {
  id: string;
  name: string;
  icon: React.ElementType;
  budgeted: number;
  spent: number;
  type: "essential" | "lifestyle" | "savings";
};

const budgetCategories: BudgetCategory[] = [
  // Essential expenses
  { id: "1", name: "Housing & Bond", icon: Home, budgeted: 18000, spent: 18000, type: "essential" },
  { id: "2", name: "Vehicle & Transport", icon: Car, budgeted: 6500, spent: 5890, type: "essential" },
  { id: "3", name: "Groceries & Food", icon: ShoppingCart, budgeted: 6000, spent: 5420, type: "essential" },
  { id: "4", name: "Electricity & Water", icon: Zap, budgeted: 3500, spent: 3180, type: "essential" },
  { id: "5", name: "Internet & Mobile", icon: Wifi, budgeted: 1800, spent: 1800, type: "essential" },
  { id: "6", name: "Medical Aid", icon: HeartPulse, budgeted: 4200, spent: 4200, type: "essential" },
  { id: "7", name: "Insurance (Short-term)", icon: CircleDollarSign, budgeted: 2800, spent: 2800, type: "essential" },
  { id: "8", name: "Fuel", icon: Fuel, budgeted: 3000, spent: 2750, type: "essential" },
  // Lifestyle
  { id: "9", name: "Dining Out", icon: Utensils, budgeted: 2500, spent: 3100, type: "lifestyle" },
  { id: "10", name: "Clothing", icon: Shirt, budgeted: 2000, spent: 1450, type: "lifestyle" },
  { id: "11", name: "Education & Courses", icon: GraduationCap, budgeted: 1500, spent: 1500, type: "lifestyle" },
  // Savings & Provisions
  { id: "12", name: "Emergency Fund", icon: PiggyBank, budgeted: 5000, spent: 5000, type: "savings" },
  { id: "13", name: "Retirement Annuity", icon: TrendingUp, budgeted: 8000, spent: 8000, type: "savings" },
  { id: "14", name: "Tax-Free Savings", icon: PiggyBank, budgeted: 3000, spent: 3000, type: "savings" },
  { id: "15", name: "Holiday Fund", icon: PiggyBank, budgeted: 2000, spent: 2000, type: "savings" },
  { id: "16", name: "Children's Education", icon: GraduationCap, budgeted: 3500, spent: 3500, type: "savings" },
];

const monthlyIncome = 95000;

const typeLabels = {
  essential: "Essential Expenses",
  lifestyle: "Lifestyle & Discretionary",
  savings: "Savings & Provisions",
};

const typeColors = {
  essential: "bg-primary/10 text-primary",
  lifestyle: "bg-accent/50 text-accent-foreground",
  savings: "bg-emerald-500/10 text-emerald-600",
};

const MonthlyBudget = () => {
  const [activeType, setActiveType] = useState<string>("all");

  const totalBudgeted = budgetCategories.reduce((s, c) => s + c.budgeted, 0);
  const totalSpent = budgetCategories.reduce((s, c) => s + c.spent, 0);
  const remaining = monthlyIncome - totalSpent;
  const unallocated = monthlyIncome - totalBudgeted;

  const essentialTotal = budgetCategories.filter(c => c.type === "essential").reduce((s, c) => s + c.budgeted, 0);
  const lifestyleTotal = budgetCategories.filter(c => c.type === "lifestyle").reduce((s, c) => s + c.budgeted, 0);
  const savingsTotal = budgetCategories.filter(c => c.type === "savings").reduce((s, c) => s + c.budgeted, 0);

  const filtered = activeType === "all" ? budgetCategories : budgetCategories.filter(c => c.type === activeType);

  const overBudgetCount = budgetCategories.filter(c => c.spent > c.budgeted).length;

  return (
    <div className="space-y-6">
      {/* Summary Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Monthly Income"
          value={formatZAR(monthlyIncome)}
          icon={CircleDollarSign}
          accent="primary"
        />
        <SummaryCard
          title="Total Budgeted"
          value={formatZAR(totalBudgeted)}
          subtitle={`${Math.round((totalBudgeted / monthlyIncome) * 100)}% of income`}
          icon={CircleDollarSign}
          accent="primary"
        />
        <SummaryCard
          title="Total Spent"
          value={formatZAR(totalSpent)}
          subtitle={totalSpent > totalBudgeted ? "Over budget!" : "Within budget"}
          icon={totalSpent > totalBudgeted ? AlertTriangle : CheckCircle2}
          accent={totalSpent > totalBudgeted ? "destructive" : "emerald"}
        />
        <SummaryCard
          title="Remaining"
          value={formatZAR(remaining)}
          subtitle={unallocated > 0 ? `${formatZAR(unallocated)} unallocated` : "Fully allocated"}
          icon={PiggyBank}
          accent="emerald"
        />
      </div>

      {/* Budget Allocation Bar */}
      <Card className="shadow-soft">
        <CardContent className="p-5">
          <p className="text-sm font-medium text-foreground mb-3">Budget Allocation Breakdown</p>
          <div className="flex h-6 rounded-full overflow-hidden bg-muted">
            <div
              className="bg-primary transition-all"
              style={{ width: `${(essentialTotal / monthlyIncome) * 100}%` }}
              title={`Essential: ${Math.round((essentialTotal / monthlyIncome) * 100)}%`}
            />
            <div
              className="bg-accent transition-all"
              style={{ width: `${(lifestyleTotal / monthlyIncome) * 100}%` }}
              title={`Lifestyle: ${Math.round((lifestyleTotal / monthlyIncome) * 100)}%`}
            />
            <div
              className="bg-emerald-500 transition-all"
              style={{ width: `${(savingsTotal / monthlyIncome) * 100}%` }}
              title={`Savings: ${Math.round((savingsTotal / monthlyIncome) * 100)}%`}
            />
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            <LegendItem color="bg-primary" label="Essential" value={`${Math.round((essentialTotal / monthlyIncome) * 100)}%`} />
            <LegendItem color="bg-accent" label="Lifestyle" value={`${Math.round((lifestyleTotal / monthlyIncome) * 100)}%`} />
            <LegendItem color="bg-emerald-500" label="Savings" value={`${Math.round((savingsTotal / monthlyIncome) * 100)}%`} />
            {unallocated > 0 && (
              <LegendItem color="bg-muted-foreground/30" label="Unallocated" value={`${Math.round((unallocated / monthlyIncome) * 100)}%`} />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert if over budget */}
      {overBudgetCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive font-medium">
            {overBudgetCount} {overBudgetCount === 1 ? "category is" : "categories are"} over budget this month.
          </p>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "essential", "lifestyle", "savings"].map((type) => (
          <Button
            key={type}
            variant={activeType === type ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveType(type)}
            className="capitalize"
          >
            {type === "all" ? "All Categories" : typeLabels[type as keyof typeof typeLabels]}
          </Button>
        ))}
      </div>

      {/* Budget Items Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((category) => (
          <BudgetItemCard key={category.id} category={category} />
        ))}
      </div>

      {/* Savings Provision Summary */}
      <Card className="shadow-soft border-emerald-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-emerald-600" />
            Savings & Provisions Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Short-Term Savings</p>
              <p className="text-xl font-display font-bold text-foreground">
                {formatZAR(budgetCategories.filter(c => c.type === "savings" && ["12", "15"].includes(c.id)).reduce((s, c) => s + c.budgeted, 0))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Emergency Fund + Holiday Fund</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Long-Term Provisions</p>
              <p className="text-xl font-display font-bold text-foreground">
                {formatZAR(budgetCategories.filter(c => c.type === "savings" && ["13", "14", "16"].includes(c.id)).reduce((s, c) => s + c.budgeted, 0))}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Retirement + TFSA + Education</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Total Monthly Savings Rate</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                {Math.round((savingsTotal / monthlyIncome) * 100)}% of income
              </Badge>
              <span className="text-lg font-display font-bold text-foreground">{formatZAR(savingsTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  accent: string;
}) => {
  const accentClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    destructive: "bg-destructive/10 text-destructive",
    emerald: "bg-emerald-500/10 text-emerald-600",
  };

  return (
    <Card className="shadow-soft">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", accentClasses[accent] || accentClasses.primary)}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-display font-bold text-foreground">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

const BudgetItemCard = ({ category }: { category: BudgetCategory }) => {
  const Icon = category.icon;
  const pct = Math.min(100, Math.round((category.spent / category.budgeted) * 100));
  const isOver = category.spent > category.budgeted;
  const remaining = category.budgeted - category.spent;

  return (
    <Card className={cn("shadow-soft hover:-translate-y-1 transition-all duration-300", isOver && "border-destructive/30")}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", typeColors[category.type])}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{category.name}</p>
              <Badge variant="secondary" className="text-[10px] capitalize mt-0.5">{category.type}</Badge>
            </div>
          </div>
          {isOver ? (
            <ArrowUpRight className="w-4 h-4 text-destructive" />
          ) : pct === 100 ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          ) : null}
        </div>

        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Spent: {formatZAR(category.spent)}</span>
            <span>Budget: {formatZAR(category.budgeted)}</span>
          </div>
          <Progress
            value={pct}
            className={cn("h-2", isOver && "[&>div]:bg-destructive")}
          />
        </div>

        <div className="flex justify-between items-center">
          <span className={cn("text-xs font-semibold", isOver ? "text-destructive" : "text-emerald-600")}>
            {isOver ? `Over by ${formatZAR(Math.abs(remaining))}` : remaining === 0 ? "Fully spent" : `${formatZAR(remaining)} left`}
          </span>
          <span className="text-xs font-semibold text-foreground">{pct}%</span>
        </div>
      </CardContent>
    </Card>
  );
};

const LegendItem = ({ color, label, value }: { color: string; label: string; value: string }) => (
  <div className="flex items-center gap-2">
    <div className={cn("w-3 h-3 rounded-sm", color)} />
    <span className="text-xs text-muted-foreground">{label}: <span className="font-medium text-foreground">{value}</span></span>
  </div>
);

export default MonthlyBudget;
