import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeErrorBody } from "@/lib/stripe";
import { recordCheckoutSession, upsertPartner } from "@/lib/stripe-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe webhook receiver. Configure the endpoint in the Stripe Dashboard
// (or `stripe listen --forward-to localhost:3000/api/stripe/webhooks`) and
// subscribe to:
//   - v2.core.account[configuration.merchant].capability_status_updated
//     (thin event — the account finished onboarding / can accept payments)
//   - checkout.session.completed (snapshot — a service-order payment landed)
//   - invoice.payment_succeeded (snapshot — the platform subscription charged)
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();

  if (!secret || !signature) {
    return NextResponse.json(
      { error: "Webhook signature or STRIPE_WEBHOOK_SECRET missing." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error("webhook signature verification failed", err);
    return NextResponse.json(stripeErrorBody(err), { status: 400 });
  }

  try {
    switch (event.type as string) {
      // Thin event from Accounts v2 — merchant capability changed (e.g. the
      // account onboarded and can now accept payments).
      case "v2.core.account[configuration.merchant].capability_status_updated": {
        const related = (event as unknown as { related_object?: { id?: string } })
          .related_object;
        if (related?.id) {
          await upsertPartner(related.id, { onboardingComplete: true });
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const accountId = (event as { account?: string }).account;
        if (accountId) {
          await recordCheckoutSession(accountId, session.id, true);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerAccount = (
          invoice as unknown as { customer_account?: string }
        ).customer_account;
        if (customerAccount) {
          await upsertPartner(customerAccount, { subscriptionPaid: true });
        }
        break;
      }

      default:
        // Not a subscribed event — acknowledge and ignore.
        break;
    }
  } catch (err) {
    // Log but still 200 — Stripe retries on non-2xx and the identifiers are
    // recoverable from the API.
    console.error("webhook handling failed", err);
  }

  return NextResponse.json({ received: true });
}
