// ══════════════════════════════════════════════════════════════════════
// Pathways Pro — Curriculum Engine
//
// Master course catalog, client typology auto-assignment, and per-profile
// assignment state. In production the assignment table lives in the DB;
// here we persist to localStorage so the demo round-trips.
// ══════════════════════════════════════════════════════════════════════

/* ── Types ───────────────────────────────────────────────────────────── */

export type ModuleId = "A" | "B" | "C" | "D" | "E" | "F";
export type CourseAudience = "vocational_client" | "business_client" | "employment_partner" | "agency_partner";

export interface CurriculumCourse {
  /** Stable ID like "A1", "F5" */
  id: string;
  module: ModuleId;
  title: string;
  focus: string;
  description: string;
  /** Estimated duration in minutes */
  durationMin: number;
  lessonCount: number;
  audiences: CourseAudience[];
}

export interface CurriculumModule {
  id: ModuleId;
  title: string;
  audienceLabel: string;
  courses: CurriculumCourse[];
}

export type ClientTypology =
  | "new_disability"
  | "youth_transition"
  | "mature_worker"
  | "caregiver_reentry"
  | "workers_comp";

export interface ClientTypologyDef {
  key: ClientTypology;
  label: string;
  description: string;
  /** Course IDs auto-assigned for this profile */
  courseIds: string[];
}

export type CourseProgress = "not_started" | "in_progress" | "completed";

export interface AssignedCourse {
  courseId: string;
  progress: CourseProgress;
  progressPct: number;
  assignedAt: string; // ISO
}

const VC: CourseAudience[] = ["vocational_client"];
const BUSINESS: CourseAudience[] = ["business_client"];
const PARTNER: CourseAudience[] = ["employment_partner", "agency_partner"];
const BUSINESS_AND_PARTNER: CourseAudience[] = ["business_client", "employment_partner", "agency_partner"];

/* ── Master Course Catalog ──────────────────────────────────────────── */

