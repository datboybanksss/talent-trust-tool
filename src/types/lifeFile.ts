import { Tables } from "@/integrations/supabase/types";

export type Beneficiary = Tables<"beneficiaries">;
export type EmergencyContact = Tables<"emergency_contacts">;
export type LifeFileDocument = Tables<"life_file_documents">;

export type BeneficiaryInsert = Omit<Beneficiary, "id" | "created_at" | "updated_at">;
export type EmergencyContactInsert = Omit<EmergencyContact, "id" | "created_at" | "updated_at">;
export type LifeFileDocumentInsert = Omit<LifeFileDocument, "id" | "created_at" | "updated_at">;

export const DOCUMENT_TYPES = [
  { value: "will", label: "Last Will & Testament" },
  { value: "poa", label: "Power of Attorney" },
  { value: "living_will", label: "Living Will / Healthcare Directive" },
  { value: "trust", label: "Trust Documents" },
  { value: "insurance", label: "Insurance Policies" },
  { value: "property", label: "Property Deeds" },
  { value: "investment", label: "Investment Documents" },
  { value: "pension", label: "Pension / Retirement" },
  { value: "other", label: "Other" },
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
