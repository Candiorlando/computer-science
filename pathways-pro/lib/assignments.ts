"use client";

// Counselor-assigned assessments per client. The counselor browses the
// Clinical Assessment Library and adds specific instruments to a client's
// case; the client only sees what was assigned to them.

export interface Assignment {
  assessmentName: string;
  acronym?: string;
  inAppPath?: string;
  externalUrl: string;
  cost: "free" | "proprietary" | "varies";
  priceTag?: string;
  domain: string;
  time: string;
  note?: string; // counselor's note ("please complete before next session")
  assignedBy: string;
  assignedAt: string;
  completedAt?: string;
  isComplete: boolean;
}

const KEY_PREFIX = "pathways-pro:assignments-v1:";

export function loadAssignments(caseId: string): Assignment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + caseId);
    return raw ? (JSON.parse(raw) as Assignment[]) : [];
  } catch {
    return [];
  }
}

export function saveAssignments(caseId: string, assignments: Assignment[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY_PREFIX + caseId, JSON.stringify(assignments));
}

export function addAssignment(caseId: string, assignment: Assignment) {
  const cur = loadAssignments(caseId);
  // Avoid duplicates by name
  if (cur.some((a) => a.assessmentName === assignment.assessmentName)) {
    return;
  }
  saveAssignments(caseId, [assignment, ...cur]);
}

export function removeAssignment(caseId: string, assessmentName: string) {
  const cur = loadAssignments(caseId);
  saveAssignments(
    caseId,
    cur.filter((a) => a.assessmentName !== assessmentName),
  );
}

export function markComplete(caseId: string, assessmentName: string) {
  const cur = loadAssignments(caseId);
  saveAssignments(
    caseId,
    cur.map((a) =>
      a.assessmentName === assessmentName
        ? { ...a, isComplete: true, completedAt: new Date().toISOString() }
        : a,
    ),
  );
}

export function isAssigned(caseId: string, assessmentName: string): boolean {
  return loadAssignments(caseId).some(
    (a) => a.assessmentName === assessmentName,
  );
}
