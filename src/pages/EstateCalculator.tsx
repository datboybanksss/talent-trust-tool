import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, TrendingUp } from "lucide-react";
import RetirementCalculator from "@/components/calculators/RetirementCalculator";
import EstateCalculator from "@/components/calculators/EstateCalculator";

const CalculatorsPage = () => {
  return (
    <DashboardLayout title="Financial Calculators" subtitle="Plan your retirement and protect your estate">
      <div className="max-w-3xl mx-auto space-y-6">
        <Tabs defaultValue="retirement" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="retirement" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Retirement Calculator
            </TabsTrigger>
            <TabsTrigger value="estate" className="gap-2">
              <Calculator className="w-4 h-4" />
              Estate Planning Calculator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="retirement">
            <RetirementCalculator />
          </TabsContent>

          <TabsContent value="estate">
            <EstateCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default CalculatorsPage;
