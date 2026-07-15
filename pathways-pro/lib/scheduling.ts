"use client";

// Appointment scheduling for Pathways Pro.
//
// Persistence note: like the rest of the interactive app today, this is
// backed by localStorage so it works immediately in the deployed demo.
// The matching Prisma models in prisma/schema.prisma are the production
// backend; the function boundaries here (loadAvailability / getFreeSlots /
// bookAppointment / …) are intentionally the same shape you'd expose from
// DB-backed API routes, so the swap is mechanical.

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday

export interface AvailabilityRule {
  weekday: Weekday;
  startMin: number; // minutes from local midnight, e.g. 540 = 9:00
  endMin: number; // e.g. 960 = 16:00
  slotMinutes: number; // e.g. 50
}

export interface CounselorAvailability {
  counselorEmail: string;
  timezone: string; // IANA tz the rules are authored in
  rules: AvailabilityRule[];
  minNoticeHours: number; // earliest a client may book from "now"
  bufferMinutes: number; // gap enforced around each session
}

export type AppointmentStatus =
  | "BOOKED"
  | "RESCHEDULED"
  | "CANCELLED"
  | "COMPLETED";

export type Modality = "TELEHEALTH" | "PHONE" | "IN_PERSON";

export interface Appointment {
  id: string;
  caseId: string;
  counselorEmail: string;
  clientEmail: string;
  startsAt: string; // ISO 8601 UTC — source of truth
  endsAt: string; // ISO 8601 UTC
  status: AppointmentStatus;
  modality: Modality;
  reasonCode?: string; // coded, NON free-text (keep PHI out)
  videoRoom?: string; // opaque room id (no PHI in the name)
  clientTimezone: string;
  counselorTimezone: string;
  createdBy: string;
  createdAt: string;
}

export interface Slot {
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
}

const AVAIL_KEY = "pathways-pro:availability-v1";
const APPT_KEY = "pathways-pro:appointments-v1";

// ── timezone helpers ─────────────────────────────────────────────────────
// Convert a wall-clock time in a given IANA zone to the correct UTC instant,
// using the standard Intl offset technique (DST-correct except at the rare
// transition boundary, which is acceptable for scheduling slots).
export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Chicago";
  } catch {
    return "America/Chicago";
  }
}

function zoneOffsetMs(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = dtf
    .formatToParts(instant)
    .reduce<Record<string, string>>((a, x) => ((a[x.type] = x.value), a), {});
  const asUTC = Date.UTC(
    Number(p.year),
    Number(p.month) - 1,
    Number(p.day),
    Number(p.hour),
    Number(p.minute),
    Number(p.second),
  );
  return asUTC - instant.getTime();
}

/** Wall-clock (Y/M/D H:M) in `timeZone` → the UTC Date for that instant. */
function wallClockToUtc(
  year: number,
  month0: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): Date {
  const guess = Date.UTC(year, month0, day, hour, minute);
  const off = zoneOffsetMs(new Date(guess), timeZone);
  return new Date(guess - off);
}

// ── availability ─────────────────────────────────────────────────────────
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function defaultAvailability(
  counselorEmail: string,
): CounselorAvailability {
  const weekdayRule = (weekday: Weekday): AvailabilityRule => ({
    weekday,
    startMin: 9 * 60,
    endMin: 16 * 60,
    slotMinutes: 50,
  });
  return {
    counselorEmail,
    timezone: browserTimezone(),
    rules: [1, 2, 3, 4, 5].map((d) => weekdayRule(d as Weekday)),
    minNoticeHours: 24,
    bufferMinutes: 10,
  };
}

export function loadAvailability(counselorEmail: string): CounselorAvailability {
  const all = read<Record<string, CounselorAvailability>>(AVAIL_KEY, {});
  return all[counselorEmail] ?? defaultAvailability(counselorEmail);
}

export function saveAvailability(a: CounselorAvailability) {
  const all = read<Record<string, CounselorAvailability>>(AVAIL_KEY, {});
  all[a.counselorEmail] = a;
  write(AVAIL_KEY, all);
}

// ── appointments ─────────────────────────────────────────────────────────
export function loadAppointments(): Appointment[] {
  return read<Appointment[]>(APPT_KEY, []);
}
function saveAppointments(list: Appointment[]) {
  write(APPT_KEY, list);
}