export const MASTER_CATALOG: CurriculumModule[] = [
  {
    id: "A",
    title: "Foundations & Adjustment",
    audienceLabel: "Vocational Clients",
    courses: [
      {
        id: "A1",
        module: "A",
        title: "Psychosocial Adjustment to Disability",
        focus: "Navigating grief, acceptance, and shifting identity",
        description:
          "Explores the psychosocial landscape of acquired disability — grief cycles, identity reconstruction, and the development of a strengths-based self-concept that supports vocational engagement.",
        durationMin: 45,
        lessonCount: 5,
        audiences: VC,
      },
      {
        id: "A2",
        module: "A",
        title: "Introduction to the World of Employment",
        focus: "Understanding workplace norms, expectations, and culture",
        description:
          "Orients clients to the modern workplace: organizational culture, professional expectations, communication norms, and the unwritten rules that influence success in any industry.",
        durationMin: 38,
        lessonCount: 4,
        audiences: VC,
      },
      {
        id: "A3",
        module: "A",
        title: "Self-Advocacy & Disability Disclosure",
        focus: "Knowing your rights under the ADA and managing accommodations",
        description:
          "Empowers clients to make informed decisions about disclosure — when, how, and whether to share disability information — while understanding their legal protections under the ADA and Section 504.",
        durationMin: 32,
        lessonCount: 4,
        audiences: VC,
      },
      {
        id: "A4",
        module: "A",
        title: "Overcoming Burnout & Emotional Resilience",
        focus: "Staying motivated through long-term career placement journeys",
        description:
          "Practical resilience strategies for navigating slow placement timelines, rejection fatigue, fluctuating symptoms, and the emotional labor of rebuilding vocational identity.",
        durationMin: 40,
        lessonCount: 4,
        audiences: VC,
      },
      {
        id: "A5",
        module: "A",
        title: "Financial Literacy & Benefit Management",
        focus: "Understanding asset limits, Ticket to Work, and earnings impact",
        description:
          "Plain-language benefits education covering asset limits, wage reporting, Ticket to Work, work incentives, and how earned income can be planned without destabilizing essential supports.",
        durationMin: 45,
        lessonCount: 5,
        audiences: VC,
      },
    ],
  },
  {
    id: "B",
    title: "Vocational Exploration & Planning",
    audienceLabel: "Vocational Clients",
    courses: [
      {
        id: "B1",
        module: "B",
        title: "Assessing Your Transferable Skills",
        focus: "Identifying existing strengths and applying them to new roles",
        description:
          "Guides clients through a structured inventory of transferable skills — competencies gained from work, education, caregiving, volunteering, or lived experience that translate across industries.",
        durationMin: 40,
        lessonCount: 4,
        audiences: VC,
      },
      {
        id: "B2",
        module: "B",
        title: "Labor Market Navigation",
        focus: "Understanding high-demand industries, growth sectors, and entry requirements",
        description:
          "Teaches clients to read the labor market: identifying growth industries, evaluating job postings, understanding credential requirements, and localizing opportunity data to their region.",
        durationMin: 35,
        lessonCount: 4,
        audiences: VC,
      },
      {
        id: "B3",
        module: "B",
        title: "Goal Setting for Competitive Integrated Employment (CIE)",
        focus: "Charting a realistic, actionable path to community work",
        description:
          "Structured framework for setting SMART vocational goals aligned with Competitive Integrated Employment principles — community-based, minimum-wage-or-above, alongside non-disabled peers.",
        durationMin: 30,
        lessonCount: 3,
        audiences: VC,
      },
      {
        id: "B4",
        module: "B",
        title: "Navigating Digital Job Portals",
        focus: "Master modern ATS systems, job boards, and online profiles",
        description:
          "Builds confidence with modern job-search infrastructure: applicant tracking systems, online profiles, job alerts, accessible applications, and follow-up workflows.",
        durationMin: 45,
        lessonCount: 5,
        audiences: VC,
      },
      {
        id: "B5",
        module: "B",
        title: "Micro-Internships & Gig Work Tracking",
        focus: "Using project-based work to build a diverse modern resume",
        description:
          "Shows clients how to document short-term projects, micro-internships, volunteer work, and gig assignments as credible experience that demonstrates capacity and momentum.",
        durationMin: 35,
        lessonCount: 4,
        audiences: VC,
      },
    ],
  },
  {
    id: "C",
    title: "Work Adjustment & Readiness",
    audienceLabel: "Vocational Clients",
    courses: [
      {
        id: "C1",
        module: "C",
        title: "Modern Resume & Cover Letter Development",
        focus: "Tailoring applications to effectively bridge employment gaps",
        description:
          "Builds functional, ATS-optimized resumes that reframe employment gaps as growth narratives, center transferable skills, and align with modern hiring practices.",
        durationMin: 50,
        lessonCount: 5,
        audiences: VC,
      },
      {
        id: "C2",
        module: "C",
        title: "Interviewing Strategies",
        focus: "Addressing physical or mental limitations positively and confidently",
        description:
          "Practical preparation for behavioral interviews, virtual screenings, and panel formats — including strategies for discussing disability-related gaps with confidence and control.",
        durationMin: 45,
        lessonCount: 5,
        audiences: VC,
      },
      {
        id: "C3",
        module: "C",
        title: "Soft Skills & Workplace Etiquette",
        focus: "Professional communication, conflict resolution, and collaborative teamwork",
        description:
          "Develops the interpersonal foundation every employer values: active listening, professional communication, constructive conflict resolution, teamwork, and reliable time management.",
        durationMin: 42,
        lessonCount: 4,
        audiences: VC,
      },
      {
        id: "C4",
        module: "C",
        title: "Digital Literacy Fundamentals",
        focus: "Mastery of remote collaboration, communication stacks, and cloud suites",
        description:
          "Covers the digital competencies expected in today's workplace — email etiquette, video conferencing, shared documents, cloud storage, cybersecurity basics, and remote collaboration.",
        durationMin: 55,
        lessonCount: 5,
        audiences: VC,
      },
      {
        id: "C5",
        module: "C",
        title: "Managing Sensory & Focus Challenges at Work",
        focus: "Environmental hacks, pacing, and ergonomic self-advocacy",
        description:
          "Practical strategies for managing sensory load, attention fatigue, executive-function demands, pacing, workspace adaptations, and respectful self-advocacy in varied work environments.",
        durationMin: 40,
        lessonCount: 4,
        audiences: VC,
      },
    ],
  },
  {
    id: "D",
    title: "Specialized Demographic Tracks",
    audienceLabel: "Vocational Clients",
    courses: [
      {
        id: "D1",
        module: "D",
        title: "The Workers' Compensation Transition",
        focus: "Navigating return-to-work protocols, physical limitations, and role shifting",
        description:
          "Guides individuals through the vocational dimension of workers' compensation: medical clearance, physical limitations, role transition, and employer relationships during recovery.",
        durationMin: 48,
        lessonCount: 5,
        audiences: VC,
      },
      {
        id: "D2",
        module: "D",
        title: "Youth Transition to Adulthood",
        focus: "Moving from school-based IEP/504 supports to competitive independent employment",
        description:
          "Supports young adults transitioning from school systems to independent employment — building self-determination, understanding adult services, and developing workplace identity.",
        durationMin: 42,
        lessonCount: 4,
        audiences: VC,
      },
      {
        id: "D3",
        module: "D",
        title: "Re-entering the Workforce",
        focus: "Strategic positioning for returning caregivers, justice-involved individuals, or long-term unemployed",
        description:
          "Helps individuals who have been out of the labor market market their life experience, rebuild professional confidence, and navigate re-entry logistics.",
        durationMin: 38,
        lessonCount: 4,
        audiences: VC,
      },
      {
        id: "D4",
        module: "D",
        title: "The Mature Worker Advantage",
        focus: "Combating ageism, updating digital skillsets, and pivoting fields",
        description:
          "Reframes age as an asset: strategies for combating ageism, modernizing a decades-long resume, exploring consulting or part-time models, and leveraging institutional knowledge.",
        durationMin: 35,
        lessonCount: 4,
        audiences: VC,
      },
    ],
  },
  {
    id: "E",
    title: "Corporate Leadership & Retention",
    audienceLabel: "Business & Corporate Clients",
    courses: [
      {
        id: "E1",
        module: "E",
        title: "Workplace Neurodiversity & Mental Health Inclusion",
        focus: "Structuring environments for neurodivergent employees and mental health integration",
        description:
          "Helps corporate leaders design management practices, communication norms, and environmental supports that sustain neurodivergent employees and normalize behavioral health needs at work.",
        durationMin: 45,
        lessonCount: 4,
        audiences: BUSINESS,
      },
      {
        id: "E2",
        module: "E",
        title: "Navigating Reasonable Accommodations Under the ADA",
        focus: "Practical frameworks for HR to manage accommodation requests seamlessly",
        description:
          "A structured HR playbook for intake, documentation, interactive-process meetings, confidentiality boundaries, undue hardship analysis, and respectful implementation of accommodations.",
        durationMin: 50,
        lessonCount: 5,
        audiences: BUSINESS,
      },
      {
        id: "E3",
        module: "E",
        title: "Ergonomics & Environmental Universal Design",
        focus: "Minor structural adjustments that maximize retention and reduce Workers' Comp claims",
        description:
          "Shows employers how ergonomic reviews, universal design, task redesign, and early intervention reduce injury risk, improve retention, and support productive return-to-work transitions.",
        durationMin: 40,
        lessonCount: 4,
        audiences: BUSINESS,
      },
      {
        id: "E4",
        module: "E",
        title: "De-escalation & Crisis Management for Managers",
        focus: "Equipping leaders to handle behavioral health crises or acute stress in the workplace",
        description:
          "Equips managers with trauma-informed de-escalation scripts, safety planning boundaries, referral pathways, and documentation practices that protect both employees and organizations.",
        durationMin: 45,
        lessonCount: 4,
        audiences: BUSINESS,
      },
    ],
  },
  {
    id: "F",
    title: "Strategic Alliances & Civic Engagement",
    audienceLabel: "Employment Partners & Agencies",
    courses: [
      {
        id: "F1",
        module: "F",
        title: "The Economics of Inclusion: WOTC & Financial Incentives",
        focus: "Maximizing WOTC and state-subsidized training funds",
        description:
          "Explains the Work Opportunity Tax Credit, state-supported training programs, documentation timing, and how inclusive hiring can generate measurable financial and civic value.",
        durationMin: 40,
        lessonCount: 4,
        audiences: BUSINESS_AND_PARTNER,
      },
      {
        id: "F2",
        module: "F",
        title: "Social Enterprise & Subcontracting Architecture",
        focus: "Designing paid work experiences, apprenticeships, and social vendor partnerships",
        description:
          "Guides partners through creating scoped, paid work experiences and subcontracting pathways that build resumes, strengthen CSR outcomes, and create sustainable community partnerships.",
        durationMin: 45,
        lessonCount: 5,
        audiences: BUSINESS_AND_PARTNER,
      },
      {
        id: "F3",
        module: "F",
        title: "Civic Engagement & Inclusive Workforce Branding",
        focus: "Positioning your entity as an ethical, civic leader",
        description:
          "Shows employers and agencies how community-based workforce development can strengthen brand trust, stakeholder reporting, and public commitments to equity and belonging.",
        durationMin: 35,
        lessonCount: 3,
        audiences: BUSINESS_AND_PARTNER,
      },
      {
        id: "F4",
        module: "F",
        title: "Pre-ETS Collaboration for Community Employers",
        focus: "Building early-stage youth talent pipelines at no raw wage cost",
        description:
          "Explains how local employers can partner with agencies to host work-based learning, job exploration, informational interviews, and scaffolded Pre-ETS experiences for young adults.",
        durationMin: 45,
        lessonCount: 4,
        audiences: PARTNER,
      },
      {
        id: "F5",
        module: "F",
        title: "The Olmstead Framework & CIE Alignment",
        focus: "Aligning community-agency and business metrics with federal integration standards",
        description:
          "Introduces Olmstead, Competitive Integrated Employment, community integration, and the metrics partners need to ensure programs advance dignity, autonomy, and federal compliance.",
        durationMin: 50,
        lessonCount: 5,
        audiences: PARTNER,
      },
    ],
  },
];

