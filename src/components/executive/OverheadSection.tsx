import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Progress } from "@/components/ui/progress";
import { overheadData, CHART_COLORS } from "@/data/executiveMockData";

const fmt = (n: number) => `R${(n / 1_000_000).toFixed(1)}M`;
const totalOverhead = overheadData.fixed + overheadData.variable;
const overheadPct = ((totalOverhead / overheadData.totalRevenue) * 100).toFixed(1);

const fixedVarData = [
  { name: "Fixed", value: overheadData.fixed },
  { name: "Variable", value: overheadData.variable },
];

const OverheadSection = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    {/* Fixed vs Variable */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Fixed vs Variable</CardTitle>
        <p className="text-xs text-muted-foreground">Total: {fmt(totalOverhead)}</p>
      </CardHeader>
      <CardContent className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={fixedVarData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={3}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              fontSize={12}
            >
              <Cell fill="hsl(200, 70%, 50%)" />
              <Cell fill="hsl(25, 75%, 55%)" />
            </Pie>
            <Tooltip formatter={(v: number) => fmt(v)} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* By Category */}
    <Card className="lg:col-span-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Costs by Category</CardTitle>
      </CardHeader>
      <CardContent className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={overheadData.categories} layout="vertical" margin={{ left: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tickFormatter={(v) => fmt(v)} fontSize={11} />
            <YAxis type="category" dataKey="name" width={90} fontSize={11} />
            <Tooltip formatter={(v: number) => fmt(v)} />
            <Bar dataKey="value" fill="hsl(340, 65%, 50%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* Overhead as % of Revenue */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Overhead vs Revenue</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center gap-6 h-[240px]">
        <div className="text-center">
          <p className="text-4xl font-bold text-foreground">{overheadPct}%</p>
          <p className="text-xs text-muted-foreground mt-1">Overhead as % of Revenue</p>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Total Revenue</span>
              <span className="font-medium">{fmt(overheadData.totalRevenue)}</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Total Overhead</span>
              <span className="font-medium">{fmt(totalOverhead)}</span>
            </div>
            <Progress value={Number(overheadPct)} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default OverheadSection;
