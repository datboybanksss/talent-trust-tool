import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, DollarSign, ShieldCheck, UserMinus, UserPlus } from "lucide-react";
import { getFilteredKPIs, ExecutiveFilters } from "@/utils/executiveFilters";
import { useExecutiveData } from "@/hooks/useExecutiveData";

const fmt = (n: number) =>
  n >= 1_000_000 ? `R${(n / 1_000_000).toFixed(1)}M` : `R${(n / 1_000).toFixed(0)}K`;

interface ExecutiveKPICardsProps {
  filters: ExecutiveFilters;
}

const ExecutiveKPICards = ({ filters }: ExecutiveKPICardsProps) => {
  const { data } = useExecutiveData();
  const dataset = data ?? { invitations: [], deals: [] };
  const kpis = useMemo(() => getFilteredKPIs(dataset, filters), [dataset, filters]);

  const cards = [
    {
      label: "Revenue Growth",
      value: `${kpis.revenueGrowth > 0 ? "+" : ""}${kpis.revenueGrowth}%`,
      icon: TrendingUp,
      accent: kpis.revenueGrowth > 0,
    },
    {
      label: "Avg Revenue / Client",
      value: fmt(kpis.avgRevenuePerClient),
      icon: DollarSign,
      accent: true,
    },
    {
      label: "Client Retention",
      value: `${kpis.clientRetention}%`,
      icon: ShieldCheck,
      accent: kpis.clientRetention > 90,
    },
    {
      label: "Total Clients",
      value: kpis.totalClients.toString(),
      icon: Users,
      accent: false,
    },
    {
      label: "New Clients (YTD)",
      value: `+${kpis.newClientsThisYear}`,
      icon: UserPlus,
      accent: true,
    },
    {
      label: "Concentration Risk",
      value: `${kpis.concentrationRisk}%`,
      icon: UserMinus,
      accent: kpis.concentrationRisk < 30,
      subtitle: "Top-3 clients",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="border-border/60">
          <CardContent className="p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <c.icon className="w-4 h-4" />
              <span className="text-xs font-medium truncate">{c.label}</span>
            </div>
            <p className={`text-xl font-bold font-display ${c.accent ? "text-primary" : "text-foreground"}`}>
              {c.value}
            </p>
            {c.subtitle && <span className="text-[10px] text-muted-foreground">{c.subtitle}</span>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ExecutiveKPICards;
