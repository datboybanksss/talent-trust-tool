import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Shield, Lock, FileText, Users, Briefcase, ArrowRight, Trophy, Palette,
  FolderHeart, Calculator, TrendingUp, Bell, Share2, BarChart3, Zap,
  CheckCircle2, Clock, Star, ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  NavigationMenu, NavigationMenuContent, NavigationMenuItem,
  NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger,
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

/* ── Animated Counter ─────────────────────────────────── */
const AnimatedCounter = ({ end, suffix = "", prefix = "", duration = 2000 }: {
  end: number; suffix?: string; prefix?: string; duration?: number;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

/* ── Scroll-reveal wrapper ────────────────────────────── */
const Reveal = ({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ── Stagger container ────────────────────────────────── */
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Landing = () => {
  /* Live "users online" ticker */
  const [liveUsers, setLiveUsers] = useState(47);
  useEffect(() => {
    const t = setInterval(() => setLiveUsers((p) => p + (Math.random() > 0.5 ? 1 : -1)), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* ─── HEADER ─────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="text-xl font-display font-bold tracking-tight text-foreground">
              LegacyBuilder
            </Link>
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-secondary/50 text-foreground data-[state=open]:bg-secondary/50">
                    <Trophy className="w-4 h-4 mr-2 text-gold" /> Athletes
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-3 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-card border border-border rounded-lg shadow-lg">
                      {athleteCategories.map((c) => <ListItem key={c.title} title={c.title} href={c.href}>{c.description}</ListItem>)}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-secondary/50 text-foreground data-[state=open]:bg-secondary/50">
                    <Palette className="w-4 h-4 mr-2 text-gold" /> Artists
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-3 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-card border border-border rounded-lg shadow-lg">
                      {artistCategories.map((c) => <ListItem key={c.title} title={c.title} href={c.href}>{c.description}</ListItem>)}
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

      {/* ─── HERO — Bold, full-bleed, urgency-driven ────── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden">
        {/* Animated gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-background to-background" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gold/5 blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gold/8 blur-[100px]" />

        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-sm font-medium text-foreground">
              <strong className="text-gold">{liveUsers}</strong> athletes & artists building their legacy right now
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.05] tracking-tight text-foreground"
          >
            Don't Let Your Wealth
            <br />
            <span className="text-gradient-gold">Slip Through Your Fingers.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            <strong className="text-foreground">78% of professional athletes go broke within 5 years of retiring.</strong>
            {" "}LegacyBuilder gives you the tools to make sure you're in the other 22%.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button variant="hero" size="xl" asChild className="group">
              <Link to="/auth">
                Secure My Legacy — It's Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <p className="text-xs text-muted-foreground">No credit card required · Setup in 2 minutes</p>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="pt-8"
          >
            <ChevronDown className="w-6 h-6 text-muted-foreground mx-auto animate-bounce" />
          </motion.div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF TICKER ─────────────────────────── */}
      <section className="py-16 px-6 bg-foreground text-background">
        <div className="container max-w-6xl mx-auto">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            <motion.div variants={staggerItem}>
              <p className="text-3xl md:text-4xl font-display font-bold text-gold">
                <AnimatedCounter end={1200} suffix="+" />
              </p>
              <p className="text-sm mt-1 opacity-70">Active Members</p>
            </motion.div>
            <motion.div variants={staggerItem}>
              <p className="text-3xl md:text-4xl font-display font-bold text-gold">
                R<AnimatedCounter end={850} suffix="M" />
              </p>
              <p className="text-sm mt-1 opacity-70">Assets Protected</p>
            </motion.div>
            <motion.div variants={staggerItem}>
              <p className="text-3xl md:text-4xl font-display font-bold text-gold">
                <AnimatedCounter end={98} suffix="%" />
              </p>
              <p className="text-sm mt-1 opacity-70">Client Satisfaction</p>
            </motion.div>
            <motion.div variants={staggerItem}>
              <p className="text-3xl md:text-4xl font-display font-bold text-gold">
                <AnimatedCounter end={24} suffix="/7" />
              </p>
              <p className="text-sm mt-1 opacity-70">Secure Access</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── "THE PROBLEM" — urgency section ─────────────── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-destructive/5 to-background" />
        <div className="container max-w-4xl mx-auto relative text-center space-y-8">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 border border-destructive/20 rounded-full">
              <Clock className="w-4 h-4 text-destructive" />
              <span className="text-sm font-semibold text-destructive">The Clock Is Ticking</span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight">
              Every Day Without a Plan<br />Is a Day Closer to Losing It All.
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="grid sm:grid-cols-3 gap-6 pt-4">
              <ProblemCard emoji="💸" stat="R2.3B" description="Lost by SA athletes to mismanagement every year" />
              <ProblemCard emoji="📄" stat="60%" description="Of artists have no estate plan or will in place" />
              <ProblemCard emoji="⚠️" stat="3 in 5" description="Athletes face financial distress after retirement" />
            </div>
          </Reveal>
          <Reveal delay={0.3}>
            <Button variant="hero" size="lg" asChild className="group mt-4">
              <Link to="/auth">
                Don't Become a Statistic
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* ─── BOLD GOLD FEATURES SECTION ──────────────────── */}
      <section className="py-24 px-6 bg-gold text-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gold-dark/20 rounded-full blur-[100px]" />
        <div className="container max-w-6xl mx-auto relative">
          <Reveal>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/10 rounded-full mb-6">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-bold">Platform Highlights</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">
                Your Entire Career. One Dashboard.
              </h2>
              <p className="text-foreground/70 max-w-xl mx-auto text-lg">
                Everything you need to protect, grow, and pass on your wealth.
              </p>
            </div>
          </Reveal>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            <FeatureCard icon={FileText} title="Contract Manager" description="Track all active contracts, endorsements, and deal values with expiry alerts." />
            <FeatureCard icon={FolderHeart} title="Life File & Estate Planning" description="Organise wills, trusts, beneficiaries, and emergency contacts — share securely." />
            <FeatureCard icon={TrendingUp} title="Investment Tracker" description="Monitor property and franchise investments with ROI calculations." />
            <FeatureCard icon={Bell} title="Smart Reminders" description="Automated alerts for tax deadlines, contract renewals, and compliance." />
            <FeatureCard icon={Share2} title="Secure Sharing" description="Grant time-limited, section-level access to advisors, agents, or family." />
            <FeatureCard icon={Calculator} title="Budget & Cash Flow" description="Monthly budget planner with category breakdowns and spending insights." />
          </motion.div>
        </div>
      </section>

      {/* ─── Celebration Gallery ─────────────────────────── */}
      <section className="py-24 px-6">
        <div className="container max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Celebrating African Excellence
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We champion the success of South Africa's top athletes and artists — on and off the field.
              </p>
            </div>
          </Reveal>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {[
              { src: athletesCelebrating, alt: "African athletes celebrating victory together", caption: "Athletes United in Victory" },
              { src: artistsCelebrating, alt: "African artists and musicians celebrating", caption: "Creative Visionaries Thriving" },
              { src: athleteTrophy, alt: "African athlete holding a gold trophy", caption: "Champions Building Legacies" },
            ].map((img, i) => (
              <motion.div key={i} variants={staggerItem} className="rounded-2xl overflow-hidden shadow-soft group cursor-pointer">
                <div className="overflow-hidden">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 bg-card">
                  <p className="text-sm font-medium text-foreground">{img.caption}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── SERVICES SECTION ────────────────────────────── */}
      <section className="py-24 px-6 bg-secondary/30">
        <div className="container max-w-6xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                Everything You Need to Thrive
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Comprehensive services designed to protect your career, wealth, and legacy.
              </p>
            </div>
          </Reveal>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <ServiceCard icon={Shield} title="Wealth Protection" description="Trust structures for high-net-worth individuals." />
            <ServiceCard icon={FileText} title="Document Vault" description="Store career documents in one secure location." />
            <ServiceCard icon={Users} title="Compliance Support" description="Keep your affairs SARS-compliant." />
            <ServiceCard icon={Lock} title="Financial Products" description="Access vetted advisors and exclusive solutions." />
            <ServiceCard icon={Briefcase} title="Funding Support" description="Apply for funding tailored to your career." />
            <ServiceCard icon={TrendingUp} title="Investment Opportunity" description="Explore vetted property and franchise investments." />
            <ServiceCard icon={FolderHeart} title="Life File" description="Organise essential life documents in one place." />
            <ServiceCard icon={Calculator} title="Budget Calculator" description="Smart allocation tools and spending insights." />
          </motion.div>
        </div>
      </section>

      {/* ─── TESTIMONIAL / SOCIAL PROOF ──────────────────── */}
      <section className="py-24 px-6 bg-foreground text-background relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent" />
        <div className="container max-w-4xl mx-auto relative text-center space-y-10">
          <Reveal>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-6 h-6 fill-gold text-gold" />)}
            </div>
            <blockquote className="text-2xl md:text-3xl font-display font-bold leading-snug">
              "I wish I had this when I started my career. LegacyBuilder gave me
              <span className="text-gold"> control over my finances </span>
              before it was too late."
            </blockquote>
            <p className="text-sm opacity-60 mt-6">— Professional Athlete, Johannesburg</p>
          </Reveal>
        </div>
      </section>

      {/* ─── FOMO CTA ────────────────────────────────────── */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-background to-gold/5" />
        <div className="container max-w-3xl mx-auto relative text-center space-y-6">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full mb-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
              </span>
              <span className="text-sm font-medium text-foreground">Limited Early-Access Spots</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground">
              Your Legacy Won't Build Itself.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Join <strong className="text-foreground">1,200+</strong> athletes and artists who are already protecting their future. The earlier you start, the more you save.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button variant="hero" size="xl" asChild className="group">
                <Link to="/auth">
                  Claim My Spot Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-gold" /> Free to start</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-gold" /> No credit card</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-gold" /> Cancel anytime</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── AGENT CTA ───────────────────────────────────── */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="container max-w-4xl mx-auto text-center space-y-6">
          <Reveal>
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
          </Reveal>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="container max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} LegacyBuilder</span>
          <span className="text-sm text-muted-foreground">Johannesburg, South Africa</span>
        </div>
      </footer>
    </div>
  );
};

/* ── Sub-components ───────────────────────────────────── */

const ProblemCard = ({ emoji, stat, description }: { emoji: string; stat: string; description: string }) => (
  <div className="p-6 rounded-2xl bg-card border border-border/50 text-center space-y-2">
    <span className="text-3xl">{emoji}</span>
    <p className="text-2xl font-display font-bold text-destructive">{stat}</p>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

const FeatureCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <motion.div
    variants={staggerItem}
    className="p-6 rounded-2xl bg-foreground/10 backdrop-blur-sm border border-foreground/10 hover:bg-foreground/15 transition-all duration-300 group cursor-pointer"
  >
    <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
      <Icon className="w-5 h-5" />
    </div>
    <h3 className="text-base font-display font-semibold mb-1.5">{title}</h3>
    <p className="text-sm opacity-70 leading-relaxed">{description}</p>
  </motion.div>
);

const ServiceCard = ({ icon: Icon, title, description }: { icon: React.ElementType; title: string; description: string }) => (
  <motion.div
    variants={staggerItem}
    className="p-6 rounded-2xl bg-card border border-border/50 hover:border-gold/30 transition-all duration-300 hover:shadow-gold group"
  >
    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6 text-gold" />
    </div>
    <h3 className="text-base font-display font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const ListItem = ({ title, href, children }: { title: string; href: string; children: React.ReactNode }) => (
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
        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">{children}</p>
      </Link>
    </NavigationMenuLink>
  </li>
);

export default Landing;
