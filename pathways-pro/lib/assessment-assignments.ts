"use client";

// Counselor → client assessment assignments. The counselor assigns an
// instrument from the client's case file; it appears in the client's
// portal under "Assigned to you"; the client completes it and the
// result lands in the same case-isolated assessment store the
// counselor already reviews/approves from.

export type AssignmentStatus = "assigned" | "completed" | "cancelled";

export interface AssessmentAssignment {
  id: string;
  toolId: string;
  toolTitle: string;
  caseId: string;
  clientName: string;
  assignedByEmail: string;
  assignedByName: string;
  assignedAt: string;
  note?: string;
  status: AssignmentStatus;
  completedAt?: string;
  caseAssessmentId?: string; // links to the CaseAssessment created on completion
}

const KEY = "pathways-pro:assessment-assignments-v1";

function readAll(): AssessmentAssignment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AssessmentAssignment[]) : [];
  } catch {
    return [];
  }
}

function writeAll(items: AssessmentAssignment[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function assignmentsForCase(caseId: string): AssessmentAssignment[] {
  return readAll()
    .filter((a) => a.caseId === caseId)
    .sort((a, b) => Date.parse(b.assignedAt) - Date.parse(a.assignedAt));
}

export function pendingAssignmentsForCase(
  caseId: string,
): AssessmentAssignment[] {
  return assignmentsForCase(caseId).filter((a) => a.status === "assigned");
}

export function getAssignment(id: string): AssessmentAssignment | null {
  return readAll().find((a) => a.id === id) ?? null;
}

export function assignAssessment(input: {
  toolId: string;
  toolTitle: string;
  caseId: string;
  clientName: string;
  assignedByEmail: string;
  assignedByName: string;
  note?: string;
}): AssessmentAssignment {
  const a: AssessmentAssignment = {
    id: "asg-" + Math.random().toString(36).slice(2, 10),
    ...input,
    assignedAt: new Date().toISOString(),
    status: "assigned",
  };
  writeAll([a, ...readAll()]);
  return a;
}

export function cancelAssignment(id: string) {
  writeAll(
    readAll().map((a) =>
      a.id === id ? { ...a, status: "cancelled" as const } : a,
    ),
  );
}

export function completeAssignment(id: string, caseAssessmentId: string) {
  writeAll(
    readAll().map((a) =>
      a.id === id
        ? {
            ...a,
            status: "completed" as const,
            completedAt: new Date().toISOString(),
            caseAssessmentId,
          }
        : a,
    ),
  );
}
