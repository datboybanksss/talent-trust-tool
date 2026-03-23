// Detailed client records for drill-down views
export interface DrillDownClient {
  name: string;
  type: "Athlete" | "Artist" | "Brand" | "Trust" | "Other";
  revenue: number;
  industry: string;
  geography: string;
  gender: "Male" | "Female" | "Non-binary";
  ageBand: string;
  paraAthlete?: boolean;
}

export const detailedClients: DrillDownClient[] = [
  { name: "Sipho Mabena", type: "Athlete", revenue: 6_400_000, industry: "Football", geography: "Gauteng", gender: "Male", ageBand: "25–30" },
  { name: "Naledi Dlamini", type: "Artist", revenue: 4_200_000, industry: "Music", geography: "Western Cape", gender: "Female", ageBand: "25–30" },
  { name: "Thabo Mokoena", type: "Athlete", revenue: 3_800_000, industry: "Rugby", geography: "Gauteng", gender: "Male", ageBand: "31–35" },
  { name: "Khanyi Mbau", type: "Brand", revenue: 3_100_000, industry: "Fashion", geography: "Gauteng", gender: "Female", ageBand: "36–40" },
  { name: "DJ Maphorisa", type: "Artist", revenue: 2_900_000, industry: "Music", geography: "Gauteng", gender: "Male", ageBand: "31–35" },
  { name: "Caster Semenya", type: "Athlete", revenue: 2_700_000, industry: "Athletics", geography: "Gauteng", gender: "Female", ageBand: "31–35", paraAthlete: false },
  { name: "AKA Trust", type: "Trust", revenue: 2_300_000, industry: "Music", geography: "Gauteng", gender: "Male", ageBand: "31–35" },
  { name: "Zakes Bantwini", type: "Artist", revenue: 2_100_000, industry: "Music", geography: "KwaZulu-Natal", gender: "Male", ageBand: "36–40" },
  { name: "Siya Kolisi", type: "Athlete", revenue: 1_900_000, industry: "Rugby", geography: "Western Cape", gender: "Male", ageBand: "31–35" },
  { name: "Bonang Matheba", type: "Brand", revenue: 1_800_000, industry: "Fashion", geography: "Gauteng", gender: "Female", ageBand: "36–40" },
  { name: "Tendai Mtawarira", type: "Athlete", revenue: 1_700_000, industry: "Rugby", geography: "KwaZulu-Natal", gender: "Male", ageBand: "36–40" },
  { name: "Tyla Seethal", type: "Artist", revenue: 1_600_000, industry: "Music", geography: "Gauteng", gender: "Female", ageBand: "18–24" },
  { name: "Rassie Erasmus Trust", type: "Trust", revenue: 1_500_000, industry: "Rugby", geography: "Western Cape", gender: "Male", ageBand: "41+" },
  { name: "Anele Mdoda", type: "Brand", revenue: 1_400_000, industry: "Film & TV", geography: "Gauteng", gender: "Female", ageBand: "36–40" },
  { name: "Kagiso Rabada", type: "Athlete", revenue: 1_350_000, industry: "Cricket", geography: "Gauteng", gender: "Male", ageBand: "25–30" },
  { name: "Lungi Ngidi", type: "Athlete", revenue: 1_300_000, industry: "Cricket", geography: "KwaZulu-Natal", gender: "Male", ageBand: "25–30" },
  { name: "Wayde van Niekerk", type: "Athlete", revenue: 1_250_000, industry: "Athletics", geography: "Western Cape", gender: "Male", ageBand: "31–35" },
  { name: "Ntando Duma", type: "Artist", revenue: 1_200_000, industry: "Film & TV", geography: "Gauteng", gender: "Female", ageBand: "25–30" },
  { name: "Eben Etzebeth", type: "Athlete", revenue: 1_150_000, industry: "Rugby", geography: "Western Cape", gender: "Male", ageBand: "31–35" },
  { name: "Cheslin Kolbe", type: "Athlete", revenue: 1_100_000, industry: "Rugby", geography: "International", gender: "Male", ageBand: "25–30" },
  { name: "Makazole Mapimpi", type: "Athlete", revenue: 1_050_000, industry: "Rugby", geography: "KwaZulu-Natal", gender: "Male", ageBand: "31–35" },
  { name: "Amanda Black", type: "Artist", revenue: 1_000_000, industry: "Music", geography: "Western Cape", gender: "Female", ageBand: "25–30" },
  { name: "Teko Modise", type: "Athlete", revenue: 950_000, industry: "Football", geography: "Gauteng", gender: "Male", ageBand: "41+" },
  { name: "Hlubi Mboya", type: "Artist", revenue: 900_000, industry: "Film & TV", geography: "Gauteng", gender: "Female", ageBand: "36–40" },
  { name: "Pitso Mosimane", type: "Athlete", revenue: 880_000, industry: "Football", geography: "International", gender: "Male", ageBand: "41+" },
  { name: "Percy Tau", type: "Athlete", revenue: 850_000, industry: "Football", geography: "International", gender: "Male", ageBand: "25–30" },
  { name: "Ntombela Trust", type: "Trust", revenue: 820_000, industry: "Music", geography: "KwaZulu-Natal", gender: "Male", ageBand: "41+" },
  { name: "Shekhinah", type: "Artist", revenue: 780_000, industry: "Music", geography: "Western Cape", gender: "Female", ageBand: "25–30" },
  { name: "Mandla N.", type: "Other", revenue: 750_000, industry: "Other", geography: "Gauteng", gender: "Male", ageBand: "31–35" },
  { name: "Dudu Myeni Trust", type: "Trust", revenue: 700_000, industry: "Other", geography: "KwaZulu-Natal", gender: "Female", ageBand: "41+" },
  { name: "Nathi Mthethwa", type: "Artist", revenue: 680_000, industry: "Music", geography: "KwaZulu-Natal", gender: "Male", ageBand: "31–35" },
  { name: "Faf de Klerk", type: "Athlete", revenue: 660_000, industry: "Rugby", geography: "International", gender: "Male", ageBand: "31–35" },
  { name: "Lebo Mathosa Trust", type: "Trust", revenue: 640_000, industry: "Music", geography: "Gauteng", gender: "Female", ageBand: "36–40" },
  { name: "Gift Leremi", type: "Athlete", revenue: 620_000, industry: "Football", geography: "Gauteng", gender: "Male", ageBand: "41+" },
  { name: "Themba Zwane", type: "Athlete", revenue: 600_000, industry: "Football", geography: "Gauteng", gender: "Male", ageBand: "25–30" },
  { name: "Lady Du", type: "Artist", revenue: 580_000, industry: "Music", geography: "Gauteng", gender: "Female", ageBand: "25–30" },
  { name: "Sbahle Mpisane", type: "Brand", revenue: 560_000, industry: "Fashion", geography: "KwaZulu-Natal", gender: "Female", ageBand: "25–30" },
  { name: "Nasty C", type: "Artist", revenue: 540_000, industry: "Music", geography: "KwaZulu-Natal", gender: "Male", ageBand: "25–30" },
  { name: "Quinton de Kock", type: "Athlete", revenue: 520_000, industry: "Cricket", geography: "Gauteng", gender: "Male", ageBand: "31–35" },
  { name: "Aiden Markram", type: "Athlete", revenue: 500_000, industry: "Cricket", geography: "Gauteng", gender: "Male", ageBand: "25–30" },
  { name: "Mpho Letsholonyane", type: "Athlete", revenue: 480_000, industry: "Football", geography: "Gauteng", gender: "Male", ageBand: "41+" },
  { name: "Nomzamo Mbatha", type: "Brand", revenue: 460_000, industry: "Film & TV", geography: "International", gender: "Female", ageBand: "31–35" },
  { name: "Zola 7", type: "Artist", revenue: 440_000, industry: "Music", geography: "Gauteng", gender: "Male", ageBand: "41+" },
  { name: "Thato M.", type: "Other", revenue: 420_000, industry: "Other", geography: "Western Cape", gender: "Non-binary", ageBand: "25–30" },
  { name: "Nox Guni", type: "Artist", revenue: 400_000, industry: "Music", geography: "Western Cape", gender: "Female", ageBand: "18–24" },
  { name: "Lukhanyo Am", type: "Athlete", revenue: 380_000, industry: "Rugby", geography: "KwaZulu-Natal", gender: "Male", ageBand: "25–30" },
  { name: "Andile Phehlukwayo", type: "Athlete", revenue: 360_000, industry: "Cricket", geography: "KwaZulu-Natal", gender: "Male", ageBand: "25–30" },
  { name: "Refiloe Jane", type: "Athlete", revenue: 340_000, industry: "Football", geography: "International", gender: "Female", ageBand: "31–35" },
  { name: "Sho Madjozi", type: "Artist", revenue: 320_000, industry: "Music", geography: "Gauteng", gender: "Female", ageBand: "25–30" },
  { name: "Siphiwe Tshabalala", type: "Athlete", revenue: 300_000, industry: "Football", geography: "Gauteng", gender: "Male", ageBand: "36–40" },
  { name: "Ntando K.", type: "Other", revenue: 280_000, industry: "Other", geography: "Gauteng", gender: "Male", ageBand: "31–35" },
  { name: "Sdumo Mtshali", type: "Artist", revenue: 260_000, industry: "Film & TV", geography: "Gauteng", gender: "Male", ageBand: "31–35" },
  { name: "Mpho Makola", type: "Athlete", revenue: 240_000, industry: "Football", geography: "Gauteng", gender: "Male", ageBand: "36–40" },
  { name: "Katlego Mphela", type: "Athlete", revenue: 220_000, industry: "Football", geography: "Gauteng", gender: "Male", ageBand: "36–40" },
  { name: "Nthabiseng P.", type: "Other", revenue: 200_000, industry: "Other", geography: "KwaZulu-Natal", gender: "Female", ageBand: "25–30" },
  { name: "Ntsiki Mazwai", type: "Artist", revenue: 180_000, industry: "Music", geography: "Gauteng", gender: "Female", ageBand: "36–40" },
  { name: "Aphiwe Dyantyi", type: "Athlete", revenue: 160_000, industry: "Rugby", geography: "Gauteng", gender: "Male", ageBand: "25–30", paraAthlete: false },
  { name: "Ntando Mahlangu", type: "Athlete", revenue: 450_000, industry: "Athletics", geography: "Gauteng", gender: "Male", ageBand: "18–24", paraAthlete: true },
  { name: "Anrune Weyers", type: "Athlete", revenue: 380_000, industry: "Athletics", geography: "Western Cape", gender: "Female", ageBand: "31–35", paraAthlete: true },
  { name: "Kgothatso Montjane", type: "Athlete", revenue: 320_000, industry: "Other", geography: "Gauteng", gender: "Female", ageBand: "36–40", paraAthlete: true },
  { name: "Hilton Langenhoven", type: "Athlete", revenue: 280_000, industry: "Athletics", geography: "Western Cape", gender: "Male", ageBand: "25–30", paraAthlete: true },
];

