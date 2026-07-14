import { NextResponse } from "next/server";
import { getStripe, stripeErrorBody } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Creates a Stripe Customer Portal session for subscription management
// and tier upgrades. The portal lets the user:
//   - View/download invoices
//   - Update payment method
//   - Upgrade from Solo → Agency
//   - Cancel subscription

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { stripeCustomerId } = body;

  if (!stripeCustomerId || typeof stripeCustomerId !== "string") {
    return NextResponse.json(
      { error: "stripeCustomerId is required" },
      { status: 400 },
    );
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${origin}/dashboard/payments`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("billing portal session failed", err);
    return NextResponse.json(stripeErrorBody(err), { status: 500 });
  }
}
