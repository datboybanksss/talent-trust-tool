import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Download, FileText, Search, Briefcase, Shield, Handshake, UserCheck, Scale, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, HeadingLevel, BorderStyle, WidthType, ShadingType,
  Header, Footer, PageNumber, TabStopType, TabStopPosition,
} from "docx";
import { saveAs } from "file-saver";

interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ElementType;
  tags: string[];
}

const TEMPLATES: Template[] = [
  {
    id: "athlete-management",
    title: "Athlete Management Agreement",
    description: "Standard agreement between agent and athlete covering representation, commission, duties, and termination clauses.",
    category: "Representation",
    icon: Briefcase,
    tags: ["Athlete", "Representation", "Commission"],
  },
  {
    id: "artist-management",
    title: "Artist Management Agreement",
    description: "Management agreement for artists covering booking, brand deals, royalty splits, and creative control provisions.",
    category: "Representation",
    icon: Briefcase,
    tags: ["Artist", "Management", "Royalties"],
  },
  {
    id: "endorsement-deal",
    title: "Endorsement & Sponsorship Agreement",
    description: "Template for brand endorsement deals including deliverables, usage rights, exclusivity, and payment schedules.",
    category: "Commercial",
    icon: Handshake,
    tags: ["Endorsement", "Sponsorship", "Brand"],
  },
  {
    id: "nda",
    title: "Non-Disclosure Agreement (NDA)",
    description: "Mutual NDA for protecting confidential information during negotiations, partnerships, or business discussions.",
    category: "Legal",
    icon: Shield,
    tags: ["Confidentiality", "Legal", "Protection"],
  },
  {
    id: "image-rights",
    title: "Image Rights Licensing Agreement",
    description: "Agreement for licensing a client\u2019s name, image, and likeness for commercial purposes with defined usage scope.",
    category: "Commercial",
    icon: UserCheck,
    tags: ["Image Rights", "Licensing", "NIL"],
  },
  {
    id: "power-of-attorney",
    title: "Limited Power of Attorney",
    description: "Grants the agent limited authority to act on behalf of the client for specified business and contractual matters.",
    category: "Legal",
    icon: Scale,
    tags: ["Power of Attorney", "Legal", "Authority"],
  },
  {
    id: "termination-notice",
    title: "Termination of Representation Notice",
    description: "Formal notice template for ending an agent-client relationship with proper notice period and handover provisions.",
    category: "Legal",
    icon: FileText,
    tags: ["Termination", "Notice", "Off-boarding"],
  },
  {
    id: "wellness-consent",
    title: "Health & Welfare Consent Form",
    description: "POPIA-compliant consent form for collecting and managing client health, medical, and welfare information.",
    category: "Compliance",
    icon: Heart,
    tags: ["POPIA", "Health", "Consent"],
  },
];

const CATEGORIES = ["All", "Representation", "Commercial", "Legal", "Compliance"];

