import { NextResponse } from "next/server";
import { checkCaseLimit, checkBusinessClientLimit } from "@/lib/usage-limits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns current usage counts and limit status for the organization.
// The frontend polls this to show the usage bar and trigger the upgrade
// gate when limits are approached or exceeded.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId");

  if (!orgId) {
    return NextResponse.json({ error: "orgId required" }, { status: 400 });
  }

  const [cases, clients] = await Promise.all([
    checkCaseLimit(orgId),
    checkBusinessClientLimit(orgId),
  ]);

  return NextResponse.json({
    cases,
    clients,
    anyLimitReached: cases.upgradeRequired || clients.upgradeRequired,
  });
}
