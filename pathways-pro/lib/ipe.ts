// Individualized Plan for Employment (IPE) — types and storage.
// WIOA Title IV § 102(b) requires every VR client have a written IPE
// signed by both counselor and consumer.

export interface IPEAccommodations {
  workplace: string[];
  training: string[];
  assistiveTech: string[];
}

export interface IPESignature {
  signed: boolean;
  signedAt?: string;
  signedBy?: string;
}

export type IPEStatus =
  | "draft"
  | "pending-client-signature"
  | "signed"
  | "active";

export interface IPE {
  caseId: string;
  clientEmail: string;
  clientName: string;
  counselorEmail: string;
  counselorName: string;

  // Demographics & disability
  dob: string;
  primaryDisability: string;
  secondaryConditions: string;
  functionalLimitations: string[];

  // Vocational goal
  employmentGoal: string;
  goalSocCode: string;
  goalRationale: string;
  expectedWage: string;
  expectedOutlook: string;
  timelineMonths: number;

  // Services authorized
  vrServices: string[];
  trainingProvider: string;

  // Accommodations
  accommodations: IPEAccommodations;

  // Barriers and supports
  disabilityBarriers: string[];
  supports: string[];

  // Compliance
  wioaSection: string;
  reviewDate: string;

  // Signatures
  counselorSignature: IPESignature;
  clientSignature: IPESignature;

  status: IPEStatus;
  createdAt: string;
  updatedAt: string;
}

const KEY_PREFIX = "pathways-pro:ipe:v1:";

export function loadIPE(caseId: string): IPE | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + caseId);
    return raw ? (JSON.parse(raw) as IPE) : null;
  } catch {
    return null;
  }
}

export function saveIPE(ipe: IPE) {
  if (typeof window === "undefined") return;
  ipe.updatedAt = new Date().toISOString();
  window.localStorage.setItem(KEY_PREFIX + ipe.caseId, JSON.stringify(ipe));
}

export function listAllIPEs(): IPE[] {
  if (typeof window === "undefined") return [];
  const out: IPE[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i);
    if (k && k.startsWith(KEY_PREFIX)) {
      try {
        out.push(JSON.parse(window.localStorage.getItem(k)!) as IPE);
      } catch {}
    }
  }
  return out;
}

export function emptyIPE(
  caseId: string,
  clientEmail: string,
  clientName: string,
  counselorEmail: string,
  counselorName: string,
  dob: string,
): IPE {
  return {
    caseId,
    clientEmail,
    clientName,
    counselorEmail,
    counselorName,
    dob,
    primaryDisability: "",
    secondaryConditions: "",
    functionalLimitations: [],
    employmentGoal: "",
    goalSocCode: "",
    goalRationale: "",
    expectedWage: "",
    expectedOutlook: "",
    timelineMonths: 12,
    vrServices: [],
    trainingProvider: "",
    accommodations: { workplace: [], training: [], assistiveTech: [] },
    disabilityBarriers: [],
    supports: [],
    wioaSection: "WIOA Title IV § 102(b)",
    reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10),
    counselorSignature: { signed: false },
    clientSignature: { signed: false },
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
