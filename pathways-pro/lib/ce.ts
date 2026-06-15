// Continuing Education (CE) — CRC renewal tracking.
// CRCC requires 100 CE hours per 5-year cycle, including ≥10 ethics hours.
// LPC (Illinois): 30 hours per 2-year cycle, including 3 ethics.

export type CECategory =
  | "ethics"
  | "clinical"
  | "assessment"
  | "case-management"
  | "diversity"
  | "supervision"
  | "general";

export interface CECourse {
  id: string;
  title: string;
  provider: string;
  hours: number;
  category: CECategory;
  format: "Online · Self-paced" | "Online · Live" | "In-person" | "Hybrid";
  cost: string;
  url: string;
  crcApproved: boolean;
  lpcIllinoisApproved: boolean;
  description: string;
}

export interface CELogEntry {
  courseId: string;
  completedAt: string; // ISO
  hoursEarned: number; // copied from course at log time (in case course changes later)
  certificateUrl?: string;
  notes?: string;
}

// Curated catalog. URLs link to the issuing provider's program directory —
// some require login or registration. Hours and approval status verified
// against published 2025–2026 cycles as of June 2026.
export const CE_CATALOG: CECourse[] = [
  {
    id: "crcc-ethics-2026",
    title: "CRCC Code of Professional Ethics — 2026 Update",
    provider: "CRCC",
    hours: 10,
    category: "ethics",
    format: "Online · Self-paced",
    cost: "$95",
    url: "https://crccertification.com/ethics-ce/",
    crcApproved: true,
    lpcIllinoisApproved: true,
    description:
      "Required ethics CE covering the 2026 revisions to the CRCC Code. Satisfies the full 10-hour CRC ethics requirement for the cycle.",
  },
  {
    id: "ncrtm-motivational-interviewing",
    title: "Motivational Interviewing in VR Settings",
    provider: "NCRTM",
    hours: 6,
    category: "clinical",
    format: "Online · Self-paced",
    cost: "Free",
    url: "https://ncrtm.ed.gov/",
    crcApproved: true,
    lpcIllinoisApproved: true,
    description:
      "Practical MI techniques for VR consumer engagement — building autonomy, working with ambivalence, eliciting change talk.",
  },
  {
    id: "iarp-tsa-workshop",
    title: "Transferable Skills Analysis Workshop",
    provider: "IARP",
    hours: 8,
    category: "assessment",
    format: "Online · Live",
    cost: "$185",
    url: "https://www.rehabpro.org/",
    crcApproved: true,
    lpcIllinoisApproved: false,
    description:
      "Hands-on TSA using DOT and O*NET. Includes case study practice and report writing for IPE documentation.",
  },
  {
    id: "askjan-workplace-accommodations",
    title: "Workplace Accommodations Master Class",
    provider: "AskJAN / ODEP",
    hours: 4,
    category: "case-management",
    format: "Online · Self-paced",
    cost: "Free",
    url: "https://askjan.org/training/",
    crcApproved: true,
    lpcIllinoisApproved: false,
    description:
      "Mental health, mobility, sensory, and cognitive accommodations. AskJAN's SOAR tool walkthrough and case studies.",
  },
  {
    id: "csavr-wioa-update",
    title: "WIOA Title IV Performance Update 2026",
    provider: "CSAVR",
    hours: 6,
    category: "case-management",
    format: "Online · Live",
    cost: "$125",
    url: "https://www.csavr.org/",
    crcApproved: true,
    lpcIllinoisApproved: false,
    description:
      "RSA-911 performance reporting, common error codes, and FY2026 standards. Required-feeling for state VR staff.",
  },
  {
    id: "ararc-cultural-humility",
    title: "Cultural Humility in Rehabilitation Counseling",
    provider: "ARCA",
    hours: 5,
    category: "diversity",
    format: "Online · Self-paced",
    cost: "$75",
    url: "https://arcaweb.org/",
    crcApproved: true,
    lpcIllinoisApproved: true,
    description:
      "Working across race, language, immigration status, and disability identity. Includes self-reflection exercises.",
  },
  {
    id: "wipa-benefits-basics",
    title: "SSA Benefits Counseling Essentials (WIPA Path)",
    provider: "VCU-NTC / WIPA",
    hours: 10,
    category: "clinical",
    format: "Online · Self-paced",
    cost: "Free",
    url: "https://choosework.ssa.gov/wipa-training",
    crcApproved: true,
    lpcIllinoisApproved: false,
    description:
      "SSDI/SSI work incentives, Ticket to Work, PASS, IRWE, and the SSA Red Book. Foundational for IPE benefits planning.",
  },
  {
    id: "crcc-pre-ets",
    title: "Pre-ETS Service Delivery for Transition-Age Youth",
    provider: "CRCC",
    hours: 7,
    category: "case-management",
    format: "Hybrid",
    cost: "$140",
    url: "https://crccertification.com/",
    crcApproved: true,
    lpcIllinoisApproved: false,
    description:
      "All five Pre-ETS required activities, IEP-to-IPE handoff, working with school transition coordinators.",
  },
  {
    id: "atia-assistive-tech",
    title: "Assistive Technology for Employment: Foundations",
    provider: "ATIA",
    hours: 6,
    category: "assessment",
    format: "Online · Self-paced",
    cost: "$120",
    url: "https://www.atia.org/education/",
    crcApproved: true,
    lpcIllinoisApproved: false,
    description:
      "AT evaluation process, common solutions for visual / mobility / cognitive limitations, and funding pathways.",
  },
  {
    id: "ilru-il-philosophy",
    title: "Independent Living Philosophy and the VR Counselor",
    provider: "ILRU",
    hours: 4,
    category: "general",
    format: "Online · Self-paced",
    cost: "Free",
    url: "https://www.ilru.org/training/",
    crcApproved: true,
    lpcIllinoisApproved: true,
    description:
      "Cross-walking IL principles with VR service delivery; collaborating with Centers for Independent Living.",
  },
  {
    id: "crcc-supervision",
    title: "Clinical Supervision in Rehabilitation Counseling",
    provider: "CRCC",
    hours: 6,
    category: "supervision",
    format: "Online · Live",
    cost: "$150",
    url: "https://crccertification.com/",
    crcApproved: true,
    lpcIllinoisApproved: true,
    description:
      "For CRC-CCs and counselors supervising interns. Covers Bernard's Discrimination Model and CRCC supervision ethics.",
  },
  {
    id: "nida-trauma-informed",
    title: "Trauma-Informed Care for Disability Populations",
    provider: "NIDILRR / ACL",
    hours: 8,
    category: "clinical",
    format: "Online · Self-paced",
    cost: "Free",
    url: "https://acl.gov/programs/research-and-development/nidilrr",
    crcApproved: true,
    lpcIllinoisApproved: true,
    description:
      "Trauma's intersection with disability acquisition, secondary disabling conditions, and VR engagement.",
  },
];

