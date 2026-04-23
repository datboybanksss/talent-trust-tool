import { Link } from "react-router-dom";
import {
  Briefcase,
  Users,
  ShieldCheck,
  ClipboardList,
  TrendingUp,
  FileSignature,
  Calendar as CalendarIcon,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";

/**
 * Marketing / info page for agents and managers.
 *
 * This was previously an authentication shortcut (`/agent-register`). It is
 * now a public page that explains how the platform works for agencies, with
 * a CTA pointing back to the unified `/auth` flow and `/contact` for sales.
 */

const features = [
  {
    icon: Users,
    title: "One workspace for every client",
    body: "Manage athletes and artists side-by-side. Invite clients with a secure link — they keep ownership of their data, you get the visibility you need to do your job.",
  },
  {
    icon: FileSignature,
    title: "Contracts, endorsements, royalties",
    body: "Track every deal in one pipeline. See what's active, what's expiring, and what's being negotiated — without chasing PDFs across email threads.",
  },
  {
    icon: ClipboardList,
    title: "Document vault with expiry alerts",
    body: "Upload IDs, visas, contracts, tax certificates, medicals. Set 30/60/90-day reminders and never miss a renewal again.",
  },
  {
    icon: TrendingUp,
    title: "Executive overview dashboard",
    body: "High-level portfolio analytics across your full roster — revenue, demographics, contract book value, growth trends — exportable as a PDF.",
  },
  {
    icon: CalendarIcon,
    title: "Shared calendar & meetings",
    body: "Schedule with clients and staff in one place. Everyone sees what's relevant to them and nothing more.",
  },
  {
    icon: Lock,
    title: "Staff access with section-level permissions",
    body: "Bring your team in. Grant per-section access (Pipeline, Clients, Calendar, Documents) so junior staff only see what they need to.",
  },
];

const workflow = [
  {
    step: "01",
    title: "Create your agency workspace",
    body: "Sign up at /auth, then complete a short agency profile — company name, role focus (athletes vs. artists), and contact details.",
  },
  {
    step: "02",
    title: "Invite your clients",
    body: "Send each client a secure activation link. They build their own Life File; you get the access they explicitly grant.",
  },
  {
    step: "03",
    title: "Add your team",
    body: "Invite assistants, paralegals, finance staff. Choose exactly which sections each person can see. Confidentiality is signed in-app.",
  },
  {
    step: "04",
    title: "Run your roster",
    body: "Use the Executive Overview, Pipeline, and Calendar to manage day-to-day. Export reports for client reviews and board meetings.",
  },
];

const AgentsManagers = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-sm font-medium mb-6">
              <Briefcase className="w-4 h-4" />
              For Agents &amp; Managers
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
              Run your agency the way your clients deserve.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              LegacyBuilder is a private workspace for agents and managers
              representing professional athletes and artists. Pipeline, contracts,
              royalties, documents, calendar, and team access — in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">Get started</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Talk to sales</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* What you get */}
        <section className="container py-12 md:py-16 border-t border-border/50">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Built for the way agencies actually work
            </h2>
            <p className="text-muted-foreground">
              Every feature is designed around the daily reality of representing
              high-value talent — not generic CRM workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <Card
                  key={f.title}
                  className="bg-card/60 backdrop-blur-sm border-border hover:border-gold/40 transition-colors"
                >
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.body}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section className="container py-12 md:py-20 border-t border-border/50">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              How it works
            </h2>
            <p className="text-muted-foreground">
              From signup to running your full roster in four steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {workflow.map((w) => (
              <div
                key={w.step}
                className="rounded-xl border border-border bg-card/40 p-6"
              >
                <div className="text-gold font-display text-2xl mb-2">
                  {w.step}
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  {w.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {w.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust */}
        <section className="container py-12 md:py-16 border-t border-border/50">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-2xl border border-gold/20 bg-card/60 backdrop-blur-sm p-8 md:p-10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    POPIA-compliant by design
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Clients own their data. You see only what they share with
                    you. Staff see only the sections you grant them. Every share,
                    export, and access change is logged in an immutable audit
                    trail.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container py-16 md:py-24 border-t border-border/50">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Ready to bring your agency in?
            </h2>
            <p className="text-muted-foreground mb-8">
              Sign up free and complete your agency profile in under five minutes.
              Or book a walkthrough with our team — we'll show you the platform
              against your actual workflow.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="hero" size="lg" asChild>
                <Link to="/auth">Create my agency workspace</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AgentsManagers;