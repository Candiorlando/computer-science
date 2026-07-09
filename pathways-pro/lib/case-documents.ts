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

export function documentsForCase(
  caseId: string,
  viewer: "counselor" | "client" = "counselor",
): CaseDocument[] {
  const docs: CaseDocument[] = [];
  const isClient = viewer === "client";

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
      href: isClient
        ? "/my-assessments"
        : `/case/${caseId}/document/assessment-${a.id}`,
    });
  }

  // IPE — drafts file as "IPE Draft"; signed/pending file as the IPE.
  const ipe = loadIPE(caseId);
  if (ipe) {
    const isDraft = ipe.status === "draft";
    docs.push({
      id: `ipe-${caseId}`,
      caseId,
      kind: "ipe",
      title: isDraft
        ? "IPE Draft — in progress"
        : `IPE — ${ipe.employmentGoal || "Employment plan"}`,
      createdAt: ipe.updatedAt,
      createdByName: ipe.counselorName,
      status: isDraft
        ? "Draft"
        : ipe.status === "signed" || ipe.status === "active"
          ? "Signed"
          : "Awaiting client signature",
      href: isClient ? "/ipe" : `/ipe?case=${caseId}`,
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
      href: isClient ? "/report" : `/report?case=${caseId}`,
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
      href: isClient ? undefined : `/case/${caseId}/document/letter-${l.id}`,
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
      href: isClient ? undefined : `/case/${caseId}/document/par-${r.id}`,
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
      href: isClient ? undefined : `/case/${caseId}/document/eeoc-${c.id}`,
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
      href: isClient ? undefined : `/case/${caseId}/document/ocr-${c.id}`,
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
      href: isClient ? undefined : `/case/${caseId}/document/bp-${p.id}`,
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

// ── Printable document rendering ──────────────────────────────────────
// Returns the full, formatted body of a single document so the viewer
// can render it print-ready (black-on-white). Sections are plain text;
// the viewer renders paragraph breaks.

export interface RenderedDocument {
  title: string;
  subtitle: string;
  meta: { label: string; value: string }[];
  sections: { heading: string; body: string }[];
}

export function renderDocument(
  caseId: string,
  docId: string,
): RenderedDocument | null {
  // Assessment result
  if (docId.startsWith("assessment-")) {
    const aid = docId.slice("assessment-".length);
    const a = assessmentsForScope("client-case", caseId).find(
      (x) => x.id === aid,
    );
    if (!a) return null;
    const interp =
      a.counselorEditedInterpretation ??
      a.aiDraftInterpretation ??
      "No interpretation recorded.";
    return {
      title: a.toolTitle,
      subtitle: "Assessment Result",
      meta: [
        { label: "Case", value: caseId },
        { label: "Administered by", value: a.administeredByName },
        {
          label: "Administered",
          value: new Date(a.administeredAt).toLocaleString(),
        },
        {
          label: "Status",
          value: a.counselorApproved ? "Approved by counselor" : "Awaiting approval",
        },
      ],
      sections: [
        {
          heading: "Responses",
          body: a.responses
            .map((r, i) => `${i + 1}. ${r.itemId}: ${String(r.value)}`)
            .join("\n"),
        },
        { heading: "Interpretation", body: interp },
      ],
    };
  }

  if (docId.startsWith("letter-")) {
    const l = loadAccommodationLetters().find(
      (x) => x.id === docId.slice("letter-".length) && x.caseId === caseId,
    );
    if (!l) return null;
    const body = [
      l.letter.date,
      "",
      l.letter.recipientBlock.join("\n"),
      "",
      l.letter.subject,
      "",
      l.letter.salutation,
      "",
      l.letter.paragraphs.join("\n\n"),
      "",
      l.letter.closing,
    ].join("\n");
    return {
      title: l.employerName
        ? `Accommodation Request — ${l.employerName}`
        : "Accommodation Request Letter",
      subtitle: "ADA Title I Accommodation Letter",
      meta: [
        { label: "Case", value: caseId },
        { label: "Client", value: l.clientName },
        { label: "Created", value: new Date(l.createdAt).toLocaleDateString() },
      ],
      sections: [
        { heading: "", body },
        { heading: "Barrier analysis", body: l.barrierAnalysis },
        { heading: "JAN citation", body: l.janCitation },
      ],
    };
  }

  if (docId.startsWith("par-")) {
    const r = loadProblemAnalysisReports().find(
      (x) => x.id === docId.slice("par-".length) && x.caseId === caseId,
    );
    if (!r) return null;
    return {
      title: `Problem Analysis Report — ${r.employerName}`,
      subtitle: "Discrimination Documentation",
      meta: [
        { label: "Case", value: caseId },
        { label: "Client", value: r.clientName },
        { label: "Created", value: new Date(r.createdAt).toLocaleDateString() },
      ],
      sections: [
        { heading: "Executive summary", body: r.executiveSummary },
        { heading: "Pattern analysis", body: r.patternAnalysis },
        {
          heading: "Recommended next steps",
          body: r.nextSteps.map((s, i) => `${i + 1}. ${s}`).join("\n"),
        },
      ],
    };
  }

  if (docId.startsWith("eeoc-")) {
    const c = loadEEOCCharges().find(
      (x) => x.id === docId.slice("eeoc-".length) && x.caseId === caseId,
    );
    if (!c) return null;
    return {
      title: `EEOC Charge of Discrimination — ${c.employerName}`,
      subtitle: "EEOC Form 5 Particulars",
      meta: [
        { label: "Case", value: caseId },
        { label: "Complainant", value: c.clientName },
        { label: "Respondent", value: c.employerName },
        { label: "Created", value: new Date(c.createdAt).toLocaleDateString() },
      ],
      sections: [
        { heading: "Particulars", body: c.formalParticulars },
        { heading: "Legal analysis", body: c.legalAnalysis },
        {
          heading: "Recommended next steps",
          body: c.recommendedNextSteps
            .map((s, i) => `${i + 1}. ${s}`)
            .join("\n"),
        },
      ],
    };
  }

  if (docId.startsWith("ocr-")) {
    const c = loadOCRComplaints().find(
      (x) => x.id === docId.slice("ocr-".length) && x.caseId === caseId,
    );
    if (!c) return null;
    return {
      title: `Civil Rights Complaint — ${c.respondentName}`,
      subtitle: `${c.agency} Complaint`,
      meta: [
        { label: "Case", value: caseId },
        { label: "Complainant", value: c.clientName },
        { label: "Respondent", value: c.respondentName },
        { label: "Created", value: new Date(c.createdAt).toLocaleDateString() },
      ],
      sections: [
        { heading: "Formal complaint", body: c.formalComplaint },
        { heading: "Legal basis", body: c.legalBasis },
        {
          heading: "Remedies sought",
          body: c.remediesSought.map((s, i) => `${i + 1}. ${s}`).join("\n"),
        },
      ],
    };
  }

  if (docId.startsWith("bp-")) {
    const p = loadBusinessPlans().find(
      (x) => x.id === docId.slice("bp-".length) && x.caseId === caseId,
    );
    if (!p) return null;
    return {
      title: `Business Plan — ${p.businessName}`,
      subtitle: "VR-Fundable Business Plan",
      meta: [
        { label: "Case", value: caseId },
        { label: "Owner", value: p.clientName },
        { label: "Concept", value: p.conceptSummary },
      ],
      sections: [
        { heading: "Executive summary", body: p.executiveSummary },
        { heading: "Product / service", body: p.productService },
        { heading: "Problem solved", body: p.problemSolved },
        {
          heading: "Unique value proposition",
          body: p.uniqueValueProposition,
        },
        {
          heading: "Funding pathways",
          body: p.fundingPathways.map((s, i) => `${i + 1}. ${s}`).join("\n"),
        },
      ],
    };
  }

  return null;
}
