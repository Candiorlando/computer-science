"use client";

import { useState } from "react";
import type { LimitCheck } from "@/lib/usage-limits";

// UpgradeGate — wraps any "add" action (new case, new business client)
// and blocks it when the Solo tier limit is reached. Shows a modal with
// usage stats and a button to launch the Stripe Customer Portal for
// upgrading to Agency.
//
// Usage:
//   <UpgradeGate limitCheck={caseLimitCheck} resourceName="active cases">
//     <button onClick={addCase}>Add Case</button>
//   </UpgradeGate>

interface UpgradeGateProps {
  limitCheck: LimitCheck | null;
  resourceName: string;              // "active cases" or "active business clients"
  children: React.ReactNode;
  onUpgrade?: () => void;            // custom handler
  stripeCustomerId?: string;         // for portal redirect
}

export function UpgradeGate({
  limitCheck,
  resourceName,
  children,
  onUpgrade,
  stripeCustomerId,
}: UpgradeGateProps) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Not loaded yet or no limits enforced — render children normally
  if (!limitCheck) return <>{children}</>;

  // Under limit — render children normally
  if (limitCheck.allowed) return <>{children}</>;

  // At or over limit — intercept and show upgrade prompt
  async function handleUpgrade() {
    if (onUpgrade) {
      onUpgrade();
      return;
    }
    if (!stripeCustomerId) {
      // Fallback: redirect to payments page
      window.location.href = "/dashboard/payments";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stripeCustomerId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  const percentage = limitCheck.max > 0
    ? Math.min(100, Math.round((limitCheck.current / limitCheck.max) * 100))
    : 0;

  return (
    <>
      {/* Render children but intercept clicks */}
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowModal(true);
        }}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setShowModal(true);
          }
        }}
      >
        {children}
      </div>

      {/* Upgrade modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="upgrade-heading"
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-accent font-semibold">
                {limitCheck.tier} plan limit reached
              </p>
              <h2 id="upgrade-heading" className="text-2xl font-semibold tracking-tight">
                You&apos;ve reached {limitCheck.current} of {limitCheck.max}{" "}
                {resourceName}.
              </h2>
              <p className="text-sm text-ink/70">
                Your Solo Practitioner plan allows up to {limitCheck.max}{" "}
                {resourceName}. Upgrade to Agency for unlimited capacity.
              </p>
            </div>

            {/* Usage bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-ink/60">
                <span>{limitCheck.current} used</span>
                <span>{limitCheck.max} max</span>
              </div>
              <div className="h-3 bg-ink/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {/* Tier comparison */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="border border-ink/15 rounded-md p-3 bg-ink/[0.02]">
                <div className="font-semibold text-ink/50 text-xs uppercase">
                  Solo (current)
                </div>
                <div className="mt-1">100 cases</div>
                <div>200 business clients</div>
                <div className="text-accent font-semibold mt-1">$250/mo</div>
              </div>
              <div className="border-2 border-accent rounded-md p-3">
                <div className="font-semibold text-accent text-xs uppercase">
                  Agency
                </div>
                <div className="mt-1">Unlimited cases</div>
                <div>Unlimited clients</div>
                <div className="text-accent font-semibold mt-1">
                  $125/seat/mo
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpgrade}
                disabled={loading}
                className="flex-1 bg-accent text-cream font-semibold py-3 rounded-md hover:bg-accent/90 transition disabled:opacity-50"
              >
                {loading ? "Loading..." : "Upgrade to Agency"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-3 border border-ink/15 rounded-md text-ink/70 hover:bg-ink/5 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Usage indicator bar (for dashboard headers) ────────────────────

export function UsageIndicator({
  limitCheck,
  label,
}: {
  limitCheck: LimitCheck | null;
  label: string;
}) {
  if (!limitCheck || limitCheck.max === -1) return null;

  const percentage = Math.min(
    100,
    Math.round((limitCheck.current / limitCheck.max) * 100),
  );
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-ink/60">{label}</span>
        <span
          className={
            isAtLimit
              ? "text-red-600 font-semibold"
              : isNearLimit
                ? "text-amber-600 font-semibold"
                : "text-ink/55"
          }
        >
          {limitCheck.current} / {limitCheck.max}
        </span>
      </div>
      <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isAtLimit
              ? "bg-red-500"
              : isNearLimit
                ? "bg-amber-500"
                : "bg-accent"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
