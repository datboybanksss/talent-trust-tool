import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { IncomeInputs, computeSustainableIncome, computeIncomeCliffRisk, formatZAR } from "@/utils/estateCalculations";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  data: IncomeInputs;
  onChange: (data: IncomeInputs) => void;
}

const IncomeSection: React.FC<Props> = ({ data, onChange }) => {
  const update = (key: keyof IncomeInputs, value: number) => {
    const updated = { ...data, [key]: value };
    // Auto-sync variable pct
    if (key === 'guaranteedIncomePct') {
      updated.variableIncomePct = 100 - value;
    } else if (key === 'variableIncomePct') {
      updated.guaranteedIncomePct = 100 - value;
    }
    onChange(updated);
  };

  const sustainable = computeSustainableIncome(data);
  const cliff = computeIncomeCliffRisk(data);
  const severityColor: Record<string, string> = {
    low: 'bg-emerald-500/10 text-emerald-700 border-emerald-300',
    medium: 'bg-amber-500/10 text-amber-700 border-amber-300',
    high: 'bg-orange-500/10 text-orange-700 border-orange-300',
    critical: 'bg-destructive/10 text-destructive border-destructive/30',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Volatile Income Modelling</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Average Annual Income (last 3 years)</Label>
            <Input type="number" value={data.averageAnnualIncome || ''} onChange={e => update('averageAnnualIncome', Number(e.target.value))} placeholder="e.g. 5000000" />
          </div>
          <div className="space-y-2">
            <Label>Highest Earning Year (R)</Label>
            <Input type="number" value={data.highestEarningYear || ''} onChange={e => update('highestEarningYear', Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Lowest Earning Year (R)</Label>
            <Input type="number" value={data.lowestEarningYear || ''} onChange={e => update('lowestEarningYear', Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Guaranteed Income Portion (%)</Label>
            <Input type="number" value={data.guaranteedIncomePct} onChange={e => update('guaranteedIncomePct', Number(e.target.value))} min={0} max={100} />
          </div>
          <div className="space-y-2">
            <Label>Variable Income Portion (%)</Label>
            <Input type="number" value={data.variableIncomePct} onChange={e => update('variableIncomePct', Number(e.target.value))} min={0} max={100} />
          </div>
          <div className="space-y-2">
            <Label>Expected Post-Career Income (annual)</Label>
            <Input type="number" value={data.expectedPostCareerIncome || ''} onChange={e => update('expectedPostCareerIncome', Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      {data.averageAnnualIncome > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Income Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">Sustainable Income Estimate</p>
                <p className="text-xl font-bold text-foreground">{formatZAR(sustainable)}</p>
                <p className="text-xs text-muted-foreground mt-1">Adjusted for variable income volatility</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground">Income Drop Risk</p>
                <p className="text-xl font-bold text-foreground">{formatZAR(cliff.dropAmount)}</p>
                <Badge className={`mt-1 ${severityColor[cliff.severity]}`}>
                  {cliff.severity.toUpperCase()} RISK
                </Badge>
              </div>
              <div className="p-4 rounded-lg bg-secondary">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingDown className="w-4 h-4" /> Career-End Scenario
                </p>
                <p className="text-xl font-bold text-foreground">{formatZAR(data.expectedPostCareerIncome)}/yr</p>
                {data.expectedPostCareerIncome < sustainable * 0.3 && (
                  <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                    <AlertTriangle className="w-3 h-3" /> Significant income cliff
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IncomeSection;
