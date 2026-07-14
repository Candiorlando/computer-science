import { promises as fs } from "fs";
import path from "path";

// Server-side persistence for Stripe resource identifiers, keyed to the
// platform's partner/vendor domain (one record per connected account).
//
// The app has no database (it is demo-seeded), so this is a small JSON file
// store: durable in local dev, best-effort on serverless (each instance has
// its own ephemeral disk, so the API routes also return every identifier to
// the client, and the Payments page mirrors them in localStorage). Swap this
// file for real database calls when a datastore lands.

export interface StripePartnerRecord {
  /** Connected account id (acct_...) — the partner org on the platform. */
  connectedAccountId: string;
  createdAt: string;
  onboardingComplete?: boolean;
  /** Platform subscription plan. */
  subscriptionProductId?: string;
  subscriptionPriceId?: string;
  /** stripe_balance payment method attached via SetupIntent. */
  defaultPaymentMethodId?: string;
  subscriptionId?: string;
  subscriptionPaid?: boolean;
  /** Checkout sessions created on behalf of this account. */
  checkoutSessionIds?: string[];
  completedCheckoutSessionIds?: string[];
}

interface StoreShape {
  partners: Record<string, StripePartnerRecord>;
}

function storePath(): string {
  const dir =
    process.env.VERCEL === "1" ? "/tmp" : path.join(process.cwd(), ".data");
  return path.join(dir, "stripe-store.json");
}

async function load(): Promise<StoreShape> {
  try {
    const raw = await fs.readFile(storePath(), "utf8");
    return JSON.parse(raw) as StoreShape;
  } catch {
    return { partners: {} };
  }
}

async function save(store: StoreShape): Promise<void> {
  try {
    await fs.mkdir(path.dirname(storePath()), { recursive: true });
    await fs.writeFile(storePath(), JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Best-effort on read-only/ephemeral filesystems; identifiers are also
    // returned to the client on every call.
  }
}

export async function getPartner(
  accountId: string,
): Promise<StripePartnerRecord | undefined> {
  const store = await load();
  return store.partners[accountId];
}

export async function upsertPartner(
  accountId: string,
  patch: Partial<StripePartnerRecord>,
): Promise<StripePartnerRecord> {
  const store = await load();
  const existing: StripePartnerRecord = store.partners[accountId] ?? {
    connectedAccountId: accountId,
    createdAt: new Date().toISOString(),
  };
  const next = { ...existing, ...patch, connectedAccountId: accountId };
  store.partners[accountId] = next;
  await save(store);
  return next;
}

export async function recordCheckoutSession(
  accountId: string,
  sessionId: string,
  completed = false,
): Promise<void> {
  const record = (await getPartner(accountId)) ?? {
    connectedAccountId: accountId,
    createdAt: new Date().toISOString(),
  };
  const open = new Set(record.checkoutSessionIds ?? []);
  const done = new Set(record.completedCheckoutSessionIds ?? []);
  (completed ? done : open).add(sessionId);
  await upsertPartner(accountId, {
    checkoutSessionIds: [...open],
    completedCheckoutSessionIds: [...done],
  });
}
