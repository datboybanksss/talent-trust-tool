import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import TheShift from "@/components/landing/TheShift";
import ThePillars from "@/components/landing/ThePillars";
import SocialProof from "@/components/landing/SocialProof";
import TheFortress from "@/components/landing/TheFortress";
import KnowledgeBase from "@/components/landing/KnowledgeBase";
import VIPOnboarding from "@/components/landing/VIPOnboarding";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <TheShift />
      <section id="pillars">
        <ThePillars />
      </section>
      <SocialProof />
      <section id="fortress">
        <TheFortress />
      </section>
      <section id="knowledge">
        <KnowledgeBase />
      </section>
      <section id="onboarding">
        <VIPOnboarding />
      </section>
      <Footer />
    </div>
  );
};

export default Landing;
