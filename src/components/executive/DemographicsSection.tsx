import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Accessibility } from "lucide-react";
import { CHART_COLORS } from "@/data/executiveMockData";
import { getFilteredDemographics, ExecutiveFilters } from "@/utils/executiveFilters";

interface DemographicsSectionProps {
  onSegmentClick?: (category: string, segment: string) => void;
  filters: ExecutiveFilters;
}

const MiniPie = ({
  data,
  title,
  category,
  onSegmentClick,
}: {
  data: { name: string; value: number }[];
  title: string;
  category: string;
  onSegmentClick?: (category: string, segment: string) => void;
}) => (
  <Card>
    <CardHeader className="pb-1">
      <CardTitle className="text-sm">{title}</CardTitle>
      <p className="text-[10px] text-muted-foreground">Click to drill down</p>
    </CardHeader>
    <CardContent className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={65}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
            fontSize={10}
            className="cursor-pointer"
            onClick={(d) => onSegmentClick?.(category, d.name)}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} className="cursor-pointer hover:opacity-80 transition-opacity" />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const DemographicsSection = ({ onSegmentClick, filters }: DemographicsSectionProps) => {
  const demo = useMemo(() => getFilteredDemographics(filters), [filters]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MiniPie data={demo.clientType} title="Client Type" category="Client Type" onSegmentClick={onSegmentClick} />
        <MiniPie data={demo.gender} title="Gender Split" category="Gender" onSegmentClick={onSegmentClick} />
        <MiniPie data={demo.geography} title="Geography" category="Geography" onSegmentClick={onSegmentClick} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Industry Breakdown</CardTitle>
            <p className="text-[10px] text-muted-foreground">Click a bar to drill down</p>
          </CardHeader>
          <CardContent className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demo.industry} layout="vertical" margin={{ left: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" fontSize={11} />
                <YAxis type="category" dataKey="name" width={80} fontSize={11} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill="hsl(200, 70%, 50%)"
                  radius={[0, 4, 4, 0]}
                  name="Clients"
                  className="cursor-pointer"
                  onClick={(data) => onSegmentClick?.("Industry", data.name)}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-1">
              <CardTitle className="text-sm">Age Band Distribution</CardTitle>
              <p className="text-[10px] text-muted-foreground">Click a bar to drill down</p>
            </CardHeader>
            <CardContent className="h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demo.ageBand}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="hsl(270, 55%, 55%)"
                    radius={[4, 4, 0, 0]}
                    name="Clients"
                    className="cursor-pointer"
                    onClick={(data) => onSegmentClick?.("Age Band", data.name)}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Accessibility className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Para-Athletes / Accessibility-Supported</p>
                <p className="text-2xl font-bold text-primary">{demo.paraAthletes}</p>
              </div>
              <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DemographicsSection;
