"use client";

// "With a connector" calendar sync — real OAuth to Google Calendar and
// Outlook (Microsoft Graph). Fully working code once the corresponding
// env vars are set (see lib/google-calendar.ts / lib/outlook-calendar.ts
// for setup steps); shows a clear "not configured yet" state otherwise
// rather than a broken button.

import { useEffect, useState } from "react";

interface Status {
  google: { configured: boolean; connected: boolean };
  outlook: { configured: boolean; connected: boolean };
}

function ProviderRow({
  name,
  icon,
  status,
}: {
  name: "google" | "outlook";
  icon: string;
  status: { configured: boolean; connected: boolean } | undefined;
}) {
  const label = name === "google" ? "Google Calendar" : "Outlook";
  if (!status) return null;

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-md border border-ink/10">
      <div className="flex items-center gap-2">
        <span className="text-lg" aria-hidden>{icon}</span>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-ink/55">
            {!status.configured
              ? "Not set up by your administrator yet"
              : status.connected
                ? "Connected — new bookings sync automatically"
                : "Not connected"}
          </p>
        </div>
      </div>
      {status.configured ? (
        status.connected ? (
          <span className="text-xs font-semibold text-accent px-2 py-1 rounded-full bg-accent/10">
            ✓ Connected
          </span>
        ) : (
          <a
            href={`/api/calendar/${name}/connect`}
            className="min-h-[44px] inline-flex items-center px-4 rounded-md border border-accent text-accent hover:bg-accent hover:text-cream text-sm font-semibold transition-colors"
          >
            Connect
          </a>
        )
      ) : (
        <span className="text-xs text-ink/40">Unavailable</span>
      )}
    </div>
  );
}

export default function CalendarConnectors() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch("/api/calendar/status")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  return (
    <div className="saas-card space-y-3">
      <div>
        <h3 className="font-semibold text-sm">Live two-way sync</h3>
        <p className="text-xs text-ink/60 mt-0.5">
          Connect once — every new booking is pushed to your connected
          calendar automatically, no re-downloading.
        </p>
      </div>
      <div className="space-y-2">
        <ProviderRow name="google" icon="📅" status={status?.google} />
        <ProviderRow name="outlook" icon="📧" status={status?.outlook} />
      </div>
    </div>
  );
}
