import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calculator, Shield, Heart, AlertTriangle, ChevronRight, ChevronLeft, Home, Plus, Trash2, FileText, Phone, Copy, GitCompareArrows } from "lucide-react";
import { EstimatorState, TransferProperty, getDefaultState, computeInsuranceEstimate, formatZAR, InsuranceEstimate } from "@/utils/estateCalculations";
import { generateEstateReport } from "@/utils/estateCalculatorPdf";
import { toast } from "@/hooks/use-toast";

interface SavedScenario {
  label: string;
  state: EstimatorState;
  estimate: InsuranceEstimate;
}

const EstateCalculator = () => {
  const [state, setState] = useState<EstimatorState>(getDefaultState());
  const [step, setStep] = useState(0);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const updatePersonal = (key: string, value: any) =>
    setState(s => ({ ...s, personal: { ...s.personal, [key]: value } }));
  const updateFinancial = (key: string, value: any) =>
    setState(s => ({ ...s, financial: { ...s.financial, [key]: value } }));

  const estimate = computeInsuranceEstimate(state);
  const steps = ["Your Details", "Your Finances", "Your Estimate"];

  const handleExportPdf = () => {
    try {
      generateEstateReport(state, savedScenarios.length === 2 ? savedScenarios : undefined);
      toast({ title: "Report exported", description: "Your insurance needs report has been downloaded." });
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
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center justify-center gap-2">
          <Calculator className="w-7 h-7 text-primary" />
          Estate Planning Calculator
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Estimate your life and disability cover needs in the event of death or permanent disability
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
              <Label>Remaining Working Years</Label>
              <Input type="number" value={state.personal.remainingWorkingYears} onChange={e => updatePersonal('remainingWorkingYears', Number(e.target.value))} min={1} max={50} />
            </div>
            <div className="space-y-2">
              <Label>Marital Status</Label>
              <Select value={state.personal.maritalStatus} onValueChange={v => updatePersonal('maritalStatus', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="married-in-community">Married in Community of Property</SelectItem>
                  <SelectItem value="married-out-community">Married out of Community (no accrual)</SelectItem>
                  <SelectItem value="married-out-accrual">Married out of Community (with accrual)</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Number of Dependants</Label>
              <Input type="number" value={state.personal.numberOfDependants} onChange={e => updatePersonal('numberOfDependants', Number(e.target.value))} min={0} max={20} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>How many years will your dependants need support?</Label>
              <Input type="number" value={state.personal.dependantsDependencyYears} onChange={e => updatePersonal('dependantsDependencyYears', Number(e.target.value))} min={0} max={40} />
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
              <Label>Monthly Income (R)</Label>
              <Input type="number" value={state.financial.monthlyIncome || ''} onChange={e => updateFinancial('monthlyIncome', Number(e.target.value))} placeholder="e.g. 400000" />
            </div>
            <div className="space-y-2">
              <Label>Monthly Family Expenses (R)</Label>
              <Input type="number" value={state.financial.monthlyExpenses || ''} onChange={e => updateFinancial('monthlyExpenses', Number(e.target.value))} placeholder="e.g. 150000" />
            </div>
            <div className="space-y-2">
              <Label>Total Assets (R)</Label>
              <Input type="number" value={state.financial.totalAssets || ''} onChange={e => updateFinancial('totalAssets', Number(e.target.value))} placeholder="Property, investments, savings" />
            </div>
            <div className="space-y-2">
              <Label>Total Debts (R)</Label>
              <Input type="number" value={state.financial.totalDebts || ''} onChange={e => updateFinancial('totalDebts', Number(e.target.value))} placeholder="Home loan, car, etc." />
            </div>
            <div className="space-y-2">
              <Label>Education Fund Needed (R)</Label>
              <Input type="number" value={state.financial.educationCosts || ''} onChange={e => updateFinancial('educationCosts', Number(e.target.value))} placeholder="School & university costs" />
            </div>
            <div className="space-y-2">
              <Label>Funeral Costs (R)</Label>
              <Input type="number" value={state.financial.funeralCosts} onChange={e => updateFinancial('funeralCosts', Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Existing Life Cover (R)</Label>
              <Input type="number" value={state.financial.existingLifeCover || ''} onChange={e => updateFinancial('existingLifeCover', Number(e.target.value))} placeholder="Current life insurance" />
            </div>
            <div className="space-y-2">
              <Label>Existing Disability Cover (R)</Label>
              <Input type="number" value={state.financial.existingDisabilityCover || ''} onChange={e => updateFinancial('existingDisabilityCover', Number(e.target.value))} placeholder="Current disability insurance" />
            </div>
            <div className="space-y-2">
              <Label>Assumed Inflation Rate (%)</Label>
              <Input type="number" value={state.financial.inflationRate} onChange={e => updateFinancial('inflationRate', Number(e.target.value))} min={0} max={20} step={0.5} />
            </div>

            {/* Property Transfer Section */}
            <div className="md:col-span-2 border-t border-border pt-4 mt-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4 text-primary" />
                  <Label className="text-sm font-semibold">Property Transfer on Death</Label>
                </div>
                <Switch
                  checked={state.financial.propertyTransferNeeded}
                  onCheckedChange={v => updateFinancial('propertyTransferNeeded', v)}
                />
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                If properties need to be transferred to beneficiaries or spouse on death, transfer costs apply per property.
              </p>
              {state.financial.propertyTransferNeeded && (
                <div className="space-y-3">
                  {state.financial.transferProperties.map((prop, idx) => (
                    <div key={prop.id} className="grid grid-cols-[1.5fr_1fr_auto] gap-2 items-end">
                      <div className="space-y-1">
                        <Label className="text-xs">Property {idx + 1} Description</Label>
                        <Input
                          className="h-9"
                          value={prop.description}
                          onChange={e => {
                            const updated = state.financial.transferProperties.map(p =>
                              p.id === prop.id ? { ...p, description: e.target.value } : p
                            );
                            updateFinancial('transferProperties', updated);
                          }}
                          placeholder="e.g. Primary residence, Holiday home"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Value (R)</Label>
                        <Input
                          className="h-9"
                          type="number"
                          value={prop.value || ''}
                          onChange={e => {
                            const updated = state.financial.transferProperties.map(p =>
                              p.id === prop.id ? { ...p, value: Number(e.target.value) } : p
                            );
                            updateFinancial('transferProperties', updated);
                          }}
                          placeholder="e.g. 5000000"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => {
                          const updated = state.financial.transferProperties.filter(p => p.id !== prop.id);
                          updateFinancial('transferProperties', updated);
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newProp: TransferProperty = { id: crypto.randomUUID(), description: '', value: 0 };
                      updateFinancial('transferProperties', [...state.financial.transferProperties, newProp]);
                    }}
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Property
                  </Button>
                  {state.financial.transferProperties.length > 0 && (
                    <p className="text-xs text-muted-foreground text-right">
                      Combined property value: {formatZAR(state.financial.transferProperties.reduce((s, p) => s + p.value, 0))}
                    </p>
                  )}
                </div>
              )}
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

          {/* Life Cover */}
          <Card className={estimate.lifeShortfall > 0 ? 'border-destructive/30' : 'border-accent/30'}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="w-5 h-5 text-destructive" />
                Estimated Life Cover Needed (Death)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ResultRow label="Estate Costs (Executor, Duty, Admin)" value={estimate.estateCosts.total} />
                <ResultRow label="Debt Settlement" value={estimate.debtSettlement} />
                <ResultRow label="Income Replacement for Dependants" value={estimate.incomeReplacement} />
                <ResultRow label="Education Fund" value={estimate.educationFund} />
                <ResultRow label="Funeral Costs" value={estimate.funeralCosts} />
                {estimate.propertyTransfer.combinedTotal > 0 && (
                  <ResultRow label="Property Transfer Costs" value={estimate.propertyTransfer.combinedTotal} />
                )}
              </div>
              <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-lg bg-secondary text-center">
                  <p className="text-xs text-muted-foreground">Total Need</p>
                  <p className="text-xl font-bold text-foreground">{formatZAR(estimate.totalDeathNeed)}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary text-center">
                  <p className="text-xs text-muted-foreground">Existing Cover</p>
                  <p className="text-xl font-bold text-primary">{formatZAR(estimate.existingLifeCover)}</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${estimate.lifeShortfall > 0 ? 'bg-destructive/10' : 'bg-accent/20'}`}>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {estimate.lifeShortfall > 0 ? 'Shortfall' : 'Covered'}
                  </p>
                  <p className={`text-xl font-bold ${estimate.lifeShortfall > 0 ? 'text-destructive' : 'text-accent-foreground'}`}>
                    {estimate.lifeShortfall > 0 ? formatZAR(estimate.lifeShortfall) : '✓ Adequate'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Disability Cover */}
          <Card className={estimate.disabilityShortfall > 0 ? 'border-destructive/30' : 'border-accent/30'}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Estimated Disability Cover Needed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ResultRow label="Lost Career Income" value={estimate.lostCareerIncome} />
                <ResultRow label="Ongoing Living Expenses (capitalised)" value={estimate.ongoingExpenses} />
              </div>
              <div className="border-t border-border pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-lg bg-secondary text-center">
                  <p className="text-xs text-muted-foreground">Total Need</p>
                  <p className="text-xl font-bold text-foreground">{formatZAR(estimate.totalDisabilityNeed)}</p>
                </div>
                <div className="p-4 rounded-lg bg-secondary text-center">
                  <p className="text-xs text-muted-foreground">Existing Cover</p>
                  <p className="text-xl font-bold text-primary">{formatZAR(estimate.existingDisabilityCover)}</p>
                </div>
                <div className={`p-4 rounded-lg text-center ${estimate.disabilityShortfall > 0 ? 'bg-destructive/10' : 'bg-accent/20'}`}>
                  <p className="text-xs text-muted-foreground font-semibold">
                    {estimate.disabilityShortfall > 0 ? 'Shortfall' : 'Covered'}
                  </p>
                  <p className={`text-xl font-bold ${estimate.disabilityShortfall > 0 ? 'text-destructive' : 'text-accent-foreground'}`}>
                    {estimate.disabilityShortfall > 0 ? formatZAR(estimate.disabilityShortfall) : '✓ Adequate'}
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

          {/* Estate Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">Estate Cost Breakdown (SA Law)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Executor's Fees (3.5% + VAT)</p>
                  <p className="text-lg font-bold">{formatZAR(estimate.estateCosts.executorFees)}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Estate Duty</p>
                  <p className="text-lg font-bold">{formatZAR(estimate.estateCosts.estateDuty)}</p>
                </div>
                <div className="p-3 rounded-lg bg-secondary">
                  <p className="text-xs text-muted-foreground">Admin & Legal</p>
                  <p className="text-lg font-bold">{formatZAR(estimate.estateCosts.adminCosts)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Transfer Breakdown */}
          {estimate.propertyTransfer.combinedTotal > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                  <Home className="w-4 h-4" /> Property Transfer Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {estimate.propertyTransfer.properties.map((prop, idx) => (
                  <div key={idx}>
                    <p className="text-sm font-medium text-foreground mb-2">{prop.description} — {formatZAR(prop.value)}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
                      <div className="p-2 rounded-lg bg-secondary">
                        <p className="text-xs text-muted-foreground">Transfer Duty</p>
                        <p className="text-sm font-bold">{formatZAR(prop.costs.transferDuty)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary">
                        <p className="text-xs text-muted-foreground">Conveyancing</p>
                        <p className="text-sm font-bold">{formatZAR(prop.costs.conveyancingFees)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-secondary">
                        <p className="text-xs text-muted-foreground">Rates Clearance</p>
                        <p className="text-sm font-bold">{formatZAR(prop.costs.ratesClearance)}</p>
                      </div>
                      <div className="p-2 rounded-lg bg-primary/10">
                        <p className="text-xs text-muted-foreground">Subtotal</p>
                        <p className="text-sm font-bold text-primary">{formatZAR(prop.costs.total)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {estimate.propertyTransfer.properties.length > 1 && (
                  <div className="border-t border-border pt-3 text-right">
                    <span className="text-sm font-semibold text-foreground">
                      Combined Transfer Total: {formatZAR(estimate.propertyTransfer.combinedTotal)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Illustrative Solutions */}
          {(estimate.lifeShortfall > 0 || estimate.disabilityShortfall > 0) && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Illustrative Solutions to Cover Your Shortfall
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Based on your estimated shortfalls, the following products may help protect your estate and family:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {estimate.lifeShortfall > 0 && (
                    <SolutionCard title="Life Insurance" desc={`A life cover policy of at least ${formatZAR(estimate.lifeShortfall)} could ensure your dependants are financially protected and estate costs are covered.`} />
                  )}
                  {estimate.disabilityShortfall > 0 && (
                    <SolutionCard title="Disability Cover" desc={`A lump-sum disability benefit of at least ${formatZAR(estimate.disabilityShortfall)} could replace lost income and cover ongoing expenses.`} />
                  )}
                  <SolutionCard title="Estate Cover / Liquidity Policy" desc={`Ensures executor's fees, estate duty, and admin costs (${formatZAR(estimate.estateCosts.total)}) are covered without selling assets.`} />
                  <SolutionCard title="Gap Cover" desc="Covers the shortfall between what medical aid pays and the actual cost of medical treatment, especially relevant for hospital procedures." />
                  <SolutionCard title="Income Protection" desc="Pays a monthly benefit (typically 75% of income) if you are unable to work due to illness or injury for an extended period." />
                  {estimate.funeralCosts > 0 && (
                    <SolutionCard title="Funeral Cover" desc={`A dedicated funeral policy of ${formatZAR(estimate.funeralCosts)} provides immediate liquidity for funeral expenses without waiting for the estate to be wound up.`} />
                  )}
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
                structure your estate plan, and recommend the right combination of products to protect your family.
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
                  Outcomes are sensitive to personal circumstances, tax legislation, and market conditions.
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
            title="Life Cover Analysis"
            rows={[
              { label: "Estate Costs", a: formatZAR(savedScenarios[0].estimate.estateCosts.total), b: formatZAR(savedScenarios[1].estimate.estateCosts.total) },
              { label: "Debt Settlement", a: formatZAR(savedScenarios[0].estimate.debtSettlement), b: formatZAR(savedScenarios[1].estimate.debtSettlement) },
              { label: "Income Replacement", a: formatZAR(savedScenarios[0].estimate.incomeReplacement), b: formatZAR(savedScenarios[1].estimate.incomeReplacement) },
              { label: "Total Death Need", a: formatZAR(savedScenarios[0].estimate.totalDeathNeed), b: formatZAR(savedScenarios[1].estimate.totalDeathNeed) },
              { label: "Existing Cover", a: formatZAR(savedScenarios[0].estimate.existingLifeCover), b: formatZAR(savedScenarios[1].estimate.existingLifeCover) },
              { label: "Life Shortfall", a: savedScenarios[0].estimate.lifeShortfall > 0 ? formatZAR(savedScenarios[0].estimate.lifeShortfall) : "✓ Adequate", b: savedScenarios[1].estimate.lifeShortfall > 0 ? formatZAR(savedScenarios[1].estimate.lifeShortfall) : "✓ Adequate" },
            ]}
            labels={[savedScenarios[0].label, savedScenarios[1].label]}
          />

          <ComparisonTable
            title="Disability Cover Analysis"
            rows={[
              { label: "Lost Career Income", a: formatZAR(savedScenarios[0].estimate.lostCareerIncome), b: formatZAR(savedScenarios[1].estimate.lostCareerIncome) },
              { label: "Ongoing Expenses", a: formatZAR(savedScenarios[0].estimate.ongoingExpenses), b: formatZAR(savedScenarios[1].estimate.ongoingExpenses) },
              { label: "Total Need", a: formatZAR(savedScenarios[0].estimate.totalDisabilityNeed), b: formatZAR(savedScenarios[1].estimate.totalDisabilityNeed) },
              { label: "Disability Shortfall", a: savedScenarios[0].estimate.disabilityShortfall > 0 ? formatZAR(savedScenarios[0].estimate.disabilityShortfall) : "✓ Adequate", b: savedScenarios[1].estimate.disabilityShortfall > 0 ? formatZAR(savedScenarios[1].estimate.disabilityShortfall) : "✓ Adequate" },
            ]}
            labels={[savedScenarios[0].label, savedScenarios[1].label]}
          />

          <ComparisonTable
            title="Key Inputs"
            rows={[
              { label: "Age", a: `${savedScenarios[0].state.personal.currentAge}`, b: `${savedScenarios[1].state.personal.currentAge}` },
              { label: "Working Years Left", a: `${savedScenarios[0].state.personal.remainingWorkingYears}`, b: `${savedScenarios[1].state.personal.remainingWorkingYears}` },
              { label: "Monthly Income", a: formatZAR(savedScenarios[0].state.financial.monthlyIncome), b: formatZAR(savedScenarios[1].state.financial.monthlyIncome) },
              { label: "Total Assets", a: formatZAR(savedScenarios[0].state.financial.totalAssets), b: formatZAR(savedScenarios[1].state.financial.totalAssets) },
              { label: "Total Debts", a: formatZAR(savedScenarios[0].state.financial.totalDebts), b: formatZAR(savedScenarios[1].state.financial.totalDebts) },
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

export default EstateCalculator;
