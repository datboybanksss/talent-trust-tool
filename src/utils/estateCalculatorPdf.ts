import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { EstimatorState, computeInsuranceEstimate, formatZAR } from "./estateCalculations";

export const generateEstateReport = (state: EstimatorState) => {
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

  const estimate = computeInsuranceEstimate(state);

  // Title
  doc.setFillColor(30, 58, 38);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Insurance Needs Estimate", margin, 16);
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
      ["Age", String(state.personal.currentAge)],
      ["Remaining Career", `${state.personal.remainingCareerYears} years`],
      ["Marital Status", state.personal.maritalStatus.replace(/-/g, ' ')],
      ["Dependants", String(state.personal.numberOfDependants)],
      ["Dependency Window", `${state.personal.dependantsDependencyYears} years`],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 38] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Life Cover
  addHeader("2. Estimated Life Cover Need (Death)");
  autoTable(doc, {
    startY: y,
    head: [["Component", "Amount (ZAR)"]],
    body: [
      ["Estate Costs (Executor, Duty, Admin)", formatZAR(estimate.estateCosts.total)],
      ["Debt Settlement", formatZAR(estimate.debtSettlement)],
      ["Income Replacement for Dependants", formatZAR(estimate.incomeReplacement)],
      ["Education Fund", formatZAR(estimate.educationFund)],
      ["Funeral Costs", formatZAR(estimate.funeralCosts)],
      ...(estimate.propertyTransfer.combinedTotal > 0 ? [["Property Transfer Costs", formatZAR(estimate.propertyTransfer.combinedTotal)]] : []),
      ["TOTAL NEED", formatZAR(estimate.totalDeathNeed)],
      ["Existing Life Cover", formatZAR(estimate.existingLifeCover)],
      ["SHORTFALL", estimate.lifeShortfall > 0 ? formatZAR(estimate.lifeShortfall) : "Adequately covered"],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 38] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Property Transfer Detail
  if (estimate.propertyTransfer.properties.length > 0) {
    addHeader("Property Transfer Cost Breakdown");
    const propData = estimate.propertyTransfer.properties.map(p => [
      p.description, formatZAR(p.value), formatZAR(p.costs.transferDuty),
      formatZAR(p.costs.conveyancingFees), formatZAR(p.costs.total),
    ]);
    propData.push(["COMBINED TOTAL", "", "", "", formatZAR(estimate.propertyTransfer.combinedTotal)]);
    autoTable(doc, {
      startY: y,
      head: [["Property", "Value", "Transfer Duty", "Conveyancing", "Total Cost"]],
      body: propData,
      margin: { left: margin, right: margin },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 38] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Disability Cover
  addHeader("3. Estimated Disability Cover Need (Permanent Disability)");
  autoTable(doc, {
    startY: y,
    head: [["Component", "Amount (ZAR)"]],
    body: [
      ["Lost Career Income", formatZAR(estimate.lostCareerIncome)],
      ["Ongoing Living Expenses (capitalised)", formatZAR(estimate.ongoingExpenses)],
      ["TOTAL NEED", formatZAR(estimate.totalDisabilityNeed)],
      ["Existing Disability Cover", formatZAR(estimate.existingDisabilityCover)],
      ["SHORTFALL", estimate.disabilityShortfall > 0 ? formatZAR(estimate.disabilityShortfall) : "Adequately covered"],
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
    doc.text(`LegacyBuilder – Insurance Needs Estimate | Page ${i} of ${totalPages}`, margin, 290);
  }

  doc.save("Insurance_Needs_Estimate.pdf");
};
