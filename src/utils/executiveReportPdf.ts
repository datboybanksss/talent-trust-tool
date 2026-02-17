import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

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
  complianceScore: number;
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

export const generateExecutiveReportPDF = (data: ExecutiveReportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  const goldColor: [number, number, number] = [196, 155, 45];
  const darkText: [number, number, number] = [30, 30, 30];
  const mutedText: [number, number, number] = [120, 120, 120];

  // Header with gold accent
  doc.setFillColor(...goldColor);
  doc.rect(0, 0, pageWidth, 45, "F");

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
  doc.text("LegacyBuilder • For Elite Performers", pageWidth - 20, 40, { align: "right" });

  yPosition = 58;
  doc.setTextColor(...darkText);

  // Portfolio Summary Banner
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

  // Summary stats on the right
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const rightX = pageWidth - 25;
  doc.setTextColor(...mutedText);
  doc.text(`${data.quarterlyChange} from last quarter`, rightX, yPosition + 10, { align: "right" });
  doc.text(`${data.companiesCount} Companies  •  ${data.contractsCount} Contracts  •  ${data.complianceScore}% Compliance`, rightX, yPosition + 18, { align: "right" });

  yPosition += 42;

  // Section: Asset Breakdown
  const sectionTitle = (title: string) => {
    checkPageBreak(30);
    doc.setFillColor(...goldColor);
    doc.rect(15, yPosition, 4, 14, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...darkText);
    doc.text(title, 24, yPosition + 10);
    yPosition += 20;
  };

  sectionTitle("Asset Breakdown");

  autoTable(doc, {
    startY: yPosition,
    head: [["Asset Class", "Value", "Items", "Trend"]],
    body: data.assets.map((a) => [
      a.title,
      a.value,
      a.count !== undefined ? `${a.count}` : "-",
      a.trend ? `${a.trend.positive ? "▲" : "▼"} ${a.trend.value}%` : "-",
    ]),
    theme: "grid",
    headStyles: { fillColor: goldColor, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 5 },
    margin: { left: 15, right: 15 },
    didParseCell: (cellData) => {
      if (cellData.column.index === 3 && cellData.section === "body") {
        const val = cellData.cell.raw as string;
        if (val.includes("▲")) cellData.cell.styles.textColor = [34, 139, 34];
        else if (val.includes("▼")) cellData.cell.styles.textColor = [220, 20, 60];
      }
    },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Section: Compliance Health
  sectionTitle("Compliance Health");

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(`Overall Score: ${data.complianceScore}%  •  ${data.complianceItems.filter(i => i.status === "compliant").length} of ${data.complianceItems.length} compliant`, 24, yPosition);
  yPosition += 8;

  autoTable(doc, {
    startY: yPosition,
    head: [["Requirement", "Status", "Due Date"]],
    body: data.complianceItems.map((item) => [
      item.name,
      item.status === "compliant" ? "✓ Compliant" : item.status === "warning" ? "⚠ Warning" : "✗ Critical",
      item.dueDate || "-",
    ]),
    theme: "grid",
    headStyles: { fillColor: goldColor, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
    didParseCell: (cellData) => {
      if (cellData.column.index === 1 && cellData.section === "body") {
        const val = cellData.cell.raw as string;
        if (val.includes("Compliant")) cellData.cell.styles.textColor = [34, 139, 34];
        else if (val.includes("Warning")) cellData.cell.styles.textColor = [200, 150, 0];
        else cellData.cell.styles.textColor = [220, 20, 60];
      }
    },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Section: Contract Expiry Timeline
  sectionTitle("Contract Expiry Timeline");

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
    headStyles: { fillColor: goldColor, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
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

  // Section: Estate & Life File
  sectionTitle("Estate & Life File");

  const lifeFileComplete = data.lifeFileItems.filter(i => i.status === "complete").length;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...darkText);
  doc.text(`${lifeFileComplete} of ${data.lifeFileItems.length} documents complete  •  ${data.beneficiariesCount} Beneficiaries  •  ${data.emergencyContactsCount} Emergency Contacts`, 24, yPosition);
  yPosition += 8;

  autoTable(doc, {
    startY: yPosition,
    head: [["Document", "Status", "Last Updated"]],
    body: data.lifeFileItems.map((item) => [
      item.name,
      item.status === "complete" ? "✓ Complete" : item.status === "needs-update" ? "⚠ Needs Update" : "✗ Incomplete",
      item.lastUpdated || "-",
    ]),
    theme: "grid",
    headStyles: { fillColor: goldColor, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
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

  // Section: Overview Summary
  sectionTitle("Overview Summary");

  autoTable(doc, {
    startY: yPosition,
    body: [
      ["Active Advisors", `${data.advisors.count} — ${data.advisors.types}`],
      ["Documents Stored", `${data.documentsStored} (securely encrypted)`],
      ["Next Deadline", `${data.nextDeadline.date} — ${data.nextDeadline.description}`],
      ["Insurance Policies", `${data.insurancePolicies} active policies`],
      ...data.quickStats.map((s) => [s.label, `${s.value}`]),
    ],
    theme: "plain",
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
    },
    margin: { left: 15, right: 15 },
  });

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    doc.text("CONFIDENTIAL — LegacyBuilder Executive Report", 15, doc.internal.pageSize.getHeight() - 10);
  }

  const fileName = `ExecutiveReport_${(data.userName || "Client").replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
};