export function appointmentsForUser(email: string): Appointment[] {
  return loadAppointments()
    .filter(
      (a) =>
        (a.counselorEmail === email || a.clientEmail === email) &&
        a.status !== "CANCELLED",
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

export function getAppointment(id: string): Appointment | null {
  return loadAppointments().find((a) => a.id === id) ?? null;
}

/** Active (non-cancelled) appointments for a counselor, used for conflicts. */
function counselorBooked(counselorEmail: string): Appointment[] {
  return loadAppointments().filter(
    (a) =>
      a.counselorEmail === counselorEmail &&
      (a.status === "BOOKED" || a.status === "RESCHEDULED"),
  );
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Free slots for a counselor across the 7 days starting at `weekStart`
 * (a Date at local midnight of the week's first day). Slots are returned in
 * UTC ISO; the caller renders them in the viewer's timezone.
 */
export function getFreeSlots(
  counselorEmail: string,
  weekStart: Date,
): Slot[] {
  const avail = loadAvailability(counselorEmail);
  const booked = counselorBooked(counselorEmail).map((a) => ({
    s: new Date(a.startsAt).getTime(),
    e: new Date(a.endsAt).getTime(),
  }));
  const now = Date.now();
  const earliest = now + avail.minNoticeHours * 3600_000;
  const bufferMs = avail.bufferMinutes * 60_000;
  const slots: Slot[] = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + dayOffset);
    const weekday = day.getDay() as Weekday;
    const rules = avail.rules.filter((r) => r.weekday === weekday);

    for (const rule of rules) {
      for (
        let m = rule.startMin;
        m + rule.slotMinutes <= rule.endMin;
        m += rule.slotMinutes
      ) {
        const startUtc = wallClockToUtc(
          day.getFullYear(),
          day.getMonth(),
          day.getDate(),
          Math.floor(m / 60),
          m % 60,
          avail.timezone,
        );
        const endUtc = new Date(startUtc.getTime() + rule.slotMinutes * 60_000);
        const s = startUtc.getTime();
        const e = endUtc.getTime();

        if (s < earliest) continue; // respect minimum notice
        const clash = booked.some((b) =>
          overlaps(s - bufferMs, e + bufferMs, b.s, b.e),
        );
        if (clash) continue;

        slots.push({ startsAt: startUtc.toISOString(), endsAt: endUtc.toISOString() });
      }
    }
  }
  return slots;
}

function randomRoom(seed: string): string {
  // Opaque, PHI-free room id derived from ids + time (no names/reasons).
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return `pp-${(h >>> 0).toString(36)}${seed.length.toString(36)}`;
}

export interface BookInput {
  caseId: string;
  counselorEmail: string;
  clientEmail: string;
  startsAt: string; // ISO UTC (must equal a real free slot)
  endsAt: string;
  modality?: Modality;
  reasonCode?: string;
  createdBy: string;
  clientTimezone?: string;
}

export type BookResult =
  | { ok: true; appointment: Appointment }
  | { ok: false; error: "slot_unavailable" | "invalid_range" };

/** Book an appointment. Server-equivalent validation happens here too. */
export function bookAppointment(input: BookInput): BookResult {
  const start = new Date(input.startsAt).getTime();
  const end = new Date(input.endsAt).getTime();
  if (!(end > start)) return { ok: false, error: "invalid_range" };

  // Re-validate against live availability + conflicts (never trust caller).
  const clash = counselorBooked(input.counselorEmail).some((a) =>
    overlaps(start, end, new Date(a.startsAt).getTime(), new Date(a.endsAt).getTime()),
  );
  if (clash) return { ok: false, error: "slot_unavailable" };

  const avail = loadAvailability(input.counselorEmail);
  const id = randomRoom(input.counselorEmail + input.clientEmail + input.startsAt);
  const appt: Appointment = {
    id,
    caseId: input.caseId,
    counselorEmail: input.counselorEmail,
    clientEmail: input.clientEmail,
    startsAt: new Date(start).toISOString(),
    endsAt: new Date(end).toISOString(),
    status: "BOOKED",
    modality: input.modality ?? "TELEHEALTH",
    reasonCode: input.reasonCode,
    videoRoom: randomRoom(id + "room"),
    clientTimezone: input.clientTimezone ?? browserTimezone(),
    counselorTimezone: avail.timezone,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
  };
  const list = loadAppointments();
  list.push(appt);
  saveAppointments(list);
  return { ok: true, appointment: appt };
}

export function cancelAppointment(id: string): boolean {
  const list = loadAppointments();
  const appt = list.find((a) => a.id === id);
  if (!appt) return false;
  appt.status = "CANCELLED";
  saveAppointments(list);
  return true;
}

export function rescheduleAppointment(
  id: string,
  startsAt: string,
  endsAt: string,
): BookResult {
  const list = loadAppointments();
  const appt = list.find((a) => a.id === id);
  if (!appt) return { ok: false, error: "slot_unavailable" };
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (!(end > start)) return { ok: false, error: "invalid_range" };
  const clash = counselorBooked(appt.counselorEmail).some(
    (a) =>
      a.id !== id &&
      overlaps(start, end, new Date(a.startsAt).getTime(), new Date(a.endsAt).getTime()),
  );
  if (clash) return { ok: false, error: "slot_unavailable" };
  appt.startsAt = new Date(start).toISOString();
  appt.endsAt = new Date(end).toISOString();
  appt.status = "RESCHEDULED";
  saveAppointments(list);
  return { ok: true, appointment: appt };
}

// ── display helpers (viewer-tz aware) ────────────────────────────────────
export function fmtDateTime(iso: string, tz = browserTimezone()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}
export function fmtTime(iso: string, tz = browserTimezone()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}
export function fmtDay(iso: string, tz = browserTimezone()): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function startOfWeek(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}
