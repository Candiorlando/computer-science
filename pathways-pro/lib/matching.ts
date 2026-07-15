"use client";

// Counselor ↔ client matching (feature 1). Client intake preferences are
// scored against counselor match profiles to rank the accepting pool. The
// human still confirms the assignment — we surface ranked options, we don't
// auto-assign a clinical relationship.

import { COUNSELORS, type CounselorUser } from "./users";

export const COMM_STYLES = [
  "Collaborative",
  "Structured",
  "Motivational",
  "Direct",
  "Trauma-informed",
] as const;
export type CommStyle = (typeof COMM_STYLES)[number];

export const SPECIALTIES = [
  "Mental health",
  "Physical disability",
  "Youth & transition",
  "Autism & IDD",
  "Recovery & SUD",
  "Return-to-work / forensic",
] as const;
export type Specialty = (typeof SPECIALTIES)[number];

export const LANGUAGES = ["English", "Spanish", "ASL"] as const;
export type Language = (typeof LANGUAGES)[number];

export const TIME_WINDOWS = ["Mornings", "Afternoons", "Evenings", "Weekends"] as const;
export type TimeWindow = (typeof TIME_WINDOWS)[number];

export interface MatchPreference {
  preferredStyles: CommStyle[];
  preferredSpecialties: Specialty[];
  languages: Language[];
  windows: TimeWindow[];
}

export interface CounselorMatchProfile {
  email: string;
  name: string;
  credentials: string;
  styles: CommStyle[];
  specialties: Specialty[];
  languages: Language[];
  windows: TimeWindow[];
  acceptingClients: boolean;
}

// Deterministic demo attributes so matching produces meaningful, varied
// results. In production these live on CounselorProfile in the database.
const SEED: Record<string, Omit<CounselorMatchProfile, "email" | "name" | "credentials">> = {
  "candace.metcalf@pathwayspro.app": {
    styles: ["Collaborative", "Trauma-informed"],
    specialties: ["Mental health", "Return-to-work / forensic"],
    languages: ["English"],
    windows: ["Mornings", "Afternoons"],
    acceptingClients: true,
  },
  "demo.counselor@pathwayspro.app": {
    styles: ["Collaborative", "Motivational"],
    specialties: ["Mental health", "Youth & transition"],
    languages: ["English", "Spanish"],
    windows: ["Mornings", "Afternoons", "Evenings"],
    acceptingClients: true,
  },
  "demo.vrspecialist@pathwayspro.app": {
    styles: ["Structured", "Direct"],
    specialties: ["Physical disability", "Return-to-work / forensic"],
    languages: ["English"],
    windows: ["Afternoons"],
    acceptingClients: true,
  },
  "counselor.demo1@pathwayspro.app": {
    styles: ["Motivational", "Collaborative"],
    specialties: ["Autism & IDD", "Youth & transition"],
    languages: ["English", "ASL"],
    windows: ["Mornings", "Weekends"],
    acceptingClients: true,
  },
  "counselor.demo2@pathwayspro.app": {
    styles: ["Structured", "Trauma-informed"],
    specialties: ["Recovery & SUD", "Mental health"],
    languages: ["English", "Spanish"],
    windows: ["Afternoons", "Evenings"],
    acceptingClients: true,
  },
  "crc.counselor@pathwayspro.app": {
    styles: ["Direct", "Structured"],
    specialties: ["Return-to-work / forensic", "Physical disability"],
    languages: ["English"],
    windows: ["Mornings", "Afternoons"],
    acceptingClients: true,
  },
};

function fallbackProfile(email: string): Omit<CounselorMatchProfile, "email" | "name" | "credentials"> {
  return {
    styles: ["Collaborative"],
    specialties: ["Mental health"],
    languages: ["English"],
    windows: ["Mornings", "Afternoons"],
    acceptingClients: true,
  };
}

export function counselorProfiles(): CounselorMatchProfile[] {
  return Object.values(COUNSELORS as Record<string, CounselorUser>)
    .filter((c) => c.role === "counselor")
    .map((c) => {
      const seed = SEED[c.email] ?? fallbackProfile(c.email);
      return {
        email: c.email,
        name: c.name,
        credentials: c.credentials,
        ...seed,
      };
    });
}

const PREF_KEY = "pathways-pro:match-prefs-v1";

export function loadPreference(clientEmail: string): MatchPreference | null {
  if (typeof window === "undefined") return null;
  try {
    const all = JSON.parse(window.localStorage.getItem(PREF_KEY) || "{}");
    return all[clientEmail] ?? null;
  } catch {
    return null;
  }
}

export function savePreference(clientEmail: string, pref: MatchPreference) {
  if (typeof window === "undefined") return;
  const all = JSON.parse(window.localStorage.getItem(PREF_KEY) || "{}");
  all[clientEmail] = pref;
  window.localStorage.setItem(PREF_KEY, JSON.stringify(all));
}

export interface ScoredMatch {
  profile: CounselorMatchProfile;
  score: number; // 0–100
  reasons: string[];
}

function overlap<T>(a: T[], b: T[]): T[] {
  return a.filter((x) => b.includes(x));
}

/**
 * Weighted match score. Specialties matter most (they gate suitability),
 * then communication style (rapport), language (access), and availability.
 */
export function scoreCounselor(
  pref: MatchPreference,
  profile: CounselorMatchProfile,
): ScoredMatch {
  const reasons: string[] = [];
  let score = 0;
  let max = 0;

  const W = { specialty: 40, style: 30, language: 20, window: 10 };

  // Specialties
  max += W.specialty;
  if (pref.preferredSpecialties.length) {
    const hit = overlap(pref.preferredSpecialties, profile.specialties);
    score += (W.specialty * hit.length) / pref.preferredSpecialties.length;
    if (hit.length) reasons.push(`Specializes in ${hit.join(", ")}`);
  } else {
    score += W.specialty; // no preference → not a differentiator
  }

  // Communication style
  max += W.style;
  if (pref.preferredStyles.length) {
    const hit = overlap(pref.preferredStyles, profile.styles);
    score += (W.style * hit.length) / pref.preferredStyles.length;
    if (hit.length) reasons.push(`${hit.join(" & ")} style`);
  } else score += W.style;

  // Language (a miss here is a hard access barrier — penalize strongly)
  max += W.language;
  if (pref.languages.length) {
    const hit = overlap(pref.languages, profile.languages);
    if (hit.length) {
      score += W.language;
      if (!hit.includes("English")) reasons.push(`Speaks ${hit.join(", ")}`);
    }
  } else score += W.language;

  // Availability windows
  max += W.window;
  if (pref.windows.length) {
    const hit = overlap(pref.windows, profile.windows);
    score += (W.window * hit.length) / pref.windows.length;
    if (hit.length) reasons.push(`Available ${hit.join(", ").toLowerCase()}`);
  } else score += W.window;

  return {
    profile,
    score: Math.round((score / max) * 100),
    reasons,
  };
}

export function topMatches(pref: MatchPreference, limit = 3): ScoredMatch[] {
  return counselorProfiles()
    .filter((p) => p.acceptingClients)
    .map((p) => scoreCounselor(pref, p))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
