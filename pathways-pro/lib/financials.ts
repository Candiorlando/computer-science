"use client";

// Financial layer — derived from delivered service requests using
// per-counselor effective pricing. Tracks invoice status (issued,
// paid, overdue) and aggregates AR / AP per org.

import { loadServiceRequests, type ServiceRequest } from "./service-requests";
import { effectivePrice, getService } from "./service-catalog";

export type InvoiceStatus = "issued" | "paid" | "overdue" | "void";

export interface Invoice {
  id: string;
  serviceRequestId: string;
  serviceId: string;
  serviceTitle: string;
  orgId: string;
  orgName: string;
  counselorEmail: string;
  amountCents: number;
  issuedAt: string;
  dueAt: string;
  paidAt?: string;
  status: InvoiceStatus;
}

const INVOICE_KEY = "pathways-pro:invoices-v1";

function loadInvoices(): Invoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INVOICE_KEY);
    return raw ? (JSON.parse(raw) as Invoice[]) : [];
  } catch {
    return [];
  }
}
function saveInvoices(items: Invoice[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INVOICE_KEY, JSON.stringify(items));
}

// Materialize invoices from every delivered service request. Run on
// every load; idempotent because we key by serviceRequestId.
function materializeInvoices(counselorEmail: string): Invoice[] {
  const existing = loadInvoices();
  const byRequest = new Map(existing.map((i) => [i.serviceRequestId, i]));
  const delivered = loadServiceRequests().filter(
    (r) => r.status === "delivered",
  );
  for (const r of delivered) {
    if (byRequest.has(r.id)) continue;
    const svc = getService(r.serviceId);
    if (!svc) continue;
    const amount = effectivePrice(r.serviceId, counselorEmail);
    const inv: Invoice = {
      id: "inv-" + r.id.slice(3),
      serviceRequestId: r.id,
      serviceId: r.serviceId,
      serviceTitle: r.serviceTitle,
      orgId: r.requesterOrgId,
      orgName: r.requesterOrgName,
      counselorEmail,
      amountCents: amount,
      issuedAt: r.releasedAt ?? new Date().toISOString(),
      dueAt: addDays(r.releasedAt ?? new Date().toISOString(), 30),
      status: "issued",
    };
    byRequest.set(r.id, inv);
  }
  // Auto-flip past-due
  const now = Date.now();
  for (const inv of byRequest.values()) {
    if (inv.status === "issued" && Date.parse(inv.dueAt) < now) {
      inv.status = "overdue";
    }
  }
  const next = Array.from(byRequest.values());
  saveInvoices(next);
  return next;
}

export function loadInvoicesForCounselor(counselorEmail: string): Invoice[] {
  return materializeInvoices(counselorEmail).sort(
    (a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt),
  );
}

// Business-side view: invoices addressed to the requesting org (i.e.
// amounts the business owes Pathways Pro for delivered services).
// Materializes any missing invoices using the counselor on the
// service request as the issuing party, then filters by orgId.
export function loadInvoicesForOrg(orgId: string): Invoice[] {
  const existing = loadInvoices();
  const byRequest = new Map(existing.map((i) => [i.serviceRequestId, i]));
  const delivered = loadServiceRequests().filter(
    (r) => r.status === "delivered" && r.requesterOrgId === orgId,
  );
  for (const r of delivered) {
    if (byRequest.has(r.id)) continue;
    const svc = getService(r.serviceId);
    if (!svc) continue;
    const counselorEmail =
      r.sentToClientByEmail ?? r.assignedCounselorEmail ?? "";
    const amount = effectivePrice(r.serviceId, counselorEmail);
    const inv: Invoice = {
      id: "inv-" + r.id.slice(3),
      serviceRequestId: r.id,
      serviceId: r.serviceId,
      serviceTitle: r.serviceTitle,
      orgId: r.requesterOrgId,
      orgName: r.requesterOrgName,
      counselorEmail,
      amountCents: amount,
      issuedAt: r.sentToClientAt ?? r.releasedAt ?? new Date().toISOString(),
      dueAt: addDays(
        r.sentToClientAt ?? r.releasedAt ?? new Date().toISOString(),
        30,
      ),
      status: "issued",
    };
    byRequest.set(r.id, inv);
  }
  const now = Date.now();
  for (const inv of byRequest.values()) {
    if (inv.status === "issued" && Date.parse(inv.dueAt) < now) {
      inv.status = "overdue";
    }
  }
  const next = Array.from(byRequest.values());
  saveInvoices(next);
  return next
    .filter((i) => i.orgId === orgId && i.status !== "void")
    .sort((a, b) => Date.parse(b.issuedAt) - Date.parse(a.issuedAt));
}

