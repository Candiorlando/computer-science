// RBAC foundation for Pathways Pro.
// Centralizes role definitions, route guards, and mock data for the
// approval-queue and user-management admin workflows.

import type { Role } from "./users";

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

/* ── Route helpers ──────────────────────────────────────────────────── */

/** Roles that see the admin/counselor sidebar layout. */
export function isAdminRole(role: Role): boolean {
  return role === "counselor";
}

/** Default landing route after login for each role. */
export function dashboardRoute(role: Role): string {
  switch (role) {
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
