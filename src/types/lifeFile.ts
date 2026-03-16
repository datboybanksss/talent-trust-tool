import { Tables } from "@/integrations/supabase/types";

export type Beneficiary = Tables<"beneficiaries">;
export type EmergencyContact = Tables<"emergency_contacts">;
export type LifeFileDocument = Tables<"life_file_documents">;

export type BeneficiaryInsert = Omit<Beneficiary, "id" | "created_at" | "updated_at">;
export type EmergencyContactInsert = Omit<EmergencyContact, "id" | "created_at" | "updated_at">;
export type LifeFileDocumentInsert = Omit<LifeFileDocument, "id" | "created_at" | "updated_at">;

export const DOCUMENT_TYPES = [
  // Wills
  { value: "will", label: "Last Will & Testament" },
  { value: "living_will", label: "Living Will / Healthcare Directive" },
  { value: "codicil", label: "Codicil (Will Amendment)" },
  // Trusts
  { value: "trust", label: "Trust Documents" },
  { value: "family_trust", label: "Family Trust" },
  { value: "testamentary_trust", label: "Testamentary Trust" },
  { value: "living_trust", label: "Living / Inter Vivos Trust" },
  { value: "special_trust", label: "Special Trust" },
  // Power of Attorney
  { value: "poa", label: "Power of Attorney (General)" },
  { value: "special_poa", label: "Special / Limited Power of Attorney" },
  { value: "healthcare_poa", label: "Healthcare Power of Attorney" },
  // Letters & Instructions
  { value: "letter_of_wishes", label: "Letter of Wishes" },
  { value: "funeral_instructions", label: "Funeral Instructions" },
  { value: "digital_asset_instructions", label: "Digital Asset Instructions" },
  { value: "executor_info", label: "Executor Information" },
  // Insurance
  { value: "life_insurance", label: "Life Insurance" },
  { value: "medical_aid", label: "Medical Aid / Health Insurance" },
  { value: "keyman_insurance", label: "Key Man Insurance" },
  { value: "funeral_policy", label: "Funeral Policy" },
  { value: "disability_insurance", label: "Disability / Income Protection" },
  { value: "short_term_insurance", label: "Short-Term Insurance" },
  { value: "insurance", label: "Other Insurance" },
  // Other estate docs
  { value: "property", label: "Property Deeds" },
  { value: "investment", label: "Investment Documents" },
  { value: "pension", label: "Pension / Retirement" },
  { value: "other", label: "Other" },
] as const;

export const ESTATE_FOLDERS = [
  {
    key: "wills",
    label: "Wills",
    description: "Last Will & Testament, Living Wills, and amendments",
    documentTypes: ["will", "living_will", "codicil"],
    subfolders: [
      { value: "will", label: "Last Will & Testament" },
      { value: "living_will", label: "Living Will / Healthcare Directive" },
      { value: "codicil", label: "Codicil (Will Amendment)" },
    ],
  },
  {
    key: "trusts",
    label: "Trusts",
    description: "Family, testamentary, living and special trusts",
    documentTypes: ["trust", "family_trust", "testamentary_trust", "living_trust", "special_trust"],
    subfolders: [
      { value: "family_trust", label: "Family Trust" },
      { value: "testamentary_trust", label: "Testamentary Trust" },
      { value: "living_trust", label: "Living / Inter Vivos Trust" },
      { value: "special_trust", label: "Special Trust" },
      { value: "trust", label: "Other Trust Documents" },
    ],
  },
  {
    key: "poa",
    label: "Power of Attorney",
    description: "General, special, and healthcare powers of attorney",
    documentTypes: ["poa", "special_poa", "healthcare_poa"],
    subfolders: [
      { value: "poa", label: "General Power of Attorney" },
      { value: "special_poa", label: "Special / Limited PoA" },
      { value: "healthcare_poa", label: "Healthcare PoA" },
    ],
  },
  {
    key: "letters",
    label: "Letters & Instructions",
    description: "Wishes, funeral plans, digital assets, and executor details",
    documentTypes: ["letter_of_wishes", "funeral_instructions", "digital_asset_instructions", "executor_info"],
    subfolders: [
      { value: "letter_of_wishes", label: "Letter of Wishes" },
      { value: "funeral_instructions", label: "Funeral Instructions" },
      { value: "digital_asset_instructions", label: "Digital Asset Instructions" },
      { value: "executor_info", label: "Executor Information" },
    ],
  },
] as const;

export const RELATIONSHIPS = [
  "Spouse",
  "Child",
  "Parent",
  "Sibling",
  "Partner",
  "Friend",
  "Attorney",
  "Financial Advisor",
  "Other",
] as const;
