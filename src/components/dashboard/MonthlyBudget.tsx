import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
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
  Pencil,
  Save,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatZAR = (amount: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);

type CategoryType = "essential" | "lifestyle" | "savings";

type BudgetCategory = {
  id: string;
  name: string;
  iconKey: string;
  budgeted: number;
  spent: number;
  type: CategoryType;
};

const iconMap: Record<string, React.ElementType> = {
  Home, Car, ShoppingCart, Utensils, Zap, Wifi, GraduationCap,
  HeartPulse, Shirt, Fuel, PiggyBank, TrendingUp, CircleDollarSign,
};

const iconOptions = Object.keys(iconMap);

const defaultCategories: BudgetCategory[] = [
  { id: "1", name: "Housing & Bond", iconKey: "Home", budgeted: 18000, spent: 18000, type: "essential" },
  { id: "2", name: "Vehicle & Transport", iconKey: "Car", budgeted: 6500, spent: 5890, type: "essential" },
  { id: "3", name: "Groceries & Food", iconKey: "ShoppingCart", budgeted: 6000, spent: 5420, type: "essential" },
  { id: "4", name: "Electricity & Water", iconKey: "Zap", budgeted: 3500, spent: 3180, type: "essential" },
  { id: "5", name: "Internet & Mobile", iconKey: "Wifi", budgeted: 1800, spent: 1800, type: "essential" },
  { id: "6", name: "Medical Aid", iconKey: "HeartPulse", budgeted: 4200, spent: 4200, type: "essential" },
  { id: "7", name: "Insurance (Short-term)", iconKey: "CircleDollarSign", budgeted: 2800, spent: 2800, type: "essential" },
  { id: "8", name: "Fuel", iconKey: "Fuel", budgeted: 3000, spent: 2750, type: "essential" },
  { id: "9", name: "Dining Out", iconKey: "Utensils", budgeted: 2500, spent: 3100, type: "lifestyle" },
  { id: "10", name: "Clothing", iconKey: "Shirt", budgeted: 2000, spent: 1450, type: "lifestyle" },
  { id: "11", name: "Education & Courses", iconKey: "GraduationCap", budgeted: 1500, spent: 1500, type: "lifestyle" },
  { id: "12", name: "Emergency Fund", iconKey: "PiggyBank", budgeted: 5000, spent: 5000, type: "savings" },
  { id: "13", name: "Retirement Annuity", iconKey: "TrendingUp", budgeted: 8000, spent: 8000, type: "savings" },
  { id: "14", name: "Tax-Free Savings", iconKey: "PiggyBank", budgeted: 3000, spent: 3000, type: "savings" },
  { id: "15", name: "Holiday Fund", iconKey: "PiggyBank", budgeted: 2000, spent: 2000, type: "savings" },
  { id: "16", name: "Children's Education", iconKey: "GraduationCap", budgeted: 3500, spent: 3500, type: "savings" },
];

const typeLabels: Record<string, string> = {
  essential: "Essential Expenses",
  lifestyle: "Lifestyle & Discretionary",
  savings: "Savings & Provisions",
};

const typeColors: Record<string, string> = {
  essential: "bg-primary/10 text-primary",
  lifestyle: "bg-accent/50 text-accent-foreground",
  savings: "bg-emerald-500/10 text-emerald-600",
};

const SHORT_TERM_IDS_DEFAULT = new Set(["12", "15"]);

