"use client";

// Real, live-usable multi-tenant model for the demo app (localStorage/mock
// data, matching the rest of Pathways Pro's architecture). This is the
// client-side counterpart to prisma/scheduling-schema-extension.prisma's
// Tenant/TenantMembership models — same shape, so migrating to a real
// database later is a lookup swap, not a redesign.
//
// Isolation rule: a Tenant Admin or Tenant User may only ever see
// counselors, clients, and business clients that belong to THEIR OWN
// tenant. The platform Master Admin provisions tenants and sets contract
// limits but never sees case/client PHI — see lib/rbac.ts isMasterAdmin().

import { COUNSELORS, CLIENTS, getAllBusinessUsers, type CounselorUser, type ClientUser, type BusinessUser } from "./users";

export type TenantType = "state" | "city" | "agency" | "individual";
export type TenantStatus = "active" | "suspended" | "archived";

export interface Tenant {
  id: string;
  name: string;
  type: TenantType;
  status: TenantStatus;
  contractMaxCounselors: number;
  contractMaxActiveCases: number;
  createdAt: string;
}

// Seed tenants — two separate agencies, specifically so isolation between
// them is provable (Tenant A must never see Tenant B's data).
export const TENANTS: Record<string, Tenant> = {
  "tenant-chicago-metro": {
    id: "tenant-chicago-metro",
    name: "Chicago Metro Rehabilitation Agency",
    type: "agency",
    status: "active",
    contractMaxCounselors: 25,
    contractMaxActiveCases: 500,
    createdAt: "2026-01-15T00:00:00.000Z",
  },
  "tenant-lakeshore": {
    id: "tenant-lakeshore",
    name: "Lakeshore Vocational Services",
    type: "agency",
    status: "active",
    contractMaxCounselors: 15,
    contractMaxActiveCases: 300,
    createdAt: "2026-03-01T00:00:00.000Z",
  },
};

export function loadTenants(): Tenant[] {
  const extra = readExtraTenants();
  return [...Object.values(TENANTS), ...extra];
}

export function getTenant(tenantId: string | undefined): Tenant | null {
  if (!tenantId) return null;
  return TENANTS[tenantId] ?? readExtraTenants().find((t) => t.id === tenantId) ?? null;
}

// ── tenant-scoped lookups ─────────────────────────────────────────────
// A client's tenant is always DERIVED from their assigned counselor's
// tenant — never stored redundantly on the client, so the two can never
// drift out of sync.

export function counselorsInTenant(tenantId: string): CounselorUser[] {
  return Object.values(COUNSELORS).filter((c) => c.tenantId === tenantId);
}

export function clientsInTenant(tenantId: string): ClientUser[] {
  const counselorEmails = new Set(counselorsInTenant(tenantId).map((c) => c.email));
  return Object.values(CLIENTS).filter((c) => counselorEmails.has(c.counselorEmail));
}

export function businessClientsInTenant(tenantId: string): BusinessUser[] {
  return Object.values(getAllBusinessUsers()).filter((b) => b.tenantId === tenantId);
}

/** True if `viewer` (a tenant-scoped counselor) may see `target` counselor's
 *  caseload/data — i.e. they belong to the same tenant. Solopreneurs
 *  (no tenantId) only ever see their own data. */
export function sameTenant(viewer: CounselorUser, target: CounselorUser): boolean {
  if (!viewer.tenantId || !target.tenantId) return viewer.email === target.email;
  return viewer.tenantId === target.tenantId;
}

/** Counselors a given viewer is allowed to see in caseload/case-search:
 *  a Tenant Admin sees every counselor in their tenant; a Tenant User or
 *  solopreneur sees only themselves. */
export function visibleCounselorsFor(viewer: CounselorUser): CounselorUser[] {
  if (viewer.tenantRole === "TENANT_ADMIN" && viewer.tenantId) {
    return counselorsInTenant(viewer.tenantId);
  }
  return [viewer];
}

// ── runtime-provisioned tenants/records (Tenant Admin additions) ──────
// Seed tenants above are fixed; anything a Tenant Admin provisions at
// runtime is layered on top via localStorage, matching the rest of the
// app's persistence pattern.

const EXTRA_TENANTS_KEY = "pathways-pro:extra-tenants-v1";

function readExtraTenants(): Tenant[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(EXTRA_TENANTS_KEY);
    return raw ? (JSON.parse(raw) as Tenant[]) : [];
  } catch {
    return [];
  }
}

export function provisionTenant(input: Omit<Tenant, "id" | "createdAt" | "status">): Tenant {
  const tenant: Tenant = {
    ...input,
    id: `tenant-${Date.now().toString(36)}`,
    status: "active",
    createdAt: new Date().toISOString(),
  };
  const extra = readExtraTenants();
  extra.push(tenant);
  window.localStorage.setItem(EXTRA_TENANTS_KEY, JSON.stringify(extra));
  return tenant;
}

export interface TenantCapacitySnapshot {
  tenant: Tenant;
  activeCounselorCount: number;
  activeCaseCount: number;
  remainingCounselorSeats: number;
  remainingActiveCases: number;
}

export function getTenantCapacity(tenantId: string): TenantCapacitySnapshot | null {
  const tenant = getTenant(tenantId);
  if (!tenant) return null;
  const activeCounselorCount = counselorsInTenant(tenantId).length;
  const activeCaseCount = clientsInTenant(tenantId).filter(
    (c) => c.status !== "Job Placement",
  ).length;
  return {
    tenant,
    activeCounselorCount,
    activeCaseCount,
    remainingCounselorSeats: Math.max(tenant.contractMaxCounselors - activeCounselorCount, 0),
    remainingActiveCases: Math.max(tenant.contractMaxActiveCases - activeCaseCount, 0),
  };
}
