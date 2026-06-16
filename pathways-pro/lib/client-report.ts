"use client";

import type { UserProfile } from "./storage";
import type { TSAResult } from "./tsa-storage";
import type { IPE, IPEStatus } from "./ipe";

// Aggregated per-case client report, populated whenever the client completes
// any assessment. Lives in localStorage in the demo; in production this would
// sync via the backend so the counselor sees real-time client progress.
export interface ClientReport {
  caseId: string;
  clientName: string;
  clientDob?: string;
  counselorName?: string;
  intake?: UserProfile["intake"];
  bigFive?: UserProfile["bigFive"];
  riasec?: UserProfile["riasec"];
  hollandCode?: string;
  assessmentCompletedAt?: string;
  topMatches?: { title: string; socCode: string; fit: number; riasec: string }[];
  tsa?: TSAResult;
  ipeStatus?: IPEStatus;
  ipeUpdatedAt?: string;
  ipe?: IPE; // full IPE document (services, accommodations, signatures, ...)
  lastUpdated: string;
}

const KEY_PREFIX = "pathways-pro:client-report:v1:";

export function loadClientReport(caseId: string): ClientReport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + caseId);
    return raw ? (JSON.parse(raw) as ClientReport) : null;
  } catch {
    return null;
  }
}

export function saveClientReport(report: ClientReport) {
  if (typeof window === "undefined") return;
  report.lastUpdated = new Date().toISOString();
  window.localStorage.setItem(KEY_PREFIX + report.caseId, JSON.stringify(report));
}

export function patchClientReport(
  caseId: string,
  clientName: string,
  patch: Partial<ClientReport>,
) {
  const existing = loadClientReport(caseId);
  const next: ClientReport = {
    caseId,
    clientName,
    ...existing,
    ...patch,
    lastUpdated: new Date().toISOString(),
  };
  saveClientReport(next);
  return next;
}

export function listClientReports(): ClientReport[] {
  if (typeof window === "undefined") return [];
  const out: ClientReport[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(KEY_PREFIX)) {
      try {
        out.push(JSON.parse(window.localStorage.getItem(k)!) as ClientReport);
      } catch {}
    }
  }
  return out;
}
