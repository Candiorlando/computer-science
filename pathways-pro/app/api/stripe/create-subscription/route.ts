import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, currency, stripeErrorBody, STRIPE_PREVIEW_API_VERSION } from "@/lib/stripe";
import { getPartner, upsertPartner } from "@/lib/stripe-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({ accountId: z.string().min(1) });

// Charge the connected account a platform subscription fee, paid from the
// account's Stripe balance:
//   1. ensure the "Platform subscription" product + monthly price exists,
//   2. attach a stripe_balance payment method via a confirmed SetupIntent,
//   3. create the subscription against the account (customer_account).
export async function POST(req: Request) {
  const parsed = RequestSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "accountId is required." },
      { status: 400 },
    );
  }
  const accountId = parsed.data.accountId;

  try {
    const stripe = getStripe();
    const existing = await getPartner(accountId);

    // 1 — subscription plan (reused if this partner already has one).
    let priceId = existing?.subscriptionPriceId;
    let productId = existing?.subscriptionProductId;
    if (!priceId) {
      const product = await stripe.products.create({
        name: "Platform subscription",
        default_price_data: {
          currency: currency(),
          recurring: { interval: "month" },
          unit_amount: 1000,
        },
      });
      productId = product.id;
      priceId =
        typeof product.default_price === "string"
          ? product.default_price
          : product.default_price?.id;
      if (!priceId) throw new Error("Product was created without a price.");
    }

    // 2 — attach the account's Stripe balance as its default payment method.
    const setupIntent = await stripe.setupIntents.create({
      payment_method_types: ["stripe_balance"],
      confirm: true,
      customer_account: accountId,
      usage: "off_session",
      payment_method_data: { type: "stripe_balance" },
    } as never,
    { apiVersion: STRIPE_PREVIEW_API_VERSION });
    const paymentMethodId =
      typeof setupIntent.payment_method === "string"
        ? setupIntent.payment_method
        : setupIntent.payment_method?.id;
    if (!paymentMethodId) {
      throw new Error("SetupIntent did not return a payment method.");
    }

    // 3 — charge the subscription from the account's balance.
    const subscription = await stripe.subscriptions.create({
      customer_account: accountId,
      default_payment_method: paymentMethodId,
      items: [{ price: priceId, quantity: 1 }],
      payment_settings: { payment_method_types: ["stripe_balance"] },
    } as never,
    { apiVersion: STRIPE_PREVIEW_API_VERSION });

    const record = await upsertPartner(accountId, {
      subscriptionProductId: productId,
      subscriptionPriceId: priceId,
      defaultPaymentMethodId: paymentMethodId,
      subscriptionId: subscription.id,
    });

    return NextResponse.json({
      productId,
      priceId,
      paymentMethodId,
      subscriptionId: subscription.id,
      subscriptionStatus: subscription.status,
      record,
    });
  } catch (err) {
    console.error("create-subscription failed", err);
    return NextResponse.json(stripeErrorBody(err), { status: 500 });
  }
}
