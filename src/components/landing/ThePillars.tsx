import { Shield, FileCheck, Scale } from "lucide-react";

const ThePillars = () => {
  return (
    <section className="py-24 bg-gradient-premium relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      
      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold font-medium text-sm tracking-wider uppercase">
            The Foundation
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mt-4 mb-6">
            Three Pillars of <span className="text-gradient-gold">Generational Wealth</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Built specifically for South African athletes and artists navigating global careers.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar, index) => (
            <PillarCard key={index} {...pillar} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface PillarCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  index: number;
}

const PillarCard = ({ icon: Icon, title, description, features, index }: PillarCardProps) => (
  <div
    className="group p-8 bg-card rounded-3xl border border-border hover:border-gold/30 transition-all duration-500 hover:shadow-gold relative overflow-hidden"
    style={{ animationDelay: `${index * 150}ms` }}
  >
    {/* Hover gradient effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <div className="relative z-10">
      <div className="w-16 h-16 rounded-2xl bg-gold/10 flex items-center justify-center mb-6 group-hover:bg-gold/20 transition-colors duration-300">
        <Icon className="w-8 h-8 text-gold" />
      </div>
      
      <h3 className="text-2xl font-display font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground mb-6">{description}</p>
      
      <ul className="space-y-3">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-foreground/80">
            <div className="w-1.5 h-1.5 rounded-full bg-gold" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const pillars = [
  {
    icon: Shield,
    title: "Asset Protection",
    description: "Shield your earnings from volatility and liability with strategic trust structures.",
    features: [
      "Trust formation & management",
      "Offshore USD/GBP accounts",
      "Property holding structures",
      "Intellectual property protection",
    ],
  },
  {
    icon: FileCheck,
    title: "Contract Clarity",
    description: "Never sign another confusing contract. Full visibility and expert oversight.",
    features: [
      "Digital contract vault",
      "Endorsement tracking",
      "Expiry date monitoring",
      "Legal review coordination",
    ],
  },
  {
    icon: Scale,
    title: "Compliance Support",
    description: "Stay ahead of SARS requirements with automated monitoring and expert guidance.",
    features: [
      "International tour earnings",
      "Endorsement tax optimization",
      "Annual return automation",
      "Regulatory update alerts",
    ],
  },
];

export default ThePillars;
