"use client";

export type ExperienceType =
  | "work"
  | "volunteer"
  | "hobby"
  | "education"
  | "caregiving";

export interface Experience {
  id: string;
  type: ExperienceType;
  title: string;
  description: string;
  duration?: string;
}

export interface CoreSkill {
  skill: string;
  category: string;
  evidence: string;
  resumeBullet: string;
}

export interface OccupationSuggestion {
  title: string;
  whyItFits: string;
  startingPoint: string;
}

export interface TSAResult {
  coreSkills: CoreSkill[];
  occupationsToConsider: OccupationSuggestion[];
  gapsToAddress: string[];
  encouragement: string;
  generatedAt: string;
}

const EXPERIENCES_KEY = "pathways-pro:tsa-experiences-v1";
const RESULT_KEY = "pathways-pro:tsa-result-v1";

export function loadExperiences(): Experience[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EXPERIENCES_KEY);
    return raw ? (JSON.parse(raw) as Experience[]) : [];
  } catch {
    return [];
  }
}

export function saveExperiences(exps: Experience[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EXPERIENCES_KEY, JSON.stringify(exps));
}

export function loadTSA(): TSAResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(RESULT_KEY);
    return raw ? (JSON.parse(raw) as TSAResult) : null;
  } catch {
    return null;
  }
}

export function saveTSA(result: TSAResult) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export const EXPERIENCE_TYPE_LABELS: Record<ExperienceType, string> = {
  work: "Paid work",
  volunteer: "Volunteering",
  hobby: "Hobby or personal project",
  education: "Education or training",
  caregiving: "Caregiving (kids, parents, household)",
};

export const EXPERIENCE_TYPE_ICONS: Record<ExperienceType, string> = {
  work: "💼",
  volunteer: "🤝",
  hobby: "🎨",
  education: "📚",
  caregiving: "🏠",
};
