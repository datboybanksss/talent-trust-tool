import { Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="container py-6">
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
            <NavLinks />
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
              <NavLinks mobile />
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

const NavLinks = ({ mobile }: { mobile?: boolean }) => {
  const links = [
    { label: "Services", href: "#services" },
    { label: "For Athletes", href: "#athletes" },
    { label: "For Artists", href: "#artists" },
    { label: "Advisors", href: "#advisors" },
  ];

  return (
    <div className={mobile ? "flex flex-col gap-2" : "flex items-center gap-6"}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={`text-primary-foreground/80 hover:text-gold transition-colors ${
            mobile ? "py-2" : ""
          }`}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
};

export default Header;
