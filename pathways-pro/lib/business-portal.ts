"use client";

// Business, Vendor, Forensic Services portal data layer.
// localStorage-backed for the demo — every interface is shaped for the
// Postgres schema in docs/spec/business-portal.md so the swap is mechanical
// when the backend lands.

import type { BusinessUser, VendorUser } from "./users";

// ─── Organizations ──────────────────────────────────────────────────────

export interface BusinessOrg {
  id: string;                                           // org-acme
  legalName: string;
  industry: string;
  size: "1-9" | "10-49" | "50-249" | "250+";
  hqCity: string;
  hqState: string;
  hqZip: string;
  primaryContact?: string;
  status: "prospect" | "onboarding" | "active" | "suspended";
  createdAt: string;
}

export interface VendorOrg {
  id: string;                                           // vendor-vocconn
  legalName: string;
  vendorType: VendorUser["vendorType"];
  stateVendorId?: string;
  hqCity: string;
  hqState: string;
  hqZip: string;
  status: "prospect" | "onboarding" | "approved" | "suspended";
  approvedAt?: string;
  createdAt: string;
}

const BUSINESS_ORG_KEY = "pathways-pro:business-orgs-v1";
const VENDOR_ORG_KEY = "pathways-pro:vendor-orgs-v1";

export function loadBusinessOrgs(): Record<string, BusinessOrg> {
  return readKey(BUSINESS_ORG_KEY);
}
export function saveBusinessOrgs(map: Record<string, BusinessOrg>) {
  writeKey(BUSINESS_ORG_KEY, map);
}
export function getBusinessOrg(id: string): BusinessOrg | null {
  return loadBusinessOrgs()[id] ?? null;
}

export function loadVendorOrgs(): Record<string, VendorOrg> {
  return readKey(VENDOR_ORG_KEY);
}
export function saveVendorOrgs(map: Record<string, VendorOrg>) {
  writeKey(VENDOR_ORG_KEY, map);
}
export function getVendorOrg(id: string): VendorOrg | null {
  return loadVendorOrgs()[id] ?? null;
}

// ─── Placements (IPE ↔ Employer linkage) ────────────────────────────────

export interface Placement {
  id: string;
  caseId: string;
  clientName: string;
  counselorEmail: string;
  employerOrgId: string;
  employerOrgName: string;
  jobTitle: string;
  socCode: string;
  hireDate: string;          // ISO date
  hourlyWage: number;
  weeklyHours: number;
  integratedSetting: boolean;
  status: "onboarding" | "active" | "on-leave" | "separated" | "retained-90";
  dayCount: number;          // computed on read; stored for the demo
  vendorOrgId?: string;
  vendorOrgName?: string;
  jobCoachName?: string;
  accommodationsInPlace: number;
  accommodationsOpen: number;
}

const PLACEMENT_KEY = "pathways-pro:placements-v1";

export function loadPlacements(): Placement[] {
  return Object.values(readKey<Placement>(PLACEMENT_KEY));
}
export function savePlacements(items: Placement[]) {
  writeKey(
    PLACEMENT_KEY,
    items.reduce<Record<string, Placement>>((acc, p) => {
      acc[p.id] = p;
      return acc;
    }, {}),
  );
}
export function getPlacement(id: string): Placement | null {
  return readKey<Placement>(PLACEMENT_KEY)[id] ?? null;
}

export function placementsByCounselor(counselorEmail: string): Placement[] {
  return loadPlacements().filter((p) => p.counselorEmail === counselorEmail);
}
export function placementsByEmployer(orgId: string): Placement[] {
  return loadPlacements().filter((p) => p.employerOrgId === orgId);
}
export function placementsByVendor(vendorId: string): Placement[] {
  return loadPlacements().filter((p) => p.vendorOrgId === vendorId);
}

// ─── Forensic engagements ───────────────────────────────────────────────

export type ForensicKind =
  | "wage_earning_capacity"
  | "labor_market_assessment"
  | "transferable_skills_litigation"
  | "vocational_eval_litigation"
  | "expert_witness";

export interface ForensicEngagement {
  id: string;
  vendorOrgId: string;
  expertUserEmail: string;
  expertName: string;
  retainingParty: "carrier" | "applicant-attorney" | "defense-attorney" | "employer";
  retainingOrgId: string;
  retainingOrgName: string;
  matterCaption: string;
  jurisdiction: string;
  venue: string;
  kind: ForensicKind;
  caseId?: string;            // null for non-VR matters
  clientName: string;
  retainedOn: string;
  status: "intake" | "data-collection" | "drafting" | "issued" | "testimony" | "closed";
  hourlyRate: number;
  hoursBilled: number;
}

const ENGAGEMENT_KEY = "pathways-pro:forensic-engagements-v1";

