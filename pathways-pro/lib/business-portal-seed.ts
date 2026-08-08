"use client";

// Seeds the demo Business / Vendor / Forensic portal data the first time
// a counselor, business user, or vendor user lands on any portal page.
// Safe to call repeatedly — short-circuits if any seed key is already
// populated.

import {
  loadBusinessOrgs,
  saveBusinessOrgs,
  loadVendorOrgs,
  saveVendorOrgs,
  loadPlacements,
  savePlacements,
  loadEngagements,
  saveEngagements,
  loadCoachingLogs,
  saveCoachingLogs,
  loadDocuments,
  saveDocuments,
  loadRoutes,
  saveRoutes,
  loadAuthorizations,
  saveAuthorizations,
  appendActivity,
  loadActivity,
  type BusinessOrg,
  type VendorOrg,
  type Placement,
  type ForensicEngagement,
  type CoachingLogEntry,
  type VaultDocument,
  type DocumentRoute,
  type ServiceAuthorization,
} from "./business-portal";

const SEED_FLAG = "pathways-pro:business-portal-seeded-v1";

export function seedBusinessPortal() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_FLAG) === "1") return;

  // ── Business orgs ──
  const businessOrgs: Record<string, BusinessOrg> = {
    "org-acme": {
      id: "org-acme",
      legalName: "Acme Logistics",
      industry: "Warehousing & distribution",
      size: "250+",
      hqCity: "Chicago",
      hqState: "IL",
      hqZip: "60617",
      primaryContact: "Aisha Hassan · Director of HR",
      status: "active",
      createdAt: daysAgo(120),
    },
    "org-meridian": {
      id: "org-meridian",
      legalName: "Meridian Claims",
      industry: "Workers' comp carrier",
      size: "250+",
      hqCity: "Schaumburg",
      hqState: "IL",
      hqZip: "60173",
      primaryContact: "Jules Fontaine · Sr. WC Adjuster",
      status: "active",
      createdAt: daysAgo(90),
    },
  };
  saveBusinessOrgs({ ...loadBusinessOrgs(), ...businessOrgs });

  // ── Vendor orgs ──
  const vendorOrgs: Record<string, VendorOrg> = {
    "vendor-vocconn": {
      id: "vendor-vocconn",
      legalName: "Vocational Connections, Inc.",
      vendorType: "crp",
      stateVendorId: "IL-CRP-4421",
      hqCity: "Chicago",
      hqState: "IL",
      hqZip: "60608",
      status: "approved",
      approvedAt: daysAgo(200),
      createdAt: daysAgo(220),
    },
    "vendor-piedmont": {
      id: "vendor-piedmont",
      legalName: "Piedmont Forensic Vocational",
      vendorType: "forensic",
      stateVendorId: "IL-FOR-1208",
      hqCity: "Oak Park",
      hqState: "IL",
      hqZip: "60302",
      status: "approved",
      approvedAt: daysAgo(180),
      createdAt: daysAgo(190),
    },
  };
  saveVendorOrgs({ ...loadVendorOrgs(), ...vendorOrgs });

  // ── Placements ──
  const placements: Placement[] = [
    {
      id: "place-marcus-acme",
      caseId: "VR-2026-0029",
      clientName: "Marcus Thomas",
      counselorEmail: "candace.metcalf@pathwayspro.app",
      employerOrgId: "org-acme",
      employerOrgName: "Acme Logistics",
      jobTitle: "Welder I",
      socCode: "51-4121.07",
      hireDate: daysAgo(53).slice(0, 10),
      hourlyWage: 24.5,
      weeklyHours: 40,
      integratedSetting: true,
      status: "active",
      dayCount: 53,
      vendorOrgId: "vendor-vocconn",
      vendorOrgName: "Vocational Connections, Inc.",
      jobCoachName: "Damon Reyes, CESP",
      accommodationsInPlace: 3,
      accommodationsOpen: 1,
    },
    {
      id: "place-jordan-acme",
      caseId: "VR-2026-0041",
      clientName: "Jordan Hayes",
      counselorEmail: "candace.metcalf@pathwayspro.app",
      employerOrgId: "org-acme",
      employerOrgName: "Acme Logistics",
      jobTitle: "Medical Records Specialist",
      socCode: "29-2072.00",
      hireDate: daysAgo(31).slice(0, 10),
      hourlyWage: 21.0,
      weeklyHours: 36,
      integratedSetting: true,
      status: "active",
      dayCount: 31,
      vendorOrgId: "vendor-vocconn",
      vendorOrgName: "Vocational Connections, Inc.",
      jobCoachName: "Damon Reyes, CESP",
      accommodationsInPlace: 2,
      accommodationsOpen: 0,
    },
    {
      id: "place-diana-acme",
      caseId: "VR-2026-0014",
      clientName: "Diana Reyes",
      counselorEmail: "candace.metcalf@pathwayspro.app",
      employerOrgId: "org-acme",
      employerOrgName: "Acme Logistics",
      jobTitle: "Bookkeeping Clerk",
      socCode: "43-3031.00",
      hireDate: daysAgo(88).slice(0, 10),
      hourlyWage: 23.75,
      weeklyHours: 32,
      integratedSetting: true,
      status: "active",
      dayCount: 88,
      vendorOrgId: "vendor-vocconn",
      vendorOrgName: "Vocational Connections, Inc.",
      jobCoachName: "Damon Reyes, CESP",
      accommodationsInPlace: 4,
      accommodationsOpen: 0,
    },
  ];
  savePlacements([...loadPlacements(), ...placements]);

  // ── Forensic engagement ──
  const engagement: ForensicEngagement = {
    id: "eng-smith-acme",
    vendorOrgId: "vendor-piedmont",
    expertUserEmail: "p.osei@piedmontforensic.com",
    expertName: "Priya Osei, CRC · CVE",
    retainingParty: "carrier",
    retainingOrgId: "org-meridian",
    retainingOrgName: "Meridian Claims",
    matterCaption: "Smith v. Acme Logistics",
    jurisdiction: "IL",
    venue: "IWCC — Chicago",
    kind: "wage_earning_capacity",
    caseId: undefined,
    clientName: "Robert Smith",
    retainedOn: daysAgo(45).slice(0, 10),
    status: "issued",
    hourlyRate: 285,
    hoursBilled: 14.5,
  };
  saveEngagements([...loadEngagements(), engagement]);

  // ── Coaching logs ──
  const logs: CoachingLogEntry[] = [
    {
      id: "log-1",
      placementId: "place-marcus-acme",
      vendorOrgId: "vendor-vocconn",
      occurredAt: daysAgo(2),
      durationMin: 90,
      encounterType: "in-person",
      setting: "on-site",
      intervention: "Task-coaching: torch handling, joint preparation",
      outcome: "Met production target for shift; no rework flagged",
      signedByVendor: true,
      signedByCounselor: false,
    },
    {
      id: "log-2",
      placementId: "place-marcus-acme",
      vendorOrgId: "vendor-vocconn",
      occurredAt: daysAgo(5),
      durationMin: 60,
      encounterType: "in-person",
      setting: "on-site",
      intervention: "Social skills: shift handoff with line supervisor",
      outcome: "Initiated handoff unprompted on 2 of 2 shifts",
      signedByVendor: true,
      signedByCounselor: false,
    },
    {
      id: "log-3",
      placementId: "place-jordan-acme",
      vendorOrgId: "vendor-vocconn",
      occurredAt: daysAgo(4),
      durationMin: 45,
      encounterType: "virtual",
      setting: "office",
      intervention: "Workflow: EHR triage queue prioritization",
      outcome: "Cleared backlog of 38 records; no quality flags from QA",
      signedByVendor: true,
      signedByCounselor: false,
    },
  ];
  saveCoachingLogs([...loadCoachingLogs(), ...logs]);

  // ── Authorizations ──
  const auths: ServiceAuthorization[] = [
    {
      id: "auth-marcus-jc",
      caseId: "VR-2026-0029",
      vendorOrgId: "vendor-vocconn",
      vendorOrgName: "Vocational Connections, Inc.",
      serviceCode: "VR-JC-90",
      serviceLabel: "90-day job coaching",
      rate: 82.5,
      unitsAuthorized: 60,
      unitsUsed: 28,
      startDate: daysAgo(53).slice(0, 10),
      endDate: daysAhead(37).slice(0, 10),
      status: "active",
      requestedAt: daysAgo(55),
      decisionedByEmail: "candace.metcalf@pathwayspro.app",
      decisionedAt: daysAgo(54),
    },
    {
      id: "auth-jordan-rs",
      caseId: "VR-2026-0041",
      vendorOrgId: "vendor-vocconn",
      vendorOrgName: "Vocational Connections, Inc.",
      serviceCode: "VR-RS-04",
      serviceLabel: "Resume + interview prep package",
      rate: 95,
      unitsAuthorized: 6,
      unitsUsed: 0,
      startDate: daysAhead(0).slice(0, 10),
      endDate: daysAhead(45).slice(0, 10),
      status: "requested",
      requestedAt: daysAgo(1),
    },
  ];
  saveAuthorizations([...loadAuthorizations(), ...auths]);

  // ── Vault documents + tri-party routes ──
  const docs: VaultDocument[] = [
    {
      id: "doc-wec-smith",
      title: "Smith — Wage-Earning Capacity Report (final)",
      kind: "wec",
      routingTemplate: "forensic-deliverable",
      relatedEngagementId: "eng-smith-acme",
      uploadedByEmail: "p.osei@piedmontforensic.com",
      uploadedByName: "Priya Osei, CRC · CVE",
      uploadedAt: daysAgo(3),
      sizeBytes: 248_311,
      sha256: "f9c1a8…b22e",
    },
    {
      id: "doc-fce-marcus",
      title: "Thomas — Functional Capacity Evaluation",
      kind: "fce",
      routingTemplate: "fce-rtw",
      relatedCaseId: "VR-2026-0029",
      relatedPlacementId: "place-marcus-acme",
      uploadedByEmail: "p.osei@piedmontforensic.com",
      uploadedByName: "Priya Osei, CRC · CVE",
      uploadedAt: daysAgo(14),
      sizeBytes: 184_220,
      sha256: "11a7d2…71fc",
    },
    {
      id: "doc-jd-welder",
      title: "Welder I — Job Description ADA Analysis",
      kind: "jd-analysis",
      routingTemplate: "jd-analysis",
      uploadedByEmail: "aisha.hassan@acmelogistics.com",
      uploadedByName: "Aisha Hassan",
      uploadedAt: daysAgo(60),
      sizeBytes: 92_140,
      sha256: "55b9e1…0a1d",
    },
    {
      id: "doc-msa-acme",
      title: "Acme Logistics — Master Service Agreement",
      kind: "msa",
      routingTemplate: "org-onboarding",
      uploadedByEmail: "candace.metcalf@pathwayspro.app",
      uploadedByName: "Candace Metcalf, CRC · LPC",
      uploadedAt: daysAgo(118),
      sizeBytes: 156_480,
      sha256: "a3f082…c94b",
    },
    {
      id: "doc-coi-acme",
      title: "Pathways Pro — Certificate of Insurance (current)",
      kind: "coi",
      routingTemplate: "org-onboarding",
      uploadedByEmail: "candace.metcalf@pathwayspro.app",
      uploadedByName: "Candace Metcalf, CRC · LPC",
      uploadedAt: daysAgo(21),
      sizeBytes: 41_205,
      sha256: "7d61ef…3a08",
    },
  ];
  saveDocuments([...loadDocuments(), ...docs]);

  const routes: DocumentRoute[] = [
    // WEC: vendor expert → retaining carrier → (no counselor since case_id null)
    {
      id: "rt-wec-expert",
      documentId: "doc-wec-smith",
      recipientKind: "user",
      recipientEmail: "p.osei@piedmontforensic.com",
      recipientLabel: "Priya Osei, CRC · CVE (author)",
      accessKind: "download",
      routedAt: daysAgo(3),
      acknowledgedAt: daysAgo(3),
    },
    {
      id: "rt-wec-carrier",
      documentId: "doc-wec-smith",
      recipientKind: "org",
      recipientOrgId: "org-meridian",
      recipientLabel: "Meridian Claims",
      accessKind: "download",
      routedAt: daysAgo(3),
    },
    // FCE: counselor → employer (so on-site supervisor knows the restrictions)
    {
      id: "rt-fce-counselor",
      documentId: "doc-fce-marcus",
      recipientKind: "user",
      recipientEmail: "candace.metcalf@pathwayspro.app",
      recipientLabel: "Candace Metcalf, CRC · LPC",
      accessKind: "view",
      routedAt: daysAgo(14),
    },
    {
      id: "rt-fce-employer",
      documentId: "doc-fce-marcus",
      recipientKind: "org",
      recipientOrgId: "org-acme",
      recipientLabel: "Acme Logistics",
      accessKind: "view",
      routedAt: daysAgo(14),
      acknowledgedAt: daysAgo(13),
    },
    // JD analysis: routed to its own employer + assigned counselor for SOC match
    {
      id: "rt-jd-employer",
      documentId: "doc-jd-welder",
      recipientKind: "org",
      recipientOrgId: "org-acme",
      recipientLabel: "Acme Logistics",
      accessKind: "download",
      routedAt: daysAgo(60),
      acknowledgedAt: daysAgo(60),
    },
    {
      id: "rt-jd-counselor",
      documentId: "doc-jd-welder",
      recipientKind: "user",
      recipientEmail: "candace.metcalf@pathwayspro.app",
      recipientLabel: "Candace Metcalf, CRC · LPC",
      accessKind: "view",
      routedAt: daysAgo(60),
      acknowledgedAt: daysAgo(58),
    },
    // MSA: signed at onboarding, 118 days ago
    {
      id: "rt-msa-acme",
      documentId: "doc-msa-acme",
      recipientKind: "org",
      recipientOrgId: "org-acme",
      recipientLabel: "Acme Logistics",
      accessKind: "sign",
      routedAt: daysAgo(118),
      acknowledgedAt: daysAgo(115),
    },
    // COI: freshly renewed, awaiting HR's annual acknowledgment
    {
      id: "rt-coi-acme",
      documentId: "doc-coi-acme",
      recipientKind: "org",
      recipientOrgId: "org-acme",
      recipientLabel: "Acme Logistics",
      accessKind: "acknowledge",
      routedAt: daysAgo(21),
    },
  ];
  saveRoutes([...loadRoutes(), ...routes]);

  // ── Activity feed (newest first when displayed) ──
  if (loadActivity().length === 0) {
    appendActivity({
      kind: "doc_uploaded",
      summary: "Priya Osei uploaded Smith — Wage-Earning Capacity Report",
      actorEmail: "p.osei@piedmontforensic.com",
      actorRole: "vendor",
      engagementId: "eng-smith-acme",
      documentId: "doc-wec-smith",
      payload: { retainingOrgId: "org-meridian", vendorOrgId: "vendor-piedmont" },
      occurredAt: daysAgo(3),
    });
    appendActivity({
      kind: "milestone_logged",
      summary: "Damon Reyes logged Marcus T. — Day 30 milestone met",
      actorEmail: "damon.r@vocconnections.org",
      actorRole: "vendor",
      caseId: "VR-2026-0029",
      placementId: "place-marcus-acme",
      payload: { vendorOrgId: "vendor-vocconn", employerOrgId: "org-acme" },
      occurredAt: daysAgo(23),
    });
    appendActivity({
      kind: "auth_requested",
      summary: "Vocational Connections requested 6 units of resume prep for Jordan Hayes",
      actorEmail: "damon.r@vocconnections.org",
      actorRole: "vendor",
      caseId: "VR-2026-0041",
      payload: { vendorOrgId: "vendor-vocconn", authId: "auth-jordan-rs" },
      occurredAt: daysAgo(1),
    });
    appendActivity({
      kind: "accommodation_verified",
      summary: "Acme Logistics confirmed adjustable workstation installed for Marcus T.",
      actorEmail: "aisha.hassan@acmelogistics.com",
      actorRole: "business",
      caseId: "VR-2026-0029",
      placementId: "place-marcus-acme",
      payload: { employerOrgId: "org-acme" },
      occurredAt: daysAgo(40),
    });
    appendActivity({
      kind: "doc_acknowledged",
      summary: "Acme Logistics acknowledged Thomas FCE",
      actorEmail: "aisha.hassan@acmelogistics.com",
      actorRole: "business",
      documentId: "doc-fce-marcus",
      payload: { employerOrgId: "org-acme" },
      occurredAt: daysAgo(13),
    });
  }

  window.localStorage.setItem(SEED_FLAG, "1");
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}
function daysAhead(n: number): string {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();
}
