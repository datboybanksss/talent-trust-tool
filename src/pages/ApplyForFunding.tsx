import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Home,
  Car,
  Shield,
  CreditCard,
  Wallet,
  TrendingUp,
  CheckCircle2,
  Building2,
  HeartPulse,
  ChevronRight,
  ArrowLeft,
  Info,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const formatZAR = (amount: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);

// ── Mock data ──

const personalInfo = {
  fullName: "John Doe",
  idNumber: "850101 5XXX XXX",
  dateOfBirth: "1985-01-01",
  maritalStatus: "Married",
  dependants: 2,
  email: "john.doe@email.com",
  phone: "+27 82 XXX XXXX",
  address: "12 Sandton Drive, Sandton, Johannesburg, 2196",
};

const employmentInfo = {
  employer: "Elite Sports Agency",
  position: "Professional Athlete",
  yearsEmployed: 8,
  employmentType: "Full-time",
  monthlyGrossIncome: 95000,
  monthlyNetIncome: 72000,
  otherIncome: 15000,
  otherIncomeSource: "Sponsorship & Endorsements",
};

const bankAccounts = [
  { bank: "FNB", type: "Cheque Account", balance: 87450.32 },
  { bank: "Nedbank", type: "Savings Account", balance: 245000.0 },
  { bank: "Standard Bank", type: "Money Market", balance: 520000.0 },
  { bank: "Investec", type: "Private Portfolio", balance: 1350000.0 },
  { bank: "Allan Gray", type: "Unit Trust", balance: 890000.0 },
];

const existingDebts = [
  { creditor: "Absa", type: "Credit Card", balance: 34520, monthlyPayment: 3500, interestRate: 19.5 },
  { creditor: "WesBank", type: "Vehicle Finance", balance: 180000, monthlyPayment: 5200, interestRate: 11.25 },
  { creditor: "Standard Bank", type: "Home Loan", balance: 1200000, monthlyPayment: 12500, interestRate: 10.75 },
];

const monthlyExpenses = [
  { category: "Housing & Bond", amount: 18000 },
  { category: "Vehicle & Transport", amount: 6500 },
  { category: "Groceries & Food", amount: 6000 },
  { category: "Electricity & Water", amount: 3500 },
  { category: "Internet & Mobile", amount: 1800 },
  { category: "Medical Aid", amount: 4200 },
  { category: "Insurance (Short-term)", amount: 2800 },
  { category: "Fuel", amount: 3000 },
  { category: "Dining Out", amount: 2500 },
  { category: "Clothing", amount: 2000 },
  { category: "Education & Courses", amount: 1500 },
];

const savingsProvisions = [
  { type: "Emergency Fund", monthlyContribution: 5000, totalValue: 245000 },
  { type: "Retirement Annuity", monthlyContribution: 8000, totalValue: 890000 },
  { type: "Tax-Free Savings", monthlyContribution: 3000, totalValue: 120000 },
  { type: "Holiday Fund", monthlyContribution: 2000, totalValue: 65000 },
  { type: "Children's Education Fund", monthlyContribution: 3500, totalValue: 450000 },
];

const insurancePolicies = [
  { provider: "Discovery", type: "Life Cover", monthlyPremium: 1850, coverAmount: 5000000 },
  { provider: "Old Mutual", type: "Disability", monthlyPremium: 950, coverAmount: 2000000 },
  { provider: "Santam", type: "Short-term (Home & Vehicle)", monthlyPremium: 2800, coverAmount: 3500000 },
  { provider: "Discovery", type: "Medical Aid", monthlyPremium: 4200, coverAmount: 0 },
];

// ── Computed values ──
const totalAssets = bankAccounts.reduce((s, a) => s + a.balance, 0) +
  savingsProvisions.reduce((s, p) => s + p.totalValue, 0);
const totalLiabilities = existingDebts.reduce((s, d) => s + d.balance, 0);
const netWorth = totalAssets - totalLiabilities;
const totalMonthlyExpenses = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
const totalMonthlyDebt = existingDebts.reduce((s, d) => s + d.monthlyPayment, 0);
const totalSavingsContributions = savingsProvisions.reduce((s, p) => s + p.monthlyContribution, 0);
const totalMonthlyOutflows = totalMonthlyExpenses + totalMonthlyDebt + totalSavingsContributions;
const disposableIncome = employmentInfo.monthlyNetIncome + employmentInfo.otherIncome - totalMonthlyOutflows;
const debtToIncomeRatio = ((totalMonthlyDebt / (employmentInfo.monthlyGrossIncome + employmentInfo.otherIncome)) * 100).toFixed(1);

// ── Funding type config ──

type FundingTypeKey = "home_loan" | "vehicle_finance" | "insurance" | "personal_loan" | "business_loan" | "credit_facility";

interface FundingTypeConfig {
  key: FundingTypeKey;
  icon: React.ElementType;
  label: string;
  description: string;
  color: string;
  sheets: string[];
  extraFields: { key: string; label: string; type: "text" | "number" | "select" | "textarea"; options?: string[]; placeholder?: string }[];
  funderNotes: string[];
}

