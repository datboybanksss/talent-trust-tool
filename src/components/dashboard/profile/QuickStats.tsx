import { cn } from "@/lib/utils";

interface QuickStat {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  color?: "default" | "success" | "warning" | "destructive";
}

interface QuickStatsProps {
  stats: QuickStat[];
}

const QuickStats = ({ stats }: QuickStatsProps) => {
  const getColorClass = (color: QuickStat["color"]) => {
    switch (color) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "destructive":
        return "text-destructive";
      default:
        return "text-foreground";
    }
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
      <h3 className="font-semibold text-foreground mb-4">Quick Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center p-3 bg-secondary/50 rounded-xl">
            {stat.icon && (
              <stat.icon className={cn("w-5 h-5 mx-auto mb-2", getColorClass(stat.color))} />
            )}
            <p className={cn("text-xl font-bold", getColorClass(stat.color))}>
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickStats;
