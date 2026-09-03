import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Role-adaptive search API — routes to the correct Prisma table based
// on the acting user's role.
//
// Production Prisma queries:
//
// COUNSELOR:
//   prisma.clientCase.findMany({
//     where: {
//       orgId,
//       OR: [
//         { clientName: { contains: q, mode: "insensitive" } },
//         { caseNumber: { contains: q, mode: "insensitive" } },
//         ...(digits.length >= 3 ? [{ client: { phone: { contains: digits } } }] : []),
//       ],
//     },
//   })
//
// VENDOR:
//   prisma.serviceAuthorization.findMany({
//     where: {
//       vendorOrgId: orgId,
//       OR: [
//         { caseId: { contains: q, mode: "insensitive" } },
//         { id: { contains: q, mode: "insensitive" } },
//         { serviceCode: { contains: q, mode: "insensitive" } },
//         { serviceLabel: { contains: q, mode: "insensitive" } },
//       ],
//     },
//   })
//
// BUSINESS:
//   prisma.placement.findMany({
//     where: {
//       employerOrgId: orgId,
//       OR: [
//         { clientName: { contains: q, mode: "insensitive" } },
//         { socCode: { contains: q, mode: "insensitive" } },
//         { id: { contains: q, mode: "insensitive" } },
//         ...(digits.length >= 3 ? [{ client: { phone: { contains: digits } } }] : []),
//       ],
//     },
//   })

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const role = searchParams.get("role") ?? "COUNSELOR";

  return NextResponse.json({
    query: q,
    role,
    message: "Search handled client-side. See Prisma queries in this file.",
  });
}
