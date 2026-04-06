import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Beneficiary, EmergencyContact, LifeFileDocument, DOCUMENT_TYPES } from "@/types/lifeFile";
import { LifeFileAsset, INSURANCE_TYPES, INVESTMENT_TYPES, PREMIUM_FREQUENCIES } from "@/types/lifeFileAsset";
import { format } from "date-fns";
import { saveAs } from "file-saver";

interface LifeFileExportData {
  beneficiaries: Beneficiary[];
  emergencyContacts: EmergencyContact[];
  documents: LifeFileDocument[];
  assets?: LifeFileAsset[];
  userName?: string;
}

const PRIMARY = [26, 46, 36] as const;
const WHITE = [255, 255, 255] as const;
const BLACK = [0, 0, 0] as const;
const GREY = [100, 100, 100] as const;
const LIGHT_BG = [245, 245, 245] as const;

const formatCurrency = (amount: number, currency = "ZAR") =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency }).format(amount);

const getTypeLabel = (category: string, type: string) => {
  const list = category === "insurance" ? INSURANCE_TYPES : INVESTMENT_TYPES;
  return list.find((t) => t.value === type)?.label || type;
};

const getFreqLabel = (freq: string | null) =>
  PREMIUM_FREQUENCIES.find((f) => f.value === freq)?.label || freq || "—";

/* ─── shortfall analysis ─── */
interface ShortfallItem {
  area: string;
  current: number;
  recommended: number;
  gap: number;
  products: string[];
}

function analyseShortfalls(assets: LifeFileAsset[]): ShortfallItem[] {
  const ins = assets.filter((a) => a.asset_category === "insurance" && a.status === "active");
  const inv = assets.filter((a) => a.asset_category === "investment" && a.status === "active");

  const lifeCover = ins.filter((a) => ["life", "credit_life"].includes(a.asset_type)).reduce((s, a) => s + (a.amount || 0), 0);
  const disabilityCover = ins.filter((a) => a.asset_type === "disability").reduce((s, a) => s + (a.amount || 0), 0);
  const keymanCover = ins.filter((a) => a.asset_type === "keyman").reduce((s, a) => s + (a.amount || 0), 0);
  const buySellCover = ins.filter((a) => a.asset_type === "buy_sell").reduce((s, a) => s + (a.amount || 0), 0);
  const funeralCover = ins.filter((a) => a.asset_type === "funeral").reduce((s, a) => s + (a.amount || 0), 0);
  const totalInvestments = inv.reduce((s, a) => s + (a.amount || 0), 0);
  const retirementInv = inv.filter((a) => ["retirement_annuity", "pension_fund", "provident_fund", "preservation_fund", "living_annuity"].includes(a.asset_type)).reduce((s, a) => s + (a.amount || 0), 0);

  // Illustrative benchmarks (South African context)
  const recLife = 5_000_000;
  const recDisability = 2_000_000;
  const recKeyman = 3_000_000;
  const recBuySell = 2_000_000;
  const recFuneral = 50_000;
  const recRetirement = 8_000_000;
  const recTotalInv = 3_000_000;

  const items: ShortfallItem[] = [];

  const add = (area: string, current: number, recommended: number, products: string[]) => {
    const gap = Math.max(0, recommended - current);
    items.push({ area, current, recommended, gap, products });
  };

  add("Life Cover", lifeCover, recLife, ["Term Life Insurance", "Whole Life Insurance", "Credit Life Insurance"]);
  add("Disability / Income Protection", disabilityCover, recDisability, ["Income Protection Policy", "Disability Lump-Sum Cover"]);
  add("Key-Man Cover", keymanCover, recKeyman, ["Key-Man Insurance Policy"]);
  add("Buy & Sell Cover", buySellCover, recBuySell, ["Buy & Sell Agreement Insurance"]);
  add("Funeral Cover", funeralCover, recFuneral, ["Funeral Cover Policy"]);
  add("Retirement Savings", retirementInv, recRetirement, ["Retirement Annuity (RA)", "Pension/Provident Fund", "Preservation Fund"]);
  add("Investment Portfolio", totalInvestments, recTotalInv, ["Tax-Free Savings Account", "Unit Trust", "Offshore Investment"]);

  return items;
}

