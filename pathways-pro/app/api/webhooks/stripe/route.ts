import { NextResponse } from "next/server";
import { getStripe, stripeErrorBody } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Stripe webhook handler for subscription lifecycle events.
//
// Subscribe to these events in the Stripe Dashboard:
//   - invoice.payment_succeeded (activate subscription)
//   - invoice.payment_failed (flag for dunning)
//   - customer.subscription.updated (seat changes, plan changes)
//   - customer.subscription.deleted (cancellation)
//
// After Prisma migration, update the Organization/Subscription records:
//
// import { prisma } from "@/lib/prisma";
//
// case "invoice.payment_succeeded":
//   await prisma.subscription.update({
//     where: { stripeSubscriptionId: subscriptionId },
//     data: { status: "ACTIVE" },
//   });

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();

  if (!secret || !signature) {
    return NextResponse.json(
      { error: "Webhook secret or signature missing." },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return NextResponse.json(stripeErrorBody(err), { status: 400 });
  }

  try {
    switch (event.type) {
      case "invoice.payment_succeeded": {
        // Cast for fields the v22 SDK types no longer surface directly on
        // Invoice (subscription moved under invoice parent details).
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | { id: string };
          subscription_details?: { metadata?: Record<string, string> };
        };
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;

        console.log("Subscription activated:", {
          subscriptionId,
          customerId: invoice.customer,
          amountPaid: invoice.amount_paid,
          plan: invoice.subscription_details?.metadata?.plan,
        });

        // TODO: After Prisma migration:
        // await prisma.subscription.update({
        //   where: { stripeSubscriptionId: subscriptionId },
        //   data: {
        //     status: "ACTIVE",
        //     currentPeriodStart: new Date(invoice.period_start * 1000),
        //     currentPeriodEnd: new Date(invoice.period_end * 1000),
        //   },
        // });
        // await prisma.organization.update({
        //   where: { stripeSubscriptionId: subscriptionId },
        //   data: { stripeCustomerId: invoice.customer as string },
        // });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & {
          subscription?: string | { id: string };
        };
        console.log("Payment failed:", {
          subscriptionId: invoice.subscription,
          customerId: invoice.customer,
          attemptCount: invoice.attempt_count,
        });

        // TODO: Update subscription status to PAST_DUE, send dunning email
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        console.log("Subscription updated:", {
          id: sub.id,
          status: sub.status,
          quantity: sub.items.data[0]?.quantity,
        });

        // TODO: Sync seat count and status
        // await prisma.subscription.update({
        //   where: { stripeSubscriptionId: sub.id },
        //   data: {
        //     status: sub.status.toUpperCase(),
        //     seatCount: sub.items.data[0]?.quantity ?? 1,
        //   },
        // });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        console.log("Subscription canceled:", { id: sub.id });

        // TODO: Mark as canceled, downgrade access
        // await prisma.subscription.update({
        //   where: { stripeSubscriptionId: sub.id },
        //   data: { status: "CANCELED" },
        // });
        break;
      }

      default:
        // Unhandled event type — acknowledge silently
        break;
    }
  } catch (err) {
    console.error("Webhook processing error:", err);
    // Return 200 to prevent Stripe retries on processing errors
    // that we've logged but can't recover from
  }

  return NextResponse.json({ received: true });
}
