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

// ─── Export Functions ─────────────────────────────────────────

export const generateContractsPDF = () => {
  const doc = new jsPDF();
  pdfHeader(doc, "Contract Portfolio Report", "Active contracts and agreements overview");
  let y = 54;

  // Summary stats
  const totalValue = mockContracts.reduce((s, c) => s + c.value, 0);
  const active = mockContracts.filter(c => c.status === "Active").length;
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
  y = (doc as any).lastAutoTable.finalY + 12;

  // Contract details table
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

  // Value by type
  y = sectionTitle(doc, "Value by Contract Type", y);
  const byType = mockContracts.reduce((acc, c) => { acc[c.type] = (acc[c.type] || 0) + c.value; return acc; }, {} as Record<string, number>);
  autoTable(doc, {
    startY: y,
    head: [["Contract Type", "Total Value", "% of Portfolio"]],
    body: Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, val]) => [type, fmtFull(val), `${((val / totalValue) * 100).toFixed(1)}%`]),
    foot: [["Total", fmtFull(totalValue), "100%"]],
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
  });

  pdfFooter(doc, "Contract Portfolio");
  doc.save(`Contract_Portfolio_${format(new Date(), "yyyy-MM-dd")}.pdf`);
};

export const generateEndorsementsPDF = () => {
  const doc = new jsPDF();
  pdfHeader(doc, "Endorsement Portfolio Report", "Brand partnerships and sponsorship overview");
  let y = 54;

  const totalValue = mockEndorsements.reduce((s, e) => s + e.value, 0);
  const active = mockEndorsements.filter(e => e.status === "Active").length;

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
  y = (doc as any).lastAutoTable.finalY + 12;

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
  y = (doc as any).lastAutoTable.finalY + 12;

  y = sectionTitle(doc, "Value by Deal Type", y);
  const byType = mockEndorsements.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + e.value; return acc; }, {} as Record<string, number>);
  autoTable(doc, {
    startY: y,
    head: [["Deal Type", "Total Value", "% of Portfolio"]],
    body: Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, val]) => [type, fmtFull(val), `${((val / totalValue) * 100).toFixed(1)}%`]),
    foot: [["Total", fmtFull(totalValue), "100%"]],
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
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
  y = (doc as any).lastAutoTable.finalY + 12;

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
  y = (doc as any).lastAutoTable.finalY + 12;

  y = sectionTitle(doc, "Income by Source Type", y);
  const byType = mockRoyalties.reduce((acc, r) => { acc[r.type] = (acc[r.type] || 0) + r.amount; return acc; }, {} as Record<string, number>);
  autoTable(doc, {
    startY: y,
    head: [["Source Type", "Total Earned", "% of Total"]],
    body: Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([type, val]) => [type, fmtFull(val), `${((val / totalAmount) * 100).toFixed(1)}%`]),
    foot: [["Total", fmtFull(totalAmount), "100%"]],
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    footStyles: { fillColor: lightBg, textColor: dark, fontStyle: "bold", fontSize: 9 },
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
  y = (doc as any).lastAutoTable.finalY + 12;

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
  y = (doc as any).lastAutoTable.finalY + 12;

  // Summary by type
  y = sectionTitle(doc, "Spending by Category Type", y);
  const types = ["Essential", "Lifestyle", "Savings"];
  const byType = types.map(t => {
    const items = categories.filter(c => c.type === t);
    const b = items.reduce((s, c) => s + c.budgeted, 0);
    const sp = items.reduce((s, c) => s + c.spent, 0);
    return [t, `${items.length}`, fmtFull(b), fmtFull(sp), `${((sp / income) * 100).toFixed(1)}%`];
  });
  autoTable(doc, {
    startY: y,
    head: [["Type", "Items", "Budgeted", "Spent", "% of Income"]],
    body: byType,
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
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
  y = (doc as any).lastAutoTable.finalY + 12;

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
  y = (doc as any).lastAutoTable.finalY + 12;

  y = sectionTitle(doc, "Tasks by Category", y);
  const byCat = mockCompliance.reduce((acc, c) => { acc[c.category] = (acc[c.category] || 0) + 1; return acc; }, {} as Record<string, number>);
  autoTable(doc, {
    startY: y,
    head: [["Category", "Tasks", "% of Total"]],
    body: Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, count]) => [cat, `${count}`, `${((count / mockCompliance.length) * 100).toFixed(0)}%`]),
    theme: "grid",
    headStyles: { fillColor: gold, textColor: white, fontStyle: "bold", fontSize: 9 },
    styles: { fontSize: 9, cellPadding: 4 },
    margin: { left: 15, right: 15 },
  });

  pdfFooter(doc, "Compliance Status");
  doc.save(`Compliance_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
};
