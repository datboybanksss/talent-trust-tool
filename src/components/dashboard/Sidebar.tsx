import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { 
  Shield, 
  ShieldCheck,
  LayoutDashboard, 
  User, 
  FileCheck, 
  FolderLock, 
  Users, 
  Mail, 
  Bell,
  Settings,
  LogOut,
  Share2,
  AtSign,
  Heart,
  Home,
  CircleDollarSign,
  Plug,
  FileSpreadsheet,
  Calculator,
  Trophy,
  Palette,
  FileText,
  Handshake,
  Music,
  Brush,
  PlayCircle
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { TOUR_TARGETS } from "@/components/tour/tourTargets";
import { useGuidedTour } from "@/components/tour/useGuidedTour";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { profile, isAthlete, isArtist } = useProfile();
  const { start, canReplay } = useGuidedTour();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();
  const clientLabel = isAthlete ? "Athlete" : isArtist ? "Artist" : "Member";

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-6 flex flex-col">
      <Link to="/" className="flex items-center gap-2 mb-8" data-tour={TOUR_TARGETS.CLIENT_BRAND}>
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-display font-bold text-foreground">
          LegacyBuilder
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={location.pathname === item.href}
          />
        ))}
        {isAthlete && athleteNavItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={location.pathname === item.href}
          />
        ))}
        {isArtist && artistNavItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={location.pathname === item.href}
          />
        ))}
      </nav>

      <div className="border-t border-border pt-4 space-y-1">
        {canReplay && (
          <button
            data-tour={TOUR_TARGETS.CLIENT_TOUR_REPLAY}
            onClick={() => void start()}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground w-full"
          >
            <PlayCircle className="w-5 h-5" />
            <span className="flex-1 text-left">Take the tour</span>
          </button>
        )}
        <NavItem icon={Settings} label="Settings" href="/dashboard/settings" />
        <button
          onClick={handleSignOut}
          data-tour={TOUR_TARGETS.CLIENT_NAV_SIGNOUT}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="flex-1 text-left">Sign Out</span>
        </button>
      </div>

      <div className="mt-4 p-4 bg-secondary rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">{displayName}</p>
            <div className="flex items-center gap-1">
              {isAthlete && <Trophy className="w-3 h-3 text-gold" />}
              {isArtist && <Palette className="w-3 h-3 text-gold" />}
              <p className="text-xs text-muted-foreground truncate">{clientLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
  dataTour?: string;
}

const NavItem = ({ icon: Icon, label, href, active, badge, dataTour }: NavItemProps) => (
  <Link
    to={href}
    data-tour={dataTour}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
      active
        ? "bg-primary text-primary-foreground"
        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
    )}
  >
    <Icon className="w-5 h-5" />
    <span className="flex-1">{label}</span>
    {badge && (
      <span className="px-2 py-0.5 bg-gold text-forest-dark text-xs font-semibold rounded-full">
        {badge}
      </span>
    )}
  </Link>
);

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", dataTour: TOUR_TARGETS.CLIENT_NAV_DASHBOARD },
  { icon: User, label: "My Profile", href: "/dashboard/profile" },
  { icon: AtSign, label: "My Social Media Links", href: "/dashboard/social-media" },
  { icon: Heart, label: "My Life File", href: "/dashboard/life-file", dataTour: TOUR_TARGETS.CLIENT_NAV_LIFE_FILE },
  { icon: Users, label: "My Advisors", href: "/dashboard/advisors", dataTour: TOUR_TARGETS.CLIENT_NAV_ADVISORS },
  { icon: FileCheck, label: "My Compliance Reminders", href: "/dashboard/compliance", badge: 3, dataTour: TOUR_TARGETS.CLIENT_NAV_COMPLIANCE },
  { icon: CircleDollarSign, label: "My Monthly Budget", href: "/dashboard/budget" },

  { icon: FolderLock, label: "My Important Documents", href: "/dashboard/documents" },
  { icon: Home, label: "Property Investment Opportunities", href: "/dashboard/property-investments" },

  { icon: FileSpreadsheet, label: "Apply for Funding", href: "/dashboard/apply-for-funding" },
  { icon: Calculator, label: "Financial Calculators", href: "/dashboard/estate-calculator" },
  { icon: Mail, label: "Email Log", href: "/dashboard/emails" },
  { icon: Share2, label: "Sharing", href: "/dashboard/sharing", dataTour: TOUR_TARGETS.CLIENT_NAV_SHARING },
  { icon: ShieldCheck, label: "Guardian & Minor Protection", href: "/dashboard/guardian" },
  { icon: Plug, label: "Financial Integrations", href: "/dashboard/integrations" },
  { icon: Bell, label: "Reminders", href: "/dashboard/reminders", badge: 5 },
];

const athleteNavItems = [
  { icon: FileText, label: "Contract Manager", href: "/dashboard/contracts", dataTour: TOUR_TARGETS.CLIENT_NAV_CONTRACTS },
  { icon: Handshake, label: "Endorsement Tracker", href: "/dashboard/endorsements", dataTour: TOUR_TARGETS.CLIENT_NAV_ENDORSEMENTS },
];

const artistNavItems = [
  { icon: Music, label: "Royalty Tracker", href: "/dashboard/royalties", dataTour: TOUR_TARGETS.CLIENT_NAV_ROYALTIES },
  { icon: Brush, label: "Creative Portfolio", href: "/dashboard/creative-portfolio", dataTour: TOUR_TARGETS.CLIENT_NAV_CREATIVE },
];

export default Sidebar;
