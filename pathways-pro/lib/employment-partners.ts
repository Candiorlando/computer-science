"use client";

// Employment Partner data layer — opportunities, Customized Employment
// engagements, accommodation inquiries, placements, progress updates.
//
// Mirrors onto:
//   - the partner's own org record (so they see their stuff)
//   - the counselor's per-partner case file
//   - the client's view when assigned (read-only CE summary)
//
// localStorage-persisted in the demo; shape maps onto a normal
// employment_partner_* table set when the backend lands.

import type { PartnerOrgType } from "./users";

// ─── Partner Org profile ───────────────────────────────────────────────

export interface PartnerOrg {
  id: string;
  legalName: string;
  partnerOrgType: PartnerOrgType;
  primaryContact?: string;
  industry?: string;
  hqCity?: string;
  hqState?: string;
  hqZip?: string;
  participatesInCustomizedEmployment: boolean;
  participatesInSupportedEmployment: boolean;
  approvedAt?: string;
  createdAt: string;
}

const ORG_KEY = "pathways-pro:partner-orgs-v1";

export function loadPartnerOrgs(): Record<string, PartnerOrg> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ORG_KEY);
    return raw ? (JSON.parse(raw) as Record<string, PartnerOrg>) : {};
  } catch {
    return {};
  }
}
export function savePartnerOrgs(map: Record<string, PartnerOrg>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ORG_KEY, JSON.stringify(map));
}
export function getPartnerOrg(id: string): PartnerOrg | null {
  return loadPartnerOrgs()[id] ?? null;
}

// ─── Opportunities ─────────────────────────────────────────────────────

export type OpportunityKind =
  | "competitive-job"
  | "supported-employment"
  | "customized-employment"
  | "internship"
  | "apprenticeship"
  | "volunteer";

export interface Opportunity {
  id: string;
  partnerOrgId: string;
  partnerOrgName: string;
  postedByEmail: string;

  title: string;
  kind: OpportunityKind;
  description: string;
  socCode?: string;
  hoursPerWeek: number;
  wage?: string;             // e.g. "$18/hr" or "$0 (volunteer)"
  location: string;
  startDate?: string;        // ISO date

  // Accommodation readiness (declared by the partner up front)
  willingToCarveRole: boolean;
  willingToAdjustSchedule: boolean;
  accommodationsAvailable: string[];
  status: "open" | "filled" | "closed";

  createdAt: string;
  filledByCaseId?: string;
  filledByClientName?: string;
}

const OPP_KEY = "pathways-pro:partner-opportunities-v1";

export function loadOpportunities(): Opportunity[] {
  return readList<Opportunity>(OPP_KEY);
}
export function saveOpportunities(items: Opportunity[]) {
  writeList(OPP_KEY, items);
}
export function appendOpportunity(o: Opportunity) {
  saveOpportunities([o, ...loadOpportunities()]);
}
export function opportunitiesForPartner(partnerOrgId: string): Opportunity[] {
  return loadOpportunities().filter((o) => o.partnerOrgId === partnerOrgId);
}

// ─── Customized Employment ─────────────────────────────────────────────

export type CEStage =
  | "discovery"               // strengths-based discovery
  | "job-design"              // job carving / role design
  | "employer-negotiation"
  | "worksite-customization"
  | "placement"
  | "stabilization"
  | "long-term-support";

export interface CustomizedEmploymentEngagement {
  id: string;
  partnerOrgId: string;
  partnerOrgName: string;
  caseId?: string;            // linked client (counselor assigns)
  clientName?: string;
  counselorEmail?: string;

  // Discovery
  discoveryNotes: string;
  clientStrengths: string[];
  clientInterests: string[];

  // Job design
  carvedTasks: string[];
  proposedTitle: string;
  proposedHoursPerWeek: number;

  // Worksite
  worksiteAccommodations: string[];

  // Progress
  currentStage: CEStage;
  milestones: { label: string; targetDate: string; metAt?: string }[];

  createdAt: string;
  updatedAt: string;
}

const CE_KEY = "pathways-pro:customized-employment-v1";

export function loadCEEngagements(): CustomizedEmploymentEngagement[] {
  return readList<CustomizedEmploymentEngagement>(CE_KEY);
}
export function saveCEEngagements(items: CustomizedEmploymentEngagement[]) {
  writeList(CE_KEY, items);
}
export function appendCEEngagement(e: CustomizedEmploymentEngagement) {
  saveCEEngagements([e, ...loadCEEngagements()]);
}
export function updateCEEngagement(
  id: string,
  patch: Partial<CustomizedEmploymentEngagement>,
) {
  const list = loadCEEngagements();
  saveCEEngagements(
    list.map((e) =>
      e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e,
    ),
  );
}
export function ceForPartner(
  partnerOrgId: string,
): CustomizedEmploymentEngagement[] {
  return loadCEEngagements().filter((e) => e.partnerOrgId === partnerOrgId);
}
export function ceForCase(caseId: string): CustomizedEmploymentEngagement[] {
  return loadCEEngagements().filter((e) => e.caseId === caseId);
}
export function ceForCounselor(
  email: string,
): CustomizedEmploymentEngagement[] {
  return loadCEEngagements().filter((e) => e.counselorEmail === email);
}

