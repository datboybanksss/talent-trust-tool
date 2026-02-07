import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Globe, Users, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const VIPOnboarding = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<{ location?: string; goal?: string }>({});

  const handleAnswer = (key: 'location' | 'goal', value: string) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    if (step < 2) {
      setTimeout(() => setStep(step + 1), 300);
    }
  };

  return (
    <section className="py-24 bg-gradient-premium relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald/5 rounded-full blur-3xl" />
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-gold">VIP Concierge</span>
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Your Journey Starts <span className="text-gradient-gold">Here</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Two quick questions to personalize your legacy-building experience.
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step
                    ? 'w-8 bg-gold'
                    : i < step
                    ? 'w-4 bg-gold/50'
                    : 'w-4 bg-secondary'
                }`}
              />
            ))}
          </div>

          {/* Questions */}
          <div className="relative min-h-[300px]">
            {/* Step 1: Location */}
            <div className={`absolute inset-0 transition-all duration-500 ${
              step === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full pointer-events-none'
            }`}>
              <div className="text-center mb-8">
                <Globe className="w-12 h-12 text-gold mx-auto mb-4" />
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  Where are you performing most?
                </h3>
                <p className="text-muted-foreground">This helps us optimize your tax and currency strategy</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                {locationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer('location', option.value)}
                    className={`p-6 rounded-2xl border transition-all duration-300 text-left ${
                      answers.location === option.value
                        ? 'bg-gold/10 border-gold'
                        : 'bg-card border-border hover:border-gold/30'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.emoji}</div>
                    <div className="font-semibold text-foreground">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Goal */}
            <div className={`absolute inset-0 transition-all duration-500 ${
              step === 1 ? 'opacity-100 translate-x-0' : step < 1 ? 'opacity-0 translate-x-full pointer-events-none' : 'opacity-0 -translate-x-full pointer-events-none'
            }`}>
              <div className="text-center mb-8">
                <Shield className="w-12 h-12 text-gold mx-auto mb-4" />
                <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                  What's your primary goal?
                </h3>
                <p className="text-muted-foreground">We'll prioritize features that matter most to you</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {goalOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer('goal', option.value)}
                    className={`p-6 rounded-2xl border transition-all duration-300 text-left ${
                      answers.goal === option.value
                        ? 'bg-gold/10 border-gold'
                        : 'bg-card border-border hover:border-gold/30'
                    }`}
                  >
                    <option.icon className="w-8 h-8 text-gold mb-3" />
                    <div className="font-semibold text-foreground">{option.label}</div>
                    <div className="text-sm text-muted-foreground">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Summary */}
            <div className={`absolute inset-0 transition-all duration-500 ${
              step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
            }`}>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-gold" />
                </div>
                <h3 className="text-2xl font-display font-bold text-foreground mb-4">
                  Your Personalized Path is Ready
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Based on your profile, we've prepared a tailored experience focused on 
                  {answers.goal === 'family' ? ' protecting your family\'s future' : ' expanding your global presence'} 
                  {answers.location === 'local' ? ' within South Africa' : answers.location === 'international' ? ' across international markets' : ' with a balanced approach'}.
                </p>
                <Button variant="hero" size="xl" asChild className="group">
                  <Link to="/auth">
                    Begin Your Legacy Journey
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const locationOptions = [
  {
    value: 'local',
    emoji: '🇿🇦',
    label: 'Mostly South Africa',
    description: 'Focus on local compliance',
  },
  {
    value: 'international',
    emoji: '🌍',
    label: 'Mostly International',
    description: 'Multi-currency focus',
  },
  {
    value: 'mixed',
    emoji: '✈️',
    label: 'Both Equally',
    description: 'Balanced strategy',
  },
];

const goalOptions = [
  {
    value: 'family',
    icon: Users,
    label: 'Protecting Family',
    description: 'Sustainable support structures and generational wealth',
  },
  {
    value: 'expansion',
    icon: Globe,
    label: 'Global Expansion',
    description: 'International asset protection and mobility',
  },
];

export default VIPOnboarding;
