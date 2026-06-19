"use client";

// Seed sample messages and case notes across the demo accounts so the
// counselor Home page lands with real activity to look at on first
// open. Safe to call repeatedly — short-circuits once the seed flag is
// set in localStorage.

import {
  getOrCreateContextThread,
  sendMessage,
  type Participant,
} from "./messages";
import { recordCaseNoteEvent } from "./case-notes";
import { CLIENTS, COUNSELORS, getAllBusinessUsers, getAllVendorUsers } from "./users";

const SEED_FLAG = "pathways-pro:demo-messages-seeded-v1";

export function seedDemoMessages() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_FLAG) === "1") return;

  const candace = COUNSELORS["candace.metcalf@idhs.illinois.gov"];
  if (candace) {
    const cMarcus = CLIENTS["marcus.thomas@vr.client"];
    const cJordan = CLIENTS["jordan.hayes@vr.client"];
    const cLeon = CLIENTS["leon.washington@vr.client"];

    if (cMarcus) {
      const t = getOrCreateContextThread(
        "Welding apprenticeship paperwork",
        [partFromCounselor(candace), partFromClient(cMarcus)],
        { kind: "client-case", caseId: cMarcus.caseId, clientName: cMarcus.name },
      );
      sendMsgAt(
        t.id,
        partFromClient(cMarcus),
        "Hi Candace — I finished the ironworkers application but they're asking for a current safety card. Do you know if I can use my OSHA-10 from 2023?",
        daysAgo(2),
      );
      sendMsgAt(
        t.id,
        partFromCounselor(candace),
        "Hi Marcus — yes, the OSHA-10 is still good for two more months. Bring it Tuesday and we'll get the apprenticeship packet finalized.",
        daysAgo(2, 1),
      );
      sendMsgAt(
        t.id,
        partFromClient(cMarcus),
        "Great, thanks!",
        daysAgo(1),
      );
    }

    if (cJordan) {
      const t = getOrCreateContextThread(
        "Medical Records Specialist — next steps",
        [partFromCounselor(candace), partFromClient(cJordan)],
        { kind: "client-case", caseId: cJordan.caseId, clientName: cJordan.name },
      );
      sendMsgAt(
        t.id,
        partFromCounselor(candace),
        "Jordan — congrats on the Day-30 milestone at Acme. Your supervisor sent a great note. Let's review your accommodations at our next session.",
        daysAgo(4),
      );
      sendMsgAt(
        t.id,
        partFromClient(cJordan),
        "Thanks! The standing desk has been a huge help. Can we also talk about transit support for evening shifts?",
        daysAgo(3),
      );
    }

    if (cLeon) {
      const t = getOrCreateContextThread(
        "Pre-ETS — IT Support pathway",
        [partFromCounselor(candace), partFromClient(cLeon)],
        { kind: "client-case", caseId: cLeon.caseId, clientName: cLeon.name },
      );
      sendMsgAt(
        t.id,
        partFromCounselor(candace),
        "Leon — your guardian signed the consent. We can start the CompTIA ITF+ prep next week. I'll also send you the work-based learning tour list.",
        daysAgo(5),
      );
    }

    // Business: Acme HR Director
    const acme = getAllBusinessUsers()["aisha.hassan@acmelogistics.com"];
    if (acme) {
      const t = getOrCreateContextThread(
        "Welder I — JD analysis follow-up",
        [partFromCounselor(candace), partFromBusiness(acme)],
        { kind: "business-org", orgId: acme.orgId, orgName: acme.orgName },
      );
      sendMsgAt(
        t.id,
        partFromBusiness(acme),
        "Hi Candace — we got the JD analysis back. Two ADA risk flags, but the JAN suggestions look reasonable. Can your team source the adjustable workstation, or do we order direct?",
        daysAgo(7),
      );
      sendMsgAt(
        t.id,
        partFromCounselor(candace),
        "I can authorize the workstation as an AT service. Send the spec sheet and I'll get the PO going same day.",
        daysAgo(7, 2),
      );
    }

    // Business: Meridian Claims adjuster
    const meridian = getAllBusinessUsers()["j.fontaine@meridianclaims.com"];
    if (meridian) {
      const t = getOrCreateContextThread(
        "Smith v. Acme — WEC report routing",
        [partFromCounselor(candace), partFromBusiness(meridian)],
        { kind: "business-org", orgId: meridian.orgId, orgName: meridian.orgName },
      );
      sendMsgAt(
        t.id,
        partFromBusiness(meridian),
        "Candace, looping you in on the Smith WEC report — Priya issued yesterday. Defense counsel wants a methodology call before the depo.",
        daysAgo(2),
      );
    }

    // Vendor: Vocational Connections (job coach)
    const vocconn = getAllVendorUsers()["damon.r@vocconnections.org"];
    if (vocconn) {
      const t = getOrCreateContextThread(
        "Marcus T. — coaching hours utilization",
        [partFromCounselor(candace), partFromVendor(vocconn)],
        {
          kind: "vendor-org",
          vendorOrgId: vocconn.vendorOrgId,
          vendorOrgName: vocconn.vendorOrgName,
        },
      );
      sendMsgAt(
        t.id,
        partFromVendor(vocconn),
        "Hi Candace — Marcus is at 28/60 hours. We're on track for Day-90 retention. Two log entries posted this week need your sign-off.",
        daysAgo(3),
      );
    }

    // Vendor: Piedmont Forensic
    const piedmont = getAllVendorUsers()["p.osei@piedmontforensic.com"];
    if (piedmont) {
      const t = getOrCreateContextThread(
        "Smith — methodology appendix Q",
        [partFromCounselor(candace), partFromVendor(piedmont)],
        {
          kind: "vendor-org",
          vendorOrgId: piedmont.vendorOrgId,
          vendorOrgName: piedmont.vendorOrgName,
        },
      );
      sendMsgAt(
        t.id,
        partFromVendor(piedmont),
        "Defense asked whether the LMA used 25-mile or 50-mile radius. I have it in the appendix but want to confirm before depo.",
        daysAgo(1),
      );
    }
  }

  // Demo Counselor caseload — populate one cross-conversation per demo
  // client so a fresh "demo.counselor" login also has activity.
  const demoC = COUNSELORS["demo.counselor@pathwayspro.app"];
  if (demoC) {
    const demoStudent = CLIENTS["demo.student@pathwayspro.app"];
    if (demoStudent) {
      const t = getOrCreateContextThread(
        "Engineering admission essay — draft 2",
        [partFromCounselor(demoC), partFromClient(demoStudent)],
        {
          kind: "client-case",
          caseId: demoStudent.caseId,
          clientName: demoStudent.name,
        },
      );
      sendMsgAt(
        t.id,
        partFromClient(demoStudent),
        "Hi — uploaded my second draft. Could you also look at the disability accommodation paragraph? Not sure how much to share.",
        daysAgo(1),
      );
    }
    const demoEntr = CLIENTS["demo.entrepreneur@pathwayspro.app"];
    if (demoEntr) {
      const t = getOrCreateContextThread(
        "Notary business — PASS plan question",
        [partFromCounselor(demoC), partFromClient(demoEntr)],
        {
          kind: "client-case",
          caseId: demoEntr.caseId,
          clientName: demoEntr.name,
        },
      );
      sendMsgAt(
        t.id,
        partFromClient(demoEntr),
        "Got the business concept matches back — the mobile notary one looks right. Can we walk through a PASS plan to handle the startup costs?",
        daysAgo(2),
      );
    }
  }

  // Seed extra case notes for the demo clients so case-note feeds aren't empty
  if (candace) {
    const cJordan = CLIENTS["jordan.hayes@vr.client"];
    if (cJordan) {
      recordCaseNoteEvent({
        kind: "interest-profiler-completed",
        participantType: "individual-client",
        caseId: cJordan.caseId,
        clientName: cJordan.name,
        hollandCode: "CSE",
        sessionAt: daysAgo(12),
      });
      recordCaseNoteEvent({
        kind: "ipe-signed",
        participantType: "individual-client",
        caseId: cJordan.caseId,
        clientName: cJordan.name,
        vocationalGoal: "Medical Records Specialist (SOC 29-2072.00)",
        sessionAt: daysAgo(35),
      });
    }
    const cMarcus = CLIENTS["marcus.thomas@vr.client"];
    if (cMarcus) {
      recordCaseNoteEvent({
        kind: "ipe-signed",
        participantType: "individual-client",
        caseId: cMarcus.caseId,
        clientName: cMarcus.name,
        vocationalGoal: "Welder I (SOC 51-4121.07)",
        sessionAt: daysAgo(56),
      });
    }
  }

  window.localStorage.setItem(SEED_FLAG, "1");
}

function partFromCounselor(c: { email: string; name: string }): Participant {
  return { email: c.email, name: c.name, role: "counselor" };
}
function partFromClient(c: { email: string; name: string }): Participant {
  return { email: c.email, name: c.name, role: "client" };
}
function partFromBusiness(b: { email: string; name: string }): Participant {
  return { email: b.email, name: b.name, role: "business" };
}
function partFromVendor(v: { email: string; name: string }): Participant {
  return { email: v.email, name: v.name, role: "vendor" };
}
function sendMsgAt(
  threadId: string,
  from: Participant,
  body: string,
  isoOverride?: string,
) {
  const msg = sendMessage(threadId, from, body);
  if (msg && isoOverride && typeof window !== "undefined") {
    // Rewrite the timestamp so seeded conversations look historical
    const raw = window.localStorage.getItem("pathways-pro:messages-v1");
    if (raw) {
      const all = JSON.parse(raw);
      const i = all.findIndex((m: { id: string }) => m.id === msg.id);
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
