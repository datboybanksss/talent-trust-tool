import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DependantNeeds, capitaliseIncomeNeeds, formatZAR } from "@/utils/estateCalculations";
import { Users, Info } from "lucide-react";

interface Props {
  data: DependantNeeds;
  dependencyYears: number;
  onChange: (data: DependantNeeds) => void;
}

const DependantsSection: React.FC<Props> = ({ data, dependencyYears, onChange }) => {
  const update = (key: keyof DependantNeeds, value: number) => onChange({ ...data, [key]: value });
  const capitalised = capitaliseIncomeNeeds(data, dependencyYears);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Dependants' Income Replacement Needs
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Monthly Family Expenses (R)</Label>
            <Input type="number" value={data.monthlyFamilyExpenses || ''} onChange={e => update('monthlyFamilyExpenses', Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Education Costs (lump sum, R)</Label>
            <Input type="number" value={data.educationCosts || ''} onChange={e => update('educationCosts', Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Spouse Income Replacement Period (years)</Label>
            <Input type="number" value={data.spouseReplacementYears} onChange={e => update('spouseReplacementYears', Number(e.target.value))} min={0} max={50} />
          </div>
          <div className="space-y-2">
            <Label>Special Needs Dependants</Label>
            <Input type="number" value={data.specialNeedsDependants} onChange={e => update('specialNeedsDependants', Number(e.target.value))} min={0} max={10} />
          </div>
          <div className="space-y-2">
            <Label>Legacy Capital Objectives (R)</Label>
            <Input type="number" value={data.legacyCapital || ''} onChange={e => update('legacyCapital', Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Inflation Rate (%)</Label>
            <Input type="number" value={data.inflationRate} onChange={e => update('inflationRate', Number(e.target.value))} min={0} max={20} step={0.5} />
          </div>
        </CardContent>
      </Card>

      {data.monthlyFamilyExpenses > 0 && (
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground">Capitalised Income Replacement Need</p>
                <p className="text-3xl font-bold text-primary mt-1">{formatZAR(capitalised)}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Based on {dependencyYears} years dependency window, {data.inflationRate}% inflation, 
                  and 8% discount rate. Includes education costs and legacy capital.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DependantsSection;
