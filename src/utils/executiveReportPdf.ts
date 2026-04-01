import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { saveAs } from "file-saver";

interface AssetSummary {
  title: string;
  value: string;
  count?: number;
  trend?: { value: number; positive: boolean };
}

interface ComplianceItem {
  name: string;
  status: "compliant" | "warning" | "critical";
  dueDate?: string;
}

interface Contract {
  name: string;
  type: string;
  expiryDate: string;
  daysUntilExpiry: number;
  value?: string;
}

interface QuickStat {
  label: string;
  value: string | number;
}

interface LifeFileItem {
  name: string;
  status: "complete" | "incomplete" | "needs-update";
  lastUpdated?: string;
}

interface AdvisorInfo {
  count: number;
  types: string;
}

interface ExecutiveReportData {
  userName?: string;
  totalPortfolioValue: string;
  quarterlyChange: string;
  companiesCount: number;
  contractsCount: number;
  complianceScore: number | undefined;
  assets: AssetSummary[];
  complianceItems: ComplianceItem[];
  contracts: Contract[];
  quickStats: QuickStat[];
  lifeFileItems: LifeFileItem[];
  beneficiariesCount: number;
  emergencyContactsCount: number;
  advisors: AdvisorInfo;
  documentsStored: number;
  nextDeadline: { date: string; description: string };
  insurancePolicies: number;
}

/* ── Chart colours ── */
const forestGreen: [number, number, number] = [34, 87, 60];
const goldColor: [number, number, number] = [196, 155, 45];
const chartPalette: [number, number, number][] = [
  forestGreen,
  goldColor,
  [70, 130, 100],
  [220, 180, 80],
  [45, 110, 78],
  [180, 140, 50],
  [100, 160, 120],
  [160, 120, 40],
];

/* ── Donut chart helper ── */
function drawDonutChart(
  doc: jsPDF,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  data: { label: string; value: number }[],
  showLegend = true
) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return;

  let startAngle = -Math.PI / 2;
  data.forEach((slice, i) => {
    const sliceAngle = (slice.value / total) * Math.PI * 2;
    const color = chartPalette[i % chartPalette.length];
    doc.setFillColor(...color);

    const steps = Math.max(24, Math.ceil(sliceAngle * 30));
    const pts: [number, number][] = [];
    for (let s = 0; s <= steps; s++) {
      const a = startAngle + (sliceAngle * s) / steps;
      pts.push([cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR]);
    }
    for (let s = steps; s >= 0; s--) {
      const a = startAngle + (sliceAngle * s) / steps;
      pts.push([cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR]);
    }
    for (let s = 1; s < pts.length - 1; s++) {
      doc.triangle(pts[0][0], pts[0][1], pts[s][0], pts[s][1], pts[s + 1][0], pts[s + 1][1], "F");
    }
    startAngle += sliceAngle;
  });

  // Centre hole
  doc.setFillColor(255, 255, 255);
  const holeSteps = 48;
  const holePts: [number, number][] = [];
  for (let s = 0; s <= holeSteps; s++) {
    const a = (Math.PI * 2 * s) / holeSteps;
    holePts.push([cx + Math.cos(a) * innerR, cy + Math.sin(a) * innerR]);
  }
  for (let s = 1; s < holePts.length - 1; s++) {
    doc.triangle(holePts[0][0], holePts[0][1], holePts[s][0], holePts[s][1], holePts[s + 1][0], holePts[s + 1][1], "F");
  }

  if (showLegend) {
    let ly = cy - (data.length * 6) / 2;
    const lx = cx + outerR + 10;
    doc.setFontSize(7);
    data.forEach((slice, i) => {
      const color = chartPalette[i % chartPalette.length];
      doc.setFillColor(...color);
      doc.rect(lx, ly - 3, 6, 6, "F");
      doc.setTextColor(60, 60, 60);
      const pct = ((slice.value / total) * 100).toFixed(0);
      doc.text(`${slice.label} (${pct}%)`, lx + 9, ly + 1.5);
      ly += 9;
    });
  }
}

