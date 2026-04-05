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

  // Career transition
  postCareerGapYears: number; // years between career end and retirement
  careerEndAge: number;

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
  const careerEndAge = personal.currentAge + personal.remainingCareerYears;
  const postCareerGapYears = Math.max(0, personal.retirementAge - careerEndAge);

  const realReturnPre = (financial.expectedReturnRate - financial.inflationRate) / 100;
  const realReturnPost = (financial.postRetirementReturnRate - financial.inflationRate) / 100;

  // Desired retirement income adjusted for inflation at retirement
  const inflatedRetirementIncome = financial.desiredMonthlyRetirementIncome *
    Math.pow(1 + financial.inflationRate / 100, yearsToRetirement);

  // Corpus needed at retirement to sustain drawdown
  const retirementCorpusNeeded = presentValueAnnuity(inflatedRetirementIncome, realReturnPost, yearsInRetirement);

  // Project current savings + retirement funds + contributions to retirement date
  const savingsGrowth = futureValue(financial.currentSavings + financial.existingRetirementFunds, realReturnPre, yearsToRetirement);

  // Contributions only during active career years
  const contributionYears = Math.min(personal.remainingCareerYears, yearsToRetirement);
  const contributionGrowth = futureValueAnnuity(financial.monthlyContribution, realReturnPre, contributionYears);
  // Grow contributions from career-end to retirement
  const contributionAtRetirement = futureValue(contributionGrowth, realReturnPre, Math.max(0, yearsToRetirement - contributionYears));

  const projectedSavingsAtRetirement = savingsGrowth + contributionAtRetirement;
  const savingsShortfall = Math.max(0, retirementCorpusNeeded - projectedSavingsAtRetirement);

  // Additional monthly saving needed (over remaining career) to close shortfall
  const additionalMonthlySavingNeeded = savingsShortfall > 0
    ? monthlyPaymentNeeded(savingsShortfall, realReturnPre, contributionYears)
    : 0;

  // What monthly income would projected savings provide?
  const projectedMonthlyIncomeFromSavings = projectedSavingsAtRetirement > 0 && yearsInRetirement > 0
    ? projectedSavingsAtRetirement / ((1 - Math.pow(1 + realReturnPost / 12, -yearsInRetirement * 12)) / (realReturnPost / 12 || 1))
    : 0;

  const incomeReplacementRatio = financial.monthlyIncome > 0
    ? (projectedMonthlyIncomeFromSavings / inflatedRetirementIncome) * 100
    : 0;

  // Flags
  if (savingsShortfall > 0) flags.push('You have a retirement savings shortfall — consider increasing contributions');
  if (postCareerGapYears > 5) flags.push(`${postCareerGapYears} years between career end and retirement — plan for income during this gap`);
  if (incomeReplacementRatio < 75 && incomeReplacementRatio > 0) flags.push('Your projected retirement income may not maintain your current lifestyle');
  if (financial.monthlyContribution === 0) flags.push('No current monthly savings — start contributing now to benefit from compound growth');
  if (personal.remainingCareerYears <= 3) flags.push('Very short remaining career — prioritise aggressive saving');
  if (yearsToRetirement <= 10) flags.push('Less than 10 years to retirement — review your plan urgently');

  return {
    yearsToRetirement,
    yearsInRetirement,
    retirementCorpusNeeded,
    projectedSavingsAtRetirement,
    savingsShortfall,
    additionalMonthlySavingNeeded,
    projectedMonthlyIncomeFromSavings,
    incomeReplacementRatio,
    postCareerGapYears,
    careerEndAge,
    flags,
  };
};

export const getDefaultRetirementState = (): RetirementState => ({
  personal: {
    profession: 'athlete',
    field: '',
    currentAge: 25,
    retirementAge: 60,
    remainingCareerYears: 10,
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
