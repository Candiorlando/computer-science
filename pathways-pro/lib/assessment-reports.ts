"use client";

// Consolidated assessment report marker. The counselor clicks
// "Generate assessment report" on a client's Assessments tab; we
// record that a report was generated (who + when). The report BODY is
// compiled live from the case's completed assessments at render time
// (see renderDocument in case-documents.ts), so it always reflects
// the latest responses and counselor-approved interpretations.

export interface AssessmentReportMarker {
  generatedAt: string;
  generatedByName: string;
}

const KEY = "pathways-pro:assessment-reports-v1";

type Map = Record<string, AssessmentReportMarker>;

function readAll(): Map {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Map) : {};
  } catch {
    return {};
  }
}

function writeAll(map: Map) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

export function loadAssessmentReport(
  caseId: string,
): AssessmentReportMarker | null {
  return readAll()[caseId] ?? null;
}

export function generateAssessmentReport(
  caseId: string,
  generatedByName: string,
): AssessmentReportMarker {
  const marker: AssessmentReportMarker = {
    generatedAt: new Date().toISOString(),
    generatedByName,
  };
  const all = readAll();
  all[caseId] = marker;
  writeAll(all);
  return marker;
}
