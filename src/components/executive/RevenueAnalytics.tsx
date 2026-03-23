import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { monthlyRevenue, revenueStreams, topClients, CHART_COLORS } from "@/data/executiveMockData";

const fmt = (n: number) => `R${(n / 1_000_000).toFixed(1)}M`;

interface RevenueAnalyticsProps {
  onSegmentClick?: (category: string, segment: string) => void;
}

const RevenueAnalytics = ({ onSegmentClick }: RevenueAnalyticsProps) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Trend Line */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Monthly Revenue vs Costs</CardTitle>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" fontSize={11} />
              <YAxis tickFormatter={(v) => fmt(v)} fontSize={11} />
              <Tooltip formatter={(v: number) => fmt(v)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="hsl(43, 80%, 50%)" strokeWidth={2} dot={false} name="Revenue" />
              <Line type="monotone" dataKey="costs" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={false} name="Costs" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Revenue by Stream Pie */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Revenue by Stream</CardTitle>
          <p className="text-xs text-muted-foreground">Click a segment to drill down</p>
        </CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={revenueStreams}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                fontSize={11}
                className="cursor-pointer"
                onClick={(data) => onSegmentClick?.("Revenue Stream", data.name)}
              >
                {revenueStreams.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} className="cursor-pointer hover:opacity-80 transition-opacity" />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>

    {/* Top Clients Table */}
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Clients by Revenue Contribution</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Sector</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topClients.map((c, i) => (
              <TableRow key={c.name}>
                <TableCell className="font-medium text-muted-foreground">{i + 1}</TableCell>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{c.type}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{c.sport || c.genre || c.industry}</TableCell>
                <TableCell className="text-right font-mono text-sm">{fmt(c.revenue)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
);

export default RevenueAnalytics;
