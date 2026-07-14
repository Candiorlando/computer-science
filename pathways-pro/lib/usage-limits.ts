// Usage limit enforcement for Solo vs Agency tiers.
//
// Solo Practitioner: max 100 active cases, max 200 active business clients.
// Agency: unlimited (-1 means no cap).
//
// Call `checkCaseLimit(orgId)` or `checkBusinessClientLimit(orgId)` before
// creating a new record. Both return { allowed, current, max, tier }.
//
// NOTE: Uncomment the Prisma queries after migration. The stub versions
// below return mock data so the frontend can be developed independently.

// import { prisma } from "./prisma";

export interface LimitCheck {
  allowed: boolean;
  current: number;
  max: number;          // -1 = unlimited
  tier: "SOLO" | "AGENCY";
  upgradeRequired: boolean;
}

// ─── Tier limits ────────────────────────────────────────────────────

const SOLO_LIMITS = {
  maxActiveCases: 100,
  maxActiveBusinessClients: 200,
} as const;

// -1 = unlimited
const AGENCY_LIMITS = {
  maxActiveCases: -1,
  maxActiveBusinessClients: -1,
} as const;

export function limitsForTier(tier: "SOLO" | "AGENCY") {
  return tier === "SOLO" ? SOLO_LIMITS : AGENCY_LIMITS;
}

// ─── Check functions ────────────────────────────────────────────────

export async function checkCaseLimit(orgId: string): Promise<LimitCheck> {
  // TODO: Replace with real Prisma query after migration:
  //
  // const org = await prisma.organization.findUniqueOrThrow({
  //   where: { id: orgId },
  //   include: {
  //     subscription: true,
  //     _count: {
  //       select: {
  //         clientCases: {
  //           where: {
  //             status: { notIn: ["CLOSED", "TRANSFERRED"] },
  //           },
  //         },
  //       },
  //     },
  //   },
  // });
  //
  // const tier = org.tier;
  // const limits = limitsForTier(tier);
  // const current = org._count.clientCases;
  // const max = limits.maxActiveCases;
  // const allowed = max === -1 || current < max;
  //
  // return { allowed, current, max, tier, upgradeRequired: !allowed };

  // Stub — returns well under limit
  return {
    allowed: true,
    current: 12,
    max: SOLO_LIMITS.maxActiveCases,
    tier: "SOLO",
    upgradeRequired: false,
  };
}

export async function checkBusinessClientLimit(
  orgId: string,
): Promise<LimitCheck> {
  // TODO: Replace with real Prisma query after migration:
  //
  // const org = await prisma.organization.findUniqueOrThrow({
  //   where: { id: orgId },
  //   include: {
  //     subscription: true,
  //     _count: {
  //       select: {
  //         businessClients: {
  //           where: { status: "ACTIVE" },
  //         },
  //       },
  //     },
  //   },
  // });
  //
  // const tier = org.tier;
  // const limits = limitsForTier(tier);
  // const current = org._count.businessClients;
  // const max = limits.maxActiveBusinessClients;
  // const allowed = max === -1 || current < max;
  //
  // return { allowed, current, max, tier, upgradeRequired: !allowed };

  return {
    allowed: true,
    current: 5,
    max: SOLO_LIMITS.maxActiveBusinessClients,
    tier: "SOLO",
    upgradeRequired: false,
  };
}

// ─── Enforcement middleware (use in API routes) ─────────────────────

export async function enforceLimit(
  check: LimitCheck,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  if (check.allowed) return { ok: true };
  return {
    ok: false,
    error: `You have reached the ${check.tier} tier limit of ${check.max}. Upgrade to Agency to add more.`,
    status: 403,
  };
}
