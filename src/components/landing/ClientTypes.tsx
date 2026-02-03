import { Trophy, Palette, Briefcase, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ClientTypes = () => {
  return (
    <section className="py-24 bg-secondary">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold font-medium text-sm tracking-wider uppercase">
            Tailored For You
          </span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mt-4 mb-6">
            Built for South Africa's Top Talent
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're scoring goals, creating masterpieces, or building empires—
            we understand your unique needs.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <ClientTypeCard
            icon={Trophy}
            title="Sports Athletes"
            subtitle="Protect your earnings, plan for the future"
            features={[
              "Endorsement contract management",
              "Trust structures for long-term security",
              "Agent & manager coordination",
              "Career transition planning",
              "Brand protection strategies",
            ]}
            color="gold"
            dropdownItems={[
              { label: "Rugby Players", slug: "rugby-players" },
              { label: "Soccer Players", slug: "soccer-players" },
              { label: "Cricket Players", slug: "cricket-players" },
              { label: "Tennis Players", slug: "tennis-players" },
              { label: "Golf Players", slug: "golf-players" },
              { label: "Olympic Athletes", slug: "olympic-athletes" },
              { label: "Boxing & MMA", slug: "boxing-mma" },
              { label: "Athletics & Track", slug: "athletics-track" },
            ]}
          />
          <ClientTypeCard
            icon={Palette}
            title="Artists & Creatives"
            subtitle="Secure your creative legacy"
            features={[
              "Intellectual property protection",
              "Royalty & licensing management",
              "Gallery & label contract review",
              "Estate planning for creative works",
              "Collaborative venture structures",
            ]}
            color="primary"
            highlighted
            dropdownItems={[
              { label: "Musicians & Producers", slug: "musicians-producers" },
              { label: "Visual Artists & Painters", slug: "visual-artists-painters" },
              { label: "Actors & Performers", slug: "actors-performers" },
              { label: "Fashion Designers", slug: "fashion-designers" },
              { label: "Photographers & Filmmakers", slug: "photographers-filmmakers" },
              { label: "Writers & Authors", slug: "writers-authors" },
              { label: "Digital Artists & NFT Creators", slug: "digital-artists-nft" },
              { label: "Comedians & Entertainers", slug: "comedians-entertainers" },
            ]}
          />
          <ClientTypeCard
            icon={Briefcase}
            title="Entrepreneurs"
            subtitle="Scale with confidence"
            features={[
              "Company formation & structuring",
              "Investment readiness preparation",
              "Partnership agreement frameworks",
              "Regulatory compliance management",
              "Growth strategy advisory",
            ]}
            color="gold"
          />
        </div>
      </div>
    </section>
  );
};

interface ClientTypeCardProps {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  features: string[];
  color: "gold" | "primary";
  highlighted?: boolean;
  dropdownItems?: { label: string; slug: string }[];
}

const ClientTypeCard = ({
  icon: Icon,
  title,
  subtitle,
  features,
  color,
  highlighted,
  dropdownItems,
}: ClientTypeCardProps) => (
  <div
    className={`relative p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 ${
      highlighted
        ? "bg-gradient-hero text-primary-foreground shadow-medium"
        : "bg-card border border-border shadow-soft"
    }`}
  >
    {highlighted && (
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gold rounded-full text-xs font-semibold text-forest-dark">
        Most Popular
      </div>
    )}

    <div
      className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${
        highlighted
          ? "bg-gold text-forest-dark"
          : color === "gold"
          ? "bg-gold/10 text-gold"
          : "bg-primary/10 text-primary"
      }`}
    >
      <Icon className="w-8 h-8" />
    </div>

    <div className="flex items-center gap-2 mb-2">
      <h3
        className={`text-2xl font-display font-bold ${
          highlighted ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        {title}
      </h3>
      {dropdownItems && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-7 px-2 ${
                highlighted
                  ? "text-primary-foreground/80 hover:text-primary-foreground hover:bg-white/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="start" 
            className="w-56 bg-popover border border-border shadow-lg z-50"
          >
            {dropdownItems.map((item) => (
              <DropdownMenuItem
                key={item.slug}
                className="cursor-pointer hover:bg-accent focus:bg-accent"
                asChild
              >
                <Link to={`/client-type?type=${item.slug}`}>
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
    <p
      className={`mb-6 ${
        highlighted ? "text-primary-foreground/80" : "text-muted-foreground"
      }`}
    >
      {subtitle}
    </p>

    <ul className="space-y-3 mb-8">
      {features.map((feature, index) => (
        <li
          key={index}
          className={`flex items-start gap-3 text-sm ${
            highlighted ? "text-primary-foreground/90" : "text-foreground"
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
              highlighted ? "bg-gold/20" : "bg-primary/10"
            }`}
          >
            <ArrowRight
              className={`w-3 h-3 ${highlighted ? "text-gold" : "text-primary"}`}
            />
          </div>
          {feature}
        </li>
      ))}
    </ul>

    <Button
      variant={highlighted ? "hero" : "outline"}
      className="w-full"
      asChild
    >
      <Link to="/dashboard">Get Started</Link>
    </Button>
  </div>
);

export default ClientTypes;
