"use client";

// Embedded onboarding (Stripe's recommended in-app option): renders the
// Account Onboarding component inside our application so partners complete
// KYC without leaving Pathways Pro. Hosted onboarding remains available as
// a fallback on the payments console.

import { useEffect, useRef, useState } from "react";
import {
  loadConnectAndInitialize,
  type StripeConnectInstance,
} from "@stripe/connect-js/pure";
import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
} from "@stripe/react-connect-js";

async function createAccountSession(accountId: string) {
  const res = await fetch("/api/stripe/create-account-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accountId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Account session failed (${res.status}).`);
  }
  return data as { clientSecret: string; publishableKey: string };
}

export function EmbeddedOnboarding({
  accountId,
  onExit,
}: {
  accountId: string;
  onExit: () => void;
}) {
  const [instance, setInstance] = useState<StripeConnectInstance | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The first account session provides the publishable key AND the first
  // client secret; fetchClientSecret reuses it once, then mints fresh ones.
  const firstSecret = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { clientSecret, publishableKey } =
          await createAccountSession(accountId);
        firstSecret.current = clientSecret;
        if (cancelled) return;
        setInstance(
          loadConnectAndInitialize({
            publishableKey,
            fetchClientSecret: async () => {
              if (firstSecret.current) {
                const secret = firstSecret.current;
                firstSecret.current = null;
                return secret;
              }
              return (await createAccountSession(accountId)).clientSecret;
            },
            appearance: {
              variables: { colorPrimary: "#1f5f4f" },
            },
          }),
        );
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Could not start onboarding.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountId]);

  if (error) {
    return <div className="saas-card border-red-300 !bg-red-50 text-sm text-red-800">{error}</div>;
  }
  if (!instance) {
    return <div className="saas-card text-sm text-ink/60">Loading onboarding…</div>;
  }

  return (
    <div className="saas-card">
      <ConnectComponentsProvider connectInstance={instance}>
        <ConnectAccountOnboarding onExit={onExit} />
      </ConnectComponentsProvider>
    </div>
  );
}
