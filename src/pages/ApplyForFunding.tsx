import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  FileSpreadsheet,
  Home,
  Car,
  Shield,
  CreditCard,
  Wallet,
  TrendingUp,
  CheckCircle2,
  Building2,
  HeartPulse,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";
import { format } from "date-fns";

const formatZAR = (amount: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);

// ── Mock data (same sources as FinancialOverview & MonthlyBudget) ──

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

const fundingTypes = [
  { icon: Home, label: "Home Loan / Bond", description: "Purchase or refinance property" },
  { icon: Car, label: "Vehicle Finance", description: "New or used vehicle purchase" },
  { icon: HeartPulse, label: "Insurance Application", description: "Life, disability, or short-term cover" },
  { icon: CreditCard, label: "Personal Loan", description: "Unsecured personal financing" },
  { icon: Building2, label: "Business Loan", description: "Expand or start a business" },
  { icon: Shield, label: "Credit Facility", description: "Revolving credit or overdraft" },
];

const generateExcel = () => {
  const wb = XLSX.utils.book_new();
  const dateStr = format(new Date(), "dd MMMM yyyy");

  // Sheet 1: Cover
  const coverData = [
    ["FUNDING APPLICATION PACK"],
    [`Prepared for: ${personalInfo.fullName}`],
    [`Date Generated: ${dateStr}`],
    ["Generated by: LegacyBuilder"],
    [""],
    ["CONFIDENTIAL — For authorised financial institution use only"],
    [""],
    ["This document contains a comprehensive financial summary"],
    ["structured for quick credit assessment and decision-making."],
  ];
  const coverSheet = XLSX.utils.aoa_to_sheet(coverData);
  coverSheet["!cols"] = [{ wch: 60 }];
  XLSX.utils.book_append_sheet(wb, coverSheet, "Cover Page");

  // Sheet 2: Personal Info
  const personalData = [
    ["PERSONAL INFORMATION"],
    [""],
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
  const personalSheet = XLSX.utils.aoa_to_sheet(personalData);
  personalSheet["!cols"] = [{ wch: 25 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, personalSheet, "Personal Info");

  // Sheet 3: Employment & Income
  const employmentData = [
    ["EMPLOYMENT & INCOME DETAILS"],
    [""],
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
  const employmentSheet = XLSX.utils.aoa_to_sheet(employmentData);
  employmentSheet["!cols"] = [{ wch: 25 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, employmentSheet, "Employment & Income");

  // Sheet 4: Bank Accounts & Assets
  const assetsData = [
    ["BANK ACCOUNTS & ASSETS"],
    [""],
    ["Bank / Institution", "Account Type", "Balance (ZAR)"],
    ...bankAccounts.map((a) => [a.bank, a.type, a.balance]),
    [""],
    ["SAVINGS & INVESTMENT PROVISIONS"],
    [""],
    ["Type", "Monthly Contribution (ZAR)", "Total Value (ZAR)"],
    ...savingsProvisions.map((s) => [s.type, s.monthlyContribution, s.totalValue]),
    [""],
    ["TOTAL ASSETS", "", totalAssets],
  ];
  const assetsSheet = XLSX.utils.aoa_to_sheet(assetsData);
  assetsSheet["!cols"] = [{ wch: 30 }, { wch: 25 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, assetsSheet, "Assets & Savings");

  // Sheet 5: Existing Debts
  const debtData = [
    ["EXISTING DEBT OBLIGATIONS"],
    [""],
    ["Creditor", "Type", "Outstanding Balance (ZAR)", "Monthly Payment (ZAR)", "Interest Rate (%)"],
    ...existingDebts.map((d) => [d.creditor, d.type, d.balance, d.monthlyPayment, d.interestRate]),
    [""],
    ["TOTAL", "", totalLiabilities, totalMonthlyDebt, ""],
  ];
  const debtSheet = XLSX.utils.aoa_to_sheet(debtData);
  debtSheet["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 22 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, debtSheet, "Existing Debts");

  // Sheet 6: Monthly Budget
  const budgetData = [
    ["MONTHLY BUDGET BREAKDOWN"],
    [""],
    ["Category", "Monthly Amount (ZAR)"],
    ...monthlyExpenses.map((e) => [e.category, e.amount]),
    [""],
    ["Total Living Expenses", totalMonthlyExpenses],
    ["Total Debt Repayments", totalMonthlyDebt],
    ["Total Savings Contributions", totalSavingsContributions],
    [""],
    ["TOTAL MONTHLY OUTFLOWS", totalMonthlyOutflows],
    ["DISPOSABLE INCOME", disposableIncome],
  ];
  const budgetSheet = XLSX.utils.aoa_to_sheet(budgetData);
  budgetSheet["!cols"] = [{ wch: 30 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, budgetSheet, "Monthly Budget");

  // Sheet 7: Insurance
  const insuranceData = [
    ["INSURANCE POLICIES"],
    [""],
    ["Provider", "Type", "Monthly Premium (ZAR)", "Cover Amount (ZAR)"],
    ...insurancePolicies.map((p) => [p.provider, p.type, p.monthlyPremium, p.coverAmount || "N/A"]),
  ];
  const insuranceSheet = XLSX.utils.aoa_to_sheet(insuranceData);
  insuranceSheet["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 22 }, { wch: 22 }];
  XLSX.utils.book_append_sheet(wb, insuranceSheet, "Insurance");

  // Sheet 8: Summary for Funder
  const summaryData = [
    ["FINANCIAL SUMMARY FOR FUNDER"],
    [""],
    ["Key Metric", "Value"],
    ["Total Monthly Gross Income", formatZAR(employmentInfo.monthlyGrossIncome + employmentInfo.otherIncome)],
    ["Total Monthly Net Income", formatZAR(employmentInfo.monthlyNetIncome + employmentInfo.otherIncome)],
    ["Total Monthly Expenses", formatZAR(totalMonthlyExpenses)],
    ["Total Monthly Debt Payments", formatZAR(totalMonthlyDebt)],
    ["Total Monthly Savings", formatZAR(totalSavingsContributions)],
    ["Total Monthly Outflows", formatZAR(totalMonthlyOutflows)],
    ["Disposable Income (Available for new debt)", formatZAR(disposableIncome)],
    [""],
    ["Debt-to-Income Ratio", `${debtToIncomeRatio}%`],
    [""],
    ["Total Assets", formatZAR(totalAssets)],
    ["Total Liabilities", formatZAR(totalLiabilities)],
    ["Net Worth", formatZAR(netWorth)],
    [""],
    ["Credit Assessment Notes:"],
    ["- Applicant has a stable income with 8 years employment history"],
    ["- Debt-to-income ratio is within acceptable range"],
    ["- Strong savings & investment portfolio demonstrates financial discipline"],
    ["- Medical aid and insurance are in place"],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  summarySheet["!cols"] = [{ wch: 45 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, "Funder Summary");

  const fileName = `FundingApplication_${personalInfo.fullName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.xlsx`;
  XLSX.writeFile(wb, fileName);

  toast({
    title: "Funding pack downloaded",
    description: `${fileName} has been saved to your downloads.`,
  });
};

const ApplyForFunding = () => {
  return (
    <DashboardLayout
      title="Apply for Funding"
      subtitle="Generate a structured financial pack for lenders, banks, and insurers"
    >
      <div className="space-y-8">
        {/* Download CTA */}
        <Card className="shadow-soft border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-foreground">Download Funding Application Pack</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  All your financial data compiled into a structured Excel document ready for submission.
                </p>
              </div>
            </div>
            <Button onClick={generateExcel} size="lg" className="gap-2 shrink-0">
              <Download className="w-5 h-5" /> Download Excel
            </Button>
          </CardContent>
        </Card>

        {/* What's included */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">What's included in your funding pack</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Personal Information",
              "Employment & Income",
              "Bank Accounts & Assets",
              "Savings & Investments",
              "Existing Debt Obligations",
              "Monthly Budget Breakdown",
              "Insurance Policies",
              "Funder Summary & Ratios",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Funding Types */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Suitable for these funding applications</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fundingTypes.map((ft) => (
              <Card key={ft.label} className="shadow-soft">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <ft.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">{ft.label}</p>
                    <p className="text-xs text-muted-foreground">{ft.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        {/* Quick Financial Snapshot */}
        <div>
          <h3 className="text-base font-semibold text-foreground mb-4">Your financial snapshot</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SnapshotCard label="Net Worth" value={formatZAR(netWorth)} icon={Wallet} />
            <SnapshotCard label="Monthly Net Income" value={formatZAR(employmentInfo.monthlyNetIncome + employmentInfo.otherIncome)} icon={TrendingUp} />
            <SnapshotCard label="Disposable Income" value={formatZAR(disposableIncome)} icon={Wallet} />
            <SnapshotCard label="Debt-to-Income" value={`${debtToIncomeRatio}%`} icon={CreditCard} />
          </div>
        </div>

        {/* Debt Summary Table */}
        <Card className="shadow-soft">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Existing Debt Summary</CardTitle>
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
    </DashboardLayout>
  );
};

const SnapshotCard = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
}) => (
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
