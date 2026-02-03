import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  icon: React.ElementType;
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: "default" | "primary" | "gold";
}

const StatsCard = ({ icon: Icon, title, value, subtitle, trend, variant = "default" }: StatsCardProps) => {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1",
        variant === "default" && "bg-card border border-border shadow-soft",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "gold" && "bg-gradient-to-br from-gold to-gold-dark text-forest-dark"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            variant === "default" && "bg-primary/10 text-primary",
            variant === "primary" && "bg-primary-foreground/20 text-primary-foreground",
            variant === "gold" && "bg-forest-dark/20 text-forest-dark"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-sm font-medium px-2 py-0.5 rounded-full",
              trend.positive
                ? "bg-success/20 text-success"
                : "bg-destructive/20 text-destructive"
            )}
          >
            {trend.positive ? "+" : ""}{trend.value}%
          </span>
        )}
      </div>

      <p
        className={cn(
          "text-sm mb-1",
          variant === "default" && "text-muted-foreground",
          variant === "primary" && "text-primary-foreground/80",
          variant === "gold" && "text-forest-dark/80"
        )}
      >
        {title}
      </p>
      <p className="text-3xl font-display font-bold">{value}</p>
      {subtitle && (
        <p
          className={cn(
            "text-sm mt-1",
            variant === "default" && "text-muted-foreground",
            variant === "primary" && "text-primary-foreground/70",
            variant === "gold" && "text-forest-dark/70"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default StatsCard;
