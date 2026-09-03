"use client";

// Auto-seeds the demo caseload's client-reports with realistic Interest
// Profiler results so the counselor's Labor Market Analysis page has data
// to show the moment they pick any client.
//
// Each profile is hand-tuned to be consistent with the client's stated
// vocational goal (e.g. welding → high Realistic, bookkeeping → high
// Conventional), so the rankOccupations() output matches the goal.
//
// We never overwrite an existing report — a real client taking the
// actual /assessment will always win.

import { hollandCode } from "./assessments";
import { rankOccupations } from "./onet-data";
import { CLIENTS } from "./users";
import { loadClientReport, patchClientReport } from "./client-report";

interface SeedProfile {
  caseId: string;
  email: string;
  zipCode: string;
  educationLevel: string;
  goals: string;
  riasec: { R: number; I: number; A: number; S: number; E: number; C: number };
}

const SEED_PROFILES: SeedProfile[] = [
  {
    caseId: "VR-2026-0041",
    email: "jordan.hayes@vr.client",
    zipCode: "60652",
    educationLevel: "High school diploma / GED",
    goals: "Medical Office Administration",
    riasec: { R: 35, I: 50, A: 40, S: 75, E: 60, C: 85 },
  },
  {
    caseId: "VR-2026-0038",
    email: "priya.sharma@vr.client",
    zipCode: "60608",
    educationLevel: "Associate degree / vocational certificate",
    goals: "Early Childhood Education",
    riasec: { R: 30, I: 55, A: 75, S: 90, E: 50, C: 65 },
  },
  {
    caseId: "VR-2026-0029",
    email: "marcus.thomas@vr.client",
    zipCode: "60617",
    educationLevel: "High school diploma / GED",
    goals: "Welding Technology",
    riasec: { R: 90, I: 70, A: 40, S: 35, E: 45, C: 65 },
  },
  {
    caseId: "VR-2026-0014",
    email: "diana.reyes@vr.client",
    zipCode: "60629",
    educationLevel: "Some college",
    goals: "Bookkeeping & Accounting",
    riasec: { R: 25, I: 70, A: 30, S: 50, E: 65, C: 90 },
  },
  {
    caseId: "VR-2026-0052",
    email: "leon.washington@vr.client",
    zipCode: "60619",
    educationLevel: "Still in high school",
    goals: "IT Support (Pre-ETS)",
    riasec: { R: 70, I: 85, A: 45, S: 40, E: 50, C: 75 },
  },
  {
    caseId: "VR-DEMO-0001",
    email: "demo.client@pathwayspro.app",
    zipCode: "60652",
    educationLevel: "Some college",
    goals: "Information Technology",
    riasec: { R: 65, I: 90, A: 40, S: 45, E: 55, C: 75 },
  },
];

// Spreads Interest Profiler results across the demo caseload. Safe to call
// repeatedly — each client is skipped if their RIASEC is already on file
// (real assessment results always win).
export function seedDemoClientReports() {
  if (typeof window === "undefined") return;
  const now = new Date();
  // Backdate completion so it doesn't look suspiciously like "today".
  const completedAt = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000)
    .toISOString();

  for (const seed of SEED_PROFILES) {
    const client = CLIENTS[seed.email];
    if (!client) continue;
    const existing = loadClientReport(seed.caseId);
    if (existing?.riasec) continue;

    const code = hollandCode(seed.riasec);
    const matches = rankOccupations(seed.riasec)
      .slice(0, 10)
      .map((m) => ({
        title: m.occ.title,
        socCode: m.occ.socCode,
        fit: Math.round(m.fit * 33),
        riasec: m.occ.riasec.join(""),
      }));

    patchClientReport(seed.caseId, client.name, {
      clientDob: client.dob,
      counselorName: client.counselorName,
      intake: {
        ...(existing?.intake || {}),
        zipCode: seed.zipCode,
        educationLevel: seed.educationLevel,
        goals: seed.goals,
      },
      riasec: seed.riasec,
      hollandCode: code,
      assessmentCompletedAt: completedAt,
      topMatches: matches,
    });
  }
}