/* ─── PDF generation ─── */
export const generateLifeFilePDF = ({
  beneficiaries,
  emergencyContacts,
  documents,
  assets = [],
  userName = "User",
}: LifeFileExportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  const sectionHeading = (title: string) => {
    checkPageBreak(40);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PRIMARY);
    doc.text(title, 15, yPosition);
    yPosition += 8;
  };

  // ── Header ──
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageWidth, 40, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Life File Summary", 20, 25);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Prepared for: ${userName}`, 20, 35);
  doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, pageWidth - 20, 35, { align: "right" });

  yPosition = 55;
  doc.setTextColor(...BLACK);

  // ── Summary Stats ──
  const insurances = assets.filter((a) => a.asset_category === "insurance");
  const investments = assets.filter((a) => a.asset_category === "investment");
  const totalInsurance = insurances.reduce((s, a) => s + (a.amount || 0), 0);
  const totalInvestment = investments.reduce((s, a) => s + (a.amount || 0), 0);

  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(15, yPosition, pageWidth - 30, 30, 3, 3, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const statsY = yPosition + 12;
  const cols = 5;
  const colW = (pageWidth - 30) / cols;

  const statsData = [
    { val: `${beneficiaries.length}`, label: "Beneficiaries" },
    { val: `${emergencyContacts.length}`, label: "Emergency Contacts" },
    { val: `${documents.filter((d) => d.status === "complete").length}/${documents.length}`, label: "Docs Complete" },
    { val: formatCurrency(totalInsurance), label: "Insurance Cover" },
    { val: formatCurrency(totalInvestment), label: "Investments" },
  ];

  statsData.forEach((s, i) => {
    const cx = 15 + colW * i + colW / 2;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BLACK);
    doc.text(s.val, cx, statsY, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GREY);
    doc.text(s.label, cx, statsY + 6, { align: "center" });
  });

  yPosition += 40;
  doc.setTextColor(...BLACK);

  // ── Beneficiaries ──
  if (beneficiaries.length > 0) {
    sectionHeading("Beneficiaries");
    const totalAlloc = beneficiaries.reduce((s, b) => s + (Number(b.allocation_percentage) || 0), 0);

    autoTable(doc, {
      startY: yPosition,
      head: [["Name", "Relationship", "Contact", "Allocation"]],
      body: beneficiaries.map((b) => [
        b.full_name,
        b.relationship,
        [b.email, b.phone].filter(Boolean).join("\n") || "-",
        b.allocation_percentage ? `${Number(b.allocation_percentage)}%` : "-",
      ]),
      theme: "striped",
      headStyles: { fillColor: [...PRIMARY], textColor: [...WHITE], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 35 }, 2: { cellWidth: 60 }, 3: { cellWidth: 25, halign: "center" } },
      margin: { left: 15, right: 15 },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 5;
    if (totalAlloc > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(...GREY);
      doc.text(`Total Allocation: ${totalAlloc}%${totalAlloc !== 100 ? " (Note: Should equal 100%)" : ""}`, 15, yPosition);
      yPosition += 10;
    }
    yPosition += 5;
  }

  // ── Emergency Contacts ──
  if (emergencyContacts.length > 0) {
    sectionHeading("Emergency Contacts");
    autoTable(doc, {
      startY: yPosition,
      head: [["Priority", "Name", "Relationship", "Phone", "Email"]],
      body: emergencyContacts.map((c) => [c.priority.toString(), c.full_name, c.relationship, c.phone, c.email || "-"]),
      theme: "striped",
      headStyles: { fillColor: [...PRIMARY], textColor: [...WHITE], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 20, halign: "center" }, 1: { cellWidth: 40 }, 2: { cellWidth: 35 }, 3: { cellWidth: 40 }, 4: { cellWidth: 50 } },
      margin: { left: 15, right: 15 },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ── Documents ──
  if (documents.length > 0) {
    sectionHeading("Estate Documents");
    autoTable(doc, {
      startY: yPosition,
      head: [["Document", "Type", "Status", "Expiry Date"]],
      body: documents.map((d) => {
        const docType = DOCUMENT_TYPES.find((t) => t.value === d.document_type);
        const statusLabel = d.status === "complete" ? "✓ Complete" : d.status === "needs-update" ? "⚠ Needs Update" : "✗ Incomplete";
        return [d.title, docType?.label || d.document_type, statusLabel, d.expiry_date ? format(new Date(d.expiry_date), "MMM d, yyyy") : "-"];
      }),
      theme: "striped",
      headStyles: { fillColor: [...PRIMARY], textColor: [...WHITE], fontStyle: "bold" },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 55 }, 1: { cellWidth: 50 }, 2: { cellWidth: 35 }, 3: { cellWidth: 35 } },
      margin: { left: 15, right: 15 },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === "body") {
          const status = data.cell.raw as string;
          if (status.includes("Complete")) data.cell.styles.textColor = [34, 139, 34];
          else if (status.includes("Needs Update")) data.cell.styles.textColor = [255, 165, 0];
          else data.cell.styles.textColor = [220, 20, 60];
        }
      },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // ── Asset Registry: Insurance ──
  if (insurances.length > 0) {
    sectionHeading("Asset Registry — Insurance Policies");
    autoTable(doc, {
      startY: yPosition,
      head: [["Type", "Institution", "Policy No.", "Cover Amount", "Premium", "Status", "Beneficiaries"]],
      body: insurances.map((a) => [
        getTypeLabel("insurance", a.asset_type),
        a.institution,
        a.policy_or_account_number || "-",
        formatCurrency(a.amount || 0, a.currency),
        a.premium_or_contribution ? `${formatCurrency(a.premium_or_contribution, a.currency)} / ${getFreqLabel(a.premium_frequency)}` : "-",
        a.status,
        a.beneficiary_names || "-",
      ]),
      theme: "striped",
      headStyles: { fillColor: [...PRIMARY], textColor: [...WHITE], fontStyle: "bold", fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 15, right: 15 },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PRIMARY);
    doc.text(`Total Insurance Cover: ${formatCurrency(totalInsurance)}`, 15, yPosition);
    yPosition += 15;
  }

  // ── Asset Registry: Investments ──
  if (investments.length > 0) {
    sectionHeading("Asset Registry — Investments");
    autoTable(doc, {
      startY: yPosition,
      head: [["Type", "Institution", "Account No.", "Value", "Contribution", "Status", "Beneficiaries"]],
      body: investments.map((a) => [
        getTypeLabel("investment", a.asset_type),
        a.institution,
        a.policy_or_account_number || "-",
        formatCurrency(a.amount || 0, a.currency),
        a.premium_or_contribution ? `${formatCurrency(a.premium_or_contribution, a.currency)} / ${getFreqLabel(a.premium_frequency)}` : "-",
        a.status,
        a.beneficiary_names || "-",
      ]),
      theme: "striped",
      headStyles: { fillColor: [...PRIMARY], textColor: [...WHITE], fontStyle: "bold", fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 15, right: 15 },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 5;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PRIMARY);
    doc.text(`Total Investment Value: ${formatCurrency(totalInvestment)}`, 15, yPosition);
    yPosition += 15;
  }

  // ── Shortfall Analysis ──
  if (assets.length > 0) {
    const shortfalls = analyseShortfalls(assets);
    const gaps = shortfalls.filter((s) => s.gap > 0);

    sectionHeading("Financial Shortfall Analysis");

    autoTable(doc, {
      startY: yPosition,
      head: [["Area", "Current Cover", "Recommended", "Shortfall", "Status"]],
      body: shortfalls.map((s) => [
        s.area,
        formatCurrency(s.current),
        formatCurrency(s.recommended),
        s.gap > 0 ? formatCurrency(s.gap) : "—",
        s.gap > 0 ? "⚠ Shortfall" : "✓ Adequate",
      ]),
      theme: "striped",
      headStyles: { fillColor: [...PRIMARY], textColor: [...WHITE], fontStyle: "bold", fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 15, right: 15 },
      didParseCell: (data) => {
        if (data.column.index === 4 && data.section === "body") {
          const val = data.cell.raw as string;
          if (val.includes("Shortfall")) data.cell.styles.textColor = [220, 20, 60];
          else data.cell.styles.textColor = [34, 139, 34];
        }
        if (data.column.index === 3 && data.section === "body") {
          const val = data.cell.raw as string;
          if (val !== "—") data.cell.styles.textColor = [220, 20, 60];
        }
      },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // ── Recommended Products ──
    if (gaps.length > 0) {
      sectionHeading("Recommended Financial Products");

      autoTable(doc, {
        startY: yPosition,
        head: [["Shortfall Area", "Estimated Gap", "Products to Consider"]],
        body: gaps.map((g) => [g.area, formatCurrency(g.gap), g.products.join(", ")]),
        theme: "striped",
        headStyles: { fillColor: [...PRIMARY], textColor: [...WHITE], fontStyle: "bold", fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 4 },
        columnStyles: { 2: { cellWidth: 80 } },
        margin: { left: 15, right: 15 },
      });
      yPosition = (doc as any).lastAutoTable.finalY + 10;

      // CFP call to action
      checkPageBreak(30);
      doc.setFillColor(255, 248, 230);
      doc.roundedRect(15, yPosition, pageWidth - 30, 22, 3, 3, "F");
      doc.setDrawColor(200, 160, 50);
      doc.roundedRect(15, yPosition, pageWidth - 30, 22, 3, 3, "S");
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(150, 100, 0);
      doc.text("⚠ Important Disclaimer", 20, yPosition + 8);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(
        "The above shortfall figures are illustrative benchmarks only. Contact a Certified Financial Planner (CFP®) for a personalised needs analysis.",
        20,
        yPosition + 15,
      );
      yPosition += 30;
    }
  }

  // ── Footer ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });
    doc.text("CONFIDENTIAL - LegacyBuilder Life File", 15, doc.internal.pageSize.getHeight() - 10);
  }

  const fileName = `LifeFile_${userName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  saveAs(doc.output("blob"), fileName);
};
