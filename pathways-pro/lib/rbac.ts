// RBAC foundation for Pathways Pro.
// Centralizes role definitions, route guards, and mock data for the
// approval-queue and user-management admin workflows.

import type { AnyUser, Role } from "./users";

/* ── Pending access request (Approval Queue) ────────────────────────── */

export type RequestStatus = "pending" | "approved" | "denied";

export interface AccessRequest {
  id: string;
  name: string;
  email: string;
  organization: string;
  requestedRole: Role;
  status: RequestStatus;
  submittedAt: string; // ISO date
}

export const MOCK_ACCESS_REQUESTS: AccessRequest[] = [
  {
    id: "req-001",
    name: "Maria Gonzalez",
    email: "maria.gonzalez@summit-crp.org",
    organization: "Summit Community Rehabilitation",
    requestedRole: "vendor",
    status: "pending",
    submittedAt: "2026-07-12T14:30:00Z",
  },
  {
    id: "req-002",
    name: "David Chen",
    email: "dchen@acme-manufacturing.com",
    organization: "Acme Manufacturing",
    requestedRole: "business",
    status: "pending",
    submittedAt: "2026-07-13T09:15:00Z",
  },
  {
    id: "req-003",
    name: "Jasmine Williams",
    email: "jwilliams@goodwill-south.org",
    organization: "Goodwill Industries of the South",
    requestedRole: "partner",
    status: "pending",
    submittedAt: "2026-07-14T11:00:00Z",
  },
  {
    id: "req-004",
    name: "Robert Park",
    email: "rpark@state-dvr.gov",
    organization: "State Division of Vocational Rehabilitation",
    requestedRole: "counselor",
    status: "pending",
    submittedAt: "2026-07-14T16:45:00Z",
  },
  {
    id: "req-005",
    name: "Linda Torres",
    email: "ltorres@gmail.com",
    organization: "Self-referred",
    requestedRole: "client",
    status: "approved",
    submittedAt: "2026-07-10T08:20:00Z",
  },
];

/* ── Role display helpers ───────────────────────────────────────────── */

export const ROLE_LABELS: Record<Role, string> = {
  counselor: "Counselor",
  client: "Client",
  business: "Business Client",
  vendor: "Vendor",
  partner: "Employment Partner",
};

export const REQUESTABLE_ROLES: Role[] = [
  "client",
  "business",
  "vendor",
  "partner",
];

/* ── Demo personas ──────────────────────────────────────────────────── */

export interface DemoPersona {
  /** Label shown in the dropdown */
  label: string;
  /** Short description of what this role sees */
  description: string;
  /** Credentials to auto-login with */
  email: string;
  password: string;
  /** The internal role used by authenticate() */
  authRole: Role;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    label: "Master Administrator",
    description: "Platform-level: tenant provisioning and pricing engine only — no client/case PHI access",
    email: "master.admin@pathwayspro.app",
    password: "MasterAdmin1!",
    authRole: "counselor",
  },
  {
    label: "Tenant Administrator (Agency)",
    description: "Manages one agency's own counselors, clients, pricing, contract, and billing — Chicago Metro Rehabilitation Agency",
    email: "tenantadmin.chicagometro@pathwayspro.app",
    password: "TenantAdmin1!",
    authRole: "counselor",
  },
  {
    label: "Agency Counselor (tenant-scoped)",
    description: "Employed under a tenant agency — sees only that agency's caseload, no billing access",
    email: "counselor.chicagometro@pathwayspro.app",
    password: "TenantUser1!",
    authRole: "counselor",
  },
  {
    label: "Counselor",
    description: "Full caseload, IPE drafting, assessments, and case management",
    email: "demo.counselor@pathwayspro.app",
    password: "demo1234",
    authRole: "counselor",
  },
  {
    label: "Site Administrator / Agency",
    description: "Admin panel with approval queue, user management, and client roster",
    email: "counselor.demo1@pathwayspro.app",
    password: "DemoCounselor1!",
    authRole: "counselor",
  },
  {
    label: "Business Client",
    description: "Service catalog, orders, accounts payable, and compliance tools",
    email: "business.smallco@pathwayspro.app",
    password: "BizDemo1!",
    authRole: "business",
  },
  {
    label: "Vocational Client",
    description: "Appointments, assessments, progress tracking, and self-advocacy",
    email: "demo.client@pathwayspro.app",
    password: "demo1234",
    authRole: "client",
  },
  {
    label: "Vendor",
    description: "Service orders, service catalog, documents, and messaging",
    email: "vendor.atprovider@pathwayspro.app",
    password: "VendorDemo1!",
    authRole: "vendor",
  },
  {
    label: "Employment Partner",
    description: "Opportunities, supported employment, and accommodation requests",
    email: "partner.community@pathwayspro.app",
    password: "PartnerDemo1!",
    authRole: "partner",
  },
];

/* ── Route helpers ──────────────────────────────────────────────────── */

/** Roles that see the admin/counselor sidebar layout. */
export function isAdminRole(role: Role): boolean {
  return role === "counselor";
}

/**
 * True only for the platform-level Master Administrator — gates
 * master-admin-only tools (tenant provisioning, corporate pricing engine).
 * A master admin is NOT automatically a tenant admin and must not read
 * client/provider PHI (case notes, assessments, IPEs); that separation is
 * enforced at each PHI-bearing page/route, not here.
 */
export function isMasterAdmin(user: AnyUser | null | undefined): boolean {
  return !!user && user.role === "counselor" && user.platformAccess === "SUPER_ADMIN";
}

/** True for a tenant's administrator — provisions counselors/clients within
 *  their own agency, manages the tenant's contract/legal documents and
 *  service pricing, and is the one who sets up Stripe to receive payment
 *  on the tenant's behalf. */
export function isTenantAdmin(user: AnyUser | null | undefined): boolean {
  return (
    !!user &&
    user.role === "counselor" &&
    !isMasterAdmin(user) &&
    user.tenantRole === "TENANT_ADMIN"
  );
}

/** True for an independent counselor with no agency — handles their own
 *  billing directly, same as a tenant admin would for their agency. */
export function isSolopreneur(user: AnyUser | null | undefined): boolean {
  return (
    !!user &&
    user.role === "counselor" &&
    !isMasterAdmin(user) &&
    !user.tenantId
  );
}

/**
 * Who may set up and manage Stripe / accounts receivable: the tenant
 * admin (billing for the whole agency) or a solopreneur (billing for
 * themselves). Ordinary tenant-affiliated counselors do not — their
 * tenant admin's account handles billing centrally. The platform Master
 * Admin is excluded too: that account manages Pathways Pro's own
 * corporate pricing with tenants, not any tenant's receivables from its
 * clients.
 */
export function canManageBilling(user: AnyUser | null | undefined): boolean {
  return isTenantAdmin(user) || isSolopreneur(user);
}

/** Default landing route after login for each role. */
export function dashboardRoute(user: AnyUser): string {
  if (isMasterAdmin(user)) return "/admin/master-admin";
  switch (user.role) {
    case "counselor":
      return "/case-search";
    case "client":
      return "/portal";
    case "business":
      return "/business-portal";
    case "vendor":
      return "/vendor-portal";
    case "partner":
      return "/partner-portal";
  }
}
