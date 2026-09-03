"use client";

// Accessible weekly slot picker. ARIA grid semantics, arrow-key navigation,
// aria-live announcements, 44px targets, mint theme. Timezone-aware: slots
// come back in UTC and render in the viewer's timezone.

import { useMemo, useRef, useState } from "react";
import {
  getFreeSlots,
  bookAppointment,
  browserTimezone,
  fmtDateTime,
  fmtTime,
  fmtDay,
  startOfWeek,
  type Slot,
} from "@/lib/scheduling";

export default function BookingCalendar({
  counselorEmail,
  clientEmail,
  caseId,
  createdBy,
  onBooked,
}: {
  counselorEmail: string;
  clientEmail: string;
  caseId: string;
  createdBy: string;
  onBooked?: () => void;
}) {
  const tz = browserTimezone();
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek());
  const [selected, setSelected] = useState<Slot | null>(null);
  const [state, setState] = useState<"idle" | "booking" | "done" | "error">("idle");
  const [nonce, setNonce] = useState(0);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const slots = useMemo(
    () => getFreeSlots(counselorEmail, weekStart),
    [counselorEmail, weekStart, nonce],
  );

  const byDay = useMemo(() => {
    const days = new Map<string, Slot[]>();
    for (const s of slots) {
      const label = fmtDay(s.startsAt, tz);
      const arr = days.get(label) ?? [];
      arr.push(s);
      days.set(label, arr);
    }
    return [...days.entries()].map(([label, slots]) => ({ label, slots }));
  }, [slots, tz]);

  function announce(msg: string) {
    if (liveRef.current) liveRef.current.textContent = msg;
  }

  function onGridKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    const grid = e.currentTarget.closest('[role="grid"]');
    if (!grid) return;
    const cells = Array.from(
      grid.querySelectorAll<HTMLButtonElement>('[role="gridcell"]'),
    );
    const i = cells.indexOf(e.currentTarget);
    const next: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      ArrowDown: i + 1,
      ArrowUp: i - 1,
      Home: 0,
      End: cells.length - 1,
    };
    if (e.key in next) {
      e.preventDefault();
      cells[Math.max(0, Math.min(cells.length - 1, next[e.key]))]?.focus();
    }
  }

  function confirm() {
    if (!selected) return;
    setState("booking");
    const res = bookAppointment({
      caseId,
      counselorEmail,
      clientEmail,
      startsAt: selected.startsAt,
      endsAt: selected.endsAt,
      modality: "TELEHEALTH",
      createdBy,
      clientTimezone: tz,
    });
    if (res.ok) {
      setState("done");
      announce(`Appointment booked for ${fmtDateTime(selected.startsAt, tz)}.`);
      onBooked?.();
      // Push to any connected external calendar. Best-effort: sync is
      // optional and must never block or fail the booking itself.
      fetch("/api/calendar/sync-event", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "Pathways Pro session",
          description: "Sign in to pathwayspro.app for session details.",
          startsAt: res.appointment.startsAt,
          endsAt: res.appointment.endsAt,
        }),
      }).catch(() => {});
    } else if (res.error === "slot_unavailable") {
      setState("idle");
      setSelected(null);
      setNonce((n) => n + 1);
      announce("That time was just taken. Please choose another slot.");
    } else {
      setState("error");
      announce("Booking failed. Please try again.");
    }
  }

  return (
    <section aria-label="Book an appointment" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() - 7);
            setWeekStart(d);
            setSelected(null);
          }}
          className="min-h-[44px] px-4 rounded-md border border-ink/20 hover:bg-ink/5 text-sm"
          aria-label="Previous week"
        >
          ← Prev
        </button>
        <h3 className="font-semibold text-sm text-center">
          Week of {fmtDay(weekStart.toISOString(), tz)}
          <span className="block text-xs font-normal text-ink/55">
            Times shown in your timezone ({tz})
          </span>
        </h3>
        <button
          onClick={() => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + 7);
            setWeekStart(d);
            setSelected(null);
          }}
          className="min-h-[44px] px-4 rounded-md border border-ink/20 hover:bg-ink/5 text-sm"
          aria-label="Next week"
        >
          Next →
        </button>
      </div>

      <div
        role="grid"
        aria-label="Available appointment times"
        className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3"
      >
        {byDay.length === 0 && (
          <p className="col-span-full text-sm text-ink/55 py-6 text-center">
            No open times this week. Try the next week, or ask your counselor to
            add availability.
          </p>
        )}
        {byDay.map((day) => (
          <div role="row" key={day.label} className="space-y-2">
            <div
              role="columnheader"
              className="text-xs uppercase tracking-wider text-ink/55"
            >
              {day.label}
            </div>
            {day.slots.map((slot) => {
              const isSel = selected?.startsAt === slot.startsAt;
              return (
                <button
                  key={slot.startsAt}
                  role="gridcell"
                  aria-pressed={isSel}
                  onKeyDown={onGridKey}
                  onClick={() => {
                    setSelected(slot);
                    announce(`Selected ${fmtDateTime(slot.startsAt, tz)}`);
                  }}
                  className={[
                    "w-full min-h-[44px] px-3 rounded-md text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-accent",
                    isSel
                      ? "bg-accent text-cream border-accent font-semibold"
                      : "bg-white border-ink/15 hover:border-accent",
                  ].join(" ")}
                >
                  {fmtTime(slot.startsAt, tz)}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {selected && state !== "done" && (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={confirm}
            disabled={state === "booking"}
            className="min-h-[44px] px-5 rounded-md grad-tealblue text-white font-semibold disabled:opacity-60"
          >
            {state === "booking"
              ? "Booking…"
              : `Confirm ${fmtDateTime(selected.startsAt, tz)}`}
          </button>
          <button
            onClick={() => setSelected(null)}
            className="min-h-[44px] px-4 rounded-md border border-ink/20 hover:bg-ink/5 text-sm"
          >
            Clear
          </button>
        </div>
      )}

      <p ref={liveRef} role="status" aria-live="polite" className="text-sm text-ink/70" />
      {state === "done" && (
        <p className="text-sm font-medium text-accent">
          ✓ You&rsquo;re booked. A confirmation with no health details was sent to
          your inbox — session details live in your portal.
        </p>
      )}
      {state === "error" && (
        <p className="text-sm text-red-600">Something went wrong. Please try again.</p>
      )}
    </section>
  );
}
