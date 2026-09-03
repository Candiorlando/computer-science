"use client";

// Seeds the neutral pathwayspro.app demo accounts with:
//   - Business + Vendor orgs (mirroring the user accounts in users.ts)
//   - Employment Partner orgs
//   - Sample messages linking counselor.demo1 ↔ each external account
//   - Sample case-note events for each role
//   - Sample documents, service requests, deliverables
//
// Safe to call repeatedly — short-circuits via SEED_FLAG.

import {
  loadBusinessOrgs,
  loadVendorOrgs,
  saveBusinessOrgs,
  saveVendorOrgs,
} from "./business-portal";
import { loadPartnerOrgs, savePartnerOrgs } from "./employment-partners";
import { recordCaseNoteEvent } from "./case-notes";
import { getOrCreateContextThread, sendMessage } from "./messages";

const SEED_FLAG = "pathways-pro:demo-accounts-seeded-v1";

export function seedDemoAccounts() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_FLAG) === "1") return;

  // ── Business orgs ──
  saveBusinessOrgs({
    ...loadBusinessOrgs(),
    "org-smallco": {
      id: "org-smallco",
      legalName: "Smallco Inc.",
      industry: "Small business · retail",
      size: "10-49",
      hqCity: "Demo City",
      hqState: "IL",
      hqZip: "60601",
      primaryContact: "Sam Cooper · Owner / HR Lead",
      status: "active",
      createdAt: daysAgo(120),
    },
    "org-corporate": {
      id: "org-corporate",
      legalName: "Corporate Industries",
      industry: "Corporate professional services",
      size: "250+",
      hqCity: "Demo City",
      hqState: "IL",
      hqZip: "60602",
      primaryContact: "Morgan Patel · VP of People",
      status: "active",
      createdAt: daysAgo(180),
    },
    "org-nonprofit": {
      id: "org-nonprofit",
      legalName: "Helping Hands Foundation",
      industry: "Nonprofit · social services",
      size: "50-249",
      hqCity: "Demo City",
      hqState: "IL",
      hqZip: "60603",
      primaryContact: "Avery Singh · Director of Operations",
      status: "active",
      createdAt: daysAgo(95),
    },
  });

  // ── Vendor orgs ──
  saveVendorOrgs({
    ...loadVendorOrgs(),
    "vendor-pathwayat": {
      id: "vendor-pathwayat",
      legalName: "Pathway AT Provider",
      vendorType: "ergonomic",
      stateVendorId: "DEMO-AT-001",
      hqCity: "Demo City",
      hqState: "IL",
      hqZip: "60604",
      status: "approved",
      approvedAt: daysAgo(160),
      createdAt: daysAgo(180),
    },
    "vendor-futureskills": {
      id: "vendor-futureskills",
      legalName: "FutureSkills Training Co.",
      vendorType: "training",
      stateVendorId: "DEMO-TR-002",
      hqCity: "Demo City",
      hqState: "IL",
      hqZip: "60605",
      status: "approved",
      approvedAt: daysAgo(140),
      createdAt: daysAgo(150),
    },
    "vendor-inclusiveaccess": {
      id: "vendor-inclusiveaccess",
      legalName: "Inclusive Access Consulting",
      vendorType: "ergonomic",
      stateVendorId: "DEMO-AX-003",
      hqCity: "Demo City",
      hqState: "IL",
      hqZip: "60606",
      status: "approved",
      approvedAt: daysAgo(110),
      createdAt: daysAgo(130),
    },
  });

  // ── Partner orgs ──
  savePartnerOrgs({
    ...loadPartnerOrgs(),
    "partner-communityco": {
      id: "partner-communityco",
      legalName: "Community Connections Co-op",
      partnerOrgType: "small-employer",
      primaryContact: "Casey Lin · Owner / Hiring Manager",
      industry: "Co-op grocery & community kitchen",
      hqCity: "Demo City",
      hqState: "IL",
      hqZip: "60607",
      participatesInCustomizedEmployment: true,
      participatesInSupportedEmployment: true,
      approvedAt: daysAgo(95),
      createdAt: daysAgo(120),
    },
    "partner-brightside": {
      id: "partner-brightside",
      legalName: "Brightside Supported Employment",
      partnerOrgType: "nonprofit",
      primaryContact: "Reese Patel · Supported Employment Director",
      industry: "Supported employment provider",
      hqCity: "Demo City",
      hqState: "IL",
      hqZip: "60608",
      participatesInCustomizedEmployment: true,
      participatesInSupportedEmployment: true,
      approvedAt: daysAgo(150),
      createdAt: daysAgo(180),
    },
    "partner-launchnetwork": {
      id: "partner-launchnetwork",
      legalName: "Launch Internship Network",
      partnerOrgType: "community-org",
      primaryContact: "Jordan Reyes · Internship Programs Lead",
      industry: "Internships / apprenticeships network",
      hqCity: "Demo City",
      hqState: "IL",
      hqZip: "60609",
      participatesInCustomizedEmployment: false,
      participatesInSupportedEmployment: true,
      approvedAt: daysAgo(60),
      createdAt: daysAgo(75),
    },
  });

  // ── Sample messages (counselor.demo1 ↔ each external account) ──
  const counselor = {
    email: "counselor.demo1@pathwayspro.app",
    name: "Alex Morgan",
    role: "counselor" as const,
  };

  // Client A
  msg(
    { email: "client.jobseeker@pathwayspro.app", name: "Riley Anderson", role: "client" },
    counselor,
    "Customer service interview prep",
    { kind: "client-case", caseId: "VR-DEMO-A001", clientName: "Riley Anderson" },
    "Riley shared that she has a customer service interview Thursday morning. Plan covered.",
    daysAgo(3),
  );
  msg(
    counselor,
    { email: "client.jobseeker@pathwayspro.app", name: "Riley Anderson", role: "client" },
    "Customer service interview prep",
    { kind: "client-case", caseId: "VR-DEMO-A001", clientName: "Riley Anderson" },
    "Reviewed STAR-method scripts together — great session. Bring your accommodation request letter on Thursday.",
    daysAgo(3, 1),
  );

  // Client B
  msg(
    { email: "client.student@pathwayspro.app", name: "Taylor Brooks", role: "client" },
    counselor,
    "Pre-ETS college tour planning",
    { kind: "client-case", caseId: "VR-DEMO-B002", clientName: "Taylor Brooks" },
    "Can we schedule the engineering college visits for next month? My parents want to come too.",
    daysAgo(2),
  );

  // Client C
  msg(
    { email: "client.entrepreneur@pathwayspro.app", name: "Jordan Stevens", role: "client" },
    counselor,
    "Mobile photography business plan review",
    { kind: "client-case", caseId: "VR-DEMO-C003", clientName: "Jordan Stevens" },
    "Just finished the business concept matcher and got three options back. Photography services scored highest.",
    daysAgo(1),
  );

  // Business clients
  msg(
    { email: "business.smallco@pathwayspro.app", name: "Sam Cooper", role: "business" },
    counselor,
    "JD analysis for new cashier role",
    { kind: "business-org", orgId: "org-smallco", orgName: "Smallco Inc." },
    "We're hiring for two new cashiers. Want to make sure the JD is ADA-clean before posting.",
    daysAgo(4),
  );

  msg(
    { email: "business.corporate@pathwayspro.app", name: "Morgan Patel", role: "business" },
    counselor,
    "Annual ADA compliance audit kickoff",
    { kind: "business-org", orgId: "org-corporate", orgName: "Corporate Industries" },
    "Ready to schedule our Q3 audit. Same scope as last year plus our new remote-work program.",
    daysAgo(5),
  );

  msg(
    { email: "business.nonprofit@pathwayspro.app", name: "Avery Singh", role: "business" },
    counselor,
    "Inclusive hiring strategy follow-up",
    { kind: "business-org", orgId: "org-nonprofit", orgName: "Helping Hands Foundation" },
    "Board approved the inclusive hiring framework. Ready to roll out across our case management team.",
    daysAgo(6),
  );

  // Vendors
  msg(
    { email: "vendor.atprovider@pathwayspro.app", name: "Quinn Chen", role: "vendor" },
    counselor,
    "AT equipment quote for Riley",
    {
      kind: "vendor-org",
      vendorOrgId: "vendor-pathwayat",
      vendorOrgName: "Pathway AT Provider",
    },
    "Got the standing workstation quote — $1,180 with delivery + setup. Lead time 5 days.",
    daysAgo(2),
  );

  msg(
    { email: "vendor.training@pathwayspro.app", name: "Devon Williams", role: "vendor" },
    counselor,
    "Customer service certification cohort",
    {
      kind: "vendor-org",
      vendorOrgId: "vendor-futureskills",
      vendorOrgName: "FutureSkills Training Co.",
    },
    "New 6-week cohort starts October 4. Two seats available for VR-funded clients.",
    daysAgo(7),
  );

  msg(
    { email: "vendor.accessibility@pathwayspro.app", name: "Skyler Ortiz", role: "vendor" },
    counselor,
    "Digital accessibility report findings",
    {
      kind: "vendor-org",
      vendorOrgId: "vendor-inclusiveaccess",
      vendorOrgName: "Inclusive Access Consulting",
    },
    "Smallco's careers page has 14 WCAG AA gaps. Prioritized list attached — most are 30-minute fixes.",
    daysAgo(3),
  );

  // Employment Partners
  msg(
    { email: "partner.community@pathwayspro.app", name: "Casey Lin", role: "partner" },
    counselor,
    "Two carved roles ready for matching",
    {
      kind: "partner-org",
      partnerOrgId: "partner-communityco",
      partnerOrgName: "Community Connections Co-op",
    },
    "Posted the morning prep + afternoon stock roles. Both are CE-friendly. Send candidates.",
    daysAgo(4),
  );

  msg(
    { email: "partner.supported@pathwayspro.app", name: "Reese Patel", role: "partner" },
    counselor,
    "New supported employment placement",
    {
      kind: "partner-org",
      partnerOrgId: "partner-brightside",
      partnerOrgName: "Brightside Supported Employment",
    },
    "Day-30 milestone met for Taylor's mock placement. Job coach hours on track.",
    daysAgo(2),
  );

  msg(
    { email: "partner.internships@pathwayspro.app", name: "Jordan Reyes", role: "partner" },
    counselor,
    "Summer internship cohort applications",
    {
      kind: "partner-org",
      partnerOrgId: "partner-launchnetwork",
      partnerOrgName: "Launch Internship Network",
    },
    "12 internship sites confirmed. Application window opens next Monday for any Pre-ETS students.",
    daysAgo(5),
  );

  // ── Sample case-note events ──
  // Each new role gets one or two case notes auto-generated so the
  // Case Notes tab on their case file isn't empty.
  recordCaseNoteEvent({
    kind: "interest-profiler-completed",
    participantType: "individual-client",
    caseId: "VR-DEMO-A001",
    clientName: "Riley Anderson",
    hollandCode: "SEC",
    sessionAt: daysAgo(10),
  });
  recordCaseNoteEvent({
    kind: "resume-generated",
    participantType: "individual-client",
    caseId: "VR-DEMO-A001",
    clientName: "Riley Anderson",
    targetJob: "Customer service representative",
    sessionAt: daysAgo(8),
  });
  recordCaseNoteEvent({
    kind: "ipe-signed",
    participantType: "individual-client",
    caseId: "VR-DEMO-A001",
    clientName: "Riley Anderson",
    vocationalGoal: "Customer service representative (SOC 43-4051.00)",
    sessionAt: daysAgo(45),
  });

  recordCaseNoteEvent({
    kind: "interest-profiler-completed",
    participantType: "individual-client",
    caseId: "VR-DEMO-B002",
    clientName: "Taylor Brooks",
    hollandCode: "IRC",
    sessionAt: daysAgo(5),
  });

  recordCaseNoteEvent({
    kind: "concept-match-generated",
    participantType: "individual-client",
    caseId: "VR-DEMO-C003",
    clientName: "Jordan Stevens",
    hollandCode: "AER",
    conceptCount: 3,
    sessionAt: daysAgo(1),
  });

  recordCaseNoteEvent({
    kind: "business-service-requested",
    participantType: "business-vendor",
    orgId: "org-smallco",
    orgName: "Smallco Inc.",
    requesterName: "Sam Cooper",
    serviceTitle: "Job Task Analysis",
    urgency: "routine",
    notes: "Two new cashier roles — ADA-clean JD wanted.",
    scopeRole: "hr_director",
    sessionAt: daysAgo(4),
  });

  recordCaseNoteEvent({
    kind: "partner-opportunity-posted",
    participantType: "employment-partner",
    partnerOrgId: "partner-communityco",
    partnerOrgName: "Community Connections Co-op",
    actorName: "Casey Lin",
    opportunityTitle: "Morning Prep Lead",
    opportunityKind: "customized-employment",
    hoursPerWeek: 24,
    sessionAt: daysAgo(4),
  });

  recordCaseNoteEvent({
    kind: "partner-ce-selected",
    participantType: "employment-partner",
    partnerOrgId: "partner-brightside",
    partnerOrgName: "Brightside Supported Employment",
    actorName: "Reese Patel",
    sessionAt: daysAgo(60),
  });

  window.localStorage.setItem(SEED_FLAG, "1");
}

// ── helpers ──

interface PartLike {
  email: string;
  name: string;
  role: "counselor" | "client" | "business" | "vendor" | "partner";
}

function msg(
  from: PartLike,
  other: PartLike,
  subject: string,
  context: import("./messages").ThreadContext,
  body: string,
  isoOverride?: string,
) {
  const t = getOrCreateContextThread(subject, [from, other], context);
  const m = sendMessage(t.id, from, body);
  if (m && isoOverride && typeof window !== "undefined") {
    const raw = window.localStorage.getItem("pathways-pro:messages-v1");
    if (raw) {
      const all = JSON.parse(raw);
      const i = all.findIndex((x: { id: string }) => x.id === m.id);
      if (i >= 0) {
        all[i].createdAt = isoOverride;
        window.localStorage.setItem("pathways-pro:messages-v1", JSON.stringify(all));
      }
    }
  }
}

function daysAgo(d: number, extraHours = 0): string {
  return new Date(
    Date.now() - d * 24 * 60 * 60 * 1000 - extraHours * 60 * 60 * 1000,
  ).toISOString();
}
