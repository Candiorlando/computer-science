"use client";

// Counselor scheduling — a real calendar (appointments + discovered local
// events), weekly availability, and export/subscribe to Google/Outlook/
// Apple Calendar.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import { CLIENTS } from "@/lib/users";
import type { CounselorUser } from "@/lib/users";
import AvailabilityManager from "@/components/AvailabilityManager";
import AppointmentList from "@/components/AppointmentList";
import CalendarGrid from "@/components/CalendarGrid";
import CalendarExport from "@/components/CalendarExport";
import CalendarConnectors from "@/components/CalendarConnectors";
import {
  appointmentsForUser,
  browserTimezone,
  type Appointment,
} from "@/lib/scheduling";
import {
  refreshDiscoveredEvents,
  loadCachedEvents,
  visibleEventsForCounselor,
  dismissEvent,
  CATEGORY_META,
  type DiscoveredEvent,
  type EventCategory,
} from "@/lib/discovered-events";

type Tab = "calendar" | "upcoming" | "availability" | "export";

export default function CounselorSchedulePage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [tab, setTab] = useState<Tab>("calendar");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [events, setEvents] = useState<DiscoveredEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const tz = browserTimezone();

  useEffect(() => {
    const s = loadSession();
    if (!s) return void router.replace("/signin");
    if (s.role !== "counselor") return void router.replace("/portal");
    setUser(s);
    setAppointments(appointmentsForUser(s.email));
    const cached = loadCachedEvents();
    if (cached.length) {
      setEvents(visibleEventsForCounselor(s.email, cached));
    } else {
      refreshEvents(s.email);
    }
  }, [router]);

  async function refreshEvents(email: string) {
    setEventsLoading(true);
    try {
      const fresh = await refreshDiscoveredEvents();
      setEvents(visibleEventsForCounselor(email, fresh));
    } finally {
      setEventsLoading(false);
    }
  }

  function handleDismiss(eventId: string) {
    if (!user) return;
    dismissEvent(user.email, eventId);
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }

  if (!user) return null;

  const counterpartLabel = (a: Appointment) =>
    CLIENTS[a.clientEmail]?.name ?? a.clientEmail;

  const eventCounts = events.reduce<Record<EventCategory, number>>(
    (acc, e) => ({ ...acc, [e.category]: (acc[e.category] ?? 0) + 1 }),
    { education: 0, disability: 0, corporate: 0, ce: 0 },
  );

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Scheduling</p>
        <h1 className="text-3xl tracking-tight">Your calendar</h1>
        <p className="text-ink/65 text-sm">
          Your appointments plus relevant local events — CE credits, disability
          community events, employer and industry meetups, and educational
          programs — automatically discovered and shown in red.
        </p>
      </header>

      <div role="tablist" aria-label="Scheduling views" className="flex gap-1 border-b border-ink/10 flex-wrap">
        {([
          ["calendar", "Calendar"],
          ["upcoming", "Upcoming sessions"],
          ["availability", "My availability"],
          ["export", "Export / sync"],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={[
              "min-h-[44px] px-4 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === key
                ? "border-accent text-accent"
                : "border-transparent text-ink/60 hover:text-ink",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "calendar" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2 text-xs">
              {(Object.keys(CATEGORY_META) as EventCategory[]).map((cat) => (
                <span key={cat} className="px-2 py-1 rounded-full bg-red-50 border border-red-200 text-red-700">
                  {CATEGORY_META[cat].label}: {eventCounts[cat]}
                </span>
              ))}
            </div>
            <button
              onClick={() => refreshEvents(user.email)}
              disabled={eventsLoading}
              className="text-xs text-accent hover:underline min-h-[44px] px-2 disabled:opacity-50"
            >
              {eventsLoading ? "Refreshing…" : "↻ Refresh events"}
            </button>
          </div>
          <CalendarGrid
            appointments={appointments}
            discoveredEvents={events}
            viewerTz={tz}
            onDismissEvent={handleDismiss}
            counterpartLabel={counterpartLabel}
          />
        </div>
      )}

      {tab === "upcoming" && (
        <AppointmentList userEmail={user.email} role="counselor" counterpartLabel={counterpartLabel} />
      )}

      {tab === "availability" && <AvailabilityManager counselorEmail={user.email} />}

      {tab === "export" && (
        <div className="space-y-4">
          <CalendarConnectors />
          <CalendarExport
            appointments={appointments}
            calendarName={`${user.name} — Pathways Pro`}
            counterpartLabel={counterpartLabel}
          />
        </div>
      )}
    </div>
  );
}