const fundingTypeConfigs: FundingTypeConfig[] = [
  {
    key: "home_loan",
    icon: Home,
    label: "Home Loan / Bond",
    description: "Purchase, build, or refinance residential or commercial property",
    color: "bg-primary/10 text-primary border-primary/20",
    sheets: ["personal", "employment", "assets", "debts", "budget", "insurance", "property_details", "summary"],
    extraFields: [
      { key: "propertyType", label: "Property Type", type: "select", options: ["Residential", "Commercial", "Agricultural", "Sectional Title", "Freehold"] },
      { key: "propertyValue", label: "Estimated Property Value (ZAR)", type: "number", placeholder: "e.g. 2500000" },
      { key: "depositAmount", label: "Deposit Available (ZAR)", type: "number", placeholder: "e.g. 250000" },
      { key: "loanAmount", label: "Loan Amount Required (ZAR)", type: "number", placeholder: "e.g. 2250000" },
      { key: "loanTerm", label: "Preferred Loan Term", type: "select", options: ["20 years", "25 years", "30 years"] },
      { key: "propertyAddress", label: "Property Address (if known)", type: "text", placeholder: "Full address of property" },
      { key: "purpose", label: "Purpose", type: "select", options: ["Primary Residence", "Investment / Buy-to-Let", "Holiday Home", "Refinance Existing Bond"] },
    ],
    funderNotes: [
      "Property affordability ratio calculated based on net income",
      "Deposit percentage demonstrates borrower commitment",
      "Existing bond commitments factored into affordability",
    ],
  },
  {
    key: "vehicle_finance",
    icon: Car,
    label: "Vehicle Finance",
    description: "New or used vehicle purchase, refinance, or fleet financing",
    color: "bg-accent/30 text-accent-foreground border-accent/30",
    sheets: ["personal", "employment", "assets", "debts", "budget", "vehicle_details", "summary"],
    extraFields: [
      { key: "vehicleType", label: "Vehicle Type", type: "select", options: ["New", "Used (Demo)", "Used (Pre-owned)", "Commercial / Fleet"] },
      { key: "vehicleMake", label: "Make & Model", type: "text", placeholder: "e.g. BMW X3 xDrive30d" },
      { key: "vehicleYear", label: "Year", type: "number", placeholder: "e.g. 2026" },
      { key: "vehiclePrice", label: "Purchase Price (ZAR)", type: "number", placeholder: "e.g. 950000" },
      { key: "tradeInValue", label: "Trade-in Value (ZAR)", type: "number", placeholder: "e.g. 150000" },
      { key: "depositAmount", label: "Cash Deposit (ZAR)", type: "number", placeholder: "e.g. 100000" },
      { key: "financeAmount", label: "Finance Amount Required (ZAR)", type: "number", placeholder: "e.g. 700000" },
      { key: "loanTerm", label: "Preferred Term", type: "select", options: ["36 months", "48 months", "54 months", "60 months", "72 months"] },
      { key: "residualBalloon", label: "Residual / Balloon (%)", type: "select", options: ["0%", "10%", "20%", "30%"] },
    ],
    funderNotes: [
      "Vehicle instalment should not exceed 25% of net income",
      "Trade-in and deposit reduce financed amount and risk",
      "Balloon payments extend affordability but increase total cost",
    ],
  },
  {
    key: "insurance",
    icon: HeartPulse,
    label: "Insurance Application",
    description: "Life cover, disability, income protection, or short-term insurance",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    sheets: ["personal", "employment", "assets", "insurance_current", "health_details", "summary"],
    extraFields: [
      { key: "insuranceType", label: "Insurance Type", type: "select", options: ["Life Cover", "Disability Cover", "Income Protection", "Dread Disease", "Short-term (Home/Vehicle)", "Funeral Cover"] },
      { key: "coverAmount", label: "Cover Amount Required (ZAR)", type: "number", placeholder: "e.g. 5000000" },
      { key: "smoker", label: "Smoker Status", type: "select", options: ["Non-smoker", "Smoker", "Ex-smoker (>12 months)"] },
      { key: "healthConditions", label: "Pre-existing Health Conditions", type: "textarea", placeholder: "List any known conditions, or 'None'" },
      { key: "beneficiary", label: "Primary Beneficiary", type: "text", placeholder: "Full name and relationship" },
      { key: "existingCover", label: "Existing Cover to Replace?", type: "select", options: ["No — new cover", "Yes — replacing existing policy"] },
    ],
    funderNotes: [
      "Existing insurance policies listed for gap analysis",
      "Health declarations affect premium calculations",
      "Income and asset details determine appropriate cover levels",
    ],
  },
  {
    key: "personal_loan",
    icon: CreditCard,
    label: "Personal Loan",
    description: "Unsecured personal financing for any purpose",
    color: "bg-primary/10 text-primary border-primary/20",
    sheets: ["personal", "employment", "assets", "debts", "budget", "summary"],
    extraFields: [
      { key: "loanAmount", label: "Loan Amount Required (ZAR)", type: "number", placeholder: "e.g. 150000" },
      { key: "purpose", label: "Purpose of Loan", type: "select", options: ["Debt Consolidation", "Home Improvements", "Education", "Medical Expenses", "Travel", "Other"] },
      { key: "loanTerm", label: "Preferred Term", type: "select", options: ["12 months", "24 months", "36 months", "48 months", "60 months"] },
      { key: "additionalNotes", label: "Additional Notes", type: "textarea", placeholder: "Any relevant information for the lender" },
    ],
    funderNotes: [
      "Unsecured — credit score and income stability are key factors",
      "Debt-to-income ratio critical for approval",
      "Purpose of loan may affect interest rate offered",
    ],
  },
  {
    key: "business_loan",
    icon: Building2,
    label: "Business Loan",
    description: "Start, expand, or finance a business venture",
    color: "bg-accent/30 text-accent-foreground border-accent/30",
    sheets: ["personal", "employment", "assets", "debts", "budget", "business_details", "summary"],
    extraFields: [
      { key: "businessName", label: "Business Name", type: "text", placeholder: "e.g. Doe Enterprises (Pty) Ltd" },
      { key: "registrationNumber", label: "Registration Number", type: "text", placeholder: "e.g. 2020/123456/07" },
      { key: "businessType", label: "Business Type", type: "select", options: ["Sole Proprietor", "Partnership", "Close Corporation", "Private Company (Pty Ltd)", "Franchise"] },
      { key: "yearsTrading", label: "Years Trading", type: "number", placeholder: "e.g. 3" },
      { key: "annualTurnover", label: "Annual Turnover (ZAR)", type: "number", placeholder: "e.g. 2500000" },
      { key: "loanAmount", label: "Loan Amount Required (ZAR)", type: "number", placeholder: "e.g. 500000" },
      { key: "purpose", label: "Purpose of Loan", type: "select", options: ["Working Capital", "Equipment Purchase", "Expansion", "Franchise Fee", "Stock / Inventory", "Property"] },
      { key: "additionalNotes", label: "Business Description", type: "textarea", placeholder: "Brief description of the business and how funds will be used" },
    ],
    funderNotes: [
      "Business financials and trading history are key assessment criteria",
      "Personal guarantees and surety may be required",
      "Annual turnover and profitability determine capacity",
    ],
  },
  {
    key: "credit_facility",
    icon: Shield,
    label: "Credit Facility / Overdraft",
    description: "Revolving credit line or overdraft facility",
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    sheets: ["personal", "employment", "assets", "debts", "budget", "summary"],
    extraFields: [
      { key: "facilityAmount", label: "Facility Amount Required (ZAR)", type: "number", placeholder: "e.g. 100000" },
      { key: "facilityType", label: "Facility Type", type: "select", options: ["Overdraft", "Revolving Credit", "Credit Card", "Store Account"] },
      { key: "purpose", label: "Primary Use", type: "select", options: ["Cash Flow Management", "Emergency Buffer", "Business Expenses", "General Use"] },
    ],
    funderNotes: [
      "Revolving facilities assessed on income stability",
      "Existing credit utilisation reviewed",
      "Repayment behaviour on current facilities is key",
    ],
  },
];

