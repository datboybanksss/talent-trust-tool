import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Building2, Users } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gold rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-light rounded-full blur-3xl" />
      </div>

      <div className="container relative z-10 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/20 rounded-full">
              <Shield className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">
                Trusted by South Africa's Elite
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight">
              Build Your{" "}
              <span className="text-gradient-gold">Legacy</span>
              <br />
              Protect Your Future
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl leading-relaxed">
              Empowering South African athletes, artists, and entrepreneurs to 
              establish and safeguard their business empires through strategic 
              trust structures and comprehensive company formation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="xl" asChild>
                <Link to="/dashboard">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <Link to="/dashboard">
                  View Your Portal
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gold/30 border-2 border-primary-foreground/20 flex items-center justify-center text-sm font-semibold text-primary-foreground"
                  >
                    {i}
                  </div>
                ))}
              </div>
              <p className="text-sm text-primary-foreground/70">
                <span className="font-semibold text-gold">500+</span> successful company formations
              </p>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4 animate-slide-in-right">
            <div className="space-y-4">
              <FeatureCard
                icon={Building2}
                title="Company Formation"
                description="Seamless Pty Ltd registration"
              />
              <FeatureCard
                icon={Shield}
                title="Trust Protection"
                description="Secure your assets & legacy"
                highlighted
              />
            </div>
            <div className="space-y-4 mt-8">
              <FeatureCard
                icon={Users}
                title="Expert Advisors"
                description="Strategic guidance on demand"
              />
              <FeatureCard
                icon={ArrowRight}
                title="Full Compliance"
                description="Stay ahead of regulations"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  highlighted?: boolean;
}

const FeatureCard = ({ icon: Icon, title, description, highlighted }: FeatureCardProps) => (
  <div
    className={`p-6 rounded-2xl backdrop-blur-sm transition-transform duration-300 hover:scale-105 ${
      highlighted
        ? "bg-gold/20 border border-gold/30"
        : "bg-primary-foreground/5 border border-primary-foreground/10"
    }`}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
        highlighted ? "bg-gold text-forest-dark" : "bg-primary-foreground/10 text-primary-foreground"
      }`}
    >
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-semibold text-primary-foreground mb-1">{title}</h3>
    <p className="text-sm text-primary-foreground/70">{description}</p>
  </div>
);

export default Hero;
