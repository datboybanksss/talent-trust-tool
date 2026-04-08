import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DocumentSearchBot from "@/components/documents/DocumentSearchBot";
import { Button } from "@/components/ui/button";
import {
  FolderLock,
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  File,
  FileImage,
  Eye,
  X,
  ChevronRight,
  ChevronDown,
  PackageCheck,
  Archive,
  FolderInput,
  FolderSync,
  FolderPlus,
  Pencil,
  Check,
  Bell,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { saveAs } from "file-saver";
// @ts-ignore - jszip default export
import JSZip from "jszip";

type ProfileType = "athlete" | "artist";

/* ------------------------------------------------------------------ */
/*  CATEGORY & FOLDER DEFINITIONS                                     */
/* ------------------------------------------------------------------ */

interface FolderDef {
  id: string;
  name: string;
  count: number;
  hasSubfolders?: boolean;
}

const DOCUMENT_CATEGORIES = [
  // Personal ID
  { value: "passport", label: "Passport" },
  { value: "id_document", label: "Identity Document" },
  { value: "birth_certificate", label: "Birth Certificate" },
  // Marriage & Family
  { value: "marriage_certificate", label: "Marriage Certificate" },
  { value: "marriage_agreement", label: "Antenuptial / Marriage Agreement" },
  { value: "divorce_decree", label: "Divorce Decree" },
  { value: "maintenance_order", label: "Maintenance Order" },
  // Children
  { value: "child_birth_cert", label: "Child Birth Certificate" },
  { value: "child_school", label: "School Enrolment / Reports" },
  { value: "child_medical", label: "Child Medical Records" },
  { value: "child_passport", label: "Child Passport" },
  { value: "child_custody", label: "Custody Agreement" },
  // Academic
  { value: "degree", label: "Degree / Diploma" },
  { value: "matric", label: "Matric Certificate" },
  { value: "professional_cert", label: "Professional Certification" },
  { value: "training_cert", label: "Training / Course Certificate" },
  // Finance – Banking
  { value: "finance_banking", label: "Bank Statement / Account" },
  { value: "finance_credit", label: "Credit Card / Loan Agreement" },
  // Finance – Investments
  { value: "finance_investments", label: "Investment Portfolio" },
  { value: "finance_stocks", label: "Stocks & Shares" },
  { value: "finance_crypto", label: "Cryptocurrency" },
  // Finance – Pension & Retirement
  { value: "finance_pension", label: "Pension / Retirement Fund" },
  { value: "finance_ra", label: "Retirement Annuity" },
  // Finance – Insurance
  { value: "finance_life_insurance", label: "Life Insurance" },
  { value: "finance_medical_aid", label: "Medical Aid / Health Insurance" },
  { value: "finance_short_term", label: "Short-Term Insurance" },
  { value: "finance_disability", label: "Disability / Income Protection" },
  // Health & Medical
  { value: "medical_records", label: "Medical Records" },
  { value: "medical_prescription", label: "Prescriptions" },
  { value: "medical_specialist", label: "Specialist Reports" },
  { value: "medical_dental", label: "Dental Records" },
  { value: "medical_mental", label: "Mental Health Records" },
  // Housing & Property
  { value: "title_deed", label: "Title Deed" },
  { value: "lease_agreement", label: "Lease / Rental Agreement" },
  { value: "bond_statement", label: "Bond / Mortgage Statement" },
  { value: "rates_account", label: "Rates & Utilities Account" },
  { value: "homeowners_insurance", label: "Homeowners Insurance" },
  // Vehicles
  { value: "vehicle_registration", label: "Vehicle Registration" },
  { value: "vehicle_license", label: "Vehicle License Disc" },
  { value: "vehicle_insurance", label: "Vehicle Insurance" },
  { value: "vehicle_finance", label: "Vehicle Finance Agreement" },
  { value: "drivers_license", label: "Driver's License" },
  // Work & Employment
  { value: "employment_contract", label: "Employment Contract" },
  { value: "payslip", label: "Payslip" },
  { value: "letter_of_appointment", label: "Letter of Appointment" },
  { value: "work_permit", label: "Work Permit / Visa" },
  { value: "nda", label: "NDA / Confidentiality Agreement" },
  { value: "reference_letter", label: "Reference Letter" },
  // Contracts (general + sport/art specific)
  { value: "contracts", label: "General Contracts" },
  { value: "endorsement", label: "Endorsement Contract" },
  { value: "sponsorship", label: "Sponsorship Agreement" },
  { value: "team_contract", label: "Team Contract" },
  { value: "agent_agreement", label: "Agent / Manager Agreement" },
  { value: "image_rights", label: "Image Rights" },
  { value: "recording", label: "Recording Contract" },
  { value: "publishing", label: "Publishing Deal" },
  { value: "royalty_agreement", label: "Royalty Agreement" },
  { value: "distribution", label: "Distribution Deal" },
  { value: "performance_contract", label: "Performance Contract" },
  // Tax – Personal
  { value: "payslip_doc", label: "Payslip (Tax)" },
  { value: "tax_return", label: "Tax Return / ITR12" },
  { value: "irp5", label: "IRP5 / IT3(a)" },
  { value: "tax_certificate", label: "Tax Certificate / IRP5" },
  { value: "tax_clearance", label: "Tax Clearance Certificate" },
  { value: "medical_tax", label: "Medical Tax Certificate" },
  { value: "retirement_annuity_cert", label: "Retirement Annuity Certificate" },
  // Tax – Business
  { value: "vat_return", label: "VAT Return" },
  { value: "company_tax_return", label: "Company Tax Return" },
  { value: "provisional_tax", label: "Provisional Tax" },
  { value: "paye_return", label: "PAYE Return" },
  { value: "business_tax_clearance", label: "Business Tax Clearance" },
  // Company
  { value: "cipc_registration", label: "CIPC Registration" },
  { value: "moi", label: "Memorandum of Incorporation" },
  { value: "director_resolution", label: "Director Resolution" },
  { value: "company_financials", label: "Company Financial Statements" },
  // Compliance
  { value: "fica", label: "FICA Documents" },
  { value: "bbbee", label: "B-BBEE Certificate" },
  { value: "compliance_other", label: "Other Compliance" },
  // Other
  { value: "personal_other", label: "Other Personal" },
];

/* ---- LIFE-CATEGORY FOLDERS ---- */

const baseFolders: FolderDef[] = [
  { id: "all", name: "All Documents", count: 0 },
  { id: "personal_id", name: "Personal ID", count: 0, hasSubfolders: true },
  { id: "marriage_family", name: "Marriage & Family", count: 0, hasSubfolders: true },
  { id: "children", name: "Children", count: 0, hasSubfolders: true },
  { id: "academic", name: "Academic & Qualifications", count: 0, hasSubfolders: true },
  { id: "finance", name: "Finance", count: 0, hasSubfolders: true },
  { id: "health", name: "Health & Medical", count: 0, hasSubfolders: true },
  { id: "housing", name: "Housing & Property", count: 0, hasSubfolders: true },
  { id: "vehicles", name: "Vehicles", count: 0, hasSubfolders: true },
  { id: "work", name: "Work & Employment", count: 0, hasSubfolders: true },
  { id: "contracts", name: "Contracts", count: 0, hasSubfolders: true },
  { id: "tax", name: "Tax", count: 0, hasSubfolders: true },
  { id: "company", name: "Company", count: 0, hasSubfolders: true },
  { id: "compliance", name: "Compliance", count: 0, hasSubfolders: true },
  { id: "personal_other", name: "Other", count: 0 },
];

const SUBFOLDER_MAP: Record<string, FolderDef[]> = {
  personal_id: [
    { id: "passport", name: "Passports", count: 0 },
    { id: "id_document", name: "Identity Documents", count: 0 },
    { id: "birth_certificate", name: "Birth Certificates", count: 0 },
  ],
  marriage_family: [
    { id: "marriage_certificate", name: "Marriage Certificate", count: 0 },
    { id: "marriage_agreement", name: "Antenuptial / Marriage Agreement", count: 0 },
    { id: "divorce_decree", name: "Divorce Decree", count: 0 },
    { id: "maintenance_order", name: "Maintenance Order", count: 0 },
  ],
  children: [
    { id: "child_birth_cert", name: "Birth Certificates", count: 0 },
    { id: "child_passport", name: "Passports", count: 0 },
    { id: "child_school", name: "School / Reports", count: 0 },
    { id: "child_medical", name: "Medical Records", count: 0 },
    { id: "child_custody", name: "Custody Agreement", count: 0 },
  ],
  academic: [
    { id: "degree", name: "Degrees / Diplomas", count: 0 },
    { id: "matric", name: "Matric Certificate", count: 0 },
    { id: "professional_cert", name: "Professional Certifications", count: 0 },
    { id: "training_cert", name: "Training / Courses", count: 0 },
  ],
  finance: [
    { id: "finance_banking", name: "Banking", count: 0 },
    { id: "finance_credit", name: "Credit / Loans", count: 0 },
    { id: "finance_investments", name: "Investments", count: 0 },
    { id: "finance_stocks", name: "Stocks & Shares", count: 0 },
    { id: "finance_crypto", name: "Cryptocurrency", count: 0 },
    { id: "finance_pension", name: "Pension / Retirement", count: 0 },
    { id: "finance_ra", name: "Retirement Annuity", count: 0 },
    { id: "finance_life_insurance", name: "Life Insurance", count: 0 },
    { id: "finance_medical_aid", name: "Medical Aid / Health Ins.", count: 0 },
    { id: "finance_short_term", name: "Short-Term Insurance", count: 0 },
    { id: "finance_disability", name: "Disability / Income Prot.", count: 0 },
  ],
  health: [
    { id: "medical_records", name: "Medical Records", count: 0 },
    { id: "medical_prescription", name: "Prescriptions", count: 0 },
    { id: "medical_specialist", name: "Specialist Reports", count: 0 },
    { id: "medical_dental", name: "Dental Records", count: 0 },
    { id: "medical_mental", name: "Mental Health", count: 0 },
  ],
  housing: [
    { id: "title_deed", name: "Title Deeds", count: 0 },
    { id: "lease_agreement", name: "Lease / Rental", count: 0 },
    { id: "bond_statement", name: "Bond / Mortgage", count: 0 },
    { id: "rates_account", name: "Rates & Utilities", count: 0 },
    { id: "homeowners_insurance", name: "Homeowners Insurance", count: 0 },
  ],
  vehicles: [
    { id: "vehicle_registration", name: "Registration", count: 0 },
    { id: "vehicle_license", name: "License Disc", count: 0 },
    { id: "vehicle_insurance", name: "Insurance", count: 0 },
    { id: "vehicle_finance", name: "Finance Agreement", count: 0 },
    { id: "drivers_license", name: "Driver's License", count: 0 },
  ],
  work: [
    { id: "employment_contract", name: "Employment Contracts", count: 0 },
    { id: "payslip", name: "Payslips", count: 0 },
    { id: "letter_of_appointment", name: "Appointment Letters", count: 0 },
    { id: "work_permit", name: "Work Permits / Visas", count: 0 },
    { id: "nda", name: "NDAs", count: 0 },
    { id: "reference_letter", name: "Reference Letters", count: 0 },
  ],
  tax: [
    { id: "payslip_doc", name: "Payslips", count: 0 },
    { id: "tax_return", name: "Tax Returns / ITR12", count: 0 },
    { id: "irp5", name: "IRP5 / IT3(a)", count: 0 },
    { id: "tax_certificate", name: "Tax Certificate / IRP5", count: 0 },
    { id: "tax_clearance", name: "Tax Clearance", count: 0 },
    { id: "medical_tax", name: "Medical Tax Certificate", count: 0 },
    { id: "retirement_annuity_cert", name: "Retirement Annuity Cert.", count: 0 },
    { id: "vat_return", name: "VAT Returns", count: 0 },
    { id: "company_tax_return", name: "Company Tax Return", count: 0 },
    { id: "provisional_tax", name: "Provisional Tax", count: 0 },
    { id: "paye_return", name: "PAYE Return", count: 0 },
    { id: "business_tax_clearance", name: "Business Tax Clearance", count: 0 },
  ],
  company: [
    { id: "cipc_registration", name: "CIPC Registration", count: 0 },
    { id: "moi", name: "Memorandum of Incorporation", count: 0 },
    { id: "director_resolution", name: "Director Resolutions", count: 0 },
    { id: "company_financials", name: "Financial Statements", count: 0 },
  ],
  compliance: [
    { id: "fica", name: "FICA Documents", count: 0 },
    { id: "bbbee", name: "B-BBEE Certificate", count: 0 },
    { id: "compliance_other", name: "Other Compliance", count: 0 },
  ],
};

const athleteContractFolders: FolderDef[] = [
  { id: "endorsement", name: "Endorsement Contracts", count: 0 },
  { id: "sponsorship", name: "Sponsorship Agreements", count: 0 },
  { id: "team_contract", name: "Team Contracts", count: 0 },
  { id: "agent_agreement", name: "Agent/Manager Agreements", count: 0 },
  { id: "image_rights", name: "Image Rights", count: 0 },
  { id: "contracts", name: "General Contracts", count: 0 },
];

const artistContractFolders: FolderDef[] = [
  { id: "recording", name: "Recording Contracts", count: 0 },
  { id: "publishing", name: "Publishing Deals", count: 0 },
  { id: "royalty_agreement", name: "Royalty Agreements", count: 0 },
  { id: "distribution", name: "Distribution Deals", count: 0 },
  { id: "performance_contract", name: "Performance Contracts", count: 0 },
  { id: "contracts", name: "General Contracts", count: 0 },
];

/* ------------------------------------------------------------------ */
/*  REQUIRED-DOCUMENT PRESETS (for collate feature)                    */
/* ------------------------------------------------------------------ */

const COLLATE_PRESETS = [
  {
    label: "Visa Application",
    requiredCategories: ["passport", "id_document", "finance_banking", "degree", "medical_records", "employment_contract"],
  },
  {
    label: "Funding / Loan Application",
    requiredCategories: ["id_document", "finance_banking", "finance_investments", "irp5", "tax_clearance", "payslip", "company_financials"],
  },
  {
    label: "Property Purchase",
    requiredCategories: ["id_document", "marriage_certificate", "finance_banking", "tax_clearance", "payslip", "irp5"],
  },
  {
    label: "Sponsorship Pitch",
    requiredCategories: ["id_document", "cipc_registration", "contracts", "bbbee", "company_financials"],
  },
  {
    label: "School Enrolment",
    requiredCategories: ["id_document", "child_birth_cert", "child_passport", "child_medical", "child_school", "finance_banking", "medical_records"],
  },
  {
    label: "Insurance Claim",
    requiredCategories: ["id_document", "finance_life_insurance", "finance_medical_aid", "medical_records", "vehicle_insurance", "homeowners_insurance"],
  },
  {
    label: "Work Permit Application",
    requiredCategories: ["passport", "id_document", "degree", "professional_cert", "employment_contract", "tax_clearance", "medical_records"],
  },
  {
    label: "Tax Filing",
    requiredCategories: ["id_document", "irp5", "tax_return", "finance_banking", "finance_investments", "finance_pension", "company_financials"],
  },
  {
    label: "Divorce Proceedings",
    requiredCategories: ["id_document", "marriage_certificate", "marriage_agreement", "child_birth_cert", "child_custody", "title_deed", "finance_banking", "finance_investments"],
  },
];

/* ------------------------------------------------------------------ */
/*  TAX COMPLIANCE – REQUIRED DOCUMENTS                               */
/* ------------------------------------------------------------------ */

const REQUIRED_TAX_DOCS = {
  personal: [
    { type: "payslip_doc", label: "Latest Payslip", description: "Most recent month's payslip" },
    { type: "tax_return", label: "Income Tax Return (ITR)", description: "Annual income tax return filing" },
    { type: "tax_certificate", label: "Tax Certificate / IRP5", description: "Employer-issued tax certificate" },
    { type: "tax_clearance", label: "Tax Clearance Certificate", description: "SARS tax clearance" },
    { type: "medical_tax", label: "Medical Tax Certificate", description: "Medical aid tax certificate" },
    { type: "retirement_annuity_cert", label: "Retirement Annuity Certificate", description: "RA contribution certificate" },
  ],
  business: [
    { type: "vat_return", label: "VAT Return", description: "Latest VAT return submission" },
    { type: "company_tax_return", label: "Company Tax Return", description: "Annual company tax return" },
    { type: "company_financials", label: "Financial Statements", description: "Audited or reviewed financial statements" },
    { type: "provisional_tax", label: "Provisional Tax", description: "Provisional tax payment proof" },
    { type: "paye_return", label: "PAYE Return", description: "Pay-As-You-Earn return" },
    { type: "business_tax_clearance", label: "Business Tax Clearance", description: "Business tax compliance certificate" },
  ],
};

/* ------------------------------------------------------------------ */
/*  MOCK DATA                                                         */
/* ------------------------------------------------------------------ */

interface DocumentItem {
  id: string;
  name: string;
  type: "pdf" | "doc" | "image";
  category: string;
  date: string;
  size: string;
  expiryDate?: string;
  reminder30?: boolean;
  reminder60?: boolean;
  reminder90?: boolean;
  reminder6m?: boolean;
  reminder1y?: boolean;
  notifyEmail?: string;
  version?: number;
  isExpired?: boolean;
}

const REMINDER_OPTIONS = [
  { key: "reminder30" as const, label: "30 Days Before" },
  { key: "reminder60" as const, label: "60 Days Before" },
  { key: "reminder90" as const, label: "90 Days Before" },
  { key: "reminder6m" as const, label: "6 Months Before" },
  { key: "reminder1y" as const, label: "1 Year Before" },
];

const initialDocuments: DocumentItem[] = [
  // Personal ID
  { id: "1", name: "Passport - John Doe.pdf", type: "pdf", category: "passport", date: "Mar 1, 2026", size: "1.8 MB", expiryDate: "2031-03-01", version: 1 },
  { id: "2", name: "Passport - Jane Doe (Spouse).pdf", type: "pdf", category: "passport", date: "Mar 1, 2026", size: "1.7 MB", expiryDate: "2031-03-01", version: 1 },
  { id: "3", name: "Passport - Child 1.pdf", type: "pdf", category: "child_passport", date: "Feb 20, 2026", size: "1.5 MB", expiryDate: "2031-02-20", version: 1 },
  { id: "4", name: "ID Document - John Doe.jpg", type: "image", category: "id_document", date: "Dec 20, 2025", size: "3.1 MB", version: 1 },
  { id: "5", name: "ID Document - Jane Doe.jpg", type: "image", category: "id_document", date: "Dec 20, 2025", size: "2.9 MB", version: 1 },
  { id: "6", name: "Birth Certificate - John Doe.pdf", type: "pdf", category: "birth_certificate", date: "Jan 5, 1990", size: "620 KB", version: 1 },
  // Marriage & Family
  { id: "7", name: "Marriage Certificate.pdf", type: "pdf", category: "marriage_certificate", date: "Jun 15, 2020", size: "980 KB", version: 1 },
  { id: "8", name: "Antenuptial Contract (ANC).pdf", type: "pdf", category: "marriage_agreement", date: "Jun 10, 2020", size: "1.4 MB", version: 1 },
  // Children
  { id: "9", name: "Birth Certificate - Child 1.pdf", type: "pdf", category: "child_birth_cert", date: "Sep 5, 2022", size: "650 KB", version: 1 },
  { id: "10", name: "School Enrolment Letter.pdf", type: "pdf", category: "child_school", date: "Jan 12, 2026", size: "420 KB", version: 1 },
  { id: "11", name: "Immunisation Card - Child 1.pdf", type: "pdf", category: "child_medical", date: "Oct 1, 2022", size: "380 KB", version: 1 },
  // Academic
  { id: "12", name: "BCom Honours Degree.pdf", type: "pdf", category: "degree", date: "Dec 1, 2018", size: "1.1 MB", version: 1 },
  { id: "13", name: "Matric Certificate.pdf", type: "pdf", category: "matric", date: "Dec 1, 2014", size: "890 KB", version: 1 },
  { id: "14", name: "FIFA Coaching Badge.pdf", type: "pdf", category: "professional_cert", date: "Aug 20, 2023", size: "750 KB", expiryDate: "2027-08-20", version: 1 },
  // Finance
  { id: "15", name: "FNB Cheque Account Statement.pdf", type: "pdf", category: "finance_banking", date: "Mar 1, 2026", size: "2.4 MB", version: 1 },
  { id: "16", name: "Investment Portfolio - Allan Gray.pdf", type: "pdf", category: "finance_investments", date: "Feb 28, 2026", size: "3.2 MB", version: 1 },
  { id: "17", name: "Pension Fund Statement.pdf", type: "pdf", category: "finance_pension", date: "Jan 31, 2026", size: "1.6 MB", version: 1 },
  { id: "18", name: "Life Insurance Policy - Discovery.pdf", type: "pdf", category: "finance_life_insurance", date: "Jan 15, 2026", size: "2.1 MB", expiryDate: "2027-01-15", version: 1 },
  { id: "19", name: "Medical Aid - Discovery Health.pdf", type: "pdf", category: "finance_medical_aid", date: "Jan 1, 2026", size: "1.4 MB", expiryDate: "2027-01-01", version: 1 },
  { id: "20", name: "JSE Share Portfolio.pdf", type: "pdf", category: "finance_stocks", date: "Feb 15, 2026", size: "1.8 MB", version: 1 },
  { id: "21", name: "Crypto Wallet Holdings - Luno.pdf", type: "pdf", category: "finance_crypto", date: "Mar 3, 2026", size: "540 KB", version: 1 },
  { id: "22", name: "Home Loan Agreement - Nedbank.pdf", type: "pdf", category: "finance_credit", date: "Apr 5, 2024", size: "2.6 MB", version: 1 },
  // Health
  { id: "23", name: "Annual Check-Up Report 2025.pdf", type: "pdf", category: "medical_records", date: "Nov 20, 2025", size: "1.3 MB", version: 1 },
  { id: "24", name: "Specialist Report - Orthopaedic.pdf", type: "pdf", category: "medical_specialist", date: "Sep 15, 2025", size: "980 KB", version: 1 },
  { id: "25", name: "Dental X-Ray Results.pdf", type: "pdf", category: "medical_dental", date: "Aug 10, 2025", size: "2.2 MB", version: 1 },
  // Housing
  { id: "26", name: "Title Deed - Sandton Property.pdf", type: "pdf", category: "title_deed", date: "Apr 5, 2024", size: "3.8 MB", version: 1 },
  { id: "27", name: "Bond Statement - Nedbank.pdf", type: "pdf", category: "bond_statement", date: "Mar 1, 2026", size: "1.1 MB", version: 1 },
  { id: "28", name: "Rates Account - CoJ.pdf", type: "pdf", category: "rates_account", date: "Feb 28, 2026", size: "450 KB", version: 1 },
  { id: "29", name: "Homeowners Insurance - Santam.pdf", type: "pdf", category: "homeowners_insurance", date: "Jan 1, 2026", size: "1.8 MB", expiryDate: "2027-01-01", version: 1 },
  // Vehicles
  { id: "30", name: "Vehicle Registration - BMW X5.pdf", type: "pdf", category: "vehicle_registration", date: "Nov 10, 2025", size: "1.2 MB", expiryDate: "2026-11-10", version: 1 },
  { id: "31", name: "Vehicle Insurance - Outsurance.pdf", type: "pdf", category: "vehicle_insurance", date: "Nov 10, 2025", size: "980 KB", expiryDate: "2026-11-10", version: 1 },
  { id: "32", name: "Driver's License - John Doe.jpg", type: "image", category: "drivers_license", date: "Mar 15, 2024", size: "1.5 MB", expiryDate: "2029-03-15", version: 1 },
  // Work
  { id: "33", name: "Employment Contract - Current.pdf", type: "pdf", category: "employment_contract", date: "Jan 15, 2025", size: "2.8 MB", expiryDate: "2028-01-15", version: 1 },
  { id: "34", name: "Payslip - March 2026.pdf", type: "pdf", category: "payslip", date: "Mar 1, 2026", size: "320 KB", version: 1 },
  { id: "35", name: "Work Permit - UK.pdf", type: "pdf", category: "work_permit", date: "Jun 1, 2025", size: "1.9 MB", expiryDate: "2027-06-01", version: 1 },
  { id: "36", name: "Reference Letter - Previous Employer.pdf", type: "pdf", category: "reference_letter", date: "Dec 20, 2024", size: "450 KB", version: 1 },
  // Contracts
  { id: "37", name: "Sponsorship Agreement - Nike.pdf", type: "pdf", category: "sponsorship", date: "Dec 15, 2025", size: "4.5 MB", expiryDate: "2028-12-15", version: 1 },
  { id: "38", name: "Agent Management Agreement.pdf", type: "pdf", category: "agent_agreement", date: "Jan 5, 2026", size: "3.1 MB", expiryDate: "2029-01-05", version: 1 },
  // Tax – Personal
  { id: "39", name: "Tax Clearance Certificate.pdf", type: "pdf", category: "tax_clearance", date: "Dec 10, 2025", size: "890 KB", expiryDate: "2026-12-10", version: 1 },
  { id: "40", name: "IRP5 - 2025 Tax Year.pdf", type: "pdf", category: "irp5", date: "Jul 15, 2025", size: "1.1 MB", version: 1 },
  { id: "46", name: "Payslip - March 2026.pdf", type: "pdf", category: "payslip_doc", date: "Mar 1, 2026", size: "320 KB", version: 1 },
  { id: "47", name: "ITR12 - 2025 Tax Year.pdf", type: "pdf", category: "tax_return", date: "Oct 15, 2025", size: "1.4 MB", version: 1 },
  { id: "48", name: "Medical Tax Certificate 2025.pdf", type: "pdf", category: "medical_tax", date: "Mar 1, 2026", size: "450 KB", version: 1 },
  // Tax – Business
  { id: "49", name: "VAT Return Q1 2026.pdf", type: "pdf", category: "vat_return", date: "Apr 1, 2026", size: "780 KB", version: 1 },
  // Company
  { id: "41", name: "Memorandum of Incorporation.pdf", type: "pdf", category: "moi", date: "Jan 15, 2026", size: "2.4 MB", version: 1 },
  { id: "42", name: "CIPC Registration Certificate.pdf", type: "pdf", category: "cipc_registration", date: "Jan 10, 2026", size: "1.2 MB", version: 1 },
  { id: "43", name: "Director Resolution - Bank Account.docx", type: "doc", category: "director_resolution", date: "Jan 8, 2026", size: "156 KB", version: 1 },
  // Compliance
  { id: "44", name: "FICA - Proof of Address.pdf", type: "pdf", category: "fica", date: "Feb 1, 2026", size: "680 KB", version: 1 },
  { id: "45", name: "B-BBEE Certificate.pdf", type: "pdf", category: "bbbee", date: "Mar 1, 2026", size: "520 KB", expiryDate: "2027-03-01", version: 1 },
];

/* ------------------------------------------------------------------ */
/*  HELPERS                                                           */
/* ------------------------------------------------------------------ */

// Build a map of parent folder → all child category IDs
const PARENT_CAT_MAP: Record<string, string[]> = {};
for (const [parentId, subs] of Object.entries(SUBFOLDER_MAP)) {
  PARENT_CAT_MAP[parentId] = subs.map((s) => s.id);
}
// Contracts also include profile-specific folders
const ALL_CONTRACT_CATS = [
  ...athleteContractFolders.map((f) => f.id),
  ...artistContractFolders.map((f) => f.id),
];
PARENT_CAT_MAP["contracts"] = [...new Set([...(PARENT_CAT_MAP["contracts"] || []), ...ALL_CONTRACT_CATS])];

function matchesFolder(doc: DocumentItem, folderId: string): boolean {
  if (folderId === "all") return true;
  if (PARENT_CAT_MAP[folderId]) return PARENT_CAT_MAP[folderId].includes(doc.category);
  return doc.category === folderId;
}

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                         */
/* ------------------------------------------------------------------ */

const Documents = () => {
  const { user } = useAuth();
  const [docs, setDocs] = useState<DocumentItem[]>([]);
  const [docsLoading, setDocsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [profileType, setProfileType] = useState<ProfileType>("athlete");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadForm, setUploadForm] = useState({ title: "", category: "", file: null as File | null, expiryDate: "", reminder30: false, reminder60: false, reminder90: false, reminder6m: false, reminder1y: false, notifyEmail: "" });

  // Collate state
  const [collateMode, setCollateMode] = useState(false);
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [collatePreset, setCollatePreset] = useState("");

  // Move single doc state
  const [moveDocId, setMoveDocId] = useState<string | null>(null);
  const [moveTarget, setMoveTarget] = useState("");

  // Drag-and-drop state
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const dragDocId = useRef<string | null>(null);

  // Batch assign state
  // Tax compliance state
  const [taxComplianceTab, setTaxComplianceTab] = useState<"personal" | "business">("personal");
  const [batchCategory, setBatchCategory] = useState("");

  // Custom folders state
  const [customFolders, setCustomFolders] = useState<FolderDef[]>([]);
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  // Rename folder state
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [folderNameOverrides, setFolderNameOverrides] = useState<Record<string, string>>({});

  // Fetch documents from database
  const fetchDocs = useCallback(async () => {
    if (!user) return;
    setDocsLoading(true);
    const { data, error } = await supabase
      .from("life_file_documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching documents:", error);
    } else {
      const mapped: DocumentItem[] = (data || []).map((d) => ({
        id: d.id,
        name: d.file_name || d.title,
        type: (d.file_name?.endsWith(".pdf") ? "pdf" : d.file_name?.match(/\.(jpg|jpeg|png)$/i) ? "image" : "doc") as "pdf" | "doc" | "image",
        category: d.document_type,
        date: new Date(d.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        size: "-",
        expiryDate: d.expiry_date || undefined,
        reminder30: d.reminder_30_days,
        reminder60: d.reminder_60_days,
        reminder90: d.reminder_90_days,
        reminder6m: d.reminder_6_months,
        reminder1y: d.reminder_1_year,
        notifyEmail: d.notify_email || undefined,
        version: d.version,
        isExpired: d.is_expired,
      }));
      setDocs(mapped);
    }
    setDocsLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);


  const allBaseFolders = useMemo(() => [...baseFolders, ...customFolders], [customFolders]);

  // All categories including custom
  const allCategories = useMemo(() => {
    const custom = customFolders.map((f) => ({ value: f.id, label: f.name }));
    return [...DOCUMENT_CATEGORIES, ...custom];
  }, [customFolders]);

  const countForFolder = useCallback((folderId: string) => {
    return docs.filter((d) => matchesFolder(d, folderId)).length;
  }, [docs]);

  const getFolderDisplayName = useCallback((folder: FolderDef) => {
    return folderNameOverrides[folder.id] || folder.name;
  }, [folderNameOverrides]);

  const handleCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    const id = "custom_" + name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    setCustomFolders((prev) => [...prev, { id, name, count: 0 }]);
    setNewFolderName("");
    setIsCreateFolderOpen(false);
    toast({ title: "Folder created", description: `"${name}" added to your folders` });
  };

  const startRename = (folderId: string, currentName: string) => {
    setRenamingFolderId(folderId);
    setRenameValue(currentName);
  };

  const commitRename = () => {
    if (!renamingFolderId || !renameValue.trim()) { setRenamingFolderId(null); return; }
    const isCustom = customFolders.some((f) => f.id === renamingFolderId);
    if (isCustom) {
      setCustomFolders((prev) => prev.map((f) => f.id === renamingFolderId ? { ...f, name: renameValue.trim() } : f));
    } else {
      setFolderNameOverrides((prev) => ({ ...prev, [renamingFolderId]: renameValue.trim() }));
    }
    toast({ title: "Folder renamed", description: `Renamed to "${renameValue.trim()}"` });
    setRenamingFolderId(null);
    setRenameValue("");
  };

  const toggleFolder = (id: string) => setExpandedFolders((p) => ({ ...p, [id]: !p[id] }));

  const filteredDocs = useMemo(() => {
    let list = docs.filter((d) => matchesFolder(d, selectedFolder));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q));
    }
    return list;
  }, [selectedFolder, searchQuery, docs]);

  // Tax compliance: compute missing required documents
  const isTaxFolder = selectedFolder === "tax" || (SUBFOLDER_MAP.tax || []).some((sf) => sf.id === selectedFolder);
  const taxRequiredDocs = REQUIRED_TAX_DOCS[taxComplianceTab];
  const taxUploadedTypes = docs.filter((d) => !d.isExpired).map((d) => d.category);
  const taxMissingDocs = taxRequiredDocs.filter((r) => !taxUploadedTypes.includes(r.type));

  /* Upload handlers */
  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files?.[0]) {
      const ext = "." + files[0].name.split(".").pop()?.toLowerCase();
      if ([".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"].includes(ext)) {
        setUploadForm((p) => ({ ...p, file: files[0] }));
        setIsUploadOpen(true);
      } else {
        toast({ title: "Invalid file type", description: "Please upload PDF, DOC, DOCX, JPG, or PNG files only.", variant: "destructive" });
      }
    }
  }, []);

  const handleUpload = async () => {
    if (!uploadForm.title.trim()) { toast({ title: "Error", description: "Please enter a document title", variant: "destructive" }); return; }
    if (!uploadForm.category) { toast({ title: "Error", description: "Please select a category", variant: "destructive" }); return; }
    if (!uploadForm.file) { toast({ title: "Error", description: "Please select a file to upload", variant: "destructive" }); return; }
    if (!user) return;

    // Upload file to storage
    const filePath = `${user.id}/${Date.now()}-${uploadForm.file.name}`;
    const { error: storageError } = await supabase.storage
      .from("life-file-documents")
      .upload(filePath, uploadForm.file);

    if (storageError) {
      console.error("Storage upload error:", storageError);
      toast({ title: "Upload failed", description: storageError.message, variant: "destructive" });
      return;
    }

    // Determine version
    const matchingDocs = docs.filter((d) => d.category === uploadForm.category && !d.isExpired);
    const highestVersion = matchingDocs.reduce((max, d) => Math.max(max, d.version || 1), 0);

    // Mark old versions as expired in DB
    if (matchingDocs.length > 0) {
      const matchingIds = matchingDocs.map((d) => d.id);
      await supabase.from("life_file_documents").update({ is_expired: true }).in("id", matchingIds);
    }

    // Insert DB row
    const { error: insertError } = await supabase.from("life_file_documents").insert({
      user_id: user.id,
      title: uploadForm.title,
      document_type: uploadForm.category,
      file_url: filePath,
      file_name: uploadForm.file.name,
      status: "complete",
      expiry_date: uploadForm.expiryDate || null,
      reminder_30_days: uploadForm.reminder30,
      reminder_60_days: uploadForm.reminder60,
      reminder_90_days: uploadForm.reminder90,
      reminder_6_months: uploadForm.reminder6m,
      reminder_1_year: uploadForm.reminder1y,
      notify_email: uploadForm.notifyEmail || null,
      version: highestVersion + 1,
    });

    if (insertError) {
      console.error("Insert error:", insertError);
      toast({ title: "Error saving document", variant: "destructive" });
      return;
    }

    const catLabel = allCategories.find((c) => c.value === uploadForm.category)?.label || uploadForm.category;
    toast({ title: "Success", description: `"${uploadForm.title}" uploaded to ${catLabel}` });
    setUploadForm({ title: "", category: "", file: null, expiryDate: "", reminder30: false, reminder60: false, reminder90: false, reminder6m: false, reminder1y: false, notifyEmail: "" });
    setIsUploadOpen(false);
    await fetchDocs();
  };

  /* Collate handlers */
  const toggleDocSelect = (id: string) => {
    setSelectedDocIds((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const applyPreset = (presetLabel: string) => {
    setCollatePreset(presetLabel);
    const preset = COLLATE_PRESETS.find((p) => p.label === presetLabel);
    if (!preset) return;
    const ids = new Set<string>();
    docs.forEach((d) => { if (preset.requiredCategories.includes(d.category)) ids.add(d.id); });
    setSelectedDocIds(ids);
    toast({ title: `Preset applied: ${presetLabel}`, description: `${ids.size} documents selected` });
  };

  const handleDownloadZip = async () => {
    if (selectedDocIds.size === 0) { toast({ title: "No documents selected", variant: "destructive" }); return; }
    const zip = new JSZip();
    const selected = docs.filter((d) => selectedDocIds.has(d.id));
    // For demo, create placeholder text files since we don't have real file blobs
    selected.forEach((d) => {
      const catLabel = DOCUMENT_CATEGORIES.find((c) => c.value === d.category)?.label || d.category;
      const folder = zip.folder(catLabel);
      folder?.file(d.name, `[Demo placeholder for: ${d.name}]\nCategory: ${catLabel}\nDate: ${d.date}\nSize: ${d.size}`);
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const presetSuffix = collatePreset ? `_${collatePreset.replace(/\s+/g, "_")}` : "";
    saveAs(blob, `LegacyBuilder_Documents${presetSuffix}.zip`);
    toast({ title: "ZIP downloaded", description: `${selected.length} documents collated` });
  };

  /* Move single document */
  const handleMoveDoc = () => {
    if (!moveDocId || !moveTarget) return;
    setDocs((prev) => prev.map((d) => d.id === moveDocId ? { ...d, category: moveTarget } : d));
    const catLabel = DOCUMENT_CATEGORIES.find((c) => c.value === moveTarget)?.label || moveTarget;
    toast({ title: "Document moved", description: `Moved to "${catLabel}"` });
    setMoveDocId(null);
    setMoveTarget("");
  };

  /* Batch assign category */
  const handleBatchAssign = () => {
    if (selectedDocIds.size === 0 || !batchCategory) return;
    setDocs((prev) => prev.map((d) => selectedDocIds.has(d.id) ? { ...d, category: batchCategory } : d));
    const catLabel = DOCUMENT_CATEGORIES.find((c) => c.value === batchCategory)?.label || batchCategory;
    toast({ title: "Category updated", description: `${selectedDocIds.size} document(s) moved to "${catLabel}"` });
    setBatchCategory("");
    setSelectedDocIds(new Set());
  };

  /* Drag-and-drop onto folders */
  const handleFolderDragOver = useCallback((e: React.DragEvent, folderId: string) => {
    if (folderId === "all") return;
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(folderId);
  }, []);

  const handleFolderDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOverFolder(null);
  }, []);

  const handleFolderDrop = useCallback((e: React.DragEvent, folderId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolder(null);
    const docId = e.dataTransfer.getData("text/doc-id") || dragDocId.current;
    if (!docId || folderId === "all") return;
    // If this is a parent folder with subfolders, open the move dialog
    if (PARENT_CAT_MAP[folderId]) {
      setMoveDocId(docId);
      setMoveTarget("");
      return;
    }
    // Direct subfolder/category – move immediately
    setDocs((prev) => prev.map((d) => d.id === docId ? { ...d, category: folderId } : d));
    const catLabel = DOCUMENT_CATEGORIES.find((c) => c.value === folderId)?.label || folderId;
    toast({ title: "Document moved", description: `Moved to "${catLabel}"` });
    dragDocId.current = null;
  }, []);

  const handleDocDragStart = useCallback((e: React.DragEvent, docId: string) => {
    e.dataTransfer.setData("text/doc-id", docId);
    e.dataTransfer.effectAllowed = "move";
    dragDocId.current = docId;
  }, []);

  /* ---------------------------------------------------------------- */

  return (
    <DashboardLayout
      title="My Important Documents"
      subtitle="Securely store and manage all your important documents"
    >
      <div className="grid lg:grid-cols-4 gap-8">
        {/* ========== SIDEBAR ========== */}
        <div className="bg-card rounded-2xl border border-border p-4 shadow-soft h-fit">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Folders</h3>
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Create folder" onClick={() => setIsCreateFolderOpen(true)}>
              <FolderPlus className="w-4 h-4" />
            </Button>
          </div>

          {/* Profile Toggle */}
          <div className="mb-4">
            <Tabs value={profileType} onValueChange={(v) => setProfileType(v as ProfileType)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="athlete" className="text-xs">Athlete</TabsTrigger>
                <TabsTrigger value="artist" className="text-xs">Artist</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="space-y-1 max-h-[55vh] overflow-y-auto pr-1">
            {allBaseFolders.map((folder) => {
              const fCount = countForFolder(folder.id);
              const isExpanded = !!expandedFolders[folder.id];
              const subfolders =
                folder.id === "contracts"
                  ? (profileType === "athlete" ? athleteContractFolders : artistContractFolders)
                  : SUBFOLDER_MAP[folder.id] || null;
              const displayName = getFolderDisplayName(folder);
              const isRenaming = renamingFolderId === folder.id;

              return (
                <div key={folder.id} className="group/folder">
                  {isRenaming ? (
                    <div className="flex items-center gap-1 px-2 py-1">
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitRename(); if (e.key === "Escape") setRenamingFolderId(null); }}
                        className="flex-1 text-sm bg-secondary rounded px-2 py-1 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button onClick={commitRename} className="p-1 hover:bg-secondary rounded"><Check className="w-3.5 h-3.5 text-primary" /></button>
                      <button onClick={() => setRenamingFolderId(null)} className="p-1 hover:bg-secondary rounded"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          if (folder.hasSubfolders) toggleFolder(folder.id);
                          setSelectedFolder(folder.id);
                        }}
                        onDragOver={(e) => handleFolderDragOver(e, folder.id)}
                        onDragLeave={handleFolderDragLeave}
                        onDrop={(e) => handleFolderDrop(e, folder.id)}
                        className={cn(
                          "flex-1 flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                          selectedFolder === folder.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground",
                          dragOverFolder === folder.id && "ring-2 ring-gold bg-gold/10"
                        )}
                      >
                        {folder.hasSubfolders ? (isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : <FolderLock className="w-4 h-4" />}
                        <span className="flex-1 text-sm truncate">{displayName}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", selectedFolder === folder.id ? "bg-primary-foreground/20" : "bg-secondary")}>{fCount}</span>
                      </button>
                      {folder.id !== "all" && (
                        <button
                          onClick={(e) => { e.stopPropagation(); startRename(folder.id, displayName); }}
                          className="p-1 rounded opacity-0 group-hover/folder:opacity-100 hover:bg-secondary transition-opacity"
                          title="Rename folder"
                        >
                          <Pencil className="w-3 h-3 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  )}

                  {folder.hasSubfolders && isExpanded && subfolders && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-border pl-2">
                      {subfolders.map((sf) => (
                        <button
                          key={sf.id}
                          onClick={() => setSelectedFolder(sf.id)}
                          onDragOver={(e) => handleFolderDragOver(e, sf.id)}
                          onDragLeave={handleFolderDragLeave}
                          onDrop={(e) => handleFolderDrop(e, sf.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-colors text-xs",
                            selectedFolder === sf.id ? "bg-gold/20 text-gold" : "hover:bg-secondary text-muted-foreground hover:text-foreground",
                            dragOverFolder === sf.id && "ring-2 ring-gold bg-gold/10"
                          )}
                        >
                          <FolderLock className="w-3 h-3" />
                          <span className="flex-1 truncate">{sf.name}</span>
                          <span className={cn("text-xs px-1.5 py-0.5 rounded-full", selectedFolder === sf.id ? "bg-gold/30" : "bg-secondary")}>{countForFolder(sf.id)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-gold/10 rounded-xl border border-gold/30">
            <div className="flex items-center gap-2 mb-2">
              <FolderLock className="w-5 h-5 text-gold" />
              <span className="font-medium text-foreground">Storage</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gold rounded-full" style={{ width: "35%" }} />
            </div>
            <p className="text-xs text-muted-foreground">3.5 GB of 10 GB used</p>
          </div>
        </div>

        {/* ========== MAIN CONTENT ========== */}
        <div className="lg:col-span-3">
          {/* AI Document Search Assistant */}
          <DocumentSearchBot className="mb-6" />

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card rounded-lg border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={collateMode ? "default" : "outline"}
                size="sm"
                onClick={() => { setCollateMode(!collateMode); setSelectedDocIds(new Set()); setCollatePreset(""); }}
              >
                <PackageCheck className="w-4 h-4" />
                {collateMode ? "Exit Collate" : "Collate"}
              </Button>
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button variant="gold" size="sm">
                    <Upload className="w-4 h-4" />
                    Upload
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Document Title</Label>
                      <Input id="title" placeholder="Enter document title..." value={uploadForm.title} onChange={(e) => setUploadForm((p) => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={uploadForm.category} onValueChange={(v) => setUploadForm((p) => ({ ...p, category: v }))}>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                        <SelectContent>
                          {allCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry Date</Label>
                      <Input id="expiry" type="date" value={uploadForm.expiryDate} onChange={(e) => setUploadForm((p) => ({ ...p, expiryDate: e.target.value }))} />
                      <p className="text-xs text-muted-foreground">Optional — set if this document expires</p>
                    </div>

                    {/* Reminder Intervals */}
                    {uploadForm.expiryDate && (
                      <div className="space-y-3 p-3 bg-secondary/50 rounded-lg border border-border">
                        <Label className="text-sm font-semibold">Expiry Reminders</Label>
                        <p className="text-xs text-muted-foreground">Select when you'd like to be reminded before expiry</p>
                        <div className="grid grid-cols-1 gap-2">
                          {REMINDER_OPTIONS.map((opt) => (
                            <label key={opt.key} className="flex items-center gap-3 cursor-pointer hover:bg-secondary rounded-md px-2 py-1.5 transition-colors">
                              <Checkbox
                                checked={uploadForm[opt.key]}
                                onCheckedChange={(checked) => setUploadForm((p) => ({ ...p, [opt.key]: !!checked }))}
                              />
                              <span className="text-sm text-foreground">{opt.label}</span>
                            </label>
                          ))}
                        </div>
                        <div className="space-y-2 pt-2 border-t border-border">
                          <Label htmlFor="notifyEmail" className="text-sm">Also notify another person (optional)</Label>
                          <Input
                            id="notifyEmail"
                            type="email"
                            placeholder="e.g. spouse@email.com"
                            value={uploadForm.notifyEmail}
                            onChange={(e) => setUploadForm((p) => ({ ...p, notifyEmail: e.target.value }))}
                          />
                          <p className="text-xs text-muted-foreground">They will receive email reminders too</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="file">File</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-gold transition-colors cursor-pointer">
                        <input id="file" type="file" className="hidden" onChange={(e) => setUploadForm((p) => ({ ...p, file: e.target.files?.[0] || null }))} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
                        <label htmlFor="file" className="cursor-pointer">
                          {uploadForm.file ? (
                            <div className="flex items-center justify-center gap-2">
                              <FileText className="w-5 h-5 text-gold" />
                              <span className="text-sm font-medium">{uploadForm.file.name}</span>
                              <button type="button" onClick={(e) => { e.preventDefault(); setUploadForm((p) => ({ ...p, file: null })); }} className="p-1 hover:bg-secondary rounded"><X className="w-4 h-4 text-muted-foreground" /></button>
                            </div>
                          ) : (
                            <div>
                              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Click to select a file</p>
                              <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, JPG, PNG</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>
                    <Button onClick={handleUpload} variant="gold" className="w-full"><Upload className="w-4 h-4" /> Upload Document</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Collate toolbar */}
          {collateMode && (
            <div className="mb-4 p-4 bg-gold/10 border border-gold/30 rounded-xl space-y-3">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Archive className="w-5 h-5 text-gold" />
                  <span className="text-sm font-medium text-foreground">Select documents to collate or re-assign</span>
                </div>
                <Select value={collatePreset} onValueChange={applyPreset}>
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Quick preset…" />
                  </SelectTrigger>
                  <SelectContent>
                    {COLLATE_PRESETS.map((p) => (
                      <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="gold" size="sm" onClick={handleDownloadZip} disabled={selectedDocIds.size === 0}>
                  <Download className="w-4 h-4" />
                  Download ZIP ({selectedDocIds.size})
                </Button>
              </div>
              {/* Batch assign category */}
              {selectedDocIds.size > 0 && (
                <div className="flex items-center gap-3 pt-2 border-t border-gold/20">
                  <FolderSync className="w-4 h-4 text-gold" />
                  <span className="text-xs font-medium text-foreground">Batch move selected to:</span>
                  <Select value={batchCategory} onValueChange={setBatchCategory}>
                    <SelectTrigger className="w-[220px] h-8 text-xs">
                      <SelectValue placeholder="Choose category…" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={handleBatchAssign} disabled={!batchCategory} className="h-8 text-xs">
                    <FolderInput className="w-3.5 h-3.5" />
                    Move {selectedDocIds.size} doc(s)
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Tax Compliance Panel – shown when in Tax folder */}
          {isTaxFolder && (
            <div className="mb-6 bg-card rounded-2xl border border-border shadow-soft p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Tax Compliance Checker</h3>
                </div>
                <Tabs value={taxComplianceTab} onValueChange={(v) => setTaxComplianceTab(v as "personal" | "business")}>
                  <TabsList className="h-8">
                    <TabsTrigger value="personal" className="text-xs h-7 px-3">Personal</TabsTrigger>
                    <TabsTrigger value="business" className="text-xs h-7 px-3">Business</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{taxRequiredDocs.length - taxMissingDocs.length}</p>
                    <p className="text-[10px] text-muted-foreground">Uploaded</p>
                  </div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{taxRequiredDocs.length - taxMissingDocs.length}/{taxRequiredDocs.length}</p>
                    <p className="text-[10px] text-muted-foreground">Required</p>
                  </div>
                </div>
                <div className="bg-secondary/50 rounded-xl p-3 flex items-center gap-3">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", taxMissingDocs.length > 0 ? "bg-destructive/10" : "bg-green-500/10")}>
                    {taxMissingDocs.length > 0 ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{taxMissingDocs.length}</p>
                    <p className="text-[10px] text-muted-foreground">Missing</p>
                  </div>
                </div>
              </div>

              {/* Missing docs list */}
              {taxMissingDocs.length > 0 && (
                <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    The following {taxComplianceTab} tax documents are required but haven't been uploaded:
                  </p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {taxMissingDocs.map((doc) => (
                      <div
                        key={doc.type}
                        className="flex items-center gap-2 bg-background/60 rounded-lg px-3 py-2 cursor-pointer hover:bg-background transition-colors"
                        onClick={() => {
                          setUploadForm((prev) => ({ ...prev, category: doc.type, title: doc.label }));
                          setIsUploadOpen(true);
                        }}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{doc.label}</p>
                          <p className="text-[10px] text-muted-foreground truncate">{doc.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {taxMissingDocs.length === 0 && (
                <div className="flex items-center gap-2 text-green-600 bg-green-500/5 rounded-xl px-4 py-3">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-sm font-medium">All required {taxComplianceTab} tax documents are uploaded!</span>
                </div>
              )}
            </div>
          )}

          {/* Documents Table */}
          <div className="bg-card rounded-2xl border border-border shadow-soft overflow-hidden">
            <div className={cn("grid gap-4 px-6 py-3 bg-secondary text-sm font-medium text-muted-foreground", collateMode ? "grid-cols-[32px_1fr_120px_100px_60px_80px_80px_90px]" : "grid-cols-[1fr_120px_100px_60px_80px_80px_90px]")}>
              {collateMode && <div />}
              <div>Name</div>
              <div>Category</div>
              <div>Date</div>
              <div>Ver</div>
              <div>Expiry</div>
              <div>Size</div>
              <div className="text-right">Actions</div>
            </div>

            <div className="divide-y divide-border max-h-[50vh] overflow-y-auto">
              {filteredDocs.length === 0 && (
                <div className="px-6 py-12 text-center text-muted-foreground text-sm">No documents found.</div>
              )}
              {filteredDocs.map((doc) => (
                <DocumentRow
                  key={doc.id}
                  document={doc}
                  collateMode={collateMode}
                  selected={selectedDocIds.has(doc.id)}
                  onToggle={() => toggleDocSelect(doc.id)}
                  onMoveRequest={(id) => { setMoveDocId(id); setMoveTarget(""); }}
                  onDragStart={(e) => handleDocDragStart(e, doc.id)}
                  catLabel={allCategories.find((c) => c.value === doc.category)?.label || doc.category}
                />
              ))}
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => setIsUploadOpen(true)}
            className={cn(
              "mt-6 border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer",
              isDragging ? "border-gold bg-gold/10 scale-[1.02]" : "border-border hover:border-gold"
            )}
          >
            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors", isDragging ? "bg-gold/20" : "bg-secondary")}>
              <Upload className={cn("w-8 h-8 transition-colors", isDragging ? "text-gold" : "text-muted-foreground")} />
            </div>
            <p className="font-medium text-foreground mb-1">{isDragging ? "Drop your file here" : "Drop files here to upload"}</p>
            <p className="text-sm text-muted-foreground">{isDragging ? "PDF, DOC, DOCX, JPG, PNG" : "or click to browse from your computer"}</p>
          </div>
        </div>
      </div>
      {/* Move Document Dialog */}
      <Dialog open={!!moveDocId} onOpenChange={(open) => { if (!open) { setMoveDocId(null); setMoveTarget(""); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FolderInput className="w-5 h-5 text-gold" /> Move Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Moving: <span className="font-medium text-foreground">{docs.find((d) => d.id === moveDocId)?.name}</span>
            </p>
            <div className="space-y-2">
              <Label>Move to category</Label>
              <Select value={moveTarget} onValueChange={setMoveTarget}>
                <SelectTrigger><SelectValue placeholder="Select destination category" /></SelectTrigger>
                <SelectContent>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleMoveDoc} variant="gold" className="w-full" disabled={!moveTarget}>
              <FolderInput className="w-4 h-4" /> Move Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FolderPlus className="w-5 h-5 text-gold" /> Create Custom Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Folder Name</Label>
              <Input
                placeholder="e.g. Travel, Legal, Estate…"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleCreateFolder(); }}
              />
            </div>
            <Button onClick={handleCreateFolder} variant="gold" className="w-full" disabled={!newFolderName.trim()}>
              <FolderPlus className="w-4 h-4" /> Create Folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

/* ------------------------------------------------------------------ */
/*  DOCUMENT ROW                                                      */
/* ------------------------------------------------------------------ */

interface DocumentRowProps {
  document: DocumentItem;
  collateMode: boolean;
  selected: boolean;
  onToggle: () => void;
  onMoveRequest: (id: string) => void;
  onDragStart?: (e: React.DragEvent) => void;
  catLabel: string;
}

const DocumentRow = ({ document, collateMode, selected, onToggle, onMoveRequest, onDragStart, catLabel }: DocumentRowProps) => {
  const getIcon = () => {
    switch (document.type) {
      case "pdf": return <FileText className="w-5 h-5 text-destructive" />;
      case "image": return <FileImage className="w-5 h-5 text-info" />;
      default: return <File className="w-5 h-5 text-primary" />;
    }
  };

  const isExpired = document.isExpired;
  const expiryStr = document.expiryDate
    ? new Date(document.expiryDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "—";
  const isExpiringSoon = document.expiryDate && !isExpired && new Date(document.expiryDate) <= new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);
  const hasReminders = document.reminder30 || document.reminder60 || document.reminder90 || document.reminder6m || document.reminder1y;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        "grid gap-4 px-6 py-4 items-center hover:bg-secondary/50 transition-colors cursor-grab active:cursor-grabbing",
        collateMode ? "grid-cols-[32px_1fr_120px_100px_60px_80px_80px_90px]" : "grid-cols-[1fr_120px_100px_60px_80px_80px_90px]",
        selected && "bg-gold/5",
        isExpired && "opacity-50"
      )}
    >
      {collateMode && (
        <Checkbox checked={selected} onCheckedChange={onToggle} />
      )}
      <div className="flex items-center gap-3 min-w-0">
        {getIcon()}
        <span className={cn("font-medium truncate", isExpired ? "text-muted-foreground line-through" : "text-foreground")}>{document.name}</span>
        {isExpired && <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">EXPIRED</span>}
        {hasReminders && !isExpired && <span title="Reminders set"><Bell className="w-3.5 h-3.5 text-gold shrink-0" /></span>}
      </div>
      <div>
        <span className="text-sm text-muted-foreground">{catLabel}</span>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">{document.date}</span>
      </div>
      <div>
        <span className="text-xs text-muted-foreground">v{document.version || 1}</span>
      </div>
      <div>
        <span className={cn("text-xs", isExpiringSoon ? "text-warning font-medium" : "text-muted-foreground")}>
          {isExpiringSoon && <AlertTriangle className="w-3 h-3 inline mr-0.5" />}
          {expiryStr}
        </span>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">{document.size}</span>
      </div>
      <div className="flex items-center justify-end gap-1">
        <button title="Move to folder" onClick={() => onMoveRequest(document.id)} className="p-2 hover:bg-secondary rounded-lg transition-colors"><FolderInput className="w-4 h-4 text-muted-foreground" /></button>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors"><Eye className="w-4 h-4 text-muted-foreground" /></button>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors"><Download className="w-4 h-4 text-muted-foreground" /></button>
        <button className="p-2 hover:bg-secondary rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-muted-foreground" /></button>
      </div>
    </div>
  );
};

export default Documents;
