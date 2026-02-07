import { XCircle, CheckCircle, ArrowRight } from "lucide-react";

const TheShift = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/3 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold font-medium text-sm tracking-wider uppercase">
            The Transformation
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mt-4 mb-6">
            From Performer to <span className="text-gradient-gold">Empire Builder</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Your talent got you here. Strategic wealth protection will secure your legacy for generations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* The Old Way */}
          <div className="p-8 rounded-3xl bg-card border border-border relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-destructive/50" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-destructive" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground">The Old Way</h3>
            </div>
            <ul className="space-y-4">
              {oldWayItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive/60 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* The Legacy Way */}
          <div className="p-8 rounded-3xl bg-card border border-gold/20 relative overflow-hidden group shadow-gold">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold to-gold-light" />
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-gold" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground">The Legacy Way</h3>
            </div>
            <ul className="space-y-4">
              {legacyWayItems.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2 text-gold">
            <span className="text-sm font-medium">Make the shift</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </section>
  );
};

const oldWayItems = [
  "Personal liability on every contract and asset",
  "Confusing contracts signed without legal review",
  "Earnings exposed to currency volatility",
  "No structure for family financial requests",
  "Missed compliance deadlines and penalties",
  "Wealth tied to a single career lifespan",
];

const legacyWayItems = [
  "Trust protection separating you from liability",
  "Digital contract vault with expert oversight",
  "Strategic offshore USD/GBP hedging",
  "Sustainable generosity frameworks for family",
  "Automated SARS compliance monitoring",
  "Multi-generational wealth structures",
];

export default TheShift;
