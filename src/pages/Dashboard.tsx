import DashboardLayout from "@/components/dashboard/DashboardLayout";

import StatsCard from "@/components/dashboard/StatsCard";
import PropertyInvestments from "@/components/dashboard/PropertyInvestments";
import FranchiseInvestments from "@/components/dashboard/FranchiseInvestments";
import FinancialOverview from "@/components/dashboard/FinancialOverview";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileCheck, 
  FolderLock, 
  Bell, 
  Calendar,
  Clock,
  Home,
  Store,
  Landmark
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <DashboardLayout 
      title="Welcome back, John" 
      subtitle="Here's an overview of your portfolio"
    >
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">
            <Building2 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="property">
            <Home className="w-4 h-4 mr-2" />
            Property Investment Opportunities
          </TabsTrigger>
          <TabsTrigger value="franchise">
            <Store className="w-4 h-4 mr-2" />
            Franchise Investment Opportunities
          </TabsTrigger>
          <TabsTrigger value="financial">
            <Landmark className="w-4 h-4 mr-2" />
            Financial Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatsCard
          icon={FileCheck}
          title="Compliance Tasks"
          value={3}
          subtitle="Due this month"
        />
        <StatsCard
          icon={FolderLock}
          title="Documents"
          value={24}
          subtitle="Securely stored"
        />
        <StatsCard
          icon={Bell}
          title="Pending Actions"
          value={5}
          subtitle="Require attention"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upcoming Reminders */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Upcoming Reminders</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/reminders">View All</Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            {upcomingReminders.map((reminder, index) => (
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
          {recentActivity.map((activity, index) => (
            <ActivityCard key={index} {...activity} />
          ))}
        </div>
      </div>
        </TabsContent>

        <TabsContent value="property">
          <PropertyInvestments />
        </TabsContent>

        <TabsContent value="franchise">
          <FranchiseInvestments />
        </TabsContent>

        <TabsContent value="financial">
          <FinancialOverview />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};


const upcomingReminders = [
  {
    title: "Annual Return Due",
    date: "Feb 15, 2026",
    type: "urgent" as const,
  },
  {
    title: "Tax Return Submission",
    date: "Feb 28, 2026",
    type: "warning" as const,
  },
  {
    title: "Director Meeting",
    date: "Mar 5, 2026",
    type: "info" as const,
  },
];

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
      {type === "urgent" ? (
        <Bell className="w-5 h-5" />
      ) : (
        <Calendar className="w-5 h-5" />
      )}
    </div>
    <div className="flex-1">
      <p className="font-medium text-foreground text-sm">{title}</p>
      <p className="text-xs text-muted-foreground">{date}</p>
    </div>
  </div>
);

const recentActivity = [
  {
    title: "Registration confirmation email sent",
    time: "2 hours ago",
    type: "email" as const,
  },
  {
    title: "MOI document uploaded",
    time: "Yesterday",
    type: "document" as const,
  },
  {
    title: "Company name approved",
    time: "2 days ago",
    type: "success" as const,
  },
];

interface ActivityCardProps {
  title: string;
  time: string;
  type: "email" | "document" | "success";
}

const ActivityCard = ({ title, time, type }: ActivityCardProps) => (
  <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
    <div
      className={`w-2 h-2 rounded-full ${
        type === "email"
          ? "bg-info"
          : type === "document"
          ? "bg-gold"
          : "bg-success"
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
