"use client";

// Tenant legal & business document repository — the contract, agency
// policies, privacy practices, and liability disclaimer that govern a
// tenant's (agency's) use of Pathways Pro. Owned and acknowledged by the
// Tenant Administrator, not individual counselors.
//
// This is a working set of documents for the pilot program, provided for
// transparency — not legal advice. Each tenant's actual master service
// agreement should be reviewed and finalized by counsel before reliance.

export type TenantDocCategory = "contract" | "policy" | "privacy-practice" | "disclaimer";

export const TENANT_DOC_CATEGORY_LABELS: Record<TenantDocCategory, string> = {
  contract: "Master Service Agreement",
  policy: "Agency Policies",
  "privacy-practice": "Privacy & Data-Handling Practices",
  disclaimer: "Liability & Professional-Responsibility Disclaimer",
};

export interface TenantDocument {
  id: string;
  category: TenantDocCategory;
  title: string;
  version: string;
  effectiveDate: string;
  body: string;
}

/** Seed content per tenant. Real deployments would let the Tenant Admin
 *  fully author/replace these; the seed gives every new tenant a
 *  complete, sensible starting set. */
export function seedTenantDocuments(tenantId: string, tenantName: string): TenantDocument[] {
  return [
    {
      id: `${tenantId}-msa`,
      category: "contract",
      title: "Master Service Agreement",
      version: "1.0",
      effectiveDate: "2026-01-01",
      body:
        `This Master Service Agreement ("Agreement") is between Pathways Pro ` +
        `("Platform") and ${tenantName} ("Agency"). Platform provides case-management, ` +
        `scheduling, documentation, and AI-assisted drafting software. Agency is an ` +
        `independent professional services organization responsible for the vocational ` +
        `rehabilitation, counseling, and related services it delivers to its clients ` +
        `through the Platform.\n\n` +
        `1. ROLE OF THE PLATFORM. Platform furnishes software tools only. Platform does ` +
        `not employ, supervise, or direct Agency's counselors, does not practice ` +
        `counseling, and does not make clinical, vocational, or eligibility ` +
        `determinations. AI-drafted content is a starting point that a qualified Agency ` +
        `professional must review, correct as needed, and approve before it is relied on ` +
        `or released.\n\n` +
        `2. RESPONSIBILITY FOR SERVICES. Agency is solely responsible for: (a) the ` +
        `professional licensure and certification of its staff, (b) the quality, ` +
        `accuracy, and appropriateness of services delivered to its clients, (c) ` +
        `compliance with its funding agency's requirements (e.g., WIOA Title IV, state VR ` +
        `regulations), and (d) compliance with applicable federal and state law, including ` +
        `HIPAA, FERPA, and professional ethics codes (APA, CRCC, or equivalent) that apply ` +
        `to its staff. Agency bears legal responsibility and liability for the services it ` +
        `and its personnel provide.\n\n` +
        `3. TENANT ADMINISTRATOR AUTHORITY. Agency designates a Tenant Administrator who ` +
        `may provision and remove Agency counselor and client accounts within Agency's own ` +
        `tenant, set Agency's service pricing, and configure Agency's billing (accounts ` +
        `receivable) — all within the seat and case limits set in Section 5.\n\n` +
        `4. DATA OWNERSHIP AND ISOLATION. Client and case records entered under Agency's ` +
        `tenant belong to Agency (or its clients, as applicable) and are logically ` +
        `isolated from every other tenant on the Platform. Platform personnel do not ` +
        `access Agency's client records except as required for support, security, or as ` +
        `legally compelled.\n\n` +
        `5. CONTRACT LIMITS. This Agreement is subject to the counselor-seat and ` +
        `active-case limits set in Agency's provisioning record, adjustable by mutual ` +
        `written agreement.\n\n` +
        `6. FEES. Agency's fees to Platform, and Agency's own pricing to its clients or ` +
        `payers, are set out separately in Agency's Pricing & Billing configuration.\n\n` +
        `This is a working template for the pilot program and is not a substitute for ` +
        `review by Agency's own counsel before execution.`,
    },
    {
      id: `${tenantId}-policy`,
      category: "policy",
      title: "Agency Operating Policies",
      version: "1.0",
      effectiveDate: "2026-01-01",
      body:
        `1. STAFF CREDENTIALING. All counselors provisioned under this tenant must hold ` +
        `the license or certification Agency represents for them (e.g., CRC, LPC, LCSW) ` +
        `and must keep it current. The Tenant Administrator is responsible for verifying ` +
        `credentials before provisioning an account and for removing access when a ` +
        `credential lapses or employment ends.\n\n` +
        `2. CASELOAD ASSIGNMENT. Clients are assigned to a specific counselor of record. ` +
        `Counselors may access only their own assigned caseload; the Tenant Administrator ` +
        `may access the full agency caseload for supervision and quality-assurance ` +
        `purposes.\n\n` +
        `3. DOCUMENTATION STANDARDS. Case notes, IPEs, and assessment interpretations ` +
        `must be reviewed and signed by the counselor of record before release to a ` +
        `client or third party. AI-drafted content is never released unreviewed.\n\n` +
        `4. INCIDENT REPORTING. Any suspected unauthorized access, data incident, or ` +
        `client-safety concern must be reported to the Tenant Administrator immediately ` +
        `and escalated to Platform per the Privacy Policy's breach-notification process.\n\n` +
        `5. THIRD-PARTY REFERRALS (INCLUDING EAP). Where Agency provides services under a ` +
        `third-party contract (e.g., an Employee Assistance Program arrangement with an ` +
        `employer), the Tenant Administrator is responsible for that contract's own terms, ` +
        `confidentiality commitments, and billing arrangement, which are independent of ` +
        `this Agreement.`,
    },
    {
      id: `${tenantId}-privacy`,
      category: "privacy-practice",
      title: "Agency Privacy & Data-Handling Practices",
      version: "1.0",
      effectiveDate: "2026-01-01",
      body:
        `This document supplements the Platform-wide Privacy Policy (see /privacy) with ` +
        `Agency-specific practices.\n\n` +
        `1. MINIMUM NECESSARY. Agency staff access only the client and case information ` +
        `needed for their role. Counselors see their own assigned caseload; the Tenant ` +
        `Administrator may see the full agency caseload for oversight; the Platform ` +
        `Master Administrator sees none of it.\n\n` +
        `2. CROSS-TENANT ISOLATION. Agency's client and case data is never visible to ` +
        `another tenant/agency on the Platform, and Agency cannot see another tenant's ` +
        `data.\n\n` +
        `3. BUSINESS CLIENT DATA. Employer/business clients Agency serves receive only ` +
        `the deliverables a counselor explicitly releases to them — never raw case notes, ` +
        `assessments, or health information about the individuals they employ or refer.\n\n` +
        `4. RETENTION. Records are retained per Agency's funding-source and legal ` +
        `retention requirements, consistent with the Platform Privacy Policy.\n\n` +
        `5. LIMITS OF TECHNOLOGY. As stated in the Platform Privacy Policy, no online ` +
        `service is 100% secure. Agency staff should follow the precautions described ` +
        `there (private networks, strong unique passwords, and treating email/SMS as ` +
        `non-secure channels).`,
    },
    {
      id: `${tenantId}-disclaimer`,
      category: "disclaimer",
      title: "Liability & Professional-Responsibility Disclaimer",
      version: "1.0",
      effectiveDate: "2026-01-01",
      body:
        `${tenantName} ("Agency") acknowledges and agrees:\n\n` +
        `1. Agency, and not Pathways Pro, is the provider of vocational rehabilitation, ` +
        `counseling, and related professional services delivered through the Platform. ` +
        `Pathways Pro furnishes software only and does not practice counseling or make ` +
        `clinical, vocational, or eligibility determinations.\n\n` +
        `2. Agency is solely and legally responsible for the professional conduct, ` +
        `licensure, and services of its counselors and staff, and for any claim, ` +
        `complaint, or liability arising from services Agency's personnel deliver to ` +
        `Agency's clients or referred employees, including under any third-party (e.g. ` +
        `EAP) contract Agency enters into.\n\n` +
        `3. Any content drafted with AI assistance is a starting point only. A qualified ` +
        `Agency professional is responsible for reviewing, correcting, and approving such ` +
        `content before it is relied upon, signed, or released — Pathways Pro is not ` +
        `responsible for decisions made on unreviewed AI output.\n\n` +
        `4. Agency will maintain any professional liability (malpractice) insurance ` +
        `appropriate to the services it provides and required by its funding agency or ` +
        `state law.\n\n` +
        `5. This disclaimer supplements, and does not replace, the Platform-wide Terms of ` +
        `Service (see /terms).\n\n` +
        `Acknowledged by the Tenant Administrator on behalf of Agency:`,
    },
  ];
}