/** Flat lookup of every course by ID */
export const COURSE_MAP: Record<string, CurriculumCourse> = {};
for (const mod of MASTER_CATALOG) {
  for (const c of mod.courses) {
    COURSE_MAP[c.id] = c;
  }
}

export const ALL_COURSE_IDS = Object.keys(COURSE_MAP);

/* ── Client Typologies & Auto-Assignment ────────────────────────────── */

export const CLIENT_TYPOLOGIES: ClientTypologyDef[] = [
  {
    key: "new_disability",
    label: "Adjustment to a New Disability",
    description:
      "Individuals navigating a recently acquired disability, focusing on psychosocial adjustment and vocational re-orientation.",
    courseIds: ["A1", "A3", "A4", "B1", "C2", "C5", "A5"],
  },
  {
    key: "youth_transition",
    label: "Transitional Youth (School-to-Work)",
    description:
      "Young adults moving from IEP-based school support to independent employment and adult service systems.",
    courseIds: ["A2", "A3", "B3", "B4", "C3", "C4", "D2"],
  },
  {
    key: "mature_worker",
    label: "Older / Mature Workers",
    description:
      "Experienced workers updating their skills, combating ageism, and exploring alternative employment models.",
    courseIds: ["B1", "B4", "C1", "C4", "D4"],
  },
  {
    key: "caregiver_reentry",
    label: "Caregivers Re-entering the Workforce",
    description:
      "Individuals re-entering the labor market after extended absence for caregiving, health, or other life circumstances.",
    courseIds: ["B2", "B5", "C1", "C3", "D3", "A5"],
  },
  {
    key: "workers_comp",
    label: "Workers' Compensation (Vocational Rehabilitation)",
    description:
      "Individuals in the workers' compensation system navigating return-to-work, role transition, and employer compliance.",
    courseIds: ["A1", "A4", "B1", "B2", "C1", "C5", "D1"],
  },
];

