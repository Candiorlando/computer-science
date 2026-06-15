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

// The single source of truth for "where should we search?".
// Returns ONLY the 5-digit ZIP — CareerOneStop and apprenticeship.gov both
// give clean radius-search results when the location parameter is a ZIP
// and noisy results when it includes city + state + ZIP together.
//
// 1. If the dedicated zipCode field has a valid ZIP, use it.
// 2. Else if the free-form location field contains a 5-digit ZIP anywhere
//    (e.g. legacy "Chicago, IL 60652"), extract just the ZIP.
// 3. Else fall back to the trimmed free-form location string (best we can
//    do — the user hasn't given us a ZIP).
export function searchLocation(profile: UserProfile): string {
  const zip = profile.intake?.zipCode?.trim();
  if (zip && isValidZip(zip)) return zip;

  const loc = profile.intake?.location?.trim() ?? "";
  const embedded = loc.match(/\b(\d{5})(?:-\d{4})?\b/);
  if (embedded) return embedded[1];

  return loc;
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
