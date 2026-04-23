import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowRight, Check, X, Zap, Users, Calendar, Clock, CheckCircle2,
  Shield, Trophy, Palette, HelpCircle
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Animation helpers ────────────────────────────────── */
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

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const staggerItem = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

/* ── User Pricing Data ────────────────────────────────── */
const pricingTiers = [
  {
    name: "Starter",
    badge: "Free Forever",
    priceZAR: 0,
    priceUSD: 0,
    description: "Get started with essential tools to organise your career.",
    features: [
      { text: "Life File (basic)", included: true },
      { text: "3 document uploads", included: true },
      { text: "1 emergency contact", included: true },
      { text: "Community resources", included: true },
      { text: "Contract Manager", included: false },
      { text: "Investment Tracker", included: false },
      { text: "Smart Reminders", included: false },
      { text: "Secure Sharing", included: false },
    ],
    highlight: false,
    cta: "Start Free",
  },
  {
    name: "Pro",
    badge: "Most Popular",
    priceZAR: 499,
    priceUSD: 27,
    description: "Full access for athletes and artists serious about their legacy.",
    features: [
      { text: "Everything in Starter", included: true },
      { text: "Unlimited documents", included: true },
      { text: "Contract Manager", included: true },
      { text: "Smart Reminders & Alerts", included: true },
      { text: "Budget & Cash Flow", included: true },
      { text: "Endorsement Tracker", included: true },
      { text: "Secure Sharing (3 people)", included: true },
      { text: "Priority Support", included: false },
    ],
    highlight: true,
    cta: "Book a Demo",
  },
  {
    name: "Elite",
    badge: "Best Value",
    priceZAR: 1499,
    priceUSD: 79,
    description: "For high-net-worth talent who need comprehensive oversight.",
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Investment Tracker", included: true },
      { text: "Royalty & Revenue Tracking", included: true },
      { text: "Unlimited Secure Sharing", included: true },
      { text: "Creative Portfolio", included: true },
      { text: "PDF Executive Reports", included: true },
      { text: "Priority Support", included: true },
      { text: "Dedicated Account Manager", included: false },
    ],
    highlight: false,
    cta: "Book a Demo",
  },
  {
    name: "Legacy",
    badge: "White Glove",
    priceZAR: 4999,
    priceUSD: 269,
    description: "Full concierge service with dedicated advisory and compliance teams.",
    features: [
      { text: "Everything in Elite", included: true },
      { text: "Dedicated Account Manager", included: true },
      { text: "Quarterly strategy reviews", included: true },
      { text: "Trust & estate advisory", included: true },
      { text: "Offshore structuring support", included: true },
      { text: "Agent portal access", included: true },
      { text: "Custom compliance reports", included: true },
      { text: "VIP onboarding concierge", included: true },
    ],
    highlight: false,
    cta: "Book a Demo",
  },
];

