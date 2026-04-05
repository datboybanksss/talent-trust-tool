import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  CalculatorState, computeGrossEstate, computeTotalLiabilities, computeNetEstate,
  computeTotalEstateCosts, computeScenarios, computeSustainableIncome, computeIncomeCliffRisk,
  capitaliseIncomeNeeds, formatZAR
} from "./estateCalculations";

export const generateEstateReport = (state: CalculatorState) => {
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

  const addSubHeader = (text: string) => {
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text(text, margin, y);
    y += 6;
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

  // Title
  doc.setFillColor(30, 58, 38);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("Estate Planning & Income Risk Report", margin, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Prepared: ${new Date().toLocaleDateString('en-ZA')} | Confidential`, margin, 26);
  y = 45;

  // Profile
  addHeader("1. Client Profile");
  const profileData = [
    ["Profession", state.profile.profession.charAt(0).toUpperCase() + state.profile.profession.slice(1)],
    ["Field", state.profile.field || "Not specified"],
    ["Age", String(state.profile.currentAge)],
    ["Remaining Career", `${state.profile.remainingCareerYears} years`],
    ["Contract Type", state.profile.contractType.replace('-', ' ')],
    ["Injury Risk", state.profile.injuryRisk.toUpperCase()],
    ["Marital Status", state.profile.maritalStatus.replace(/-/g, ' ')],
    ["Dependants", String(state.profile.numberOfDependants)],
    ["Dependency Window", `${state.profile.dependantsDependencyYears} years`],
  ];
  autoTable(doc, {
    startY: y, head: [["Parameter", "Value"]], body: profileData,
    margin: { left: margin, right: margin }, styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 38] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Income Analysis
  addHeader("2. Income Volatility Analysis");
  const sustainable = computeSustainableIncome(state.income);
  const cliff = computeIncomeCliffRisk(state.income);
  const incomeData = [
    ["Average Annual Income", formatZAR(state.income.averageAnnualIncome)],
    ["Highest Year", formatZAR(state.income.highestEarningYear)],
    ["Lowest Year", formatZAR(state.income.lowestEarningYear)],
    ["Guaranteed %", `${state.income.guaranteedIncomePct}%`],
    ["Variable %", `${state.income.variableIncomePct}%`],
    ["Sustainable Income Estimate", formatZAR(sustainable)],
    ["Income Cliff Risk", `${cliff.severity.toUpperCase()} (${formatZAR(cliff.dropAmount)} drop)`],
    ["Post-Career Income", formatZAR(state.income.expectedPostCareerIncome)],
  ];
  autoTable(doc, {
    startY: y, head: [["Metric", "Value"]], body: incomeData,
    margin: { left: margin, right: margin }, styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 38] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Estate Summary
  const grossEstate = computeGrossEstate(state.assets);
  const totalLiab = computeTotalLiabilities(state.liabilities);
  const netEstate = computeNetEstate(state.assets, state.liabilities);
  const estateCosts = computeTotalEstateCosts(grossEstate, netEstate);
  const capitalisedNeeds = capitaliseIncomeNeeds(state.dependantNeeds, state.profile.dependantsDependencyYears);

  addHeader("3. Estate & Liquidity Summary");
  const estateData = [
    ["Gross Estate Value", formatZAR(grossEstate)],
    ["Total Liabilities", formatZAR(totalLiab)],
    ["Net Estate", formatZAR(netEstate)],
    ["Executor's Fees (3.5% + VAT)", formatZAR(estateCosts.executorFees)],
    ["Estate Duty", formatZAR(estateCosts.estateDuty)],
    ["Admin & Legal Costs", formatZAR(estateCosts.adminCosts)],
    ["Total Estate Costs", formatZAR(estateCosts.total)],
    ["Capitalised Dependant Needs", formatZAR(capitalisedNeeds)],
  ];
  autoTable(doc, {
    startY: y, head: [["Item", "Amount (ZAR)"]], body: estateData,
    margin: { left: margin, right: margin }, styles: { fontSize: 9 },
    headStyles: { fillColor: [30, 58, 38] },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // Scenario Analysis
  doc.addPage();
  y = 20;
  addHeader("4. Scenario & Shortfall Analysis");
  const scenarios = computeScenarios(state);

  scenarios.forEach((scenario, i) => {
    if (y > 200) { doc.addPage(); y = 20; }
    addSubHeader(`Scenario ${i + 1}: ${scenario.name}`);
    addText(scenario.description);

    const scenarioData = [
      ["Liquidity Required", formatZAR(scenario.estateLiquidityRequired)],
      ["Liquidity Available", formatZAR(scenario.liquidityAvailable)],
      ["Uncovered Shortfall", scenario.uncoveredShortfall > 0 ? formatZAR(scenario.uncoveredShortfall) : "None"],
      ["At-Risk Dependants", String(scenario.atRiskDependants)],
    ];
    autoTable(doc, {
      startY: y, body: scenarioData,
      margin: { left: margin, right: margin }, styles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });
    y = (doc as any).lastAutoTable.finalY + 4;

    if (scenario.flags.length > 0) {
      addText("⚠ Flags: " + scenario.flags.join(" | "));
    }

    if (scenario.productsResponding.length > 0) {
      addText("Products Responding: " + scenario.productsResponding.map(p => `${p.description || 'Unnamed'} (${formatZAR(p.amount)})`).join(", "));
    }
    y += 4;
  });

  // Protection Products
  if (state.protectionProducts.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    addHeader("5. Risk & Protection Products");
    const prodData = state.protectionProducts.map(p => [
      p.type.replace(/-/g, ' '), p.description, formatZAR(p.coverAmount), p.linkedTo.join(', '),
    ]);
    autoTable(doc, {
      startY: y, head: [["Type", "Description", "Cover", "Linked To"]], body: prodData,
      margin: { left: margin, right: margin }, styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 58, 38] },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // Disclaimer
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setDrawColor(200, 160, 50);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  addText("DISCLAIMER: This calculator is illustrative only and does not constitute financial, tax, or legal advice. Outcomes for athletes and entertainers are highly sensitive to income volatility, health, and career duration. Consult a qualified financial adviser before making decisions based on these projections.");

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`LegacyBuilder – Estate Planning & Income Risk Report | Page ${i} of ${totalPages}`, margin, 290);
  }

  doc.save("Estate_Planning_Report.pdf");
};
