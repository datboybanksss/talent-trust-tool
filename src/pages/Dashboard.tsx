import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useProfile } from "@/hooks/useProfile";
import CurrentTierBadge from "@/components/subscription/CurrentTierBadge";
import StatsCard from "@/components/dashboard/StatsCard";
import PropertyInvestments from "@/components/dashboard/PropertyInvestments";

import FinancialOverview from "@/components/dashboard/FinancialOverview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LayoutDashboard,
  FileCheck, 
  FolderLock, 
  Bell, 
  Calendar,
  Clock,
  Home,
  
  Trophy,
  Palette,
  Music,
  Dumbbell,
  Mic2,
  Target,
  TrendingUp,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { profile, isAthlete, isArtist, clientType } = useProfile();
  const displayName = profile?.display_name || "there";

  const greeting = isAthlete
    ? `Welcome back, ${displayName} 🏆`
    : isArtist
    ? `Welcome back, ${displayName} 🎨`
    : `Welcome back, ${displayName}`;

  const subtitle = isAthlete
    ? "Here's an overview of your athletic career & portfolio"
    : isArtist
    ? "Here's an overview of your creative career & portfolio"
    : "Here's an overview of your portfolio";

  const statsCards = isAthlete ? athleteStats : isArtist ? artistStats : defaultStats;
  const reminders = isAthlete ? athleteReminders : isArtist ? artistReminders : defaultReminders;
  const activities = isAthlete ? athleteActivity : isArtist ? artistActivity : defaultActivity;

  return (
    <DashboardLayout title={greeting} subtitle={subtitle}>
      {/* Subscription Tier */}
      <div className="mb-4">
        <CurrentTierBadge tierType="client" />
      </div>

      {/* Client Type Banner */}
      {clientType && (
        <div className={`rounded-2xl p-4 mb-6 flex items-center gap-4 ${
          isAthlete 
            ? "bg-gradient-to-r from-primary/10 to-gold/10 border border-primary/20" 
            : "bg-gradient-to-r from-accent/10 to-gold/10 border border-accent/20"
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isAthlete ? "bg-primary/20" : "bg-accent/20"
          }`}>
            {isAthlete ? <Trophy className="w-6 h-6 text-primary" /> : <Palette className="w-6 h-6 text-accent-foreground" />}
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {isAthlete ? "Athlete Dashboard" : "Artist Dashboard"}
            </p>
            <p className="text-sm text-muted-foreground">
              {isAthlete
                ? "Tailored for managing contracts, endorsements, and career milestones"
                : "Tailored for managing royalties, creative projects, and brand deals"}
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="property">
            <Home className="w-4 h-4 mr-2" />
            Property Investment Opportunities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statsCards.map((stat, i) => (
              <StatsCard key={i} {...stat} />
            ))}
          </div>

          {/* Financial Overview */}
          <div className="mb-8">
            <FinancialOverview />
          </div>

          {/* Key Focus Areas */}
          {clientType && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {(isAthlete ? athleteFocus : artistFocus).map((item, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border p-5 shadow-soft">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.bgColor}`}>
                      <item.icon className={`w-5 h-5 ${item.iconColor}`} />
                    </div>
                    <p className="font-medium text-foreground text-sm">{item.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upcoming Reminders */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  {isAthlete ? "Career Reminders" : isArtist ? "Creative Deadlines" : "Upcoming Reminders"}
                </h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard/reminders">View All</Link>
                </Button>
              </div>
              <div className="space-y-4">
                {reminders.map((reminder, index) => (
                  <ReminderCard key={index} {...reminder} />
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8 bg-card rounded-2xl border border-border p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/emails">View All Emails</Link>
              </Button>
            </div>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <ActivityCard key={index} {...activity} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="property">
          <PropertyInvestments />
        </TabsContent>

      </Tabs>
    </DashboardLayout>
  );
};

// ── Stats Data ──

const defaultStats = [
  { icon: FileCheck, title: "Compliance Tasks", value: 3, subtitle: "Due this month" },
  { icon: FolderLock, title: "Documents", value: 24, subtitle: "Securely stored" },
  { icon: Bell, title: "Pending Actions", value: 5, subtitle: "Require attention" },
];

const athleteStats = [
  { icon: Target, title: "Active Contracts", value: 3, subtitle: "Endorsements & team deals" },
  { icon: TrendingUp, title: "Career Earnings", value: "R 1.7M", subtitle: "This season" },
  { icon: Bell, title: "Pending Actions", value: 5, subtitle: "Require attention" },
];

const artistStats = [
  { icon: Music, title: "Active Projects", value: 4, subtitle: "Releases & collaborations" },
  { icon: TrendingUp, title: "Royalty Income", value: "R 85K", subtitle: "This quarter" },
  { icon: Bell, title: "Pending Actions", value: 5, subtitle: "Require attention" },
];

// ── Focus Areas ──

const athleteFocus = [
  { icon: Dumbbell, title: "Training Schedule", description: "Manage your training programs and fitness goals", bgColor: "bg-primary/20", iconColor: "text-primary" },
  { icon: Trophy, title: "Endorsements", description: "Track brand deals and sponsorship agreements", bgColor: "bg-gold/20", iconColor: "text-gold" },
  { icon: Shield, title: "Injury Insurance", description: "Monitor your coverage and income protection", bgColor: "bg-info/20", iconColor: "text-info" },
  { icon: Target, title: "Career Transition", description: "Plan for life after professional sport", bgColor: "bg-success/20", iconColor: "text-success" },
];

const artistFocus = [
  { icon: Mic2, title: "Performance Calendar", description: "Track shows, tours, and appearances", bgColor: "bg-accent/20", iconColor: "text-accent-foreground" },
  { icon: Music, title: "Royalty Streams", description: "Monitor SAMRO, streaming, and publishing income", bgColor: "bg-gold/20", iconColor: "text-gold" },
  { icon: Palette, title: "Creative Projects", description: "Manage albums, exhibitions, and releases", bgColor: "bg-info/20", iconColor: "text-info" },
  { icon: TrendingUp, title: "Brand Building", description: "Grow your personal brand and partnerships", bgColor: "bg-success/20", iconColor: "text-success" },
];

// ── Reminders ──

const defaultReminders = [
  { title: "Annual Return Due", date: "Feb 15, 2026", type: "urgent" as const },
  { title: "Tax Return Submission", date: "Feb 28, 2026", type: "warning" as const },
  { title: "Director Meeting", date: "Mar 5, 2026", type: "info" as const },
];

const athleteReminders = [
  { title: "Contract Renewal — Nike", date: "Mar 15, 2026", type: "urgent" as const },
  { title: "Sports Medical Checkup", date: "Feb 28, 2026", type: "warning" as const },
  { title: "Agent Review Meeting", date: "Mar 5, 2026", type: "info" as const },
];

const artistReminders = [
  { title: "Album Release Deadline", date: "Mar 10, 2026", type: "urgent" as const },
  { title: "SAMRO Royalty Filing", date: "Feb 28, 2026", type: "warning" as const },
  { title: "Gallery Exhibition Setup", date: "Mar 5, 2026", type: "info" as const },
];

// ── Activity ──

const defaultActivity = [
  { title: "Registration confirmation email sent", time: "2 hours ago", type: "email" as const },
  { title: "MOI document uploaded", time: "Yesterday", type: "document" as const },
  { title: "Company name approved", time: "2 days ago", type: "success" as const },
];

const athleteActivity = [
  { title: "Nike endorsement contract uploaded", time: "2 hours ago", type: "document" as const },
  { title: "Sports agent invoice processed", time: "Yesterday", type: "email" as const },
  { title: "Team contract renewal confirmed", time: "2 days ago", type: "success" as const },
];

const artistActivity = [
  { title: "Publishing deal terms received", time: "2 hours ago", type: "email" as const },
  { title: "Music catalogue valuation uploaded", time: "Yesterday", type: "document" as const },
  { title: "Gallery commission payment cleared", time: "2 days ago", type: "success" as const },
];

// ── Sub-components ──

interface ReminderCardProps {
  title: string;
  date: string;
  type: "urgent" | "warning" | "info";
}

const ReminderCard = ({ title, date, type }: ReminderCardProps) => (
  <div className="flex items-center gap-4 p-3 bg-secondary/50 rounded-xl">
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        type === "urgent"
          ? "bg-destructive/20 text-destructive"
          : type === "warning"
          ? "bg-warning/20 text-warning"
          : "bg-info/20 text-info"
      }`}
    >
      {type === "urgent" ? <Bell className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
    </div>
    <div className="flex-1">
      <p className="font-medium text-foreground text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
  </div>
);

interface ActivityCardProps {
  title: string;
  time: string;
  type: "email" | "document" | "success";
}

const ActivityCard = ({ title, time, type }: ActivityCardProps) => (
  <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
    <div
      className={`w-2 h-2 rounded-full ${
        type === "email" ? "bg-info" : type === "document" ? "bg-gold" : "bg-success"
      }`}
    />
    <div className="flex-1">
      <p className="text-sm text-foreground">{title}</p>
    </div>
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <Clock className="w-3 h-3" />
      {time}
    </div>
  </div>
);

export default Dashboard;
