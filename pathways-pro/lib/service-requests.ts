"use client";

// Service Request workflow — bridges Business Portal and Counselor's
// Business View. A business client browses the catalog, requests a
// service, and a ServiceRequest row is created with status='pending'.
// The counselor sees pending requests in /dashboard/business, reviews,
// approves (then produces the document), or declines.
//
// Documents authored against an approved request stay in 'in-review'
// state until the counselor explicitly releases them — the business
// client never sees draft documents before counselor sign-off.

import { appendActivity } from "./business-portal";
import { recordCaseNoteEvent } from "./case-notes";

export type ServiceRequestStatus =
  | "pending-counselor-review"
  | "approved-in-progress"
  | "draft-awaiting-release"
  | "delivered"
  | "declined";

export interface ServiceCatalogItem {
  id: string;                  // 'fce' | 'wec' | 'jd-analysis' | 'lma' | ...
  title: string;
  audience: string[];          // ['hr_director', 'risk_manager', 'adjuster', 'attorney']
  category: "forensic" | "ergonomic" | "placement" | "free-tool";
  description: string;
  typicalTurnaround: string;   // "5–10 business days"
  priceBand: string;           // "$0", "Per authorization", "Insurance billable"
  counselorReviewRequired: boolean;
  free: boolean;
}

export const SERVICE_CATALOG: ServiceCatalogItem[] = [
  // ── Enterprise / paid ──
  {
    id: "wec",
    title: "Wage-Earning Capacity Evaluation",
    audience: ["risk_manager", "adjuster", "attorney"],
    category: "forensic",
    description:
      "Methodology-defensible WEC report for workers' comp matters. Jurisdiction-specific (CA permanent disability, TX IIBs, federal LHWCA, IL IWCC, etc.). Daubert-ready appendix.",
    typicalTurnaround: "10–14 business days",
    priceBand: "Per engagement · billable to carrier",
    counselorReviewRequired: true,
    free: false,
  },
  {
    id: "lma",
    title: "Labor Market Assessment (Litigation)",
    audience: ["attorney", "adjuster", "risk_manager"],
    category: "forensic",
    description:
      "Geographic and SOC-scoped LMA with sourcing notes per finding, residual occupational categories, and openings data. Pairs with TSA for vocational opinions.",
    typicalTurnaround: "7–10 business days",
    priceBand: "Per engagement",
    counselorReviewRequired: true,
    free: false,
  },
  {
    id: "tsa-litigation",
    title: "Transferable Skills Analysis (Litigation)",
    audience: ["attorney", "adjuster"],
    category: "forensic",
    description:
      "TSA prepared for litigation use — pre-injury SOC vs. residual capacity, ranked target occupations, signed by CRC/CVE.",
    typicalTurnaround: "5–7 business days",
    priceBand: "Per engagement",
    counselorReviewRequired: true,
    free: false,
  },
  {
    id: "jd-analysis",
    title: "Job Description ADA Analysis",
    audience: ["hr_director", "risk_manager"],
    category: "ergonomic",
    description:
      "O*NET-mapped physical and cognitive demands extraction, essential vs. marginal function classification, ADA risk flags, JAN-backed accommodation suggestions with cost bands.",
    typicalTurnaround: "3–5 business days",
    priceBand: "Per posting",
    counselorReviewRequired: true,
    free: false,
  },
  {
    id: "fce",
    title: "Functional Capacity Evaluation",
    audience: ["hr_director", "risk_manager", "adjuster"],
    category: "ergonomic",
    description:
      "On-site or clinic FCE conducted by partner OT/PT. Lift limits, postural tolerances, sustained-activity readings. Routes to your assigned counselor + your org automatically.",
    typicalTurnaround: "Scheduled by partner",
    priceBand: "Insurance billable",
    counselorReviewRequired: true,
    free: false,
  },
  {
    id: "placement-pipeline",
    title: "Placement Pipeline Access",
    audience: ["hr_director"],
    category: "placement",
    description:
      "Get visibility into the VR caseload, post integrated competitive openings, and receive pre-screened candidates. Includes 90-day retention tracking and job-coach support.",
    typicalTurnaround: "Continuous",
    priceBand: "Free",
    counselorReviewRequired: false,
    free: true,
  },
  // ── Free tools available to individuals ──
  {
    id: "accommodation-letter",
    title: "AI Accommodation Letter Generator",
    audience: ["individuals"],
    category: "free-tool",
    description:
      "Draft formal ADA Title I accommodation request letters with zero-cost and paid solutions side-by-side. JAN-backed cost data pre-empts the undue-hardship defense.",
    typicalTurnaround: "Instant",
    priceBand: "Free",
    counselorReviewRequired: false,
    free: true,
  },
  {
    id: "problem-analysis",
    title: "Discrimination Documentation",
    audience: ["individuals"],
    category: "free-tool",
    description:
      "Log every incident as it happens — chronology, offender, impact. We compile a professional Problem Analysis Report for attorneys, EEOC, or P&A.",
    typicalTurnaround: "Instant",
    priceBand: "Free",
    counselorReviewRequired: false,
    free: true,
  },
  {
    id: "eeoc-charge",
    title: "EEOC Charge of Discrimination",
    audience: ["individuals"],
    category: "free-tool",
    description:
      "First-person, factual EEOC Form 5 Particulars drafted from your account of what happened. Cites the right statute per protected basis.",
    typicalTurnaround: "Instant",
    priceBand: "Free",
    counselorReviewRequired: false,
    free: true,
  },
  {
    id: "ocr-doj",
    title: "OCR / DOJ Civil Rights Complaint",
    audience: ["individuals"],
    category: "free-tool",
    description:
      "Formal complaint for DOJ-DRS or OCR-HHS — schools, healthcare, state/local government, public accommodations.",
    typicalTurnaround: "Instant",
    priceBand: "Free",
    counselorReviewRequired: false,
    free: true,
  },
  {
    id: "business-plan",
    title: "VR-Fundable Business Plan",
    audience: ["individuals"],
    category: "free-tool",
    description:
      "Complete VR-fundable business plan with executive summary, market analysis, operations, financial projections, and a dedicated assistive-tech budget.",
    typicalTurnaround: "Instant",
    priceBand: "Free",
    counselorReviewRequired: false,
    free: true,
  },
];

