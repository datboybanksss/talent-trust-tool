import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Progress } from "@/components/ui/progress";
import { CHART_COLORS } from "@/data/executiveMockData";
import { getFilteredOverheadData, ExecutiveFilters } from "@/utils/executiveFilters";

const fmt = (n: number) => `R${(n / 1_000_000).toFixed(1)}M`;

interface OverheadSectionProps {
  onSegmentClick?: (category: string, segment: string) => void;
  filters: ExecutiveFilters;
}

const OverheadSection = ({ onSegmentClick, filters }: OverheadSectionProps) => {
  const data = useMemo(() => getFilteredOverheadData(filters), [filters]);
  const totalOverhead = data.fixed + data.variable;
  const overheadPct = ((totalOverhead / data.totalRevenue) * 100).toFixed(1);

  const fixedVarData = [
    { name: "Fixed", value: data.fixed },
    { name: "Variable", value: data.variable },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Fixed vs Variable</CardTitle>
          <p className="text-xs text-muted-foreground">Total: {fmt(totalOverhead)} • Click to drill down</p>
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
                className="cursor-pointer"
                onClick={(d) => onSegmentClick?.("Fixed vs Variable", d.name)}
              >
                <Cell fill="hsl(200, 70%, 50%)" className="cursor-pointer hover:opacity-80 transition-opacity" />
                <Cell fill="hsl(25, 75%, 55%)" className="cursor-pointer hover:opacity-80 transition-opacity" />
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Costs by Category</CardTitle>
          <p className="text-xs text-muted-foreground">Click a bar to drill down</p>
        </CardHeader>
        <CardContent className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.categories} layout="vertical" margin={{ left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tickFormatter={(v) => fmt(v)} fontSize={11} />
              <YAxis type="category" dataKey="name" width={90} fontSize={11} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar
                dataKey="value"
                fill="hsl(340, 65%, 50%)"
                radius={[0, 4, 4, 0]}
                className="cursor-pointer"
                onClick={(d) => onSegmentClick?.("Cost Category", d.name)}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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
                <span className="font-medium">{fmt(data.totalRevenue)}</span>
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
};

export default OverheadSection;
