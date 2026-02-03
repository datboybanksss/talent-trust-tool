import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Trophy, Palette, Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const ClientTypeHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/#services" },
    { label: "Athletes", href: "/#athletes" },
    { label: "Artists", href: "/#artists" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-primary/95 backdrop-blur-sm border-b border-primary-foreground/10">
      <div className="container py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gold rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-forest-dark" />
            </div>
            <span className="text-xl font-display font-bold text-primary-foreground">
              LegacyBuilder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {links.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="text-primary-foreground/80 hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/dashboard">Sign In</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/dashboard">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-primary-foreground p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-forest-light/50 backdrop-blur-lg rounded-2xl animate-scale-in">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-primary-foreground/80 hover:text-gold transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-2 pt-4 border-t border-primary-foreground/10">
                <Button variant="ghost" className="text-primary-foreground justify-start" asChild>
                  <Link to="/dashboard">Sign In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/dashboard">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const clientTypeData: Record<string, {
  category: "athletes" | "artists";
  title: string;
  description: string;
  services: string[];
  challenges: string[];
}> = {
  // Athletes
  "rugby-players": {
    category: "athletes",
    title: "Rugby Players",
    description: "Specialized financial and legal guidance for professional rugby players navigating endorsements, contracts, and career transitions.",
    services: [
      "Contract negotiation with franchises and national teams",
      "Endorsement deal structuring and brand partnerships",
      "Injury insurance and income protection planning",
      "Post-career transition and investment strategies",
      "Tax optimization for international earnings",
    ],
    challenges: [
      "Managing income across multiple currencies",
      "Short career windows requiring accelerated wealth building",
      "Balancing team commitments with personal brand growth",
    ],
  },
  "soccer-players": {
    category: "athletes",
    title: "Soccer Players",
    description: "Comprehensive support for footballers at all levels, from PSL stars to international transfers.",
    services: [
      "Transfer fee and signing bonus optimization",
      "Image rights and merchandise licensing",
      "Agent contract review and management",
      "Family wealth structuring and trusts",
      "Retirement planning and second career development",
    ],
    challenges: [
      "Navigating complex transfer regulations",
      "Protecting earnings during peak years",
      "Building sustainable post-football income",
    ],
  },
  "cricket-players": {
    category: "athletes",
    title: "Cricket Players",
    description: "Tailored solutions for Proteas and franchise cricketers managing domestic and international careers.",
    services: [
      "IPL and franchise league contract advisory",
      "Central contract negotiations with CSA",
      "Commentary and media opportunity planning",
      "Equipment and apparel sponsorship deals",
      "Long-term investment portfolio management",
    ],
    challenges: [
      "Balancing national duty with lucrative league contracts",
      "Managing seasonal income fluctuations",
      "Building brand value in a competitive market",
    ],
  },
  "tennis-players": {
    category: "athletes",
    title: "Tennis Players",
    description: "Expert guidance for individual athletes managing global tournament circuits and sponsorships.",
    services: [
      "Prize money and ranking bonus optimization",
      "Equipment and apparel sponsorship negotiations",
      "Travel and coaching expense structuring",
      "Academy and training facility investments",
      "Brand ambassador role development",
    ],
    challenges: [
      "Self-employed status and tax complexities",
      "Managing a full support team financially",
      "Competing globally while maintaining SA tax residency",
    ],
  },
  "golf-players": {
    category: "athletes",
    title: "Golf Players",
    description: "Specialized support for professional golfers on Sunshine Tour, DP World, and PGA circuits.",
    services: [
      "Tournament earnings and bonus structuring",
      "Course design and ambassador opportunities",
      "Equipment endorsement negotiations",
      "Caddie and team compensation planning",
      "Golf academy and property investments",
    ],
    challenges: [
      "Variable income based on performance",
      "High travel and operational costs",
      "Long career span requiring diverse investments",
    ],
  },
  "olympic-athletes": {
    category: "athletes",
    title: "Olympic Athletes",
    description: "Dedicated support for South African Olympians and aspiring Olympic athletes.",
    services: [
      "SASCOC grant and funding optimization",
      "Sponsor relationship management",
      "Training and equipment expense planning",
      "Medal bonus and prize money structuring",
      "Post-Olympic career transition support",
    ],
    challenges: [
      "Limited earning windows around Olympic cycles",
      "Balancing training costs with income",
      "Leveraging Olympic success for long-term value",
    ],
  },
  "boxing-mma": {
    category: "athletes",
    title: "Boxing & MMA Fighters",
    description: "Combat sports specialists understanding the unique financial dynamics of fight purses and promotions.",
    services: [
      "Fight purse and PPV revenue negotiations",
      "Promoter contract review and optimization",
      "Gym ownership and training business structuring",
      "Brand and merchandise development",
      "Long-term health and disability planning",
    ],
    challenges: [
      "Irregular fight-based income",
      "Health risks requiring specialized insurance",
      "Promoter relationships and contract dependencies",
    ],
  },
  "athletics-track": {
    category: "athletes",
    title: "Athletics & Track Stars",
    description: "Supporting South Africa's track and field athletes from emerging talents to world champions.",
    services: [
      "Diamond League and World Athletics prize structuring",
      "Shoe and apparel sponsorship deals",
      "Appearance fee negotiations",
      "Training camp and coaching investments",
      "Athletics academy development",
    ],
    challenges: [
      "Short competitive career windows",
      "Performance-dependent income",
      "Global travel and training costs",
    ],
  },
  // Artists
  "musicians-producers": {
    category: "artists",
    title: "Musicians & Producers",
    description: "Comprehensive support for recording artists, producers, and composers in South Africa's vibrant music scene.",
    services: [
      "Recording contract review and negotiation",
      "Royalty collection and SAMRO optimization",
      "Publishing deal structuring",
      "Tour and performance fee management",
      "Studio ownership and equipment investments",
    ],
    challenges: [
      "Complex royalty streams from multiple sources",
      "Advancing against future earnings",
      "Protecting catalog value long-term",
    ],
  },
  "visual-artists-painters": {
    category: "artists",
    title: "Visual Artists & Painters",
    description: "Supporting painters, sculptors, and visual artists in protecting and monetizing their creative works.",
    services: [
      "Gallery representation agreements",
      "Art sale and commission structuring",
      "Estate planning for art collections",
      "International exhibition and sale planning",
      "Artist residency and grant applications",
    ],
    challenges: [
      "Irregular income from artwork sales",
      "Valuation of artistic works",
      "Copyright protection across borders",
    ],
  },
  "actors-performers": {
    category: "artists",
    title: "Actors & Performers",
    description: "Guidance for stage and screen performers navigating the entertainment industry.",
    services: [
      "Film and TV contract negotiations",
      "Residual and repeat fee management",
      "Personal appearance fee structuring",
      "Production company formation",
      "International work permit and tax planning",
    ],
    challenges: [
      "Project-based irregular income",
      "Managing multiple income streams",
      "Balancing local and international opportunities",
    ],
  },
  "fashion-designers": {
    category: "artists",
    title: "Fashion Designers",
    description: "Supporting South African fashion talent from emerging designers to established houses.",
    services: [
      "Brand trademark and IP protection",
      "Retail and licensing agreements",
      "Fashion week and show financing",
      "Manufacturing and supply chain structuring",
      "International distribution planning",
    ],
    challenges: [
      "Seasonal cash flow management",
      "Protecting designs from copying",
      "Scaling production while maintaining quality",
    ],
  },
  "photographers-filmmakers": {
    category: "artists",
    title: "Photographers & Filmmakers",
    description: "Comprehensive support for visual storytellers in commercial and artistic spheres.",
    services: [
      "Commercial and editorial rate negotiations",
      "Image licensing and usage rights",
      "Production company structuring",
      "Equipment and studio investments",
      "Archive and catalog monetization",
    ],
    challenges: [
      "Protecting intellectual property rights",
      "Managing project-based cash flow",
      "Balancing commercial and personal work",
    ],
  },
  "writers-authors": {
    category: "artists",
    title: "Writers & Authors",
    description: "Supporting South African authors, screenwriters, and content creators.",
    services: [
      "Publishing contract negotiations",
      "Adaptation and screenplay rights",
      "Advance and royalty structuring",
      "Literary estate planning",
      "Speaking and appearance fee management",
    ],
    challenges: [
      "Long creation cycles before income",
      "Managing advances against royalties",
      "Protecting adaptation rights",
    ],
  },
  "digital-artists-nft": {
    category: "artists",
    title: "Digital Artists & NFT Creators",
    description: "Navigating the new frontier of digital art, NFTs, and Web3 creative opportunities.",
    services: [
      "NFT minting and sale strategies",
      "Smart contract and royalty structuring",
      "Digital rights management",
      "Cryptocurrency and digital asset planning",
      "Platform and marketplace negotiations",
    ],
    challenges: [
      "Volatile cryptocurrency markets",
      "Evolving regulatory landscape",
      "Technical and platform risks",
    ],
  },
  "comedians-entertainers": {
    category: "artists",
    title: "Comedians & Entertainers",
    description: "Supporting stand-up comedians, MCs, and live entertainers across South Africa.",
    services: [
      "Tour and venue contract negotiations",
      "Content licensing and streaming deals",
      "Merchandise and brand development",
      "Production company formation",
      "International touring and tax planning",
    ],
    challenges: [
      "Building consistent income from live work",
      "Protecting comedic material and IP",
      "Monetizing content across platforms",
    ],
  },
};

const ClientType = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "";
  const data = clientTypeData[type];

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground mb-4">
            Client Type Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The requested client type doesn't exist.
          </p>
          <Button asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const Icon = data.category === "athletes" ? Trophy : Palette;

  return (
    <div className="min-h-screen bg-background">
      <ClientTypeHeader />
      
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gold text-forest-dark flex items-center justify-center">
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <span className="text-gold text-sm font-medium uppercase tracking-wider">
                {data.category === "athletes" ? "Sports Athletes" : "Artists & Creatives"}
              </span>
              <h1 className="text-3xl md:text-4xl font-display font-bold">
                {data.title}
              </h1>
            </div>
          </div>
          <p className="text-lg text-primary-foreground/80 max-w-2xl">
            {data.description}
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="container py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Services */}
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">
              Specialized Services
            </h2>
            <ul className="space-y-4">
              {data.services.map((service, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Challenges */}
          <div>
            <h2 className="text-2xl font-display font-bold text-foreground mb-6">
              Common Challenges We Address
            </h2>
            <div className="bg-secondary rounded-2xl p-6">
              <ul className="space-y-4">
                {data.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-gold/20 text-gold flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-sm font-semibold">{index + 1}</span>
                    </div>
                    <span className="text-foreground">{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-hero rounded-3xl p-8 md:p-12 text-primary-foreground">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
              Let's discuss how we can support your unique journey as a {data.title.toLowerCase()}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/dashboard">Access Your Dashboard</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/#contact">Schedule a Consultation</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientType;