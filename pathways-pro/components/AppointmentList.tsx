"use client";

// Shows a user's appointments with a Join (telehealth) action that unlocks
// near start time, plus Cancel. Notifications/labels stay PHI-free.

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  appointmentsForUser,
  cancelAppointment,
  fmtDateTime,
  browserTimezone,
  type Appointment,
} from "@/lib/scheduling";

const JOIN_WINDOW_MS = 10 * 60_000; // join opens 10 min before start

export default function AppointmentList({
  userEmail,
  role,
  counterpartLabel,
}: {
  userEmail: string;
  role: "counselor" | "client";
  counterpartLabel: (a: Appointment) => string;
}) {
  const tz = browserTimezone();
  const [appts, setAppts] = useState<Appointment[]>([]);
  const [now, setNow] = useState(() => Date.now());

  function refresh() {
    setAppts(appointmentsForUser(userEmail));
  }
  useEffect(() => {
    refresh();
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, [userEmail]);

  const upcoming = appts.filter((a) => new Date(a.endsAt).getTime() >= now);
  const past = appts.filter((a) => new Date(a.endsAt).getTime() < now);

  function canJoin(a: Appointment) {
    const start = new Date(a.startsAt).getTime();
    const end = new Date(a.endsAt).getTime();
    return a.modality === "TELEHEALTH" && now >= start - JOIN_WINDOW_MS && now <= end;
  }

  function Row({ a }: { a: Appointment }) {
    const joinable = canJoin(a);
    return (
      <li className="saas-card flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">{fmtDateTime(a.startsAt, tz)}</p>
          <p className="text-xs text-ink/60">
            {a.modality === "TELEHEALTH" ? "🎥 Telehealth" : a.modality === "PHONE" ? "📞 Phone" : "📍 In person"}
            {" · "}
            {role === "counselor" ? "with " : "with "}
            {counterpartLabel(a)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {a.modality === "TELEHEALTH" && (
            <Link
              href={`/appointments/${a.id}/join`}
              aria-disabled={!joinable}
              tabIndex={joinable ? 0 : -1}
              className={[
                "min-h-[44px] inline-flex items-center px-4 rounded-md text-sm font-semibold",
                joinable
                  ? "grad-tealblue text-white"
                  : "border border-ink/15 text-ink/40 pointer-events-none",
              ].join(" ")}
            >
              {joinable ? "Join session" : "Join opens soon"}
            </Link>
          )}
          <button
            onClick={() => {
              if (confirm("Cancel this appointment?")) {
                cancelAppointment(a.id);
                refresh();
              }
            }}
            className="min-h-[44px] px-3 rounded-md border border-ink/20 hover:bg-ink/5 text-sm"
          >
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <div className="space-y-6">
      <section aria-label="Upcoming appointments" className="space-y-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-ink/60">
          Upcoming
        </h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink/55">No upcoming appointments.</p>
        ) : (
          <ul className="space-y-2">
            {upcoming.map((a) => (
              <Row key={a.id} a={a} />
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section aria-label="Past appointments" className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink/60">
            Past
          </h3>
          <ul className="space-y-2 opacity-70">
            {past.slice(-5).reverse().map((a) => (
              <li key={a.id} className="saas-card text-sm">
                {fmtDateTime(a.startsAt, tz)} · with {counterpartLabel(a)}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
