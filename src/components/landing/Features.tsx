import { 
  Building2, 
  FileCheck, 
  Bell, 
  FolderLock, 
  Users, 
  Mail,
  Trophy,
  Palette,
  Briefcase
} from "lucide-react";

const Features = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold font-medium text-sm tracking-wider uppercase">
            Comprehensive Solutions
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-4 mb-6">
            Everything You Need to Build Your Legacy
          </h2>
          <p className="text-lg text-muted-foreground">
            From company registration to ongoing compliance, we guide you through 
            every step of your business journey with precision and care.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}

const FeatureCard = ({ icon: Icon, title, description, index }: FeatureCardProps) => (
  <div
    className="group p-8 bg-card rounded-2xl border border-border shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
      <Icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
    </div>
    <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

const features = [
  {
    icon: Building2,
    title: "Company Registration",
    description: "Streamlined Pty Ltd registration with step-by-step guidance through CIPC processes and documentation.",
  },
  {
    icon: FileCheck,
    title: "Compliance Management",
    description: "Stay on top of all statutory requirements including annual returns, tax filings, and regulatory updates.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Never miss a deadline with automated notifications for compliance reporting and important dates.",
  },
  {
    icon: FolderLock,
    title: "Secure Document Vault",
    description: "Store all your company documents, contracts, and certificates in one secure, accessible location.",
  },
  {
    icon: Users,
    title: "Strategic Advisors",
    description: "Connect with our network of legal, financial, and business experts tailored to your industry.",
  },
  {
    icon: Mail,
    title: "Communication Hub",
    description: "Track all correspondence with complete email history and communication logs.",
  },
  {
    icon: Trophy,
    title: "Athlete Services",
    description: "Specialized support for sports professionals including endorsement contracts and brand protection.",
  },
  {
    icon: Palette,
    title: "Artist Protection",
    description: "Intellectual property management, royalty tracking, and creative rights protection for artists.",
  },
  {
    icon: Briefcase,
    title: "Entrepreneur Support",
    description: "Business structuring, investment readiness, and growth strategy for ambitious entrepreneurs.",
  },
];

export default Features;
