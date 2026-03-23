// Utility to apply Executive Overview filters to mock data
// Since this is mock data, we simulate filtering with deterministic multipliers

import {
  clientTypeValues,
  revenueStreams,
  monthlyRevenue,
  topClients,
  demographics,
  overheadData,
  kpis,
} from "@/data/executiveMockData";

export interface ExecutiveFilters {
  dateRange: string;
  clientType: string;
  businessUnit: string;
  manager: string;
}

// Deterministic multipliers to simulate filtered subsets
const DATE_RANGE_MULTIPLIERS: Record<string, number> = {
  ytd: 1,
  q1: 0.22,
  q2: 0.26,
  q3: 0.28,
  q4: 0.24,
  last12: 1.05,
};

const CLIENT_TYPE_MULTIPLIERS: Record<string, number> = {
  all: 1,
  athletes: 0.51,
  artists: 0.23,
  brands: 0.14,
  trusts: 0.12,
};

const BUSINESS_UNIT_MULTIPLIERS: Record<string, number> = {
  all: 1,
  sports: 0.48,
  entertainment: 0.32,
  brand: 0.20,
};

const MANAGER_MULTIPLIERS: Record<string, number> = {
  all: 1,
  "thabo-mbeki": 0.28,
  "lindiwe-nkosi": 0.22,
  "sipho-dlamini": 0.18,
  "nomsa-khumalo": 0.17,
  "bongani-zulu": 0.15,
};

const MONTH_INDICES: Record<string, [number, number]> = {
  ytd: [0, 11],
  q1: [0, 2],
  q2: [3, 5],
  q3: [6, 8],
  q4: [9, 11],
  last12: [0, 11],
};

function getMultiplier(filters: ExecutiveFilters): number {
  const dm = DATE_RANGE_MULTIPLIERS[filters.dateRange] ?? 1;
  const cm = CLIENT_TYPE_MULTIPLIERS[filters.clientType] ?? 1;
  const bm = BUSINESS_UNIT_MULTIPLIERS[filters.businessUnit] ?? 1;
  const mm = MANAGER_MULTIPLIERS[filters.manager] ?? 1;
  // Only apply non-"all" multipliers — combine them
  let m = dm;
  if (filters.clientType !== "all") m *= cm / (DATE_RANGE_MULTIPLIERS[filters.dateRange] ?? 1) > 0 ? cm : cm;
  if (filters.businessUnit !== "all") m *= bm;
  if (filters.manager !== "all") m *= mm;
  // Normalize: for "all" filters the dm already accounts for time
  return filters.clientType !== "all" || filters.businessUnit !== "all" || filters.manager !== "all"
    ? dm * (filters.clientType !== "all" ? cm : 1) * (filters.businessUnit !== "all" ? bm : 1) * (filters.manager !== "all" ? mm : 1)
    : dm;
}

function applyScale(value: number, multiplier: number): number {
  return Math.round(value * multiplier);
}

export function getFilteredKPIs(filters: ExecutiveFilters) {
  const m = getMultiplier(filters);
  const clientScale = (filters.clientType !== "all" ? CLIENT_TYPE_MULTIPLIERS[filters.clientType] ?? 1 : 1)
    * (filters.businessUnit !== "all" ? BUSINESS_UNIT_MULTIPLIERS[filters.businessUnit] ?? 1 : 1)
    * (filters.manager !== "all" ? MANAGER_MULTIPLIERS[filters.manager] ?? 1 : 1);

  const totalClients = Math.max(1, Math.round(kpis.totalClients * clientScale));
  const newClients = Math.max(0, Math.round(kpis.newClientsThisYear * clientScale));
  const churned = Math.max(0, Math.round(kpis.churnedClients * clientScale));

  return {
    revenueGrowth: +(kpis.revenueGrowth * (0.85 + Math.min(m, 1) * 0.3)).toFixed(1),
    avgRevenuePerClient: applyScale(kpis.avgRevenuePerClient, m / Math.max(clientScale, 0.1)),
    clientRetention: Math.min(99.9, +(kpis.clientRetention + (clientScale < 0.5 ? 1.2 : 0)).toFixed(1)),
    concentrationRisk: +(kpis.concentrationRisk * (clientScale < 0.3 ? 1.4 : 1)).toFixed(1),
    totalClients,
    newClientsThisYear: newClients,
    churnedClients: churned,
  };
}

