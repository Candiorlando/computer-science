import { NextResponse } from "next/server";

// Live, auto-updating calendar subscribe feed (webcal://) — the "add once,
// stays in sync" counterpart to the client-side .ics download in
// components/CalendarExport.tsx. Google Calendar / Outlook / Apple
// Calendar all support subscribing to a URL like this directly.
//
// Requires appointment data to be queryable server-side, which means the
// scheduling Prisma models (prisma/scheduling-schema-extension.prisma)
// need to be merged into schema.prisma and migrated first — appointments
// currently live in browser localStorage, matching the rest of the app's
// architecture. Once migrated:
//   1. Import `prisma` from "@/lib/prisma".
//   2. Look up the counselor/client by `token` (a stable, unguessable
//      per-user token — do NOT use a raw email/id here).
//   3. `prisma.appointment.findMany({ where: { OR: [...] } })`.
//   4. Map results through `appointmentToIcsEvent` (lib/ical-export.ts)
//      and return `buildIcsFeed(...)` with a `text/calendar` content type.
export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  await params;
  return NextResponse.json(
    {
      error: "not_configured",
      message:
        "Live calendar subscriptions require a connected database. Use the " +
        "'Download calendar (.ics)' button in the meantime — see this " +
        "route's source for what activates it.",
    },
    { status: 501 },
  );
}