export interface ServiceRequest {
  id: string;
  serviceId: string;            // matches a ServiceCatalogItem.id
  serviceTitle: string;
  // Requester (business client)
  requesterEmail: string;
  requesterName: string;
  requesterOrgId: string;
  requesterOrgName: string;
  // Subject (the client/matter this is about)
  subjectCaseId?: string;
  subjectClientName?: string;
  matterCaption?: string;
  jurisdiction?: string;
  // Request details
  notes: string;
  urgency: "routine" | "expedited" | "wioa-deadline";
  // Due date (ISO date) — requester picks at submission; drives
  // counselor queue prioritization.
  dueDate?: string;
  // Routing
  assignedCounselorEmail?: string;
  // Lifecycle
  status: ServiceRequestStatus;
  requestedAt: string;
  decisionedAt?: string;
  decisionedByEmail?: string;
  decisionNotes?: string;
  draftDocumentId?: string;     // VaultDocument id when the draft is uploaded
  releasedAt?: string;

  // ── Deliverable workflow ──
  // AI-drafted deliverable content (Markdown). Generated on demand
  // from the catalog service's aiTemplate + the request context.
  deliverableDraft?: string;
  deliverableDraftGeneratedAt?: string;
  deliverableDraftModel?: string;
  // Counselor's edited final version. When the counselor clicks
  // "Send to Client," the final is locked and releasedAt is set.
  deliverableFinal?: string;
  deliverableFinalEditedAt?: string;
  // Send to client (business / vendor / partner)
  sentToClientAt?: string;
  sentToClientByEmail?: string;
  // Counselor signature applied to the deliverable. Either a base64
  // PNG data URL of a drawn signature OR a typed cursive name. The
  // signed-at timestamp marks when the counselor authorized release.
  counselorSignatureDataUrl?: string;
  counselorSignatureText?: string;
  counselorSignatureName?: string;        // printed name shown under the signature line
  counselorSignatureCredentials?: string; // credentials line shown under printed name
  signedAt?: string;
}

