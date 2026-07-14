import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, currency, stripeErrorBody } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe Connect "Destination Charge" — the charge is created on the
// platform (Pathways Pro) but funds are automatically routed to the
// counselor's connected Stripe account. The platform retains an
// application fee.
//
// Flow:
//   1. Business Client clicks "Pay Invoice" on their portal
//   2. This route creates a Checkout Session with `destination` transfer
//   3. Stripe processes the charge on the platform
//   4. Funds minus application_fee route to the counselor's acct_...
//   5. Webhook confirms payment → marks PlatformInvoice as PAID

const PaySchema = z.object({
  invoiceId: z.string().min(1),
  amountCents: z.number().int().positive(),
  description: z.string().min(1),
  destinationAccountId: z.string().startsWith("acct_"),
  platformFeePercent: z.number().min(0).max(100).default(5),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = PaySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { invoiceId, amountCents, description, destinationAccountId, platformFeePercent } =
    parsed.data;

  // Calculate platform fee (default 5%)
  const applicationFeeAmount = Math.round(amountCents * (platformFeePercent / 100));

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  try {
    const stripe = getStripe();

    // Create a Checkout Session with Destination Charge
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency(),
            product_data: {
              name: description,
              metadata: { invoiceId },
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        // Destination charge: funds go to the counselor's connected account
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: destinationAccountId,
        },
        metadata: {
          invoiceId,
          type: "b2b_invoice_payment",
        },
      },
      success_url: `${origin}/business-portal?payment=success&invoice=${invoiceId}`,
      cancel_url: `${origin}/business-portal?payment=canceled&invoice=${invoiceId}`,
      metadata: { invoiceId },
    });

    // TODO: After migration, update PlatformInvoice with session/PI ID:
    //
    // await prisma.platformInvoice.update({
    //   where: { id: invoiceId },
    //   data: {
    //     stripePaymentIntentId: session.payment_intent as string,
    //     status: "SENT",
    //   },
    // });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      applicationFee: applicationFeeAmount,
    });
  } catch (err) {
    console.error("invoice payment failed", err);
    return NextResponse.json(stripeErrorBody(err), { status: 500 });
  }
}
