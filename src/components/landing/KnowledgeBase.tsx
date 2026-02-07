import { Button } from "@/components/ui/button";
import { Trophy, Palette, ArrowRight, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const KnowledgeBase = () => {
  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--gold)) 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />
      
      <div className="container relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-gold font-medium text-sm tracking-wider uppercase">
            Education & Resources
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mt-4 mb-6">
            Knowledge is <span className="text-gradient-gold">Power</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Tailored learning paths designed for the unique challenges of elite performers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* The Playbook - Athletes */}
          <div className="group p-8 rounded-3xl bg-background border border-border hover:border-gold/30 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full blur-2xl group-hover:bg-gold/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-gold" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-foreground">The Playbook</h3>
                  <p className="text-muted-foreground">For Athletes</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">
                Strategic guides for sports professionals navigating endorsements, 
                international earnings, and career transition planning.
              </p>
              
              <ul className="space-y-3 mb-8">
                {athleteTopics.map((topic, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                    <BookOpen className="w-4 h-4 text-gold" />
                    {topic}
                  </li>
                ))}
              </ul>
              
              <Button variant="heroOutline" className="w-full group/btn" asChild>
                <Link to="/auth">
                  Access The Playbook
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>

          {/* The Masterclass - Artists */}
          <div className="group p-8 rounded-3xl bg-background border border-border hover:border-gold/30 transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald/5 rounded-full blur-2xl group-hover:bg-emerald/10 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald/10 flex items-center justify-center">
                  <Palette className="w-7 h-7 text-emerald-light" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-foreground">The Masterclass</h3>
                  <p className="text-muted-foreground">For Artists</p>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">
                In-depth courses on royalty management, IP protection, 
                and building sustainable wealth from creative work.
              </p>
              
              <ul className="space-y-3 mb-8">
                {artistTopics.map((topic, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-foreground/80">
                    <BookOpen className="w-4 h-4 text-emerald-light" />
                    {topic}
                  </li>
                ))}
              </ul>
              
              <Button variant="heroOutline" className="w-full group/btn" asChild>
                <Link to="/auth">
                  Access The Masterclass
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const athleteTopics = [
  "Structuring endorsement deals",
  "International tour tax planning",
  "Post-career wealth transition",
  "Brand protection strategies",
];

const artistTopics = [
  "Royalty collection optimization",
  "Intellectual property trusts",
  "Label & publisher negotiations",
  "Catalog monetization",
];

export default KnowledgeBase;
