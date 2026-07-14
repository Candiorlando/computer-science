"use client";

// Positive psychology messaging — rotating, evidence-aware
// encouragement for the client progress page.
//
// Messages are chosen based on what the client has actually done. We
// don't push generic affirmations to someone who hasn't moved yet, and
// we don't say "great job on your interviews" to someone who hasn't
// reached that stage. Cheap encouragement undermines real progress.

import { loadCaseNotes, type CaseNote } from "./case-notes";

export type EncouragementCategory =
  | "starting"
  | "assessment"
  | "documents"
  | "advocacy"
  | "employment"
  | "persistence"
  | "milestone";

interface EncouragementMessage {
  category: EncouragementCategory;
  text: string;
}

const MESSAGES: EncouragementMessage[] = [
  // Starting (no actions yet)
  {
    category: "starting",
    text: "Every plan starts with a single step. Pick one tool above and begin.",
  },
  {
    category: "starting",
    text: "You're early in this — that's okay. Today's effort builds tomorrow's options.",
  },
  {
    category: "starting",
    text: "Your future self will thank you for showing up here.",
  },

  // Assessment milestones
  {
    category: "assessment",
    text: "You completed an assessment today. That's real, measurable progress.",
  },
  {
    category: "assessment",
    text: "Your interest profile is your map. You just drew it.",
  },
  {
    category: "assessment",
    text: "Self-knowledge is the foundation of a good plan. You're building yours.",
  },

  // Documents generated
  {
    category: "documents",
    text: "A polished document opens doors. You just made one.",
  },
  {
    category: "documents",
    text: "Your effort today brings you closer to your employment goal.",
  },
  {
    category: "documents",
    text: "Great job preparing your application — you're building momentum.",
  },

  // Self-advocacy
  {
    category: "advocacy",
    text: "Standing up for your rights at work takes courage. You're doing it.",
  },
  {
    category: "advocacy",
    text: "Documenting what happens protects your future. You're protecting yourself.",
  },
  {
    category: "advocacy",
    text: "Your voice matters in the workplace. Keep using it.",
  },

  // Employment milestones
  {
    category: "employment",
    text: "Your persistence is paying off — you're moving toward employment.",
  },
  {
    category: "employment",
    text: "Every job application is a step. Keep stepping.",
  },
  {
    category: "employment",
    text: "Showing up matters. You showed up today.",
  },

  // Persistence
  {
    category: "persistence",
    text: "You're making meaningful progress — keep going.",
  },
  {
    category: "persistence",
    text: "Your dedication is opening new opportunities.",
  },
  {
    category: "persistence",
    text: "You're building a strong foundation for your career.",
  },
  {
    category: "persistence",
    text: "Your progress matters — keep going.",
  },

  // Major milestone hits
  {
    category: "milestone",
    text: "🎉 This is a real milestone. Take a minute to mark it.",
  },
  {
    category: "milestone",
    text: "🎉 You did the work and the work paid off. Be proud.",
  },
];

export interface ProgressIndicators {
  goalsIdentified: number;
  tasksCompleted: number;
  jobApplicationsSubmitted: number;
  interviewPrepCompleted: number;
  interviewsAttended: number;
  counselingParticipation: number;
  selfAdvocacyActions: number;
  employmentMilestones: number;
  totalActions: number;
}

export function buildProgress(caseId: string): ProgressIndicators {
  const notes = loadCaseNotes().filter((n) => n.clientCaseId === caseId);
  return {
    goalsIdentified: notes.filter(
      (n) => n.eventKind === "ipe-signed" || n.eventKind === "concept-match-generated",
    ).length,
    tasksCompleted: notes.length,
    jobApplicationsSubmitted: notes.filter(
      (n) => n.eventKind === "resume-generated",
    ).length,
    interviewPrepCompleted: notes.filter(
      (n) => n.activityType.toLowerCase().includes("interview"),
    ).length,
    interviewsAttended: 0, // captured via case-note activity in production
    counselingParticipation: notes.filter(
      (n) => n.eventKind === "interest-profiler-completed" || n.eventKind === "tsa-completed",
    ).length,
    selfAdvocacyActions: notes.filter(
      (n) =>
        n.eventKind === "accommodation-letter-generated" ||
        n.eventKind === "problem-analysis-generated" ||
        n.eventKind === "eeoc-charge-generated" ||
        n.eventKind === "ocr-doj-complaint-generated",
    ).length,
    employmentMilestones: notes.filter(
      (n) =>
        n.eventKind === "partner-placement-accepted" ||
        n.eventKind === "partner-placement-offered" ||
        n.eventKind === "ipe-signed",
    ).length,
    totalActions: notes.length,
  };
}

// Pick an encouragement message anchored to the client's actual
// progress, not generic. Rotates daily within the eligible category.
export function pickEncouragement(notes: CaseNote[]): EncouragementMessage {
  const eligible = categoriesFromNotes(notes);
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (24 * 60 * 60 * 1000),
  );
  // For each eligible category, gather messages, rotate by dayOfYear.
  const pool = MESSAGES.filter((m) => eligible.includes(m.category));
  const list = pool.length > 0 ? pool : MESSAGES.filter((m) => m.category === "starting");
  return list[dayOfYear % list.length];
}

function categoriesFromNotes(notes: CaseNote[]): EncouragementCategory[] {
  const cats = new Set<EncouragementCategory>();
  if (notes.length === 0) {
    cats.add("starting");
    return Array.from(cats);
  }
  for (const n of notes) {
    if (
      n.eventKind === "interest-profiler-completed" ||
      n.eventKind === "tsa-completed"
    )
      cats.add("assessment");
    if (
      n.eventKind === "resume-generated" ||
      n.eventKind === "accommodation-letter-generated"
    )
      cats.add("documents");
    if (
      n.eventKind === "accommodation-letter-generated" ||
      n.eventKind === "problem-analysis-generated" ||
      n.eventKind === "eeoc-charge-generated" ||
      n.eventKind === "ocr-doj-complaint-generated"
    )
      cats.add("advocacy");
    if (
      n.eventKind === "partner-placement-accepted" ||
      n.eventKind === "partner-placement-offered"
    )
      cats.add("employment");
    if (n.eventKind === "ipe-signed") cats.add("milestone");
  }
  if (notes.length >= 5) cats.add("persistence");
  return Array.from(cats);
}
