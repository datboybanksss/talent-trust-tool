import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RetirementState, computeRetirementEstimate, RetirementEstimate } from "./retirementCalculations";
import { formatZAR } from "./estateCalculations";

interface SavedScenario {
  label: string;
  state: RetirementState;
  estimate: RetirementEstimate;
}

export const generateRetirementReport = (state: RetirementState, scenarios?: SavedScenario[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 20;

  const addHeader = (text: string) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 38);
    doc.text(text, margin, y);
    y += 8;
  };

  const addText = (text: string) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    if (y + lines.length * 4 > 280) { doc.addPage(); y = 20; }
    doc.text(lines, margin, y);
    y += lines.length * 4 + 2;
  };

  const estimate = computeRetirementEstimate(state);

  // Title
  doc.setFillColor(30, 58, 38);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Retirement Planning Estimate", margin, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Prepared: ${new Date().toLocaleDateString('en-ZA')} | Confidential`, margin, 26);
  y = 45;

  // Profile
  addHeader("1. Your Details");
  autoTable(doc, {
    startY: y,
    head: [["Detail", "Value"]],
    body: [
      ["Current Age", String(state.personal.currentAge)],
      ["Retirement Age", String(state.personal.retirementAge)],
      ["Years to Retirement", `${estimate.yearsToRetirement} years`],
      ["Life Expectancy", String(state.financial.lifeExpectancy)],
      ["Years in Retirement", `${estimate.yearsInRetirement} years`],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 38] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Savings Gap
  addHeader("2. Retirement Savings Gap");
  autoTable(doc, {
    startY: y,
    head: [["Component", "Amount (ZAR)"]],
    body: [
      ["Retirement Corpus Needed", formatZAR(estimate.retirementCorpusNeeded)],
      ["Projected Savings at Retirement", formatZAR(estimate.projectedSavingsAtRetirement)],
      ["SHORTFALL", estimate.savingsShortfall > 0 ? formatZAR(estimate.savingsShortfall) : "On track"],
      ["Additional Monthly Saving Needed", estimate.additionalMonthlySavingNeeded > 0 ? formatZAR(estimate.additionalMonthlySavingNeeded) : "None"],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 38] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Income Estimate
  addHeader("3. Projected Retirement Income");
  autoTable(doc, {
    startY: y,
    head: [["Component", "Value"]],
    body: [
      ["Projected Monthly Income from Savings", formatZAR(estimate.projectedMonthlyIncomeFromSavings)],
      ["Income Replacement Ratio", `${estimate.incomeReplacementRatio.toFixed(1)}%`],
      ["Desired Monthly Retirement Income", formatZAR(state.financial.desiredMonthlyRetirementIncome)],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 38] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Flags
  if (estimate.flags.length > 0) {
    addHeader("4. Key Warnings");
    estimate.flags.forEach(flag => addText(`⚠ ${flag}`));
  }

  // Illustrative Solutions
  if (estimate.savingsShortfall > 0) {
    addHeader("5. Illustrative Solutions");
    addText(`Based on your estimated shortfall of ${formatZAR(estimate.savingsShortfall)}, the following products may help bridge the gap:`);
    autoTable(doc, {
      startY: y,
      head: [["Product", "Description"]],
      body: [
        ["Retirement Annuity (RA)", "Tax-deductible contributions to build your retirement corpus. Ideal for closing the savings gap."],
        ["Living Annuity", "Flexible income drawdown at retirement. Choose between 2.5% - 17.5% of your investment annually."],
        ["Tax-Free Savings Account", "Contribute up to R36,000/year (R500,000 lifetime) with no tax on growth or withdrawals."],
        ["Endowment Policy", "Medium- to long-term savings vehicle with tax advantages for supplementing retirement savings."],
      ],
      margin: { left: margin, right: margin },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 38] },
      columnStyles: { 0: { cellWidth: 45 } },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Scenario Comparison
  if (scenarios && scenarios.length === 2) {
    doc.addPage();
    y = 20;
    addHeader("Scenario Comparison");
    autoTable(doc, {
      startY: y,
      head: [["Metric", scenarios[0].label, scenarios[1].label]],
      body: [
        ["Retirement Age", `${scenarios[0].state.personal.retirementAge}`, `${scenarios[1].state.personal.retirementAge}`],
        ["Years to Retirement", `${scenarios[0].estimate.yearsToRetirement}`, `${scenarios[1].estimate.yearsToRetirement}`],
        ["Monthly Contribution", formatZAR(scenarios[0].state.financial.monthlyContribution), formatZAR(scenarios[1].state.financial.monthlyContribution)],
        ["Corpus Needed", formatZAR(scenarios[0].estimate.retirementCorpusNeeded), formatZAR(scenarios[1].estimate.retirementCorpusNeeded)],
        ["Projected Savings", formatZAR(scenarios[0].estimate.projectedSavingsAtRetirement), formatZAR(scenarios[1].estimate.projectedSavingsAtRetirement)],
        ["Shortfall", scenarios[0].estimate.savingsShortfall > 0 ? formatZAR(scenarios[0].estimate.savingsShortfall) : "On Track", scenarios[1].estimate.savingsShortfall > 0 ? formatZAR(scenarios[1].estimate.savingsShortfall) : "On Track"],
        ["Extra Monthly Needed", formatZAR(scenarios[0].estimate.additionalMonthlySavingNeeded), formatZAR(scenarios[1].estimate.additionalMonthlySavingNeeded)],
        ["Projected Monthly Income", formatZAR(scenarios[0].estimate.projectedMonthlyIncomeFromSavings), formatZAR(scenarios[1].estimate.projectedMonthlyIncomeFromSavings)],
        ["Income Replacement", `${scenarios[0].estimate.incomeReplacementRatio.toFixed(0)}%`, `${scenarios[1].estimate.incomeReplacementRatio.toFixed(0)}%`],
      ],
      margin: { left: margin, right: margin },
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 58, 38] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // CTA
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFillColor(30, 58, 38);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 20, 3, 3, 'F');
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Speak to a Certified Financial Planner (CFP®) for personalised advice.", margin + 6, y + 12);
  y += 28;

  // Disclaimer
  if (y > 260) { doc.addPage(); y = 20; }
  doc.setDrawColor(200, 160, 50);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  addText("DISCLAIMER: This calculator is illustrative only and does not constitute financial, tax, or legal advice. Outcomes are sensitive to market performance, inflation, and personal circumstances. Consult a certified financial planner before making decisions based on these projections.");

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`LegacyBuilder – Retirement Planning Estimate | Page ${i} of ${totalPages}`, margin, 290);
  }

  doc.save("Retirement_Planning_Estimate.pdf");
};
