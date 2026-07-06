"use client";

// Unified per-case document registry. Rather than requiring every
// generator to register its output, this DERIVES the document list
// from all the existing case-scoped stores — so anything ever
// generated for a client (assessments, IPE, letters, complaints,
// reports, business plans) appears in the case file's Documents tab
// automatically and retroactively.

import { assessmentsForScope } from "./case-assessments";
import { loadIPE } from "./ipe";
import { loadAccommodationLetters } from "./accommodation-letters";
import {
  loadEEOCCharges,
  loadOCRComplaints,
  loadProblemAnalysisReports,
} from "./self-advocacy";
import { loadBusinessPlans, loadConceptMatches } from "./entrepreneurship";
import { loadClientReport } from "./client-report";

export type CaseDocumentKind =
  | "assessment"
  | "ipe"
  | "career-report"
  | "accommodation-letter"
  | "problem-analysis"
  | "eeoc-charge"
  | "ocr-doj-complaint"
  | "business-plan"
  | "concept-match";

export const CASE_DOCUMENT_KIND_LABELS: Record<CaseDocumentKind, string> = {
  assessment: "Assessment result",
  ipe: "IPE — Individualized Plan for Employment",
  "career-report": "Career assessment report",
  "accommodation-letter": "Accommodation letter",
  "problem-analysis": "Problem Analysis Report",
  "eeoc-charge": "EEOC charge",
  "ocr-doj-complaint": "OCR / DOJ complaint",
  "business-plan": "VR business plan",
  "concept-match": "Business concept match",
};

export interface CaseDocument {
  id: string;
  caseId: string;
  kind: CaseDocumentKind;
  title: string;
  createdAt: string;
  createdByName?: string;
  status?: string; // e.g. "Signed", "Approved", "Draft"
  href?: string;   // viewer route where one exists
}

export function documentsForCase(caseId: string): CaseDocument[] {
  const docs: CaseDocument[] = [];

  // Completed assessments (in-session or client-completed via
  // assignment) — all live in the case-isolated assessment store.
  for (const a of assessmentsForScope("client-case", caseId)) {
    docs.push({
      id: `assessment-${a.id}`,
      caseId,
      kind: "assessment",
      title: a.toolTitle,
      createdAt: a.administeredAt,
      createdByName: a.administeredByName,
      status: a.counselorApproved ? "Approved" : "Awaiting approval",
      href: `/case/${caseId}?tab=assessments`,
    });
  }

  // IPE — anything past draft is a case document.
  const ipe = loadIPE(caseId);
  if (ipe && ipe.status !== "draft") {
    docs.push({
      id: `ipe-${caseId}`,
      caseId,
      kind: "ipe",
      title: `IPE — ${ipe.employmentGoal || "Employment plan"}`,
      createdAt: ipe.updatedAt,
      createdByName: ipe.counselorName,
      status:
        ipe.status === "signed" || ipe.status === "active"
          ? "Signed"
          : "Awaiting client signature",
      href: `/ipe?case=${caseId}`,
    });
  }

  // Career assessment report (interest profiler + matches).
  const report = loadClientReport(caseId);
  if (report) {
    docs.push({
      id: `report-${caseId}`,
      caseId,
      kind: "career-report",
      title: "Career Assessment Report",
      createdAt:
        (report as { updatedAt?: string }).updatedAt ??
        new Date().toISOString(),
      href: `/report?case=${caseId}`,
    });
  }

  for (const l of loadAccommodationLetters().filter(
    (x) => x.caseId === caseId,
  )) {
    docs.push({
      id: `letter-${l.id}`,
      caseId,
      kind: "accommodation-letter",
      title: l.employerName
        ? `Accommodation letter — ${l.employerName}`
        : l.workplaceProblem.slice(0, 60),
      createdAt: l.createdAt,
      createdByName: l.clientName,
    });
  }

  for (const r of loadProblemAnalysisReports().filter(
    (x) => x.caseId === caseId,
  )) {
    docs.push({
      id: `par-${r.id}`,
      caseId,
      kind: "problem-analysis",
      title: `Problem analysis — ${r.employerName}`,
      createdAt: r.createdAt,
      createdByName: r.clientName,
    });
  }

  for (const c of loadEEOCCharges().filter((x) => x.caseId === caseId)) {
    docs.push({
      id: `eeoc-${c.id}`,
      caseId,
      kind: "eeoc-charge",
      title: `EEOC charge — ${c.employerName}`,
      createdAt: c.createdAt,
      createdByName: c.clientName,
    });
  }

  for (const c of loadOCRComplaints().filter((x) => x.caseId === caseId)) {
    docs.push({
      id: `ocr-${c.id}`,
      caseId,
      kind: "ocr-doj-complaint",
      title: `Civil rights complaint — ${c.respondentName}`,
      createdAt: c.createdAt,
      createdByName: c.clientName,
    });
  }

  for (const p of loadBusinessPlans().filter((x) => x.caseId === caseId)) {
    docs.push({
      id: `bp-${p.id}`,
      caseId,
      kind: "business-plan",
      title: `Business plan — ${p.businessName}`,
      createdAt: (p as { createdAt?: string }).createdAt ?? new Date().toISOString(),
      createdByName: p.clientName,
    });
  }

  for (const m of loadConceptMatches().filter((x) => x.caseId === caseId)) {
    docs.push({
      id: `cm-${m.id}`,
      caseId,
      kind: "concept-match",
      title: "Business concept match session",
      createdAt: (m as { createdAt?: string }).createdAt ?? new Date().toISOString(),
      createdByName: m.clientName,
    });
  }

  return docs.sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}
