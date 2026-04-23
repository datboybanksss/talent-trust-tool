import { Shield, Menu, X, Trophy, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

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

interface ListItemProps {
  title: string;
  href: string;
  children: React.ReactNode;
}

const ListItem = ({ title, href, children }: ListItemProps) => (
  <li>
    <NavigationMenuLink asChild>
      <Link
        to={href}
        className={cn(
          "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none",
          "transition-all duration-200 ease-out",
          "hover:bg-secondary hover:text-foreground hover:translate-x-1 hover:shadow-sm",
          "focus:bg-secondary focus:text-foreground"
        )}
      >
        <div className="text-sm font-medium leading-none text-foreground">{title}</div>
        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground mt-1">
          {children}
        </p>
      </Link>
    </NavigationMenuLink>
  </li>
);

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container py-4">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-8">
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

            {/* Desktop Navigation Menu */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                {/* Athletes Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-secondary/50 text-foreground data-[state=open]:bg-secondary/50 transition-all duration-200">
                    <Trophy className="w-4 h-4 mr-2 text-gold transition-transform duration-200 group-hover:scale-110" />
                    Athletes
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-3 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-card border border-border rounded-lg shadow-gold animate-fade-in">
                      {athleteCategories.map((category, i) => (
                        <ListItem
                          key={category.title}
                          title={category.title}
                          href={category.href}
                        >
                          {category.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Artists Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-secondary/50 text-foreground data-[state=open]:bg-secondary/50 transition-all duration-200">
                    <Palette className="w-4 h-4 mr-2 text-gold transition-transform duration-200 group-hover:scale-110" />
                    Artists
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-3 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-card border border-border rounded-lg shadow-gold animate-fade-in">
                      {artistCategories.map((category, i) => (
                        <ListItem
                          key={category.title}
                          title={category.title}
                          href={category.href}
                        >
                          {category.description}
                        </ListItem>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="text-foreground hover:bg-secondary" asChild>
              <Link to="/for-agents">Agents &amp; Managers</Link>
            </Button>
            <Button variant="ghost" className="text-foreground hover:bg-secondary" asChild>
              <Link to="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" className="text-foreground hover:bg-secondary" asChild>
              <Link to="/contact">Contact</Link>
            </Button>
            <Button variant="ghost" className="text-foreground hover:bg-secondary" asChild>
              <Link to="/auth">Sign In</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/auth">Secure My Legacy</Link>
            </Button>
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
              {/* Athletes Section */}
              <div>
                <div className="flex items-center gap-2 text-gold font-medium mb-2">
                  <Trophy className="w-4 h-4" />
                  Athletes
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {athleteCategories.map((category) => (
                    <Link
                      key={category.href}
                      to={category.href}
                      className="text-sm text-muted-foreground hover:text-foreground py-1.5 px-2 rounded hover:bg-secondary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.title}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Artists Section */}
              <div>
                <div className="flex items-center gap-2 text-gold font-medium mb-2">
                  <Palette className="w-4 h-4" />
                  Artists
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {artistCategories.map((category) => (
                    <Link
                      key={category.href}
                      to={category.href}
                      className="text-sm text-muted-foreground hover:text-foreground py-1.5 px-2 rounded hover:bg-secondary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {category.title}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" className="text-foreground justify-start" asChild>
                  <Link to="/for-agents" onClick={() => setMobileMenuOpen(false)}>Agents &amp; Managers</Link>
                </Button>
                <Button variant="ghost" className="text-foreground justify-start" asChild>
                  <Link to="/pricing" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
                </Button>
                <Button variant="ghost" className="text-foreground justify-start" asChild>
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
                </Button>
                <Button variant="ghost" className="text-foreground justify-start" asChild>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>Secure My Legacy</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