const KEY = "pathways-pro:service-requests-v1";

export function loadServiceRequests(): ServiceRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ServiceRequest[]) : [];
  } catch {
    return [];
  }
}

export function saveServiceRequests(items: ServiceRequest[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function appendServiceRequest(
  r: ServiceRequest,
  requesterScopeRole = "business-contact",
) {
  saveServiceRequests([r, ...loadServiceRequests()]);
  appendActivity({
    kind: "auth_requested",
    summary: `${r.requesterName} requested ${r.serviceTitle}${r.matterCaption ? ` for ${r.matterCaption}` : ""}`,
    actorEmail: r.requesterEmail,
    actorRole: "business",
    caseId: r.subjectCaseId,
    payload: {
      requestId: r.id,
      serviceId: r.serviceId,
      retainingOrgId: r.requesterOrgId,
    },
  });
  recordCaseNoteEvent({
    kind: "business-service-requested",
    participantType: "business-vendor",
    orgId: r.requesterOrgId,
    orgName: r.requesterOrgName,
    requesterName: r.requesterName,
    sourceArtifactId: r.id,
    serviceTitle: r.serviceTitle,
    matterCaption: r.matterCaption,
    subjectClientName: r.subjectClientName,
    urgency: r.urgency,
    notes: r.notes,
    scopeRole: requesterScopeRole,
  });
}

export function updateServiceRequest(
  id: string,
  patch: Partial<ServiceRequest>,
) {
  const list = loadServiceRequests();
  const next = list.map((r) => (r.id === id ? { ...r, ...patch } : r));
  saveServiceRequests(next);
  return next.find((r) => r.id === id);
}

export function requestsForOrg(orgId: string): ServiceRequest[] {
  return loadServiceRequests().filter((r) => r.requesterOrgId === orgId);
}

export function requestsForCounselor(email: string): ServiceRequest[] {
  return loadServiceRequests().filter(
    (r) => !r.assignedCounselorEmail || r.assignedCounselorEmail === email,
  );
}

export function pendingRequestsForCounselor(email: string): ServiceRequest[] {
  return requestsForCounselor(email).filter(
    (r) =>
      r.status === "pending-counselor-review" ||
      r.status === "draft-awaiting-release",
  );
}

export function newServiceRequestId(): string {
  return "sr-" + Math.random().toString(36).slice(2, 10);
}

// Counselor decision actions
export function approveRequest(
  id: string,
  counselorEmail: string,
  notes?: string,
) {
  const r = updateServiceRequest(id, {
    status: "approved-in-progress",
    decisionedAt: new Date().toISOString(),
    decisionedByEmail: counselorEmail,
    decisionNotes: notes,
    assignedCounselorEmail: counselorEmail,
  });
  if (r) {
    appendActivity({
      kind: "auth_approved",
      summary: `${counselorEmail} approved ${r.serviceTitle} request from ${r.requesterOrgName}`,
      actorEmail: counselorEmail,
      actorRole: "counselor",
      caseId: r.subjectCaseId,
      payload: { requestId: r.id, retainingOrgId: r.requesterOrgId },
    });
    recordCaseNoteEvent({
      kind: "business-service-approved",
      participantType: "business-vendor",
      orgId: r.requesterOrgId,
      orgName: r.requesterOrgName,
      requesterName: r.requesterName,
      sourceArtifactId: r.id,
      serviceTitle: r.serviceTitle,
      decisionedByEmail: counselorEmail,
    });
  }
}

export function declineRequest(
  id: string,
  counselorEmail: string,
  reason: string,
) {
  const r = updateServiceRequest(id, {
    status: "declined",
    decisionedAt: new Date().toISOString(),
    decisionedByEmail: counselorEmail,
    decisionNotes: reason,
    assignedCounselorEmail: counselorEmail,
  });
  if (r) {
    appendActivity({
      kind: "auth_denied",
      summary: `${counselorEmail} declined ${r.serviceTitle} from ${r.requesterOrgName}: ${reason}`,
      actorEmail: counselorEmail,
      actorRole: "counselor",
      caseId: r.subjectCaseId,
      payload: { requestId: r.id, retainingOrgId: r.requesterOrgId },
    });
    recordCaseNoteEvent({
      kind: "business-service-declined",
      participantType: "business-vendor",
      orgId: r.requesterOrgId,
      orgName: r.requesterOrgName,
      requesterName: r.requesterName,
      sourceArtifactId: r.id,
      serviceTitle: r.serviceTitle,
      decisionedByEmail: counselorEmail,
      reason,
    });
  }
}

export function uploadDraftForRequest(
  id: string,
  draftDocumentId: string,
) {
  updateServiceRequest(id, {
    status: "draft-awaiting-release",
    draftDocumentId,
  });
}

export function releaseDocument(
  id: string,
  counselorEmail: string,
) {
  const r = updateServiceRequest(id, {
    status: "delivered",
    releasedAt: new Date().toISOString(),
  });
  if (r) {
    appendActivity({
      kind: "doc_uploaded",
      summary: `${counselorEmail} released ${r.serviceTitle} deliverable to ${r.requesterOrgName}`,
      actorEmail: counselorEmail,
      actorRole: "counselor",
      caseId: r.subjectCaseId,
      documentId: r.draftDocumentId,
      payload: { requestId: r.id, retainingOrgId: r.requesterOrgId },
    });
    recordCaseNoteEvent({
      kind: "business-service-released",
      participantType: "business-vendor",
      orgId: r.requesterOrgId,
      orgName: r.requesterOrgName,
      requesterName: r.requesterName,
      sourceArtifactId: r.id,
      serviceTitle: r.serviceTitle,
      releasedByEmail: counselorEmail,
    });
  }
}

// ── Deliverable workflow ──────────────────────────────────────────────

export function saveDeliverableDraft(
  id: string,
  draft: string,
  model: string,
) {
  updateServiceRequest(id, {
    deliverableDraft: draft,
    deliverableDraftGeneratedAt: new Date().toISOString(),
    deliverableDraftModel: model,
    deliverableFinal: draft, // start the counselor edit with the draft
    deliverableFinalEditedAt: new Date().toISOString(),
    status: "draft-awaiting-release",
  });
}

export function saveDeliverableEdit(id: string, edited: string) {
  updateServiceRequest(id, {
    deliverableFinal: edited,
    deliverableFinalEditedAt: new Date().toISOString(),
  });
}

export function saveCounselorSignature(
  id: string,
  sig: {
    dataUrl?: string;
    text?: string;
    printedName: string;
    credentials?: string;
  },
) {
  updateServiceRequest(id, {
    counselorSignatureDataUrl: sig.dataUrl,
    counselorSignatureText: sig.text,
    counselorSignatureName: sig.printedName,
    counselorSignatureCredentials: sig.credentials,
    signedAt: new Date().toISOString(),
  });
}

export function sendToClient(id: string, counselorEmail: string) {
  const r = updateServiceRequest(id, {
    status: "delivered",
    sentToClientAt: new Date().toISOString(),
    sentToClientByEmail: counselorEmail,
    releasedAt: new Date().toISOString(),
  });
  if (r) {
    appendActivity({
      kind: "doc_uploaded",
      summary: `${counselorEmail} sent ${r.serviceTitle} deliverable to ${r.requesterOrgName}`,
      actorEmail: counselorEmail,
      actorRole: "counselor",
      caseId: r.subjectCaseId,
      payload: { requestId: r.id, retainingOrgId: r.requesterOrgId },
    });
    recordCaseNoteEvent({
      kind: "business-service-released",
      participantType: "business-vendor",
      orgId: r.requesterOrgId,
      orgName: r.requesterOrgName,
      requesterName: r.requesterName,
      sourceArtifactId: r.id,
      serviceTitle: r.serviceTitle,
      releasedByEmail: counselorEmail,
    });
  }
}
