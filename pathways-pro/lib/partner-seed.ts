"use client";

import {
  appendCEEngagement,
  appendOpportunity,
  appendPartnerPlacement,
  loadCEEngagements,
  loadOpportunities,
  loadPartnerOrgs,
  loadPartnerPlacements,
  savePartnerOrgs,
  type CustomizedEmploymentEngagement,
  type Opportunity,
  type PartnerOrg,
  type PartnerPlacement,
} from "./employment-partners";

const SEED_FLAG = "pathways-pro:partner-seeded-v1";

export function seedPartnerDemo() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_FLAG) === "1") return;

  // Partner org records (mirror the user accounts in users.ts)
  const orgs: Record<string, PartnerOrg> = {
    "partner-northbranch": {
      id: "partner-northbranch",
      legalName: "North Branch Cafe",
      partnerOrgType: "small-employer",
      primaryContact: "Jana Weber — Owner",
      industry: "Food service",
      hqCity: "Chicago",
      hqState: "IL",
      hqZip: "60622",
      participatesInCustomizedEmployment: true,
      participatesInSupportedEmployment: true,
      approvedAt: daysAgo(180),
      createdAt: daysAgo(200),
    },
    "partner-cpl-outreach": {
      id: "partner-cpl-outreach",
      legalName: "Chicago Public Libraries — Workforce Programs",
      partnerOrgType: "government",
      primaryContact: "Reggie Park — Workforce Development",
      industry: "Public library / workforce",
      hqCity: "Chicago",
      hqState: "IL",
      hqZip: "60602",
      participatesInCustomizedEmployment: true,
      participatesInSupportedEmployment: true,
      approvedAt: daysAgo(140),
      createdAt: daysAgo(150),
    },
  };
  savePartnerOrgs({ ...loadPartnerOrgs(), ...orgs });

  if (loadOpportunities().length === 0) {
    const opps: Opportunity[] = [
      {
        id: "opp-nb-barback",
        partnerOrgId: "partner-northbranch",
        partnerOrgName: "North Branch Cafe",
        postedByEmail: "jana.weber@northbranchcafe.com",
        title: "Barback / Prep Assistant",
        kind: "supported-employment",
        description:
          "Mornings, batched prep tasks (slicing, restocking, dish line). Quiet workspace, clear visual checklists, fixed routine.",
        socCode: "35-9011.00",
        hoursPerWeek: 24,
        wage: "$17/hr + tips share",
        location: "Chicago, IL 60622",
        startDate: daysAhead(14).slice(0, 10),
        willingToCarveRole: true,
        willingToAdjustSchedule: true,
        accommodationsAvailable: [
          "Noise-reduction headphones during prep",
          "Visual task checklists",
          "Job coach welcome on site",
        ],
        status: "open",
        createdAt: daysAgo(7),
      },
      {
        id: "opp-cpl-shelver",
        partnerOrgId: "partner-cpl-outreach",
        partnerOrgName: "Chicago Public Libraries — Workforce Programs",
        postedByEmail: "outreach@chicagolibraries.org",
        title: "Branch Pages — Materials Handling (Pilot)",
        kind: "customized-employment",
        description:
          "Customized role for one returning worker with TBI history. Carved from existing shelver duties; focuses on call-number sorting (a strength) and removes patron-facing component.",
        socCode: "43-4121.00",
        hoursPerWeek: 20,
        wage: "$19/hr",
        location: "Lincoln Park branch · Chicago, IL 60614",
        startDate: daysAhead(21).slice(0, 10),
        willingToCarveRole: true,
        willingToAdjustSchedule: true,
        accommodationsAvailable: [
          "Quiet back-of-house workspace",
          "Single-task focus blocks",
          "Twice-weekly job-coach check-ins for first 90 days",
        ],
        status: "open",
        createdAt: daysAgo(4),
      },
    ];
    opps.forEach(appendOpportunity);
  }

  if (loadCEEngagements().length === 0) {
    const ce: CustomizedEmploymentEngagement[] = [
      {
        id: "ce-nb-marcus",
        partnerOrgId: "partner-northbranch",
        partnerOrgName: "North Branch Cafe",
        caseId: "VR-2026-0029",
        clientName: "Marcus Thomas",
        counselorEmail: "candace.metcalf@idhs.illinois.gov",
        discoveryNotes:
          "Marcus thrives on routine and physical work. Lost track of time when restocking the welding supply room at his last job. Drained quickly by customer-facing roles. Energized by working alongside one or two trusted coworkers.",
        clientStrengths: [
          "Reliable physical pacing across a full shift",
          "Strong pattern recognition for restocking and inventory",
          "Calm under time pressure",
        ],
        clientInterests: [
          "Hands-on prep work",
          "Working in a small, consistent team",
          "Mornings",
        ],
        carvedTasks: [
          "Open-shift produce prep",
          "Dish-line during peak (no order taking)",
          "Inventory restock between rushes",
        ],
        proposedTitle: "Morning Prep & Inventory Lead",
        proposedHoursPerWeek: 24,
        worksiteAccommodations: [
          "Noise-reduction headphones during dish line",
          "Visual checklists posted at each station",
          "First 30 days with job coach 3x/week",
        ],
        currentStage: "job-design",
        milestones: [
          {
            label: "Complete Discovery (4 sessions)",
            targetDate: daysAgo(15).slice(0, 10),
            metAt: daysAgo(14),
          },
          {
            label: "Carved-role proposal drafted",
            targetDate: daysAhead(7).slice(0, 10),
          },
          {
            label: "Employer negotiation meeting",
            targetDate: daysAhead(21).slice(0, 10),
          },
          {
            label: "30-day paid trial start",
            targetDate: daysAhead(45).slice(0, 10),
          },
        ],
        createdAt: daysAgo(25),
        updatedAt: daysAgo(2),
      },
    ];
    ce.forEach(appendCEEngagement);
  }

  if (loadPartnerPlacements().length === 0) {
    const place: PartnerPlacement = {
      id: "place-cpl-leon",
      partnerOrgId: "partner-cpl-outreach",
      partnerOrgName: "Chicago Public Libraries — Workforce Programs",
      opportunityId: "opp-cpl-shelver",
      opportunityTitle: "Branch Pages — Materials Handling (Pilot)",
      caseId: "VR-2026-0052",
      clientName: "Leon Washington",
      counselorEmail: "candace.metcalf@idhs.illinois.gov",
      hireDate: daysAgo(12).slice(0, 10),
      status: "stabilizing",
      hoursPerWeek: 16,
      wage: "$19/hr",
      isCustomizedEmployment: false,
      createdAt: daysAgo(14),
    };
    appendPartnerPlacement(place);
  }

  window.localStorage.setItem(SEED_FLAG, "1");
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}
function daysAhead(n: number): string {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();
}