// ── persistence: per-tenant document set + acknowledgment ──────────────
const DOCS_KEY = "pathways-pro:tenant-documents-v1";
const ACK_KEY = "pathways-pro:tenant-document-acks-v1";

interface AckRecord {
  acknowledgedBy: string; // tenant admin email
  acknowledgedAt: string;
}

function readDocs(): Record<string, TenantDocument[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DOCS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, TenantDocument[]>) : {};
  } catch {
    return {};
  }
}
function writeDocs(map: Record<string, TenantDocument[]>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DOCS_KEY, JSON.stringify(map));
}

export function loadTenantDocuments(tenantId: string, tenantName: string): TenantDocument[] {
  const all = readDocs();
  if (all[tenantId]) return all[tenantId];
  const seeded = seedTenantDocuments(tenantId, tenantName);
  all[tenantId] = seeded;
  writeDocs(all);
  return seeded;
}

function readAcks(): Record<string, AckRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(ACK_KEY);
    return raw ? (JSON.parse(raw) as Record<string, AckRecord>) : {};
  } catch {
    return {};
  }
}

/** Key is `${tenantId}:${docId}`. */
export function isAcknowledged(tenantId: string, docId: string): AckRecord | null {
  return readAcks()[`${tenantId}:${docId}`] ?? null;
}

export function acknowledgeDocument(tenantId: string, docId: string, adminEmail: string) {
  const all = readAcks();
  all[`${tenantId}:${docId}`] = {
    acknowledgedBy: adminEmail,
    acknowledgedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(ACK_KEY, JSON.stringify(all));
  }
}
