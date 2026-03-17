import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  Shield, 
  LayoutDashboard, 
  User, 
  Building2, 
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
  Store
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-card border-r border-border p-6 flex flex-col">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="text-lg font-display font-bold text-foreground">
          LegacyBuilder
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            active={location.pathname === item.href}
          />
        ))}
      </nav>

      <div className="border-t border-border pt-4 space-y-1">
        <NavItem icon={Settings} label="Settings" href="/dashboard/settings" />
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-muted-foreground hover:bg-secondary hover:text-foreground w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="flex-1 text-left">Sign Out</span>
        </button>
      </div>

      <div className="mt-4 p-4 bg-secondary rounded-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Athlete</p>
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
}

const NavItem = ({ icon: Icon, label, href, active, badge }: NavItemProps) => (
  <Link
    to={href}
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
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: User, label: "My Profile", href: "/dashboard/profile" },
  { icon: Heart, label: "Life File", href: "/dashboard/life-file" },
  { icon: Building2, label: "Company Journey", href: "/dashboard/journey" },
  { icon: FileCheck, label: "Compliance", href: "/dashboard/compliance", badge: 3 },
  { icon: FolderLock, label: "Documents", href: "/dashboard/documents" },
  { icon: Home, label: "Property Investment", href: "/dashboard/property-investments" },
  { icon: Store, label: "Franchise Investment", href: "/dashboard/franchise-investments" },
  { icon: AtSign, label: "Social Media", href: "/dashboard/social-media" },
  { icon: Share2, label: "Sharing", href: "/dashboard/sharing" },
  { icon: Users, label: "Advisors", href: "/dashboard/advisors" },
  { icon: Mail, label: "Email Log", href: "/dashboard/emails" },
  { icon: Bell, label: "Reminders", href: "/dashboard/reminders", badge: 5 },
];

export default Sidebar;
