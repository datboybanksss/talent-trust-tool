import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { saveAs } from "file-saver";
import type { ExecutiveDataset } from "@/hooks/useExecutiveData";
import {
  ExecutiveFilters,
  getFilteredKPIs,
  getFilteredClientTypeValues,
  getFilteredRevenueStreams,
  getFilteredMonthlyRevenue,
  getFilteredTopClients,
  getFilteredDemographics,
} from "@/utils/executiveFilters";

const fmt = (n: number) =>
  n >= 1_000_000 ? `R${(n / 1_000_000).toFixed(1)}M` : `R${(n / 1_000).toFixed(0)}K`;

const pct = (n: number) => `${n}%`;

const CHART_PALETTE: [number, number, number][] = [
  [196, 155, 45], [34, 68, 34], [70, 130, 180], [178, 102, 60],
  [100, 149, 120], [139, 90, 140], [200, 120, 60], [80, 80, 80],
];

// ─── Chart helpers ────────────────────────────────────────────

function drawDonutChart(
  doc: jsPDF, cx: number, cy: number, outerR: number, innerR: number,
  data: { name: string; value: number }[], centerLabel?: string,
  opts?: { legendX?: number; legendY?: number }
) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return;
  let startAngle = -Math.PI / 2;
  const dark: [number, number, number] = [30, 30, 30];

  data.forEach((item, i) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const color = CHART_PALETTE[i % CHART_PALETTE.length];
    doc.setFillColor(...color);
    const steps = Math.max(20, Math.ceil(sliceAngle * 30));
    const outerPts: [number, number][] = [];
    const innerPts: [number, number][] = [];
    for (let s = 0; s <= steps; s++) {
      const angle = startAngle + (sliceAngle * s) / steps;
      outerPts.push([cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle)]);
      innerPts.push([cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle)]);
    }
    innerPts.reverse();
    const allPts = [...outerPts, ...innerPts];
    for (let s = 1; s < allPts.length - 1; s++) {
      doc.triangle(allPts[0][0], allPts[0][1], allPts[s][0], allPts[s][1], allPts[s + 1][0], allPts[s + 1][1], "F");
    }
    startAngle += sliceAngle;
  });

  if (centerLabel) {
    doc.setFillColor(255, 255, 255);
    doc.circle(cx, cy, innerR - 1, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(centerLabel, cx, cy, { align: "center", baseline: "middle" });
  }

  const lx = opts?.legendX ?? cx + outerR + 12;
  let ly = opts?.legendY ?? cy - outerR + 4;
  data.forEach((item, i) => {
    const color = CHART_PALETTE[i % CHART_PALETTE.length];
    doc.setFillColor(...color);
    doc.rect(lx, ly - 3, 6, 6, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);
    doc.text(`${item.name} – ${fmt(item.value)}`, lx + 9, ly + 1);
    ly += 10;
  });
}

function drawHorizontalBarChart(
  doc: jsPDF, x: number, y: number, width: number,
  data: { name: string; value: number }[],
  opts?: { barHeight?: number; gap?: number; maxVal?: number }
) {
  const barH = opts?.barHeight ?? 10;
  const gap = opts?.gap ?? 5;
  const maxVal = opts?.maxVal ?? Math.max(...data.map(d => d.value));
  const dark: [number, number, number] = [30, 30, 30];
  const white: [number, number, number] = [255, 255, 255];
  if (maxVal === 0) return y;

  data.forEach((item, i) => {
    const barWidth = (item.value / maxVal) * (width - 55);
    const by = y + i * (barH + gap);
    const color = CHART_PALETTE[i % CHART_PALETTE.length];
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);
    doc.text(item.name, x, by + barH / 2 + 1, { baseline: "middle" });
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(x + 52, by, width - 55, barH, 2, 2, "F");
    if (barWidth > 0) {
      doc.setFillColor(...color);
      doc.roundedRect(x + 52, by, Math.max(barWidth, 4), barH, 2, 2, "F");
    }
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    if (barWidth > 30) {
      doc.setTextColor(...white);
      doc.text(fmt(item.value), x + 52 + barWidth - 3, by + barH / 2 + 1, { align: "right", baseline: "middle" });
    } else {
      doc.setTextColor(...dark);
      doc.text(fmt(item.value), x + 52 + barWidth + 3, by + barH / 2 + 1, { baseline: "middle" });
    }
  });
  return y + data.length * (barH + gap);
}

