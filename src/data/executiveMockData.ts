// Executive Overview Dashboard – Mock Data

export const clientTypeValues = [
  { name: "Athletes", value: 48_500_000, count: 34 },
  { name: "Artists", value: 22_300_000, count: 18 },
  { name: "Brands", value: 12_800_000, count: 7 },
  { name: "Trusts", value: 8_200_000, count: 5 },
  { name: "Other", value: 3_100_000, count: 4 },
];

export const revenueStreams = [
  { name: "Management Fees", value: 18_400_000 },
  { name: "Commissions", value: 14_600_000 },
  { name: "Retainers", value: 9_200_000 },
  { name: "Royalties", value: 5_800_000 },
  { name: "Endorsements", value: 4_100_000 },
];

export const monthlyRevenue = [
  { month: "Jan", revenue: 3_800_000, costs: 2_100_000 },
  { month: "Feb", revenue: 4_100_000, costs: 2_200_000 },
  { month: "Mar", revenue: 4_600_000, costs: 2_350_000 },
  { month: "Apr", revenue: 3_900_000, costs: 2_150_000 },
  { month: "May", revenue: 5_200_000, costs: 2_500_000 },
  { month: "Jun", revenue: 4_800_000, costs: 2_400_000 },
  { month: "Jul", revenue: 5_500_000, costs: 2_600_000 },
  { month: "Aug", revenue: 4_400_000, costs: 2_300_000 },
  { month: "Sep", revenue: 5_100_000, costs: 2_450_000 },
  { month: "Oct", revenue: 5_800_000, costs: 2_700_000 },
  { month: "Nov", revenue: 4_900_000, costs: 2_350_000 },
  { month: "Dec", revenue: 6_200_000, costs: 2_800_000 },
];

export const topClients = [
  { name: "Sipho Mabena", type: "Athlete", revenue: 6_400_000, sport: "Football" },
  { name: "Naledi Dlamini", type: "Artist", revenue: 4_200_000, genre: "Afro-Pop" },
  { name: "Thabo Mokoena", type: "Athlete", revenue: 3_800_000, sport: "Rugby" },
  { name: "Khanyi Mbau", type: "Brand", revenue: 3_100_000, industry: "Fashion" },
  { name: "DJ Maphorisa", type: "Artist", revenue: 2_900_000, genre: "Amapiano" },
  { name: "Caster Semenya", type: "Athlete", revenue: 2_700_000, sport: "Athletics" },
  { name: "AKA Trust", type: "Trust", revenue: 2_300_000, industry: "Music" },
  { name: "Zakes Bantwini", type: "Artist", revenue: 2_100_000, genre: "House" },
];

export const demographics = {
  clientType: [
    { name: "Athletes", value: 34 },
    { name: "Artists", value: 18 },
    { name: "Brands", value: 7 },
    { name: "Trusts", value: 5 },
    { name: "Other", value: 4 },
  ],
  industry: [
    { name: "Football", value: 14 },
    { name: "Music", value: 12 },
    { name: "Rugby", value: 8 },
    { name: "Cricket", value: 6 },
    { name: "Fashion", value: 5 },
    { name: "Film & TV", value: 4 },
    { name: "Athletics", value: 3 },
    { name: "Other", value: 16 },
  ],
  geography: [
    { name: "Gauteng", value: 28 },
    { name: "Western Cape", value: 14 },
    { name: "KwaZulu-Natal", value: 10 },
    { name: "International", value: 8 },
    { name: "Other", value: 8 },
  ],
  gender: [
    { name: "Male", value: 42 },
    { name: "Female", value: 22 },
    { name: "Non-binary", value: 4 },
  ],
  ageBand: [
    { name: "18–24", value: 12 },
    { name: "25–30", value: 22 },
    { name: "31–35", value: 16 },
    { name: "36–40", value: 10 },
    { name: "41+", value: 8 },
  ],
  paraAthletes: 4,
};

export const overheadData = {
  fixed: 18_200_000,
  variable: 10_500_000,
  categories: [
    { name: "Staff", value: 12_600_000 },
    { name: "Travel", value: 4_800_000 },
    { name: "Legal", value: 3_200_000 },
    { name: "Compliance", value: 2_400_000 },
    { name: "Technology", value: 2_100_000 },
    { name: "Office & Admin", value: 1_800_000 },
    { name: "Marketing", value: 1_800_000 },
  ],
  totalRevenue: 58_300_000,
};

export const kpis = {
  revenueGrowth: 14.2,
  concentrationRisk: 23.5, // top-3 client % of revenue
  avgRevenuePerClient: 858_824,
  clientRetention: 92.6,
  totalClients: 68,
  newClientsThisYear: 12,
  churnedClients: 5,
};

export const CHART_COLORS = [
  "hsl(43, 80%, 50%)",   // gold
  "hsl(200, 70%, 50%)",  // blue
  "hsl(150, 60%, 45%)",  // green
  "hsl(340, 65%, 50%)",  // rose
  "hsl(270, 55%, 55%)",  // purple
  "hsl(25, 75%, 55%)",   // orange
  "hsl(180, 50%, 45%)",  // teal
  "hsl(0, 0%, 55%)",     // grey
];
