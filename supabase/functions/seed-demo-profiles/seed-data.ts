// Demo seed payload constants. All names are fictional. Generated SA-flavoured
// names are paired with fictional clubs/agencies/labels to avoid collision with
// real PSL/recording-industry figures. If a collision is reported, change
// DEMO_SEED_NAME_SALT secret and re-run the preview.

export const DEMO_EMAILS = {
  athlete: "athlete.demo@themvpbuilder.co.za",
  agent: "agent.demo@themvpbuilder.co.za",
  artist: "artist.demo@themvpbuilder.co.za",
  rugby: "rugby.demo@themvpbuilder.co.za",
  sprinter: "sprinter.demo@themvpbuilder.co.za",
} as const;

export const DEMO_PASSWORD = "DemoSeed!2026#Vault";

// Fictional first/last name pools — common SA surnames, generic firsts.
const FIRST_NAMES_M = ["Sipho", "Themba", "Bongani", "Lwazi", "Kabelo", "Tshepo", "Lerato", "Andile"];
const FIRST_NAMES_F = ["Naledi", "Zinhle", "Palesa", "Refilwe", "Boitumelo", "Asanda"];
const SURNAMES = ["Mkhize", "Dlamini", "Ngcobo", "Maseko", "Mthembu", "Sithole", "Khumalo", "Zuma", "Nkosi", "Mabaso"];
const STAGE_PREFIXES = ["DJ", "MC", "Lil", "King", "Queen"];
const STAGE_ROOTS = ["Velocity", "Echo", "Pulse", "Arc", "Solace", "Verve"];

const FICTIONAL_CLUBS = ["Highveld Lions FC", "Cape Coastal Stormers FC", "Tshwane United AFC", "Drakensberg Eagles FC"];
const FICTIONAL_RUGBY_CLUBS = ["Karoo Vipers RFC", "Boland Brumbies RFC", "Highveld Steelers RFC"];
const FICTIONAL_AGENCIES = ["Apex Talent SA (Pty) Ltd", "Continental Sports Management", "Vista Athlete Partners"];
const FICTIONAL_LABELS = ["Mzansi Soundwave Records", "Indaba House Music", "Highveld Audio Group"];

// Deterministic name picker based on salt
function pickFrom<T>(arr: T[], salt: string, key: string): T {
  let hash = 0;
  const s = `${salt}:${key}`;
  for (let i = 0; i < s.length; i++) hash = (hash * 31 + s.charCodeAt(i)) | 0;
  return arr[Math.abs(hash) % arr.length];
}

export interface DemoNames {
  athlete: { display_name: string; club: string };
  agent: { display_name: string; agency: string };
  artist: { display_name: string; stage_name: string; label: string };
  rugby: { display_name: string; club: string };
  sprinter: { display_name: string };
}

export function generateNames(salt: string): DemoNames {
  return {
    athlete: {
      display_name: `${pickFrom(FIRST_NAMES_M, salt, "ath-f")} ${pickFrom(SURNAMES, salt, "ath-s")}`,
      club: pickFrom(FICTIONAL_CLUBS, salt, "ath-club"),
    },
    agent: {
      display_name: `${pickFrom(FIRST_NAMES_M.concat(FIRST_NAMES_F), salt, "agt-f")} ${pickFrom(SURNAMES, salt, "agt-s")}`,
      agency: pickFrom(FICTIONAL_AGENCIES, salt, "agt-agency"),
    },
    artist: {
      display_name: `${pickFrom(FIRST_NAMES_F, salt, "art-f")} ${pickFrom(SURNAMES, salt, "art-s")}`,
      stage_name: `${pickFrom(STAGE_PREFIXES, salt, "art-pfx")} ${pickFrom(STAGE_ROOTS, salt, "art-root")}`,
      label: pickFrom(FICTIONAL_LABELS, salt, "art-label"),
    },
    rugby: {
      display_name: `${pickFrom(FIRST_NAMES_M, salt, "rug-f")} ${pickFrom(SURNAMES, salt, "rug-s")}`,
      club: pickFrom(FICTIONAL_RUGBY_CLUBS, salt, "rug-club"),
    },
    sprinter: {
      display_name: `${pickFrom(FIRST_NAMES_F, salt, "spr-f")} ${pickFrom(SURNAMES, salt, "spr-s")}`,
    },
  };
}

export const AGENT_SHARE_SECTIONS = ["contracts", "endorsements", "royalties", "documents", "meetings", "contacts"];
export const AGENT_DOC_ALLOWLIST = ["contract", "tax"];
export const SHARE_EXPIRES_AT = "2028-06-30T00:00:00Z";

// Document seed plan per user (document_type + title + sample notes)
export const ATHLETE_DOCS = [
  { document_type: "contract", title: "Player Employment Contract 2024-26" },
  { document_type: "contract", title: "Image Rights Side Agreement" },
  { document_type: "tax", title: "SARS IRP5 2024" },
  { document_type: "tax", title: "Provisional Tax Return Q2 2025" },
  { document_type: "identity", title: "SA ID Document" },
  { document_type: "identity", title: "Passport (Travel)" },
  { document_type: "medical", title: "Pre-season Medical Clearance" },
  { document_type: "medical", title: "Specialist Knee Assessment" },
];

export const ARTIST_DOCS = [
  { document_type: "contract", title: "Recording Agreement (3-album)" },
  { document_type: "contract", title: "Publishing Admin Deal" },
  { document_type: "contract", title: "Sync Placement: Brand Campaign" },
  { document_type: "tax", title: "SARS ITR12 2024" },
  { document_type: "identity", title: "SA ID Document" },
  { document_type: "medical", title: "Vocal Health Check" },
  { document_type: "other", title: "Music Video Treatment Brief" },
];
