import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Mock Data ---

const netWorthHistory = [
  { month: "Jul '25", assets: 2650000, liabilities: 58000, netWorth: 2592000 },
  { month: "Aug '25", assets: 2720000, liabilities: 55000, netWorth: 2665000 },
  { month: "Sep '25", assets: 2780000, liabilities: 52000, netWorth: 2728000 },
  { month: "Oct '25", assets: 2830000, liabilities: 48000, netWorth: 2782000 },
  { month: "Nov '25", assets: 2910000, liabilities: 45000, netWorth: 2865000 },
  { month: "Dec '25", assets: 2950000, liabilities: 42000, netWorth: 2908000 },
  { month: "Jan '26", assets: 3010000, liabilities: 40000, netWorth: 2970000 },
  { month: "Feb '26", assets: 3050000, liabilities: 38000, netWorth: 3012000 },
  { month: "Mar '26", assets: 3092450, liabilities: 34520, netWorth: 3057930 },
];

const spendingBreakdown = [
  { name: "Housing & Utilities", value: 18500, fill: "hsl(43, 80%, 50%)" },
  { name: "Investments & Savings", value: 15000, fill: "hsl(142, 60%, 45%)" },
  { name: "Transport", value: 8200, fill: "hsl(210, 60%, 50%)" },
  { name: "Groceries & Food", value: 7500, fill: "hsl(25, 80%, 55%)" },
  { name: "Insurance", value: 6800, fill: "hsl(270, 50%, 55%)" },
  { name: "Education", value: 4500, fill: "hsl(340, 60%, 50%)" },
  { name: "Entertainment", value: 3200, fill: "hsl(180, 50%, 45%)" },
  { name: "Other", value: 4300, fill: "hsl(0, 0%, 55%)" },
];

const incomeVsExpenses = [
  { month: "Oct '25", income: 95000, expenses: 62000 },
  { month: "Nov '25", income: 98000, expenses: 65000 },
  { month: "Dec '25", income: 105000, expenses: 78000 },
  { month: "Jan '26", income: 97000, expenses: 64000 },
  { month: "Feb '26", income: 99000, expenses: 66000 },
  { month: "Mar '26", income: 102000, expenses: 68000 },
];

// --- Chart Configs ---

const netWorthConfig: ChartConfig = {
  netWorth: { label: "Net Worth", color: "hsl(43, 80%, 50%)" },
  assets: { label: "Assets", color: "hsl(142, 60%, 45%)" },
  liabilities: { label: "Liabilities", color: "hsl(0, 72%, 51%)" },
};

const incomeExpenseConfig: ChartConfig = {
  income: { label: "Income", color: "hsl(142, 60%, 45%)" },
  expenses: { label: "Expenses", color: "hsl(0, 72%, 51%)" },
};

const spendingConfig: ChartConfig = spendingBreakdown.reduce(
  (acc, item) => ({ ...acc, [item.name]: { label: item.name, color: item.fill } }),
  {} as ChartConfig
);

const formatZAR = (v: number) => `R${(v / 1000).toFixed(0)}k`;
const formatZARFull = (v: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(v);

const FinancialCharts = () => {
  const totalSpending = spendingBreakdown.reduce((s, i) => s + i.value, 0);

  return (
    <div className="space-y-6">
      {/* Net Worth Over Time */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display">Net Worth Over Time</CardTitle>
          <p className="text-sm text-muted-foreground">9-month trend of assets, liabilities, and net worth</p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={netWorthConfig} className="h-[320px] w-full">
            <AreaChart data={netWorthHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="gradNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43, 80%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(43, 80%, 50%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradAssets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 60%, 45%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(142, 60%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(0, 0%, 45%)" }} />
              <YAxis tickFormatter={formatZAR} className="text-xs" tick={{ fill: "hsl(0, 0%, 45%)" }} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => formatZARFull(value as number)}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="assets"
                stroke="hsl(142, 60%, 45%)"
                fill="url(#gradAssets)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                stroke="hsl(43, 80%, 50%)"
                fill="url(#gradNetWorth)"
                strokeWidth={2.5}
              />
              <Area
                type="monotone"
                dataKey="liabilities"
                stroke="hsl(0, 72%, 51%)"
                fill="transparent"
                strokeWidth={1.5}
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Row: Pie + Bar */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Spending Breakdown Pie */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-display">Monthly Spending Breakdown</CardTitle>
            <p className="text-sm text-muted-foreground">
              Total: {formatZARFull(totalSpending)} — March 2026
            </p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={spendingConfig} className="h-[320px] w-full">
              <PieChart>
                <Pie
                  data={spendingBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name.split(" ")[0]} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {spendingBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatZARFull(value as number)}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Income vs Expenses Bar */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-lg font-display">Income vs Expenses</CardTitle>
            <p className="text-sm text-muted-foreground">6-month comparison of cash inflow vs outflow</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={incomeExpenseConfig} className="h-[320px] w-full">
              <BarChart data={incomeVsExpenses} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(0, 0%, 45%)" }} />
                <YAxis tickFormatter={formatZAR} className="text-xs" tick={{ fill: "hsl(0, 0%, 45%)" }} />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatZARFull(value as number)}
                    />
                  }
                />
                <Bar dataKey="income" fill="hsl(142, 60%, 45%)" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="expenses" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Savings Rate */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="text-lg font-display">Monthly Savings Rate</CardTitle>
          <p className="text-sm text-muted-foreground">Percentage of income saved each month</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-3">
            {incomeVsExpenses.map((m) => {
              const rate = Math.round(((m.income - m.expenses) / m.income) * 100);
              return (
                <div key={m.month} className="text-center space-y-2">
                  <div className="relative h-32 bg-secondary/50 rounded-lg overflow-hidden">
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-primary/80 rounded-lg transition-all"
                      style={{ height: `${rate}%` }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                      {rate}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.month.split(" ")[0]}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialCharts;
