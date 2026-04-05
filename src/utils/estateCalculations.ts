// South African Estate Planning & Income Calculator - Core Logic

export interface ProfileInputs {
  profession: 'athlete' | 'entertainer' | 'hybrid';
  field: string;
  currentAge: number;
  remainingCareerYears: number;
  contractType: 'fixed-term' | 'sponsorship' | 'royalties' | 'performance-linked';
  injuryRisk: 'low' | 'medium' | 'high';
  maritalStatus: 'single' | 'married-in-community' | 'married-out-community' | 'married-out-accrual' | 'divorced' | 'widowed';
  numberOfDependants: number;
  dependantsDependencyYears: number;
}

export interface IncomeInputs {
  averageAnnualIncome: number;
  highestEarningYear: number;
  lowestEarningYear: number;
  guaranteedIncomePct: number;
  variableIncomePct: number;
  expectedPostCareerIncome: number;
}

export interface AssetItem {
  id: string;
  type: 'residential-property' | 'investment-property' | 'cash-savings' | 'investments' | 'royalties-capitalised' | 'business-interests' | 'loan-accounts' | 'life-policies-estate';
  description: string;
  value: number;
}

export interface LiabilityItem {
  id: string;
  type: 'home-loan' | 'vehicle-finance' | 'personal-loan' | 'lifestyle-debt' | 'tax-liabilities' | 'business-guarantees' | 'funeral-costs';
  description: string;
  value: number;
}

export interface DependantNeeds {
  monthlyFamilyExpenses: number;
  educationCosts: number;
  spouseReplacementYears: number;
  specialNeedsDependants: number;
  legacyCapital: number;
  inflationRate: number;
}

export interface ProtectionProduct {
  id: string;
  type: 'life-cover-estate' | 'life-cover-beneficiary' | 'life-cover-credit' | 'disability' | 'severe-illness' | 'income-protection' | 'career-ending-injury' | 'credit-life';
  description: string;
  coverAmount: number;
  linkedTo: ('estate-obligations' | 'dependant-income' | 'liquidity-shortfall')[];
}

export interface LongTermStructure {
  id: string;
  type: 'retirement-fund' | 'living-annuity' | 'trust-policy' | 'image-rights' | 'royalty-structure';
  description: string;
  value: number;
}

export interface CalculatorState {
  profile: ProfileInputs;
  income: IncomeInputs;
  assets: AssetItem[];
  liabilities: LiabilityItem[];
  dependantNeeds: DependantNeeds;
  protectionProducts: ProtectionProduct[];
  longTermStructures: LongTermStructure[];
}

// --- Calculation Functions ---

export const computeSustainableIncome = (income: IncomeInputs): number => {
  const weightedAvg = income.averageAnnualIncome;
  const guaranteedPortion = weightedAvg * (income.guaranteedIncomePct / 100);
  const variablePortion = weightedAvg * (income.variableIncomePct / 100) * 0.6; // discount variable by 40%
  return guaranteedPortion + variablePortion;
};

export const computeIncomeCliffRisk = (income: IncomeInputs): { dropAmount: number; severity: 'low' | 'medium' | 'high' | 'critical' } => {
  const dropAmount = income.highestEarningYear - income.lowestEarningYear;
  const dropPct = income.highestEarningYear > 0 ? dropAmount / income.highestEarningYear : 0;
  const severity = dropPct > 0.7 ? 'critical' : dropPct > 0.5 ? 'high' : dropPct > 0.3 ? 'medium' : 'low';
  return { dropAmount, severity };
};

export const computeGrossEstate = (assets: AssetItem[]): number => {
  return assets.reduce((sum, a) => sum + a.value, 0);
};

export const computeTotalLiabilities = (liabilities: LiabilityItem[]): number => {
  return liabilities.reduce((sum, l) => sum + l.value, 0);
};

export const computeNetEstate = (assets: AssetItem[], liabilities: LiabilityItem[]): number => {
  return computeGrossEstate(assets) - computeTotalLiabilities(liabilities);
};

export const computeExecutorFees = (grossEstate: number): number => {
  const fee = grossEstate * 0.035;
  const vat = fee * 0.15;
  return fee + vat;
};

