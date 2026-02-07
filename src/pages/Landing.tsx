import { Button } from "@/components/ui/button";
import { Shield, Lock, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/30">
        <div className="container py-6 flex items-center justify-between">
          <span className="text-xl font-display font-bold tracking-tight">
            LegacyBuilder
          </span>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight tracking-tight">
            Your talent makes the money.
            <br />
            <span className="text-gold">Your Trust keeps it.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            We turn South African icons into entrepreneurs. Protecting your contracts, your wealth, and your future.
          </p>
          
          <Button variant="hero" size="xl" asChild className="group mt-4">
            <Link to="/auth">
              Build My Legacy
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Three Cards */}
      <section className="py-32 px-6 border-t border-border/30">
        <div className="container max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <FeatureCard
              icon={Lock}
              title="The Vault"
              description="Protect your assets in a legal Trust."
            />
            <FeatureCard
              icon={Shield}
              title="The Shield"
              description="Professional contract and compliance oversight."
            />
            <FeatureCard
              icon={TrendingUp}
              title="The Future"
              description="Wealth management that lasts longer than the game."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/30">
        <div className="container max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LegacyBuilder
          </span>
          <span className="text-sm text-muted-foreground">
            Johannesburg, South Africa
          </span>
        </div>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="text-center space-y-4">
    <div className="w-14 h-14 mx-auto rounded-full border border-gold/30 flex items-center justify-center">
      <Icon className="w-6 h-6 text-gold" />
    </div>
    <h3 className="text-xl font-display font-semibold">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

export default Landing;
