import { LucideIcon } from "lucide-react";

// ── Access Roles ──
export type ProfileRole = "agent" | "athlete" | "medical" | "commercial" | "support";

export interface RolePermission {
  role: ProfileRole;
  label: string;
  sections: string[];
}

export const ROLE_PERMISSIONS: RolePermission[] = [
  { role: "agent", label: "Agent (Admin)", sections: ["*"] },
  { role: "athlete", label: "Athlete", sections: ["personal", "athletic", "media", "travel", "documents"] },
  { role: "medical", label: "Medical / Welfare", sections: ["personal", "health", "para_athlete"] },
  { role: "commercial", label: "Commercial / Brand", sections: ["commercial", "media"] },
  { role: "support", label: "Support Staff", sections: ["personal", "travel", "athletic"] },
];

export function canAccessSection(role: ProfileRole, section: string): boolean {
  const perm = ROLE_PERMISSIONS.find((r) => r.role === role);
  if (!perm) return false;
  return perm.sections.includes("*") || perm.sections.includes(section);
}

// ── Consent ──
export interface ConsentRecord {
  id: string;
  type: "data_processing" | "marketing" | "medical_sharing" | "image_rights" | "anti_doping";
  description: string;
  grantedAt: string;
  expiresAt?: string;
  status: "granted" | "revoked" | "expired";
}

// ── Personal ──
export interface PersonalInfo {
  firstName: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  secondNationality?: string;
  idNumber?: string;
  passportNumber?: string;
  passportExpiry?: string;
  languages: string[];
  email: string;
  phone: string;
  address: string;
  emergencyContacts: EmergencyContact[];
  photoUrl?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

// ── Representation ──
export interface RepresentationDetails {
  agentName: string;
  agentCompany: string;
  mandateType: string;
  mandateStart: string;
  mandateEnd?: string;
  commissionRate: string;
  club?: string;
  federation?: string;
  federationId?: string;
  antiDopingStatus: "compliant" | "pending" | "suspended";
  antiDopingLastTest?: string;
  whereaboutsSubmitted?: boolean;
}

// ── Para-Athlete ──
export interface ParaAthleteInfo {
  enabled: boolean;
  disabilityDescription?: string;
  disabilityType?: string;
  sportClassification?: string;
  classificationStatus?: "confirmed" | "review" | "new";
  classificationExpiry?: string;
  assistiveDevices?: string[];
  accessibilityNeeds?: string[];
  travelRequirements?: string[];
  supportPersonnel?: SupportPerson[];
}

export interface SupportPerson {
  name: string;
  role: string;
  phone: string;
  travelsWith: boolean;
}

// ── Athletic ──
export interface AthleticProfile {
  sport: string;
  discipline?: string;
  position?: string;
  currentTeam?: string;
  coach?: string;
  coachContact?: string;
  careerStart: string;
  performanceHistory: PerformanceEntry[];
  rankings: RankingEntry[];
  injuries: InjuryRecord[];
  competitionCalendar: CompetitionEvent[];
}

export interface PerformanceEntry {
  year: string;
  event: string;
  result: string;
  achievement?: string;
}

export interface RankingEntry {
  organization: string;
  ranking: string;
  asOf: string;
}

export interface InjuryRecord {
  date: string;
  description: string;
  status: "recovered" | "active" | "managing";
  returnDate?: string;
}

export interface CompetitionEvent {
  name: string;
  date: string;
  location: string;
  status: "confirmed" | "tentative" | "completed";
}

// ── Health & Welfare ──
export interface HealthWelfare {
  insurancePolicies: InsurancePolicy[];
  medicalClearance?: { status: "cleared" | "pending" | "restricted"; date: string; notes?: string };
  emergencyActionPlan?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
}

export interface InsurancePolicy {
  type: string;
  provider: string;
  policyNumber: string;
  expiryDate: string;
  coverAmount: string;
}

// ── Commercial & Legal ──
export interface CommercialLegal {
  contracts: ContractEntry[];
  sponsors: SponsorEntry[];
  endorsements: EndorsementEntry[];
  rateCard?: RateCardItem[];
  imageRights: { holder: string; territory: string; expiryDate: string }[];
}

export interface ContractEntry {
  title: string;
  counterparty: string;
  type: string;
  startDate: string;
  endDate: string;
  value: string;
  status: "active" | "expired" | "negotiating";
}

export interface SponsorEntry {
  brand: string;
  type: string;
  value: string;
  startDate: string;
  endDate: string;
  deliverables: string;
}

export interface EndorsementEntry {
  brand: string;
  category: string;
  annualValue: string;
  status: "active" | "expired" | "pending";
}

export interface RateCardItem {
  activity: string;
  rate: string;
  currency: string;
}

// ── Media & Brand ──
export interface MediaBrand {
  approvedBio: string;
  shortBio?: string;
  socialMedia: SocialMediaLink[];
  pressAssets: PressAsset[];
  brandGuidelines?: string;
  preferredMediaContacts?: string;
}

export interface SocialMediaLink {
  platform: string;
  handle: string;
  url: string;
  followers: string;
  verified: boolean;
}

export interface PressAsset {
  type: "headshot" | "action" | "logo" | "press_release" | "video";
  title: string;
  url?: string;
  lastUpdated: string;
}

// ── Travel & Logistics ──
export interface TravelLogistics {
  passports: PassportInfo[];
  visas: VisaInfo[];
  travelPreferences: TravelPreference;
  accessibilityRequirements?: string[];
}

export interface PassportInfo {
  country: string;
  number: string;
  expiryDate: string;
  biometricEnabled: boolean;
}

export interface VisaInfo {
  country: string;
  type: string;
  expiryDate: string;
  multiEntry: boolean;
  status: "valid" | "expired" | "pending";
}

export interface TravelPreference {
  seatPreference: string;
  mealPreference: string;
  frequentFlyerPrograms: string[];
  hotelPreferences?: string;
  specialRequirements?: string;
}

// ── Document Vault ──
export interface VaultDocument {
  id: string;
  title: string;
  category: string;
  tags: string[];
  version: number;
  uploadedAt: string;
  expiryDate?: string;
  status: "current" | "expired" | "expiring_soon";
  fileType: string;
  uploadedBy: string;
}

// ── Full Athlete Profile ──
export interface AthleteFullProfile {
  id: string;
  personal: PersonalInfo;
  representation: RepresentationDetails;
  paraAthlete: ParaAthleteInfo;
  athletic: AthleticProfile;
  health: HealthWelfare;
  commercial: CommercialLegal;
  media: MediaBrand;
  travel: TravelLogistics;
  documents: VaultDocument[];
  consents: ConsentRecord[];
  lastUpdated: string;
  profileCompleteness: number;
}