export const computeEstateDuty = (netEstate: number): number => {
  const abatement = 3_500_000;
  const dutiable = Math.max(0, netEstate - abatement);
  if (dutiable <= 30_000_000) {
    return dutiable * 0.20;
  }
  return 30_000_000 * 0.20 + (dutiable - 30_000_000) * 0.25;
};

export const computeAdminLegalCosts = (grossEstate: number): number => {
  return Math.max(50_000, grossEstate * 0.005); // ~0.5% estimate, min R50k
};

export const computeTotalEstateCosts = (grossEstate: number, netEstate: number): {
  executorFees: number;
  estateDuty: number;
  adminCosts: number;
  total: number;
} => {
  const executorFees = computeExecutorFees(grossEstate);
  const estateDuty = computeEstateDuty(netEstate);
  const adminCosts = computeAdminLegalCosts(grossEstate);
  return {
    executorFees,
    estateDuty,
    adminCosts,
    total: executorFees + estateDuty + adminCosts,
  };
};

export const capitaliseIncomeNeeds = (needs: DependantNeeds, years: number): number => {
  const annualExpenses = needs.monthlyFamilyExpenses * 12;
  const rate = needs.inflationRate / 100;
  // Present value of annuity with inflation
  let total = 0;
  for (let y = 1; y <= years; y++) {
    total += annualExpenses * Math.pow(1 + rate, y) / Math.pow(1.08, y); // discount at 8%
  }
  total += needs.educationCosts;
  total += needs.legacyCapital;
  return total;
};

export interface ScenarioResult {
  name: string;
  description: string;
  estateLiquidityRequired: number;
  liquidityAvailable: number;
  productsResponding: { description: string; amount: number }[];
  uncoveredShortfall: number;
  atRiskDependants: number;
  flags: string[];
}

