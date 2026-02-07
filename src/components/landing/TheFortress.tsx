import { Shield, TrendingUp, Globe, Lock } from "lucide-react";

const TheFortress = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-card/50 to-background" />
      
      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold font-medium text-sm tracking-wider uppercase">
            Your Command Center
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mt-4 mb-6">
            Welcome to <span className="text-gradient-gold">The Fortress</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A consolidated view of your entire wealth ecosystem. Local and offshore, all in one secure vault.
          </p>
        </div>

        {/* Dashboard Preview */}
        <div className="max-w-5xl mx-auto">
          <div className="p-1 rounded-3xl bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 shadow-glow">
            <div className="bg-card rounded-[22px] p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-foreground">The Fortress</h3>
                    <p className="text-sm text-muted-foreground">Asset Overview</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-success/10 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-xs text-success font-medium">All Secure</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  icon={Lock}
                  label="Local ZAR"
                  value="R12.4M"
                  change="+8.2%"
                  positive
                />
                <StatCard
                  icon={Globe}
                  label="Offshore USD"
                  value="$845K"
                  change="+12.1%"
                  positive
                />
                <StatCard
                  icon={TrendingUp}
                  label="Offshore GBP"
                  value="£320K"
                  change="+5.4%"
                  positive
                />
                <StatCard
                  icon={Shield}
                  label="Trust Assets"
                  value="R28.7M"
                  change="+15.3%"
                  positive
                />
              </div>

              {/* Distribution Bar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Asset Distribution</span>
                  <span className="text-foreground font-medium">Total: R58.2M</span>
                </div>
                <div className="h-3 rounded-full bg-secondary overflow-hidden flex">
                  <div className="h-full bg-gold" style={{ width: '35%' }} />
                  <div className="h-full bg-emerald" style={{ width: '25%' }} />
                  <div className="h-full bg-info" style={{ width: '20%' }} />
                  <div className="h-full bg-gold-light" style={{ width: '20%' }} />
                </div>
                <div className="flex flex-wrap gap-4 text-xs">
                  <LegendItem color="bg-gold" label="Local ZAR (35%)" />
                  <LegendItem color="bg-emerald" label="Offshore USD (25%)" />
                  <LegendItem color="bg-info" label="Offshore GBP (20%)" />
                  <LegendItem color="bg-gold-light" label="Trust (20%)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  positive?: boolean;
}

const StatCard = ({ icon: Icon, label, value, change, positive }: StatCardProps) => (
  <div className="p-4 rounded-2xl bg-secondary/50 border border-border">
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-gold" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
    <div className="text-2xl font-display font-bold text-foreground">{value}</div>
    <div className={`text-sm ${positive ? 'text-success' : 'text-destructive'}`}>
      {change} this quarter
    </div>
  </div>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-2">
    <div className={`w-3 h-3 rounded-full ${color}`} />
    <span className="text-muted-foreground">{label}</span>
  </div>
);

export default TheFortress;
