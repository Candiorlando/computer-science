import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireTenantContext,
  assertTenantPhiAccess,
  tenantScope,
} from "@/lib/tenant-access";

/**
 * Example only: tenant-safe list endpoint.
 *
 * In production, derive userId from Clerk/Auth.js and tenantId from the active
 * Clerk Organization or a signed tenant context — never from arbitrary headers.
 */
export async function GET(req: Request) {
  const userId = req.headers.get("x-demo-user-id");
  const tenantId = req.headers.get("x-demo-tenant-id");

  if (!userId || !tenantId) {
    return NextResponse.json(
      { error: "Missing demo user/tenant context" },
      { status: 401 },
    );
  }

  const ctx = await requireTenantContext({ userId, tenantId });
  assertTenantPhiAccess(ctx);

  const clients = await prisma.tenantClient.findMany({
    where: tenantScope(
      ctx,
      ctx.roleId === "TENANT_USER" ? { assignedCounselorId: ctx.userId } : {},
    ),
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  return NextResponse.json({ clients });
}
