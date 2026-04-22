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

export const generateExecutiveOverviewPDF = (
  dataset: ExecutiveDataset,
  filters: ExecutiveFilters,
) => {
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

  const kpis = getFilteredKPIs(dataset, filters);
  const clientTypeValues = getFilteredClientTypeValues(dataset, filters);
  const revenueStreams = getFilteredRevenueStreams(dataset, filters);
  const monthlyRevenue = getFilteredMonthlyRevenue(dataset, filters);
  const topClients = getFilteredTopClients(dataset, filters);
  const demographics = getFilteredDemographics(dataset, filters);
  const totalPortfolio = clientTypeValues.reduce((s, c) => s + c.value, 0);
  const totalRev = revenueStreams.reduce((s, r) => s + r.value, 0);

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

  // Header
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

  // KPI Banner
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
    { label: "Revenue Growth", val: `${kpis.revenueGrowth >= 0 ? "+" : ""}${kpis.revenueGrowth}%` },
    { label: "Retention", val: `${kpis.clientRetention}%` },
    { label: "Clients", val: `${kpis.totalClients}` },
    { label: "Concentration", val: `${kpis.concentrationRisk}%` },
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

  // Book Value
  if (clientTypeValues.length > 0) {
    sectionTitle("Book Value by Client Type");
    autoTable(doc, {
      startY: y,
      head: [["Client Type", "Value (ZAR)", "Clients", "% of Portfolio"]],
      body: clientTypeValues.map((c) => [
        c.name, fmt(c.value), `${c.count ?? 0}`,
        totalPortfolio > 0 ? `${((c.value / totalPortfolio) * 100).toFixed(1)}%` : "—",
      ]),
      foot: [["Total", fmt(totalPortfolio), `${clientTypeValues.reduce((s, c) => s + (c.count ?? 0), 0)}`, "100%"]],
      theme: "grid",
      headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
      footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { left: 15, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // Revenue Streams
  if (revenueStreams.length > 0) {
    checkPage(60);
    sectionTitle("Revenue by Stream");
    autoTable(doc, {
      startY: y,
      head: [["Revenue Stream", "Value (ZAR)", "% of Revenue"]],
      body: revenueStreams.map((r) => [
        r.name, fmt(r.value),
        totalRev > 0 ? `${((r.value / totalRev) * 100).toFixed(1)}%` : "—",
      ]),
      foot: [["Total", fmt(totalRev), "100%"]],
      theme: "grid",
      headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
      footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { left: 15, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // Monthly
  if (monthlyRevenue.length > 0) {
    checkPage(60);
    sectionTitle("Monthly Revenue");
    autoTable(doc, {
      startY: y,
      head: [["Month", "Revenue"]],
      body: monthlyRevenue.map((m) => [m.month, fmt(m.revenue)]),
      foot: [["Total", fmt(monthlyRevenue.reduce((s, m) => s + m.revenue, 0))]],
      theme: "grid",
      headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
      footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 15, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // Top Clients
  if (topClients.length > 0) {
    checkPage(60);
    sectionTitle("Top Clients by Revenue");
    autoTable(doc, {
      startY: y,
      head: [["#", "Client", "Type", "Sector", "Revenue"]],
      body: topClients.map((c, i) => [`${i + 1}`, c.name, c.type, c.industry || "—", fmt(c.revenue)]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 4 },
      margin: { left: 15, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // Demographics
  const demoRows: (string | number)[][] = [
    ...demographics.clientType.map((d) => ["Client Type", d.name, `${d.value}`]),
    ...demographics.industry.map((d) => ["Industry / Sector", d.name, `${d.value}`]),
    ...demographics.geography.map((d) => ["Geography", d.name, `${d.value}`]),
    ...demographics.gender.map((d) => ["Gender", d.name, `${d.value}`]),
    ...demographics.ageBand.map((d) => ["Age Band", d.name, `${d.value}`]),
  ];
  if (demographics.paraAthletes > 0) demoRows.push(["Accessibility", "Para-Athletes", `${demographics.paraAthletes}`]);
  if (demoRows.length > 0) {
    checkPage(60);
    sectionTitle("Client Demographics");
    autoTable(doc, {
      startY: y,
      head: [["Category", "Segment", "Count"]],
      body: demoRows,
      theme: "grid",
      headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
      styles: { fontSize: 9, cellPadding: 3 },
      margin: { left: 15, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 12;
  }

  // KPI Summary
  checkPage(60);
  sectionTitle("Executive KPI Summary");
  autoTable(doc, {
    startY: y,
    body: [
      ["Revenue Growth", `${kpis.revenueGrowth >= 0 ? "+" : ""}${kpis.revenueGrowth}%`],
      ["Average Revenue / Client", fmt(kpis.avgRevenuePerClient)],
      ["Client Retention Rate", `${kpis.clientRetention}%`],
      ["Total Active Clients", `${kpis.totalClients}`],
      ["New Clients (YTD)", `+${kpis.newClientsThisYear}`],
      ["Churned / Archived Clients", `${kpis.churnedClients}`],
      ["Concentration Risk (Top-3)", `${kpis.concentrationRisk}%`],
    ],
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 }, 1: { halign: "right" } },
    margin: { left: 15, right: 15 },
  });

  // Footer
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pages}`, pw / 2, ph - 10, { align: "center" });
    doc.text("CONFIDENTIAL — LegacyBuilder Executive Overview", 15, ph - 10);
  }

  saveAs(doc.output("blob"), `Executive_Overview_${format(new Date(), "yyyy-MM-dd")}.pdf`);
};