export const computeScenarios = (state: CalculatorState): ScenarioResult[] => {
  const grossEstate = computeGrossEstate(state.assets);
  const totalLiabilities = computeTotalLiabilities(state.liabilities);
  const netEstate = grossEstate - totalLiabilities;
  const estateCosts = computeTotalEstateCosts(grossEstate, netEstate);
  const capitalisedNeeds = capitaliseIncomeNeeds(state.dependantNeeds, state.profile.dependantsDependencyYears);

  // Liquid assets (cash & investments only)
  const liquidAssets = state.assets
    .filter(a => ['cash-savings', 'investments'].includes(a.type))
    .reduce((s, a) => s + a.value, 0);

  // Products that respond by linked type
  const getProductsForLink = (link: string) =>
    state.protectionProducts
      .filter(p => p.linkedTo.includes(link as any))
      .map(p => ({ description: p.description, amount: p.coverAmount }));

  const estateProducts = getProductsForLink('estate-obligations');
  const dependantProducts = getProductsForLink('dependant-income');
  const liquidityProducts = getProductsForLink('liquidity-shortfall');
  const allProductsTotal = state.protectionProducts.reduce((s, p) => s + p.coverAmount, 0);

  // Scenario 1: Sudden Death During Peak Career
  const s1Required = estateCosts.total + totalLiabilities + capitalisedNeeds;
  const s1Available = liquidAssets + estateProducts.reduce((s, p) => s + p.amount, 0) + dependantProducts.reduce((s, p) => s + p.amount, 0);
  const s1Shortfall = Math.max(0, s1Required - s1Available);
  const s1Flags: string[] = [];
  if (s1Shortfall > 0) s1Flags.push('Estate liquidity shortfall');
  if (state.income.variableIncomePct > 60) s1Flags.push('Over-reliance on non-guaranteed income');
  if (liquidAssets < estateCosts.total) s1Flags.push('Forced asset sale risk');
  if (state.profile.numberOfDependants > 0 && dependantProducts.length === 0) s1Flags.push('Dependants exposed due to income volatility');

  // Scenario 2: Career-Ending Injury
  const sustainableIncome = computeSustainableIncome(state.income);
  const yearsLost = state.profile.remainingCareerYears;
  const incomeLoss = sustainableIncome * yearsLost;
  const disabilityProducts = state.protectionProducts
    .filter(p => ['disability', 'career-ending-injury', 'income-protection'].includes(p.type))
    .map(p => ({ description: p.description, amount: p.coverAmount }));
  const s2Required = incomeLoss + capitalisedNeeds * 0.8; // 80% of full needs
  const s2Available = liquidAssets + disabilityProducts.reduce((s, p) => s + p.amount, 0) + state.income.expectedPostCareerIncome * yearsLost;
  const s2Shortfall = Math.max(0, s2Required - s2Available);
  const s2Flags: string[] = [];
  if (s2Shortfall > 0) s2Flags.push('Estate liquidity shortfall');
  if (disabilityProducts.length === 0) s2Flags.push('No disability/injury cover in place');
  if (state.profile.injuryRisk === 'high') s2Flags.push('High injury risk profile with insufficient cover');

  // Scenario 3: Natural Career End with Inadequate Savings
  const retirementFunds = state.longTermStructures
    .filter(s => ['retirement-fund', 'living-annuity'].includes(s.type))
    .reduce((s, st) => s + st.value, 0);
  const postCareerYears = 65 - (state.profile.currentAge + state.profile.remainingCareerYears);
  const s3Required = capitalisedNeeds * 0.6 + (state.dependantNeeds.monthlyFamilyExpenses * 12 * Math.max(0, postCareerYears));
  const s3Available = retirementFunds + liquidAssets + state.income.expectedPostCareerIncome * Math.max(0, postCareerYears);
  const s3Shortfall = Math.max(0, s3Required - s3Available);
  const s3Flags: string[] = [];
  if (s3Shortfall > 0) s3Flags.push('Inadequate post-career savings');
  if (retirementFunds < capitalisedNeeds * 0.3) s3Flags.push('Over-reliance on non-guaranteed income');
  if (state.income.expectedPostCareerIncome < state.dependantNeeds.monthlyFamilyExpenses * 12 * 0.5) s3Flags.push('Dependants exposed due to income volatility');

  return [
    {
      name: 'Sudden Death During Peak Career',
      description: 'Models the financial impact of sudden death while actively earning at peak levels.',
      estateLiquidityRequired: s1Required,
      liquidityAvailable: s1Available,
      productsResponding: [...estateProducts, ...dependantProducts],
      uncoveredShortfall: s1Shortfall,
      atRiskDependants: s1Shortfall > 0 ? state.profile.numberOfDependants : 0,
      flags: s1Flags,
    },
    {
      name: 'Career-Ending Injury',
      description: 'Models the financial impact of a permanent injury ending the earning career immediately.',
      estateLiquidityRequired: s2Required,
      liquidityAvailable: s2Available,
      productsResponding: disabilityProducts,
      uncoveredShortfall: s2Shortfall,
      atRiskDependants: s2Shortfall > 0 ? state.profile.numberOfDependants : 0,
      flags: s2Flags,
    },
    {
      name: 'Natural Career End – Inadequate Savings',
      description: 'Models the risk of reaching natural career end without sufficient savings or structures.',
      estateLiquidityRequired: s3Required,
      liquidityAvailable: s3Available,
      productsResponding: state.longTermStructures.map(s => ({ description: s.description, amount: s.value })),
      uncoveredShortfall: s3Shortfall,
      atRiskDependants: s3Shortfall > 0 ? state.profile.numberOfDependants : 0,
      flags: s3Flags,
    },
  ];
};

export const formatZAR = (value: number): string => {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

export const getDefaultState = (): CalculatorState => ({
  profile: {
    profession: 'athlete',
    field: '',
    currentAge: 25,
    remainingCareerYears: 10,
    contractType: 'fixed-term',
    injuryRisk: 'medium',
    maritalStatus: 'single',
    numberOfDependants: 0,
    dependantsDependencyYears: 18,
  },
  income: {
    averageAnnualIncome: 0,
    highestEarningYear: 0,
    lowestEarningYear: 0,
    guaranteedIncomePct: 50,
    variableIncomePct: 50,
    expectedPostCareerIncome: 0,
  },
  assets: [],
  liabilities: [
    { id: 'funeral', type: 'funeral-costs', description: 'Funeral Costs', value: 50000 },
  ],
  dependantNeeds: {
    monthlyFamilyExpenses: 0,
    educationCosts: 0,
    spouseReplacementYears: 20,
    specialNeedsDependants: 0,
    legacyCapital: 0,
    inflationRate: 6,
  },
  protectionProducts: [],
  longTermStructures: [],
});
