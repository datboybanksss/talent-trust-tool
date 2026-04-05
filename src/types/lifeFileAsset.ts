export interface LifeFileAsset {
  id: string;
  user_id: string;
  asset_category: "insurance" | "investment";
  asset_type: string;
  institution: string;
  policy_or_account_number: string | null;
  description: string | null;
  amount: number;
  currency: string;
  premium_or_contribution: number | null;
  premium_frequency: string | null;
  beneficiary_names: string | null;
  beneficiary_allocation: string | null;
  start_date: string | null;
  maturity_or_expiry_date: string | null;
  status: string;
  notes: string | null;
  file_url: string | null;
  file_name: string | null;
  created_at: string;
  updated_at: string;
}

export type LifeFileAssetInsert = Omit<LifeFileAsset, "id" | "created_at" | "updated_at">;

export const INSURANCE_TYPES = [
  { value: "life", label: "Life Insurance" },
  { value: "credit_life", label: "Credit Life Insurance" },
  { value: "keyman", label: "Key-Man Insurance" },
  { value: "buy_sell", label: "Buy & Sell Insurance" },
  { value: "disability", label: "Disability / Income Protection" },
  { value: "funeral", label: "Funeral Cover" },
  { value: "medical_aid", label: "Medical Aid / Health Insurance" },
  { value: "gap_cover", label: "Gap Cover" },
  { value: "short_term", label: "Short-Term Insurance" },
  { value: "dread_disease", label: "Dread Disease / Critical Illness" },
  { value: "other_insurance", label: "Other Insurance" },
] as const;

export const INVESTMENT_TYPES = [
  { value: "retirement_annuity", label: "Retirement Annuity (RA)" },
  { value: "pension_fund", label: "Pension Fund" },
  { value: "provident_fund", label: "Provident Fund" },
  { value: "preservation_fund", label: "Preservation Fund" },
  { value: "living_annuity", label: "Living Annuity" },
  { value: "unit_trust", label: "Unit Trust / Collective Investment" },
  { value: "tfsa", label: "Tax-Free Savings Account" },
  { value: "endowment", label: "Endowment Policy" },
  { value: "fixed_deposit", label: "Fixed Deposit" },
  { value: "savings_account", label: "Savings Account" },
  { value: "share_portfolio", label: "Share Portfolio" },
  { value: "property_investment", label: "Property Investment" },
  { value: "offshore", label: "Offshore Investment" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "other_investment", label: "Other Investment" },
] as const;

export const PREMIUM_FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "bi_annually", label: "Bi-Annually" },
  { value: "annually", label: "Annually" },
  { value: "once_off", label: "Once-off / Lump Sum" },
] as const;
