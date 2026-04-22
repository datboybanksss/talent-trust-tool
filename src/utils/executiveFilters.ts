// Pure aggregations over live agent-owned data (client_invitations + agent_deals).
// All "filters" act as in-memory predicates against the live arrays.

import type { ExecutiveDataset, LiveDeal, LiveInvitation } from "@/hooks/useExecutiveData";

export interface ExecutiveFilters {
  dateRange: string;
  clientType: string;
  businessUnit: string;
  manager: string;
}

const TYPE_LABEL: Record<string, string> = {
  athlete: "Athletes",
  artist: "Artists",
  brand: "Brands",
  trust: "Trusts",
  executive: "Executives",
  other: "Other",
};

const labelForType = (raw: string): string => {
  const k = (raw || "other").toLowerCase();
  return TYPE_LABEL[k] ?? (raw ? raw[0].toUpperCase() + raw.slice(1) + "s" : "Other");
};

function dateRangeWindow(dateRange: string): { start: Date; end: Date } {
  const now = new Date();
  const year = now.getFullYear();
  const end = new Date();
  switch (dateRange) {
    case "q1": return { start: new Date(year, 0, 1), end: new Date(year, 2, 31, 23, 59, 59) };
    case "q2": return { start: new Date(year, 3, 1), end: new Date(year, 5, 30, 23, 59, 59) };
    case "q3": return { start: new Date(year, 6, 1), end: new Date(year, 8, 30, 23, 59, 59) };
    case "q4": return { start: new Date(year, 9, 1), end: new Date(year, 11, 31, 23, 59, 59) };
    case "last12": return { start: new Date(year - 1, now.getMonth(), now.getDate()), end };
    case "ytd":
    default: return { start: new Date(year, 0, 1), end };
  }
}

const inWindow = (iso: string | null, start: Date, end: Date): boolean => {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  return t >= start.getTime() && t <= end.getTime();
};

export function applyFilters(
  dataset: ExecutiveDataset,
  filters: ExecutiveFilters,
): { invitations: LiveInvitation[]; deals: LiveDeal[]; window: { start: Date; end: Date } } {
  const window = dateRangeWindow(filters.dateRange);
  const matchType = (t: string) => {
    if (filters.clientType === "all") return true;
    return (t || "").toLowerCase() === filters.clientType.replace(/s$/, "").toLowerCase();
  };
  const invitations = dataset.invitations.filter(
    (i) => i.archived_at === null && matchType(i.client_type),
  );
  const deals = dataset.deals.filter((d) => {
    if (!matchType(d.client_type)) return false;
    return inWindow(d.start_date ?? d.created_at, window.start, window.end);
  });
  return { invitations, deals, window };
}

export interface KPIResult {
  revenueGrowth: number;
  avgRevenuePerClient: number;
  clientRetention: number;
  concentrationRisk: number;
  totalClients: number;
  newClientsThisYear: number;
  churnedClients: number;
}

export function getFilteredKPIs(dataset: ExecutiveDataset, filters: ExecutiveFilters): KPIResult {
  const { invitations, deals, window } = applyFilters(dataset, filters);
  const totalRevenue = deals.reduce((s, d) => s + (d.value_amount ?? 0), 0);
  const totalClients = invitations.length;
  const churned = dataset.invitations.filter(
    (i) => i.archived_at !== null && (filters.clientType === "all" || (i.client_type || "").toLowerCase() === filters.clientType.replace(/s$/, "").toLowerCase()),
  ).length;
  const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime();
  const newThisYear = invitations.filter((i) => new Date(i.created_at).getTime() >= yearStart).length;

  // Prior period revenue
  const periodMs = window.end.getTime() - window.start.getTime();
  const priorStart = new Date(window.start.getTime() - periodMs);
  const priorEnd = new Date(window.start.getTime() - 1);
  const priorRevenue = dataset.deals
    .filter((d) => inWindow(d.start_date ?? d.created_at, priorStart, priorEnd))
    .reduce((s, d) => s + (d.value_amount ?? 0), 0);
  const revenueGrowth = priorRevenue > 0
    ? +(((totalRevenue - priorRevenue) / priorRevenue) * 100).toFixed(1)
    : 0;

  // Concentration: top-3 clients' share
  const byClient = new Map<string, number>();
  deals.forEach((d) => byClient.set(d.client_name, (byClient.get(d.client_name) ?? 0) + (d.value_amount ?? 0)));
  const sorted = [...byClient.values()].sort((a, b) => b - a);
  const top3 = sorted.slice(0, 3).reduce((s, v) => s + v, 0);
  const concentrationRisk = totalRevenue > 0 ? +((top3 / totalRevenue) * 100).toFixed(1) : 0;

  const totalEver = totalClients + churned;
  const clientRetention = totalEver > 0 ? +((totalClients / totalEver) * 100).toFixed(1) : 100;

  return {
    revenueGrowth,
    avgRevenuePerClient: totalClients > 0 ? Math.round(totalRevenue / totalClients) : 0,
    clientRetention,
    concentrationRisk,
    totalClients,
    newClientsThisYear: newThisYear,
    churnedClients: churned,
  };
}

