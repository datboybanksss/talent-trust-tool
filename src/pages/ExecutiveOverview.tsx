import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminRole } from "@/hooks/useAdminRole";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Lock } from "lucide-react";
import ExecutiveKPICards from "@/components/executive/ExecutiveKPICards";
import BookValueSection from "@/components/executive/BookValueSection";
import RevenueAnalytics from "@/components/executive/RevenueAnalytics";
import DemographicsSection from "@/components/executive/DemographicsSection";
import OverheadSection from "@/components/executive/OverheadSection";
import ExecutiveFilters from "@/components/executive/ExecutiveFilters";

const ExecutiveOverview = () => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useAdminRole();
  const navigate = useNavigate();

  const [dateRange, setDateRange] = useState("ytd");
  const [clientType, setClientType] = useState("all");
  const [businessUnit, setBusinessUnit] = useState("all");

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <h2 className="text-xl font-display font-bold">Executive Access Only</h2>
        <p className="text-muted-foreground text-sm">This dashboard is restricted to authorised executives.</p>
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-6 py-4">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")} className="shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              <div>
                <h1 className="text-xl font-display font-bold text-foreground">Executive Overview</h1>
                <p className="text-xs text-muted-foreground">Board-ready company performance snapshot</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">
        {/* Filters */}
        <ExecutiveFilters
          dateRange={dateRange}
          setDateRange={setDateRange}
          clientType={clientType}
          setClientType={setClientType}
          businessUnit={businessUnit}
          setBusinessUnit={setBusinessUnit}
        />

        {/* KPIs */}
        <ExecutiveKPICards />

        {/* Tabbed Sections */}
        <Tabs defaultValue="book-value" className="space-y-4">
          <TabsList className="bg-muted/60">
            <TabsTrigger value="book-value">Book Value</TabsTrigger>
            <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="overhead">Overhead & Costs</TabsTrigger>
          </TabsList>

          <TabsContent value="book-value">
            <BookValueSection />
          </TabsContent>
          <TabsContent value="revenue">
            <RevenueAnalytics />
          </TabsContent>
          <TabsContent value="demographics">
            <DemographicsSection />
          </TabsContent>
          <TabsContent value="overhead">
            <OverheadSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExecutiveOverview;
