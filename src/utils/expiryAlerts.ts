import { differenceInDays, parseISO } from "date-fns";
import { AthleteFullProfile } from "@/types/athleteProfile";

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertCategory = "contract" | "visa" | "classification" | "insurance" | "passport" | "consent" | "document" | "mandate";

export interface ExpiryAlert {
  id: string;
  category: AlertCategory;
  title: string;
  detail: string;
  expiryDate: string;
  daysUntilExpiry: number;
  severity: AlertSeverity;
}

function getSeverity(days: number): AlertSeverity {
  if (days <= 0) return "critical";
  if (days <= 30) return "critical";
  if (days <= 90) return "warning";
  return "info";
}

export function computeExpiryAlerts(athlete: AthleteFullProfile): ExpiryAlert[] {
  const today = new Date();
  const alerts: ExpiryAlert[] = [];

  const addAlert = (category: AlertCategory, title: string, detail: string, expiryDate: string) => {
    const days = differenceInDays(parseISO(expiryDate), today);
    if (days <= 180) {
      alerts.push({
        id: `${category}-${title}-${expiryDate}`,
        category,
        title,
        detail,
        expiryDate,
        daysUntilExpiry: days,
        severity: getSeverity(days),
      });
    }
  };

  // Contracts
  athlete.commercial.contracts.forEach(c => {
    if (c.endDate && c.status === "active") {
      addAlert("contract", c.title, `${c.counterparty} · ${c.value}`, c.endDate);
    }
  });

  // Sponsors
  athlete.commercial.sponsors.forEach(s => {
    if (s.endDate) {
      addAlert("contract", `${s.brand} Sponsorship`, `${s.type} · ${s.value}`, s.endDate);
    }
  });

  // Image rights
  athlete.commercial.imageRights.forEach(r => {
    addAlert("contract", `Image Rights — ${r.holder}`, r.territory, r.expiryDate);
  });

  // Mandate
  if (athlete.representation.mandateEnd) {
    addAlert("mandate", "Agent Mandate", `${athlete.representation.agentName} · ${athlete.representation.agentCompany}`, athlete.representation.mandateEnd);
  }

  // Visas
  athlete.travel.visas.forEach(v => {
    if (v.status !== "expired") {
      addAlert("visa", `${v.country} Visa`, `${v.type} · ${v.multiEntry ? "Multi-entry" : "Single-entry"}`, v.expiryDate);
    }
  });

  // Passports
  athlete.travel.passports.forEach(p => {
    addAlert("passport", `${p.country} Passport`, p.number, p.expiryDate);
  });

  // Classification (para-athlete)
  if (athlete.paraAthlete.enabled && athlete.paraAthlete.classificationExpiry) {
    addAlert("classification", `Sport Classification — ${athlete.paraAthlete.sportClassification}`, athlete.paraAthlete.classificationStatus || "", athlete.paraAthlete.classificationExpiry);
  }

  // Insurance
  athlete.health.insurancePolicies.forEach(p => {
    addAlert("insurance", p.type, `${p.provider} · ${p.policyNumber}`, p.expiryDate);
  });

  // Consents with expiry
  athlete.consents.forEach(c => {
    if (c.expiresAt && c.status === "granted") {
      addAlert("consent", `Consent — ${c.type.replace(/_/g, " ")}`, c.description, c.expiresAt);
    }
  });

  // Documents with expiry
  athlete.documents.forEach(d => {
    if (d.expiryDate && d.status !== "expired") {
      addAlert("document", d.title, d.category, d.expiryDate);
    }
  });

  return alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
}
