import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, ChevronRight, ChevronLeft, FileText, Wallet, PiggyBank, Shield, Phone, Copy, GitCompareArrows } from "lucide-react";
import { RetirementState, getDefaultRetirementState, computeRetirementEstimate, RetirementEstimate } from "@/utils/retirementCalculations";
import { formatZAR } from "@/utils/estateCalculations";
import { generateRetirementReport } from "@/utils/retirementPdf";
import { toast } from "@/hooks/use-toast";

interface SavedScenario {
  label: string;
  state: RetirementState;
  estimate: RetirementEstimate;
}

const RetirementCalculator = () => {
  const [state, setState] = useState<RetirementState>(getDefaultRetirementState());
  const [step, setStep] = useState(0);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const updatePersonal = (key: string, value: any) =>
    setState(s => ({ ...s, personal: { ...s.personal, [key]: value } }));
  const updateFinancial = (key: string, value: any) =>
    setState(s => ({ ...s, financial: { ...s.financial, [key]: value } }));

  const estimate = computeRetirementEstimate(state);
  const steps = ["Your Details", "Your Finances", "Your Estimate"];

  const handleExportPdf = () => {
    try {
      generateRetirementReport(state, savedScenarios.length === 2 ? savedScenarios : undefined);
      toast({ title: "Report exported", description: "Your retirement planning report has been downloaded." });
    } catch {
      toast({ title: "Export failed", description: "Could not generate the report.", variant: "destructive" });
    }
  };

  const handleSaveScenario = () => {
    if (savedScenarios.length >= 2) {
      toast({ title: "Maximum 2 scenarios", description: "Remove a scenario before adding a new one.", variant: "destructive" });
      return;
    }
    const label = `Scenario ${savedScenarios.length + 1}`;
    setSavedScenarios(prev => [...prev, { label, state: JSON.parse(JSON.stringify(state)), estimate }]);
    toast({ title: "Scenario saved", description: `${label} has been saved for comparison.` });
  };

  const handleRemoveScenario = (idx: number) => {
    setSavedScenarios(prev => prev.filter((_, i) => i !== idx));
    setShowComparison(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center justify-center gap-2">
          <TrendingUp className="w-7 h-7 text-primary" />
          Retirement Calculator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Estimate how much you need to save and what income you can expect at retirement
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((label, i) => (
          <React.Fragment key={i}>
            <button
              onClick={() => { setStep(i); setShowComparison(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                i === step && !showComparison ? 'bg-primary text-primary-foreground' :
                i < step ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
              }`}
            >
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs bg-background/20">
                {i < step ? '✓' : i + 1}
              </span>
              {label}
            </button>
            {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Personal */}
      {step === 0 && !showComparison && (
        <Card>
          <CardHeader><CardTitle className="text-lg">About You</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Age</Label>
              <Input type="number" value={state.personal.currentAge} onChange={e => updatePersonal('currentAge', Number(e.target.value))} min={16} max={70} />
            </div>
            <div className="space-y-2">
              <Label>Retirement Age</Label>
              <Input type="number" value={state.personal.retirementAge} onChange={e => updatePersonal('retirementAge', Number(e.target.value))} min={50} max={75} />
            </div>
            <div className="space-y-2">
              <Label>Life Expectancy</Label>
              <Input type="number" value={state.financial.lifeExpectancy} onChange={e => updateFinancial('lifeExpectancy', Number(e.target.value))} min={60} max={100} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Financial */}
      {step === 1 && !showComparison && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Your Financial Picture</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Monthly Income (R)</Label>
              <Input type="number" value={state.financial.monthlyIncome || ''} onChange={e => updateFinancial('monthlyIncome', Number(e.target.value))} placeholder="e.g. 50000" />
            </div>
            <div className="space-y-2">
              <Label>Current Monthly Expenses (R)</Label>
              <Input type="number" value={state.financial.monthlyExpenses || ''} onChange={e => updateFinancial('monthlyExpenses', Number(e.target.value))} placeholder="e.g. 30000" />
            </div>
            <div className="space-y-2">
              <Label>Desired Monthly Retirement Income (R)</Label>
              <Input type="number" value={state.financial.desiredMonthlyRetirementIncome || ''} onChange={e => updateFinancial('desiredMonthlyRetirementIncome', Number(e.target.value))} placeholder="e.g. 40000" />
            </div>
            <div className="space-y-2">
              <Label>Current Savings & Investments (R)</Label>
              <Input type="number" value={state.financial.currentSavings || ''} onChange={e => updateFinancial('currentSavings', Number(e.target.value))} placeholder="Cash, unit trusts, etc." />
            </div>
            <div className="space-y-2">
              <Label>Existing Retirement Funds (R)</Label>
              <Input type="number" value={state.financial.existingRetirementFunds || ''} onChange={e => updateFinancial('existingRetirementFunds', Number(e.target.value))} placeholder="RA, pension, provident" />
            </div>
            <div className="space-y-2">
              <Label>Current Monthly Contribution (R)</Label>
              <Input type="number" value={state.financial.monthlyContribution || ''} onChange={e => updateFinancial('monthlyContribution', Number(e.target.value))} placeholder="Monthly savings & RA" />
            </div>
            <div className="space-y-2">
              <Label>Expected Return Rate (% p.a.)</Label>
              <Input type="number" value={state.financial.expectedReturnRate} onChange={e => updateFinancial('expectedReturnRate', Number(e.target.value))} min={0} max={25} step={0.5} />
            </div>
            <div className="space-y-2">
              <Label>Post-Retirement Return Rate (% p.a.)</Label>
              <Input type="number" value={state.financial.postRetirementReturnRate} onChange={e => updateFinancial('postRetirementReturnRate', Number(e.target.value))} min={0} max={20} step={0.5} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Assumed Inflation Rate (%)</Label>
              <Input type="number" value={state.financial.inflationRate} onChange={e => updateFinancial('inflationRate', Number(e.target.value))} min={0} max={20} step={0.5} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results */}
      {step === 2 && !showComparison && (
        <div className="space-y-6">
          {/* Save Scenario Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {savedScenarios.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  {s.label}
                  <button onClick={() => handleRemoveScenario(i)} className="hover:text-destructive">×</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveScenario} disabled={savedScenarios.length >= 2} className="gap-1">
                <Copy className="w-3.5 h-3.5" /> Save Scenario ({savedScenarios.length}/2)
              </Button>
              {savedScenarios.length === 2 && (
                <Button variant="outline" size="sm" onClick={() => setShowComparison(true)} className="gap-1">
                  <GitCompareArrows className="w-3.5 h-3.5" /> Compare
                </Button>
              )}
            </div>
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Retirement Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Retirement At</p>
                  <p className="text-xl font-bold text-foreground">Age {state.personal.retirementAge}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Years to Retirement</p>
                  <p className="text-xl font-bold text-foreground">{estimate.yearsToRetirement} yrs</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Years in Retirement</p>
                  <p className="text-xl font-bold text-foreground">{estimate.yearsInRetirement} yrs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Savings Gap */}
          <Card className={estimate.savingsShortfall > 0 ? 'border-destructive/30' : 'border-accent/30'}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PiggyBank className="w-5 h-5 text-primary" />
                Retirement Savings Gap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ResultRow label="Retirement Corpus Needed" value={estimate.retirementCorpusNeeded} />
                <ResultRow label="Projected Savings at Retirement" value={estimate.projectedSavingsAtRetirement} />
              </div>
              <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className={`p-4 rounded-lg text-center ${estimate.savingsShortfall > 0 ? 'bg-destructive/10' : 'bg-accent/20'}`}>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {estimate.savingsShortfall > 0 ? 'Savings Shortfall' : 'On Track'}
                  </p>
                  <p className={`text-xl font-bold ${estimate.savingsShortfall > 0 ? 'text-destructive' : 'text-accent-foreground'}`}>
                    {estimate.savingsShortfall > 0 ? formatZAR(estimate.savingsShortfall) : '✓ On Track'}
                  </p>
                </div>
                {estimate.additionalMonthlySavingNeeded > 0 && (
                  <div className="p-4 rounded-lg bg-primary/10 text-center">
                    <p className="text-xs text-muted-foreground font-semibold">Extra Monthly Saving Needed</p>
                    <p className="text-xl font-bold text-primary">{formatZAR(estimate.additionalMonthlySavingNeeded)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Income Estimate */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Projected Retirement Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-4 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Projected Monthly Income</p>
                  <p className="text-xl font-bold text-foreground">{formatZAR(estimate.projectedMonthlyIncomeFromSavings)}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Desired Monthly Income</p>
                  <p className="text-xl font-bold text-foreground">{formatZAR(state.financial.desiredMonthlyRetirementIncome)}</p>
                </div>
                <div className={`p-4 rounded-lg ${estimate.incomeReplacementRatio >= 100 ? 'bg-accent/20' : 'bg-destructive/10'}`}>
                  <p className="text-xs text-muted-foreground">Income Replacement</p>
                  <p className={`text-xl font-bold ${estimate.incomeReplacementRatio >= 100 ? 'text-accent-foreground' : 'text-destructive'}`}>
                    {estimate.incomeReplacementRatio.toFixed(0)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flags */}
          {estimate.flags.length > 0 && (
            <Card className="border-warning/50">
              <CardContent className="pt-6 space-y-2">
                {estimate.flags.map((flag, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                    <span className="text-muted-foreground">{flag}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Illustrative Solutions */}
          {estimate.savingsShortfall > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Illustrative Solutions to Cover Your Shortfall
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Based on your estimated shortfall of <strong>{formatZAR(estimate.savingsShortfall)}</strong>, the following products may help bridge the gap:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <SolutionCard title="Retirement Annuity (RA)" desc="Tax-deductible contributions to build your retirement corpus. Ideal for closing the savings gap with disciplined monthly investing." />
                  <SolutionCard title="Living Annuity" desc="Flexible income drawdown at retirement. You choose between 2.5% – 17.5% of your investment as annual income." />
                  <SolutionCard title="Tax-Free Savings Account" desc="Contribute up to R36,000/year (R500,000 lifetime) with no tax on growth, dividends, or withdrawals." />
                  <SolutionCard title="Endowment Policy" desc="A medium- to long-term savings vehicle with tax advantages, suitable for supplementing retirement savings." />
                </div>
              </CardContent>
            </Card>
          )}

          {/* CTA */}
          <Card className="border-primary bg-primary/10">
            <CardContent className="pt-6 text-center space-y-3">
              <Phone className="w-8 h-8 text-primary mx-auto" />
              <h3 className="text-lg font-bold text-foreground">Speak to a Certified Financial Planner</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                These results are illustrative. A certified financial planner (CFP®) can provide personalised advice,
                recommend suitable products, and help you build a comprehensive retirement plan.
              </p>
              <Button asChild className="gap-2">
                <a href="/contact"><Phone className="w-4 h-4" /> Contact a Financial Planner</a>
              </Button>
            </CardContent>
          </Card>

          {/* Disclaimer */}
          <Card className="border-warning/50 bg-warning/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Disclaimer:</strong> This calculator is illustrative only and does not constitute financial, tax, or legal advice.
                  Outcomes are sensitive to market performance, inflation, and personal circumstances.
                  Consult a certified financial planner before making decisions based on these projections.
                </p>
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleExportPdf} className="w-full gap-2">
            <FileText className="w-4 h-4" /> Download PDF Report
          </Button>
        </div>
      )}

      {/* Scenario Comparison View */}
      {showComparison && savedScenarios.length === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <GitCompareArrows className="w-5 h-5 text-primary" /> Scenario Comparison
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowComparison(false)}>Back to Calculator</Button>
          </div>

          <ComparisonTable
            title="Timeline"
            rows={[
              { label: "Current Age", a: `${savedScenarios[0].state.personal.currentAge}`, b: `${savedScenarios[1].state.personal.currentAge}` },
              { label: "Retirement Age", a: `${savedScenarios[0].state.personal.retirementAge}`, b: `${savedScenarios[1].state.personal.retirementAge}` },
              { label: "Years to Retirement", a: `${savedScenarios[0].estimate.yearsToRetirement}`, b: `${savedScenarios[1].estimate.yearsToRetirement}` },
              { label: "Years in Retirement", a: `${savedScenarios[0].estimate.yearsInRetirement}`, b: `${savedScenarios[1].estimate.yearsInRetirement}` },
            ]}
            labels={[savedScenarios[0].label, savedScenarios[1].label]}
          />

          <ComparisonTable
            title="Savings & Shortfall"
            rows={[
              { label: "Monthly Contribution", a: formatZAR(savedScenarios[0].state.financial.monthlyContribution), b: formatZAR(savedScenarios[1].state.financial.monthlyContribution) },
              { label: "Corpus Needed", a: formatZAR(savedScenarios[0].estimate.retirementCorpusNeeded), b: formatZAR(savedScenarios[1].estimate.retirementCorpusNeeded) },
              { label: "Projected Savings", a: formatZAR(savedScenarios[0].estimate.projectedSavingsAtRetirement), b: formatZAR(savedScenarios[1].estimate.projectedSavingsAtRetirement) },
              { label: "Shortfall", a: savedScenarios[0].estimate.savingsShortfall > 0 ? formatZAR(savedScenarios[0].estimate.savingsShortfall) : "✓ On Track", b: savedScenarios[1].estimate.savingsShortfall > 0 ? formatZAR(savedScenarios[1].estimate.savingsShortfall) : "✓ On Track" },
              { label: "Extra Monthly Needed", a: formatZAR(savedScenarios[0].estimate.additionalMonthlySavingNeeded), b: formatZAR(savedScenarios[1].estimate.additionalMonthlySavingNeeded) },
            ]}
            labels={[savedScenarios[0].label, savedScenarios[1].label]}
          />

          <ComparisonTable
            title="Retirement Income"
            rows={[
              { label: "Projected Monthly Income", a: formatZAR(savedScenarios[0].estimate.projectedMonthlyIncomeFromSavings), b: formatZAR(savedScenarios[1].estimate.projectedMonthlyIncomeFromSavings) },
              { label: "Income Replacement", a: `${savedScenarios[0].estimate.incomeReplacementRatio.toFixed(0)}%`, b: `${savedScenarios[1].estimate.incomeReplacementRatio.toFixed(0)}%` },
            ]}
            labels={[savedScenarios[0].label, savedScenarios[1].label]}
          />

          <Button onClick={handleExportPdf} className="w-full gap-2">
            <FileText className="w-4 h-4" /> Download Comparison PDF Report
          </Button>
        </div>
      )}

      {/* Navigation */}
      {!showComparison && (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {step < 2 && (
            <Button onClick={() => setStep(s => s + 1)} className="gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const ResultRow = ({ label, value }: { label: string; value: number }) => (
  <div className="p-3 rounded-lg bg-secondary">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-bold text-foreground">{formatZAR(value)}</p>
  </div>
);

const SolutionCard = ({ title, desc }: { title: string; desc: string }) => (
  <div className="p-4 rounded-lg bg-background border border-border">
    <p className="text-sm font-semibold text-foreground">{title}</p>
    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
  </div>
);

const ComparisonTable = ({ title, rows, labels }: { title: string; rows: { label: string; a: string; b: string }[]; labels: string[] }) => (
  <Card>
    <CardHeader><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-muted-foreground font-medium">Metric</th>
              <th className="text-right py-2 px-3 text-primary font-medium">{labels[0]}</th>
              <th className="text-right py-2 px-3 text-primary font-medium">{labels[1]}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? 'bg-secondary/50' : ''}>
                <td className="py-2 px-3 text-muted-foreground">{row.label}</td>
                <td className="py-2 px-3 text-right font-semibold text-foreground">{row.a}</td>
                <td className="py-2 px-3 text-right font-semibold text-foreground">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

export default RetirementCalculator;
