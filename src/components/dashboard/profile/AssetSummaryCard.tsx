import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface AssetSummaryCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  count?: number;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: "default" | "gold";
}

const AssetSummaryCard = ({ 
  icon: Icon, 
  title, 
  value, 
  count,
  trend,
  variant = "default" 
}: AssetSummaryCardProps) => {
  return (
    <div
      className={cn(
        "p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1",
        variant === "default" && "bg-card border border-border shadow-soft",
        variant === "gold" && "bg-gradient-to-br from-gold to-gold-dark text-forest-dark"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center",
            variant === "default" && "bg-primary/10 text-primary",
            variant === "gold" && "bg-forest-dark/20 text-forest-dark"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            trend.positive ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
          )}>
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}%
          </div>
        )}
      </div>

      <p className={cn(
        "text-xs uppercase tracking-wider mb-1",
        variant === "default" && "text-muted-foreground",
        variant === "gold" && "text-forest-dark/70"
      )}>
        {title}
      </p>
      
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-display font-bold">{value}</p>
        {count !== undefined && (
          <span className={cn(
            "text-sm",
            variant === "default" && "text-muted-foreground",
            variant === "gold" && "text-forest-dark/70"
          )}>
            ({count} items)
          </span>
        )}
      </div>
    </div>
  );
};

export default AssetSummaryCard;