export const TYPOLOGY_MAP: Record<ClientTypology, ClientTypologyDef> = {} as any;
for (const t of CLIENT_TYPOLOGIES) {
  TYPOLOGY_MAP[t.key] = t;
}

/** Return course IDs for a given typology */
export function autoAssignCourses(typology: ClientTypology): string[] {
  return TYPOLOGY_MAP[typology]?.courseIds ?? [];
}

/* ── Per-Client Assignment State (localStorage) ─────────────────────── */

const ASSIGNMENTS_KEY = "pathways-pro:curriculum-assignments-v1";

interface AssignmentStore {
  /** Keyed by client email */
  [clientEmail: string]: {
    typology: ClientTypology | null;
    autoAssign: boolean;
    courses: AssignedCourse[];
  };
}

function loadStore(): AssignmentStore {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ASSIGNMENTS_KEY);
    return raw ? (JSON.parse(raw) as AssignmentStore) : {};
  } catch {
    return {};
  }
}

function saveStore(store: AssignmentStore) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(store));
}

/** Ensure a client has an entry; seed from typology if first visit. */
export function ensureClientAssignments(
  clientEmail: string,
  typology?: ClientTypology,
): AssignedCourse[] {
  const store = loadStore();
  if (!store[clientEmail]) {
    const courseIds = typology ? autoAssignCourses(typology) : [];
    store[clientEmail] = {
      typology: typology ?? null,
      autoAssign: true,
      courses: courseIds.map((id) => ({
        courseId: id,
        progress: "not_started",
        progressPct: 0,
        assignedAt: new Date().toISOString(),
      })),
    };
    saveStore(store);
  }
  return store[clientEmail].courses;
}

