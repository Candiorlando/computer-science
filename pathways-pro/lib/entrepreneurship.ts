"use client";

// Entrepreneurship & Self-Employment — data layer for the VR self-employment
// module. Three artifact types persist to localStorage and mirror onto
// the shared client_report so the counselor sees what a client has
// drafted toward a self-employment plan.

import { patchClientReport } from "./client-report";

// ─── Business Concept Matchmaker ───────────────────────────────────────

export interface BusinessConcept {
  name: string;
  tagline: string;
  whatItIs: string;
  whyItFits: string;             // explicit mapping back to RIASEC, TSA, intake
  startupCostsLow: number;       // USD
  startupCostsHigh: number;      // USD
  monthlyOperatingLow: number;
  monthlyOperatingHigh: number;
  timeToFirstRevenueMonths: number;
  scaleCeiling: "side-income" | "full-time" | "team";

  // Accommodation-aware
  accommodationConsiderations: string[];
  assistiveTechNeeded: { item: string; estimatedCost: number }[];

  // Reality check
  riskLevel: "low" | "moderate" | "higher";
  riskFactors: string[];
  earlyWins: string[];           // first 3 things to do this week
  redFlags: string[];            // when to abandon
}

export interface ConceptMatchSession {
  id: string;
  caseId?: string;
  clientName: string;

  // Source profile snapshot — pinned so re-runs against changed
  // profile data are explainable.
  profileSnapshot: {
    hollandCode?: string;
    topRiasec?: string[];
    transferableSkills?: string[];
    dreamJob?: string;
    employmentGoal?: string;
    constraints?: string;
    schedulePreference?: string;
    educationLevel?: string;
    zipCode?: string;
    natureOfCondition?: string;
  };

  // AI output
  concepts: BusinessConcept[];   // exactly 3
  rationaleNarrative: string;    // why we picked these specifically
  generalCautions: string[];

  createdAt: string;
  generatedByModel: string;
}

const MATCH_KEY = "pathways-pro:business-concept-matches-v1";

export function loadConceptMatches(): ConceptMatchSession[] {
  return readList<ConceptMatchSession>(MATCH_KEY);
}
export function saveConceptMatch(m: ConceptMatchSession) {
  const next = [m, ...loadConceptMatches().filter((x) => x.id !== m.id)];
  writeList(MATCH_KEY, next);
  if (m.caseId) {
    patchClientReport(m.caseId, m.clientName, { lastConceptMatch: m });
  }
}
export function deleteConceptMatch(id: string) {
  writeList(MATCH_KEY, loadConceptMatches().filter((m) => m.id !== id));
}

// ─── Business Plan Generator ───────────────────────────────────────────

export interface BusinessPlan {
  id: string;
  caseId?: string;
  clientName: string;
  businessName: string;
  conceptSummary: string;

  // Inputs the client supplied
  targetCustomer: string;
  geographicMarket: string;
  startingBudget: number;

  // AI-generated sections
  executiveSummary: string;

  productService: string;
  problemSolved: string;
  uniqueValueProposition: string;

  targetMarketAnalysis: {
    persona: string;
    marketSize: string;
    competitors: { name: string; differentiator: string }[];
    gotoMarketChannels: string[];
  };

  operations: {
    workflowSteps: string[];
    keyMilestones30_60_90: { day: 30 | 60 | 90; goal: string }[];
    accommodationsBuiltIn: string[];
  };

  financialProjections: {
    startupCosts: { item: string; cost: number }[];
    monthlyExpenses: { item: string; cost: number }[];
    revenueProjections: { month: number; low: number; high: number }[];
    breakEvenMonth: number;
  };

  assistiveTechBudget: { item: string; estimatedCost: number; rationale: string }[];

  risksAndMitigations: { risk: string; mitigation: string }[];

  fundingPathways: string[];

  createdAt: string;
  generatedByModel: string;
}

const PLAN_KEY = "pathways-pro:business-plans-v1";

export function loadBusinessPlans(): BusinessPlan[] {
  return readList<BusinessPlan>(PLAN_KEY);
}
export function saveBusinessPlan(p: BusinessPlan) {
  const next = [p, ...loadBusinessPlans().filter((x) => x.id !== p.id)];
  writeList(PLAN_KEY, next);
  if (p.caseId) {
    patchClientReport(p.caseId, p.clientName, { lastBusinessPlan: p });
  }
}
export function deleteBusinessPlan(id: string) {
  writeList(PLAN_KEY, loadBusinessPlans().filter((p) => p.id !== id));
}

// ─── Tiny storage helpers ──────────────────────────────────────────────

function readList<T>(k: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}
function writeList<T>(k: string, list: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(list));
}

export function newEntrepreneurshipId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
