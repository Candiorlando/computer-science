import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, stripeErrorBody } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Creates an "incomplete" subscription following Stripe's recommended
// flow for inline Payment Element checkout:
//
//   1. Create or retrieve the Stripe Customer
//   2. Create a Subscription with payment_behavior: "default_incomplete"
//   3. Return the client_secret from the PaymentIntent on the first invoice
//
// The frontend uses the client_secret to mount <PaymentElement /> and
// calls stripe.confirmPayment() when the user submits. No card data
// ever touches our server (PCI-DSS SAQ A compliant).

const CreateSchema = z.object({
  plan: z.enum(["solo", "agency"]),
  seats: z.number().int().positive().optional(),
  email: z.string().email(),
  name: z.string().min(1),
  orgId: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { plan, seats, email, name, orgId } = parsed.data;
  const isSolo = plan === "solo";

  // Enforce Agency minimum of 10 seats
  const quantity = isSolo ? 1 : Math.max(seats ?? 10, 10);

  const soloPriceId = process.env.STRIPE_SOLO_PRICE_ID;
  const agencyPriceId = process.env.STRIPE_AGENCY_PRICE_ID;

  if (!soloPriceId || !agencyPriceId) {
    return NextResponse.json(
      {
        error:
          "Stripe price IDs not configured. Set STRIPE_SOLO_PRICE_ID and STRIPE_AGENCY_PRICE_ID.",
      },
      { status: 500 },
    );
  }

  const priceId = isSolo ? soloPriceId : agencyPriceId;

  try {
    const stripe = getStripe();

    // 1. Create or retrieve Customer
    const existingCustomers = await stripe.customers.list({
      email,
      limit: 1,
    });
    const customer =
      existingCustomers.data[0] ??
      (await stripe.customers.create({
        email,
        name,
        metadata: {
          plan,
          orgId: orgId ?? "",
          source: "pathways-pro-inline-checkout",
        },
      }));

    // 2. Create incomplete subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId, quantity }],
      payment_behavior: "default_incomplete",
      payment_settings: {
        save_default_payment_method: "on_subscription",
      },
      expand: ["latest_invoice.payment_intent"],
      metadata: {
        plan,
        seats: String(quantity),
        orgId: orgId ?? "",
      },
    });

    // 3. Extract client_secret from the PaymentIntent
    // The expanded invoice contains payment_intent but the Stripe SDK type
    // doesn't surface it directly — use a safe cast.
    const invoice = subscription.latest_invoice as Record<string, unknown> | string | null;
    if (!invoice || typeof invoice === "string") {
      throw new Error("Subscription created without an expanded invoice.");
    }
    const paymentIntent = invoice.payment_intent as Record<string, unknown> | string | null;
    if (!paymentIntent || typeof paymentIntent === "string") {
      throw new Error("Invoice does not contain an expanded PaymentIntent.");
    }

    return NextResponse.json({
      subscriptionId: subscription.id,
      clientSecret: paymentIntent.client_secret as string,
      customerId: customer.id,
      plan,
      quantity,
      amountDue: invoice.amount_due,
      currency: invoice.currency,
    });
  } catch (err) {
    console.error("create-subscription failed", err);
    return NextResponse.json(stripeErrorBody(err), { status: 500 });
  }
}
