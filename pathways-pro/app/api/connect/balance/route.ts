import { NextResponse } from "next/server";
import { getStripe, stripeErrorBody } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Returns the Stripe Connect balance for a counselor's connected account.
// Used by the /dashboard/financials page to show real-time earnings.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const connectedAccountId = searchParams.get("accountId");

  if (!connectedAccountId) {
    return NextResponse.json(
      { error: "accountId query param required" },
      { status: 400 },
    );
  }

  try {
    const stripe = getStripe();

    // Fetch balance from the connected account
    const balance = await stripe.balance.retrieve({
      stripeAccount: connectedAccountId,
    });

    // Fetch recent payouts
    const payouts = await stripe.payouts.list(
      { limit: 5 },
      { stripeAccount: connectedAccountId },
    );

    // Fetch recent charges (payments received)
    const charges = await stripe.charges.list(
      { limit: 10 },
      { stripeAccount: connectedAccountId },
    );

    return NextResponse.json({
      balance: {
        available: balance.available.map((b) => ({
          amount: b.amount,
          currency: b.currency,
        })),
        pending: balance.pending.map((b) => ({
          amount: b.amount,
          currency: b.currency,
        })),
      },
      recentPayouts: payouts.data.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status,
        arrivalDate: p.arrival_date,
        createdAt: p.created,
      })),
      recentCharges: charges.data.map((c) => ({
        id: c.id,
        amount: c.amount,
        currency: c.currency,
        status: c.status,
        description: c.description,
        createdAt: c.created,
        applicationFee: c.application_fee_amount,
      })),
    });
  } catch (err) {
    console.error("connect balance fetch failed", err);
    return NextResponse.json(stripeErrorBody(err), { status: 500 });
  }
}