export interface BusinessAPSummary {
  totalCents: number;
  outstandingCents: number;
  overdueCents: number;
  paidThisQuarterCents: number;
  invoices: Invoice[];
}

export function apSummaryForOrg(orgId: string): BusinessAPSummary {
  const invoices = loadInvoicesForOrg(orgId);
  const quarterStart = startOfQuarter().getTime();
  return {
    totalCents: invoices.reduce((s, i) => s + i.amountCents, 0),
    outstandingCents: invoices
      .filter((i) => i.status !== "paid")
      .reduce((s, i) => s + i.amountCents, 0),
    overdueCents: invoices
      .filter((i) => i.status === "overdue")
      .reduce((s, i) => s + i.amountCents, 0),
    paidThisQuarterCents: invoices
      .filter(
        (i) =>
          i.status === "paid" && Date.parse(i.paidAt ?? "0") >= quarterStart,
      )
      .reduce((s, i) => s + i.amountCents, 0),
    invoices,
  };
}

export function markInvoicePaid(id: string) {
  const all = loadInvoices();
  const next = all.map((i) =>
    i.id === id
      ? { ...i, status: "paid" as const, paidAt: new Date().toISOString() }
      : i,
  );
  saveInvoices(next);
}

export function voidInvoice(id: string) {
  const all = loadInvoices();
  const next = all.map((i) =>
    i.id === id ? { ...i, status: "void" as const } : i,
  );
  saveInvoices(next);
}

// ── AR / AP rollups ───────────────────────────────────────────────────

export interface ARSummary {
  totalCents: number;
  outstandingCents: number;
  overdueCents: number;
  collectedThisQuarterCents: number;
  invoices: Invoice[];
}

export function arSummary(counselorEmail: string): ARSummary {
  const invoices = loadInvoicesForCounselor(counselorEmail).filter(
    (i) => i.status !== "void",
  );
  const quarterStart = startOfQuarter().getTime();
  return {
    totalCents: invoices.reduce((s, i) => s + i.amountCents, 0),
    outstandingCents: invoices
      .filter((i) => i.status !== "paid")
      .reduce((s, i) => s + i.amountCents, 0),
    overdueCents: invoices
      .filter((i) => i.status === "overdue")
      .reduce((s, i) => s + i.amountCents, 0),
    collectedThisQuarterCents: invoices
      .filter(
        (i) => i.status === "paid" && Date.parse(i.paidAt ?? "0") >= quarterStart,
      )
      .reduce((s, i) => s + i.amountCents, 0),
    invoices,
  };
}

// AP — what the agency owes vendors. Derived from delivered
// service-requests where the vendor was the delivery party.
export interface APItem {
  id: string;
  vendorOrgId: string;
  vendorOrgName: string;
  description: string;
  amountCents: number;
  dueAt: string;
  status: "owed" | "scheduled" | "paid";
}

const AP_KEY = "pathways-pro:ap-items-v1";

export function loadAPItems(): APItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(AP_KEY);
    return raw ? (JSON.parse(raw) as APItem[]) : [];
  } catch {
    return [];
  }
}
export function saveAPItems(items: APItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AP_KEY, JSON.stringify(items));
}
export function markAPItemPaid(id: string) {
  const all = loadAPItems();
  saveAPItems(
    all.map((i) => (i.id === id ? { ...i, status: "paid" } : i)),
  );
}

export interface APSummary {
  totalCents: number;
  scheduledCents: number;
  overdueCents: number;
  items: APItem[];
}

export function apSummary(): APSummary {
  const items = loadAPItems();
  const now = Date.now();
  return {
    totalCents: items
      .filter((i) => i.status !== "paid")
      .reduce((s, i) => s + i.amountCents, 0),
    scheduledCents: items
      .filter((i) => i.status === "scheduled")
      .reduce((s, i) => s + i.amountCents, 0),
    overdueCents: items
      .filter((i) => i.status !== "paid" && Date.parse(i.dueAt) < now)
      .reduce((s, i) => s + i.amountCents, 0),
    items,
  };
}

