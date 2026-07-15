"use client";

import { useCallback, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { stripeAppearance } from "@/lib/stripe-appearance";

/* ═══════════════════════════════════════════════════════════════════════
   Inline SaaS Checkout — Stripe Payment Element

   Flow (PCI-DSS SAQ A compliant):
     1. User selects plan + seats on this page
     2. POST /api/checkout/create-subscription → creates incomplete sub
     3. Stripe returns client_secret → Elements provider mounts
     4. User enters card in <PaymentElement /> (Stripe iframe — no card
        data touches our server)
     5. stripe.confirmPayment() finalizes → webhook activates subscription

   No card numbers, expiry dates, or CVCs are ever handled by our code.
═══════════════════════════════════════════════════════════════════════ */

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "",
);

type Plan = "solo" | "agency";

export default function CheckoutPage() {
  const [plan, setPlan] = useState<Plan>("solo");
  const [seats, setSeats] = useState(10);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const monthlyTotal =
    plan === "solo" ? 250_00 : Math.max(seats, 10) * 125_00;

  const handleInitialize = useCallback(async () => {
    if (!email || !name) {
      setError("Name and email are required.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/checkout/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          seats: plan === "agency" ? Math.max(seats, 10) : undefined,
          email,
          name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to initialize checkout.");
        return;
      }
      setClientSecret(data.clientSecret);
      setSubscriptionId(data.subscriptionId);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [plan, seats, email, name]);

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-accent">
          Subscribe to Pathways Pro
        </p>
        <h1 className="text-4xl tracking-tight">
          Choose your plan.
        </h1>
        <p className="text-ink/70">
          Select a plan, enter your details, and pay securely with Stripe.
          Your card information never touches our servers.
        </p>
      </header>

      {/* Step 1: Plan selection (always visible) */}
      <div className="grid sm:grid-cols-2 gap-4">
        <PlanCard
          title="Solo Practitioner"
          price="$250"
          period="/month"
          description="Single counselor seat with full platform access."
          selected={plan === "solo"}
          onSelect={() => setPlan("solo")}
        />
        <PlanCard
          title="Agency"
          price="$125"
          period="/seat/month"
          description="10+ seats with admin dashboard and shared caseloads."
          selected={plan === "agency"}
          onSelect={() => setPlan("agency")}
          badge="Best for teams"
        />
      </div>

      {plan === "agency" && (
        <div className="border border-ink/15 bg-cream rounded-lg p-5 space-y-3">
          <label className="block">
            <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
              Number of seats (minimum 10)
            </span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={10}
                max={100}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <span className="text-2xl font-bold text-accent w-12 text-right tabular-nums">
                {seats}
              </span>
            </div>
          </label>
          <p className="text-sm text-ink/60">
            {seats} seats x $125/mo ={" "}
            <strong className="text-ink">
              ${(seats * 125).toLocaleString()}/mo
            </strong>
          </p>
        </div>
      )}

      {/* Step 2: Contact info + initialize */}
      {!clientSecret && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
                Full name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Candace Metcalf"
                className="w-full bg-white border border-ink/20 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@agency.gov"
                className="w-full bg-white border border-ink/20 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </label>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-xs uppercase tracking-wider text-ink/55">
                Monthly total
              </div>
              <div className="text-3xl font-bold text-accent">
                ${(monthlyTotal / 100).toLocaleString()}
              </div>
            </div>
            <button
              onClick={handleInitialize}
              disabled={loading}
              className="bg-accent text-cream font-semibold px-8 py-3 rounded-md hover:bg-accent/90 transition disabled:opacity-50"
            >
              {loading ? "Initializing..." : "Continue to payment"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Stripe Payment Element */}
      {clientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: stripeAppearance,
          }}
        >
          <PaymentForm
            plan={plan}
            seats={plan === "agency" ? seats : 1}
            monthlyTotal={monthlyTotal}
            subscriptionId={subscriptionId}
          />
        </Elements>
      )}

      <p className="text-xs text-ink/50 text-center">
        Secured by Stripe. Your payment information is encrypted and
        processed directly by Stripe — it never touches Pathways Pro
        servers. PCI-DSS SAQ A compliant.
      </p>
    </div>
  );
}

/* ═══════════════════════ Payment Form ═════════════════════════════════ */

function PaymentForm({
  plan,
  seats,
  monthlyTotal,
  subscriptionId,
}: {
  plan: Plan;
  seats: number;
  monthlyTotal: number;
  subscriptionId: string | null;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError("");

    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success?subscription=${subscriptionId}`,
      },
    });

    // confirmPayment redirects on success. If we reach here, there was
    // an error (card declined, network issue, etc.)
    if (confirmError) {
      setError(
        confirmError.message ?? "Payment failed. Please try a different card.",
      );
    }
    setProcessing(false);
  }

  if (success) {
    return (
      <div className="border-2 border-accent bg-accent/5 rounded-lg p-8 text-center space-y-3">
        <div className="text-4xl">&#10003;</div>
        <h2 className="text-2xl font-semibold text-accent">
          Payment successful
        </h2>
        <p className="text-ink/70">
          Your {plan === "solo" ? "Solo Practitioner" : `Agency (${seats} seats)`}{" "}
          subscription is now active.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="border border-ink/15 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-ink/55">
              {plan === "solo" ? "Solo Practitioner" : `Agency · ${seats} seats`}
            </div>
            <div className="text-2xl font-bold text-accent">
              ${(monthlyTotal / 100).toLocaleString()}/mo
            </div>
          </div>
          <div className="text-xs bg-accent/10 text-accent font-semibold px-3 py-1 rounded-full">
            Recurring monthly
          </div>
        </div>

        {/* Stripe Payment Element — all card data stays in Stripe's iframe */}
        <PaymentElement
          options={{
            layout: "tabs",
          }}
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-accent text-cream font-semibold py-3.5 rounded-md hover:bg-accent/90 transition disabled:opacity-50 text-lg"
      >
        {processing
          ? "Processing..."
          : `Subscribe · $${(monthlyTotal / 100).toLocaleString()}/mo`}
      </button>
    </form>
  );
}

/* ═══════════════════════ Plan Card ════════════════════════════════════ */

function PlanCard({
  title,
  price,
  period,
  description,
  selected,
  onSelect,
  badge,
}: {
  title: string;
  price: string;
  period: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left border-2 rounded-lg p-5 transition relative ${
        selected
          ? "border-accent bg-accent/5"
          : "border-ink/15 bg-cream hover:border-accent/40"
      }`}
    >
      {badge && (
        <span className="absolute -top-2.5 right-3 bg-accent text-cream text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="text-xs uppercase tracking-widest text-accent font-semibold">
        {title}
      </div>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="text-3xl font-bold text-ink">{price}</span>
        <span className="text-ink/55 text-sm">{period}</span>
      </div>
      <p className="text-sm text-ink/65 mt-2">{description}</p>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span
          className={`w-4 h-4 rounded-full border-2 grid place-items-center ${
            selected ? "border-accent bg-accent" : "border-ink/30"
          }`}
        >
          {selected && (
            <span className="text-cream text-[10px]">&#10003;</span>
          )}
        </span>
        <span className={selected ? "text-accent font-medium" : "text-ink/50"}>
          {selected ? "Selected" : "Select"}
        </span>
      </div>
    </button>
  );
}
