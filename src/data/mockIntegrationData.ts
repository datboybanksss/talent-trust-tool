export type IntegrationStatus = "connected" | "disconnected" | "syncing" | "error";
export type IntegrationCategory = "banking" | "investments" | "crypto" | "insurance";

export interface FinancialIntegration {
  id: string;
  provider: string;
  logo: string; // emoji for mock
  category: IntegrationCategory;
  status: IntegrationStatus;
  lastSynced: string | null;
  accountName: string | null;
  balance: number | null;
  currency: string;
  details: Record<string, string | number | boolean | null>;
}

export const AVAILABLE_PROVIDERS: {
  id: string;
  name: string;
  category: IntegrationCategory;
  logo: string;
  description: string;
  fields: string[];
}[] = [
  // Banking
  { id: "fnb", name: "FNB", category: "banking", logo: "🏦", description: "First National Bank — Cheque, Savings, Credit Card", fields: ["Account Number"] },
  { id: "nedbank", name: "Nedbank", category: "banking", logo: "🏦", description: "Nedbank — Current, Savings, Home Loan", fields: ["Account Number"] },
  { id: "standard_bank", name: "Standard Bank", category: "banking", logo: "🏦", description: "Standard Bank — All account types", fields: ["Account Number"] },
  { id: "absa", name: "Absa", category: "banking", logo: "🏦", description: "Absa — Cheque, Savings, Credit Card", fields: ["Account Number"] },
  { id: "capitec", name: "Capitec", category: "banking", logo: "🏦", description: "Capitec — Global One Account", fields: ["Account Number"] },
  { id: "investec", name: "Investec", category: "banking", logo: "🏦", description: "Investec — Private Banking", fields: ["Account Number"] },
  // Investments
  { id: "easyequities", name: "EasyEquities", category: "investments", logo: "📈", description: "JSE, US & Crypto baskets", fields: ["Email"] },
  { id: "allan_gray", name: "Allan Gray", category: "investments", logo: "📊", description: "Unit trusts, RA, Tax-Free", fields: ["Investor Number"] },
  { id: "coronation", name: "Coronation", category: "investments", logo: "📊", description: "Unit trusts & Retirement", fields: ["Investor Number"] },
  { id: "sanlam_invest", name: "Sanlam Investments", category: "investments", logo: "📊", description: "Unit trusts, Glacier & Wealth", fields: ["Policy Number"] },
  { id: "ninety_one", name: "Ninety One", category: "investments", logo: "📊", description: "Global & local funds", fields: ["Investor Number"] },
  { id: "satrix", name: "Satrix", category: "investments", logo: "📊", description: "Low-cost index tracking", fields: ["Account Number"] },
  // Crypto
  { id: "luno", name: "Luno", category: "crypto", logo: "₿", description: "BTC, ETH & ZAR pairs", fields: ["API Key"] },
  { id: "valr", name: "VALR", category: "crypto", logo: "₿", description: "SA's largest crypto exchange", fields: ["API Key"] },
  { id: "altcointrader", name: "AltCoinTrader", category: "crypto", logo: "₿", description: "SA crypto exchange", fields: ["API Key"] },
  // Insurance
  { id: "discovery", name: "Discovery Life", category: "insurance", logo: "🛡️", description: "Life, health & disability cover", fields: ["Policy Number"] },
  { id: "sanlam", name: "Sanlam", category: "insurance", logo: "🛡️", description: "Life, credit life, funeral", fields: ["Policy Number"] },
  { id: "old_mutual", name: "Old Mutual", category: "insurance", logo: "🛡️", description: "Life, savings & retirement", fields: ["Policy Number"] },
  { id: "liberty", name: "Liberty", category: "insurance", logo: "🛡️", description: "Life & investment cover", fields: ["Policy Number"] },
  { id: "momentum", name: "Momentum", category: "insurance", logo: "🛡️", description: "Life, health, short-term", fields: ["Policy Number"] },
  { id: "hollard", name: "Hollard", category: "insurance", logo: "🛡️", description: "Short-term & life insurance", fields: ["Policy Number"] },
];

