import { NextResponse } from "next/server";
import { getStripe, connectedAccountCountry, stripeErrorBody } from "@/lib/stripe";
import { upsertPartner } from "@/lib/stripe-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Create a connected account (Accounts v2) configured as both a merchant —
// so the partner can accept payments from its customers — and a customer —
// so the platform can charge it subscription fees.
export async function POST(req: Request) {
  let body: { displayName?: string; contactEmail?: string } = {};
  try {
    body = await req.json();
  } catch {
    // Empty body is fine — defaults below.
  }

  try {
    const stripe = getStripe();
    const account = await stripe.v2.core.accounts.create({
      display_name: body.displayName || "Test account",
      contact_email: body.contactEmail || "testaccount@example.com",
      configuration: {
        merchant: {
          // Test-mode only: simulates Terms of Service acceptance on behalf
          // of the account so the demo can run end-to-end without KYC.
          simulate_accept_tos_obo: true,
        },
      },
      include: [
        "configuration.merchant",
        "configuration.recipient",
        "identity",
        "defaults",
        "configuration.customer",
      ],
      identity: {
        country: connectedAccountCountry(),
        business_details: { phone: "0000000000" },
      },
      dashboard: "full",
      defaults: {
        responsibilities: {
          losses_collector: "stripe",
          fees_collector: "stripe",
        },
      },
    } as never);

    const record = await upsertPartner(account.id, {});
    return NextResponse.json({ account, record });
  } catch (err) {
    console.error("create-account failed", err);
    return NextResponse.json(stripeErrorBody(err), { status: 500 });
  }
}