/* ── Agent Pricing Data ───────────────────────────────── */
const agentPricingTiers = [
  {
    name: "Solo Agent",
    badge: "2 Months Free",
    priceZAR: 799,
    priceUSD: 43,
    description: "For independent agents and managers building their client roster.",
    clientLimit: "Up to 10 clients",
    features: [
      { text: "Client invitation & onboarding", included: true },
      { text: "Centralised client profiles", included: true },
      { text: "Document vault per client", included: true },
      { text: "Contract expiry alerts", included: true },
      { text: "Basic deal pipeline", included: true },
      { text: "PDF executive reports", included: false },
      { text: "Staff portal access", included: false },
      { text: "Custom branding", included: false },
    ],
    highlight: false,
    cta: "Book a Demo",
  },
  {
    name: "Agency",
    badge: "Most Popular",
    priceZAR: 2499,
    priceUSD: 135,
    description: "For established agencies managing multiple high-value talents.",
    clientLimit: "Up to 50 clients",
    features: [
      { text: "Everything in Solo Agent", included: true },
      { text: "Unlimited deal pipeline", included: true },
      { text: "PDF executive reports", included: true },
      { text: "Client comparison dashboard", included: true },
      { text: "Staff portal (up to 5 users)", included: true },
      { text: "Confidentiality gate for staff", included: true },
      { text: "Calendar & reminder sync", included: true },
      { text: "Custom branding & white-label", included: false },
    ],
    highlight: true,
    cta: "Book a Demo",
  },
  {
    name: "Association / Guild",
    badge: "Enterprise",
    priceZAR: 7999,
    priceUSD: 429,
    description: "For sports federations, player unions, artist guilds, and governing bodies.",
    clientLimit: "Unlimited members",
    features: [
      { text: "Everything in Agency", included: true },
      { text: "Unlimited staff portal users", included: true },
      { text: "Bulk member onboarding", included: true },
      { text: "Custom branding & white-label", included: true },
      { text: "Compliance audit trail", included: true },
      { text: "API access & integrations", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Quarterly strategy reviews", included: true },
    ],
    highlight: false,
    cta: "Book a Demo",
  },
];

/* ── Page Component ───────────────────────────────────── */
const Pricing = () => {
  const [activeTab, setActiveTab] = useState<"users" | "agents">("users");

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50">
        <div className="container py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-display font-bold tracking-tight text-foreground">
            LegacyBuilder
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
              <Link to="/">Home</Link>
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

      {/* Hero */}
      <section className="pt-32 pb-12 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-background to-background" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-gold/5 blur-[120px]" />
        <div className="relative container max-w-3xl mx-auto space-y-6">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full">
              <Zap className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">Simple, Transparent Pricing</span>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight">
              Choose the Plan That Fits{" "}
              <span className="text-gradient-gold">Your Career Stage.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. Every plan includes a personal demo with our team.
            </p>
          </Reveal>

          {/* Tab Switcher */}
          <Reveal delay={0.3}>
            <div className="inline-flex items-center bg-secondary rounded-xl p-1 gap-1">
              <button
                onClick={() => setActiveTab("users")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                  activeTab === "users"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Trophy className="w-4 h-4" />
                Athletes & Artists
              </button>
              <button
                onClick={() => setActiveTab("agents")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                  activeTab === "agents"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Users className="w-4 h-4" />
                Agents & Managers
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pricing Content */}
      {activeTab === "users" ? <UserPricingSection /> : <AgentPricingSection />}

      {/* FAQ */}
      <FAQSection />

      {/* CTA */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-background to-gold/5" />
        <div className="container max-w-3xl mx-auto relative text-center space-y-6">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
              Ready to Protect Your Legacy?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-lg">
              Join <strong className="text-foreground">1,200+ athletes, artists, and agents</strong> who are already building their legacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Button variant="hero" size="xl" asChild className="group">
                <Link to="/auth">
                  Get Started — It's Free
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

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="container max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} LegacyBuilder</span>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Home</Link>
            <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
          </div>
          <span className="text-sm text-muted-foreground">Johannesburg, South Africa</span>
        </div>
      </footer>
    </div>
  );
};

/* ── User Pricing Section ─────────────────────────────── */
const UserPricingSection = () => {
  const [isInternational, setIsInternational] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz.includes("Africa/Johannesburg") && !tz.includes("Africa/Harare")) {
        setIsInternational(true);
      }
    } catch { /* fallback: show ZAR */ }
  }, []);

  return (
    <section className="pb-16 px-6">
      <div className="container max-w-7xl mx-auto">
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn("text-sm font-medium transition-colors", !isAnnual ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={cn("relative w-14 h-7 rounded-full transition-colors duration-300", isAnnual ? "bg-gold" : "bg-border")}
          >
            <span className={cn("absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-background shadow-md transition-transform duration-300", isAnnual && "translate-x-7")} />
          </button>
          <span className={cn("text-sm font-medium transition-colors", isAnnual ? "text-foreground" : "text-muted-foreground")}>Annual</span>
          {isAnnual && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20">
              Save 20%
            </span>
          )}
        </div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pricingTiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={staggerItem}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6 transition-all duration-300",
                tier.highlight ? "bg-card border-gold shadow-gold scale-[1.02] lg:scale-105" : "bg-card border-border/50 hover:border-gold/30"
              )}
            >
              <div className={cn("inline-flex self-start items-center px-3 py-1 rounded-full text-xs font-semibold mb-4", tier.highlight ? "bg-gold text-foreground" : "bg-secondary text-muted-foreground")}>
                {tier.badge}
              </div>
              <h3 className="text-xl font-display font-bold text-foreground">{tier.name}</h3>
              <div className="mt-3 mb-1">
                {tier.priceZAR === 0 ? (
                  <span className="text-3xl font-display font-bold text-foreground">Free</span>
                ) : isAnnual ? (
                  <>
                    <span className="text-sm text-muted-foreground line-through mr-2">R{tier.priceZAR.toLocaleString()}</span>
                    <span className="text-3xl font-display font-bold text-foreground">R{Math.round(tier.priceZAR * 0.8).toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-display font-bold text-foreground">R{tier.priceZAR.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </>
                )}
              </div>
              {isInternational && tier.priceUSD > 0 && (
                <p className="text-xs text-muted-foreground mb-1">≈ ${isAnnual ? Math.round(tier.priceUSD * 0.8) : tier.priceUSD}/month USD</p>
              )}
              {isAnnual && tier.priceZAR > 0 && (
                <p className="text-xs text-muted-foreground mb-1">Billed R{Math.round(tier.priceZAR * 0.8 * 12).toLocaleString()}/year</p>
              )}
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{tier.description}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {f.included ? <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" /> : <X className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground/50"}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button variant={tier.highlight ? "hero" : tier.priceZAR === 0 ? "gold" : "outline"} size="lg" asChild className="w-full group">
                <Link to="/auth">
                  <Calendar className="w-4 h-4 mr-1" />
                  {tier.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <Reveal delay={0.3}>
          <p className="text-center text-xs text-muted-foreground mt-8">
            All prices in South African Rands (ZAR). Annual billing available at 20% discount. VAT inclusive.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* ── Agent Pricing Section ────────────────────────────── */
const AgentPricingSection = () => {
  const [isInternational, setIsInternational] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (!tz.includes("Africa/Johannesburg") && !tz.includes("Africa/Harare")) {
        setIsInternational(true);
      }
    } catch { /* fallback */ }
  }, []);

  return (
    <section className="pb-16 px-6">
      <div className="container max-w-6xl mx-auto">
        <Reveal>
          <div className="text-center mb-8">
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Every plan includes a <strong className="text-foreground">free 2-month trial</strong> — no credit card, no commitment.
            </p>
          </div>
        </Reveal>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn("text-sm font-medium transition-colors", !isAnnual ? "text-foreground" : "text-muted-foreground")}>Monthly</span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className={cn("relative w-14 h-7 rounded-full transition-colors duration-300", isAnnual ? "bg-gold" : "bg-border")}
          >
            <span className={cn("absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-background shadow-md transition-transform duration-300", isAnnual && "translate-x-7")} />
          </button>
          <span className={cn("text-sm font-medium transition-colors", isAnnual ? "text-foreground" : "text-muted-foreground")}>Annual</span>
          {isAnnual && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold/10 text-gold border border-gold/20">
              Save 20%
            </span>
          )}
        </div>

        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
          {agentPricingTiers.map((tier) => (
            <motion.div
              key={tier.name}
              variants={staggerItem}
              className={cn(
                "relative flex flex-col rounded-2xl border p-7 transition-all duration-300",
                tier.highlight ? "bg-card border-gold shadow-gold scale-[1.02] lg:scale-105" : "bg-card border-border/50 hover:border-gold/30"
              )}
            >
              <div className={cn("inline-flex self-start items-center px-3 py-1 rounded-full text-xs font-semibold mb-4", tier.highlight ? "bg-gold text-foreground" : "bg-secondary text-muted-foreground")}>
                {tier.badge}
              </div>
              <h3 className="text-xl font-display font-bold text-foreground">{tier.name}</h3>
              <div className="mt-3 mb-1">
                {isAnnual ? (
                  <>
                    <span className="text-sm text-muted-foreground line-through mr-2">R{tier.priceZAR.toLocaleString()}</span>
                    <span className="text-3xl font-display font-bold text-foreground">R{Math.round(tier.priceZAR * 0.8).toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-display font-bold text-foreground">R{tier.priceZAR.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </>
                )}
              </div>
              {isInternational && (
                <p className="text-xs text-muted-foreground mb-1">≈ ${isAnnual ? Math.round(tier.priceUSD * 0.8) : tier.priceUSD}/month USD</p>
              )}
              {isAnnual && (
                <p className="text-xs text-muted-foreground mb-1">Billed R{Math.round(tier.priceZAR * 0.8 * 12).toLocaleString()}/year</p>
              )}
              <p className="text-xs font-semibold text-gold mb-3">First 2 months free</p>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border/30 mb-5">
                <Users className="w-4 h-4 text-gold shrink-0" />
                <span className="text-sm font-medium text-foreground">{tier.clientLimit}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">{tier.description}</p>
              <ul className="space-y-2.5 mb-8 flex-1">
                {tier.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    {f.included ? <Check className="w-4 h-4 text-gold shrink-0 mt-0.5" /> : <X className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground/50"}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button variant={tier.highlight ? "hero" : "outline"} size="lg" asChild className="w-full group">
                <Link to="/auth">
                  <Calendar className="w-4 h-4 mr-1" />
                  {tier.cta}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <Reveal delay={0.3}>
          <p className="text-center text-xs text-muted-foreground mt-8">
            All prices in South African Rands (ZAR). Annual billing available at 20% discount. VAT inclusive. Free trial requires no payment details.
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* ── FAQ Section ───────────────────────────────────────── */
const faqItems = [
  {
    question: "Is LegacyBuilder really free to start?",
    answer: "Yes! The Starter plan is free forever — no credit card required. You get access to the Life File, 3 document uploads, and 1 emergency contact. Upgrade only when you need more features.",
  },
  {
    question: "How does the 2-month free trial work for agents?",
    answer: "All agent and manager plans include a full 2-month free trial with no payment details required upfront. You get access to every feature in your chosen tier. Billing only begins after the trial period ends.",
  },
  {
    question: "Can I switch plans at any time?",
    answer: "Absolutely. You can upgrade or downgrade your plan at any time from your dashboard. When upgrading, you'll get immediate access to the new features. When downgrading, the change takes effect at the end of your current billing cycle.",
  },
  {
    question: "What's the difference between monthly and annual billing?",
    answer: "Annual billing gives you a 20% discount on all paid plans. For example, the Pro plan drops from R499/month to R399/month when billed annually. You can switch between billing cycles at renewal time.",
  },
  {
    question: "What happens to my data if I downgrade or cancel?",
    answer: "Your data is always yours. If you downgrade, any features above your new tier become read-only — nothing is deleted. If you cancel entirely, you have 90 days to export your data before it's permanently removed.",
  },
  {
    question: "Do you offer special pricing for sports federations or artist guilds?",
    answer: "Yes! The Association / Guild plan is designed specifically for governing bodies, player unions, and creative guilds. It includes unlimited members, custom branding, bulk onboarding, and a dedicated account manager. Contact us for custom enterprise pricing.",
  },
  {
    question: "Is my financial data secure?",
    answer: "Absolutely. LegacyBuilder uses bank-level encryption (AES-256), secure cloud infrastructure, and role-based access controls. Your data is never shared with third parties. We also support granular, time-limited sharing so you control exactly who sees what.",
  },
  {
    question: "What currencies are supported?",
    answer: "All pricing is in South African Rands (ZAR). If you're visiting from outside South Africa, we also display approximate USD equivalents for your convenience. The platform supports multi-currency tracking for international athletes and artists.",
  },
];

const FAQSection = () => (
  <section className="py-24 px-6 bg-secondary/20">
    <div className="container max-w-3xl mx-auto">
      <Reveal>
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full mb-6">
            <HelpCircle className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-gold">Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Got Questions? We've Got Answers.
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about plans, billing, and getting started.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <Accordion type="single" collapsible className="space-y-3">
          {faqItems.map((item, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="bg-card border border-border/50 rounded-xl px-6 data-[state=open]:border-gold/30 data-[state=open]:shadow-sm transition-all duration-300"
            >
              <AccordionTrigger className="text-left font-medium text-foreground hover:text-gold hover:no-underline py-5">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>

      <Reveal delay={0.2}>
        <p className="text-center text-sm text-muted-foreground mt-10">
          Still have questions?{" "}
          <Link to="/auth" className="text-gold hover:underline font-medium">
            Get in touch with our team
          </Link>
        </p>
      </Reveal>
    </div>
  </section>
);

export default Pricing;