/** Get current assignments for a client. */
export function getClientAssignments(clientEmail: string): AssignedCourse[] {
  const store = loadStore();
  return store[clientEmail]?.courses ?? [];
}

/** Get typology for a client. */
export function getClientTypology(
  clientEmail: string,
): ClientTypology | null {
  const store = loadStore();
  return store[clientEmail]?.typology ?? null;
}

/** Set typology and optionally re-run auto-assignment. */
export function setClientTypology(
  clientEmail: string,
  typology: ClientTypology,
  autoAssign: boolean,
) {
  const store = loadStore();
  const existing = store[clientEmail]?.courses ?? [];
  const existingIds = new Set(existing.map((c) => c.courseId));

  if (autoAssign) {
    const newIds = autoAssignCourses(typology).filter(
      (id) => !existingIds.has(id),
    );
    const newCourses: AssignedCourse[] = newIds.map((id) => ({
      courseId: id,
      progress: "not_started",
      progressPct: 0,
      assignedAt: new Date().toISOString(),
    }));
    store[clientEmail] = {
      typology,
      autoAssign,
      courses: [...existing, ...newCourses],
    };
  } else {
    store[clientEmail] = {
      ...store[clientEmail],
      typology,
      autoAssign,
    };
  }
  saveStore(store);
}

/** Add a single course to a client. */
export function assignCourse(clientEmail: string, courseId: string) {
  const store = loadStore();
  if (!store[clientEmail]) {
    store[clientEmail] = { typology: null, autoAssign: false, courses: [] };
  }
  if (store[clientEmail].courses.some((c) => c.courseId === courseId)) return;
  store[clientEmail].courses.push({
    courseId,
    progress: "not_started",
    progressPct: 0,
    assignedAt: new Date().toISOString(),
  });
  saveStore(store);
}

/** Remove a course from a client. */
export function unassignCourse(clientEmail: string, courseId: string) {
  const store = loadStore();
  if (!store[clientEmail]) return;
  store[clientEmail].courses = store[clientEmail].courses.filter(
    (c) => c.courseId !== courseId,
  );
  saveStore(store);
}

/** Update progress on a course. */
export function updateCourseProgress(
  clientEmail: string,
  courseId: string,
  progress: CourseProgress,
  progressPct: number,
) {
  const store = loadStore();
  if (!store[clientEmail]) return;
  const course = store[clientEmail].courses.find(
    (c) => c.courseId === courseId,
  );
  if (course) {
    course.progress = progress;
    course.progressPct = progressPct;
  }
  saveStore(store);
}
