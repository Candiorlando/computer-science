import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Weekly invoice reminder — Vercel Cron, every Friday 9 AM ET (0 13 * * 5 UTC).
// Sends overdue invoice summaries to business clients.
// Requires RESEND_API_KEY for actual email delivery.

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("Invoice reminder cron fired:", { timestamp: new Date().toISOString() });

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    message: "Friday reminder: would send outstanding invoice summaries. Requires RESEND_API_KEY + Prisma.",
  });
}
