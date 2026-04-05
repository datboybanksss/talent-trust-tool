import React, { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calculator, Shield, Heart, AlertTriangle, CheckCircle2, FileText, ChevronRight, ChevronLeft, Home } from "lucide-react";
import { EstimatorState, getDefaultState, computeInsuranceEstimate, formatZAR } from "@/utils/estateCalculations";
import { generateEstateReport } from "@/utils/estateCalculatorPdf";
import { toast } from "@/hooks/use-toast";

const EstateCalculator = () => {
  const [state, setState] = useState<EstimatorState>(getDefaultState());
  const [step, setStep] = useState(0);

  const updatePersonal = (key: string, value: any) =>
    setState(s => ({ ...s, personal: { ...s.personal, [key]: value } }));
  const updateFinancial = (key: string, value: any) =>
    setState(s => ({ ...s, financial: { ...s.financial, [key]: value } }));

  const estimate = computeInsuranceEstimate(state);

  const handleExportPdf = () => {
    try {
      generateEstateReport(state);
      toast({ title: "Report exported", description: "Your insurance needs report has been downloaded." });
    } catch {
      toast({ title: "Export failed", description: "Could not generate the report.", variant: "destructive" });
    }
  };

  const steps = ["Your Details", "Your Finances", "Your Estimate"];

  return (
    <DashboardLayout title="Insurance Needs Estimator" subtitle="Estimate your life and disability cover needs">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center justify-center gap-2">
            <Calculator className="w-7 h-7 text-primary" />
            Insurance Needs Estimator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Find out how much cover you may need in the event of death or permanent disability
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((label, i) => (
            <React.Fragment key={i}>
              <button
                onClick={() => setStep(i)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  i === step ? 'bg-primary text-primary-foreground' :
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

        {/* Step 1: Personal Details */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About You</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Profession</Label>
                <Select value={state.personal.profession} onValueChange={v => updatePersonal('profession', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="athlete">Athlete</SelectItem>
                    <SelectItem value="entertainer">Entertainer</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sport / Entertainment Field</Label>
                <Input value={state.personal.field} onChange={e => updatePersonal('field', e.target.value)} placeholder="e.g. Cricket, Music, Acting" />
              </div>
              <div className="space-y-2">
                <Label>Current Age</Label>
                <Input type="number" value={state.personal.currentAge} onChange={e => updatePersonal('currentAge', Number(e.target.value))} min={16} max={70} />
              </div>
              <div className="space-y-2">
                <Label>Remaining Career (years)</Label>
                <Input type="number" value={state.personal.remainingCareerYears} onChange={e => updatePersonal('remainingCareerYears', Number(e.target.value))} min={1} max={30} />
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

        {/* Step 2: Financial Details */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Financial Picture</CardTitle>
            </CardHeader>
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
                  If property needs to be transferred to a beneficiary or spouse on death, transfer costs apply (transfer duty, conveyancing, rates clearance).
                </p>
                {state.financial.propertyTransferNeeded && (
                  <div className="space-y-2">
                    <Label>Property Value to Transfer (R)</Label>
                    <Input type="number" value={state.financial.propertyValue || ''} onChange={e => updateFinancial('propertyValue', Number(e.target.value))} placeholder="e.g. 5000000" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Results */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Life Cover Estimate */}
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
                  {estimate.propertyTransferCosts.total > 0 && (
                    <ResultRow label="Property Transfer Costs" value={estimate.propertyTransferCosts.total} />
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

            {/* Disability Cover Estimate */}
            <Card className={estimate.disabilityShortfall > 0 ? 'border-destructive/30' : 'border-accent/30'}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Estimated Disability Cover Needed (Permanent Disability)
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

            {/* Flags / Warnings */}
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

            {/* Estate Cost Breakdown */}
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

            {/* Disclaimer */}
            <Card className="border-warning/50 bg-warning/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <strong>Disclaimer:</strong> This calculator is illustrative only and does not constitute financial, tax, or legal advice.
                    Outcomes for athletes and entertainers are highly sensitive to income volatility, health, and career duration.
                    Consult a qualified financial adviser before making decisions based on these projections.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleExportPdf} className="w-full gap-2">
              <FileText className="w-4 h-4" /> Download PDF Report
            </Button>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(s => s - 1)} disabled={step === 0} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep(s => s + 1)} className="gap-1">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
};

const ResultRow = ({ label, value }: { label: string; value: number }) => (
  <div className="p-3 rounded-lg bg-secondary">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-lg font-bold text-foreground">{formatZAR(value)}</p>
  </div>
);

export default EstateCalculator;