export interface DrillDownFilter {
  category: string;
  segment: string;
}

export const filterClients = (filter: DrillDownFilter): DrillDownClient[] => {
  const { category, segment } = filter;

  switch (category) {
    case "Client Type":
      return detailedClients.filter((c) => c.type === segment || (segment === "Other" && !["Athlete", "Artist", "Brand", "Trust"].includes(c.type)));
    case "Revenue Stream":
      // Revenue stream doesn't map to individual clients directly; show all sorted by revenue
      return [...detailedClients].sort((a, b) => b.revenue - a.revenue);
    case "Industry":
    case "Industry / Sector":
      return detailedClients.filter((c) => c.industry === segment || (segment === "Other" && !["Football", "Music", "Rugby", "Cricket", "Fashion", "Film & TV", "Athletics"].includes(c.industry)));
    case "Geography":
      return detailedClients.filter((c) => c.geography === segment || (segment === "Other" && !["Gauteng", "Western Cape", "KwaZulu-Natal", "International"].includes(c.geography)));
    case "Gender":
      return detailedClients.filter((c) => c.gender === segment);
    case "Age Band":
      return detailedClients.filter((c) => c.ageBand === segment);
    case "Cost Category":
      return [...detailedClients].sort((a, b) => b.revenue - a.revenue);
    case "Fixed vs Variable":
      return [...detailedClients].sort((a, b) => b.revenue - a.revenue);
    default:
      return detailedClients;
  }
};
