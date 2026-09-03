import { NextResponse } from "next/server";
import { z } from "zod";
import { getStripe, stripeErrorBody } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RequestSchema = z.object({ accountId: z.string().min(1) });

// Create an Account Session so the embedded Account Onboarding component can
// run inside our application (Stripe's recommended alternative to hosted
// onboarding). The client secret authorizes only this connected account's
// onboarding component.
export async function POST(req: Request) {
  const parsed = RequestSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "accountId is required." },
      { status: 400 },
    );
  }

  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return NextResponse.json(
      {
        error:
          "STRIPE_PUBLISHABLE_KEY is not set. Add it next to STRIPE_SECRET_KEY (pk_test_... from https://dashboard.stripe.com/apikeys).",
      },
      { status: 500 },
    );
  }

  try {
    const stripe = getStripe();
    const session = await stripe.accountSessions.create({
      account: parsed.data.accountId,
      components: {
        account_onboarding: { enabled: true },
      },
    });

    return NextResponse.json({
      clientSecret: session.client_secret,
      publishableKey,
    });
  } catch (err) {
    console.error("create-account-session failed", err);
    return NextResponse.json(stripeErrorBody(err), { status: 500 });
  }
}