// ─── Main export ──────────────────────────────────────────────

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
  const forestGreen: [number, number, number] = [34, 68, 34];

  const checkPage = (need: number) => {
    if (y + need > ph - 20) { doc.addPage(); y = 20; }
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
  doc.setFillColor(...forestGreen);
  doc.rect(0, 0, pw, 42, "F");
  doc.setFillColor(...gold);
  doc.rect(0, 42, pw, 4, "F");

  doc.setTextColor(...white);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Executive Overview", 20, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Board-Ready Performance Snapshot", 20, 30);
  doc.text(format(new Date(), "MMMM d, yyyy"), pw - 20, 30, { align: "right" });

  doc.setFontSize(9);
  doc.text("CONFIDENTIAL", 20, 38);
  doc.text("LegacyBuilder", pw - 20, 38, { align: "right" });

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

  // ── 1. Book Value – Donut + Table ───────────
  sectionTitle("Book Value by Client Type");

  const clientData = clientTypeValues.map(c => ({ name: c.name, value: c.value }));
  drawDonutChart(doc, 55, y + 28, 26, 13, clientData, fmt(totalPortfolio), { legendX: 92, legendY: y + 5 });
  y += 65;

  autoTable(doc, {
    startY: y,
    head: [["Client Type", "Value (ZAR)", "Clients", "% of Portfolio"]],
    body: clientTypeValues.map((c) => [c.name, fmt(c.value), `${c.count}`, `${((c.value / totalPortfolio) * 100).toFixed(1)}%`]),
    foot: [["Total", fmt(totalPortfolio), `${clientTypeValues.reduce((s, c) => s + c.count, 0)}`, "100%"]],
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── 2. Revenue – Bar Chart + Table ──────────
  checkPage(100);
  sectionTitle("Revenue by Stream");

  const totalRev = revenueStreams.reduce((s, r) => s + r.value, 0);
  const revData = revenueStreams.map(r => ({ name: r.name, value: r.value }));
  y = drawHorizontalBarChart(doc, 15, y, 180, revData);
  y += 10;

  autoTable(doc, {
    startY: y,
    head: [["Revenue Stream", "Value (ZAR)", "% of Revenue"]],
    body: revenueStreams.map((r) => [r.name, fmt(r.value), `${((r.value / totalRev) * 100).toFixed(1)}%`]),
    foot: [["Total", fmt(totalRev), "100%"]],
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── 3. Monthly Revenue vs Costs ─────────────
  checkPage(130);
  sectionTitle("Monthly Revenue vs Costs");

  // Vertical bar chart: Revenue (green) vs Costs (gold) per month
  {
    const chartX = 25;
    const chartW = pw - 50;
    const chartH = 70;
    const chartTop = y;
    const chartBottom = y + chartH;
    const maxVal = Math.max(...monthlyRevenue.map(m => m.revenue)) * 1.1;
    const barGroupW = chartW / monthlyRevenue.length;
    const barW = barGroupW * 0.35;

    // Y-axis grid lines & labels
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.3);
    for (let i = 0; i <= 4; i++) {
      const gy = chartBottom - (chartH * i) / 4;
      doc.line(chartX, gy, chartX + chartW, gy);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...muted);
      doc.text(fmt((maxVal * i) / 4), chartX - 2, gy + 1, { align: "right" });
    }

    monthlyRevenue.forEach((m, i) => {
      const gx = chartX + i * barGroupW + barGroupW * 0.1;
      const revH = (m.revenue / maxVal) * chartH;
      const costH = (m.costs / maxVal) * chartH;

      // Revenue bar (forest green)
      doc.setFillColor(...forestGreen);
      doc.rect(gx, chartBottom - revH, barW, revH, "F");

      // Cost bar (gold)
      doc.setFillColor(...gold);
      doc.rect(gx + barW + 1, chartBottom - costH, barW, costH, "F");

      // Month label
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...dark);
      doc.text(m.month, gx + barW, chartBottom + 6, { align: "center" });
    });

    // Legend
    const legY = chartBottom + 12;
    doc.setFillColor(...forestGreen);
    doc.rect(chartX, legY, 8, 5, "F");
    doc.setFontSize(8);
    doc.setTextColor(...dark);
    doc.text("Revenue", chartX + 11, legY + 4);

    doc.setFillColor(...gold);
    doc.rect(chartX + 45, legY, 8, 5, "F");
    doc.text("Costs", chartX + 56, legY + 4);

    y = legY + 14;
  }

  autoTable(doc, {
    startY: y,
    head: [["Month", "Revenue", "Costs", "Margin", "Margin %"]],
    body: monthlyRevenue.map((m) => {
      const margin = m.revenue - m.costs;
      return [m.month, fmt(m.revenue), fmt(m.costs), fmt(margin), `${((margin / m.revenue) * 100).toFixed(0)}%`];
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

  // ── 4. Top Clients – Bar Chart ──────────────
  checkPage(120);
  sectionTitle("Top Clients by Revenue Contribution");

  const topData = topClients.map(c => ({ name: c.name, value: c.revenue }));
  y = drawHorizontalBarChart(doc, 15, y, 180, topData);
  y += 8;

  autoTable(doc, {
    startY: y,
    head: [["#", "Client", "Type", "Sector", "Revenue"]],
    body: topClients.map((c, i) => [`${i + 1}`, c.name, c.type, c.sport || c.genre || c.industry || "-", fmt(c.revenue)]),
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── 5. Demographics – Donut Charts ──────────
  checkPage(80);
  sectionTitle("Client Demographics");

  // Gender donut
  const genderData = demographics.gender.map(d => ({ name: d.name, value: d.value }));
  drawDonutChart(doc, 45, y + 25, 22, 11, genderData, `${demographics.gender.reduce((s, d) => s + d.value, 0)}`, { legendX: 75, legendY: y + 8 });

  // Geography donut
  const geoData = demographics.geography.map(d => ({ name: d.name, value: d.value }));
  drawDonutChart(doc, 155, y + 25, 22, 11, geoData, undefined, { legendX: 115, legendY: y + 55 });
  y += 55;

  const demoRows = [
    ...demographics.clientType.map((d) => ["Client Type", d.name, `${d.value}`]),
    ...demographics.industry.map((d) => ["Industry / Sector", d.name, `${d.value}`]),
    ...demographics.geography.map((d) => ["Geography", d.name, `${d.value}`]),
    ...demographics.gender.map((d) => ["Gender", d.name, `${d.value}`]),
    ...demographics.ageBand.map((d) => ["Age Band", d.name, `${d.value}`]),
    ["Accessibility", "Para-Athletes", `${demographics.paraAthletes}`],
  ];

  checkPage(80);
  autoTable(doc, {
    startY: y,
    head: [["Category", "Segment", "Count"]],
    body: demoRows,
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 3 },
    margin: { left: 15, right: 15 },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        data.cell.styles.fontStyle = "bold";
      }
    },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── 6. Overhead – Donut + Table ─────────────
  checkPage(100);
  sectionTitle("Overhead & Cost Overview");

  const totalOverhead = overheadData.fixed + overheadData.variable;
  const overheadPct = ((totalOverhead / overheadData.totalRevenue) * 100).toFixed(1);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dark);
  doc.text(
    `Total Overhead: ${fmt(totalOverhead)}  •  Fixed: ${fmt(overheadData.fixed)}  •  Variable: ${fmt(overheadData.variable)}  •  ${overheadPct}% of Revenue`,
    24, y
  );
  y += 10;

  const ohData = overheadData.categories.map(c => ({ name: c.name, value: c.value }));
  drawDonutChart(doc, 55, y + 25, 24, 12, ohData, fmt(totalOverhead), { legendX: 90, legendY: y + 2 });
  y += 60;

  autoTable(doc, {
    startY: y,
    head: [["Cost Category", "Value (ZAR)", "% of Overhead"]],
    body: overheadData.categories.map((c) => [c.name, fmt(c.value), `${((c.value / totalOverhead) * 100).toFixed(1)}%`]),
    foot: [["Total", fmt(totalOverhead), "100%"]],
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── 7. Executive KPI Summary ────────────────
  checkPage(60);
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
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 }, 1: { halign: "right" } },
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
  saveAs(doc.output("blob"), fileName);
};
