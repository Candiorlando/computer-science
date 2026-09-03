"use client";

// Platform payments console: drives the embedded-payments and subscription
// flow end to end against the Stripe API routes —
//   1. create a connected account (merchant + customer configurations),
//   2. onboard it via a Stripe-hosted account link,
//   3. take a service-order payment on its behalf (Checkout, test card
//      4000 0000 0000 0077), with a platform application fee,
//   4. charge the platform subscription from the account's balance.

import { useEffect, useState } from "react";
import { EmbeddedOnboarding } from "@/components/EmbeddedOnboarding";
import AccessGuard from "@/components/AccessGuard";
import { canManageBilling } from "@/lib/rbac";

const STORAGE_KEY = "pathways-pro:stripe-demo-v1";

interface DemoState {
  accountId?: string;
  onboardingUrl?: string;
  checkoutUrl?: string;
  checkoutSessionId?: string;
  productId?: string;
  priceId?: string;
  paymentMethodId?: string;
  subscriptionId?: string;
  subscriptionStatus?: string;
}

function loadState(): DemoState {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export default function PaymentsPage() {
  const [state, setState] = useState<DemoState>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmbeddedOnboarding, setShowEmbeddedOnboarding] = useState(false);

  useEffect(() => {
    setState(loadState());
  }, []);

  function update(patch: DemoState) {
    setState((prev) => {
      const next = { ...prev, ...patch };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function call(step: string, url: string, body?: object) {
    setBusy(step);
    setError(null);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body ?? {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status}).`);
      return data;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed.");
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function createAccount() {
    const data = await call("account", "/api/stripe/create-account");
    if (data?.account?.id) update({ accountId: data.account.id });
  }

  async function onboard() {
    const data = await call("onboard", "/api/stripe/create-account-link", {
      accountId: state.accountId,
    });
    const url = data?.accountLink?.url;
    if (url) {
      update({ onboardingUrl: url });
      window.open(url, "_blank", "noopener");
    }
  }

  async function createCheckoutSession() {
    const data = await call("checkout", "/api/stripe/create-checkout-session", {
      accountId: state.accountId,
    });
    if (data?.url) {
      update({ checkoutUrl: data.url, checkoutSessionId: data.sessionId });
      window.open(data.url, "_blank", "noopener");
    }
  }

  async function chargeSubscription() {
    const data = await call("subscription", "/api/stripe/create-subscription", {
      accountId: state.accountId,
    });
    if (data?.subscriptionId) {
      update({
        productId: data.productId,
        priceId: data.priceId,
        paymentMethodId: data.paymentMethodId,
        subscriptionId: data.subscriptionId,
        subscriptionStatus: data.subscriptionStatus,
      });
    }
  }

  const steps = [
    {
      key: "account",
      n: 1,
      title: "Create a partner account",
      blurb:
        "Creates a connected account configured as a merchant (accepts payments) and a customer (pays platform subscription fees).",
      action: createAccount,
      cta: "Create account",
      done: !!state.accountId,
      doneDetail: state.accountId,
      disabled: false,
    },
    {
      key: "onboard",
      n: 2,
      title: "Onboard the account",
      blurb:
        "Complete KYC without leaving Pathways Pro (embedded onboarding, recommended), or open the Stripe-hosted flow in a new tab. In test mode you can skip through it.",
      action: () => setShowEmbeddedOnboarding((v) => !v),
      cta: showEmbeddedOnboarding ? "Hide onboarding" : "Onboard in-app",
      done: !!state.onboardingUrl || showEmbeddedOnboarding,
      doneDetail: state.onboardingUrl && "Hosted onboarding link created",
      disabled: !state.accountId,
    },
    {
      key: "checkout",
      n: 3,
      title: "Take a service-order payment",
      blurb:
        "Creates a Checkout Session on behalf of the partner (with a platform application fee) and opens it. Pay with test card 4000 0000 0000 0077, any future expiry, any CVC.",
      action: createCheckoutSession,
      cta: "Open checkout →",
      done: !!state.checkoutSessionId,
      doneDetail: state.checkoutSessionId,
      disabled: !state.accountId,
    },
    {
      key: "subscription",
      n: 4,
      title: "Charge the platform subscription",
      blurb:
        "Attaches the account's Stripe balance as its payment method and charges the monthly platform subscription from it. Run after the checkout payment so the balance is funded.",
      action: chargeSubscription,
      cta: "Charge subscription",
      done: !!state.subscriptionId,
      doneDetail:
        state.subscriptionId &&
        `${state.subscriptionId} (${state.subscriptionStatus ?? "created"})`,
      disabled: !state.accountId,
    },
  ];

  return (
    <AccessGuard
      check={canManageBilling}
      title="Billing setup is managed by your tenant administrator"
      message="Accounts receivable and Stripe onboarding are handled centrally by your agency's tenant administrator, or directly by you if you operate as an independent (solopreneur) counselor. Contact your tenant administrator if you need a payment set up."
    >
    <div className="space-y-8 pb-8">
      <header className="space-y-3 max-w-3xl">
        <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
          Platform payments · Stripe test mode
        </p>
        <h1 className="text-4xl tracking-tight">Payments &amp; subscriptions</h1>
        <p className="text-ink/70 prose-narrow">
          Onboard employment partners as connected accounts, accept
          service-order payments on their behalf (with a platform fee), and
          charge them the platform subscription — end to end, in Stripe test
          mode. Requires <code>STRIPE_SECRET_KEY</code> in the environment.
        </p>
      </header>

      {error && (
        <div className="saas-card border-red-300 !bg-red-50 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {steps.map((s) => (
          <div key={s.key}>
            <div className="saas-card flex flex-col sm:flex-row sm:items-center gap-4">
              <span
                className={`flex-none w-8 h-8 grid place-items-center rounded-md text-sm font-bold tabular-nums ${
                  s.done ? "bg-accent text-cream" : "bg-ink/10 text-ink"
                }`}
              >
                {s.done ? "✓" : s.n}
              </span>
              <div className="flex-1 space-y-1">
                <h2 className="text-lg font-semibold text-ink">{s.title}</h2>
                <p className="text-sm text-ink/70">{s.blurb}</p>
                {s.done && s.doneDetail && (
                  <p className="text-xs text-ink/50 break-all">{s.doneDetail}</p>
                )}
              </div>
              {s.key === "onboard" && (
                <button
                  onClick={onboard}
                  disabled={s.disabled || busy !== null}
                  className="flex-none border border-accent text-accent font-semibold px-5 py-2.5 rounded-md hover:bg-accent/5 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {busy === "onboard" ? "Working…" : "Hosted onboarding ↗"}
                </button>
              )}
              <button
                onClick={s.action}
                disabled={s.disabled || busy !== null}
                className="flex-none bg-gold text-ink font-semibold px-5 py-2.5 rounded-md hover:bg-gold-soft transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {busy === s.key ? "Working…" : s.cta}
              </button>
            </div>
            {s.key === "onboard" && showEmbeddedOnboarding && state.accountId && (
              <div className="mt-3">
                <EmbeddedOnboarding
                  accountId={state.accountId}
                  onExit={() => setShowEmbeddedOnboarding(false)}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-ink/50 max-w-3xl">
        Onboarding completion, checkout payments, and subscription invoices are
        confirmed asynchronously via the webhook endpoint at{" "}
        <code>/api/stripe/webhooks</code> (events:{" "}
        <code>capability_status_updated</code>,{" "}
        <code>checkout.session.completed</code>,{" "}
        <code>invoice.payment_succeeded</code>). All identifiers are also kept
        in this browser so the demo survives serverless restarts.
      </p>
    </div>
    </AccessGuard>
  );
}