// Seeded AP demo data — vendor invoices the agency owes
export function seedAPDemoIfEmpty() {
  if (loadAPItems().length > 0) return;
  saveAPItems([
    {
      id: "ap-vocconn-may",
      vendorOrgId: "vendor-vocconn",
      vendorOrgName: "Vocational Connections, Inc.",
      description: "Job coaching — 28 hrs · Marcus T.",
      amountCents: 28 * 8_250, // 28 × $82.50/hr
      dueAt: daysAhead(15),
      status: "owed",
    },
    {
      id: "ap-piedmont-may",
      vendorOrgId: "vendor-piedmont",
      vendorOrgName: "Piedmont Forensic Vocational",
      description: "WEC evaluation — Smith v. Acme",
      amountCents: 14.5 * 28_500, // 14.5 hrs × $285
      dueAt: daysAhead(7),
      status: "scheduled",
    },
    {
      id: "ap-abilitybridge-may",
      vendorOrgId: "vendor-abilitybridge",
      vendorOrgName: "AbilityBridge AT Solutions",
      description: "Standing workstation × 1 + screen reader license",
      amountCents: 1_240_00,
      dueAt: daysAgo(2),
      status: "owed",
    },
  ]);
}

// ── helpers ──

function addDays(iso: string, n: number): string {
  return new Date(Date.parse(iso) + n * 24 * 60 * 60 * 1000).toISOString();
}
function daysAhead(n: number): string {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();
}
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}
function startOfQuarter(): Date {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3);
  return new Date(now.getFullYear(), q * 3, 1);
}

export function formatMoney(cents: number): string {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function reIndex(_req: ServiceRequest) {
  // No-op hook reserved for the future webhook path.
}

// ── Demo invoice seed for the business AP view ─────────────────────────
// Ensures every demo business org has sample invoices so the AP page
// is never empty on first visit. Idempotent — checks by invoice ID.

export function seedDemoInvoicesIfEmpty() {
  const existing = loadInvoices();
  const ids = new Set(existing.map((i) => i.id));

  const demoInvoices: Invoice[] = [
    {
      id: "inv-demo-wec-001",
      serviceRequestId: "sr-wec-001",
      serviceId: "wec",
      serviceTitle: "Wage-Earning Capacity Evaluation",
      orgId: "org-acme",
      orgName: "Acme Logistics",
      counselorEmail: "candace.metcalf@pathwayspro.app",
      amountCents: 285_000,
      issuedAt: daysAgo(12),
      dueAt: daysAhead(18),
      status: "issued",
    },
    {
      id: "inv-demo-lma-002",
      serviceRequestId: "sr-lma-002",
      serviceId: "lma",
      serviceTitle: "Labor Market Assessment (Litigation)",
      orgId: "org-acme",
      orgName: "Acme Logistics",
      counselorEmail: "candace.metcalf@pathwayspro.app",
      amountCents: 175_000,
      issuedAt: daysAgo(45),
      dueAt: daysAgo(15),
      status: "overdue",
    },
    {
      id: "inv-demo-jta-003",
      serviceRequestId: "sr-jta-003",
      serviceId: "jd-analysis",
      serviceTitle: "Job Task Analysis — Warehouse Associate",
      orgId: "org-acme",
      orgName: "Acme Logistics",
      counselorEmail: "candace.metcalf@pathwayspro.app",
      amountCents: 95_000,
      issuedAt: daysAgo(60),
      dueAt: daysAgo(30),
      paidAt: daysAgo(25),
      status: "paid",
    },
    {
      id: "inv-demo-fce-004",
      serviceRequestId: "sr-fce-004",
      serviceId: "fce",
      serviceTitle: "Functional Capacity Evaluation",
      orgId: "org-meridian",
      orgName: "Meridian Claims",
      counselorEmail: "candace.metcalf@pathwayspro.app",
      amountCents: 225_000,
      issuedAt: daysAgo(5),
      dueAt: daysAhead(25),
      status: "issued",
    },
    {
      id: "inv-demo-tsa-005",
      serviceRequestId: "sr-tsa-005",
      serviceId: "tsa",
      serviceTitle: "Transferable Skills Analysis",
      orgId: "org-meridian",
      orgName: "Meridian Claims",
      counselorEmail: "candace.metcalf@pathwayspro.app",
      amountCents: 145_000,
      issuedAt: daysAgo(90),
      dueAt: daysAgo(60),
      paidAt: daysAgo(55),
      status: "paid",
    },
  ];

  const toAdd = demoInvoices.filter((inv) => !ids.has(inv.id));
  if (toAdd.length > 0) {
    saveInvoices([...existing, ...toAdd]);
  }
}

function daysAhead(n: number): string {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000).toISOString();
}
