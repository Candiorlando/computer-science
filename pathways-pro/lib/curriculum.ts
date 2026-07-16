// ══════════════════════════════════════════════════════════════════════
// Pathways Pro — Vocational Curriculum Engine
//
// Master course catalog, client typology auto-assignment, and per-client
// assignment state. In production the assignment table lives in the DB;
// here we persist to localStorage so the demo round-trips.
// ══════════════════════════════════════════════════════════════════════

/* ── Types ───────────────────────────────────────────────────────────── */

export type ModuleId = "A" | "B" | "C" | "D";

export interface CurriculumCourse {
  /** Stable ID like "A1", "D3" */
  id: string;
  module: ModuleId;
  title: string;
  focus: string;
  description: string;
  /** Estimated duration in minutes */
  durationMin: number;
  lessonCount: number;
}

export interface CurriculumModule {
  id: ModuleId;
  title: string;
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

/* ── Master Course Catalog ──────────────────────────────────────────── */

export const MASTER_CATALOG: CurriculumModule[] = [
  {
    id: "A",
    title: "Foundations & Adjustment",
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
      },
      {
        id: "A3",
        module: "A",
        title: "Self-Advocacy & Disability Disclosure",
        focus: "Knowing your rights under the ADA",
        description:
          "Empowers clients to make informed decisions about disclosure — when, how, and whether to share disability information — while understanding their legal protections under the ADA and Section 504.",
        durationMin: 32,
        lessonCount: 4,
      },
    ],
  },
  {
    id: "B",
    title: "Vocational Exploration & Planning",
    courses: [
      {
        id: "B1",
        module: "B",
        title: "Assessing Your Transferable Skills",
        focus: "Identifying existing strengths",
        description:
          "Guides clients through a structured inventory of their transferable skills — competencies gained from any life role (work, education, caregiving, volunteering) that translate across industries.",
        durationMin: 40,
        lessonCount: 4,
      },
      {
        id: "B2",
        module: "B",
        title: "Labor Market Navigation",
        focus: "Understanding high-demand industries and entry requirements",
        description:
          "Teaches clients to read the labor market: identifying growth industries, evaluating job postings, understanding credential requirements, and localizing opportunity data to their region.",
        durationMin: 35,
        lessonCount: 4,
      },
      {
        id: "B3",
        module: "B",
        title: "Goal Setting for Competitive Integrated Employment",
        focus: "Charting a realistic path to work",
        description:
          "Structured framework for setting SMART vocational goals aligned with Competitive Integrated Employment (CIE) principles — community-based, minimum-wage-or-above, alongside non-disabled peers.",
        durationMin: 30,
        lessonCount: 3,
      },
    ],
  },
  {
    id: "C",
    title: "Work Adjustment & Readiness",
    courses: [
      {
        id: "C1",
        module: "C",
        title: "Modern Resume & Cover Letter Development",
        focus: "Tailoring applications to overcome employment gaps",
        description:
          "Builds functional, ATS-optimized resumes that reframe employment gaps as growth narratives, center transferable skills, and align with modern hiring practices.",
        durationMin: 50,
        lessonCount: 5,
      },
      {
        id: "C2",
        module: "C",
        title: "Interviewing Strategies",
        focus: "Addressing limitations positively",
        description:
          "Practical preparation for behavioral interviews, virtual screenings, and panel formats — including strategies for discussing disability-related gaps with confidence and control.",
        durationMin: 45,
        lessonCount: 5,
      },
      {
        id: "C3",
        module: "C",
        title: "Soft Skills & Workplace Etiquette",
        focus: "Communication, conflict resolution, and time management",
        description:
          "Develops the interpersonal foundation every employer values: active listening, professional communication, constructive conflict resolution, and reliable time management.",
        durationMin: 42,
        lessonCount: 4,
      },
      {
        id: "C4",
        module: "C",
        title: "Digital Literacy Fundamentals",
        focus: "Using modern workplace software and remote work tools",
        description:
          "Covers the digital competencies expected in today's workplace — email etiquette, video conferencing, shared documents, cloud storage, and cybersecurity basics.",
        durationMin: 55,
        lessonCount: 5,
      },
    ],
  },
  {
    id: "D",
    title: "Specialized Demographic Tracks",
    courses: [
      {
        id: "D1",
        module: "D",
        title: "The Workers' Compensation Transition",
        focus: "Navigating return-to-work and role shifting",
        description:
          "Guides individuals through the vocational dimension of workers' compensation: understanding medical clearance, transitioning from physical to sedentary roles, and managing employer relationships during recovery.",
        durationMin: 48,
        lessonCount: 5,
      },
      {
        id: "D2",
        module: "D",
        title: "Youth Transition to Adulthood",
        focus: "Moving from school support to independent employment",
        description:
          "Supports young adults transitioning from IEP-based school systems to independent employment — building self-determination, understanding adult service systems, and developing workplace identity.",
        durationMin: 42,
        lessonCount: 4,
      },
      {
        id: "D3",
        module: "D",
        title: "Re-entering the Workforce",
        focus: "Strategies for caregivers or long-term unemployed",
        description:
          "Helps individuals who have been out of the labor market — whether from caregiving, health, or circumstance — market their life experience, rebuild professional confidence, and navigate re-entry logistics.",
        durationMin: 38,
        lessonCount: 4,
      },
      {
        id: "D4",
        module: "D",
        title: "The Mature Worker Advantage",
        focus: "Combating ageism and updating skills",
        description:
          "Reframes age as an asset: strategies for combating ageism, modernizing a decades-long resume, exploring consulting or part-time models, and leveraging deep institutional knowledge.",
        durationMin: 35,
        lessonCount: 4,
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
    courseIds: ["A1", "A3", "B1", "C2"],
  },
  {
    key: "youth_transition",
    label: "Transitional Youth (School-to-Work)",
    description:
      "Young adults moving from IEP-based school support to independent employment and adult service systems.",
    courseIds: ["A2", "A3", "B3", "C3", "D2"],
  },
  {
    key: "mature_worker",
    label: "Older / Mature Workers",
    description:
      "Experienced workers updating their skills, combating ageism, and exploring alternative employment models.",
    courseIds: ["B1", "C1", "C4", "D4"],
  },
  {
    key: "caregiver_reentry",
    label: "Caregivers Re-entering the Workforce",
    description:
      "Individuals re-entering the labor market after extended absence for caregiving, health, or other life circumstances.",
    courseIds: ["B2", "C1", "C3", "D3"],
  },
  {
    key: "workers_comp",
    label: "Workers' Compensation (Vocational Rehabilitation)",
    description:
      "Individuals in the workers' compensation system navigating return-to-work, role transition, and employer compliance.",
    courseIds: ["A1", "B1", "B2", "C1", "D1"],
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