export function loadEngagements(): ForensicEngagement[] {
  return Object.values(readKey<ForensicEngagement>(ENGAGEMENT_KEY));
}
export function getEngagement(id: string): ForensicEngagement | null {
  return readKey<ForensicEngagement>(ENGAGEMENT_KEY)[id] ?? null;
}
export function saveEngagements(items: ForensicEngagement[]) {
  writeKey(
    ENGAGEMENT_KEY,
    items.reduce<Record<string, ForensicEngagement>>((acc, e) => {
      acc[e.id] = e;
      return acc;
    }, {}),
  );
}

// ─── Coaching log entries ───────────────────────────────────────────────

export interface CoachingLogEntry {
  id: string;
  placementId: string;
  vendorOrgId: string;
  occurredAt: string;
  durationMin: number;
  encounterType: "in-person" | "virtual" | "phone" | "text";
  setting: "on-site" | "community" | "office";
  intervention: string;
  outcome: string;
  signedByVendor: boolean;
  signedByCounselor: boolean;
}

const LOG_KEY = "pathways-pro:coaching-logs-v1";

export function loadCoachingLogs(): CoachingLogEntry[] {
  return Object.values(readKey<CoachingLogEntry>(LOG_KEY));
}
export function logsForPlacement(placementId: string): CoachingLogEntry[] {
  return loadCoachingLogs().filter((l) => l.placementId === placementId);
}
export function saveCoachingLogs(items: CoachingLogEntry[]) {
  writeKey(
    LOG_KEY,
    items.reduce<Record<string, CoachingLogEntry>>((acc, l) => {
      acc[l.id] = l;
      return acc;
    }, {}),
  );
}

// ─── Document vault + routing ───────────────────────────────────────────

export type DocKind =
  | "wec"
  | "lma"
  | "fce"
  | "rtw"
  | "jd-analysis"
  | "accommodation-letter"
  | "ipe-summary"
  | "invoice"
  | "msa"
  | "coi";

export interface VaultDocument {
  id: string;
  title: string;
  kind: DocKind;
  routingTemplate:
    | "forensic-deliverable"
    | "coaching-log"
    | "jd-analysis"
    | "fce-rtw"
    | "vendor-billing"
    | "vendor-credential";
  relatedCaseId?: string;
  relatedPlacementId?: string;
  relatedEngagementId?: string;
  uploadedByEmail: string;
  uploadedByName: string;
  uploadedAt: string;
  sizeBytes: number;
  sha256: string;
}

export interface DocumentRoute {
  id: string;
  documentId: string;
  recipientKind: "user" | "org";
  recipientEmail?: string;     // when kind=user
  recipientOrgId?: string;     // when kind=org (business or vendor)
  recipientLabel: string;      // human-readable, used in lists
  accessKind: "view" | "download" | "sign" | "acknowledge";
  acknowledgedAt?: string;
  revokedAt?: string;
  routedAt: string;
}

const DOC_KEY = "pathways-pro:vault-docs-v1";
const ROUTE_KEY = "pathways-pro:vault-routes-v1";

export function loadDocuments(): VaultDocument[] {
  return Object.values(readKey<VaultDocument>(DOC_KEY));
}
export function loadRoutes(): DocumentRoute[] {
  return Object.values(readKey<DocumentRoute>(ROUTE_KEY));
}
export function saveDocuments(items: VaultDocument[]) {
  writeKey(
    DOC_KEY,
    items.reduce<Record<string, VaultDocument>>((acc, d) => {
      acc[d.id] = d;
      return acc;
    }, {}),
  );
}
export function saveRoutes(items: DocumentRoute[]) {
  writeKey(
    ROUTE_KEY,
    items.reduce<Record<string, DocumentRoute>>((acc, r) => {
      acc[r.id] = r;
      return acc;
    }, {}),
  );
}

export interface DocumentForRecipient {
  doc: VaultDocument;
  route: DocumentRoute;
}

export function documentsForUser(email: string): DocumentForRecipient[] {
  const routes = loadRoutes().filter(
    (r) => !r.revokedAt && r.recipientKind === "user" && r.recipientEmail === email,
  );
  const docs = readKey<VaultDocument>(DOC_KEY);
  return routes
    .map((r) => ({ doc: docs[r.documentId], route: r }))
    .filter((x): x is DocumentForRecipient => Boolean(x.doc));
}
export function documentsForOrg(orgId: string): DocumentForRecipient[] {
  const routes = loadRoutes().filter(
    (r) => !r.revokedAt && r.recipientKind === "org" && r.recipientOrgId === orgId,
  );
  const docs = readKey<VaultDocument>(DOC_KEY);
  return routes
    .map((r) => ({ doc: docs[r.documentId], route: r }))
    .filter((x): x is DocumentForRecipient => Boolean(x.doc));
}

export function acknowledgeRoute(routeId: string) {
  const routes = readKey<DocumentRoute>(ROUTE_KEY);
  const r = routes[routeId];
  if (!r) return;
  r.acknowledgedAt = new Date().toISOString();
  routes[routeId] = r;
  writeKey(ROUTE_KEY, routes);
}

// ─── Service authorizations & invoices ──────────────────────────────────

