import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

const fmt = (n: number) =>
  n >= 1_000_000 ? `R${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `R${(n / 1_000).toFixed(0)}K` : `R${n.toFixed(0)}`;

const fmtFull = (n: number) =>
  new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(n);

const gold: [number, number, number] = [196, 155, 45];
const dark: [number, number, number] = [30, 30, 30];
const muted: [number, number, number] = [120, 120, 120];
const white: [number, number, number] = [255, 255, 255];
const lightBg: [number, number, number] = [250, 248, 240];
const forestGreen: [number, number, number] = [34, 68, 34];

const CHART_PALETTE: [number, number, number][] = [
  [196, 155, 45],  // gold
  [34, 68, 34],    // forest green
  [70, 130, 180],  // steel blue
  [178, 102, 60],  // copper
  [100, 149, 120], // sage
  [139, 90, 140],  // muted purple
  [200, 120, 60],  // amber
  [80, 80, 80],    // charcoal
];

// ─── Chart Drawing Helpers ────────────────────────────────────

function drawPieChart(
  doc: jsPDF,
  cx: number, cy: number, radius: number,
  data: { name: string; value: number }[],
  opts?: { showLabels?: boolean; legendX?: number; legendY?: number }
) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return;

  let startAngle = -Math.PI / 2;

  data.forEach((item, i) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const color = CHART_PALETTE[i % CHART_PALETTE.length];

    // Draw filled arc using small triangle segments
    doc.setFillColor(...color);
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.5);

    const steps = Math.max(20, Math.ceil(sliceAngle * 30));
    const points: [number, number][] = [[cx, cy]];
    for (let s = 0; s <= steps; s++) {
      const angle = startAngle + (sliceAngle * s) / steps;
      points.push([cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)]);
    }

    // Draw as filled polygon using triangle fan
    for (let s = 1; s < points.length - 1; s++) {
      doc.triangle(
        points[0][0], points[0][1],
        points[s][0], points[s][1],
        points[s + 1][0], points[s + 1][1],
        "F"
      );
    }

    // Percentage label on slice
    if (opts?.showLabels !== false && sliceAngle > 0.25) {
      const midAngle = startAngle + sliceAngle / 2;
      const labelR = radius * 0.65;
      const lx = cx + labelR * Math.cos(midAngle);
      const ly = cy + labelR * Math.sin(midAngle);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      const pctText = `${((item.value / total) * 100).toFixed(0)}%`;
      doc.text(pctText, lx, ly, { align: "center", baseline: "middle" });
    }

    startAngle += sliceAngle;
  });

  // Draw legend
  const lx = opts?.legendX ?? cx + radius + 12;
  let ly = opts?.legendY ?? cy - radius + 4;
  data.forEach((item, i) => {
    const color = CHART_PALETTE[i % CHART_PALETTE.length];
    doc.setFillColor(...color);
    doc.rect(lx, ly - 3, 6, 6, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);
    const pct = `${((item.value / total) * 100).toFixed(1)}%`;
    doc.text(`${item.name} (${pct})`, lx + 9, ly + 1);
    ly += 10;
  });
}

function drawHorizontalBarChart(
  doc: jsPDF,
  x: number, y: number, width: number,
  data: { name: string; value: number }[],
  opts?: { barHeight?: number; gap?: number; showValues?: boolean; maxVal?: number }
) {
  const barH = opts?.barHeight ?? 10;
  const gap = opts?.gap ?? 5;
  const maxVal = opts?.maxVal ?? Math.max(...data.map(d => d.value));
  if (maxVal === 0) return y;

  data.forEach((item, i) => {
    const barWidth = (item.value / maxVal) * (width - 55);
    const by = y + i * (barH + gap);
    const color = CHART_PALETTE[i % CHART_PALETTE.length];

    // Label
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);
    doc.text(item.name, x, by + barH / 2 + 1, { baseline: "middle" });

    // Bar background
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(x + 52, by, width - 55, barH, 2, 2, "F");

    // Bar fill
    if (barWidth > 0) {
      doc.setFillColor(...color);
      doc.roundedRect(x + 52, by, Math.max(barWidth, 4), barH, 2, 2, "F");
    }

    // Value text
    if (opts?.showValues !== false) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...white);
      if (barWidth > 30) {
        doc.text(fmt(item.value), x + 52 + barWidth - 3, by + barH / 2 + 1, { align: "right", baseline: "middle" });
      } else {
        doc.setTextColor(...dark);
        doc.text(fmt(item.value), x + 52 + barWidth + 3, by + barH / 2 + 1, { baseline: "middle" });
      }
    }
  });

  return y + data.length * (barH + gap);
}

function drawStackedBar(
  doc: jsPDF,
  x: number, y: number, width: number, height: number,
  segments: { name: string; value: number }[]
) {
  const total = segments.reduce((s, d) => s + d.value, 0);
  if (total === 0) return;

  let currentX = x;
  segments.forEach((seg, i) => {
    const segWidth = (seg.value / total) * width;
    const color = CHART_PALETTE[i % CHART_PALETTE.length];
    doc.setFillColor(...color);
    doc.rect(currentX, y, segWidth, height, "F");

    if (segWidth > 20) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(`${((seg.value / total) * 100).toFixed(0)}%`, currentX + segWidth / 2, y + height / 2 + 1, { align: "center", baseline: "middle" });
    }
    currentX += segWidth;
  });

  // Legend below
  let lx = x;
  const ly = y + height + 6;
  segments.forEach((seg, i) => {
    const color = CHART_PALETTE[i % CHART_PALETTE.length];
    doc.setFillColor(...color);
    doc.rect(lx, ly, 5, 5, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...dark);
    doc.text(seg.name, lx + 7, ly + 4);
    lx += doc.getTextWidth(seg.name) + 14;
  });
}

function drawDonutChart(
  doc: jsPDF,
  cx: number, cy: number, outerR: number, innerR: number,
  data: { name: string; value: number }[],
  centerLabel?: string,
  opts?: { legendX?: number; legendY?: number }
) {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return;

  let startAngle = -Math.PI / 2;

  data.forEach((item, i) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const color = CHART_PALETTE[i % CHART_PALETTE.length];
    doc.setFillColor(...color);

    // Draw ring segment as polygon
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

    // Fill using triangle fan from first point
    for (let s = 1; s < allPts.length - 1; s++) {
      doc.triangle(
        allPts[0][0], allPts[0][1],
        allPts[s][0], allPts[s][1],
        allPts[s + 1][0], allPts[s + 1][1],
        "F"
      );
    }

    startAngle += sliceAngle;
  });

  // Center label
  if (centerLabel) {
    doc.setFillColor(255, 255, 255);
    doc.circle(cx, cy, innerR - 1, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(centerLabel, cx, cy, { align: "center", baseline: "middle" });
  }

  // Legend
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

// ─── Shared Helpers ───────────────────────────────────────────

function pdfHeader(doc: jsPDF, title: string, subtitle: string) {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(...forestGreen);
  doc.rect(0, 0, pw, 40, "F");
  doc.setFillColor(...gold);
  doc.rect(0, 40, pw, 4, "F");
  doc.setTextColor(...white);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, 20, 30);
  doc.text(format(new Date(), "MMMM d, yyyy"), pw - 20, 30, { align: "right" });
  doc.setFontSize(8);
  doc.text("LegacyBuilder", pw - 20, 37, { align: "right" });
}

function pdfFooter(doc: jsPDF, label: string) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pages}`, pw / 2, ph - 10, { align: "center" });
    doc.text(`CONFIDENTIAL — LegacyBuilder ${label}`, 15, ph - 10);
  }
}