/* ── Horizontal bar chart helper ── */
function drawHBarChart(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  data: { label: string; value: number }[],
  barHeight = 10,
  gap = 5
) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  doc.setFontSize(7);
  data.forEach((item, i) => {
    const by = y + i * (barHeight + gap);
    const color = chartPalette[i % chartPalette.length];
    const bw = (item.value / maxVal) * (width - 50);

    doc.setTextColor(80, 80, 80);
    doc.text(item.label, x, by + barHeight / 2 + 1.5);

    doc.setFillColor(240, 240, 240);
    doc.roundedRect(x + 48, by, width - 50, barHeight, 2, 2, "F");
    doc.setFillColor(...color);
    doc.roundedRect(x + 48, by, Math.max(bw, 2), barHeight, 2, 2, "F");

    doc.setTextColor(60, 60, 60);
    doc.text(item.value.toLocaleString(), x + 48 + Math.max(bw, 2) + 3, by + barHeight / 2 + 1.5);
  });
  return y + data.length * (barHeight + gap);
}

export const generateExecutiveReportPDF = (data: ExecutiveReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  const darkText: [number, number, number] = [30, 30, 30];
  const mutedText: [number, number, number] = [120, 120, 120];

  // ── Header ──
  doc.setFillColor(...forestGreen);
  doc.rect(0, 0, pageWidth, 45, "F");
  doc.setFillColor(...goldColor);
  doc.rect(0, 45, pageWidth, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Report", 20, 22);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Prepared for: ${data.userName || "Client"}`, 20, 32);
  doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, pageWidth - 20, 32, { align: "right" });
  doc.setFontSize(9);
  doc.text("CONFIDENTIAL", 20, 40);
  doc.text("LegacyBuilder \u2022 For Elite Performers", pageWidth - 20, 40, { align: "right" });

  yPosition = 58;
  doc.setTextColor(...darkText);

  // ── Portfolio Summary Banner ──
  doc.setFillColor(250, 248, 240);
  doc.roundedRect(15, yPosition, pageWidth - 30, 30, 3, 3, "F");
  doc.setDrawColor(...goldColor);
  doc.roundedRect(15, yPosition, pageWidth - 30, 30, 3, 3, "S");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...mutedText);
  doc.text("TOTAL PORTFOLIO VALUE", 25, yPosition + 10);
  doc.setFontSize(22);
  doc.setTextColor(...darkText);
  doc.text(data.totalPortfolioValue, 25, yPosition + 22);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const rightX = pageWidth - 25;
  doc.setTextColor(...mutedText);
  doc.text(`${data.quarterlyChange} from last quarter`, rightX, yPosition + 10, { align: "right" });
  const compScore = data.complianceScore !== undefined ? `${data.complianceScore}% Compliance` : "";
  doc.text(`${data.companiesCount} Companies  \u2022  ${data.contractsCount} Contracts${compScore ? `  \u2022  ${compScore}` : ""}`, rightX, yPosition + 18, { align: "right" });

  yPosition += 42;

  // ── Section title helper ──
  const sectionTitle = (title: string) => {
    checkPageBreak(30);
    doc.setFillColor(...forestGreen);
    doc.rect(15, yPosition, 4, 14, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkText);
    doc.text(title, 24, yPosition + 10);
    yPosition += 20;
  };

  // ── Asset Breakdown with Donut Chart ──
  sectionTitle("Asset Breakdown");

  // Parse numeric values
  const assetChartData = data.assets.map((a) => ({
    label: a.title,
    value: parseFloat(a.value.replace(/[^\d.]/g, "")) || 0,
  }));

  checkPageBreak(70);
  drawDonutChart(doc, 55, yPosition + 30, 25, 14, assetChartData, true);
  yPosition += 68;

  autoTable(doc, {
    startY: yPosition,
    head: [["Asset Class", "Value", "Items", "Trend"]],
    body: data.assets.map((a) => [
      a.title,
      a.value,
      a.count !== undefined ? `${a.count}` : "-",
      a.trend ? `${a.trend.positive ? "\u25B2" : "\u25BC"} ${a.trend.value}%` : "-",
    ]),
    theme: "grid",
    headStyles: { fillColor: [...forestGreen] as any, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 5 },
    margin: { left: 15, right: 15 },
    didParseCell: (cellData) => {
      if (cellData.column.index === 3 && cellData.section === "body") {
        const val = cellData.cell.raw as string;
        if (val.includes("\u25B2")) cellData.cell.styles.textColor = [34, 139, 34];
        else if (val.includes("\u25BC")) cellData.cell.styles.textColor = [220, 20, 60];
      }
    },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ── Contract Expiry Timeline with Bar Chart ──
  sectionTitle("Contract Expiry Timeline");

  const contractChartData = data.contracts.map((c) => ({
    label: c.name.length > 22 ? c.name.slice(0, 20) + ".." : c.name,
    value: c.daysUntilExpiry,
  }));

  checkPageBreak(contractChartData.length * 16 + 20);
  const barEnd = drawHBarChart(doc, 20, yPosition, pageWidth - 40, contractChartData, 9, 4);
  doc.setFontSize(7);
  doc.setTextColor(...mutedText);
  doc.text("Days until expiry", pageWidth / 2, barEnd + 2, { align: "center" });
  yPosition = barEnd + 10;

  autoTable(doc, {
    startY: yPosition,
    head: [["Contract", "Type", "Expiry Date", "Days Left", "Value"]],
    body: data.contracts.map((c) => [
      c.name,
      c.type,
      c.expiryDate,
      `${c.daysUntilExpiry} days`,
      c.value || "-",
    ]),
    theme: "grid",
    headStyles: { fillColor: [...forestGreen] as any, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
    didParseCell: (cellData) => {
      if (cellData.column.index === 3 && cellData.section === "body") {
        const days = parseInt(cellData.cell.raw as string);
        if (days <= 30) cellData.cell.styles.textColor = [220, 20, 60];
        else if (days <= 90) cellData.cell.styles.textColor = [200, 150, 0];
        else cellData.cell.styles.textColor = [34, 139, 34];
      }
    },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ── Estate & Life File with donut ──
  sectionTitle("Estate & Life File");

  const lifeFileComplete = data.lifeFileItems.filter((i) => i.status === "complete").length;
  const lifeFileIncomplete = data.lifeFileItems.filter((i) => i.status === "incomplete").length;
  const lifeFileNeedsUpdate = data.lifeFileItems.filter((i) => i.status === "needs-update").length;

  const lifeDonutData = [
    { label: "Complete", value: lifeFileComplete },
    { label: "Incomplete", value: lifeFileIncomplete },
    { label: "Needs Update", value: lifeFileNeedsUpdate },
  ].filter((d) => d.value > 0);

  checkPageBreak(80);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(
    `${lifeFileComplete} of ${data.lifeFileItems.length} documents complete  \u2022  ${data.beneficiariesCount} Beneficiaries  \u2022  ${data.emergencyContactsCount} Emergency Contacts`,
    24,
    yPosition
  );
  yPosition += 8;

  drawDonutChart(doc, 55, yPosition + 25, 20, 12, lifeDonutData, true);
  yPosition += 55;

  autoTable(doc, {
    startY: yPosition,
    head: [["Document", "Status", "Last Updated"]],
    body: data.lifeFileItems.map((item) => [
      item.name,
      item.status === "complete" ? "\u2713 Complete" : item.status === "needs-update" ? "\u26A0 Needs Update" : "\u2717 Incomplete",
      item.lastUpdated || "-",
    ]),
    theme: "grid",
    headStyles: { fillColor: [...forestGreen] as any, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
    didParseCell: (cellData) => {
      if (cellData.column.index === 1 && cellData.section === "body") {
        const val = cellData.cell.raw as string;
        if (val.includes("Complete")) cellData.cell.styles.textColor = [34, 139, 34];
        else if (val.includes("Needs")) cellData.cell.styles.textColor = [200, 150, 0];
        else cellData.cell.styles.textColor = [220, 20, 60];
      }
    },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // ── Overview Summary ──
  sectionTitle("Overview Summary");

  autoTable(doc, {
    startY: yPosition,
    body: [
      ["Active Advisors", `${data.advisors.count} \u2014 ${data.advisors.types}`],
      ["Documents Stored", `${data.documentsStored} (securely encrypted)`],
      ["Next Deadline", `${data.nextDeadline.date} \u2014 ${data.nextDeadline.description}`],
      ["Insurance Policies", `${data.insurancePolicies} active policies`],
      ...data.quickStats.map((s) => [s.label, `${s.value}`]),
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 60 } },
    margin: { left: 15, right: 15 },
  });

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFillColor(...forestGreen);
    doc.rect(0, pageHeight - 16, pageWidth, 16, "F");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 6, { align: "center" });
    doc.text("CONFIDENTIAL \u2014 LegacyBuilder Executive Report", 15, pageHeight - 6);
  }

  const fileName = `ExecutiveReport_${(data.userName || "Client").replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
};

/* ── Individual section exports ── */

export const generateAssetBreakdownPDF = (assets: AssetSummary[], userName = "Client") => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pH = doc.internal.pageSize.getHeight();

  // Header
  doc.setFillColor(...forestGreen);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setFillColor(...goldColor);
  doc.rect(0, 35, pageWidth, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Asset Breakdown Report", 20, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${userName}  \u2022  ${format(new Date(), "MMMM d, yyyy")}`, 20, 28);

  let y = 48;

  // Donut chart
  const chartData = assets.map((a) => ({
    label: a.title,
    value: parseFloat(a.value.replace(/[^\d.]/g, "")) || 0,
  }));
  drawDonutChart(doc, 60, y + 35, 30, 16, chartData, true);
  y += 80;

  // Table
  autoTable(doc, {
    startY: y,
    head: [["Asset Class", "Value", "Items", "Trend"]],
    body: assets.map((a) => [
      a.title,
      a.value,
      a.count !== undefined ? `${a.count}` : "-",
      a.trend ? `${a.trend.positive ? "\u25B2" : "\u25BC"} ${a.trend.value}%` : "-",
    ]),
    theme: "grid",
    headStyles: { fillColor: [...forestGreen] as any, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 6 },
    margin: { left: 15, right: 15 },
  });

  // Footer
  doc.setFillColor(...forestGreen);
  doc.rect(0, pH - 14, pageWidth, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("CONFIDENTIAL \u2014 LegacyBuilder", 15, pH - 5);
  doc.text(format(new Date(), "yyyy-MM-dd"), pageWidth - 15, pH - 5, { align: "right" });

  doc.save(`AssetBreakdown_${userName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateContractTimelinePDF = (contracts: Contract[], userName = "Client") => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pH = doc.internal.pageSize.getHeight();

  doc.setFillColor(...forestGreen);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setFillColor(...goldColor);
  doc.rect(0, 35, pageWidth, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Contract Expiry Timeline", 20, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${userName}  \u2022  ${format(new Date(), "MMMM d, yyyy")}`, 20, 28);

  let y = 48;

  const barData = contracts.map((c) => ({
    label: c.name.length > 20 ? c.name.slice(0, 18) + ".." : c.name,
    value: c.daysUntilExpiry,
  }));
  const barEnd = drawHBarChart(doc, 20, y, pageWidth - 40, barData, 12, 5);
  doc.setFontSize(7);
  doc.setTextColor(120, 120, 120);
  doc.text("Days until expiry", pageWidth / 2, barEnd + 3, { align: "center" });
  y = barEnd + 12;

  autoTable(doc, {
    startY: y,
    head: [["Contract", "Type", "Expiry", "Days Left", "Value"]],
    body: contracts.map((c) => [c.name, c.type, c.expiryDate, `${c.daysUntilExpiry}`, c.value || "-"]),
    theme: "grid",
    headStyles: { fillColor: [...forestGreen] as any, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 5 },
    margin: { left: 15, right: 15 },
    didParseCell: (cd) => {
      if (cd.column.index === 3 && cd.section === "body") {
        const d = parseInt(cd.cell.raw as string);
        if (d <= 30) cd.cell.styles.textColor = [220, 20, 60];
        else if (d <= 90) cd.cell.styles.textColor = [200, 150, 0];
        else cd.cell.styles.textColor = [34, 139, 34];
      }
    },
  });

  doc.setFillColor(...forestGreen);
  doc.rect(0, pH - 14, pageWidth, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("CONFIDENTIAL \u2014 LegacyBuilder", 15, pH - 5);
  doc.save(`ContractTimeline_${userName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateLifeFilePDF = (
  items: LifeFileItem[],
  beneficiaries: number,
  emergencyContacts: number,
  userName = "Client"
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pH = doc.internal.pageSize.getHeight();

  doc.setFillColor(...forestGreen);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setFillColor(...goldColor);
  doc.rect(0, 35, pageWidth, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Life File Summary", 20, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${userName}  \u2022  ${format(new Date(), "MMMM d, yyyy")}`, 20, 28);

  let y = 48;

  const complete = items.filter((i) => i.status === "complete").length;
  const incomplete = items.filter((i) => i.status === "incomplete").length;
  const needsUpdate = items.filter((i) => i.status === "needs-update").length;

  const donutData = [
    { label: "Complete", value: complete },
    { label: "Incomplete", value: incomplete },
    { label: "Needs Update", value: needsUpdate },
  ].filter((d) => d.value > 0);

  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text(`${complete}/${items.length} complete  \u2022  ${beneficiaries} Beneficiaries  \u2022  ${emergencyContacts} Emergency Contacts`, 20, y);
  y += 10;

  drawDonutChart(doc, 55, y + 30, 25, 14, donutData, true);
  y += 68;

  autoTable(doc, {
    startY: y,
    head: [["Document", "Status", "Last Updated"]],
    body: items.map((item) => [
      item.name,
      item.status === "complete" ? "\u2713 Complete" : item.status === "needs-update" ? "\u26A0 Needs Update" : "\u2717 Incomplete",
      item.lastUpdated || "-",
    ]),
    theme: "grid",
    headStyles: { fillColor: [...forestGreen] as any, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 10 },
    styles: { fontSize: 10, cellPadding: 5 },
    margin: { left: 15, right: 15 },
    didParseCell: (cd) => {
      if (cd.column.index === 1 && cd.section === "body") {
        const v = cd.cell.raw as string;
        if (v.includes("Complete")) cd.cell.styles.textColor = [34, 139, 34];
        else if (v.includes("Needs")) cd.cell.styles.textColor = [200, 150, 0];
        else cd.cell.styles.textColor = [220, 20, 60];
      }
    },
  });

  doc.setFillColor(...forestGreen);
  doc.rect(0, pH - 14, pageWidth, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("CONFIDENTIAL \u2014 LegacyBuilder", 15, pH - 5);
  doc.save(`LifeFile_${userName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateAdvisorSummaryPDF = (
  advisors: AdvisorInfo,
  documentsStored: number,
  insurancePolicies: number,
  nextDeadline: { date: string; description: string },
  quickStats: QuickStat[],
  userName = "Client"
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pH = doc.internal.pageSize.getHeight();

  doc.setFillColor(...forestGreen);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setFillColor(...goldColor);
  doc.rect(0, 35, pageWidth, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Advisor & Overview Summary", 20, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${userName}  \u2022  ${format(new Date(), "MMMM d, yyyy")}`, 20, 28);

  let y = 50;

  // Quick stats as bar chart
  const numericStats = quickStats
    .map((s) => ({
      label: s.label,
      value: typeof s.value === "number" ? s.value : parseFloat(String(s.value).replace(/[^\d.]/g, "")) || 0,
    }))
    .filter((s) => s.value > 0);

  if (numericStats.length > 0) {
    const barEnd = drawHBarChart(doc, 20, y, pageWidth - 40, numericStats, 12, 5);
    y = barEnd + 12;
  }

  autoTable(doc, {
    startY: y,
    body: [
      ["Active Advisors", `${advisors.count} \u2014 ${advisors.types}`],
      ["Documents Stored", `${documentsStored} (securely encrypted)`],
      ["Next Deadline", `${nextDeadline.date} \u2014 ${nextDeadline.description}`],
      ["Insurance Policies", `${insurancePolicies} active policies`],
      ...quickStats.map((s) => [s.label, `${s.value}`]),
    ],
    theme: "striped",
    headStyles: { fillColor: [...forestGreen] as any },
    styles: { fontSize: 10, cellPadding: 6 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 65 } },
    margin: { left: 15, right: 15 },
  });

  doc.setFillColor(...forestGreen);
  doc.rect(0, pH - 14, pageWidth, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text("CONFIDENTIAL \u2014 LegacyBuilder", 15, pH - 5);
  doc.save(`AdvisorSummary_${userName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
};
