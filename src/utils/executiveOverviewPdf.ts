import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import {
  kpis,
  clientTypeValues,
  revenueStreams,
  monthlyRevenue,
  topClients,
  demographics,
  overheadData,
} from "@/data/executiveMockData";

const fmt = (n: number) =>
  n >= 1_000_000 ? `R${(n / 1_000_000).toFixed(1)}M` : `R${(n / 1_000).toFixed(0)}K`;

const pct = (n: number) => `${n}%`;

export const generateExecutiveOverviewPDF = () => {
  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  let y = 0;

  const gold: [number, number, number] = [196, 155, 45];
  const dark: [number, number, number] = [30, 30, 30];
  const muted: [number, number, number] = [120, 120, 120];
  const white: [number, number, number] = [255, 255, 255];
  const lightBg: [number, number, number] = [250, 248, 240];

  const checkPage = (need: number) => {
    if (y + need > ph - 20) {
      doc.addPage();
      y = 20;
    }
  };

  const sectionTitle = (title: string) => {
    checkPage(28);
    doc.setFillColor(...gold);
    doc.rect(15, y, 4, 14, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(title, 24, y + 10);
    y += 20;
  };

  // ── Header ──────────────────────────────────
  doc.setFillColor(...gold);
  doc.rect(0, 0, pw, 45, "F");

  doc.setTextColor(...white);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Overview", 20, 22);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Board-Ready Performance Snapshot", 20, 32);
  doc.text(format(new Date(), "MMMM d, yyyy"), pw - 20, 32, { align: "right" });

  doc.setFontSize(9);
  doc.text("CONFIDENTIAL", 20, 40);
  doc.text("LegacyBuilder", pw - 20, 40, { align: "right" });

  y = 58;
  doc.setTextColor(...dark);

  // ── KPI Summary Banner ──────────────────────
  const totalPortfolio = clientTypeValues.reduce((s, c) => s + c.value, 0);

  doc.setFillColor(...lightBg);
  doc.roundedRect(15, y, pw - 30, 24, 3, 3, "F");
  doc.setDrawColor(...gold);
  doc.roundedRect(15, y, pw - 30, 24, 3, 3, "S");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...muted);
  doc.text("TOTAL PORTFOLIO", 22, y + 9);
  doc.setFontSize(16);
  doc.setTextColor(...dark);
  doc.text(fmt(totalPortfolio), 22, y + 19);

  // KPI chips across the top
  const kpiItems = [
    { label: "Revenue Growth", val: `+${kpis.revenueGrowth}%` },
    { label: "Retention", val: pct(kpis.clientRetention) },
    { label: "Clients", val: `${kpis.totalClients}` },
    { label: "Concentration", val: pct(kpis.concentrationRisk) },
  ];
  const chipStart = 95;
  const chipGap = (pw - 30 - chipStart + 15) / kpiItems.length;
  kpiItems.forEach((k, i) => {
    const cx = chipStart + i * chipGap;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    doc.text(k.label, cx, y + 9);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(k.val, cx, y + 19);
  });

  y += 34;

  // ── 1. Book Value by Client Type ────────────
  sectionTitle("Book Value by Client Type");

  autoTable(doc, {
    startY: y,
    head: [["Client Type", "Value (ZAR)", "Clients", "% of Portfolio"]],
    body: clientTypeValues.map((c) => [
      c.name,
      fmt(c.value),
      `${c.count}`,
      `${((c.value / totalPortfolio) * 100).toFixed(1)}%`,
    ]),
    foot: [["Total", fmt(totalPortfolio), `${clientTypeValues.reduce((s, c) => s + c.count, 0)}`, "100%"]],
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── 2. Revenue by Stream ────────────────────
  sectionTitle("Revenue by Stream");

  const totalRev = revenueStreams.reduce((s, r) => s + r.value, 0);
  autoTable(doc, {
    startY: y,
    head: [["Revenue Stream", "Value (ZAR)", "% of Revenue"]],
    body: revenueStreams.map((r) => [
      r.name,
      fmt(r.value),
      `${((r.value / totalRev) * 100).toFixed(1)}%`,
    ]),
    foot: [["Total", fmt(totalRev), "100%"]],
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── 3. Monthly Revenue vs Costs ─────────────
  sectionTitle("Monthly Revenue vs Costs");

  autoTable(doc, {
    startY: y,
    head: [["Month", "Revenue", "Costs", "Margin", "Margin %"]],
    body: monthlyRevenue.map((m) => {
      const margin = m.revenue - m.costs;
      return [
        m.month,
        fmt(m.revenue),
        fmt(m.costs),
        fmt(margin),
        `${((margin / m.revenue) * 100).toFixed(0)}%`,
      ];
    }),
    foot: (() => {
      const tRev = monthlyRevenue.reduce((s, m) => s + m.revenue, 0);
      const tCost = monthlyRevenue.reduce((s, m) => s + m.costs, 0);
      const tMargin = tRev - tCost;
      return [["Total", fmt(tRev), fmt(tCost), fmt(tMargin), `${((tMargin / tRev) * 100).toFixed(0)}%`]];
    })(),
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── 4. Top Clients ──────────────────────────
  sectionTitle("Top Clients by Revenue Contribution");

  autoTable(doc, {
    startY: y,
    head: [["#", "Client", "Type", "Sector", "Revenue"]],
    body: topClients.map((c, i) => [
      `${i + 1}`,
      c.name,
      c.type,
      c.sport || c.genre || c.industry || "-",
      fmt(c.revenue),
    ]),
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── 5. Client Demographics ──────────────────
  sectionTitle("Client Demographics");

  const demoRows = [
    ...demographics.clientType.map((d) => ["Client Type", d.name, `${d.value}`]),
    ...demographics.industry.map((d) => ["Industry / Sector", d.name, `${d.value}`]),
    ...demographics.geography.map((d) => ["Geography", d.name, `${d.value}`]),
    ...demographics.gender.map((d) => ["Gender", d.name, `${d.value}`]),
    ...demographics.ageBand.map((d) => ["Age Band", d.name, `${d.value}`]),
    ["Accessibility", "Para-Athletes", `${demographics.paraAthletes}`],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Category", "Segment", "Count"]],
    body: demoRows,
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 15, right: 15 },
    didParseCell: (data) => {
      // Group shading for alternating categories
      if (data.section === "body" && data.column.index === 0) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── 6. Overhead & Costs ─────────────────────
  sectionTitle("Overhead & Cost Overview");

  const totalOverhead = overheadData.fixed + overheadData.variable;
  const overheadPct = ((totalOverhead / overheadData.totalRevenue) * 100).toFixed(1);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dark);
  doc.text(
    `Total Overhead: ${fmt(totalOverhead)}  •  Fixed: ${fmt(overheadData.fixed)}  •  Variable: ${fmt(overheadData.variable)}  •  ${overheadPct}% of Revenue`,
    24,
    y
  );
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["Cost Category", "Value (ZAR)", "% of Overhead"]],
    body: overheadData.categories.map((c) => [
      c.name,
      fmt(c.value),
      `${((c.value / totalOverhead) * 100).toFixed(1)}%`,
    ]),
    foot: [["Total", fmt(totalOverhead), "100%"]],
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── 7. Executive KPI Summary ────────────────
  sectionTitle("Executive KPI Summary");

  autoTable(doc, {
    startY: y,
    body: [
      ["Revenue Growth (YoY)", `+${kpis.revenueGrowth}%`],
      ["Average Revenue / Client", fmt(kpis.avgRevenuePerClient)],
      ["Client Retention Rate", `${kpis.clientRetention}%`],
      ["Total Active Clients", `${kpis.totalClients}`],
      ["New Clients (YTD)", `+${kpis.newClientsThisYear}`],
      ["Churned Clients (YTD)", `${kpis.churnedClients}`],
      ["Concentration Risk (Top-3)", `${kpis.concentrationRisk}%`],
      ["Overhead as % of Revenue", `${overheadPct}%`],
    ],
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 80 },
      1: { halign: "right" },
    },
    margin: { left: 15, right: 15 },
  });

  // ── Footer on every page ────────────────────
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pages}`, pw / 2, ph - 10, { align: "center" });
    doc.text("CONFIDENTIAL — LegacyBuilder Executive Overview", 15, ph - 10);
  }

  const fileName = `Executive_Overview_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
};
