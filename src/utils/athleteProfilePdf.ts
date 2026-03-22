import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";
import { AthleteFullProfile } from "@/types/athleteProfile";

export const generateAthleteProfilePDF = (athlete: AthleteFullProfile) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 20;

  const gold: [number, number, number] = [196, 155, 45];
  const dark: [number, number, number] = [30, 30, 30];
  const muted: [number, number, number] = [120, 120, 120];
  const green: [number, number, number] = [34, 139, 34];
  const red: [number, number, number] = [220, 20, 60];
  const amber: [number, number, number] = [200, 150, 0];

  const checkPage = (space: number) => {
    if (y + space > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
  };

  const sectionTitle = (title: string) => {
    checkPage(30);
    doc.setFillColor(...gold);
    doc.rect(15, y, 4, 14, "F");
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text(title, 24, y + 10);
    y += 20;
  };

  const fieldRow = (label: string, value: string | undefined) => {
    if (!value) return;
    checkPage(10);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...muted);
    doc.text(label, 24, y);
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    doc.text(value, 75, y);
    y += 6;
  };

  // ── Header ──
  doc.setFillColor(...gold);
  doc.rect(0, 0, pageWidth, 50, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text(`${athlete.personal.firstName} ${athlete.personal.lastName}`, 20, 20);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`${athlete.athletic.sport} · ${athlete.athletic.currentTeam || athlete.athletic.discipline || ""}`, 20, 30);
  const paraLabel = athlete.paraAthlete.enabled ? "  |  Para-Athlete" : "";
  doc.text(`${athlete.personal.nationality}${paraLabel}`, 20, 38);
  doc.setFontSize(9);
  doc.text(`Profile Completeness: ${athlete.profileCompleteness}%`, pageWidth - 20, 20, { align: "right" });
  doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, pageWidth - 20, 30, { align: "right" });
  doc.text("CONFIDENTIAL", pageWidth - 20, 44, { align: "right" });

  y = 60;
  doc.setTextColor(...dark);

  // ── Personal Information ──
  sectionTitle("Personal Information");
  fieldRow("Full Name", `${athlete.personal.firstName} ${athlete.personal.lastName}${athlete.personal.preferredName ? ` ("${athlete.personal.preferredName}")` : ""}`);
  fieldRow("Date of Birth", athlete.personal.dateOfBirth);
  fieldRow("Gender", athlete.personal.gender);
  fieldRow("Nationality", athlete.personal.nationality + (athlete.personal.secondNationality ? ` / ${athlete.personal.secondNationality}` : ""));
  fieldRow("ID Number", athlete.personal.idNumber);
  fieldRow("Passport", `${athlete.personal.passportNumber || "-"} (Exp: ${athlete.personal.passportExpiry || "-"})`);
  fieldRow("Languages", athlete.personal.languages.join(", "));
  fieldRow("Email", athlete.personal.email);
  fieldRow("Phone", athlete.personal.phone);
  fieldRow("Address", athlete.personal.address);
  y += 4;

  if (athlete.personal.emergencyContacts.length > 0) {
    checkPage(20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...dark);
    doc.text("Emergency Contacts", 24, y);
    y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Name", "Relationship", "Phone", "Email"]],
      body: athlete.personal.emergencyContacts.map(c => [c.name, c.relationship, c.phone, c.email || "-"]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 24, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Representation ──
  sectionTitle("Representation & Mandate");
  fieldRow("Agent", `${athlete.representation.agentName} (${athlete.representation.agentCompany})`);
  fieldRow("Mandate", `${athlete.representation.mandateType} — ${athlete.representation.mandateStart} to ${athlete.representation.mandateEnd || "Ongoing"}`);
  fieldRow("Commission", athlete.representation.commissionRate);
  fieldRow("Club", athlete.representation.club);
  fieldRow("Federation", `${athlete.representation.federation || "-"} (${athlete.representation.federationId || "-"})`);
  fieldRow("Anti-Doping", `${athlete.representation.antiDopingStatus.toUpperCase()} — Last test: ${athlete.representation.antiDopingLastTest || "N/A"}`);
  fieldRow("Whereabouts", athlete.representation.whereaboutsSubmitted ? "Submitted" : "Outstanding");
  y += 4;

  // ── Para-Athlete ──
  if (athlete.paraAthlete.enabled) {
    sectionTitle("Para-Athlete Profile");
    fieldRow("Disability", athlete.paraAthlete.disabilityDescription);
    fieldRow("Type", athlete.paraAthlete.disabilityType);
    fieldRow("Classification", `${athlete.paraAthlete.sportClassification || "-"} (${athlete.paraAthlete.classificationStatus || "-"})`);
    fieldRow("Classification Exp.", athlete.paraAthlete.classificationExpiry);
    if (athlete.paraAthlete.assistiveDevices?.length) fieldRow("Assistive Devices", athlete.paraAthlete.assistiveDevices.join("; "));
    if (athlete.paraAthlete.accessibilityNeeds?.length) fieldRow("Accessibility", athlete.paraAthlete.accessibilityNeeds.join("; "));
    if (athlete.paraAthlete.travelRequirements?.length) fieldRow("Travel Needs", athlete.paraAthlete.travelRequirements.join("; "));

    if (athlete.paraAthlete.supportPersonnel?.length) {
      checkPage(20);
      autoTable(doc, {
        startY: y,
        head: [["Support Person", "Role", "Phone", "Travels"]],
        body: athlete.paraAthlete.supportPersonnel.map(s => [s.name, s.role, s.phone, s.travelsWith ? "Yes" : "No"]),
        theme: "grid",
        headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 24, right: 15 },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }
    y += 4;
  }

  // ── Athletic Profile ──
  sectionTitle("Athletic Profile");
  fieldRow("Sport", athlete.athletic.sport);
  fieldRow("Discipline / Position", `${athlete.athletic.discipline || "-"} / ${athlete.athletic.position || "-"}`);
  fieldRow("Current Team", athlete.athletic.currentTeam);
  fieldRow("Coach", `${athlete.athletic.coach || "-"} (${athlete.athletic.coachContact || "-"})`);
  fieldRow("Career Start", athlete.athletic.careerStart);
  y += 4;

  if (athlete.athletic.performanceHistory.length) {
    checkPage(20);
    autoTable(doc, {
      startY: y,
      head: [["Year", "Event", "Result", "Achievement"]],
      body: athlete.athletic.performanceHistory.map(p => [p.year, p.event, p.result, p.achievement || "-"]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 24, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (athlete.athletic.rankings.length) {
    checkPage(20);
    autoTable(doc, {
      startY: y,
      head: [["Organization", "Ranking", "As Of"]],
      body: athlete.athletic.rankings.map(r => [r.organization, r.ranking, r.asOf]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 24, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (athlete.athletic.injuries.length) {
    checkPage(20);
    autoTable(doc, {
      startY: y,
      head: [["Date", "Injury", "Status", "Return"]],
      body: athlete.athletic.injuries.map(i => [i.date, i.description, i.status, i.returnDate || "-"]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 24, right: 15 },
      didParseCell: (d) => {
        if (d.column.index === 2 && d.section === "body") {
          const v = d.cell.raw as string;
          if (v === "recovered") d.cell.styles.textColor = green;
          else if (v === "active") d.cell.styles.textColor = red;
          else d.cell.styles.textColor = amber;
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (athlete.athletic.competitionCalendar.length) {
    checkPage(20);
    autoTable(doc, {
      startY: y,
      head: [["Competition", "Date", "Location", "Status"]],
      body: athlete.athletic.competitionCalendar.map(c => [c.name, c.date, c.location, c.status]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 24, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Health & Welfare ──
  sectionTitle("Health & Welfare");
  fieldRow("Medical Clearance", athlete.health.medicalClearance ? `${athlete.health.medicalClearance.status.toUpperCase()} — ${athlete.health.medicalClearance.date}` : "N/A");
  fieldRow("Blood Type", athlete.health.bloodType);
  fieldRow("Allergies", athlete.health.allergies?.join(", ") || "None");
  fieldRow("Medications", athlete.health.medications?.length ? athlete.health.medications.join(", ") : "None");
  y += 4;

  if (athlete.health.insurancePolicies.length) {
    checkPage(20);
    autoTable(doc, {
      startY: y,
      head: [["Type", "Provider", "Policy #", "Expiry", "Cover"]],
      body: athlete.health.insurancePolicies.map(p => [p.type, p.provider, p.policyNumber, p.expiryDate, p.coverAmount]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 24, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Commercial & Legal ──
  sectionTitle("Commercial & Legal");

  if (athlete.commercial.contracts.length) {
    checkPage(14);
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...dark);
    doc.text("Contracts", 24, y); y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Title", "Counterparty", "Type", "Period", "Value", "Status"]],
      body: athlete.commercial.contracts.map(c => [c.title, c.counterparty, c.type, `${c.startDate} — ${c.endDate}`, c.value, c.status]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 3 },
      margin: { left: 24, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (athlete.commercial.sponsors.length) {
    checkPage(14);
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...dark);
    doc.text("Sponsors", 24, y); y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Brand", "Type", "Value", "Period", "Deliverables"]],
      body: athlete.commercial.sponsors.map(s => [s.brand, s.type, s.value, `${s.startDate} — ${s.endDate}`, s.deliverables]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 3 },
      margin: { left: 24, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (athlete.commercial.endorsements.length) {
    checkPage(14);
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...dark);
    doc.text("Endorsements", 24, y); y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Brand", "Category", "Annual Value", "Status"]],
      body: athlete.commercial.endorsements.map(e => [e.brand, e.category, e.annualValue, e.status]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 24, right: 15 },
      didParseCell: (d) => {
        if (d.column.index === 3 && d.section === "body") {
          const v = d.cell.raw as string;
          if (v === "active") d.cell.styles.textColor = green;
          else if (v === "expired") d.cell.styles.textColor = red;
          else d.cell.styles.textColor = amber;
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (athlete.commercial.rateCard?.length) {
    checkPage(14);
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...dark);
    doc.text("Rate Card", 24, y); y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Activity", "Rate", "Currency"]],
      body: athlete.commercial.rateCard.map(r => [r.activity, r.rate, r.currency]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 24, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (athlete.commercial.imageRights.length) {
    checkPage(14);
    doc.setFontSize(10); doc.setFont("helvetica", "bold"); doc.setTextColor(...dark);
    doc.text("Image Rights", 24, y); y += 6;
    autoTable(doc, {
      startY: y,
      head: [["Holder", "Territory", "Expiry"]],
      body: athlete.commercial.imageRights.map(r => [r.holder, r.territory, r.expiryDate]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 24, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Media & Brand ──
  sectionTitle("Media & Brand");
  checkPage(20);
  doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(...dark);
  const bioLines = doc.splitTextToSize(athlete.media.approvedBio, pageWidth - 44);
  doc.text(bioLines, 24, y);
  y += bioLines.length * 5 + 6;

  if (athlete.media.socialMedia.length) {
    autoTable(doc, {
      startY: y,
      head: [["Platform", "Handle", "Followers", "Verified"]],
      body: athlete.media.socialMedia.map(s => [s.platform, s.handle, s.followers, s.verified ? "Yes" : "No"]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 24, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (athlete.media.pressAssets.length) {
    autoTable(doc, {
      startY: y,
      head: [["Type", "Title", "Last Updated"]],
      body: athlete.media.pressAssets.map(a => [a.type.replace("_", " "), a.title, a.lastUpdated]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 24, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Travel & Logistics ──
  sectionTitle("Travel & Logistics");

  if (athlete.travel.passports.length) {
    autoTable(doc, {
      startY: y,
      head: [["Country", "Number", "Expiry", "Biometric"]],
      body: athlete.travel.passports.map(p => [p.country, p.number, p.expiryDate, p.biometricEnabled ? "Yes" : "No"]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 24, right: 15 },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  if (athlete.travel.visas.length) {
    autoTable(doc, {
      startY: y,
      head: [["Country", "Type", "Expiry", "Multi-Entry", "Status"]],
      body: athlete.travel.visas.map(v => [v.country, v.type, v.expiryDate, v.multiEntry ? "Yes" : "No", v.status]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 8 },
      styles: { fontSize: 8, cellPadding: 3 },
      margin: { left: 24, right: 15 },
      didParseCell: (d) => {
        if (d.column.index === 4 && d.section === "body") {
          const v = d.cell.raw as string;
          if (v === "valid") d.cell.styles.textColor = green;
          else if (v === "expired") d.cell.styles.textColor = red;
          else d.cell.styles.textColor = amber;
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  fieldRow("Seat Preference", athlete.travel.travelPreferences.seatPreference);
  fieldRow("Meal Preference", athlete.travel.travelPreferences.mealPreference);
  fieldRow("Frequent Flyer", athlete.travel.travelPreferences.frequentFlyerPrograms.join(", "));
  fieldRow("Hotel Prefs", athlete.travel.travelPreferences.hotelPreferences);
  fieldRow("Special Reqs", athlete.travel.travelPreferences.specialRequirements);
  if (athlete.travel.accessibilityRequirements?.length) {
    fieldRow("Accessibility", athlete.travel.accessibilityRequirements.join("; "));
  }
  y += 4;

  // ── Document Vault ──
  sectionTitle("Document Vault");
  if (athlete.documents.length) {
    autoTable(doc, {
      startY: y,
      head: [["Title", "Category", "Version", "Expiry", "Status", "Uploaded"]],
      body: athlete.documents.map(d => [d.title, d.category, `v${d.version}`, d.expiryDate || "N/A", d.status.replace("_", " "), d.uploadedAt]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 3 },
      margin: { left: 24, right: 15 },
      didParseCell: (d) => {
        if (d.column.index === 4 && d.section === "body") {
          const v = d.cell.raw as string;
          if (v === "current") d.cell.styles.textColor = green;
          else if (v === "expired") d.cell.styles.textColor = red;
          else d.cell.styles.textColor = amber;
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Consent Records ──
  sectionTitle("Consent Records");
  if (athlete.consents.length) {
    autoTable(doc, {
      startY: y,
      head: [["Type", "Description", "Granted", "Expires", "Status"]],
      body: athlete.consents.map(c => [c.type.replace(/_/g, " "), c.description, c.grantedAt, c.expiresAt || "No expiry", c.status]),
      theme: "grid",
      headStyles: { fillColor: gold, textColor: [255, 255, 255], fontSize: 7 },
      styles: { fontSize: 7, cellPadding: 3 },
      margin: { left: 24, right: 15 },
      didParseCell: (d) => {
        if (d.column.index === 4 && d.section === "body") {
          const v = d.cell.raw as string;
          if (v === "granted") d.cell.styles.textColor = green;
          else if (v === "revoked") d.cell.styles.textColor = red;
          else d.cell.styles.textColor = amber;
        }
      },
    });
    y = (doc as any).lastAutoTable.finalY + 10;
  }

  // ── Footer on all pages ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text("CONFIDENTIAL — LegacyBuilder Athlete Profile", 15, pageHeight - 10);
    doc.text(format(new Date(), "yyyy-MM-dd"), pageWidth - 15, pageHeight - 10, { align: "right" });
  }

  const fileName = `AthleteProfile_${athlete.personal.firstName}_${athlete.personal.lastName}_${format(new Date(), "yyyy-MM-dd")}.pdf`;

  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