// ── Sheet builders ──

const buildCoverSheet = (wb: XLSX.WorkBook, fundingLabel: string, extraData: Record<string, string>) => {
  const dateStr = format(new Date(), "dd MMMM yyyy");
  const data = [
    [`FUNDING APPLICATION: ${fundingLabel.toUpperCase()}`],
    [`Prepared for: ${personalInfo.fullName}`],
    [`Date Generated: ${dateStr}`],
    ["Generated by: LegacyBuilder"],
    [""],
    ["CONFIDENTIAL — For authorised financial institution use only"],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet["!cols"] = [{ wch: 60 }];
  XLSX.utils.book_append_sheet(wb, sheet, "Cover Page");
};

const buildPersonalSheet = (wb: XLSX.WorkBook) => {
  const data = [
    ["PERSONAL INFORMATION"], [""],
    ["Field", "Value"],
    ["Full Name", personalInfo.fullName],
    ["ID Number", personalInfo.idNumber],
    ["Date of Birth", personalInfo.dateOfBirth],
    ["Marital Status", personalInfo.maritalStatus],
    ["Dependants", personalInfo.dependants],
    ["Email", personalInfo.email],
    ["Phone", personalInfo.phone],
    ["Residential Address", personalInfo.address],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet["!cols"] = [{ wch: 25 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, sheet, "Personal Info");
};

const buildEmploymentSheet = (wb: XLSX.WorkBook) => {
  const data = [
    ["EMPLOYMENT & INCOME DETAILS"], [""],
    ["Field", "Value"],
    ["Employer", employmentInfo.employer],
    ["Position", employmentInfo.position],
    ["Years Employed", employmentInfo.yearsEmployed],
    ["Employment Type", employmentInfo.employmentType],
    ["Monthly Gross Income", employmentInfo.monthlyGrossIncome],
    ["Monthly Net Income", employmentInfo.monthlyNetIncome],
    ["Other Income", employmentInfo.otherIncome],
    ["Other Income Source", employmentInfo.otherIncomeSource],
    ["Total Monthly Income", employmentInfo.monthlyNetIncome + employmentInfo.otherIncome],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet["!cols"] = [{ wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, sheet, "Employment & Income");
};

const buildAssetsSheet = (wb: XLSX.WorkBook) => {
  const data = [
    ["BANK ACCOUNTS & ASSETS"], [""],
    ["Bank / Institution", "Account Type", "Balance (ZAR)"],
    ...bankAccounts.map((a) => [a.bank, a.type, a.balance]),
    [""],
    ["SAVINGS & INVESTMENT PROVISIONS"], [""],
    ["Type", "Monthly Contribution (ZAR)", "Total Value (ZAR)"],
    ...savingsProvisions.map((s) => [s.type, s.monthlyContribution, s.totalValue]),
    [""], ["TOTAL ASSETS", "", totalAssets],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet["!cols"] = [{ wch: 30 }, { wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, sheet, "Assets & Savings");
};

const buildDebtsSheet = (wb: XLSX.WorkBook) => {
  const data = [
    ["EXISTING DEBT OBLIGATIONS"], [""],
    ["Creditor", "Type", "Outstanding Balance (ZAR)", "Monthly Payment (ZAR)", "Interest Rate (%)"],
    ...existingDebts.map((d) => [d.creditor, d.type, d.balance, d.monthlyPayment, d.interestRate]),
    [""], ["TOTAL", "", totalLiabilities, totalMonthlyDebt, ""],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 22 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, sheet, "Existing Debts");
};

const buildBudgetSheet = (wb: XLSX.WorkBook) => {
  const data = [
    ["MONTHLY BUDGET BREAKDOWN"], [""],
    ["Category", "Monthly Amount (ZAR)"],
    ...monthlyExpenses.map((e) => [e.category, e.amount]),
    [""], ["Total Living Expenses", totalMonthlyExpenses],
    ["Total Debt Repayments", totalMonthlyDebt],
    ["Total Savings Contributions", totalSavingsContributions],
    [""], ["TOTAL MONTHLY OUTFLOWS", totalMonthlyOutflows],
    ["DISPOSABLE INCOME", disposableIncome],
  ];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet["!cols"] = [{ wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, sheet, "Monthly Budget");
};

const buildInsuranceSheet = (wb: XLSX.WorkBook) => {
  const data = [
    ["INSURANCE POLICIES"], [""],
    ["Provider", "Type", "Monthly Premium (ZAR)", "Cover Amount (ZAR)"],
    ...insurancePolicies.map((p) => [p.provider, p.type, p.monthlyPremium, p.coverAmount || "N/A"]),
  ];
  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 22 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, sheet, "Insurance");
};

const buildExtraDetailsSheet = (wb: XLSX.WorkBook, sheetName: string, title: string, config: FundingTypeConfig, extraData: Record<string, string>) => {
  const rows: (string | number)[][] = [[title], [""]];
  rows.push(["Field", "Value"]);
  for (const field of config.extraFields) {
    const val = extraData[field.key] || "";
    rows.push([field.label, val]);
  }
  const sheet = XLSX.utils.aoa_to_sheet(rows);
  sheet["!cols"] = [{ wch: 35 }, { wch: 45 }];
  XLSX.utils.book_append_sheet(wb, sheet, sheetName);
};

const buildSummarySheet = (wb: XLSX.WorkBook, config: FundingTypeConfig, extraData: Record<string, string>) => {
  const data: (string | number)[][] = [
    [`FINANCIAL SUMMARY — ${config.label.toUpperCase()}`], [""],
    ["Key Metric", "Value"],
    ["Total Monthly Gross Income", formatZAR(employmentInfo.monthlyGrossIncome + employmentInfo.otherIncome)],
    ["Total Monthly Net Income", formatZAR(employmentInfo.monthlyNetIncome + employmentInfo.otherIncome)],
    ["Total Monthly Expenses", formatZAR(totalMonthlyExpenses)],
    ["Total Monthly Debt Payments", formatZAR(totalMonthlyDebt)],
    ["Total Monthly Savings", formatZAR(totalSavingsContributions)],
    ["Total Monthly Outflows", formatZAR(totalMonthlyOutflows)],
    ["Disposable Income (Available for new debt)", formatZAR(disposableIncome)],
    [""], ["Debt-to-Income Ratio", `${debtToIncomeRatio}%`],
    [""], ["Total Assets", formatZAR(totalAssets)],
    ["Total Liabilities", formatZAR(totalLiabilities)],
    ["Net Worth", formatZAR(netWorth)],
  ];

  // Add funding-specific affordability
  if (config.key === "home_loan") {
    const loanAmt = parseFloat(extraData.loanAmount || "0");
    const propVal = parseFloat(extraData.propertyValue || "0");
    const deposit = parseFloat(extraData.depositAmount || "0");
    data.push([""], ["--- HOME LOAN AFFORDABILITY ---", ""]);
    if (propVal > 0) data.push(["Property Value", formatZAR(propVal)]);
    if (deposit > 0) data.push(["Deposit", formatZAR(deposit)]);
    if (deposit > 0 && propVal > 0) data.push(["Deposit %", `${((deposit / propVal) * 100).toFixed(1)}%`]);
    if (loanAmt > 0) data.push(["Loan Amount", formatZAR(loanAmt)]);
    const estInstalment = loanAmt > 0 ? loanAmt * 0.0095 : 0; // rough 11.5% over 20yr
    if (estInstalment > 0) {
      data.push(["Est. Monthly Instalment (indicative)", formatZAR(estInstalment)]);
      const affordRatio = ((estInstalment / (employmentInfo.monthlyNetIncome + employmentInfo.otherIncome)) * 100).toFixed(1);
      data.push(["Instalment as % of Net Income", `${affordRatio}%`]);
    }
  } else if (config.key === "vehicle_finance") {
    const finAmt = parseFloat(extraData.financeAmount || "0");
    data.push([""], ["--- VEHICLE AFFORDABILITY ---", ""]);
    if (finAmt > 0) {
      data.push(["Finance Amount", formatZAR(finAmt)]);
      const estInstalment = finAmt * 0.022; // rough 60-month estimate
      data.push(["Est. Monthly Instalment (indicative)", formatZAR(estInstalment)]);
      const affordRatio = ((estInstalment / (employmentInfo.monthlyNetIncome + employmentInfo.otherIncome)) * 100).toFixed(1);
      data.push(["Instalment as % of Net Income", `${affordRatio}%`]);
    }
  }

  data.push([""], ["Credit Assessment Notes:"]);
  for (const note of config.funderNotes) {
    data.push([`- ${note}`]);
  }
  data.push(["- Applicant has a stable income with 8 years employment history"]);
  data.push(["- Strong savings & investment portfolio demonstrates financial discipline"]);

  const sheet = XLSX.utils.aoa_to_sheet(data);
  sheet["!cols"] = [{ wch: 45 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, sheet, "Funder Summary");
};

// ── Excel generator ──

const generateExcel = (config: FundingTypeConfig, extraData: Record<string, string>) => {
  const wb = XLSX.utils.book_new();

  buildCoverSheet(wb, config.label, extraData);

  const sheetMap: Record<string, () => void> = {
    personal: () => buildPersonalSheet(wb),
    employment: () => buildEmploymentSheet(wb),
    assets: () => buildAssetsSheet(wb),
    debts: () => buildDebtsSheet(wb),
    budget: () => buildBudgetSheet(wb),
    insurance: () => buildInsuranceSheet(wb),
    insurance_current: () => buildInsuranceSheet(wb),
    property_details: () => buildExtraDetailsSheet(wb, "Property Details", "PROPERTY DETAILS", config, extraData),
    vehicle_details: () => buildExtraDetailsSheet(wb, "Vehicle Details", "VEHICLE DETAILS", config, extraData),
    health_details: () => buildExtraDetailsSheet(wb, "Health & Cover Details", "HEALTH & COVER DETAILS", config, extraData),
    business_details: () => buildExtraDetailsSheet(wb, "Business Details", "BUSINESS DETAILS", config, extraData),
    summary: () => buildSummarySheet(wb, config, extraData),
  };

  for (const sheetKey of config.sheets) {
    sheetMap[sheetKey]?.();
  }

  const fileName = `${config.label.replace(/[\s\/]+/g, "_")}_Application_${personalInfo.fullName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
  
  // Use manual blob download for better compatibility in sandboxed/iframe environments
  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([wbout], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast({
    title: "Funding pack downloaded",
    description: `${fileName} has been saved to your downloads.`,
  });
};

// ── PDF generator ──

const generatePDF = async (config: FundingTypeConfig, extraData: Record<string, string>) => {
  const { default: jsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  
  const doc = new jsPDF("p", "mm", "a4") as any;
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 20;

  const addTitle = (text: string) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 38); // forest green
    doc.text(text, margin, y);
    y += 3;
    doc.setDrawColor(196, 164, 75); // gold accent line
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 8;
  };

  const addSubtitle = (text: string) => {
    if (y > 265) { doc.addPage(); y = 20; }
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(text, margin, y);
    y += 6;
  };

  const addKeyValue = (rows: [string, string | number][]) => {
    (doc as any).autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Field", "Value"]],
      body: rows,
      theme: "grid",
      headStyles: { fillColor: [30, 58, 38], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [245, 245, 240] },
      didDrawPage: () => {},
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  };

  const addTable = (head: string[], body: (string | number)[][]) => {
    if (y > 240) { doc.addPage(); y = 20; }
    (doc as any).autoTable({
      startY: y,
      margin: { left: margin, right: margin },
      head: [head],
      body,
      theme: "striped",
      headStyles: { fillColor: [30, 58, 38], textColor: [255, 255, 255], fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
      alternateRowStyles: { fillColor: [245, 245, 240] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  };

  // ─ Cover Page ─
  doc.setFillColor(30, 58, 38);
  doc.rect(0, 0, pageW, 80, "F");
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(196, 164, 75);
  doc.text("FUNDING APPLICATION", pageW / 2, 35, { align: "center" });
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(config.label.toUpperCase(), pageW / 2, 50, { align: "center" });
  doc.setFontSize(10);
  doc.setTextColor(200, 200, 200);
  doc.text(`Prepared for: ${personalInfo.fullName}`, pageW / 2, 62, { align: "center" });
  doc.text(`Date: ${format(new Date(), "dd MMMM yyyy")}`, pageW / 2, 69, { align: "center" });
  
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("CONFIDENTIAL — For authorised financial institution use only", pageW / 2, 90, { align: "center" });
  doc.text("Generated by LegacyBuilder", pageW / 2, 96, { align: "center" });

  // ─ Personal Info ─
  doc.addPage(); y = 20;
  addTitle("PERSONAL INFORMATION");
  addKeyValue([
    ["Full Name", personalInfo.fullName],
    ["ID Number", personalInfo.idNumber],
    ["Date of Birth", personalInfo.dateOfBirth],
    ["Marital Status", personalInfo.maritalStatus],
    ["Dependants", personalInfo.dependants],
    ["Email", personalInfo.email],
    ["Phone", personalInfo.phone],
    ["Address", personalInfo.address],
  ]);

  // ─ Employment ─
  if (config.sheets.includes("employment")) {
    addTitle("EMPLOYMENT & INCOME");
    addKeyValue([
      ["Employer", employmentInfo.employer],
      ["Position", employmentInfo.position],
      ["Years Employed", employmentInfo.yearsEmployed],
      ["Employment Type", employmentInfo.employmentType],
      ["Monthly Gross Income", formatZAR(employmentInfo.monthlyGrossIncome)],
      ["Monthly Net Income", formatZAR(employmentInfo.monthlyNetIncome)],
      ["Other Income", formatZAR(employmentInfo.otherIncome)],
      ["Other Income Source", employmentInfo.otherIncomeSource],
      ["Total Monthly Income", formatZAR(employmentInfo.monthlyNetIncome + employmentInfo.otherIncome)],
    ]);
  }

  // ─ Assets ─
  if (config.sheets.includes("assets")) {
    doc.addPage(); y = 20;
    addTitle("ASSETS & SAVINGS");
    addSubtitle("Bank Accounts");
    addTable(
      ["Bank", "Account Type", "Balance (ZAR)"],
      bankAccounts.map((a) => [a.bank, a.type, formatZAR(a.balance)])
    );
    addSubtitle("Savings & Investments");
    addTable(
      ["Type", "Monthly Contribution", "Total Value"],
      savingsProvisions.map((s) => [s.type, formatZAR(s.monthlyContribution), formatZAR(s.totalValue)])
    );
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 38);
    doc.text(`Total Assets: ${formatZAR(totalAssets)}`, margin, y);
    y += 10;
  }

  // ─ Debts ─
  if (config.sheets.includes("debts")) {
    addTitle("EXISTING DEBT OBLIGATIONS");
    addTable(
      ["Creditor", "Type", "Balance", "Monthly", "Rate"],
      existingDebts.map((d) => [d.creditor, d.type, formatZAR(d.balance), formatZAR(d.monthlyPayment), `${d.interestRate}%`])
    );
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Liabilities: ${formatZAR(totalLiabilities)}  |  Total Monthly: ${formatZAR(totalMonthlyDebt)}`, margin, y);
    y += 10;
  }

  // ─ Budget ─
  if (config.sheets.includes("budget")) {
    doc.addPage(); y = 20;
    addTitle("MONTHLY BUDGET");
    addTable(
      ["Category", "Monthly Amount"],
      monthlyExpenses.map((e) => [e.category, formatZAR(e.amount)])
    );
    addKeyValue([
      ["Total Living Expenses", formatZAR(totalMonthlyExpenses)],
      ["Total Debt Repayments", formatZAR(totalMonthlyDebt)],
      ["Total Savings Contributions", formatZAR(totalSavingsContributions)],
      ["Total Monthly Outflows", formatZAR(totalMonthlyOutflows)],
      ["Disposable Income", formatZAR(disposableIncome)],
    ]);
  }

  // ─ Insurance ─
  if (config.sheets.includes("insurance") || config.sheets.includes("insurance_current")) {
    addTitle("INSURANCE POLICIES");
    addTable(
      ["Provider", "Type", "Monthly Premium", "Cover Amount"],
      insurancePolicies.map((p) => [p.provider, p.type, formatZAR(p.monthlyPremium), p.coverAmount ? formatZAR(p.coverAmount) : "N/A"])
    );
  }

  // ─ Extra Details (funding-type specific) ─
  const extraSheetKeys = ["property_details", "vehicle_details", "health_details", "business_details"];
  const activeExtra = config.sheets.filter((s) => extraSheetKeys.includes(s));
  if (activeExtra.length > 0) {
    doc.addPage(); y = 20;
    const titleMap: Record<string, string> = {
      property_details: "PROPERTY DETAILS",
      vehicle_details: "VEHICLE DETAILS",
      health_details: "HEALTH & COVER DETAILS",
      business_details: "BUSINESS DETAILS",
    };
    for (const key of activeExtra) {
      addTitle(titleMap[key] || key.toUpperCase());
      const rows: [string, string][] = config.extraFields.map((f) => [f.label, extraData[f.key] || "—"]);
      addKeyValue(rows);
    }
  }

  // ─ Financial Summary ─
  doc.addPage(); y = 20;
  addTitle(`FINANCIAL SUMMARY — ${config.label.toUpperCase()}`);
  addKeyValue([
    ["Total Monthly Gross Income", formatZAR(employmentInfo.monthlyGrossIncome + employmentInfo.otherIncome)],
    ["Total Monthly Net Income", formatZAR(employmentInfo.monthlyNetIncome + employmentInfo.otherIncome)],
    ["Total Monthly Expenses", formatZAR(totalMonthlyExpenses)],
    ["Total Monthly Debt Payments", formatZAR(totalMonthlyDebt)],
    ["Total Monthly Savings", formatZAR(totalSavingsContributions)],
    ["Total Monthly Outflows", formatZAR(totalMonthlyOutflows)],
    ["Disposable Income", formatZAR(disposableIncome)],
    ["Debt-to-Income Ratio", `${debtToIncomeRatio}%`],
    ["Total Assets", formatZAR(totalAssets)],
    ["Total Liabilities", formatZAR(totalLiabilities)],
    ["Net Worth", formatZAR(netWorth)],
  ]);

  // Affordability section
  if (config.key === "home_loan") {
    const loanAmt = parseFloat(extraData.loanAmount || "0");
    const propVal = parseFloat(extraData.propertyValue || "0");
    const deposit = parseFloat(extraData.depositAmount || "0");
    const rows: [string, string][] = [];
    if (propVal > 0) rows.push(["Property Value", formatZAR(propVal)]);
    if (deposit > 0) rows.push(["Deposit", formatZAR(deposit)]);
    if (deposit > 0 && propVal > 0) rows.push(["Deposit %", `${((deposit / propVal) * 100).toFixed(1)}%`]);
    if (loanAmt > 0) {
      rows.push(["Loan Amount", formatZAR(loanAmt)]);
      const est = loanAmt * 0.0095;
      rows.push(["Est. Monthly Instalment", formatZAR(est)]);
      rows.push(["Instalment % of Net Income", `${((est / (employmentInfo.monthlyNetIncome + employmentInfo.otherIncome)) * 100).toFixed(1)}%`]);
    }
    if (rows.length > 0) { addSubtitle("Home Loan Affordability"); addKeyValue(rows); }
  } else if (config.key === "vehicle_finance") {
    const finAmt = parseFloat(extraData.financeAmount || "0");
    if (finAmt > 0) {
      const est = finAmt * 0.022;
      addSubtitle("Vehicle Affordability");
      addKeyValue([
        ["Finance Amount", formatZAR(finAmt)],
        ["Est. Monthly Instalment", formatZAR(est)],
        ["Instalment % of Net Income", `${((est / (employmentInfo.monthlyNetIncome + employmentInfo.otherIncome)) * 100).toFixed(1)}%`],
      ]);
    }
  }

  // Credit notes
  addSubtitle("Credit Assessment Notes");
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(80, 80, 80);
  const allNotes = [...config.funderNotes, "Applicant has stable income with 8 years employment history", "Strong savings & investment portfolio demonstrates financial discipline"];
  for (const note of allNotes) {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.text(`• ${note}`, margin, y);
    y += 5;
  }

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, pageW / 2, 290, { align: "center" });
    doc.text("Generated by LegacyBuilder — Confidential", margin, 290);
  }

  const fileName = `${config.label.replace(/[\s\/]+/g, "_")}_Application_${personalInfo.fullName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);

  toast({
    title: "PDF report downloaded",
    description: `${fileName} has been saved to your downloads.`,
  });
};

// ── Component ──

const ApplyForFunding = () => {
  const [selectedType, setSelectedType] = useState<FundingTypeKey | null>(null);
  const [extraData, setExtraData] = useState<Record<string, string>>({});

  const config = selectedType ? fundingTypeConfigs.find((c) => c.key === selectedType)! : null;

  const handleSelectType = (key: FundingTypeKey) => {
    setSelectedType(key);
    setExtraData({});
  };

  const updateField = (key: string, value: string) => {
    setExtraData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDownload = () => {
    if (!config) return;
    generateExcel(config, extraData);
  };

  const handleDownloadPDF = () => {
    if (!config) return;
    generatePDF(config, extraData);
  };

  const handleBack = () => {
    setSelectedType(null);
    setExtraData({});
  };

  return (
    <DashboardLayout
      title="Apply for Funding"
      subtitle="Select a funding type and generate a tailored application pack"
    >
      {!selectedType ? (
        <div className="space-y-8">
          {/* Type Selection */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-2">What are you applying for?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Select a funding type below. The Excel pack will be customised with the sheets and information that funders typically require.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fundingTypeConfigs.map((ft) => (
                <button
                  key={ft.key}
                  onClick={() => handleSelectType(ft.key)}
                  className={cn(
                    "text-left p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-soft hover:-translate-y-0.5 group",
                    "border-border bg-card hover:border-primary/40"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", ft.color)}>
                      <ft.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground text-sm">{ft.label}</p>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{ft.description}</p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {ft.sheets.filter((s) => !["summary"].includes(s)).slice(0, 4).map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px] capitalize">
                            {s.replace(/_/g, " ")}
                          </Badge>
                        ))}
                        {ft.sheets.length > 5 && (
                          <Badge variant="secondary" className="text-[10px]">+{ft.sheets.length - 5} more</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Financial Snapshot */}
          <div>
            <h3 className="text-base font-semibold text-foreground mb-4">Your financial snapshot</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SnapshotCard label="Net Worth" value={formatZAR(netWorth)} icon={Wallet} />
              <SnapshotCard label="Monthly Net Income" value={formatZAR(employmentInfo.monthlyNetIncome + employmentInfo.otherIncome)} icon={TrendingUp} />
              <SnapshotCard label="Disposable Income" value={formatZAR(disposableIncome)} icon={Wallet} />
              <SnapshotCard label="Debt-to-Income" value={`${debtToIncomeRatio}%`} icon={CreditCard} />
            </div>
          </div>
        </div>
      ) : config ? (
        <div className="space-y-6">
          {/* Back + Header */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", config.color)}>
              <config.icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">{config.label}</h2>
              <p className="text-sm text-muted-foreground">{config.description}</p>
            </div>
          </div>

          {/* What's included */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                Sheets included in this pack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {config.sheets.map((s) => (
                  <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs font-medium text-foreground capitalize">{s.replace(/_/g, " ")}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Funder Notes */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/5 border border-primary/10">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">What funders look for</p>
              <ul className="space-y-1">
                {config.funderNotes.map((note, i) => (
                  <li key={i} className="text-xs text-muted-foreground">• {note}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Extra Fields */}
          {config.extraFields.length > 0 && (
            <Card className="shadow-soft">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Application Details</CardTitle>
                <p className="text-xs text-muted-foreground">Fill in the details specific to your {config.label.toLowerCase()} application. These will appear in a dedicated sheet.</p>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  {config.extraFields.map((field) => (
                    <div key={field.key} className={field.type === "textarea" ? "sm:col-span-2" : ""}>
                      <Label className="text-xs font-medium">{field.label}</Label>
                      {field.type === "select" ? (
                        <Select value={extraData[field.key] || ""} onValueChange={(v) => updateField(field.key, v)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map((opt) => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : field.type === "textarea" ? (
                        <Textarea
                          value={extraData[field.key] || ""}
                          onChange={(e) => updateField(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="mt-1"
                          rows={3}
                        />
                      ) : (
                        <Input
                          type={field.type}
                          value={extraData[field.key] || ""}
                          onChange={(e) => updateField(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="mt-1"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Download */}
          <Card className="shadow-soft border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileSpreadsheet className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">Download {config.label} Pack</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {config.sheets.length} tailored sheets ready for your funder
                  </p>
                </div>
              </div>
              <Button onClick={handleDownload} size="lg" className="gap-2 shrink-0">
                <Download className="w-5 h-5" /> Download Excel
              </Button>
            </CardContent>
          </Card>

          {/* Debt Summary */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Current Debt Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Creditor</th>
                      <th className="text-left py-2 px-3 text-muted-foreground font-medium">Type</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Balance</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Monthly</th>
                      <th className="text-right py-2 px-3 text-muted-foreground font-medium">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingDebts.map((d, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 px-3 font-medium text-foreground">{d.creditor}</td>
                        <td className="py-2.5 px-3 text-muted-foreground">{d.type}</td>
                        <td className="py-2.5 px-3 text-right text-foreground">{formatZAR(d.balance)}</td>
                        <td className="py-2.5 px-3 text-right text-foreground">{formatZAR(d.monthlyPayment)}</td>
                        <td className="py-2.5 px-3 text-right text-muted-foreground">{d.interestRate}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border font-semibold">
                      <td className="py-2.5 px-3 text-foreground" colSpan={2}>Total</td>
                      <td className="py-2.5 px-3 text-right text-foreground">{formatZAR(totalLiabilities)}</td>
                      <td className="py-2.5 px-3 text-right text-foreground">{formatZAR(totalMonthlyDebt)}</td>
                      <td className="py-2.5 px-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </DashboardLayout>
  );
};

const SnapshotCard = ({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) => (
  <Card className="shadow-soft">
    <CardContent className="p-5">
      <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-display font-bold text-foreground">{value}</p>
    </CardContent>
  </Card>
);

export default ApplyForFunding;
