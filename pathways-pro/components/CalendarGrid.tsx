"use client";

// Month-view calendar grid — the Google/Outlook-style visual counselors
// asked for. Shows booked appointments (mint) alongside discovered local
// events (red, dismissible) in the same grid. Accessible: ARIA grid,
// full keyboard navigation, aria-live announcements, 44px day cells.

import { useMemo, useRef, useState } from "react";
import type { Appointment } from "@/lib/scheduling";
import { fmtTime } from "@/lib/scheduling";
import { CATEGORY_META, type DiscoveredEvent } from "@/lib/discovered-events";

type DayItem =
  | { kind: "appointment"; data: Appointment }
  | { kind: "event"; data: DiscoveredEvent };

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function startOfCalendarGrid(monthStart: Date) {
  const d = new Date(monthStart);
  d.setDate(d.getDate() - d.getDay()); // back up to the Sunday on/before the 1st
  return d;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function CalendarGrid({
  appointments,
  discoveredEvents = [],
  viewerTz,
  onDismissEvent,
  onSelectAppointment,
  onDayClick,
  counterpartLabel,
}: {
  appointments: Appointment[];
  discoveredEvents?: DiscoveredEvent[];
  viewerTz: string;
  onDismissEvent?: (eventId: string) => void;
  onSelectAppointment?: (appt: Appointment) => void;
  onDayClick?: (date: Date) => void;
  counterpartLabel?: (a: Appointment) => string;
}) {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const liveRef = useRef<HTMLParagraphElement>(null);

  const monthLabel = useMemo(
    () => new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: viewerTz }).format(cursor),
    [cursor, viewerTz],
  );

  // Bucket appointments + events by local calendar day (viewer's tz).
  const itemsByDay = useMemo(() => {
    const map = new Map<string, DayItem[]>();
    const push = (d: Date, item: DayItem) => {
      const k = dayKey(d);
      const arr = map.get(k) ?? [];
      arr.push(item);
      map.set(k, arr);
    };
    for (const a of appointments) {
      push(new Date(a.startsAt), { kind: "appointment", data: a });
    }
    for (const e of discoveredEvents) {
      push(new Date(e.startsAt), { kind: "event", data: e });
    }
    return map;
  }, [appointments, discoveredEvents]);

  const weeks = useMemo(() => {
    const gridStart = startOfCalendarGrid(cursor);
    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    const rows: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));
    return rows;
  }, [cursor]);

  function announce(msg: string) {
    if (liveRef.current) liveRef.current.textContent = msg;
  }

  function changeMonth(delta: number) {
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + delta, 1));
    setSelectedDay(null);
  }

  function onGridKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    const grid = e.currentTarget.closest('[role="grid"]');
    if (!grid) return;
    const cells = Array.from(grid.querySelectorAll<HTMLButtonElement>('[role="gridcell"]'));
    const i = cells.indexOf(e.currentTarget);
    const cols = 7;
    const map: Record<string, number> = {
      ArrowRight: i + 1,
      ArrowLeft: i - 1,
      ArrowDown: i + cols,
      ArrowUp: i - cols,
      Home: i - (i % cols),
      End: i - (i % cols) + (cols - 1),
    };
    if (e.key in map) {
      e.preventDefault();
      const next = Math.max(0, Math.min(cells.length - 1, map[e.key]));
      cells[next]?.focus();
    }
  }

  const today = new Date();
  const selectedItems = selectedDay ? itemsByDay.get(dayKey(selectedDay)) ?? [] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => changeMonth(-1)}
          className="min-h-[44px] px-3 rounded-md border border-ink/20 hover:bg-ink/5 text-sm"
          aria-label="Previous month"
        >
          ← Prev
        </button>
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-lg">{monthLabel}</h3>
          <button
            onClick={() => { setCursor(startOfMonth(new Date())); setSelectedDay(null); }}
            className="text-xs text-accent hover:underline min-h-[44px] px-2"
          >
            Today
          </button>
        </div>
        <button
          onClick={() => changeMonth(1)}
          className="min-h-[44px] px-3 rounded-md border border-ink/20 hover:bg-ink/5 text-sm"
          aria-label="Next month"
        >
          Next →
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-ink/60">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" aria-hidden />
          Your appointments
        </span>
        {discoveredEvents.length > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" aria-hidden />
            Discovered events (education, disability, corporate, CE)
          </span>
        )}
      </div>

      <div role="grid" aria-label={`Calendar for ${monthLabel}`} className="border border-ink/10 rounded-lg overflow-hidden">
        <div role="row" className="grid grid-cols-7 bg-ink/5 text-xs font-semibold uppercase tracking-wider text-ink/55">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} role="columnheader" className="px-2 py-2 text-center">
              {d}
            </div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div role="row" key={wi} className="grid grid-cols-7 border-t border-ink/10">
            {week.map((day) => {
              const items = itemsByDay.get(dayKey(day)) ?? [];
              const inMonth = isSameMonth(day, cursor);
              const isToday = isSameDay(day, today);
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const visible = items.slice(0, 3);
              const overflow = items.length - visible.length;

              return (
                <button
                  key={day.toISOString()}
                  role="gridcell"
                  onKeyDown={onGridKey}
                  aria-current={isToday ? "date" : undefined}
                  aria-selected={!!isSelected}
                  onClick={() => {
                    setSelectedDay(day);
                    onDayClick?.(day);
                    announce(
                      `${day.toDateString()}: ${items.length} item${items.length === 1 ? "" : "s"}`,
                    );
                  }}
                  className={[
                    "min-h-[80px] sm:min-h-[96px] p-1.5 text-left border-r border-ink/10 last:border-r-0 align-top",
                    "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset transition-colors",
                    inMonth ? "bg-white" : "bg-ink/[0.02] text-ink/40",
                    isSelected ? "ring-2 ring-accent ring-inset" : "hover:bg-ink/5",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold",
                      isToday ? "bg-accent text-cream" : "text-ink/70",
                    ].join(" ")}
                  >
                    {day.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {visible.map((item, idx) => {
                      const isEvent = item.kind === "event";
                      const label = isEvent ? item.data.title : counterpartLabel?.(item.data) ?? "Session";
                      const time = fmtTime(item.data.startsAt, viewerTz);
                      return (
                        <div
                          key={idx}
                          className={[
                            "text-[10px] sm:text-[11px] leading-tight rounded px-1 py-0.5 truncate",
                            isEvent
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-accent/10 text-accent font-medium",
                          ].join(" ")}
                          title={`${time} · ${label}`}
                        >
                          {time} {label}
                        </div>
                      );
                    })}
                    {overflow > 0 && (
                      <div className="text-[10px] text-ink/45 px-1">+{overflow} more</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <p ref={liveRef} role="status" aria-live="polite" className="sr-only" />

      {/* Selected day detail panel */}
      {selectedDay && (
        <section
          aria-label={`Details for ${selectedDay.toDateString()}`}
          className="saas-card space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">
              {new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: viewerTz }).format(selectedDay)}
            </h4>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-xs text-ink/55 hover:text-ink min-h-[44px] px-2"
              aria-label="Close day details"
            >
              ✕ Close
            </button>
          </div>
          {selectedItems.length === 0 ? (
            <p className="text-sm text-ink/55">Nothing scheduled.</p>
          ) : (
            <ul className="space-y-2">
              {selectedItems
                .sort((a, b) => a.data.startsAt.localeCompare(b.data.startsAt))
                .map((item, i) =>
                  item.kind === "appointment" ? (
                    <li key={i}>
                      <button
                        onClick={() => onSelectAppointment?.(item.data)}
                        className="w-full text-left flex items-center gap-3 p-2 rounded-md border border-ink/10 hover:border-accent/50 min-h-[44px]"
                      >
                        <span className="w-2 h-2 rounded-full bg-accent shrink-0" aria-hidden />
                        <span className="text-sm font-medium">{fmtTime(item.data.startsAt, viewerTz)}</span>
                        <span className="text-sm text-ink/70 truncate">
                          {counterpartLabel?.(item.data) ?? "Session"}
                        </span>
                      </button>
                    </li>
                  ) : (
                    <li key={i} className="flex items-center gap-3 p-2 rounded-md border border-red-200 bg-red-50/50 min-h-[44px]">
                      <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" aria-hidden />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-800 truncate">{item.data.title}</p>
                        <p className="text-xs text-ink/55 truncate">
                          {fmtTime(item.data.startsAt, viewerTz)} · {CATEGORY_META[item.data.category].label} · {item.data.location}
                        </p>
                      </div>
                      <a
                        href={item.data.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-accent hover:underline shrink-0"
                      >
                        Details
                      </a>
                      {onDismissEvent && (
                        <button
                          onClick={() => onDismissEvent(item.data.id)}
                          className="text-xs text-ink/50 hover:text-red-700 shrink-0 min-h-[44px] px-2"
                          aria-label={`Dismiss ${item.data.title}`}
                        >
                          ✕
                        </button>
                      )}
                    </li>
                  ),
                )}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
