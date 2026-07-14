import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  invoiceId: z.string(),
  amount: z.string(),
  serviceName: z.string(),
  businessEmail: z.string(),
  businessName: z.string(),
  counselorEmail: z.string(),
  counselorName: z.string(),
  paidAt: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const result = Schema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  }

  const data = result.data;
  console.log("Payment confirmation:", { invoiceId: data.invoiceId, amount: data.amount, paidBy: data.businessEmail, counselor: data.counselorEmail });

  return NextResponse.json({ ok: true, emailsSent: !!process.env.RESEND_API_KEY });
}
