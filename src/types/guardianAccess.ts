// Guardian Access & Minor Protection Types
// GDPR Articles 6 & 8 compliant

export type GuardianRelationship = "parent" | "legal_guardian" | "court_appointed";
export type GuardianAccessLevel = "view_only" | "limited_assist";
export type ConsentStatus = "active" | "revoked" | "expired" | "pending_verification";
export type AuditAction =
  | "guardian_invited"
  | "consent_granted"
  | "consent_revoked"
  | "access_viewed"
  | "permission_changed"
  | "auto_revoked_majority"
  | "data_access_request"
  | "rectification_request"
  | "erasure_request"
  | "restriction_request";

export interface MinorProfile {
  id: string;
  userId: string;
  dateOfBirth: string; // ISO date
  isMinor: boolean;
  declaredMinor: boolean; // explicit declaration
  ageOfMajority: number; // default 18
  majorityDate: string; // calculated ISO date
  transparencyNoticeAccepted: boolean;
  transparencyNoticeAcceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GuardianAccess {
  id: string;
  minorUserId: string;
  guardianEmail: string;
  guardianName: string;
  guardianUserId: string | null;
  relationship: GuardianRelationship;
  accessLevel: GuardianAccessLevel;
  sections: string[]; // which profile sections are visible
  purposeLimitation: string; // explicit purpose description
  status: ConsentStatus;
  verificationMethod: string; // e.g. "id_document", "court_order"
  verifiedAt: string | null;
  consentGrantedAt: string | null;
  consentExpiresAt: string | null; // time-bound
  autoRevokeAt: string; // date of majority
  coercionSafeguard: boolean; // minor confirmed independently
  createdAt: string;
  updatedAt: string;
}

export interface ConsentRecord {
  id: string;
  minorUserId: string;
  guardianAccessId: string;
  consentType: "parental_responsibility" | "data_processing" | "section_access" | "purpose_specific";
  description: string;
  status: ConsentStatus;
  grantedAt: string;
  revokedAt: string | null;
  expiresAt: string | null;
  legalBasis: string; // GDPR article reference
  dataMinimisation: string; // what data is shared and why
}

export interface AuditLogEntry {
  id: string;
  minorUserId: string;
  guardianAccessId: string | null;
  action: AuditAction;
  performedBy: string; // user id
  performedByName: string;
  performedByRole: "minor" | "guardian" | "system";
  details: string;
  ipAddress: string | null;
  timestamp: string;
}

export interface DataSubjectRight {
  id: string;
  minorUserId: string;
  requestType: "access" | "rectification" | "restriction" | "erasure";
  requestedBy: "minor" | "guardian";
  requestedByName: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "denied";
  responseNotes: string | null;
  requestedAt: string;
  completedAt: string | null;
}

// Restrictions: what guardians CANNOT do
export const GUARDIAN_RESTRICTIONS = [
  "Cannot make unilateral edits to the minor's profile",
  "Cannot perform financial actions or transactions",
  "Cannot delete any data from the minor's profile",
  "Cannot share the minor's data with third parties",
  "Cannot change the minor's authentication credentials",
  "Cannot override the minor's privacy preferences",
  "Cannot access data beyond the specified purpose limitation",
] as const;

export const GUARDIAN_RELATIONSHIPS: { value: GuardianRelationship; label: string }[] = [
  { value: "parent", label: "Biological / Adoptive Parent" },
  { value: "legal_guardian", label: "Legal Guardian" },
  { value: "court_appointed", label: "Court-Appointed Guardian" },
];

export const ACCESS_LEVELS: { value: GuardianAccessLevel; label: string; description: string }[] = [
  { value: "view_only", label: "View Only", description: "Can view permitted sections but cannot make any changes" },
  { value: "limited_assist", label: "Limited Assist", description: "Can view and suggest changes, but all actions require the minor's approval" },
];

export const SHAREABLE_SECTIONS = [
  { value: "personal_info", label: "Personal Information" },
  { value: "documents", label: "Essential Documents" },
  { value: "beneficiaries", label: "Beneficiaries" },
  { value: "emergency_contacts", label: "Emergency Contacts" },
  { value: "compliance", label: "Compliance Reminders" },
  { value: "financial_overview", label: "Financial Overview (Summary Only)" },
] as const;