// CE renewal cycle definitions (used for progress calculation).
// In production this would be per-credential and per-state.
export interface CycleProgress {
  cycleName: string;
  totalRequired: number;
  totalEarned: number;
  ethicsRequired: number;
  ethicsEarned: number;
  cycleEnds: string;
  daysRemaining: number;
}

const LOG_KEY_PREFIX = "pathways-pro:ce-log:v1:";

export function loadCELog(counselorEmail: string): CELogEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOG_KEY_PREFIX + counselorEmail);
    return raw ? (JSON.parse(raw) as CELogEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveCELog(counselorEmail: string, log: CELogEntry[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    LOG_KEY_PREFIX + counselorEmail,
    JSON.stringify(log),
  );
}

export function addCELog(counselorEmail: string, entry: CELogEntry) {
  const cur = loadCELog(counselorEmail);
  saveCELog(counselorEmail, [entry, ...cur]);
}

export function removeCELog(counselorEmail: string, completedAt: string) {
  const cur = loadCELog(counselorEmail);
  saveCELog(
    counselorEmail,
    cur.filter((e) => e.completedAt !== completedAt),
  );
}

export function computeCycleProgress(
  log: CELogEntry[],
  cycleStart = "2024-12-01",
  cycleMonths = 60, // CRC: 5-year cycle
  totalRequired = 100,
  ethicsRequired = 10,
): CycleProgress {
  const start = new Date(cycleStart);
  const end = new Date(start);
  end.setMonth(end.getMonth() + cycleMonths);

  const inCycle = log.filter((e) => {
    const at = new Date(e.completedAt);
    return at >= start && at <= end;
  });

  const totalEarned = inCycle.reduce((s, e) => s + e.hoursEarned, 0);
  const ethicsEarned = inCycle
    .filter((e) => {
      const c = CE_CATALOG.find((x) => x.id === e.courseId);
      return c?.category === "ethics";
    })
    .reduce((s, e) => s + e.hoursEarned, 0);

  const daysRemaining = Math.max(
    0,
    Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );

  return {
    cycleName: "CRC 2024–2029",
    totalRequired,
    totalEarned,
    ethicsRequired,
    ethicsEarned,
    cycleEnds: end.toISOString().slice(0, 10),
    daysRemaining,
  };
}

export const CATEGORY_LABELS: Record<CECategory, string> = {
  ethics: "Ethics",
  clinical: "Clinical Practice",
  assessment: "Vocational Assessment",
  "case-management": "Case Management",
  diversity: "Diversity & Culture",
  supervision: "Supervision",
  general: "General",
};
