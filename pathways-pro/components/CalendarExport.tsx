"use client";

// Exports the viewer's appointments as a standard .ics file — opens
// directly in Google Calendar, Outlook, and Apple Calendar's "Import"
// flow with no connector or account linking required. A live subscribe
// URL (auto-updating, no re-download needed) is architected in
// app/api/calendar/[token]/route.ts and activates once the scheduling
// Prisma models are migrated to a real database (appointments are
// currently browser-local, matching the rest of the app).

import { appointmentToIcsEvent, buildIcsFeed } from "@/lib/ical-export";
import type { Appointment } from "@/lib/scheduling";

export default function CalendarExport({
  appointments,
  calendarName,
  counterpartLabel,
}: {
  appointments: Appointment[];
  calendarName: string;
  counterpartLabel: (a: Appointment) => string;
}) {
  function download() {
    const events = appointments.map((a) => appointmentToIcsEvent(a, counterpartLabel(a)));
    const ics = buildIcsFeed(calendarName, events);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pathways-pro-calendar.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="saas-card space-y-3">
      <div>
        <h3 className="font-semibold text-sm">Use with Google Calendar, Outlook, or Apple Calendar</h3>
        <p className="text-xs text-ink/60 mt-0.5">
          Download your appointments as a standard calendar file — no account
          linking required.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={download}
          disabled={appointments.length === 0}
          className="min-h-[44px] px-4 rounded-md grad-tealblue text-white text-sm font-semibold disabled:opacity-50"
        >
          ⬇ Download calendar (.ics)
        </button>
        <span className="text-xs text-ink/45">
          {appointments.length === 0
            ? "No appointments yet"
            : `${appointments.length} appointment${appointments.length === 1 ? "" : "s"}`}
        </span>
      </div>
      <details className="text-xs text-ink/55">
        <summary className="cursor-pointer hover:text-ink">How to import</summary>
        <ul className="mt-2 space-y-1 list-disc pl-4">
          <li><strong>Google Calendar:</strong> Settings → Import &amp; export → Import → choose the file.</li>
          <li><strong>Outlook:</strong> File → Open &amp; Export → Import/Export → iCalendar file.</li>
          <li><strong>Apple Calendar:</strong> File → Import → choose the file.</li>
        </ul>
        <p className="mt-2">
          This is a one-time snapshot. A live, auto-updating subscribe link
          (add-once, stays in sync) is ready in the codebase and turns on once
          a database is connected — ask your developer to migrate the
          scheduling Prisma models to enable it.
        </p>
      </details>
    </div>
  );
}
