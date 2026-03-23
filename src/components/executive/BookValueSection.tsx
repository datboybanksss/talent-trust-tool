import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { CHART_COLORS } from "@/data/executiveMockData";
import { getFilteredClientTypeValues, getFilteredRevenueStreams, ExecutiveFilters } from "@/utils/executiveFilters";

const fmt = (n: number) => `R${(n / 1_000_000).toFixed(1)}M`;

interface BookValueSectionProps {
  onSegmentClick?: (category: string, segment: string) => void;
  filters: ExecutiveFilters;
}

const BookValueSection = ({ onSegmentClick, filters }: BookValueSectionProps) => {
  const clientData = useMemo(() => getFilteredClientTypeValues(filters), [filters]);
  const streamData = useMemo(() => getFilteredRevenueStreams(filters), [filters]);
  const totalPortfolio = useMemo(() => clientData.reduce((s, c) => s + c.value, 0), [clientData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Book Value by Client Type</CardTitle>
          <p className="text-xs text-muted-foreground">Total portfolio: {fmt(totalPortfolio)} • Click a segment to drill down</p>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={clientData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={95}
                paddingAngle={2}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={11}
                className="cursor-pointer"
                onClick={(data) => onSegmentClick?.("Client Type", data.name)}
              >
                {clientData.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} className="cursor-pointer hover:opacity-80 transition-opacity" />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Value by Revenue Stream</CardTitle>
          <p className="text-xs text-muted-foreground">Click a bar to drill down</p>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={streamData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tickFormatter={(v) => fmt(v)} fontSize={11} />
              <YAxis type="category" dataKey="name" width={110} fontSize={11} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Bar
                dataKey="value"
                fill="hsl(43, 80%, 50%)"
                radius={[0, 4, 4, 0]}
                className="cursor-pointer"
                onClick={(data) => onSegmentClick?.("Revenue Stream", data.name)}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookValueSection;
