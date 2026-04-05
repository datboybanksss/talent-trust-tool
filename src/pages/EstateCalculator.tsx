import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calculator, User, TrendingUp, Building2, Users, Shield, BarChart3, FileText } from "lucide-react";
import ProfileSection from "@/components/estate-calculator/ProfileSection";
import IncomeSection from "@/components/estate-calculator/IncomeSection";
import AssetsLiabilitiesSection from "@/components/estate-calculator/AssetsLiabilitiesSection";
import DependantsSection from "@/components/estate-calculator/DependantsSection";
import ProductsSection from "@/components/estate-calculator/ProductsSection";
import ScenarioAnalysis from "@/components/estate-calculator/ScenarioAnalysis";
import { getDefaultState, CalculatorState } from "@/utils/estateCalculations";
import { generateEstateReport } from "@/utils/estateCalculatorPdf";
import { toast } from "@/hooks/use-toast";

const EstateCalculator = () => {
  const [state, setState] = useState<CalculatorState>(getDefaultState());
  const [activeTab, setActiveTab] = useState("profile");

  const handleExportPdf = () => {
    try {
      generateEstateReport(state);
      toast({ title: "Report exported", description: "Your Estate Risk Report PDF has been downloaded." });
    } catch (e) {
      toast({ title: "Export failed", description: "Could not generate the report.", variant: "destructive" });
    }
  };

  return (
    <DashboardLayout title="Estate Planning & Income Calculator" subtitle="For professional athletes, entertainers, and their financial advisers">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Calculator className="w-7 h-7 text-primary" />
              Estate Planning & Income Calculator
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              For professional athletes, entertainers, and their financial advisers
            </p>
          </div>
          <Button onClick={handleExportPdf} className="gap-2">
            <FileText className="w-4 h-4" /> Export PDF Report
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="profile" className="gap-1 text-xs">
              <User className="w-4 h-4" /> Profile
            </TabsTrigger>
            <TabsTrigger value="income" className="gap-1 text-xs">
              <TrendingUp className="w-4 h-4" /> Income
            </TabsTrigger>
            <TabsTrigger value="assets" className="gap-1 text-xs">
              <Building2 className="w-4 h-4" /> Assets & Liabilities
            </TabsTrigger>
            <TabsTrigger value="dependants" className="gap-1 text-xs">
              <Users className="w-4 h-4" /> Dependants
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1 text-xs">
              <Shield className="w-4 h-4" /> Protection
            </TabsTrigger>
            <TabsTrigger value="analysis" className="gap-1 text-xs">
              <BarChart3 className="w-4 h-4" /> Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSection data={state.profile} onChange={profile => setState(s => ({ ...s, profile }))} />
          </TabsContent>

          <TabsContent value="income">
            <IncomeSection data={state.income} onChange={income => setState(s => ({ ...s, income }))} />
          </TabsContent>

          <TabsContent value="assets">
            <AssetsLiabilitiesSection
              assets={state.assets}
              liabilities={state.liabilities}
              onAssetsChange={assets => setState(s => ({ ...s, assets }))}
              onLiabilitiesChange={liabilities => setState(s => ({ ...s, liabilities }))}
            />
          </TabsContent>

          <TabsContent value="dependants">
            <DependantsSection
              data={state.dependantNeeds}
              dependencyYears={state.profile.dependantsDependencyYears}
              onChange={dependantNeeds => setState(s => ({ ...s, dependantNeeds }))}
            />
          </TabsContent>

          <TabsContent value="products">
            <ProductsSection
              products={state.protectionProducts}
              structures={state.longTermStructures}
              onProductsChange={protectionProducts => setState(s => ({ ...s, protectionProducts }))}
              onStructuresChange={longTermStructures => setState(s => ({ ...s, longTermStructures }))}
            />
          </TabsContent>

          <TabsContent value="analysis">
            <ScenarioAnalysis state={state} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default EstateCalculator;
