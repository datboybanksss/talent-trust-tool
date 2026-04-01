import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Beneficiary, EmergencyContact, LifeFileDocument, DOCUMENT_TYPES } from "@/types/lifeFile";
import { format } from "date-fns";
import { saveAs } from "file-saver";

interface LifeFileExportData {
  beneficiaries: Beneficiary[];
  emergencyContacts: EmergencyContact[];
  documents: LifeFileDocument[];
  userName?: string;
}

export const generateLifeFilePDF = ({
  beneficiaries,
  emergencyContacts,
  documents,
  userName = "User",
}: LifeFileExportData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Header
  doc.setFillColor(26, 46, 36); // Primary dark green
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Life File Summary", 20, 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Prepared for: ${userName}`, 20, 35);
  doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy 'at' h:mm a")}`, pageWidth - 20, 35, { align: "right" });

  yPosition = 55;
  doc.setTextColor(0, 0, 0);

  // Summary Stats
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, yPosition, pageWidth - 30, 25, 3, 3, "F");
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  const statsY = yPosition + 15;
  const statsSpacing = (pageWidth - 30) / 3;
  
  doc.text(`${beneficiaries.length}`, 15 + statsSpacing / 2, statsY, { align: "center" });
  doc.text(`${emergencyContacts.length}`, 15 + statsSpacing * 1.5, statsY, { align: "center" });
  doc.text(`${documents.filter(d => d.status === "complete").length}/${documents.length}`, 15 + statsSpacing * 2.5, statsY, { align: "center" });
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Beneficiaries", 15 + statsSpacing / 2, statsY + 6, { align: "center" });
  doc.text("Emergency Contacts", 15 + statsSpacing * 1.5, statsY + 6, { align: "center" });
  doc.text("Documents Complete", 15 + statsSpacing * 2.5, statsY + 6, { align: "center" });

  yPosition += 40;
  doc.setTextColor(0, 0, 0);

  // Beneficiaries Section
  if (beneficiaries.length > 0) {
    checkPageBreak(40);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 46, 36);
    doc.text("Beneficiaries", 15, yPosition);
    yPosition += 8;

    const totalAllocation = beneficiaries.reduce((sum, b) => sum + (Number(b.allocation_percentage) || 0), 0);
    
    autoTable(doc, {
      startY: yPosition,
      head: [["Name", "Relationship", "Contact", "Allocation"]],
      body: beneficiaries.map((b) => [
        b.full_name,
        b.relationship,
        [b.email, b.phone].filter(Boolean).join("\n") || "-",
        b.allocation_percentage ? `${Number(b.allocation_percentage)}%` : "-",
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [26, 46, 36],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 35 },
        2: { cellWidth: 60 },
        3: { cellWidth: 25, halign: "center" },
      },
      margin: { left: 15, right: 15 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 5;
    
    if (totalAllocation > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(100, 100, 100);
      doc.text(`Total Allocation: ${totalAllocation}%${totalAllocation !== 100 ? " (Note: Should equal 100%)" : ""}`, 15, yPosition);
      yPosition += 10;
    }
  }

  yPosition += 10;

  // Emergency Contacts Section
  if (emergencyContacts.length > 0) {
    checkPageBreak(40);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 46, 36);
    doc.text("Emergency Contacts", 15, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [["Priority", "Name", "Relationship", "Phone", "Email"]],
      body: emergencyContacts.map((c) => [
        c.priority.toString(),
        c.full_name,
        c.relationship,
        c.phone,
        c.email || "-",
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [26, 46, 36],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 20, halign: "center" },
        1: { cellWidth: 40 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
        4: { cellWidth: 50 },
      },
      margin: { left: 15, right: 15 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Documents Section
  if (documents.length > 0) {
    checkPageBreak(40);
    
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 46, 36);
    doc.text("Estate Documents", 15, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [["Document", "Type", "Status", "Expiry Date"]],
      body: documents.map((d) => {
        const docType = DOCUMENT_TYPES.find((t) => t.value === d.document_type);
        const statusLabel = d.status === "complete" ? "✓ Complete" : d.status === "needs-update" ? "⚠ Needs Update" : "✗ Incomplete";
        return [
          d.title,
          docType?.label || d.document_type,
          statusLabel,
          d.expiry_date ? format(new Date(d.expiry_date), "MMM d, yyyy") : "-",
        ];
      }),
      theme: "striped",
      headStyles: {
        fillColor: [26, 46, 36],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 50 },
        2: { cellWidth: 35 },
        3: { cellWidth: 35 },
      },
      margin: { left: 15, right: 15 },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === "body") {
          const status = data.cell.raw as string;
          if (status.includes("Complete")) {
            data.cell.styles.textColor = [34, 139, 34];
          } else if (status.includes("Needs Update")) {
            data.cell.styles.textColor = [255, 165, 0];
          } else {
            data.cell.styles.textColor = [220, 20, 60];
          }
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
    doc.text(
      "CONFIDENTIAL - LegacyBuilder Life File",
      15,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  // Save the PDF
  const fileName = `LifeFile_${userName.replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
};
