import { Quote } from "lucide-react";

const SocialProof = () => {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-emerald/5 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Quote icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 mb-8">
            <Quote className="w-8 h-8 text-gold" />
          </div>
          
          {/* Main quote */}
          <blockquote className="text-2xl md:text-3xl lg:text-4xl font-display font-medium text-foreground leading-relaxed mb-8">
            "The career is temporary.{" "}
            <span className="text-gradient-gold">The business you build around it shouldn't be.</span>"
          </blockquote>
          
          {/* Decorative line */}
          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-8" />
          
          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-8 mt-16">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const stats = [
  { value: "R2.1B+", label: "Assets Under Protection" },
  { value: "500+", label: "Elite Clients Served" },
  { value: "15+", label: "Years of Excellence" },
];

export default SocialProof;
