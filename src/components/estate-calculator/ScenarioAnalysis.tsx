import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalculatorState, computeGrossEstate, computeTotalLiabilities, computeNetEstate,
  computeTotalEstateCosts, computeScenarios, computeSustainableIncome, formatZAR, ScenarioResult
} from "@/utils/estateCalculations";
import { AlertTriangle, CheckCircle2, XCircle, TrendingDown, Shield, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

interface Props {
  state: CalculatorState;
}

const ScenarioAnalysis: React.FC<Props> = ({ state }) => {
  const grossEstate = computeGrossEstate(state.assets);
  const totalLiabilities = computeTotalLiabilities(state.liabilities);
  const netEstate = computeNetEstate(state.assets, state.liabilities);
  const estateCosts = computeTotalEstateCosts(grossEstate, netEstate);
  const scenarios = computeScenarios(state);
  const sustainableIncome = computeSustainableIncome(state.income);

  const barData = scenarios.map(s => ({
    name: s.name.split(' ').slice(0, 2).join(' '),
    Required: s.estateLiquidityRequired,
    Available: s.liquidityAvailable,
    Shortfall: s.uncoveredShortfall,
  }));

  const estateBreakdown = [
    { name: "Executor's Fees", value: estateCosts.executorFees, fill: "hsl(var(--primary))" },
    { name: "Estate Duty", value: estateCosts.estateDuty, fill: "hsl(var(--destructive))" },
    { name: "Admin & Legal", value: estateCosts.adminCosts, fill: "hsl(var(--muted-foreground))" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Estate Costs Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estate Costs & Taxes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 rounded-lg bg-secondary text-center">
              <p className="text-xs text-muted-foreground">Executor's Fees (3.5% + VAT)</p>
              <p className="text-lg font-bold">{formatZAR(estateCosts.executorFees)}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary text-center">
              <p className="text-xs text-muted-foreground">Estate Duty</p>
              <p className="text-lg font-bold">{formatZAR(estateCosts.estateDuty)}</p>
            </div>
            <div className="p-3 rounded-lg bg-secondary text-center">
              <p className="text-xs text-muted-foreground">Admin & Legal</p>
              <p className="text-lg font-bold">{formatZAR(estateCosts.adminCosts)}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 text-center">
              <p className="text-xs text-muted-foreground font-semibold">Total Liquidity Required</p>
              <p className="text-lg font-bold text-primary">{formatZAR(estateCosts.total)}</p>
            </div>
          </div>

          {estateBreakdown.length > 0 && (
            <div className="mt-6 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={estateBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${formatZAR(value)}`}>
                    {estateBreakdown.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scenario Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" /> Scenario Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={v => `R${(v / 1_000_000).toFixed(1)}m`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatZAR(v)} />
                <Bar dataKey="Required" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Available" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Shortfall" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Individual Scenarios */}
      {scenarios.map((scenario, i) => (
        <ScenarioCard key={i} scenario={scenario} />
      ))}

      {/* Disclaimer */}
      <Card className="border-amber-300/50 bg-amber-50/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Disclaimer:</strong> This calculator is illustrative only and does not constitute financial, tax, or legal advice. 
              Outcomes for athletes and entertainers are highly sensitive to income volatility, health, and career duration. 
              Consult a qualified financial adviser before making decisions based on these projections.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ScenarioCard: React.FC<{ scenario: ScenarioResult }> = ({ scenario }) => {
  const hasShortfall = scenario.uncoveredShortfall > 0;

  return (
    <Card className={hasShortfall ? 'border-destructive/30' : 'border-emerald-300/30'}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {hasShortfall ? <XCircle className="w-5 h-5 text-destructive" /> : <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {scenario.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">{scenario.description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-secondary text-center">
            <p className="text-xs text-muted-foreground">Liquidity Required</p>
            <p className="text-lg font-bold">{formatZAR(scenario.estateLiquidityRequired)}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary text-center">
            <p className="text-xs text-muted-foreground">Liquidity Available</p>
            <p className="text-lg font-bold text-primary">{formatZAR(scenario.liquidityAvailable)}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary text-center">
            <p className="text-xs text-muted-foreground">Shortfall</p>
            <p className={`text-lg font-bold ${hasShortfall ? 'text-destructive' : 'text-emerald-600'}`}>
              {hasShortfall ? formatZAR(scenario.uncoveredShortfall) : 'None'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-secondary text-center">
            <p className="text-xs text-muted-foreground">At-Risk Dependants</p>
            <p className={`text-lg font-bold ${scenario.atRiskDependants > 0 ? 'text-destructive' : 'text-foreground'}`}>
              {scenario.atRiskDependants}
            </p>
          </div>
        </div>

        {scenario.productsResponding.length > 0 && (
          <div>
            <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-1">
              <Shield className="w-4 h-4" /> Products Responding
            </p>
            <div className="flex flex-wrap gap-2">
              {scenario.productsResponding.map((p, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {p.description || 'Unnamed'}: {formatZAR(p.amount)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {scenario.flags.length > 0 && (
          <div className="space-y-1.5">
            {scenario.flags.map((flag, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-amber-800">{flag}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScenarioAnalysis;
