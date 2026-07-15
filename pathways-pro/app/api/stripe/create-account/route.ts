import { NextResponse } from "next/server";
import {
  getStripe,
  connectedAccountCountry,
  currency,
  stripeErrorBody,
  STRIPE_PREVIEW_API_VERSION,
} from "@/lib/stripe";
import { upsertPartner } from "@/lib/stripe-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Create a connected account (Accounts v2) configured as both a merchant —
// so the partner can accept card payments from its customers — and a
// customer — so the platform can charge it subscription fees.
export async function POST(req: Request) {
  let body: { displayName?: string; contactEmail?: string } = {};
  try {
    body = await req.json();
  } catch {
    // Empty body is fine — defaults below.
  }
  const displayName = body.displayName || "Test account";

  try {
    const stripe = getStripe();
    const account = await stripe.v2.core.accounts.create(
      {
        display_name: displayName,
        contact_email: body.contactEmail || "testaccount@example.com",
        dashboard: "full",
        identity: {
          country: connectedAccountCountry().toLowerCase(),
          entity_type: "company",
          business_details: {
            registered_name: displayName,
            phone: "0000000000",
          },
        },
        configuration: {
          customer: {},
          merchant: {
            capabilities: { card_payments: { requested: true } },
            // Test-mode only: simulates Terms of Service acceptance on
            // behalf of the account so the demo runs end-to-end without KYC.
            simulate_accept_tos_obo: true,
          },
        },
        defaults: {
          currency: currency(),
          responsibilities: {
            fees_collector: "stripe",
            losses_collector: "stripe",
          },
          locales: ["en-US"],
        },
        include: [
          "configuration.customer",
          "configuration.merchant",
          "identity",
          "defaults",
          "requirements",
        ],
      } as never,
      { apiVersion: STRIPE_PREVIEW_API_VERSION },
    );

    const record = await upsertPartner(account.id, {});
    return NextResponse.json({ account, record });
  } catch (err) {
    console.error("create-account failed", err);
    return NextResponse.json(stripeErrorBody(err), { status: 500 });
  }
}