// ─── Accommodation Inquiries (partner → counselor) ─────────────────────

export interface AccommodationInquiry {
  id: string;
  partnerOrgId: string;
  partnerOrgName: string;
  fromEmail: string;
  fromName: string;
  // The role / position context
  opportunityId?: string;
  jobTitle: string;
  question: string;
  status: "pending" | "responded" | "resolved";
  responseFromCounselorEmail?: string;
  responseBody?: string;
  createdAt: string;
  respondedAt?: string;
}

const INQ_KEY = "pathways-pro:partner-accommodation-inquiries-v1";

export function loadAccommodationInquiries(): AccommodationInquiry[] {
  return readList<AccommodationInquiry>(INQ_KEY);
}
export function saveAccommodationInquiries(items: AccommodationInquiry[]) {
  writeList(INQ_KEY, items);
}
export function appendAccommodationInquiry(i: AccommodationInquiry) {
  saveAccommodationInquiries([i, ...loadAccommodationInquiries()]);
}
export function inquiriesForPartner(
  partnerOrgId: string,
): AccommodationInquiry[] {
  return loadAccommodationInquiries().filter(
    (i) => i.partnerOrgId === partnerOrgId,
  );
}

// ─── Placements (partner ↔ client) ─────────────────────────────────────

export interface PartnerPlacement {
  id: string;
  partnerOrgId: string;
  partnerOrgName: string;
  opportunityId: string;
  opportunityTitle: string;
  caseId: string;
  clientName: string;
  counselorEmail: string;
  hireDate: string;
  status:
    | "offered"
    | "accepted"
    | "started"
    | "stabilizing"
    | "retained"
    | "ended";
  hoursPerWeek: number;
  wage?: string;
  isCustomizedEmployment: boolean;
  ceEngagementId?: string;
  createdAt: string;
}

const PLACE_KEY = "pathways-pro:partner-placements-v1";

export function loadPartnerPlacements(): PartnerPlacement[] {
  return readList<PartnerPlacement>(PLACE_KEY);
}
export function savePartnerPlacements(items: PartnerPlacement[]) {
  writeList(PLACE_KEY, items);
}
export function appendPartnerPlacement(p: PartnerPlacement) {
  savePartnerPlacements([p, ...loadPartnerPlacements()]);
}
export function placementsForPartner(
  partnerOrgId: string,
): PartnerPlacement[] {
  return loadPartnerPlacements().filter((p) => p.partnerOrgId === partnerOrgId);
}
export function placementsForCase(caseId: string): PartnerPlacement[] {
  return loadPartnerPlacements().filter((p) => p.caseId === caseId);
}

// ─── Progress Updates (partner → counselor) ────────────────────────────

export interface ProgressUpdate {
  id: string;
  placementId: string;
  partnerOrgId: string;
  fromEmail: string;
  fromName: string;
  reportingWeek: string;     // YYYY-Www format
  hoursWorked: number;
  notes: string;
  flags: string[];           // e.g., ["attendance-concern", "accommodation-need"]
  createdAt: string;
}

const PROG_KEY = "pathways-pro:partner-progress-updates-v1";

export function loadProgressUpdates(): ProgressUpdate[] {
  return readList<ProgressUpdate>(PROG_KEY);
}
export function appendProgressUpdate(p: ProgressUpdate) {
  writeList(PROG_KEY, [p, ...loadProgressUpdates()]);
}
export function progressUpdatesForPlacement(
  placementId: string,
): ProgressUpdate[] {
  return loadProgressUpdates().filter((p) => p.placementId === placementId);
}

// ─── Storage helpers ───────────────────────────────────────────────────

function readList<T>(k: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}
function writeList<T>(k: string, items: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(items));
}

export function newPartnerId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

// ─── Customized Employment tool templates ──────────────────────────────
// Pre-built reference content shown in the partner's CE workspace.

export const CE_TOOL_TEMPLATES = {
  discoveryPrompts: [
    "What three activities does the person lose track of time doing?",
    "When have they solved a problem that no one else could solve?",
    "Where do they go when they want to feel competent?",
    "Who in their life sees them at their best — and why?",
    "What environments drain them quickly, and which ones energize them?",
  ],
  jobCarvingPrompts: [
    "Which essential function of an existing role do other workers dislike but this person could excel at?",
    "What recurring task in this business doesn't have an owner today?",
    "What would the highest-paid worker do if they didn't have to do [list of marginal tasks]?",
    "Which tasks does this person already do informally that the employer is benefiting from?",
  ],
  employerNegotiationFraming: [
    "Frame the carved role as a productivity gain for the employer's top performers, not as charity.",
    "Lead with the specific tasks the person can take off the team's plate.",
    "Bring evidence: hours saved per week, error rate reduction, or revenue captured.",
    "Propose a 30-day paid trial with clear success criteria before committing to a permanent role.",
  ],
};
