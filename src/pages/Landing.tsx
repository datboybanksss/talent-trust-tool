import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import ClientTypes from "@/components/landing/ClientTypes";
import Footer from "@/components/landing/Footer";

const Landing = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <ClientTypes />
      <Footer />
    </div>
  );
};

export default Landing;
