import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { EstimatorState, computeInsuranceEstimate, computeTotalAssets, formatZAR, InsuranceEstimate } from "./estateCalculations";

interface SavedScenario {
  label: string;
  state: EstimatorState;
  estimate: InsuranceEstimate;
}

export const generateEstateReport = (state: EstimatorState, scenarios?: SavedScenario[]) => {
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
  const grossEstate = computeTotalAssets(state.financial.assets);

  // Title
  doc.setFillColor(30, 58, 38);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Estate Planning Estimate", margin, 16);
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
      ["Age", String(state.personal.currentAge)],
      ["Remaining Working Years", `${state.personal.remainingWorkingYears} years`],
      ["Marital Status", state.personal.maritalStatus.replace(/-/g, ' ')],
      ["Dependants", String(state.personal.numberOfDependants)],
      ["Dependency Window", `${state.personal.dependantsDependencyYears} years`],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 38] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Asset Breakdown
  addHeader("2. Asset Breakdown");
  const assetRows: string[][] = [];
  if (state.financial.assets.property > 0) assetRows.push(["Property", formatZAR(state.financial.assets.property)]);
  if (state.financial.assets.business > 0) assetRows.push(["Business Interests", formatZAR(state.financial.assets.business)]);
  if (state.financial.assets.shares > 0) assetRows.push(["Shares & Investments", formatZAR(state.financial.assets.shares)]);
  if (state.financial.assets.cashSavings > 0) assetRows.push(["Cash & Savings", formatZAR(state.financial.assets.cashSavings)]);
  if (state.financial.assets.vehicles > 0) assetRows.push(["Vehicles", formatZAR(state.financial.assets.vehicles)]);
  if (state.financial.assets.otherAssets > 0) assetRows.push(["Other Assets", formatZAR(state.financial.assets.otherAssets)]);
  assetRows.push(["GROSS ESTATE", formatZAR(grossEstate)]);
  assetRows.push(["Less: Total Debts", formatZAR(state.financial.totalDebts)]);
  assetRows.push(["NET ESTATE", formatZAR(grossEstate - state.financial.totalDebts)]);
  autoTable(doc, {
    startY: y,
    head: [["Asset Class", "Value (ZAR)"]],
    body: assetRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 38] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Insurance Policies
  addHeader("3. Existing Insurance Policies");
  const pol = state.financial.insurancePolicies;
  const polRows: string[][] = [
    ["Life Insurance", formatZAR(pol.lifeCover)],
    ["Credit Life Insurance", formatZAR(pol.creditLife)],
    ["Key-Man Insurance", formatZAR(pol.keyManInsurance)],
    ["Buy-Sell Insurance", formatZAR(pol.buySellCover)],
    ["TOTAL DEATH COVER", formatZAR(estimate.totalExistingDeathCover)],
    ["Disability Cover", formatZAR(pol.disabilityCover)],
    ["Income Protection", formatZAR(pol.incomeProtection)],
    ["TOTAL DISABILITY COVER", formatZAR(estimate.totalExistingDisabilityCover)],
    ["Funeral Cover", formatZAR(pol.funeralCover)],
  ];
  autoTable(doc, {
    startY: y,
    head: [["Policy Type", "Cover Amount (ZAR)"]],
    body: polRows,
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 38] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Life Cover
  addHeader("4. Estimated Life Cover Need (Death)");
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
      ["Existing Death Cover (Life + Credit Life + Key-Man + Buy-Sell)", formatZAR(estimate.totalExistingDeathCover)],
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
  addHeader("5. Estimated Disability Cover Need");
  autoTable(doc, {
    startY: y,
    head: [["Component", "Amount (ZAR)"]],
    body: [
      ["Lost Career Income", formatZAR(estimate.lostCareerIncome)],
      ["Ongoing Living Expenses (capitalised)", formatZAR(estimate.ongoingExpenses)],
      ["TOTAL NEED", formatZAR(estimate.totalDisabilityNeed)],
      ["Existing Disability Cover (Disability + Income Protection)", formatZAR(estimate.totalExistingDisabilityCover)],
      ["SHORTFALL", estimate.disabilityShortfall > 0 ? formatZAR(estimate.disabilityShortfall) : "Adequately covered"],
    ],
    margin: { left: margin, right: margin },
    styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 38] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Flags
  if (estimate.flags.length > 0) {
    addHeader("6. Key Warnings");
    estimate.flags.forEach(flag => addText(`⚠ ${flag}`));
  }

  // Illustrative Solutions
  if (estimate.lifeShortfall > 0 || estimate.disabilityShortfall > 0) {
    addHeader("7. Illustrative Solutions");
    addText("Based on your estimated shortfalls, the following products may help protect your estate and family:");
    const solutions: string[][] = [];
    if (estimate.lifeShortfall > 0) solutions.push(["Life Insurance", `A life cover policy of at least ${formatZAR(estimate.lifeShortfall)} to protect dependants and cover estate costs.`]);
    if (estimate.disabilityShortfall > 0) solutions.push(["Disability Cover", `A lump-sum benefit of at least ${formatZAR(estimate.disabilityShortfall)} to replace lost income.`]);
    if (state.financial.insurancePolicies.creditLife === 0 && state.financial.totalDebts > 0) solutions.push(["Credit Life Insurance", `Covers outstanding debts of ${formatZAR(state.financial.totalDebts)} on death or disability.`]);
    if (state.financial.assets.business > 0 && state.financial.insurancePolicies.keyManInsurance === 0) solutions.push(["Key-Man Insurance", "Protects business from financial loss if a key person dies or becomes disabled."]);
    if (state.financial.assets.business > 0 && state.financial.insurancePolicies.buySellCover === 0) solutions.push(["Buy-Sell Insurance", "Funds a buy-sell agreement between business partners on death."]);
    solutions.push(["Estate Cover / Liquidity Policy", `Ensures executor's fees, estate duty, and admin costs (${formatZAR(estimate.estateCosts.total)}) are covered without selling assets.`]);
    solutions.push(["Gap Cover", "Covers the shortfall between medical aid payments and actual medical costs."]);
    solutions.push(["Income Protection", "Monthly benefit (typically 75% of income) if unable to work due to illness or injury."]);
    if (estimate.funeralCosts > 0) solutions.push(["Funeral Cover", `Dedicated funeral policy of ${formatZAR(estimate.funeralCosts)} for immediate liquidity.`]);

    autoTable(doc, {
      startY: y,
      head: [["Product", "Description"]],
      body: solutions,
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
        ["Age", `${scenarios[0].state.personal.currentAge}`, `${scenarios[1].state.personal.currentAge}`],
        ["Working Years Left", `${scenarios[0].state.personal.remainingWorkingYears}`, `${scenarios[1].state.personal.remainingWorkingYears}`],
        ["Monthly Income", formatZAR(scenarios[0].state.financial.monthlyIncome), formatZAR(scenarios[1].state.financial.monthlyIncome)],
        ["Gross Estate", formatZAR(scenarios[0].estimate.grossEstate), formatZAR(scenarios[1].estimate.grossEstate)],
        ["Total Debts", formatZAR(scenarios[0].state.financial.totalDebts), formatZAR(scenarios[1].state.financial.totalDebts)],
        ["Estate Costs", formatZAR(scenarios[0].estimate.estateCosts.total), formatZAR(scenarios[1].estimate.estateCosts.total)],
        ["Total Death Need", formatZAR(scenarios[0].estimate.totalDeathNeed), formatZAR(scenarios[1].estimate.totalDeathNeed)],
        ["Life Shortfall", scenarios[0].estimate.lifeShortfall > 0 ? formatZAR(scenarios[0].estimate.lifeShortfall) : "Adequate", scenarios[1].estimate.lifeShortfall > 0 ? formatZAR(scenarios[1].estimate.lifeShortfall) : "Adequate"],
        ["Disability Shortfall", scenarios[0].estimate.disabilityShortfall > 0 ? formatZAR(scenarios[0].estimate.disabilityShortfall) : "Adequate", scenarios[1].estimate.disabilityShortfall > 0 ? formatZAR(scenarios[1].estimate.disabilityShortfall) : "Adequate"],
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
  addText("DISCLAIMER: This calculator is illustrative only and does not constitute financial, tax, or legal advice. Outcomes are sensitive to personal circumstances, tax legislation, and market conditions. Consult a certified financial planner before making decisions based on these projections.");

  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`LegacyBuilder – Estate Planning Estimate | Page ${i} of ${totalPages}`, margin, 290);
  }

  doc.save("Estate_Planning_Estimate.pdf");
};