export interface ServiceAuthorization {
  id: string;
  caseId: string;
  vendorOrgId: string;
  vendorOrgName: string;
  serviceCode: string;
  serviceLabel: string;
  rate: number;
  unitsAuthorized: number;
  unitsUsed: number;
  startDate: string;
  endDate: string;
  status:
    | "requested"
    | "approved"
    | "denied"
    | "active"
    | "exhausted"
    | "revoked";
  decisionedByEmail?: string;
  decisionedAt?: string;
  decisionNotes?: string;
  requestedAt: string;
}

const AUTH_KEY = "pathways-pro:service-auths-v1";

export function loadAuthorizations(): ServiceAuthorization[] {
  return Object.values(readKey<ServiceAuthorization>(AUTH_KEY));
}
export function authorizationsByCase(caseId: string): ServiceAuthorization[] {
  return loadAuthorizations().filter((a) => a.caseId === caseId);
}
export function authorizationsByVendor(vendorId: string): ServiceAuthorization[] {
  return loadAuthorizations().filter((a) => a.vendorOrgId === vendorId);
}
export function saveAuthorizations(items: ServiceAuthorization[]) {
  writeKey(
    AUTH_KEY,
    items.reduce<Record<string, ServiceAuthorization>>((acc, a) => {
      acc[a.id] = a;
      return acc;
    }, {}),
  );
}

export function decisionAuthorization(
  id: string,
  decision: "approved" | "denied",
  decisionedByEmail: string,
  notes?: string,
) {
  const map = readKey<ServiceAuthorization>(AUTH_KEY);
  const a = map[id];
  if (!a) return;
  a.status = decision === "approved" ? "active" : "denied";
  a.decisionedByEmail = decisionedByEmail;
  a.decisionedAt = new Date().toISOString();
  a.decisionNotes = notes;
  map[id] = a;
  writeKey(AUTH_KEY, map);
  appendActivity({
    kind: decision === "approved" ? "auth_approved" : "auth_denied",
    summary: `${decisionedByEmail} ${decision} ${a.serviceLabel} for ${a.caseId}`,
    actorEmail: decisionedByEmail,
    caseId: a.caseId,
    payload: { authId: id, vendorOrgId: a.vendorOrgId },
  });
}

// ─── Activity feed ──────────────────────────────────────────────────────

export type ActivityKind =
  | "doc_uploaded"
  | "doc_acknowledged"
  | "doc_revoked"
  | "auth_requested"
  | "auth_approved"
  | "auth_denied"
  | "invoice_submitted"
  | "invoice_approved"
  | "accommodation_requested"
  | "accommodation_verified"
  | "milestone_logged"
  | "intervention_requested"
  | "engagement_created";

export interface ActivityEntry {
  id: string;
  occurredAt: string;
  kind: ActivityKind;
  actorEmail?: string;
  actorRole?: "counselor" | "client" | "business" | "vendor";
  caseId?: string;
  placementId?: string;
  engagementId?: string;
  documentId?: string;
  summary: string;
  payload?: Record<string, unknown>;
}

const ACTIVITY_KEY = "pathways-pro:activity-feed-v1";

export function loadActivity(): ActivityEntry[] {
  const map = readKey<ActivityEntry>(ACTIVITY_KEY);
  return Object.values(map).sort(
    (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
  );
}
export function appendActivity(
  entry: Omit<ActivityEntry, "id" | "occurredAt"> & { occurredAt?: string },
) {
  const map = readKey<ActivityEntry>(ACTIVITY_KEY);
  const id = "act-" + Math.random().toString(36).slice(2, 10);
  map[id] = {
    id,
    occurredAt: entry.occurredAt ?? new Date().toISOString(),
    ...entry,
  };
  writeKey(ACTIVITY_KEY, map);
}

export function activityForCase(caseId: string, limit = 50): ActivityEntry[] {
  return loadActivity()
    .filter((a) => a.caseId === caseId)
    .slice(0, limit);
}
export function activityForOrg(orgId: string, limit = 50): ActivityEntry[] {
  return loadActivity()
    .filter((a) => {
      const p = a.payload as Record<string, unknown> | undefined;
      return (
        p?.["employerOrgId"] === orgId ||
        p?.["vendorOrgId"] === orgId ||
        p?.["retainingOrgId"] === orgId
      );
    })
    .slice(0, limit);
}

// ─── Tiny localStorage helpers ──────────────────────────────────────────

function readKey<T>(k: string): Record<string, T> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as Record<string, T>) : {};
  } catch {
    return {};
  }
}
function writeKey<T>(k: string, map: Record<string, T>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(k, JSON.stringify(map));
}

// ─── Helpers exposed to the UI ──────────────────────────────────────────

export function getCurrentBusinessOrg(user: BusinessUser): BusinessOrg | null {
  return getBusinessOrg(user.orgId);
}
export function getCurrentVendorOrg(user: VendorUser): VendorOrg | null {
  return getVendorOrg(user.vendorOrgId);
}
