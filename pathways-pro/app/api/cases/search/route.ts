import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Unified case search API — searches across name, case ID, and phone.
//
// After Prisma migration, replace the stub with:
//
// import { prisma } from "@/lib/prisma";
//
// const rawQuery = searchParams.get("q")?.trim() ?? "";
// const digits = rawQuery.replace(/[\s\-\(\)\.]/g, "");
//
// const cases = await prisma.clientCase.findMany({
//   where: {
//     orgId,
//     OR: [
//       { clientName: { contains: rawQuery, mode: "insensitive" } },
//       { caseNumber: { contains: rawQuery, mode: "insensitive" } },
//       // Phone search: strip formatting, match on digits
//       ...(digits.length >= 3
//         ? [{ client: { phone: { contains: digits } } }]
//         : []),
//     ],
//   },
//   include: { client: { select: { name: true, email: true, phone: true } } },
//   orderBy: { updatedAt: "desc" },
//   take: 50,
// });
//
// This produces a single SQL query with a boolean OR:
//   WHERE org_id = $1 AND (
//     client_name ILIKE '%query%'
//     OR case_number ILIKE '%query%'
//     OR client.phone LIKE '%digits%'
//   )

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  // Stub — the frontend does client-side filtering from the seed data.
  // This endpoint exists to document the query architecture.
  return NextResponse.json({
    query: q,
    message:
      "Search is handled client-side until Prisma migration. " +
      "See the Prisma query in this file's comments for the production shape.",
  });
}
