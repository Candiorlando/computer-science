import { NextResponse } from "next/server";
import { onboardingSchema } from "@/lib/onboarding-schema";

// NOTE: Uncomment the prisma + bcrypt imports below once dependencies are
// installed and the database is migrated. Until then, the route validates
// the payload shape and returns a stub response so the form can be tested
// end-to-end against real Zod validation.
//
// import { prisma } from "@/lib/prisma";
// import bcrypt from "bcryptjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const result = onboardingSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const data = result.data;

  // ── Stub: replace with real DB logic after `npx prisma migrate dev` ──
  //
  // const existing = await prisma.user.findUnique({
  //   where: { email: data.email },
  // });
  // if (existing) {
  //   return NextResponse.json(
  //     { error: "An account with this email already exists." },
  //     { status: 409 },
  //   );
  // }
  //
  // const hashedPassword = await bcrypt.hash(data.password, 12);
  //
  // const user = await prisma.$transaction(async (tx) => {
  //   const u = await tx.user.create({
  //     data: {
  //       email: data.email,
  //       name: data.name,
  //       hashedPassword,
  //       activeRole: data.role,
  //     },
  //   });
  //
  //   switch (data.role) {
  //     case "COUNSELOR":
  //       await tx.counselorProfile.create({
  //         data: {
  //           userId: u.id,
  //           sector: data.sector,
  //           jobTitle: data.jobTitle,
  //         },
  //       });
  //       break;
  //     case "BUSINESS":
  //       await tx.businessProfile.create({
  //         data: {
  //           userId: u.id,
  //           sector: data.sector,
  //           jobTitle: data.jobTitle,
  //           department: data.department,
  //         },
  //       });
  //       break;
  //     case "VENDOR":
  //       await tx.vendorProfile.create({
  //         data: {
  //           userId: u.id,
  //           sector: data.sector,
  //           jobTitle: data.jobTitle,
  //           services: {
  //             createMany: {
  //               data: data.services.map((name) => ({ name })),
  //             },
  //           },
  //         },
  //       });
  //       break;
  //   }
  //
  //   return u;
  // });
  //
  // return NextResponse.json({ userId: user.id });

  // Stub response — form validation works, DB persistence is pending
  return NextResponse.json({
    ok: true,
    role: data.role,
    email: data.email,
    message: "Validation passed. Database persistence will be enabled after Prisma migration.",
  });
}
