import { AthleteFullProfile } from "@/types/athleteProfile";

export const mockAthleteProfiles: AthleteFullProfile[] = [
  // ── Standard Athlete ──
  {
    id: "athlete-001",
    lastUpdated: "2026-03-20",
    profileCompleteness: 87,
    personal: {
      firstName: "Siya",
      lastName: "Kolisi",
      preferredName: "Siya",
      dateOfBirth: "1991-06-16",
      gender: "Male",
      nationality: "South African",
      idNumber: "910616XXXX085",
      passportNumber: "A12345678",
      passportExpiry: "2029-08-15",
      languages: ["English", "Xhosa", "Afrikaans"],
      email: "siya@example.com",
      phone: "+27 81 234 5678",
      address: "Cape Town, Western Cape, South Africa",
      emergencyContacts: [
        { name: "Rachel Kolisi", relationship: "Spouse", phone: "+27 82 111 2222", email: "rachel@example.com" },
      ],
    },
    representation: {
      agentName: "Roc Nation Sports",
      agentCompany: "Roc Nation Sports International",
      mandateType: "Exclusive",
      mandateStart: "2024-01-01",
      mandateEnd: "2027-12-31",
      commissionRate: "15%",
      club: "Sharks",
      federation: "SA Rugby",
      federationId: "SAR-001234",
      antiDopingStatus: "compliant",
      antiDopingLastTest: "2026-02-10",
      whereaboutsSubmitted: true,
    },
    paraAthlete: { enabled: false },
    athletic: {
      sport: "Rugby Union",
      discipline: "Flanker",
      position: "Loosehead Flanker / No. 6",
      currentTeam: "Sharks",
      coach: "John Plumtree",
      coachContact: "coach@sharks.co.za",
      careerStart: "2011",
      performanceHistory: [
        { year: "2019", event: "Rugby World Cup", result: "Winner", achievement: "Captain" },
        { year: "2023", event: "Rugby World Cup", result: "Winner", achievement: "Captain" },
        { year: "2025", event: "United Rugby Championship", result: "Semi-finalist" },
      ],
      rankings: [
        { organization: "World Rugby", ranking: "Top 10 Flankers", asOf: "2026-01" },
      ],
      injuries: [
        { date: "2025-09-01", description: "Knee ligament strain", status: "recovered", returnDate: "2025-11-15" },
      ],
      competitionCalendar: [
        { name: "URC Round 14", date: "2026-04-05", location: "Durban", status: "confirmed" },
        { name: "Springbok June Series", date: "2026-06-14", location: "Johannesburg", status: "tentative" },
      ],
    },
    health: {
      insurancePolicies: [
        { type: "Career-ending Injury", provider: "Santam Sport", policyNumber: "SP-88321", expiryDate: "2027-01-01", coverAmount: "R 10,000,000" },
        { type: "Medical Aid", provider: "Discovery Health", policyNumber: "DH-445566", expiryDate: "2026-12-31", coverAmount: "Unlimited" },
      ],
      medicalClearance: { status: "cleared", date: "2026-03-01" },
      bloodType: "O+",
      allergies: ["None known"],
      medications: [],
    },
    commercial: {
      contracts: [
        { title: "Sharks Player Contract", counterparty: "Sharks Rugby", type: "Team", startDate: "2024-07-01", endDate: "2027-06-30", value: "R 8,500,000/yr", status: "active" },
      ],
      sponsors: [
        { brand: "Nike", type: "Apparel", value: "R 2,000,000/yr", startDate: "2024-01-01", endDate: "2027-12-31", deliverables: "Kit, appearances, social content" },
      ],
      endorsements: [
        { brand: "FNB", category: "Banking", annualValue: "R 1,500,000", status: "active" },
        { brand: "Adidas", category: "Boots", annualValue: "R 500,000", status: "expired" },
      ],
      rateCard: [
        { activity: "Corporate Appearance", rate: "R 150,000", currency: "ZAR" },
        { activity: "Social Media Post", rate: "R 75,000", currency: "ZAR" },
        { activity: "Keynote Speech", rate: "R 200,000", currency: "ZAR" },
      ],
      imageRights: [
        { holder: "Roc Nation", territory: "Global", expiryDate: "2027-12-31" },
      ],
    },
    media: {
      approvedBio: "Siya Kolisi is a South African rugby union player who captained the Springboks to consecutive Rugby World Cup victories in 2019 and 2023. He is widely regarded as one of the most inspirational leaders in world sport.",
      shortBio: "World Cup-winning Springbok captain. Inspirational leader on and off the field.",
      socialMedia: [
        { platform: "Instagram", handle: "@sikikolisi", url: "https://instagram.com/sikikolisi", followers: "2.1M", verified: true },
        { platform: "X", handle: "@SiyaKolisi", url: "https://x.com/SiyaKolisi", followers: "950K", verified: true },
      ],
      pressAssets: [
        { type: "headshot", title: "Official Headshot 2026", lastUpdated: "2026-01-15" },
        { type: "action", title: "Match Action Photos", lastUpdated: "2025-12-01" },
      ],
    },
    travel: {
      passports: [
        { country: "South Africa", number: "A12345678", expiryDate: "2029-08-15", biometricEnabled: true },
      ],
      visas: [
        { country: "United Kingdom", type: "Sporting", expiryDate: "2027-06-30", multiEntry: true, status: "valid" },
        { country: "Schengen", type: "Business", expiryDate: "2026-09-30", multiEntry: true, status: "valid" },
      ],
      travelPreferences: {
        seatPreference: "Aisle, Extra legroom",
        mealPreference: "High protein",
        frequentFlyerPrograms: ["SAA Voyager", "Emirates Skywards"],
        hotelPreferences: "Ground floor, gym access required",
      },
    },
    documents: [
      { id: "doc-1", title: "Player Contract - Sharks", category: "Contracts", tags: ["contract", "team"], version: 2, uploadedAt: "2024-07-01", expiryDate: "2027-06-30", status: "current", fileType: "pdf", uploadedBy: "Agent" },
      { id: "doc-2", title: "Nike Endorsement Agreement", category: "Commercial", tags: ["endorsement", "sponsor"], version: 1, uploadedAt: "2024-01-15", expiryDate: "2027-12-31", status: "current", fileType: "pdf", uploadedBy: "Agent" },
      { id: "doc-3", title: "SA Passport Scan", category: "Travel", tags: ["passport", "identity"], version: 1, uploadedAt: "2025-06-01", expiryDate: "2029-08-15", status: "current", fileType: "pdf", uploadedBy: "Athlete" },
      { id: "doc-4", title: "Medical Clearance Certificate", category: "Health", tags: ["medical", "clearance"], version: 3, uploadedAt: "2026-03-01", status: "current", fileType: "pdf", uploadedBy: "Medical" },
      { id: "doc-5", title: "UK Visa", category: "Travel", tags: ["visa", "uk"], version: 1, uploadedAt: "2025-04-01", expiryDate: "2027-06-30", status: "current", fileType: "pdf", uploadedBy: "Agent" },
      { id: "doc-6", title: "Santam Insurance Policy", category: "Insurance", tags: ["insurance", "career"], version: 1, uploadedAt: "2024-01-01", expiryDate: "2027-01-01", status: "current", fileType: "pdf", uploadedBy: "Agent" },
    ],
    consents: [
      { id: "c-1", type: "data_processing", description: "Processing of personal and performance data", grantedAt: "2024-01-01", status: "granted" },
      { id: "c-2", type: "marketing", description: "Use of name and likeness for sponsor activations", grantedAt: "2024-01-01", expiresAt: "2027-12-31", status: "granted" },
      { id: "c-3", type: "anti_doping", description: "WADA anti-doping consent and whereabouts submissions", grantedAt: "2024-01-01", status: "granted" },
      { id: "c-4", type: "medical_sharing", description: "Sharing medical clearance with coaching staff", grantedAt: "2026-01-01", status: "granted" },
    ],
  },

  // ── Para-Athlete ──
  {
    id: "athlete-002",
    lastUpdated: "2026-03-18",
    profileCompleteness: 92,
    personal: {
      firstName: "Ntando",
      lastName: "Mahlangu",
      preferredName: "Ntando",
      dateOfBirth: "2002-02-09",
      gender: "Male",
      nationality: "South African",
      idNumber: "020209XXXX083",
      passportNumber: "B98765432",
      passportExpiry: "2030-05-20",
      languages: ["English", "Ndebele", "Zulu"],
      email: "ntando@example.com",
      phone: "+27 83 456 7890",
      address: "Pretoria, Gauteng, South Africa",
      emergencyContacts: [
        { name: "Grace Mahlangu", relationship: "Mother", phone: "+27 84 555 6666" },
        { name: "Coach Fourie", relationship: "Head Coach", phone: "+27 82 333 4444" },
      ],
    },
    representation: {
      agentName: "Fortify Sports Management",
      agentCompany: "Fortify Sports",
      mandateType: "Exclusive",
      mandateStart: "2023-06-01",
      mandateEnd: "2028-05-31",
      commissionRate: "12%",
      federation: "Athletics South Africa / Paralympics SA",
      federationId: "ASA-P-00789",
      antiDopingStatus: "compliant",
      antiDopingLastTest: "2026-01-22",
      whereaboutsSubmitted: true,
    },
    paraAthlete: {
      enabled: true,
      disabilityDescription: "Bilateral above-knee amputee (congenital)",
      disabilityType: "Physical – Limb deficiency",
      sportClassification: "T63",
      classificationStatus: "confirmed",
      classificationExpiry: "2028-12-31",
      assistiveDevices: ["Running prosthetics (Ottobock Sprinter)", "Daily use prosthetics", "Racing wheelchair (backup)"],
      accessibilityNeeds: ["Wheelchair-accessible accommodation", "Ground floor or elevator access", "Accessible transport at venue"],
      travelRequirements: ["Extra luggage allowance for prosthetics", "Priority boarding", "Aisle wheelchair for aircraft", "Prosthetic technician travel"],
      supportPersonnel: [
        { name: "Dr. Lize van der Merwe", role: "Prosthetist", phone: "+27 12 345 6789", travelsWith: true },
        { name: "James Mokena", role: "Personal Assistant", phone: "+27 81 987 6543", travelsWith: true },
      ],
    },
    athletic: {
      sport: "Para-Athletics",
      discipline: "Sprints & Long Jump",
      position: "T63 Category",
      currentTeam: "SA Paralympic Team",
      coach: "Kobus Fourie",
      coachContact: "kobus@asacoach.co.za",
      careerStart: "2016",
      performanceHistory: [
        { year: "2020", event: "Tokyo Paralympics", result: "Gold – 200m T61, Silver – Long Jump T63" },
        { year: "2022", event: "World Para Athletics Championships", result: "Gold – 200m T61" },
        { year: "2024", event: "Paris Paralympics", result: "Gold – Long Jump T63, Bronze – 100m T63" },
      ],
      rankings: [
        { organization: "World Para Athletics", ranking: "#1 – Long Jump T63", asOf: "2026-02" },
        { organization: "World Para Athletics", ranking: "#2 – 200m T61", asOf: "2026-02" },
      ],
      injuries: [
        { date: "2025-11-10", description: "Residual limb irritation", status: "managing" },
      ],
      competitionCalendar: [
        { name: "SA Para Athletics Nationals", date: "2026-04-12", location: "Bloemfontein", status: "confirmed" },
        { name: "World Para Athletics GP", date: "2026-05-20", location: "Dubai", status: "confirmed" },
        { name: "Diamond League Exhibition", date: "2026-07-08", location: "London", status: "tentative" },
      ],
    },
    health: {
      insurancePolicies: [
        { type: "Life & Disability", provider: "Old Mutual", policyNumber: "OM-556677", expiryDate: "2027-06-01", coverAmount: "R 5,000,000" },
        { type: "Medical Aid", provider: "Momentum Health", policyNumber: "MH-334455", expiryDate: "2026-12-31", coverAmount: "Comprehensive" },
        { type: "Prosthetics Coverage", provider: "Santam Specialist", policyNumber: "SS-998877", expiryDate: "2027-03-01", coverAmount: "R 2,000,000" },
      ],
      medicalClearance: { status: "cleared", date: "2026-02-15", notes: "Annual clearance – no restrictions" },
      bloodType: "A+",
      allergies: ["Latex (mild)"],
      medications: ["Anti-inflammatory (as needed)"],
      emergencyActionPlan: "1. Contact personal assistant James Mokena. 2. Ensure prosthetics are secured. 3. Contact Dr. van der Merwe for limb-related emergencies. 4. Standard medical protocol.",
    },
    commercial: {
      contracts: [
        { title: "Fortify Management Agreement", counterparty: "Fortify Sports", type: "Management", startDate: "2023-06-01", endDate: "2028-05-31", value: "12% commission", status: "active" },
      ],
      sponsors: [
        { brand: "Ottobock", type: "Technical Partner", value: "R 1,200,000/yr + equipment", startDate: "2024-01-01", endDate: "2027-12-31", deliverables: "Brand ambassador, product development feedback, social content" },
        { brand: "Toyota SA", type: "Mobility Partner", value: "R 800,000/yr", startDate: "2025-01-01", endDate: "2027-06-30", deliverables: "Campaign appearances, adapted vehicle showcase" },
      ],
      endorsements: [
        { brand: "Nike", category: "Apparel", annualValue: "R 600,000", status: "active" },
        { brand: "Herbalife", category: "Nutrition", annualValue: "R 350,000", status: "active" },
      ],
      rateCard: [
        { activity: "Motivational Speech", rate: "R 100,000", currency: "ZAR" },
        { activity: "Brand Campaign", rate: "R 250,000", currency: "ZAR" },
        { activity: "Social Media Post", rate: "R 50,000", currency: "ZAR" },
      ],
      imageRights: [
        { holder: "Fortify Sports", territory: "Africa", expiryDate: "2028-05-31" },
        { holder: "Ottobock", territory: "Global (sport context)", expiryDate: "2027-12-31" },
      ],
    },
    media: {
      approvedBio: "Ntando Mahlangu is a South African Paralympic champion and world record holder in Para-Athletics. Born without legs below the knees, Ntando has become one of the most decorated young athletes in Paralympic history, winning multiple gold medals across the 200m and long jump events.",
      shortBio: "Paralympic champion & world record holder. Inspiring the next generation.",
      socialMedia: [
        { platform: "Instagram", handle: "@ntandomahlangu", url: "https://instagram.com/ntandomahlangu", followers: "520K", verified: true },
        { platform: "TikTok", handle: "@ntandomahlangu", url: "https://tiktok.com/@ntandomahlangu", followers: "1.2M", verified: true },
      ],
      pressAssets: [
        { type: "headshot", title: "Official Portrait 2026", lastUpdated: "2026-01-20" },
        { type: "action", title: "Paris Paralympics Action Shots", lastUpdated: "2024-09-10" },
        { type: "press_release", title: "Ottobock Partnership Announcement", lastUpdated: "2024-01-15" },
      ],
      brandGuidelines: "Always use full name 'Ntando Mahlangu'. Reference disability only in relevant athletic context. Preferred pronouns: he/him.",
    },
    travel: {
      passports: [
        { country: "South Africa", number: "B98765432", expiryDate: "2030-05-20", biometricEnabled: true },
      ],
      visas: [
        { country: "UAE", type: "Sporting Event", expiryDate: "2026-12-31", multiEntry: false, status: "valid" },
        { country: "United Kingdom", type: "Sporting", expiryDate: "2027-12-31", multiEntry: true, status: "valid" },
        { country: "Schengen", type: "Business/Sport", expiryDate: "2027-06-30", multiEntry: true, status: "valid" },
      ],
      travelPreferences: {
        seatPreference: "Aisle, bulkhead preferred for prosthetic storage",
        mealPreference: "Standard / High protein",
        frequentFlyerPrograms: ["SAA Voyager", "Emirates Skywards"],
        hotelPreferences: "Accessible room, roll-in shower, ground floor or elevator",
        specialRequirements: "Wheelchair transfer at airport, extra checked luggage for prosthetics (2 bags min), prosthetic technician travels with athlete",
      },
      accessibilityRequirements: [
        "Wheelchair-accessible transport from airport to venue",
        "Accessible warm-up and competition areas",
        "Prosthetic maintenance space near athlete village",
        "Adapted bathroom facilities",
      ],
    },
    documents: [
      { id: "doc-p1", title: "IPC Classification Card", category: "Classification", tags: ["classification", "para"], version: 2, uploadedAt: "2024-08-01", expiryDate: "2028-12-31", status: "current", fileType: "pdf", uploadedBy: "Agent" },
      { id: "doc-p2", title: "Ottobock Sponsorship Agreement", category: "Commercial", tags: ["sponsor", "prosthetics"], version: 1, uploadedAt: "2024-01-05", expiryDate: "2027-12-31", status: "current", fileType: "pdf", uploadedBy: "Agent" },
      { id: "doc-p3", title: "Medical Clearance 2026", category: "Health", tags: ["medical", "clearance"], version: 1, uploadedAt: "2026-02-15", status: "current", fileType: "pdf", uploadedBy: "Medical" },
      { id: "doc-p4", title: "SA Passport Scan", category: "Travel", tags: ["passport"], version: 1, uploadedAt: "2025-03-10", expiryDate: "2030-05-20", status: "current", fileType: "pdf", uploadedBy: "Athlete" },
      { id: "doc-p5", title: "UK Visa", category: "Travel", tags: ["visa"], version: 1, uploadedAt: "2025-06-01", expiryDate: "2027-12-31", status: "current", fileType: "pdf", uploadedBy: "Agent" },
      { id: "doc-p6", title: "Prosthetics Insurance Policy", category: "Insurance", tags: ["insurance", "prosthetics"], version: 2, uploadedAt: "2025-12-15", expiryDate: "2027-03-01", status: "current", fileType: "pdf", uploadedBy: "Agent" },
      { id: "doc-p7", title: "Accessibility Rider Template", category: "Travel", tags: ["accessibility", "travel"], version: 3, uploadedAt: "2026-01-10", status: "current", fileType: "docx", uploadedBy: "Support" },
    ],
    consents: [
      { id: "c-p1", type: "data_processing", description: "Processing of personal, performance and disability data", grantedAt: "2023-06-01", status: "granted" },
      { id: "c-p2", type: "marketing", description: "Use of name, likeness and disability narrative for sponsor activations", grantedAt: "2024-01-01", expiresAt: "2027-12-31", status: "granted" },
      { id: "c-p3", type: "medical_sharing", description: "Sharing classification and medical data with IPC and event organisers", grantedAt: "2024-01-01", status: "granted" },
      { id: "c-p4", type: "anti_doping", description: "WADA anti-doping consent", grantedAt: "2023-06-01", status: "granted" },
      { id: "c-p5", type: "image_rights", description: "Image rights for Ottobock global campaigns", grantedAt: "2024-01-01", expiresAt: "2027-12-31", status: "granted" },
    ],
  },
];
