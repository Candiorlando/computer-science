import Stripe from "stripe";

// Accounts v2 and balance-funded subscriptions are preview features; requests
// that use them must send this Stripe-Version header (pass as a per-request
// option so plain v1 calls keep the account's default version).
export const STRIPE_PREVIEW_API_VERSION = "2026-06-24.preview";

// Singleton Stripe client. The client-level API version is deliberately left
// unset so the account's default version applies to standard calls.
let client: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Copy .env.local.example to .env.local and add your key from the Stripe Dashboard (https://dashboard.stripe.com/apikeys).",
    );
  }
  if (!client) client = new Stripe(key);
  return client;
}

/** Country used for new connected accounts (blueprint env: connectedAccountCountry). */
export function connectedAccountCountry(): string {
  return process.env.CONNECTED_ACCOUNT_COUNTRY || "US";
}

/** Currency used for payments and subscriptions (blueprint env: currency). */
export function currency(): string {
  return process.env.CURRENCY || "usd";
}

/** JSON error body for API routes, with a friendly Stripe message when available. */
export function stripeErrorBody(err: unknown): { error: string } {
  if (err instanceof Error) return { error: err.message };
  return { error: "Unexpected error talking to Stripe." };
}
