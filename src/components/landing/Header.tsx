import { Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container py-4">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold to-gold-dark rounded-xl flex items-center justify-center shadow-gold">
              <Shield className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xl font-display font-bold text-foreground">
                LegacyBuilder
              </span>
              <p className="text-xs text-muted-foreground -mt-0.5">For Elite Performers</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLinks />
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-foreground hover:bg-secondary" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button variant="hero" asChild>
                <Link to="/auth">Secure My Legacy</Link>
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground p-2 hover:bg-secondary rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-card/95 backdrop-blur-lg rounded-2xl border border-border animate-scale-in">
            <div className="flex flex-col gap-4">
              <NavLinks mobile />
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" className="text-foreground justify-start" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/auth">Secure My Legacy</Link>
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
    { label: "The Pillars", href: "#pillars" },
    { label: "The Fortress", href: "#fortress" },
    { label: "Knowledge Base", href: "#knowledge" },
    { label: "Get Started", href: "#onboarding" },
  ];

  return (
    <div className={mobile ? "flex flex-col gap-2" : "flex items-center gap-6"}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={`text-muted-foreground hover:text-gold transition-colors text-sm font-medium ${
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