const MonthlyBudget = () => {
  const [activeType, setActiveType] = useState<string>("all");
  const [income, setIncome] = useState(95000);
  const [categories, setCategories] = useState<BudgetCategory[]>(defaultCategories);
  const [isEditing, setIsEditing] = useState(false);
  const [editIncome, setEditIncome] = useState(income.toString());
  const [editCategories, setEditCategories] = useState<BudgetCategory[]>(categories);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", budgeted: "", spent: "", type: "essential" as CategoryType, iconKey: "CircleDollarSign" });

  const startEditing = useCallback(() => {
    setEditIncome(income.toString());
    setEditCategories(categories.map(c => ({ ...c })));
    setIsEditing(true);
  }, [income, categories]);

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveEditing = () => {
    const parsedIncome = parseFloat(editIncome);
    if (isNaN(parsedIncome) || parsedIncome <= 0 || parsedIncome > 100_000_000) {
      toast({ title: "Invalid income", description: "Please enter a valid positive income amount.", variant: "destructive" });
      return;
    }
    // Validate all categories
    for (const cat of editCategories) {
      if (!cat.name.trim() || cat.name.length > 100) {
        toast({ title: "Invalid category", description: `Category name must be 1-100 characters.`, variant: "destructive" });
        return;
      }
      if (isNaN(cat.budgeted) || cat.budgeted < 0 || cat.budgeted > 100_000_000) {
        toast({ title: "Invalid budget", description: `"${cat.name}" has an invalid budget amount.`, variant: "destructive" });
        return;
      }
      if (isNaN(cat.spent) || cat.spent < 0 || cat.spent > 100_000_000) {
        toast({ title: "Invalid spent", description: `"${cat.name}" has an invalid spent amount.`, variant: "destructive" });
        return;
      }
    }
    setIncome(parsedIncome);
    setCategories(editCategories);
    setIsEditing(false);
    toast({ title: "Budget updated", description: "Your monthly budget has been saved." });
  };

  const updateEditCategory = (id: string, field: "budgeted" | "spent" | "name", value: string) => {
    setEditCategories(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        if (field === "name") return { ...c, name: value.slice(0, 100) };
        const num = parseFloat(value);
        return { ...c, [field]: isNaN(num) ? 0 : Math.max(0, num) };
      })
    );
  };

  const removeEditCategory = (id: string) => {
    setEditCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleAddCategory = () => {
    const budgeted = parseFloat(newCategory.budgeted);
    const spent = parseFloat(newCategory.spent);
    if (!newCategory.name.trim() || newCategory.name.length > 100) {
      toast({ title: "Invalid name", description: "Category name must be 1-100 characters.", variant: "destructive" });
      return;
    }
    if (isNaN(budgeted) || budgeted < 0) {
      toast({ title: "Invalid budget", description: "Enter a valid budget amount.", variant: "destructive" });
      return;
    }
    const newId = Date.now().toString();
    const newCat: BudgetCategory = {
      id: newId,
      name: newCategory.name.trim().slice(0, 100),
      iconKey: newCategory.iconKey,
      budgeted,
      spent: isNaN(spent) ? 0 : Math.max(0, spent),
      type: newCategory.type,
    };
    setEditCategories(prev => [...prev, newCat]);
    setNewCategory({ name: "", budgeted: "", spent: "", type: "essential", iconKey: "CircleDollarSign" });
    setAddDialogOpen(false);
    toast({ title: "Category added", description: `"${newCat.name}" has been added. Save to apply.` });
  };

  const monthlyIncome = income;
  const data = isEditing ? editCategories : categories;

  const totalBudgeted = data.reduce((s, c) => s + c.budgeted, 0);
  const totalSpent = data.reduce((s, c) => s + c.spent, 0);
  const remaining = monthlyIncome - totalSpent;
  const unallocated = monthlyIncome - totalBudgeted;

  const essentialTotal = data.filter(c => c.type === "essential").reduce((s, c) => s + c.budgeted, 0);
  const lifestyleTotal = data.filter(c => c.type === "lifestyle").reduce((s, c) => s + c.budgeted, 0);
  const savingsTotal = data.filter(c => c.type === "savings").reduce((s, c) => s + c.budgeted, 0);

  const filtered = activeType === "all" ? data : data.filter(c => c.type === activeType);
  const overBudgetCount = data.filter(c => c.spent > c.budgeted).length;

  const savingsShortTerm = data.filter(c => c.type === "savings" && SHORT_TERM_IDS_DEFAULT.has(c.id)).reduce((s, c) => s + c.budgeted, 0);
  const savingsLongTerm = data.filter(c => c.type === "savings" && !SHORT_TERM_IDS_DEFAULT.has(c.id)).reduce((s, c) => s + c.budgeted, 0);

  return (
    <div className="space-y-6">
      {/* Edit Toggle */}
      <div className="flex items-center justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" size="sm" onClick={cancelEditing} className="gap-2">
              <X className="w-4 h-4" /> Cancel
            </Button>
            <Button size="sm" onClick={saveEditing} className="gap-2">
              <Save className="w-4 h-4" /> Save Budget
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={startEditing} className="gap-2">
            <Pencil className="w-4 h-4" /> Edit Budget
          </Button>
        )}
      </div>

      {/* Income Editor */}
      {isEditing && (
        <Card className="shadow-soft border-primary/20">
          <CardContent className="p-5">
            <Label htmlFor="monthly-income" className="text-sm font-medium text-foreground">Monthly Income (ZAR)</Label>
            <Input
              id="monthly-income"
              type="number"
              min="0"
              max="100000000"
              step="100"
              value={editIncome}
              onChange={(e) => setEditIncome(e.target.value)}
              className="mt-2 max-w-xs text-lg font-display font-bold"
              placeholder="e.g. 95000"
            />
          </CardContent>
        </Card>
      )}

      {/* Summary Row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard title="Monthly Income" value={formatZAR(monthlyIncome)} icon={CircleDollarSign} accent="primary" />
        <SummaryCard
          title="Total Budgeted"
          value={formatZAR(totalBudgeted)}
          subtitle={monthlyIncome > 0 ? `${Math.round((totalBudgeted / monthlyIncome) * 100)}% of income` : undefined}
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
            {monthlyIncome > 0 && (
              <>
                <div className="bg-primary transition-all" style={{ width: `${(essentialTotal / monthlyIncome) * 100}%` }} />
                <div className="bg-accent transition-all" style={{ width: `${(lifestyleTotal / monthlyIncome) * 100}%` }} />
                <div className="bg-emerald-500 transition-all" style={{ width: `${(savingsTotal / monthlyIncome) * 100}%` }} />
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-3">
            <LegendItem color="bg-primary" label="Essential" value={monthlyIncome > 0 ? `${Math.round((essentialTotal / monthlyIncome) * 100)}%` : "0%"} />
            <LegendItem color="bg-accent" label="Lifestyle" value={monthlyIncome > 0 ? `${Math.round((lifestyleTotal / monthlyIncome) * 100)}%` : "0%"} />
            <LegendItem color="bg-emerald-500" label="Savings" value={monthlyIncome > 0 ? `${Math.round((savingsTotal / monthlyIncome) * 100)}%` : "0%"} />
            {unallocated > 0 && (
              <LegendItem color="bg-muted-foreground/30" label="Unallocated" value={monthlyIncome > 0 ? `${Math.round((unallocated / monthlyIncome) * 100)}%` : "0%"} />
            )}
          </div>
        </CardContent>
      </Card>

      {overBudgetCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm text-destructive font-medium">
            {overBudgetCount} {overBudgetCount === 1 ? "category is" : "categories are"} over budget this month.
          </p>
        </div>
      )}

      {/* Filter + Add */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-2 flex-wrap">
          {["all", "essential", "lifestyle", "savings"].map((type) => (
            <Button
              key={type}
              variant={activeType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveType(type)}
              className="capitalize"
            >
              {type === "all" ? "All Categories" : typeLabels[type]}
            </Button>
          ))}
        </div>
        {isEditing && (
          <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        )}
      </div>

      {/* Budget Items Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((category) => (
          <BudgetItemCard
            key={category.id}
            category={category}
            isEditing={isEditing}
            onUpdate={updateEditCategory}
            onRemove={removeEditCategory}
          />
        ))}
      </div>

      {/* Savings Summary */}
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
              <p className="text-xl font-display font-bold text-foreground">{formatZAR(savingsShortTerm)}</p>
              <p className="text-xs text-muted-foreground mt-1">Emergency Fund + Holiday Fund</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Long-Term Provisions</p>
              <p className="text-xl font-display font-bold text-foreground">{formatZAR(savingsLongTerm)}</p>
              <p className="text-xs text-muted-foreground mt-1">Retirement + TFSA + Education</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Total Monthly Savings Rate</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600">
                {monthlyIncome > 0 ? Math.round((savingsTotal / monthlyIncome) * 100) : 0}% of income
              </Badge>
              <span className="text-lg font-display font-bold text-foreground">{formatZAR(savingsTotal)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Budget Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Category Name</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory(p => ({ ...p, name: e.target.value.slice(0, 100) }))}
                placeholder="e.g. Gym Membership"
                maxLength={100}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Budget Amount (ZAR)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100000000"
                  value={newCategory.budgeted}
                  onChange={(e) => setNewCategory(p => ({ ...p, budgeted: e.target.value }))}
                  placeholder="e.g. 500"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Spent So Far (ZAR)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100000000"
                  value={newCategory.spent}
                  onChange={(e) => setNewCategory(p => ({ ...p, spent: e.target.value }))}
                  placeholder="e.g. 250"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={newCategory.type} onValueChange={(v) => setNewCategory(p => ({ ...p, type: v as CategoryType }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essential">Essential</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Icon</Label>
                <Select value={newCategory.iconKey} onValueChange={(v) => setNewCategory(p => ({ ...p, iconKey: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((key) => {
                      const Ic = iconMap[key];
                      return (
                        <SelectItem key={key} value={key}>
                          <span className="flex items-center gap-2"><Ic className="w-4 h-4" /> {key}</span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddCategory}>Add Category</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// --- Sub-components ---

const SummaryCard = ({
  title, value, subtitle, icon: Icon, accent,
}: {
  title: string; value: string; subtitle?: string; icon: React.ElementType; accent: string;
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

const BudgetItemCard = ({
  category, isEditing, onUpdate, onRemove,
}: {
  category: BudgetCategory;
  isEditing: boolean;
  onUpdate: (id: string, field: "budgeted" | "spent" | "name", value: string) => void;
  onRemove: (id: string) => void;
}) => {
  const Icon = iconMap[category.iconKey] || CircleDollarSign;
  const pct = category.budgeted > 0 ? Math.min(100, Math.round((category.spent / category.budgeted) * 100)) : 0;
  const isOver = category.spent > category.budgeted;
  const remaining = category.budgeted - category.spent;

  if (isEditing) {
    return (
      <Card className="shadow-soft border-primary/20">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", typeColors[category.type])}>
              <Icon className="w-4 h-4" />
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => onRemove(category.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Name</Label>
            <Input
              value={category.name}
              onChange={(e) => onUpdate(category.id, "name", e.target.value)}
              className="mt-1 h-8 text-sm"
              maxLength={100}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">Budget</Label>
              <Input
                type="number"
                min="0"
                max="100000000"
                value={category.budgeted}
                onChange={(e) => onUpdate(category.id, "budgeted", e.target.value)}
                className="mt-1 h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Spent</Label>
              <Input
                type="number"
                min="0"
                max="100000000"
                value={category.spent}
                onChange={(e) => onUpdate(category.id, "spent", e.target.value)}
                className="mt-1 h-8 text-sm"
              />
            </div>
          </div>
          <Badge variant="secondary" className="text-[10px] capitalize">{category.type}</Badge>
        </CardContent>
      </Card>
    );
  }

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
          <Progress value={pct} className={cn("h-2", isOver && "[&>div]:bg-destructive")} />
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
