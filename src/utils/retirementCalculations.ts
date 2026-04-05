// Retirement Calculator - South African Context

export interface RetirementPersonal {
  currentAge: number;
  retirementAge: number; // default 60
}

export interface RetirementFinancial {
  monthlyIncome: number;
  monthlyExpenses: number;
  desiredMonthlyRetirementIncome: number;
  currentSavings: number;
  monthlyContribution: number;
  existingRetirementFunds: number; // RA, pension, provident
  expectedReturnRate: number; // % p.a. pre-retirement
  postRetirementReturnRate: number; // % p.a. in drawdown
  inflationRate: number;
  lifeExpectancy: number; // default 85
}

export interface RetirementState {
  personal: RetirementPersonal;
  financial: RetirementFinancial;
}

export interface RetirementEstimate {
  yearsToRetirement: number;
  yearsInRetirement: number;

  // Savings gap
  retirementCorpusNeeded: number; // lump sum at retirement to fund drawdown
  projectedSavingsAtRetirement: number;
  savingsShortfall: number;
  additionalMonthlySavingNeeded: number;

  // Income estimate
  projectedMonthlyIncomeFromSavings: number;
  incomeReplacementRatio: number; // % of current income


  flags: string[];
}

// Future value of a lump sum
const futureValue = (pv: number, rate: number, years: number): number => {
  return pv * Math.pow(1 + rate, years);
};

// Future value of monthly contributions (annuity)
const futureValueAnnuity = (pmt: number, annualRate: number, years: number): number => {
  if (annualRate === 0) return pmt * 12 * years;
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  return pmt * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
};

// Present value of an annuity (how much corpus needed to pay X per month for Y years)
const presentValueAnnuity = (pmt: number, annualRate: number, years: number): number => {
  if (annualRate === 0) return pmt * 12 * years;
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  return pmt * ((1 - Math.pow(1 + monthlyRate, -months)) / monthlyRate);
};

// Monthly payment needed to reach a future value
const monthlyPaymentNeeded = (fv: number, annualRate: number, years: number): number => {
  if (years <= 0) return 0;
  if (annualRate === 0) return fv / (years * 12);
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  return fv * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
};

export const computeRetirementEstimate = (state: RetirementState): RetirementEstimate => {
  const { personal, financial } = state;
  const flags: string[] = [];

  const yearsToRetirement = Math.max(0, personal.retirementAge - personal.currentAge);
  const yearsInRetirement = Math.max(0, financial.lifeExpectancy - personal.retirementAge);

  const realReturnPre = (financial.expectedReturnRate - financial.inflationRate) / 100;
  const realReturnPost = (financial.postRetirementReturnRate - financial.inflationRate) / 100;

  const inflatedRetirementIncome = financial.desiredMonthlyRetirementIncome *
    Math.pow(1 + financial.inflationRate / 100, yearsToRetirement);

  const retirementCorpusNeeded = presentValueAnnuity(inflatedRetirementIncome, realReturnPost, yearsInRetirement);

  const savingsGrowth = futureValue(financial.currentSavings + financial.existingRetirementFunds, realReturnPre, yearsToRetirement);
  const contributionGrowth = futureValueAnnuity(financial.monthlyContribution, realReturnPre, yearsToRetirement);

  const projectedSavingsAtRetirement = savingsGrowth + contributionGrowth;
  const savingsShortfall = Math.max(0, retirementCorpusNeeded - projectedSavingsAtRetirement);

  const additionalMonthlySavingNeeded = savingsShortfall > 0
    ? monthlyPaymentNeeded(savingsShortfall, realReturnPre, yearsToRetirement)
    : 0;

  const projectedMonthlyIncomeFromSavings = projectedSavingsAtRetirement > 0 && yearsInRetirement > 0 && realReturnPost > 0
    ? projectedSavingsAtRetirement / ((1 - Math.pow(1 + realReturnPost / 12, -yearsInRetirement * 12)) / (realReturnPost / 12))
    : 0;

  const incomeReplacementRatio = financial.desiredMonthlyRetirementIncome > 0
    ? (projectedMonthlyIncomeFromSavings / inflatedRetirementIncome) * 100
    : 0;

  if (savingsShortfall > 0) flags.push('You have a retirement savings shortfall — consider increasing contributions');
  if (incomeReplacementRatio < 75 && incomeReplacementRatio > 0) flags.push('Your projected retirement income may not maintain your desired lifestyle');
  if (financial.monthlyContribution === 0) flags.push('No current monthly savings — start contributing now to benefit from compound growth');
  if (yearsToRetirement <= 10) flags.push('Less than 10 years to retirement — review your plan urgently');
  if (yearsToRetirement <= 0) flags.push('You have reached or passed your retirement age');

  return {
    yearsToRetirement,
    yearsInRetirement,
    retirementCorpusNeeded,
    projectedSavingsAtRetirement,
    savingsShortfall,
    additionalMonthlySavingNeeded,
    projectedMonthlyIncomeFromSavings,
    incomeReplacementRatio,
    flags,
  };
};

export const getDefaultRetirementState = (): RetirementState => ({
  personal: {
    currentAge: 30,
    retirementAge: 60,
  },
  financial: {
    monthlyIncome: 0,
    monthlyExpenses: 0,
    desiredMonthlyRetirementIncome: 0,
    currentSavings: 0,
    monthlyContribution: 0,
    existingRetirementFunds: 0,
    expectedReturnRate: 10,
    postRetirementReturnRate: 7,
    inflationRate: 6,
    lifeExpectancy: 85,
  },
});
