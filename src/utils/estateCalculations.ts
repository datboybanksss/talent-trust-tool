// Insurance Needs Estimator - South African Context

export interface PersonalDetails {
  profession: 'athlete' | 'entertainer' | 'hybrid';
  field: string;
  currentAge: number;
  remainingCareerYears: number;
  maritalStatus: 'single' | 'married-in-community' | 'married-out-community' | 'married-out-accrual' | 'divorced' | 'widowed';
  numberOfDependants: number;
  dependantsDependencyYears: number;
}

export interface FinancialDetails {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalAssets: number;
  totalDebts: number;
  existingLifeCover: number;
  existingDisabilityCover: number;
  educationCosts: number;
  funeralCosts: number;
  inflationRate: number;
  propertyValue: number;
  propertyTransferNeeded: boolean;
}

export interface EstimatorState {
  personal: PersonalDetails;
  financial: FinancialDetails;
}

export interface PropertyTransferCosts {
  transferDuty: number;
  conveyancingFees: number;
  ratesClearance: number;
  deedsOfficeFees: number;
  total: number;
}

export interface InsuranceEstimate {
  // Death cover
  estateCosts: { executorFees: number; estateDuty: number; adminCosts: number; total: number };
  debtSettlement: number;
  incomeReplacement: number;
  educationFund: number;
  funeralCosts: number;
  propertyTransferCosts: PropertyTransferCosts;
  totalDeathNeed: number;
  existingLifeCover: number;
  lifeShortfall: number;

  // Disability cover
  lostCareerIncome: number;
  ongoingExpenses: number;
  totalDisabilityNeed: number;
  existingDisabilityCover: number;
  disabilityShortfall: number;

  flags: string[];
}

// SA Estate Duty: R3.5m abatement, 20% up to R30m, 25% above
const computeEstateDuty = (netEstate: number): number => {
  const abatement = 3_500_000;
  const dutiable = Math.max(0, netEstate - abatement);
  if (dutiable <= 30_000_000) return dutiable * 0.20;
  return 30_000_000 * 0.20 + (dutiable - 30_000_000) * 0.25;
};

// Executor's Fees: 3.5% + 15% VAT
const computeExecutorFees = (grossEstate: number): number => {
  const fee = grossEstate * 0.035;
  return fee + fee * 0.15;
};

const computeAdminCosts = (grossEstate: number): number => {
  return Math.max(50_000, grossEstate * 0.005);
};

// Capitalise future expenses using present value
const capitaliseAnnuity = (annualAmount: number, years: number, inflationRate: number): number => {
  const discountRate = 0.08;
  const rate = inflationRate / 100;
  let total = 0;
  for (let y = 1; y <= years; y++) {
    total += annualAmount * Math.pow(1 + rate, y) / Math.pow(1 + discountRate, y);
  }
  return total;
};

// SA Transfer Duty (2024 rates)
const computeTransferDuty = (propertyValue: number): number => {
  if (propertyValue <= 1_100_000) return 0;
  if (propertyValue <= 1_512_500) return (propertyValue - 1_100_000) * 0.03;
  if (propertyValue <= 2_117_500) return 12_375 + (propertyValue - 1_512_500) * 0.06;
  if (propertyValue <= 2_722_500) return 48_675 + (propertyValue - 2_117_500) * 0.08;
  if (propertyValue <= 12_100_000) return 97_075 + (propertyValue - 2_722_500) * 0.11;
  return 1_128_600 + (propertyValue - 12_100_000) * 0.13;
};

// Conveyancing fees (SA guideline scale, simplified)
const computeConveyancingFees = (propertyValue: number): number => {
  if (propertyValue <= 0) return 0;
  if (propertyValue <= 500_000) return 8_500;
  if (propertyValue <= 1_000_000) return 12_500;
  if (propertyValue <= 2_000_000) return 18_000;
  if (propertyValue <= 5_000_000) return 30_000;
  if (propertyValue <= 10_000_000) return 45_000;
  return 65_000;
};