export function getFilteredClientTypeValues(filters: ExecutiveFilters) {
  const m = getMultiplier(filters);
  if (filters.clientType !== "all") {
    const match = clientTypeValues.find(
      (c) => c.name.toLowerCase() === filters.clientType.toLowerCase()
    );
    if (match) {
      return [{ ...match, value: applyScale(match.value, m / (CLIENT_TYPE_MULTIPLIERS[filters.clientType] ?? 1)), count: Math.max(1, Math.round(match.count * (MANAGER_MULTIPLIERS[filters.manager] ?? 1) * (BUSINESS_UNIT_MULTIPLIERS[filters.businessUnit] ?? 1))) }];
    }
  }
  return clientTypeValues.map((c) => ({
    ...c,
    value: applyScale(c.value, m),
    count: Math.max(1, Math.round(c.count * (MANAGER_MULTIPLIERS[filters.manager] ?? 1) * (BUSINESS_UNIT_MULTIPLIERS[filters.businessUnit] ?? 1))),
  }));
}

export function getFilteredRevenueStreams(filters: ExecutiveFilters) {
  const m = getMultiplier(filters);
  return revenueStreams.map((s) => ({
    ...s,
    value: applyScale(s.value, m),
  }));
}

export function getFilteredMonthlyRevenue(filters: ExecutiveFilters) {
  const m = getMultiplier(filters);
  const [start, end] = MONTH_INDICES[filters.dateRange] ?? [0, 11];
  const baseM = DATE_RANGE_MULTIPLIERS[filters.dateRange] ?? 1;
  // For quarterly views, show only those months at full scale; for ytd/last12 show all
  const nonDateMultiplier = m / baseM; // strip date component
  return monthlyRevenue
    .filter((_, i) => i >= start && i <= end)
    .map((r) => ({
      ...r,
      revenue: applyScale(r.revenue, nonDateMultiplier),
      costs: applyScale(r.costs, nonDateMultiplier),
    }));
}

export function getFilteredTopClients(filters: ExecutiveFilters) {
  const m = getMultiplier(filters);
  let filtered = topClients;
  if (filters.clientType !== "all") {
    const typeMap: Record<string, string> = { athletes: "Athlete", artists: "Artist", brands: "Brand", trusts: "Trust" };
    filtered = filtered.filter((c) => c.type === typeMap[filters.clientType]);
  }
  return filtered.map((c) => ({
    ...c,
    revenue: applyScale(c.revenue, m / (DATE_RANGE_MULTIPLIERS[filters.dateRange] ?? 1) * (DATE_RANGE_MULTIPLIERS[filters.dateRange] ?? 1)),
  }));
}

export function getFilteredDemographics(filters: ExecutiveFilters) {
  const clientScale = (filters.businessUnit !== "all" ? BUSINESS_UNIT_MULTIPLIERS[filters.businessUnit] ?? 1 : 1)
    * (filters.manager !== "all" ? MANAGER_MULTIPLIERS[filters.manager] ?? 1 : 1);

  const scaleArr = (arr: { name: string; value: number }[]) =>
    arr.map((d) => ({ ...d, value: Math.max(1, Math.round(d.value * clientScale)) }));

  let clientType = scaleArr(demographics.clientType);
  if (filters.clientType !== "all") {
    const typeMap: Record<string, string> = { athletes: "Athletes", artists: "Artists", brands: "Brands", trusts: "Trusts" };
    clientType = clientType.filter((c) => c.name === typeMap[filters.clientType]);
  }

  return {
    clientType,
    industry: scaleArr(demographics.industry),
    geography: scaleArr(demographics.geography),
    gender: scaleArr(demographics.gender),
    ageBand: scaleArr(demographics.ageBand),
    paraAthletes: Math.max(0, Math.round(demographics.paraAthletes * clientScale)),
  };
}

export function getFilteredOverheadData(filters: ExecutiveFilters) {
  const m = getMultiplier(filters);
  return {
    fixed: applyScale(overheadData.fixed, m),
    variable: applyScale(overheadData.variable, m),
    categories: overheadData.categories.map((c) => ({
      ...c,
      value: applyScale(c.value, m),
    })),
    totalRevenue: applyScale(overheadData.totalRevenue, m),
  };
}
