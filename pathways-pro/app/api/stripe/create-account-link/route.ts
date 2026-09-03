import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, stripeErrorBody, STRIPE_PREVIEW_API_VERSION } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({ accountId: z.string().min(1) });

// Create an account link so the connected account can complete Stripe-hosted
// onboarding (KYC) for both its merchant and customer configurations.
export async function POST(req: Request) {
  const parsed = RequestSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "accountId is required." },
      { status: 400 },
    );
  }

  const origin = req.headers.get("origin") ?? new URL(req.url).origin;
  const paymentsUrl = `${origin}/dashboard/payments`;

  try {
    const stripe = getStripe();
    const accountLink = await stripe.v2.core.accountLinks.create({
      account: parsed.data.accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["merchant", "customer"],
          refresh_url: `${paymentsUrl}?onboarding=refresh`,
          return_url: `${paymentsUrl}?onboarding=return`,
        },
      },
    } as never,
    { apiVersion: STRIPE_PREVIEW_API_VERSION });

    return NextResponse.json({ accountLink });
  } catch (err) {
    console.error("create-account-link failed", err);
    return NextResponse.json(stripeErrorBody(err), { status: 500 });
  }
}
