import { Button } from "@/components/ui/button";
import { Shield, Lock, FileText, Users, Briefcase, ArrowRight, ChevronDown, Trophy, Palette, FolderHeart, Calculator, TrendingUp, Bell, Share2, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import athletesCelebrating from "@/assets/athletes-celebrating.jpg";
import artistsCelebrating from "@/assets/artists-celebrating.jpg";
import athleteTrophy from "@/assets/athlete-trophy.jpg";

const athleteCategories = [
  { title: "Rugby Players", href: "/client-type?type=rugby-players", description: "Contract and wealth management for rugby professionals" },
  { title: "Soccer Players", href: "/client-type?type=soccer-players", description: "Career protection for footballers at all levels" },
  { title: "Cricket Players", href: "/client-type?type=cricket-players", description: "Financial planning for Proteas and franchise players" },
  { title: "Tennis Players", href: "/client-type?type=tennis-players", description: "Individual athlete wealth structuring" },
  { title: "Golf Players", href: "/client-type?type=golf-players", description: "Long-term career and sponsorship management" },
  { title: "Olympic Athletes", href: "/client-type?type=olympic-athletes", description: "Support for SA's Olympic hopefuls and champions" },
  { title: "Boxing & MMA", href: "/client-type?type=boxing-mma", description: "Combat sports contract and purse management" },
  { title: "Athletics & Track", href: "/client-type?type=athletics-track", description: "Track and field career planning" },
];

const artistCategories = [
  { title: "Musicians & Producers", href: "/client-type?type=musicians-producers", description: "Royalty management and label negotiations" },
  { title: "Visual Artists & Painters", href: "/client-type?type=visual-artists-painters", description: "Gallery representation and art sales structuring" },
  { title: "Actors & Performers", href: "/client-type?type=actors-performers", description: "Film and stage contract oversight" },
  { title: "Fashion Designers", href: "/client-type?type=fashion-designers", description: "Brand protection and licensing agreements" },
  { title: "Photographers & Filmmakers", href: "/client-type?type=photographers-filmmakers", description: "Intellectual property and licensing" },
  { title: "Writers & Authors", href: "/client-type?type=writers-authors", description: "Publishing rights and royalty management" },
  { title: "Digital Artists & NFT Creators", href: "/client-type?type=digital-artists-nft", description: "Web3 and digital asset protection" },
  { title: "Comedians & Entertainers", href: "/client-type?type=comedians-entertainers", description: "Tour and content monetization" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-display font-bold tracking-tight text-foreground">
              LegacyBuilder
            </Link>
            
            {/* Navigation Menu */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {/* Athletes Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-secondary/50 text-foreground data-[state=open]:bg-secondary/50">
                    <Trophy className="w-4 h-4 mr-2 text-gold" />
                    Athletes
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-3 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-card border border-border rounded-lg shadow-lg">
                      {athleteCategories.map((category) => (
                        <ListItem
                          key={category.title}
                          title={category.title}
                          href={category.href}
                        >
                          {category.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Artists Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-secondary/50 text-foreground data-[state=open]:bg-secondary/50">
                    <Palette className="w-4 h-4 mr-2 text-gold" />
                    Artists
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-3 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-card border border-border rounded-lg shadow-lg">
                      {artistCategories.map((category) => (
                        <ListItem
                          key={category.title}
                          title={category.title}
                          href={category.href}
                        >
                          {category.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/agent-register">Agents & Managers</Link>
            </Button>
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

      {/* Key Features Snapshot */}
      <section className="py-20 px-6 bg-secondary/20">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full mb-6">
              <BarChart3 className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">Platform Highlights</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Your Entire Career, One Dashboard
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A snapshot of what LegacyBuilder puts at your fingertips — from contract management to estate planning.
            </p>
          </div>

          {/* Feature Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <SnapshotStat value="100%" label="Document Encryption" />
            <SnapshotStat value="Real-Time" label="Contract Alerts" />
            <SnapshotStat value="POPIA" label="Fully Compliant" />
            <SnapshotStat value="24/7" label="Secure Access" />
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureSnapshotCard
              icon={FileText}
              title="Contract Manager"
              description="Track all active contracts, endorsements, and deal values with expiry alerts."
              accent="from-gold/20 to-gold/5"
            />
            <FeatureSnapshotCard
              icon={FolderHeart}
              title="Life File & Estate Planning"
              description="Organise wills, trusts, beneficiaries, and emergency contacts — share securely with loved ones."
              accent="from-primary/20 to-primary/5"
            />
            <FeatureSnapshotCard
              icon={TrendingUp}
              title="Investment Tracker"
              description="Monitor property and franchise investments with ROI calculations and portfolio overviews."
              accent="from-gold/20 to-gold/5"
            />
            <FeatureSnapshotCard
              icon={Bell}
              title="Smart Reminders"
              description="Automated alerts for tax deadlines, contract renewals, and compliance milestones."
              accent="from-primary/20 to-primary/5"
            />
            <FeatureSnapshotCard
              icon={Share2}
              title="Secure Sharing"
              description="Grant time-limited, section-level access to advisors, agents, or family members."
              accent="from-gold/20 to-gold/5"
            />
            <FeatureSnapshotCard
              icon={Calculator}
              title="Budget & Cash Flow"
              description="Monthly budget planner with category breakdowns and spending-vs-income insights."
              accent="from-primary/20 to-primary/5"
            />
          </div>
        </div>
      </section>

      {/* Celebration Gallery */}
      <section className="py-20 px-6">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Celebrating African Excellence
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We champion the success of South Africa's top athletes and artists — on and off the field.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-2xl overflow-hidden shadow-soft group">
              <img
                src={athletesCelebrating}
                alt="African athletes celebrating victory together on the field"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="p-4 bg-card">
                <p className="text-sm font-medium text-foreground">Athletes United in Victory</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-soft group">
              <img
                src={artistsCelebrating}
                alt="African artists and musicians celebrating creative success"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="p-4 bg-card">
                <p className="text-sm font-medium text-foreground">Creative Visionaries Thriving</p>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-soft group">
              <img
                src={athleteTrophy}
                alt="African athlete holding a gold trophy in celebration"
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="p-4 bg-card">
                <p className="text-sm font-medium text-foreground">Champions Building Legacies</p>
              </div>
            </div>
          </div>
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
            <ServiceCard
              icon={Briefcase}
              title="Funding Application Support"
              description="Get guidance and support to apply for funding opportunities tailored to your career."
            />
            <ServiceCard
              icon={ArrowRight}
              title="Investment Opportunity"
              description="Explore vetted property and franchise investment opportunities to grow your wealth."
            />
            <ServiceCard
              icon={FolderHeart}
              title="Life File"
              description="Organise your essential life documents, beneficiaries, and emergency contacts in one place."
            />
            <ServiceCard
              icon={Calculator}
              title="Budget Calculator"
              description="Plan and track your monthly budget with smart allocation tools and spending insights."
            />
          </div>
        </div>
      </section>

      {/* Agent & Manager CTA */}
      <section className="py-20 px-6">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
            <Briefcase className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-foreground">For Agents & Managers</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Are You an Athletes' Agent or Artists' Manager?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Create and pre-populate profiles for your clients with a designated activation link.
            Once your client confirms, their profile goes live — with full POPIA-compliant privacy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="gold" size="lg" asChild>
              <Link to="/agent-register">Register as Agent / Manager</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/agent-register">Sign In to Agent Portal</Link>
            </Button>
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

const SnapshotStat = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center p-5 rounded-2xl bg-card border border-border/50">
    <p className="text-2xl md:text-3xl font-display font-bold text-gold mb-1">{value}</p>
    <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
  </div>
);

interface FeatureSnapshotCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
}

const FeatureSnapshotCard = ({ icon: Icon, title, description, accent }: FeatureSnapshotCardProps) => (
  <div className="group p-5 rounded-2xl bg-card border border-border/50 hover:border-gold/30 transition-all duration-300 hover:shadow-gold">
    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${accent} flex items-center justify-center mb-3`}>
      <Icon className="w-5 h-5 text-gold" />
    </div>
    <h3 className="text-base font-display font-semibold text-foreground mb-1.5">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

interface ListItemProps {
  title: string;
  href: string;
  children: React.ReactNode;
}

const ListItem = ({ title, href, children }: ListItemProps) => (
  <li>
    <NavigationMenuLink asChild>
      <Link
        to={href}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
          "hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground"
        )}
      >
        <div className="text-sm font-medium leading-none text-foreground">{title}</div>
        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
          {children}
        </p>
      </Link>
    </NavigationMenuLink>
  </li>
);

export default Landing;