// Mock connected accounts
export const mockConnectedAccounts: FinancialIntegration[] = [
  {
    id: "1",
    provider: "fnb",
    logo: "🏦",
    category: "banking",
    status: "connected",
    lastSynced: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min ago
    accountName: "FNB Cheque Account",
    balance: 87450.32,
    currency: "ZAR",
    details: { accountNumber: "****4521", type: "Cheque", branch: "250655" },
  },
  {
    id: "2",
    provider: "nedbank",
    logo: "🏦",
    category: "banking",
    status: "connected",
    lastSynced: new Date(Date.now() - 120 * 60 * 1000).toISOString(), // 2h ago
    accountName: "Nedbank Savings",
    balance: 245000.0,
    currency: "ZAR",
    details: { accountNumber: "****8903", type: "Savings" },
  },
  {
    id: "3",
    provider: "easyequities",
    logo: "📈",
    category: "investments",
    status: "connected",
    lastSynced: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    accountName: "EasyEquities JSE + US",
    balance: 520000.0,
    currency: "ZAR",
    details: { holdings: 14, topHolding: "Satrix Top 40", gainLoss: "+12.3%" },
  },
  {
    id: "4",
    provider: "allan_gray",
    logo: "📊",
    category: "investments",
    status: "connected",
    lastSynced: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    accountName: "Allan Gray Balanced Fund",
    balance: 890000.0,
    currency: "ZAR",
    details: { fundType: "Unit Trust", investorNumber: "****3312", annualReturn: "11.2%" },
  },
  {
    id: "5",
    provider: "investec",
    logo: "🏦",
    category: "banking",
    status: "connected",
    lastSynced: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    accountName: "Investec Private Portfolio",
    balance: 1350000.0,
    currency: "ZAR",
    details: { accountNumber: "****9901", type: "Private Banking" },
  },
  {
    id: "6",
    provider: "luno",
    logo: "₿",
    category: "crypto",
    status: "connected",
    lastSynced: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    accountName: "Luno Wallet",
    balance: 185400.0,
    currency: "ZAR",
    details: { btc: "0.0842 BTC", eth: "1.24 ETH", xrp: "500 XRP" },
  },
  {
    id: "7",
    provider: "valr",
    logo: "₿",
    category: "crypto",
    status: "syncing",
    lastSynced: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    accountName: "VALR Portfolio",
    balance: 62500.0,
    currency: "ZAR",
    details: { btc: "0.031 BTC", sol: "12.5 SOL" },
  },
  {
    id: "8",
    provider: "discovery",
    logo: "🛡️",
    category: "insurance",
    status: "connected",
    lastSynced: new Date(Date.now() - 180 * 60 * 1000).toISOString(), // 3h ago
    accountName: "Discovery Life Cover",
    balance: 5000000.0,
    currency: "ZAR",
    details: { policyNumber: "****7821", premium: "R 2,450/mo", coverType: "Life + Disability" },
  },
  {
    id: "9",
    provider: "sanlam",
    logo: "🛡️",
    category: "insurance",
    status: "connected",
    lastSynced: new Date(Date.now() - 160 * 60 * 1000).toISOString(),
    accountName: "Sanlam Funeral Cover",
    balance: 80000.0,
    currency: "ZAR",
    details: { policyNumber: "****4455", premium: "R 350/mo", coverType: "Funeral" },
  },
  {
    id: "10",
    provider: "absa",
    logo: "🏦",
    category: "banking",
    status: "error",
    lastSynced: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6h ago — stale
    accountName: "Absa Credit Card",
    balance: -34520.0,
    currency: "ZAR",
    details: { accountNumber: "****6734", type: "Credit Card", error: "Token expired — re-authenticate" },
  },
];

export const formatTimeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const isFresh = (iso: string | null, maxMinutes = 180) => {
  if (!iso) return false;
  return Date.now() - new Date(iso).getTime() < maxMinutes * 60 * 1000;
};
