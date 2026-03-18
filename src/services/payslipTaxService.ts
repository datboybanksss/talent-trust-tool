import { supabase } from "@/integrations/supabase/client";

export interface PayslipTaxDocument {
  id: string;
  user_id: string;
  title: string;
  document_type: string;
  category: string;
  tax_year: string | null;
  file_name: string | null;
  file_url: string | null;
  status: string;
  notes: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface PayslipTaxDocumentInsert {
  user_id: string;
  title: string;
  document_type: string;
  category: string;
  tax_year?: string;
  file_name?: string;
  file_url?: string;
  status?: string;
  notes?: string;
  expiry_date?: string;
}

// Required document types for tax compliance
export const REQUIRED_TAX_DOCUMENTS = {
  personal: [
    { type: "payslip", label: "Latest Payslip", description: "Most recent month's payslip" },
    { type: "itr", label: "Income Tax Return (ITR)", description: "Annual income tax return filing" },
    { type: "tax_certificate", label: "Tax Certificate / IRP5", description: "Employer-issued tax certificate" },
    { type: "tax_clearance", label: "Tax Clearance Certificate", description: "SARS tax clearance" },
    { type: "medical_tax", label: "Medical Tax Certificate", description: "Medical aid tax certificate" },
    { type: "retirement_annuity", label: "Retirement Annuity Certificate", description: "RA contribution certificate" },
  ],
  business: [
    { type: "vat_return", label: "VAT Return", description: "Latest VAT return submission" },
    { type: "company_tax_return", label: "Company Tax Return", description: "Annual company tax return" },
    { type: "financial_statements", label: "Financial Statements", description: "Audited or reviewed financial statements" },
    { type: "provisional_tax", label: "Provisional Tax", description: "Provisional tax payment proof" },
    { type: "paye_return", label: "PAYE Return", description: "Pay-As-You-Earn return" },
    { type: "business_tax_clearance", label: "Business Tax Clearance", description: "Business tax compliance certificate" },
  ],
};

export const fetchPayslipTaxDocuments = async (userId: string) => {
  const { data, error } = await supabase
    .from("payslip_tax_documents" as any)
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as unknown as PayslipTaxDocument[];
};

export const createPayslipTaxDocument = async (doc: PayslipTaxDocumentInsert) => {
  const { data, error } = await supabase
    .from("payslip_tax_documents" as any)
    .insert(doc as any)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as PayslipTaxDocument;
};

export const updatePayslipTaxDocument = async (id: string, updates: Partial<PayslipTaxDocumentInsert>) => {
  const { data, error } = await supabase
    .from("payslip_tax_documents" as any)
    .update(updates as any)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as unknown as PayslipTaxDocument;
};

export const deletePayslipTaxDocument = async (id: string) => {
  const { error } = await supabase
    .from("payslip_tax_documents" as any)
    .delete()
    .eq("id", id);

  if (error) throw error;
};

export const uploadPayslipTaxFile = async (userId: string, file: File) => {
  const fileName = `${userId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabase.storage
    .from("payslip-tax-documents")
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("payslip-tax-documents")
    .getPublicUrl(data.path);

  return { path: data.path, url: urlData.publicUrl };
};

export const deletePayslipTaxFile = async (path: string) => {
  const { error } = await supabase.storage
    .from("payslip-tax-documents")
    .remove([path]);

  if (error) throw error;
};

// Determine which required documents are missing
export const getMissingDocuments = (
  documents: PayslipTaxDocument[],
  category: "personal" | "business"
) => {
  const required = REQUIRED_TAX_DOCUMENTS[category];
  const uploadedTypes = documents
    .filter((d) => d.category === category)
    .map((d) => d.document_type);

  return required.filter((req) => !uploadedTypes.includes(req.type));
};
