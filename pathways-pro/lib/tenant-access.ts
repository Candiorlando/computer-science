import { prisma } from "./prisma";

/**
 * Tenant/RBAC access helpers for Pathways' strict B2B multi-tenant model.
 *
 * Rules:
 * - Never query tenant-owned tables by `id` alone.
 * - Always include `tenantId` in the `where` clause.
 * - Super Admins may manage platform objects, tenants, billing, and analytics,
 *   but must not read agency PHI/client case data unless they also have a
 *   tenant membership that explicitly permits it.
 */

export const SYSTEM_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  TENANT_ADMIN: "TENANT_ADMIN",
  TENANT_USER: "TENANT_USER",
  EXTERNAL_PORTAL_USER: "EXTERNAL_PORTAL_USER",
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

export interface TenantContext {
  userId: string;
  tenantId: string;
  roleId: SystemRole;
}

export class TenantAccessError extends Error {
  constructor(message = "Tenant access denied") {
    super(message);
    this.name = "TenantAccessError";
  }
}

export class PhiAccessError extends Error {
  constructor(message = "Platform administrators cannot access tenant PHI") {
    super(message);
    this.name = "PhiAccessError";
  }
}

/**
 * Resolve a user's tenant membership. Use this at the top of every
 * tenant-scoped API route or server action.
 */
export async function requireTenantContext(input: {
  userId: string;
  tenantId: string;
}): Promise<TenantContext> {
  const membership = await prisma.tenantMembership.findUnique({
    where: {
      tenantId_userId: {
        tenantId: input.tenantId,
        userId: input.userId,
      },
    },
    select: {
      roleId: true,
      tenant: { select: { status: true } },
    },
  });

  if (!membership || membership.tenant.status !== "ACTIVE") {
    throw new TenantAccessError();
  }

  return {
    userId: input.userId,
    tenantId: input.tenantId,
    roleId: membership.roleId as SystemRole,
  };
}

/** Super Admin platform actions only. Do not use for PHI/case reads. */
export async function requirePlatformAdmin(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { platformAccess: true },
  });

  if (user?.platformAccess !== "SUPER_ADMIN") {
    throw new TenantAccessError("Platform administrator access required");
  }

  return { userId, roleId: SYSTEM_ROLES.SUPER_ADMIN };
}

/** Explicitly blocks platform-only admins from PHI/case access. */
export function assertTenantPhiAccess(ctx: TenantContext) {
  if (ctx.roleId === SYSTEM_ROLES.SUPER_ADMIN) {
    throw new PhiAccessError();
  }
}

export function assertTenantAdmin(ctx: TenantContext) {
  if (ctx.roleId !== SYSTEM_ROLES.TENANT_ADMIN) {
    throw new TenantAccessError("Tenant administrator access required");
  }
}

export function assertTenantUserOrAdmin(ctx: TenantContext) {
  if (
    ctx.roleId !== SYSTEM_ROLES.TENANT_ADMIN &&
    ctx.roleId !== SYSTEM_ROLES.TENANT_USER
  ) {
    throw new TenantAccessError("Tenant user access required");
  }
}

/**
 * Tenant-safe Client lookup.
 * Counselors can only read clients assigned to them; tenant admins can read
 * all clients within their agency. Both paths include tenantId.
 */
export async function getTenantClientOrThrow(ctx: TenantContext, clientId: string) {
  assertTenantPhiAccess(ctx);

  const client = await prisma.tenantClient.findFirst({
    where: {
      id: clientId,
      tenantId: ctx.tenantId,
      ...(ctx.roleId === SYSTEM_ROLES.TENANT_USER
        ? { assignedCounselorId: ctx.userId }
        : {}),
    },
  });

  if (!client) throw new TenantAccessError("Client not found in tenant scope");
  return client;
}

/**
 * Tenant-safe Caseload lookup.
 * Never call prisma.tenantCaseload.findUnique({ where: { id } }) for PHI.
 */
export async function getTenantCaseloadOrThrow(
  ctx: TenantContext,
  caseloadId: string,
) {
  assertTenantPhiAccess(ctx);

  const caseload = await prisma.tenantCaseload.findFirst({
    where: {
      id: caseloadId,
      tenantId: ctx.tenantId,
      ...(ctx.roleId === SYSTEM_ROLES.TENANT_USER
        ? { counselorId: ctx.userId }
        : {}),
    },
  });

  if (!caseload) {
    throw new TenantAccessError("Caseload not found in tenant scope");
  }

  return caseload;
}

/** External users may only access explicitly shared records. */
export async function requireSharedRecord(input: {
  ctx: TenantContext;
  resourceType: string;
  resourceId: string;
  permission?: "VIEW" | "COMMENT" | "UPLOAD";
}) {
  const share = await prisma.tenantRecordShare.findFirst({
    where: {
      tenantId: input.ctx.tenantId,
      sharedWithUserId: input.ctx.userId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      ...(input.permission ? { permission: input.permission } : {}),
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
  });

  if (!share) throw new TenantAccessError("Record is not shared with user");
  return share;
}

/** Convenience helper for list queries. */
export function tenantScope<T extends Record<string, unknown>>(
  ctx: TenantContext,
  where?: T,
): T & { tenantId: string } {
  return {
    ...(where ?? ({} as T)),
    tenantId: ctx.tenantId,
  };
}