export interface NamedValue { name: string; value: number; count?: number }

export function getFilteredClientTypeValues(dataset: ExecutiveDataset, filters: ExecutiveFilters): NamedValue[] {
  const { invitations, deals } = applyFilters(dataset, filters);
  const map = new Map<string, { value: number; count: number }>();
  invitations.forEach((i) => {
    const k = labelForType(i.client_type);
    const cur = map.get(k) ?? { value: 0, count: 0 };
    cur.count += 1;
    map.set(k, cur);
  });
  deals.forEach((d) => {
    const k = labelForType(d.client_type);
    const cur = map.get(k) ?? { value: 0, count: 0 };
    cur.value += d.value_amount ?? 0;
    map.set(k, cur);
  });
  return [...map.entries()].map(([name, v]) => ({ name, value: v.value, count: v.count }))
    .sort((a, b) => b.value - a.value);
}

export function getFilteredRevenueStreams(dataset: ExecutiveDataset, filters: ExecutiveFilters): NamedValue[] {
  const { deals } = applyFilters(dataset, filters);
  const map = new Map<string, number>();
  deals.forEach((d) => {
    const k = d.deal_type || "Other";
    map.set(k, (map.get(k) ?? 0) + (d.value_amount ?? 0));
  });
  return [...map.entries()].map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export interface MonthlyPoint { month: string; revenue: number; costs: number }

export function getFilteredMonthlyRevenue(dataset: ExecutiveDataset, filters: ExecutiveFilters): MonthlyPoint[] {
  const { deals, window } = applyFilters(dataset, filters);
  const months: { key: string; label: string; date: Date }[] = [];
  const cursor = new Date(window.start.getFullYear(), window.start.getMonth(), 1);
  while (cursor <= window.end) {
    months.push({
      key: `${cursor.getFullYear()}-${cursor.getMonth()}`,
      label: cursor.toLocaleString("en", { month: "short" }),
      date: new Date(cursor),
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  const byMonth = new Map<string, number>();
  deals.forEach((d) => {
    const ref = d.start_date ?? d.created_at;
    const dt = new Date(ref);
    const k = `${dt.getFullYear()}-${dt.getMonth()}`;
    byMonth.set(k, (byMonth.get(k) ?? 0) + (d.value_amount ?? 0));
  });
  return months.map((m) => ({ month: m.label, revenue: byMonth.get(m.key) ?? 0, costs: 0 }));
}

export interface TopClient { name: string; type: string; revenue: number; sport?: string; genre?: string; industry?: string }

export function getFilteredTopClients(dataset: ExecutiveDataset, filters: ExecutiveFilters): TopClient[] {
  const { deals } = applyFilters(dataset, filters);
  const map = new Map<string, TopClient>();
  deals.forEach((d) => {
    const cur = map.get(d.client_name) ?? {
      name: d.client_name,
      type: labelForType(d.client_type).replace(/s$/, ""),
      revenue: 0,
      industry: d.brand,
    };
    cur.revenue += d.value_amount ?? 0;
    map.set(d.client_name, cur);
  });
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 10);
}

export interface Demographics {
  clientType: NamedValue[];
  industry: NamedValue[];
  geography: NamedValue[];
  gender: NamedValue[];
  ageBand: NamedValue[];
  paraAthletes: number;
}

export function getFilteredDemographics(dataset: ExecutiveDataset, filters: ExecutiveFilters): Demographics {
  const { invitations, deals } = applyFilters(dataset, filters);

  const tally = (extract: (i: LiveInvitation) => string | undefined): NamedValue[] => {
    const map = new Map<string, number>();
    invitations.forEach((i) => {
      const v = extract(i);
      if (!v) return;
      map.set(v, (map.get(v) ?? 0) + 1);
    });
    return [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  };

  const meta = (i: LiveInvitation) => (i.pre_populated_data ?? {}) as Record<string, string | undefined>;

  const clientType: NamedValue[] = [];
  const ctMap = new Map<string, number>();
  invitations.forEach((i) => {
    const k = labelForType(i.client_type);
    ctMap.set(k, (ctMap.get(k) ?? 0) + 1);
  });
  ctMap.forEach((value, name) => clientType.push({ name, value }));

  const industryFromDeals = new Map<string, number>();
  deals.forEach((d) => industryFromDeals.set(d.brand, (industryFromDeals.get(d.brand) ?? 0) + 1));

  const paraAthletes = invitations.filter((i) => {
    const m = meta(i);
    return m.para_athlete === "true" || m.paraAthlete === "true";
  }).length;

  return {
    clientType: clientType.sort((a, b) => b.value - a.value),
    industry: tally((i) => meta(i).industry) .length
      ? tally((i) => meta(i).industry)
      : [...industryFromDeals.entries()].map(([name, value]) => ({ name, value })),
    geography: tally((i) => meta(i).geography ?? meta(i).location ?? meta(i).province),
    gender: tally((i) => meta(i).gender),
    ageBand: tally((i) => meta(i).age_band ?? meta(i).ageBand),
    paraAthletes,
  };
}
