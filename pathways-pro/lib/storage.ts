"use client";

import type { BigFiveScores, RiasecScores } from "./assessments";

const KEY = "career-compass:profile-v1";

export interface UserProfile {
  intake?: {
    age?: string;
    location?: string;        // city, state (free-form, for display)
    zipCode?: string;         // 5-digit ZIP — drives every location-aware link
    educationLevel?: string;  // e.g., "Some high school", "HS diploma", "Some college", "Associate", "Bachelor's", "Graduate"
    workHistory?: string;     // free-form
    constraints?: string;     // disability, transportation, childcare, schedule, etc.
    goals?: string;           // what they want from the next job
    openToApprenticeship?: boolean;
  };
  bigFive?: BigFiveScores;
  riasec?: RiasecScores;
  hollandCode?: string;
  completedAt?: string;
}

// The single source of truth for "where should we search?" — prefer ZIP,
// fall back to free-form location, then empty.
export function searchLocation(profile: UserProfile): string {
  return (profile.intake?.zipCode || profile.intake?.location || "").trim();
}

export function isValidZip(z?: string | null): boolean {
  return !!z && /^\d{5}(-\d{4})?$/.test(z.trim());
}

export function loadProfile(): UserProfile {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as UserProfile) : {};
  } catch {
    return {};
  }
}

export function saveProfile(profile: UserProfile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(profile));
}

export function patchProfile(patch: Partial<UserProfile>) {
  const current = loadProfile();
  const next = { ...current, ...patch };
  saveProfile(next);
  return next;
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