const computePropertyTransferCosts = (propertyValue: number): PropertyTransferCosts => {
  const transferDuty = computeTransferDuty(propertyValue);
  const conveyancingFees = computeConveyancingFees(propertyValue);
  const ratesClearance = Math.max(2_000, propertyValue * 0.001);
  const deedsOfficeFees = 1_500;
  return {
    transferDuty,
    conveyancingFees,
    ratesClearance,
    deedsOfficeFees,
    total: transferDuty + conveyancingFees + ratesClearance + deedsOfficeFees,
  };
};

export const computeInsuranceEstimate = (state: EstimatorState): InsuranceEstimate => {
  const { personal, financial } = state;
  const flags: string[] = [];

  // --- DEATH COVER ---
  const grossEstate = financial.totalAssets;
  const netEstate = grossEstate - financial.totalDebts;
  const executorFees = computeExecutorFees(grossEstate);
  const estateDuty = computeEstateDuty(netEstate);
  const adminCosts = computeAdminCosts(grossEstate);
  const estateCostsTotal = executorFees + estateDuty + adminCosts;

  const debtSettlement = financial.totalDebts;
  const annualExpenses = financial.monthlyExpenses * 12;
  const incomeReplacement = capitaliseAnnuity(annualExpenses, personal.dependantsDependencyYears, financial.inflationRate);
  const educationFund = financial.educationCosts;
  const funeralCosts = financial.funeralCosts;

  const totalDeathNeed = estateCostsTotal + debtSettlement + incomeReplacement + educationFund + funeralCosts;
  const lifeShortfall = Math.max(0, totalDeathNeed - financial.existingLifeCover);

  // --- DISABILITY COVER ---
  const annualIncome = financial.monthlyIncome * 12;
  const lostCareerIncome = annualIncome * personal.remainingCareerYears;
  const ongoingExpenses = capitaliseAnnuity(annualExpenses, personal.remainingCareerYears, financial.inflationRate);
  const totalDisabilityNeed = Math.max(lostCareerIncome, ongoingExpenses);
  const disabilityShortfall = Math.max(0, totalDisabilityNeed - financial.existingDisabilityCover);

  // Flags
  if (lifeShortfall > 0) flags.push('You may not have enough life cover to protect your family');
  if (disabilityShortfall > 0) flags.push('You may not have enough disability cover to replace your income');
  if (financial.totalDebts > financial.totalAssets * 0.5) flags.push('High debt-to-asset ratio increases risk');
  if (personal.numberOfDependants > 0 && financial.existingLifeCover === 0) flags.push('Dependants are unprotected — no existing life cover');
  if (personal.remainingCareerYears <= 5) flags.push('Short remaining career — plan for income transition');

  return {
    estateCosts: { executorFees, estateDuty, adminCosts, total: estateCostsTotal },
    debtSettlement,
    incomeReplacement,
    educationFund,
    funeralCosts,
    totalDeathNeed,
    existingLifeCover: financial.existingLifeCover,
    lifeShortfall,
    lostCareerIncome,
    ongoingExpenses,
    totalDisabilityNeed,
    existingDisabilityCover: financial.existingDisabilityCover,
    disabilityShortfall,
    flags,
  };
};

export const formatZAR = (value: number): string => {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

export const getDefaultState = (): EstimatorState => ({
  personal: {
    profession: 'athlete',
    field: '',
    currentAge: 25,
    remainingCareerYears: 10,
    maritalStatus: 'single',
    numberOfDependants: 0,
    dependantsDependencyYears: 18,
  },
  financial: {
    monthlyIncome: 0,
    monthlyExpenses: 0,
    totalAssets: 0,
    totalDebts: 0,
    existingLifeCover: 0,
    existingDisabilityCover: 0,
    educationCosts: 0,
    funeralCosts: 50000,
    inflationRate: 6,
  },
});
