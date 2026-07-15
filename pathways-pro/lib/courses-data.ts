// Mock data for the client "Courses & Training" center. Swap `coursesData`
// for a database/API fetch later — the components consume these types as-is.

export type ProgressStatus = "not_started" | "in_progress" | "completed";
export type LessonStatus = "completed" | "in_progress" | "not_started" | "locked";
export type AssetKind = "pdf" | "docx" | "xlsx";

export interface CourseAsset {
  id: string;
  name: string;
  kind: AssetKind;
  sizeLabel: string;
  href: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationMin: number;
  status: LessonStatus;
  /** 16:9 embed url (Vimeo/Wistia). Mocked here. */
  videoUrl?: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  durationLabel: string;
  status: ProgressStatus;
  progressPct: number; // 0–100
  lessons: Lesson[];
  assets: CourseAsset[];
}

export const coursesData: TrainingModule[] = [
  {
    id: "resume-masterclass",
    title: "Resume Design Masterclass",
    description:
      "Build a functional, ATS-friendly resume that reframes gaps as strengths and centers your transferable skills.",
    durationLabel: "45 mins",
    status: "in_progress",
    progressPct: 60,
    lessons: [
      { id: "r1", title: "Why the functional format works", durationMin: 6, status: "completed", videoUrl: "https://player.vimeo.com/video/76979871" },
      { id: "r2", title: "Turning history into a skills summary", durationMin: 9, status: "completed", videoUrl: "https://player.vimeo.com/video/76979871" },
      { id: "r3", title: "Writing accomplishment bullets", durationMin: 12, status: "in_progress", videoUrl: "https://player.vimeo.com/video/76979871" },
      { id: "r4", title: "Tailoring for the job posting", durationMin: 10, status: "not_started" },
      { id: "r5", title: "Final review checklist", durationMin: 8, status: "locked" },
    ],
    assets: [
      { id: "a1", name: "Functional Resume Template", kind: "docx", sizeLabel: "38 KB", href: "#" },
      { id: "a2", name: "Action-Verb Worksheet", kind: "pdf", sizeLabel: "120 KB", href: "#" },
    ],
  },
  {
    id: "workplace-accommodations",
    title: "Navigating Workplace Accommodations",
    description:
      "Understand your ADA rights, how to request reasonable accommodations, and how to document the interactive process.",
    durationLabel: "38 mins",
    status: "not_started",
    progressPct: 0,
    lessons: [
      { id: "w1", title: "What counts as a reasonable accommodation", durationMin: 8, status: "not_started", videoUrl: "https://player.vimeo.com/video/76979871" },
      { id: "w2", title: "Making the request in writing", durationMin: 10, status: "not_started" },
      { id: "w3", title: "The interactive process, step by step", durationMin: 12, status: "locked" },
      { id: "w4", title: "If a request is denied", durationMin: 8, status: "locked" },
    ],
    assets: [
      { id: "a3", name: "Accommodation Request Letter", kind: "docx", sizeLabel: "26 KB", href: "#" },
      { id: "a4", name: "ADA Rights One-Pager", kind: "pdf", sizeLabel: "95 KB", href: "#" },
    ],
  },
  {
    id: "interview-confidence",
    title: "Interview Confidence & Communication",
    description:
      "Practice answering common questions, disclosing on your terms, and telling your career story with confidence.",
    durationLabel: "52 mins",
    status: "completed",
    progressPct: 100,
    lessons: [
      { id: "i1", title: "Reframing the “tell me about yourself”", durationMin: 9, status: "completed", videoUrl: "https://player.vimeo.com/video/76979871" },
      { id: "i2", title: "The STAR method for behavioral questions", durationMin: 14, status: "completed", videoUrl: "https://player.vimeo.com/video/76979871" },
      { id: "i3", title: "Handling questions about gaps", durationMin: 11, status: "completed" },
      { id: "i4", title: "Questions to ask them", durationMin: 7, status: "completed" },
    ],
    assets: [
      { id: "a5", name: "Interview Prep Action Plan", kind: "pdf", sizeLabel: "140 KB", href: "#" },
      { id: "a6", name: "Practice Question Bank", kind: "xlsx", sizeLabel: "44 KB", href: "#" },
    ],
  },
  {
    id: "disability-disclosure",
    title: "Disability Disclosure: Your Rights & Choices",
    description:
      "Decide whether, when, and how to disclose — with plain-language scripts and a decision framework.",
    durationLabel: "29 mins",
    status: "not_started",
    progressPct: 0,
    lessons: [
      { id: "d1", title: "Disclosure is your choice", durationMin: 7, status: "not_started", videoUrl: "https://player.vimeo.com/video/76979871" },
      { id: "d2", title: "Timing: application, interview, or on the job", durationMin: 10, status: "not_started" },
      { id: "d3", title: "Scripts you can adapt", durationMin: 12, status: "locked" },
    ],
    assets: [
      { id: "a7", name: "Disclosure Decision Worksheet", kind: "pdf", sizeLabel: "88 KB", href: "#" },
    ],
  },
  {
    id: "digital-skills",
    title: "Digital Skills for the Modern Workplace",
    description:
      "Get comfortable with email, video calls, shared docs, and the everyday tools most jobs now expect.",
    durationLabel: "1 hr 5 mins",
    status: "in_progress",
    progressPct: 25,
    lessons: [
      { id: "g1", title: "Email that gets read", durationMin: 10, status: "completed", videoUrl: "https://player.vimeo.com/video/76979871" },
      { id: "g2", title: "Showing up well on video calls", durationMin: 12, status: "in_progress" },
      { id: "g3", title: "Shared documents & cloud files", durationMin: 15, status: "not_started" },
      { id: "g4", title: "Staying safe: passwords & phishing", durationMin: 13, status: "locked" },
    ],
    assets: [
      { id: "a8", name: "Digital Tools Quick Reference", kind: "pdf", sizeLabel: "160 KB", href: "#" },
    ],
  },
  {
    id: "financial-wellness",
    title: "Financial Wellness & Benefits Planning",
    description:
      "Learn how earned income interacts with benefits (SSI/SSDI, Ticket to Work) so a job doesn't put your support at risk.",
    durationLabel: "41 mins",
    status: "not_started",
    progressPct: 0,
    lessons: [
      { id: "f1", title: "Work incentives overview", durationMin: 11, status: "not_started", videoUrl: "https://player.vimeo.com/video/76979871" },
      { id: "f2", title: "Reporting income the right way", durationMin: 13, status: "locked" },
      { id: "f3", title: "Building a simple budget", durationMin: 10, status: "locked" },
    ],
    assets: [
      { id: "a9", name: "Benefits & Income Planner", kind: "xlsx", sizeLabel: "52 KB", href: "#" },
      { id: "a10", name: "Ticket to Work Explainer", kind: "pdf", sizeLabel: "110 KB", href: "#" },
    ],
  },
];

// ── derived summary (for CourseProgressSummary) ──────────────────────────
export interface CourseSummary {
  totalProgressPct: number;
  completedCount: number;
  totalCount: number;
  upNext: { module: TrainingModule; lesson: Lesson } | null;
}

export function summarize(modules: TrainingModule[]): CourseSummary {
  const totalCount = modules.length;
  const completedCount = modules.filter((m) => m.status === "completed").length;
  const totalProgressPct = totalCount
    ? Math.round(modules.reduce((s, m) => s + m.progressPct, 0) / totalCount)
    : 0;

  // Up next: prefer an in-progress lesson, else the first available not-started.
  let upNext: CourseSummary["upNext"] = null;
  for (const m of modules) {
    const lesson =
      m.lessons.find((l) => l.status === "in_progress") ??
      m.lessons.find((l) => l.status === "not_started");
    if (lesson) {
      upNext = { module: m, lesson };
      if (lesson.status === "in_progress") break; // strongest signal wins
    }
  }
  return { totalProgressPct, completedCount, totalCount, upNext };
}
