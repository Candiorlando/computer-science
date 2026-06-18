"use client";

// AI Accommodation Letter Generator — types + storage.
//
// Each letter is persisted both in the client's own profile (so the
// client can return to past letters) and on their shared client_report
// (so the counselor sees every accommodation request the client has
// drafted, with full text, on review). When the production backend
// lands, the AccommodationLetter shape maps 1:1 onto an
// accommodation_letters table.

import { patchClientReport } from "./client-report";

export type SolutionCategory =
  | "hardware"
  | "software"
  | "furniture"
  | "environmental"
  | "assistive-tech"
  | "scheduling"
  | "policy"
  | "task-restructuring"
  | "other";

export interface ZeroCostSolution {
  label: string;
  rationale: string;
  category: SolutionCategory;
}

export interface PaidSolution {
  label: string;
  rationale: string;
  category: SolutionCategory;
  estimatedPriceLow: number;
  estimatedPriceHigh: number;
  exampleSources: string[]; // e.g. ["Amazon", "vendor:Humanscale", "askjan.org"]
}

export interface AccommodationLetter {
  id: string;
  caseId?: string;
  clientName: string;
  jobTitle?: string;
  employerName?: string;
  hrContactName?: string;
  hrContactTitle?: string;
  workLocation?: string;
  natureOfCondition?: string;
  workplaceProblem: string;

  // AI output
  barrierAnalysis: string;
  janCitation: string;
  zeroCostSolutions: ZeroCostSolution[];
  paidSolutions: PaidSolution[];
  totalPaidLow: number;
  totalPaidHigh: number;

  letter: {
    date: string;
    recipientBlock: string[];
    subject: string;
    salutation: string;
    paragraphs: string[];
    closing: string;
  };

  createdAt: string;
  updatedAt: string;
  generatedByModel: string;
}

const LIST_KEY = "pathways-pro:accommodation-letters-v1";

export function loadAccommodationLetters(): AccommodationLetter[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LIST_KEY);
    return raw ? (JSON.parse(raw) as AccommodationLetter[]) : [];
  } catch {
    return [];
  }
}

export function saveAccommodationLetters(list: AccommodationLetter[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LIST_KEY, JSON.stringify(list));
}

export function appendAccommodationLetter(
  letter: AccommodationLetter,
): AccommodationLetter[] {
  const next = [letter, ...loadAccommodationLetters()];
  saveAccommodationLetters(next);
  // Mirror into the shared client report so the counselor sees it.
  if (letter.caseId) {
    patchClientReport(letter.caseId, letter.clientName, {
      lastAccommodationLetter: letter,
    });
  }
  return next;
}

export function deleteAccommodationLetter(id: string): AccommodationLetter[] {
  const next = loadAccommodationLetters().filter((l) => l.id !== id);
  saveAccommodationLetters(next);
  return next;
}

export function newLetterId(): string {
  return "acc-" + Math.random().toString(36).slice(2, 10);
}

// JAN statistical citation — referenced in every generated letter to
// pre-empt the "undue hardship" defense. Sourced from JAN's recurring
// Workplace Accommodations: Low Cost, High Impact study.
export const JAN_CITATION =
  "Per Job Accommodation Network (JAN) research, 56% of workplace accommodations cost nothing to implement, and the median one-time cost for accommodations that do require expenditure is approximately $300.";
