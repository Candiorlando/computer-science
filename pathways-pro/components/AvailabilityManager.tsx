"use client";

// Counselor availability editor. Set weekly working hours + slot length;
// stored per counselor and used to generate bookable slots for clients.

import { useEffect, useState } from "react";
import {
  loadAvailability,
  saveAvailability,
  browserTimezone,
  type CounselorAvailability,
  type Weekday,
} from "@/lib/scheduling";

const DAYS: { wd: Weekday; label: string }[] = [
  { wd: 1, label: "Monday" },
  { wd: 2, label: "Tuesday" },
  { wd: 3, label: "Wednesday" },
  { wd: 4, label: "Thursday" },
  { wd: 5, label: "Friday" },
  { wd: 6, label: "Saturday" },
  { wd: 0, label: "Sunday" },
];

function toHHMM(min: number) {
  const h = String(Math.floor(min / 60)).padStart(2, "0");
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}
function fromHHMM(v: string) {
  const [h, m] = v.split(":").map(Number);
  return h * 60 + (m || 0);
}

export default function AvailabilityManager({ counselorEmail }: { counselorEmail: string }) {
  const [avail, setAvail] = useState<CounselorAvailability | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setAvail(loadAvailability(counselorEmail));
  }, [counselorEmail]);

  if (!avail) return null;

  function ruleFor(wd: Weekday) {
    return avail!.rules.find((r) => r.weekday === wd);
  }
  function setDay(wd: Weekday, on: boolean) {
    setSaved(false);
    setAvail((a) => {
      if (!a) return a;
      const rules = a.rules.filter((r) => r.weekday !== wd);
      if (on) rules.push({ weekday: wd, startMin: 9 * 60, endMin: 16 * 60, slotMinutes: 50 });
      return { ...a, rules };
    });
  }
  function patchDay(wd: Weekday, patch: Partial<{ startMin: number; endMin: number; slotMinutes: number }>) {
    setSaved(false);
    setAvail((a) =>
      a
        ? { ...a, rules: a.rules.map((r) => (r.weekday === wd ? { ...r, ...patch } : r)) }
        : a,
    );
  }

  return (
    <section className="space-y-4" aria-label="Your weekly availability">
      <p className="text-sm text-ink/70">
        Set the hours clients can book. Times are in your timezone (
        <span className="font-medium">{avail.timezone || browserTimezone()}</span>); clients see
        slots converted to theirs automatically.
      </p>

      <div className="space-y-2">
        {DAYS.map(({ wd, label }) => {
          const rule = ruleFor(wd);
          const on = !!rule;
          return (
            <div
              key={wd}
              className="saas-card flex flex-wrap items-center gap-3 py-3"
            >
              <label className="flex items-center gap-2 min-w-[130px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => setDay(wd, e.target.checked)}
                  className="w-5 h-5 accent-[color:var(--tw-accent,#0F6B54)]"
                  aria-label={`Available on ${label}`}
                />
                <span className="font-medium text-sm">{label}</span>
              </label>
              {on && rule ? (
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <label className="flex items-center gap-1">
                    <span className="text-ink/55">From</span>
                    <input
                      type="time"
                      value={toHHMM(rule.startMin)}
                      onChange={(e) => patchDay(wd, { startMin: fromHHMM(e.target.value) })}
                      className="border border-ink/20 rounded px-2 py-1.5 min-h-[40px]"
                      aria-label={`${label} start time`}
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    <span className="text-ink/55">to</span>
                    <input
                      type="time"
                      value={toHHMM(rule.endMin)}
                      onChange={(e) => patchDay(wd, { endMin: fromHHMM(e.target.value) })}
                      className="border border-ink/20 rounded px-2 py-1.5 min-h-[40px]"
                      aria-label={`${label} end time`}
                    />
                  </label>
                  <label className="flex items-center gap-1">
                    <span className="text-ink/55">·</span>
                    <select
                      value={rule.slotMinutes}
                      onChange={(e) => patchDay(wd, { slotMinutes: Number(e.target.value) })}
                      className="border border-ink/20 rounded px-2 py-1.5 min-h-[40px]"
                      aria-label={`${label} session length`}
                    >
                      <option value={30}>30 min</option>
                      <option value={50}>50 min</option>
                      <option value={60}>60 min</option>
                    </select>
                  </label>
                </div>
              ) : (
                <span className="text-sm text-ink/40">Unavailable</span>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-ink/70">Minimum notice</span>
          <select
            value={avail.minNoticeHours}
            onChange={(e) => {
              setSaved(false);
              setAvail((a) => (a ? { ...a, minNoticeHours: Number(e.target.value) } : a));
            }}
            className="border border-ink/20 rounded px-2 py-1.5 min-h-[40px]"
            aria-label="Minimum booking notice"
          >
            <option value={0}>None</option>
            <option value={12}>12 hours</option>
            <option value={24}>24 hours</option>
            <option value={48}>48 hours</option>
          </select>
        </label>
        <button
          onClick={() => {
            saveAvailability(avail);
            setSaved(true);
          }}
          className="min-h-[44px] px-5 rounded-md grad-tealblue text-white font-semibold"
        >
          Save availability
        </button>
        {saved && (
          <span role="status" className="text-sm text-accent font-medium">
            ✓ Saved
          </span>
        )}
      </div>
    </section>
  );
}