function sectionTitle(doc: jsPDF, title: string, y: number): number {
  const ph = doc.internal.pageSize.getHeight();
  if (y + 28 > ph - 20) { doc.addPage(); y = 20; }
  doc.setFillColor(...gold);
  doc.rect(15, y, 4, 14, "F");
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);
  doc.text(title, 24, y + 10);
  return y + 20;
}

function checkPage(doc: jsPDF, y: number, need: number): number {
  const ph = doc.internal.pageSize.getHeight();
  if (y + need > ph - 20) { doc.addPage(); return 20; }
  return y;
}

// ─── Mock data ────────────────────────────────────────────────
const mockContracts = [
  { title: "Vodacom Team Contract", type: "Team Contract", counterparty: "Vodacom FC", start: "2025-01-15", end: "2027-01-14", value: 4500000, status: "Active" },
  { title: "Nike Endorsement", type: "Endorsement", counterparty: "Nike SA", start: "2025-03-01", end: "2026-02-28", value: 1200000, status: "Active" },
  { title: "DSTV Appearance", type: "Appearance Fee", counterparty: "MultiChoice", start: "2025-06-10", end: "2025-06-10", value: 150000, status: "Completed" },
  { title: "Adidas Licensing", type: "Licensing Deal", counterparty: "Adidas", start: "2024-07-01", end: "2025-06-30", value: 800000, status: "Active" },
  { title: "Octagon Agency Agreement", type: "Agency Agreement", counterparty: "Octagon SA", start: "2024-01-01", end: "2026-12-31", value: 0, status: "Active" },
  { title: "FNB Brand Partnership", type: "Endorsement", counterparty: "FNB", start: "2025-04-01", end: "2025-12-31", value: 650000, status: "Pending" },
];

