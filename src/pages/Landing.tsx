import { Button } from "@/components/ui/button";
import { Shield, Lock, FileText, Users, Briefcase, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container py-5 flex items-center justify-between">
          <span className="text-xl font-display font-bold tracking-tight text-foreground">
            LegacyBuilder
          </span>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="hero" size="sm" asChild>
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full">
            <Shield className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold">
              For SA's Elite Athletes & Artists
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight tracking-tight text-foreground">
            Build Your Legacy,
            <br />
            <span className="text-gold">Protect Your Future.</span>
          </h1>
          
          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transition from performer to entrepreneur. Secure your wealth with Trust structures, 
            contract oversight, and automated compliance built for the South African creative and sporting industry.
          </p>
          
          {/* CTA */}
          <Button variant="hero" size="xl" asChild className="group mt-4">
            <Link to="/auth">
              Secure My Legacy
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Everything You Need to Thrive
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Comprehensive services designed to protect your career, wealth, and legacy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon={Briefcase}
              title="Business Setup"
              description="Establish your professional entity with proper legal structures from day one."
            />
            <ServiceCard
              icon={Shield}
              title="Wealth Protection"
              description="Secure your assets with Trust structures designed for high-net-worth individuals."
            />
            <ServiceCard
              icon={FileText}
              title="Document Vault"
              description="Store and manage all your career documents in one secure location."
            />
            <ServiceCard
              icon={Users}
              title="Compliance Support"
              description="Access professional contacts to keep your affairs SARS-compliant."
            />
            <ServiceCard
              icon={Lock}
              title="Financial Products"
              description="Connect with vetted advisors and access exclusive financial solutions."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
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

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const ServiceCard = ({ icon: Icon, title, description }: ServiceCardProps) => (
  <div className="p-6 rounded-2xl bg-card border border-border/50 hover:border-gold/30 transition-all duration-300 hover:shadow-gold">
    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-gold" />
    </div>
    <h3 className="text-lg font-display font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

export default Landing;
