"use client";

// Case-isolated assessment storage. Every completed assessment is
// scoped to a single case (client caseId, business orgId, vendor
// orgId, or partner orgId). There is intentionally no global list —
// query helpers all require a case scope.
//
// Storage shape mirrors a normal case_assessments table.

import { recordCaseNoteEvent } from "./case-notes";

export type CaseScopeKind =
  | "client-case"
  | "business-org"
  | "vendor-org"
  | "partner-org";

export interface CaseAssessmentResponse {
  itemId: string;
  value: string | number | boolean;
}

export interface CaseAssessment {
  id: string;
  scopeKind: CaseScopeKind;
  scopeId: string;
  toolId: string;
  toolTitle: string;
  serviceId?: string;            // service the assessment is linked to
  administeredByEmail: string;
  administeredByName: string;
  administeredAt: string;
  responses: CaseAssessmentResponse[];

  // AI-drafted, counselor-edited
  aiDraftInterpretation?: string;
  counselorEditedInterpretation?: string;
  counselorApproved: boolean;
  counselorApprovedByEmail?: string;
  counselorApprovedAt?: string;
}

const KEY = "pathways-pro:case-assessments-v1";

function readAll(): CaseAssessment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CaseAssessment[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: CaseAssessment[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function newAssessmentId(): string {
  return "ca-" + Math.random().toString(36).slice(2, 10);
}

export function appendCaseAssessment(a: CaseAssessment) {
  writeAll([a, ...readAll()]);
  // Emit a case-note event so the case file's notes tab reflects the
  // activity. The note kind reuses existing client/business events
  // since they're already wired into the DAP renderer.
  if (a.scopeKind === "client-case") {
    recordCaseNoteEvent({
      kind: "tsa-completed",      // closest existing client kind
      participantType: "individual-client",
      caseId: a.scopeId,
      clientName: a.administeredByName,
      skillCount: a.responses.length,
    });
  } else if (a.scopeKind === "business-org") {
    recordCaseNoteEvent({
      kind: "business-service-released",   // reuse existing biz kind
      participantType: "business-vendor",
      orgId: a.scopeId,
      orgName: a.toolTitle,
      requesterName: a.administeredByName,
      serviceTitle: a.toolTitle,
      releasedByEmail: a.administeredByEmail,
    });
  } else if (a.scopeKind === "partner-org") {
    recordCaseNoteEvent({
      kind: "partner-document-uploaded",
      participantType: "employment-partner",
      partnerOrgId: a.scopeId,
      partnerOrgName: a.toolTitle,
      actorName: a.administeredByName,
      documentTitle: a.toolTitle,
      documentKind: "assessment",
    });
  }
}

export function updateCaseAssessment(
  id: string,
  patch: Partial<CaseAssessment>,
): CaseAssessment | null {
  const all = readAll();
  const next = all.map((a) => (a.id === id ? { ...a, ...patch } : a));
  writeAll(next);
  return next.find((a) => a.id === id) ?? null;
}

export function getCaseAssessment(id: string): CaseAssessment | null {
  return readAll().find((a) => a.id === id) ?? null;
}

export function assessmentsForScope(
  scopeKind: CaseScopeKind,
  scopeId: string,
): CaseAssessment[] {
  return readAll()
    .filter((a) => a.scopeKind === scopeKind && a.scopeId === scopeId)
    .sort(
      (a, b) =>
        Date.parse(b.administeredAt) - Date.parse(a.administeredAt),
    );
}

// ── AI interpretation (templated, deterministic) ──────────────────────
// Generates a draft interpretation from the assessment's items + the
// tool's aiInterpretationTemplate. Deterministic, free, replicable —
// the counselor edits and approves before it lands in the case file.

export interface InterpretationInput {
  toolTitle: string;
  promptTemplate: string;
  responses: { prompt: string; value: string }[];
}

export function draftInterpretation(input: InterpretationInput): string {
  const lines: string[] = [];
  lines.push(`Draft interpretation for ${input.toolTitle}.`);
  lines.push("");
  lines.push("RESPONSES:");
  for (const r of input.responses) {
    lines.push(`  • ${r.prompt} — ${r.value}`);
  }
  lines.push("");
  lines.push("RECOMMENDED FRAMING:");
  lines.push(`  ${input.promptTemplate}`);
  lines.push("");
  lines.push(
    "Counselor: review the responses above and shape this draft into a 2-3 paragraph clinical interpretation. Edit anything that doesn't reflect your judgment, then approve to lock the assessment into the case file.",
  );
  return lines.join("\n");
}