const generateDocument = async (template: Template) => {
  const now = new Date().toLocaleDateString("en-ZA", { year: "numeric", month: "long", day: "numeric" });

  const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
  const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };
  const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

  const sections: Record<string, { heading: string; clauses: string[] }[]> = {
    "athlete-management": [
      { heading: "1. APPOINTMENT", clauses: [
        "The Client hereby appoints the Agent as their exclusive representative for the purpose of managing their professional sporting career, subject to the terms and conditions set out herein.",
        "The Agent accepts the appointment and agrees to act in the best interests of the Client at all times.",
      ]},
      { heading: "2. SCOPE OF SERVICES", clauses: [
        "The Agent shall provide the following services: (a) Negotiate and manage playing contracts; (b) Source and negotiate endorsement and sponsorship deals; (c) Provide career guidance and strategic advice; (d) Manage media and public relations; (e) Coordinate travel and logistics as required.",
      ]},
      { heading: "3. COMMISSION & FEES", clauses: [
        "The Client agrees to pay the Agent a commission of [____]% of the gross value of all contracts, endorsements, and commercial deals negotiated by the Agent during the term of this Agreement.",
        "Commission shall be payable within [____] days of the Client receiving payment under any such contract.",
      ]},
      { heading: "4. TERM & TERMINATION", clauses: [
        "This Agreement shall commence on the date of signature and shall remain in force for a period of [____] years, unless terminated earlier in accordance with this clause.",
        "Either party may terminate this Agreement by providing [____] months\u2019 written notice to the other party.",
        "Upon termination, the Agent shall remain entitled to commission on any contracts negotiated or substantially progressed during the term of this Agreement.",
      ]},
      { heading: "5. CONFIDENTIALITY", clauses: [
        "Both parties agree to keep confidential all financial, personal, and business information disclosed during the course of this relationship, and shall not disclose such information to any third party without prior written consent.",
      ]},
      { heading: "6. POPIA COMPLIANCE", clauses: [
        "The Agent undertakes to process the Client\u2019s personal information in accordance with the Protection of Personal Information Act, 2013 (POPIA). The Client consents to the processing of their personal information for the purposes outlined in this Agreement.",
      ]},
      { heading: "7. DISPUTE RESOLUTION", clauses: [
        "Any dispute arising from this Agreement shall first be referred to mediation. Should mediation fail, the dispute shall be referred to arbitration in accordance with the rules of the Arbitration Foundation of Southern Africa (AFSA).",
      ]},
      { heading: "8. GOVERNING LAW", clauses: [
        "This Agreement shall be governed by and construed in accordance with the laws of the Republic of South Africa.",
      ]},
    ],
    "artist-management": [
      { heading: "1. APPOINTMENT", clauses: [
        "The Artist hereby appoints the Manager as their exclusive manager for all aspects of their creative and commercial career.",
      ]},
      { heading: "2. SCOPE OF SERVICES", clauses: [
        "The Manager shall: (a) Advise on and negotiate recording, publishing, and distribution agreements; (b) Source brand partnerships and endorsement opportunities; (c) Manage booking and live performance logistics; (d) Oversee social media strategy and public image; (e) Coordinate with legal and financial advisors.",
      ]},
      { heading: "3. COMMISSION & ROYALTIES", clauses: [
        "The Artist agrees to pay the Manager [____]% of gross income derived from all creative and commercial activities managed under this Agreement.",
        "Royalty splits on co-created works shall be agreed in writing on a per-project basis.",
      ]},
      { heading: "4. CREATIVE CONTROL", clauses: [
        "The Artist retains full creative control over all artistic works. The Manager shall not commit the Artist to any creative project without express written approval.",
      ]},
      { heading: "5. TERM & TERMINATION", clauses: [
        "This Agreement is effective for [____] years from the date of signature, renewable by mutual written agreement.",
        "Either party may terminate with [____] months\u2019 written notice.",
      ]},
      { heading: "6. CONFIDENTIALITY & POPIA", clauses: [
        "All personal and financial information shared between the parties shall be treated as confidential and processed in compliance with the Protection of Personal Information Act, 2013.",
      ]},
      { heading: "7. GOVERNING LAW", clauses: [
        "This Agreement is governed by the laws of the Republic of South Africa.",
      ]},
    ],
    "endorsement-deal": [
      { heading: "1. PARTIES", clauses: [
        "This Agreement is entered into between [Brand Name] (\u201cthe Brand\u201d) and [Client Name] (\u201cthe Endorser\u201d), represented by [Agent/Manager Name].",
      ]},
      { heading: "2. SCOPE OF ENDORSEMENT", clauses: [
        "The Endorser agrees to promote the Brand\u2019s products/services through: (a) Social media posts as per the content schedule; (b) Appearances at Brand events; (c) Use of the Endorser\u2019s name, image, and likeness in marketing materials.",
      ]},
      { heading: "3. EXCLUSIVITY", clauses: [
        "During the term, the Endorser shall not endorse competing brands within the [____] product category without prior written consent from the Brand.",
      ]},
      { heading: "4. COMPENSATION", clauses: [
        "The Brand shall pay the Endorser a total fee of R[____], payable as follows: [____]% upon signature; [____]% upon completion of deliverables.",
        "Additional appearances or content beyond the agreed scope shall be compensated at R[____] per engagement.",
      ]},
      { heading: "5. USAGE RIGHTS", clauses: [
        "The Brand is granted a non-exclusive license to use the Endorser\u2019s likeness for [____] months following the campaign period, limited to the territories specified in Schedule A.",
      ]},
      { heading: "6. TERMINATION", clauses: [
        "Either party may terminate with [____] days\u2019 written notice. Morality and reputation clauses apply as set out in Schedule B.",
      ]},
    ],
    "nda": [
      { heading: "1. DEFINITION OF CONFIDENTIAL INFORMATION", clauses: [
        "\"Confidential Information\" means all information disclosed by either party, whether orally, in writing, or electronically, that is designated as confidential or that reasonably should be understood to be confidential given the nature of the information and circumstances of disclosure.",
      ]},
      { heading: "2. OBLIGATIONS", clauses: [
        "The Receiving Party shall: (a) Use the Confidential Information solely for the Purpose; (b) Not disclose to any third party without prior written consent; (c) Protect with the same degree of care used for its own confidential information.",
      ]},
      { heading: "3. EXCLUSIONS", clauses: [
        "Obligations do not apply to information that: (a) Is publicly available; (b) Was known prior to disclosure; (c) Is independently developed; (d) Is required by law to be disclosed.",
      ]},
      { heading: "4. TERM", clauses: [
        "This NDA remains in effect for [____] years from the date of signature.",
      ]},
      { heading: "5. GOVERNING LAW", clauses: [
        "Governed by the laws of the Republic of South Africa.",
      ]},
    ],
    "image-rights": [
      { heading: "1. GRANT OF LICENSE", clauses: [
        "The Client grants to the Licensee a [exclusive/non-exclusive] license to use the Client\u2019s name, image, likeness, and biographical information (\u201cImage Rights\u201d) for the purposes set out herein.",
      ]},
      { heading: "2. PERMITTED USE", clauses: [
        "The Licensee may use the Image Rights for: (a) Advertising and marketing materials; (b) Social media campaigns; (c) Merchandise and product packaging; (d) Such other uses as agreed in writing.",
      ]},
      { heading: "3. TERRITORY & DURATION", clauses: [
        "The license is valid in [territories] for a period of [____] months/years from the Effective Date.",
      ]},
      { heading: "4. COMPENSATION", clauses: [
        "The Licensee shall pay the Client R[____] as a licensing fee, payable [upon signature / in instalments].",
      ]},
      { heading: "5. APPROVAL RIGHTS", clauses: [
        "All materials featuring the Client\u2019s Image Rights must be submitted for approval at least [____] business days before publication or distribution.",
      ]},
    ],
    "power-of-attorney": [
      { heading: "1. GRANT OF AUTHORITY", clauses: [
        "The Client hereby grants the Agent limited power of attorney to act on the Client\u2019s behalf in the following matters: [specify matters].",
      ]},
      { heading: "2. SCOPE LIMITATIONS", clauses: [
        "This power of attorney does not authorise the Agent to: (a) Enter into contracts exceeding R[____] without express approval; (b) Make decisions regarding personal or family matters; (c) Transfer or encumber any property belonging to the Client.",
      ]},
      { heading: "3. DURATION", clauses: [
        "This power of attorney is effective from [date] and shall expire on [date], unless revoked earlier by the Client in writing.",
      ]},
      { heading: "4. REVOCATION", clauses: [
        "The Client may revoke this power of attorney at any time by providing written notice to the Agent.",
      ]},
    ],
    "termination-notice": [
      { heading: "NOTICE OF TERMINATION", clauses: [
        "Dear [Agent/Client Name],",
        "This letter serves as formal notice of termination of the [Agreement Type] dated [Agreement Date] between [Party 1] and [Party 2].",
        "In accordance with Clause [____] of the Agreement, the required notice period of [____] months shall commence from the date of this notice, with the effective termination date being [____].",
        "During the notice period, the following handover procedures shall be observed: (a) All client files and documents shall be returned; (b) Outstanding commissions shall be settled; (c) Ongoing negotiations shall be transitioned as agreed.",
        "We request a meeting to discuss the transition arrangements at your earliest convenience.",
      ]},
    ],
    "wellness-consent": [
      { heading: "1. PURPOSE OF COLLECTION", clauses: [
        "We collect health and welfare information to: (a) Ensure your physical readiness for professional engagements; (b) Coordinate with medical professionals as required; (c) Manage insurance and risk assessments; (d) Comply with sporting body or industry regulations.",
      ]},
      { heading: "2. INFORMATION COLLECTED", clauses: [
        "The following categories of personal information may be collected: Medical history, current medications, allergies, injury records, psychological assessments, disability classifications, insurance policy details, and emergency medical contacts.",
      ]},
      { heading: "3. CONSENT", clauses: [
        "By signing this form, I [Client Name] consent to the collection, storage, and processing of my health and welfare information for the purposes described above, in accordance with the Protection of Personal Information Act, 2013 (POPIA).",
        "I understand that I may withdraw my consent at any time by providing written notice, and that withdrawal of consent does not affect the lawfulness of processing prior to withdrawal.",
      ]},
      { heading: "4. DATA RETENTION", clauses: [
        "Health information will be retained for a period of [____] years after the termination of our professional relationship, or as required by law.",
      ]},
      { heading: "5. ACCESS & CORRECTION", clauses: [
        "You have the right to request access to your personal information and to request correction of any inaccurate information held by us.",
      ]},
    ],
  };

  const templateSections = sections[template.id] || sections["nda"];

  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: template.title.toUpperCase(), bold: true, size: 32, font: "Arial" })],
    })
  );

  // Date & parties
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: `Date: ${now}`, size: 22, font: "Arial", italics: true })],
    })
  );

  children.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: "Between:", bold: true, size: 22, font: "Arial" })],
    })
  );

  // Parties table
  children.push(
    new Paragraph({ spacing: { after: 50 }, children: [] }) // spacer
  );

  const partiesTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2800, 6560],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 2800, type: WidthType.DXA },
            margins: cellMargins,
            shading: { fill: "F0F4F8", type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: "Party 1 (Agent/Manager):", bold: true, size: 20, font: "Arial" })] })],
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 6560, type: WidthType.DXA },
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: "[Full Name / Company Name]", size: 20, font: "Arial" })] })],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders,
            width: { size: 2800, type: WidthType.DXA },
            margins: cellMargins,
            shading: { fill: "F0F4F8", type: ShadingType.CLEAR },
            children: [new Paragraph({ children: [new TextRun({ text: "Party 2 (Client):", bold: true, size: 20, font: "Arial" })] })],
          }),
          new TableCell({
            borders: cellBorders,
            width: { size: 6560, type: WidthType.DXA },
            margins: cellMargins,
            children: [new Paragraph({ children: [new TextRun({ text: "[Full Name]", size: 20, font: "Arial" })] })],
          }),
        ],
      }),
    ],
  });

  children.push(partiesTable as unknown as Paragraph);

  children.push(new Paragraph({ spacing: { before: 300, after: 200 }, children: [] }));

  // Clauses
  for (const section of templateSections) {
    children.push(
      new Paragraph({
        spacing: { before: 300, after: 150 },
        children: [new TextRun({ text: section.heading, bold: true, size: 24, font: "Arial" })],
      })
    );
    for (const clause of section.clauses) {
      children.push(
        new Paragraph({
          spacing: { after: 120 },
          children: [new TextRun({ text: clause, size: 22, font: "Arial" })],
        })
      );
    }
  }

  // Signature block
  children.push(new Paragraph({ spacing: { before: 600 }, children: [] }));
  children.push(
    new Paragraph({
      spacing: { after: 100 },
      children: [new TextRun({ text: "SIGNATURES", bold: true, size: 24, font: "Arial" })],
    })
  );

  const sigTable = new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, margins: cellMargins,
            children: [
              new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: "Signed: ________________________", size: 20, font: "Arial" })] }),
              new Paragraph({ children: [new TextRun({ text: "Name: [Agent/Manager]", size: 20, font: "Arial" })] }),
              new Paragraph({ children: [new TextRun({ text: "Date: _______________", size: 20, font: "Arial" })] }),
            ],
          }),
          new TableCell({
            borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, margins: cellMargins,
            children: [
              new Paragraph({ spacing: { after: 600 }, children: [new TextRun({ text: "Signed: ________________________", size: 20, font: "Arial" })] }),
              new Paragraph({ children: [new TextRun({ text: "Name: [Client]", size: 20, font: "Arial" })] }),
              new Paragraph({ children: [new TextRun({ text: "Date: _______________", size: 20, font: "Arial" })] }),
            ],
          }),
        ],
      }),
    ],
  });

  children.push(sigTable as unknown as Paragraph);

  const doc = new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 22 } } },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: "LegacyBuilder \u2014 Agreement Template", size: 16, font: "Arial", color: "999999", italics: true })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Page ", size: 16, font: "Arial", color: "999999" }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, font: "Arial", color: "999999" }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBlob(doc);
  saveAs(buffer, `${template.title.replace(/\s+/g, "_")}_Template.docx`);
};

const AgreementTemplates = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  const filtered = TEMPLATES.filter((t) => {
    const matchCategory = activeCategory === "All" || t.category === activeCategory;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const handleDownload = async (template: Template) => {
    setDownloading(template.id);
    try {
      await generateDocument(template);
      toast({ title: "Template Downloaded", description: `${template.title} saved as .docx` });
    } catch {
      toast({ title: "Download Failed", description: "Could not generate the document.", variant: "destructive" });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-display font-bold text-foreground">Agreement Templates</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Download editable Word templates for common agreements. Customise them for your clients.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.id} className="border-border/50 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-[10px]">{template.category}</Badge>
                </div>
                <CardTitle className="text-sm mt-3">{template.title}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">{template.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1 mb-4">
                  {template.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] font-normal">{tag}</Badge>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDownload(template)}
                  disabled={downloading === template.id}
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  {downloading === template.id ? "Generating..." : "Download .docx"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No templates match your search.</p>
        </div>
      )}
    </div>
  );
};

export default AgreementTemplates;
