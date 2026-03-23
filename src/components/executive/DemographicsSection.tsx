import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Accessibility } from "lucide-react";
import { demographics, CHART_COLORS } from "@/data/executiveMockData";

const MiniPie = ({ data, title }: { data: { name: string; value: number }[]; title: string }) => (
  <Card>
    <CardHeader className="pb-1">
      <CardTitle className="text-sm">{title}</CardTitle>
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
          >
            {data.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const DemographicsSection = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MiniPie data={demographics.clientType} title="Client Type" />
      <MiniPie data={demographics.gender} title="Gender Split" />
      <MiniPie data={demographics.geography} title="Geography" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Industry Bar */}
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-sm">Industry Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demographics.industry} layout="vertical" margin={{ left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" fontSize={11} />
              <YAxis type="category" dataKey="name" width={80} fontSize={11} />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(200, 70%, 50%)" radius={[0, 4, 4, 0]} name="Clients" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Age Band + Para */}
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-1">
            <CardTitle className="text-sm">Age Band Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={demographics.ageBand}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(270, 55%, 55%)" radius={[4, 4, 0, 0]} name="Clients" />
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
              <p className="text-2xl font-bold text-primary">{demographics.paraAthletes}</p>
            </div>
            <Badge variant="secondary" className="ml-auto text-xs">Active</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default DemographicsSection;