const mockEndorsements = [
  { brand: "Nike South Africa", type: "Brand Ambassador", value: 1200000, start: "2025-03-01", end: "2026-02-28", status: "Active", deliverables: "4 social posts/month, 2 events" },
  { brand: "Castle Lager", type: "Sponsorship", value: 850000, start: "2025-01-15", end: "2025-12-31", status: "Active", deliverables: "TV ad, digital campaign" },
  { brand: "BMW South Africa", type: "Product Endorsement", value: 500000, start: "2025-06-01", end: "2026-05-31", status: "Negotiating", deliverables: "Social media, launch event" },
  { brand: "Woolworths", type: "Paid Appearance", value: 180000, start: "2025-02-14", end: "2025-02-14", status: "Completed", deliverables: "Store launch appearance" },
  { brand: "Puma", type: "Social Media Campaign", value: 320000, start: "2025-05-01", end: "2025-08-31", status: "Active", deliverables: "8 Instagram reels" },
];

const mockRoyalties = [
  { source: "Spotify", type: "Streaming", amount: 145000, period: "Q1 2025", status: "Received" },
  { source: "SAMRO", type: "SAMRO", amount: 89000, period: "Q4 2024", status: "Received" },
  { source: "Universal Music Publishing", type: "Publishing", amount: 210000, period: "H2 2024", status: "Received" },
  { source: "Netflix SA", type: "Sync Licensing", amount: 75000, period: "Jan 2025", status: "Pending" },
  { source: "Apple Music", type: "Streaming", amount: 112000, period: "Q1 2025", status: "Received" },
  { source: "TikTok", type: "Streaming", amount: 48000, period: "Q1 2025", status: "Processing" },
  { source: "Gallo Record Company", type: "Mechanical", amount: 34000, period: "2024", status: "Received" },
  { source: "MTN Pulse", type: "Performance", amount: 62000, period: "Feb 2025", status: "Received" },
];

const mockBudget = {
  income: 95000,
  categories: [
    { name: "Housing & Bond", budgeted: 18000, spent: 18000, type: "Essential" },
    { name: "Vehicle & Transport", budgeted: 6500, spent: 5890, type: "Essential" },
    { name: "Groceries & Food", budgeted: 6000, spent: 5420, type: "Essential" },
    { name: "Electricity & Water", budgeted: 3500, spent: 3180, type: "Essential" },
    { name: "Internet & Mobile", budgeted: 1800, spent: 1800, type: "Essential" },
    { name: "Medical Aid", budgeted: 4200, spent: 4200, type: "Essential" },
    { name: "Insurance", budgeted: 2800, spent: 2800, type: "Essential" },
    { name: "Fuel", budgeted: 3000, spent: 2750, type: "Essential" },
    { name: "Dining Out", budgeted: 2500, spent: 3100, type: "Lifestyle" },
    { name: "Clothing", budgeted: 2000, spent: 1450, type: "Lifestyle" },
    { name: "Education", budgeted: 1500, spent: 1500, type: "Lifestyle" },
    { name: "Emergency Fund", budgeted: 5000, spent: 5000, type: "Savings" },
    { name: "Retirement Annuity", budgeted: 8000, spent: 8000, type: "Savings" },
    { name: "Tax-Free Savings", budgeted: 3000, spent: 3000, type: "Savings" },
    { name: "Holiday Fund", budgeted: 2000, spent: 2000, type: "Savings" },
    { name: "Children's Education", budgeted: 3500, spent: 3500, type: "Savings" },
  ],
};

