import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { RetirementState, computeRetirementEstimate } from "./retirementCalculations";
import { formatZAR } from "./estateCalculations";

export const generateRetirementReport = (state: RetirementState) => {
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
      ["Profession", state.personal.profession],
      ["Field", state.personal.field || "Not specified"],
      ["Current Age", String(state.personal.currentAge)],
      ["Retirement Age", String(state.personal.retirementAge)],
      ["Remaining Career", `${state.personal.remainingCareerYears} years`],
      ["Years to Retirement", `${estimate.yearsToRetirement} years`],
      ["Career End Age", String(estimate.careerEndAge)],
      ["Post-Career Gap", `${estimate.postCareerGapYears} years`],
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

  // Disclaimer
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setDrawColor(200, 160, 50);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  addText("DISCLAIMER: This calculator is illustrative only and does not constitute financial, tax, or legal advice. Outcomes for athletes and entertainers are highly sensitive to income volatility, health, and career duration. Consult a qualified financial adviser before making decisions based on these projections.");

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`LegacyBuilder – Retirement Planning Estimate | Page ${i} of ${totalPages}`, margin, 290);
  }

  doc.save("Retirement_Planning_Estimate.pdf");
};
