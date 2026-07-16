# Pathways Multi-Tenant RBAC Foundation

Pathways is modeled as a strict B2B multi-tenant SaaS.

## Core rule

Never query tenant-owned data by `id` alone. Every PHI/case-management query must include `tenantId`.

Correct:

```ts
await prisma.tenantClient.findFirst({
  where: {
    id: clientId,
    tenantId: ctx.tenantId,
  },
});
```

Incorrect:

```ts
await prisma.tenantClient.findUnique({ where: { id: clientId } });
```

## Role hierarchy

- `SUPER_ADMIN` — platform owner. Can manage tenants, billing, and global analytics. Cannot read tenant PHI/client case data unless explicitly granted a tenant membership.
- `TENANT_ADMIN` — agency administrator. Full access inside one tenant only.
- `TENANT_USER` — counselor. Access limited to assigned clients, caseloads, and tasks inside their tenant.
- `EXTERNAL_PORTAL_USER` — vendor/business partner. Access only through explicit `TenantRecordShare` rows.

## Clerk mapping

- Clerk Organization ID -> `Tenant.clerkOrgId`
- Clerk User ID -> `User.clerkUserId`
- Organization membership role -> `TenantMembership.roleId`

## Required API pattern

```ts
const ctx = await requireTenantContext({ userId, tenantId });
const client = await getTenantClientOrThrow(ctx, clientId);
```

For platform-only actions:

```ts
await requirePlatformAdmin(userId);
```

Do not use platform admin access to read PHI.