const mockCompliance = [
  { title: "Annual Return Submission", category: "CIPC", due: "Feb 15, 2026", status: "Overdue", priority: "High" },
  { title: "Provisional Tax Payment", category: "SARS", due: "Feb 28, 2026", status: "Due Soon", priority: "High" },
  { title: "VAT Return", category: "SARS", due: "Feb 25, 2026", status: "Due Soon", priority: "Medium" },
  { title: "Beneficial Ownership Declaration", category: "CIPC", due: "Mar 1, 2026", status: "Due Soon", priority: "Medium" },
  { title: "PAYE Monthly Return", category: "SARS", due: "Mar 7, 2026", status: "Upcoming", priority: "Medium" },
  { title: "Company Name Reservation", category: "CIPC", due: "Jan 10, 2026", status: "Completed", priority: "Low" },
  { title: "UIF Declaration", category: "DOL", due: "Mar 15, 2026", status: "Upcoming", priority: "Medium" },
  { title: "BBBEE Certificate Renewal", category: "DTI", due: "Apr 30, 2026", status: "Upcoming", priority: "Low" },
];

// ═══════════════════════════════════════════════════════════════
// EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const generateContractsPDF = () => {
  const doc = new jsPDF();
  pdfHeader(doc, "Contract Portfolio Report", "Active contracts and agreements overview");
  let y = 54;

  const totalValue = mockContracts.reduce((s, c) => s + c.value, 0);
  const active = mockContracts.filter(c => c.status === "Active").length;

  // ── Summary KPIs ──
  y = sectionTitle(doc, "Portfolio Summary", y);
  autoTable(doc, {
    startY: y,
    body: [
      ["Total Contracts", `${mockContracts.length}`],
      ["Active Contracts", `${active}`],
      ["Total Portfolio Value", fmtFull(totalValue)],
      ["Average Contract Value", fmtFull(totalValue / mockContracts.length)],
    ],
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 }, 1: { halign: "right" } },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  // ── Pie Chart: Value by Contract Type ──
  y = checkPage(doc, y, 85);
  y = sectionTitle(doc, "Value by Contract Type", y);
  const byType = mockContracts.reduce((acc, c) => { acc[c.type] = (acc[c.type] || 0) + c.value; return acc; }, {} as Record<string, number>);
  const typeData = Object.entries(byType).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  drawDonutChart(doc, 60, y + 30, 28, 14, typeData, fmt(totalValue), { legendX: 100, legendY: y + 8 });
  y += 72;

  // ── Status Stacked Bar ──
  y = checkPage(doc, y, 40);
  y = sectionTitle(doc, "Contract Status Distribution", y);
  const statusCounts = mockContracts.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  drawStackedBar(doc, 15, y, 180, 14, Object.entries(statusCounts).map(([name, value]) => ({ name, value })));
  y += 34;

  // ── Contract Details Table ──
  y = checkPage(doc, y, 50);
  y = sectionTitle(doc, "Contract Details", y);
  autoTable(doc, {
    startY: y,
    head: [["Contract", "Type", "Counterparty", "Start", "End", "Value", "Status"]],
    body: mockContracts.map(c => [c.title, c.type, c.counterparty, c.start, c.end, c.value ? fmtFull(c.value) : "N/A", c.status]),
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // ── Bar Chart: Value by Type ──
  y = checkPage(doc, y, 80);
  y = sectionTitle(doc, "Portfolio Value Breakdown", y);
  drawHorizontalBarChart(doc, 15, y, 180, typeData);

  pdfFooter(doc, "Contract Portfolio");
  doc.save(`Contract_Portfolio_${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateEndorsementsPDF = () => {
  const doc = new jsPDF();
  pdfHeader(doc, "Endorsement Portfolio Report", "Brand partnerships and sponsorship overview");
  let y = 54;

  const totalValue = mockEndorsements.reduce((s, e) => s + e.value, 0);
  const active = mockEndorsements.filter(e => e.status === "Active").length;

  // ── Summary ──
  y = sectionTitle(doc, "Portfolio Summary", y);
  autoTable(doc, {
    startY: y,
    body: [
      ["Total Endorsements", `${mockEndorsements.length}`],
      ["Active Deals", `${active}`],
      ["Total Annual Value", fmtFull(totalValue)],
      ["Average Deal Value", fmtFull(totalValue / mockEndorsements.length)],
    ],
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 }, 1: { halign: "right" } },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  // ── Donut: Value by Deal Type ──
  y = checkPage(doc, y, 85);
  y = sectionTitle(doc, "Value by Deal Type", y);
  const byType = mockEndorsements.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + e.value; return acc; }, {} as Record<string, number>);
  const typeData = Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  drawDonutChart(doc, 60, y + 30, 28, 14, typeData, fmt(totalValue), { legendX: 100, legendY: y + 8 });
  y += 72;

  // ── Bar Chart: Brand Values ──
  y = checkPage(doc, y, 90);
  y = sectionTitle(doc, "Value by Brand", y);
  const brandData = mockEndorsements.map(e => ({ name: e.brand.substring(0, 18), value: e.value })).sort((a, b) => b.value - a.value);
  y = drawHorizontalBarChart(doc, 15, y, 180, brandData);
  y += 10;

  // ── Status Distribution ──
  y = checkPage(doc, y, 40);
  y = sectionTitle(doc, "Status Distribution", y);
  const statusCounts = mockEndorsements.reduce((acc, e) => { acc[e.status] = (acc[e.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  drawStackedBar(doc, 15, y, 180, 14, Object.entries(statusCounts).map(([name, value]) => ({ name, value })));
  y += 34;

  // ── Details Table ──
  y = checkPage(doc, y, 50);
  y = sectionTitle(doc, "Endorsement Details", y);
  autoTable(doc, {
    startY: y,
    head: [["Brand", "Deal Type", "Annual Value", "Period", "Status", "Deliverables"]],
    body: mockEndorsements.map(e => [e.brand, e.type, fmtFull(e.value), `${e.start} – ${e.end}`, e.status, e.deliverables]),
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 15, right: 15 },
  });

  pdfFooter(doc, "Endorsement Portfolio");
  doc.save(`Endorsement_Portfolio_${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateRoyaltiesPDF = () => {
  const doc = new jsPDF();
  pdfHeader(doc, "Royalty Income Report", "Royalty earnings by source and period");
  let y = 54;

  const totalAmount = mockRoyalties.reduce((s, r) => s + r.amount, 0);
  const received = mockRoyalties.filter(r => r.status === "Received").reduce((s, r) => s + r.amount, 0);
  const pending = totalAmount - received;

  // ── Summary ──
  y = sectionTitle(doc, "Income Summary", y);
  autoTable(doc, {
    startY: y,
    body: [
      ["Total Royalty Income", fmtFull(totalAmount)],
      ["Received", fmtFull(received)],
      ["Pending / Processing", fmtFull(pending)],
      ["Number of Sources", `${mockRoyalties.length}`],
    ],
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 }, 1: { halign: "right" } },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  // ── Donut: Income by Source Type ──
  y = checkPage(doc, y, 85);
  y = sectionTitle(doc, "Income by Source Type", y);
  const byType = mockRoyalties.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + r.amount; return acc; }, {} as Record<string, number>);
  const typeData = Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  drawDonutChart(doc, 60, y + 30, 28, 14, typeData, fmt(totalAmount), { legendX: 100, legendY: y + 5 });
  y += 72;

  // ── Bar Chart: By Source ──
  y = checkPage(doc, y, 130);
  y = sectionTitle(doc, "Earnings by Source", y);
  const sourceData = mockRoyalties.map(r => ({ name: r.source.substring(0, 18), value: r.amount })).sort((a, b) => b.value - a.value);
  y = drawHorizontalBarChart(doc, 15, y, 180, sourceData);
  y += 10;

  // ── Received vs Pending Stacked Bar ──
  y = checkPage(doc, y, 40);
  y = sectionTitle(doc, "Received vs Pending", y);
  drawStackedBar(doc, 15, y, 180, 14, [
    { name: "Received", value: received },
    { name: "Pending/Processing", value: pending },
  ]);
  y += 34;

  // ── Details Table ──
  y = checkPage(doc, y, 50);
  y = sectionTitle(doc, "Royalty Details", y);
  autoTable(doc, {
    startY: y,
    head: [["Source", "Type", "Period", "Amount", "Status"]],
    body: mockRoyalties.map(r => [r.source, r.type, r.period, fmtFull(r.amount), r.status]),
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
  });

  pdfFooter(doc, "Royalty Income");
  doc.save(`Royalty_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateBudgetPDF = () => {
  const doc = new jsPDF();
  pdfHeader(doc, "Monthly Budget Report", "Income allocation, spending and savings overview");
  let y = 54;

  const { income, categories } = mockBudget;
  const totalBudgeted = categories.reduce((s, c) => s + c.budgeted, 0);
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
  const surplus = income - totalSpent;

  // ── Overview KPIs ──
  y = sectionTitle(doc, "Budget Overview", y);
  autoTable(doc, {
    startY: y,
    body: [
      ["Monthly Income", fmtFull(income)],
      ["Total Budgeted", fmtFull(totalBudgeted)],
      ["Total Spent", fmtFull(totalSpent)],
      ["Surplus / (Deficit)", fmtFull(surplus)],
      ["Budget Utilisation", `${((totalSpent / income) * 100).toFixed(1)}%`],
    ],
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 }, 1: { halign: "right" } },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  // ── Donut: Spending by Type ──
  y = checkPage(doc, y, 85);
  y = sectionTitle(doc, "Spending by Category Type", y);
  const types = ["Essential", "Lifestyle", "Savings"];
  const typeSpending = types.map(t => ({
    name: t,
    value: categories.filter(c => c.type === t).reduce((s, c) => s + c.spent, 0),
  }));
  drawDonutChart(doc, 60, y + 30, 28, 14, typeSpending, fmt(totalSpent), { legendX: 100, legendY: y + 12 });
  y += 72;

  // ── Income Allocation Stacked Bar ──
  y = checkPage(doc, y, 40);
  y = sectionTitle(doc, "Income Allocation", y);
  const unallocated = income - totalBudgeted;
  const allocData = [...typeSpending.map(t => ({ name: t.name, value: categories.filter(c => c.type === t.name).reduce((s, c) => s + c.budgeted, 0) }))];
  if (unallocated > 0) allocData.push({ name: "Unallocated", value: unallocated });
  drawStackedBar(doc, 15, y, 180, 14, allocData);
  y += 36;

  // ── Bar Chart: Top Spending Categories ──
  y = checkPage(doc, y, 100);
  y = sectionTitle(doc, "Top Spending Categories", y);
  const topCats = [...categories].sort((a, b) => b.spent - a.spent).slice(0, 8).map(c => ({ name: c.name.substring(0, 18), value: c.spent }));
  y = drawHorizontalBarChart(doc, 15, y, 180, topCats);
  y += 12;

  // ── Full Category Table ──
  y = checkPage(doc, y, 50);
  y = sectionTitle(doc, "Category Breakdown", y);
  autoTable(doc, {
    startY: y,
    head: [["Category", "Type", "Budgeted", "Spent", "Variance", "% Used"]],
    body: categories.map(c => {
      const variance = c.budgeted - c.spent;
      return [c.name, c.type, fmtFull(c.budgeted), fmtFull(c.spent), fmtFull(variance), `${((c.spent / c.budgeted) * 100).toFixed(0)}%`];
    }),
    foot: [["Total", "", fmtFull(totalBudgeted), fmtFull(totalSpent), fmtFull(totalBudgeted - totalSpent), `${((totalSpent / totalBudgeted) * 100).toFixed(0)}%`]],
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 8 },
    footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 3 },
    margin: { left: 15, right: 15 },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const val = parseFloat(String(data.cell.raw).replace(/[^0-9.-]/g, ""));
        if (val < 0) data.cell.styles.textColor = [220, 50, 50];
      }
    },
  });

  pdfFooter(doc, "Monthly Budget");
  doc.save(`Monthly_Budget_${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateCompliancePDF = () => {
  const doc = new jsPDF();
  pdfHeader(doc, "Compliance Status Report", "Statutory compliance tasks and deadlines");
  let y = 54;

  const overdue = mockCompliance.filter(c => c.status === "Overdue").length;
  const dueSoon = mockCompliance.filter(c => c.status === "Due Soon").length;
  const upcoming = mockCompliance.filter(c => c.status === "Upcoming").length;
  const completed = mockCompliance.filter(c => c.status === "Completed").length;

  // ── Summary KPIs ──
  y = sectionTitle(doc, "Compliance Summary", y);
  autoTable(doc, {
    startY: y,
    body: [
      ["Total Tasks", `${mockCompliance.length}`],
      ["Overdue", `${overdue}`],
      ["Due Soon", `${dueSoon}`],
      ["Upcoming", `${upcoming}`],
      ["Completed", `${completed}`],
    ],
    theme: "striped",
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 }, 1: { halign: "right" } },
    margin: { left: 15, right: 15 },
  });
  y = (doc as any).lastAutoTable.finalY + 14;

  // ── Pie Chart: Status Distribution ──
  y = checkPage(doc, y, 85);
  y = sectionTitle(doc, "Status Distribution", y);
  const statusData = [
    { name: "Overdue", value: overdue },
    { name: "Due Soon", value: dueSoon },
    { name: "Upcoming", value: upcoming },
    { name: "Completed", value: completed },
  ].filter(d => d.value > 0);
  drawPieChart(doc, 60, y + 30, 28, statusData, { legendX: 100, legendY: y + 10 });
  y += 72;

  // ── Bar Chart: Tasks by Category ──
  y = checkPage(doc, y, 70);
  y = sectionTitle(doc, "Tasks by Regulatory Body", y);
  const byCat = mockCompliance.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {} as Record<string, number>);
  const catData = Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  y = drawHorizontalBarChart(doc, 15, y, 180, catData);
  y += 12;

  // ── Priority Stacked Bar ──
  y = checkPage(doc, y, 40);
  y = sectionTitle(doc, "Priority Distribution", y);
  const byPriority = mockCompliance.reduce((acc, c) => { acc[c.priority] = (acc[c.priority] || 0) + 1; return acc; }, {} as Record<string, number>);
  drawStackedBar(doc, 15, y, 180, 14, Object.entries(byPriority).map(([name, value]) => ({ name, value })));
  y += 36;

  // ── Details Table ──
  y = checkPage(doc, y, 50);
  y = sectionTitle(doc, "Task Details", y);
  autoTable(doc, {
    startY: y,
    head: [["Task", "Category", "Due Date", "Priority", "Status"]],
    body: mockCompliance.map(c => [c.title, c.category, c.due, c.priority, c.status]),
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
    didParseCell: (data) => {
      if (data.section === "body" && data.column.index === 4) {
        const status = String(data.cell.raw);
        if (status === "Overdue") data.cell.styles.textColor = [220, 50, 50];
        else if (status === "Due Soon") data.cell.styles.textColor = [200, 150, 30];
        else if (status === "Completed") data.cell.styles.textColor = [40, 160, 60];
      }
    },
  });

  pdfFooter(doc, "Compliance Status");
  doc.save(`Compliance_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
};
