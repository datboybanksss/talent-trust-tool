import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Globe, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald/5 rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `linear-gradient(hsl(var(--gold)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--gold)) 1px, transparent 1px)`,
        backgroundSize: '60px 60px'
      }} />

      <div className="container relative z-10 py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full animate-fade-in">
            <Shield className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold tracking-wide">
              For South Africa's Elite Athletes & Artists
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-foreground leading-[1.1] animate-fade-in">
            Your Talent is the Product.{" "}
            <span className="text-gradient-gold block mt-2">You are the CEO.</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in">
            Transition from performer to entrepreneur. Secure your wealth with Trust structures, 
            contract oversight, and automated compliance built for the South African creative and sporting industry.
          </p>

          {/* Secondary headline */}
          <p className="text-base md:text-lg text-foreground/70 max-w-2xl mx-auto italic animate-fade-in">
            Own the Game, Secure the Legacy. Wealth protection and fiduciary oversight for SA's elite creators and competitors.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-fade-in">
            <Button variant="hero" size="xl" asChild className="group">
              <Link to="/auth">
                Secure My Legacy
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="heroOutline" size="xl" asChild>
              <Link to="/auth">
                Explore The Playbook
              </Link>
            </Button>
          </div>

          {/* Value Props */}
          <div className="grid sm:grid-cols-3 gap-6 pt-12 animate-fade-in">
            <ValueProp
              icon={Shield}
              title="Asset Protection"
              description="Strategic offshore $USD/$GBP hedging against volatility"
            />
            <ValueProp
              icon={TrendingUp}
              title="Sustainable Generosity"
              description="Manage 'Black Tax' without draining your future"
            />
            <ValueProp
              icon={Globe}
              title="SARS Compliance"
              description="Expert oversight on tour earnings & endorsement taxes"
            />
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

interface ValuePropProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const ValueProp = ({ icon: Icon, title, description }: ValuePropProps) => (
  <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm hover:border-gold/30 transition-all duration-300">
    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-gold" />
    </div>
    <h3 className="font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Hero;
