import { useState, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExecutiveKPICards from "@/components/executive/ExecutiveKPICards";
import BookValueSection from "@/components/executive/BookValueSection";
import RevenueAnalytics from "@/components/executive/RevenueAnalytics";
import DemographicsSection from "@/components/executive/DemographicsSection";
import OverheadSection from "@/components/executive/OverheadSection";
import ExecutiveFilters from "@/components/executive/ExecutiveFilters";
import DrillDownSheet from "@/components/executive/DrillDownSheet";
import { generateExecutiveOverviewPDF } from "@/utils/executiveOverviewPdf";
import { DrillDownFilter } from "@/data/executiveDrillDownData";
import { Crown } from "lucide-react";

const ExecutiveOverviewInline = () => {
  const [dateRange, setDateRange] = useState("ytd");
  const [clientType, setClientType] = useState("all");
  const [businessUnit, setBusinessUnit] = useState("all");
  const [manager, setManager] = useState("all");

  const filters = useMemo(() => ({ dateRange, clientType, businessUnit, manager }), [dateRange, clientType, businessUnit, manager]);

  const [drillFilter, setDrillFilter] = useState<DrillDownFilter | null>(null);
  const [drillOpen, setDrillOpen] = useState(false);

  const handleSegmentClick = useCallback((category: string, segment: string) => {
    setDrillFilter({ category, segment });
    setDrillOpen(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Crown className="w-5 h-5 text-primary" />
        <div>
          <h2 className="text-xl font-display font-bold text-foreground">Executive Overview</h2>
          <p className="text-xs text-muted-foreground">Board-ready company performance snapshot</p>
        </div>
      </div>

      {/* Filters */}
      <ExecutiveFilters
        dateRange={dateRange}
        setDateRange={setDateRange}
        clientType={clientType}
        setClientType={setClientType}
        businessUnit={businessUnit}
        setBusinessUnit={setBusinessUnit}
        manager={manager}
        setManager={setManager}
        onExportPdf={generateExecutiveOverviewPDF}
      />

      {/* KPIs */}
      <ExecutiveKPICards filters={filters} />

      {/* Tabbed Sections */}
      <Tabs defaultValue="book-value" className="space-y-4">
        <TabsList className="bg-muted/60">
          <TabsTrigger value="book-value">Book Value</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="overhead">Overhead & Costs</TabsTrigger>
        </TabsList>

        <TabsContent value="book-value">
          <BookValueSection onSegmentClick={handleSegmentClick} filters={filters} />
        </TabsContent>
        <TabsContent value="revenue">
          <RevenueAnalytics onSegmentClick={handleSegmentClick} filters={filters} />
        </TabsContent>
        <TabsContent value="demographics">
          <DemographicsSection onSegmentClick={handleSegmentClick} filters={filters} />
        </TabsContent>
        <TabsContent value="overhead">
          <OverheadSection onSegmentClick={handleSegmentClick} filters={filters} />
        </TabsContent>
      </Tabs>

      {/* Drill-Down Sheet */}
      <DrillDownSheet filter={drillFilter} open={drillOpen} onOpenChange={setDrillOpen} />
    </div>
  );
};

export default ExecutiveOverviewInline;
