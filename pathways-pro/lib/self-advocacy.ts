"use client";

// Self Advocacy — types + storage for the legal-advocacy generators
// (incident report / Problem Analysis Report, EEOC Charge, OCR/DOJ
// civil-rights complaint). All three artifacts persist to localStorage
// in the demo and mirror onto the shared client_report so the
// counselor sees the most recent advocacy artifact a client drafted.

import { patchClientReport } from "./client-report";

// ─── Disclaimers ───────────────────────────────────────────────────────

// Required on every generated document per the user's spec. Lives in
// one place so a single edit propagates to every artifact across the
// platform — Self Advocacy AND Self-Employment.
export const LEGAL_DISCLAIMER =
  "Disclaimer: This document was generated with AI assistance for planning and preparation purposes. The AI is not an attorney, financial advisor, or state Vocational Rehabilitation agency. This draft does not constitute legal representation or official state VR business plan approval. Consult a licensed attorney, a certified public accountant (CPA), or your assigned VR counselor before formal submissions or investments.";

// ─── Incident Report / Problem Analysis Report ─────────────────────────

export interface Incident {
  id: string;
  date: string;             // ISO YYYY-MM-DD or free-form ("Fall 2024")
  time?: string;
  offenders: string;        // names + roles, free-form
  description: string;
  impact: string;
  witnesses?: string;
  evidence?: string;        // emails, texts, voicemails, photos
}

export interface LegalCrossReference {
  law: string;              // "ADA Title I (42 U.S.C. § 12112)"
  analysis: string;         // how the facts may implicate it
}

export interface ProblemAnalysisReport {
  id: string;
  caseId?: string;
  clientName: string;
  clientRole?: string;
  natureOfCondition?: string;

  employerName: string;
  employerLocation?: string;
  employerContact?: string;
  clientStartDate?: string;
  clientEndDate?: string;

  incidents: Incident[];

  // AI-generated
  executiveSummary: string;
  patternAnalysis: string;
  legalCrossReference: LegalCrossReference[];
  nextSteps: string[];

  createdAt: string;
  generatedByModel: string;
}

const PAR_KEY = "pathways-pro:problem-analysis-reports-v1";

export function loadProblemAnalysisReports(): ProblemAnalysisReport[] {
  return readList<ProblemAnalysisReport>(PAR_KEY);
}
export function saveProblemAnalysisReport(r: ProblemAnalysisReport) {
  const next = [r, ...loadProblemAnalysisReports().filter((x) => x.id !== r.id)];
  writeList(PAR_KEY, next);
  if (r.caseId) {
    patchClientReport(r.caseId, r.clientName, {
      lastProblemAnalysisReport: r,
    });
  }
}
export function deleteProblemAnalysisReport(id: string) {
  writeList(
    PAR_KEY,
    loadProblemAnalysisReports().filter((r) => r.id !== id),
  );
}

// ─── EEOC Charge of Discrimination ─────────────────────────────────────

export type EEOCBasis =
  | "Disability"
  | "Race"
  | "Color"
  | "Religion"
  | "Sex"
  | "Sexual orientation"
  | "Gender identity"
  | "National origin"
  | "Age"
  | "Genetic information"
  | "Retaliation"
  | "Equal Pay Act";

export interface EEOCCharge {
  id: string;
  caseId?: string;

  // Complainant
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;

  // Respondent (employer)
  employerName: string;
  employerAddress: string;
  employerCity: string;
  employerState: string;
  employerZip: string;
  employerPhone?: string;
  employerEmployees: string; // "15+", "100-200", etc.

  // Charge details
  basesOfDiscrimination: EEOCBasis[];
  earliestDate: string;
  latestDate: string;
  continuingAction: boolean;
  briefStatement: string;

  // AI-generated
  formalParticulars: string;
  legalAnalysis: string;
  recommendedNextSteps: string[];

  createdAt: string;
  generatedByModel: string;
}

const EEOC_KEY = "pathways-pro:eeoc-charges-v1";

export function loadEEOCCharges(): EEOCCharge[] {
  return readList<EEOCCharge>(EEOC_KEY);
}
export function saveEEOCCharge(c: EEOCCharge) {
  const next = [c, ...loadEEOCCharges().filter((x) => x.id !== c.id)];
  writeList(EEOC_KEY, next);
  if (c.caseId) {
    patchClientReport(c.caseId, c.clientName, { lastEEOCCharge: c });
  }
}
export function deleteEEOCCharge(id: string) {
  writeList(EEOC_KEY, loadEEOCCharges().filter((c) => c.id !== id));
}

// ─── OCR / DOJ Civil Rights Complaint ──────────────────────────────────

// OCR-ED (Department of Education Office for Civil Rights) was removed
// after the agency's disability rights enforcement capacity was wound
// down. Education-context complaints now route to DOJ-DRS for ADA
// Title II violations by public schools.
export type CivilRightsAgency = "OCR-HHS" | "DOJ-DRS";

export type RespondentType =
  | "federally-funded-program"
  | "state-government"
  | "local-government"
  | "public-accommodation"
  | "public-school"
  | "higher-education-institution";

export interface OCRDOJComplaint {
  id: string;
  caseId?: string;
  agency: CivilRightsAgency;

  // Complainant
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;

  // Respondent
  respondentName: string;
  respondentType: RespondentType;
  respondentAddress: string;
  respondentContact?: string;

  // Allegation
  whatHappened: string;
  whenHappened: string;
  rightsViolated: string[]; // ADA Title II, Section 504, Section 508, etc.
  priorComplaints: string;  // any prior filings or appeals

  // AI-generated
  formalComplaint: string;
  legalBasis: string;
  remediesSought: string[];

  createdAt: string;
  generatedByModel: string;
}

const OCR_KEY = "pathways-pro:ocr-doj-complaints-v1";

export function loadOCRComplaints(): OCRDOJComplaint[] {
  return readList<OCRDOJComplaint>(OCR_KEY);
}
export function saveOCRComplaint(c: OCRDOJComplaint) {
  const next = [c, ...loadOCRComplaints().filter((x) => x.id !== c.id)];
  writeList(OCR_KEY, next);
  if (c.caseId) {
    patchClientReport(c.caseId, c.clientName, { lastOCRDOJComplaint: c });
  }
}
export function deleteOCRComplaint(id: string) {
  writeList(OCR_KEY, loadOCRComplaints().filter((c) => c.id !== id));
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

export function newSelfAdvocacyId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}
