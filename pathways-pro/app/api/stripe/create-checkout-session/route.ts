import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, currency, stripeErrorBody } from "@/lib/stripe";
import { recordCheckoutSession } from "@/lib/stripe-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({ accountId: z.string().min(1) });

// Create a Checkout Session on behalf of the connected account so its
// customer can pay for a service order; the platform takes an application
// fee on the payment.
export async function POST(req: Request) {
  const parsed = RequestSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "accountId is required." },
      { status: 400 },
    );
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create(
      {
        success_url: `${origin}/dashboard/payments?checkout=success`,
        line_items: [
          {
            price_data: {
              currency: currency(),
              product_data: { name: "Service order — vocational evaluation" },
              unit_amount: 100000,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        payment_method_types: ["card"],
        payment_intent_data: { application_fee_amount: 123 },
      },
      { stripeAccount: parsed.data.accountId },
    );

    await recordCheckoutSession(parsed.data.accountId, session.id);
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (err) {
    console.error("create-checkout-session failed", err);
    return NextResponse.json(stripeErrorBody(err), { status: 500 });
  }
}
