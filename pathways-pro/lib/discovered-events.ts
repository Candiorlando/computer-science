"use client";

// Local event discovery — surfaces educational, disability-related,
// corporate/rehab-industry, and continuing-education events onto the
// counselor's calendar in red, dismissible per counselor.
//
// Architecture: each EventSource is a pluggable adapter that returns
// normalized DiscoveredEvent[]. Sources here are seeded with realistic,
// clearly-labeled demo data so the feature is fully usable today. To wire
// in a REAL source, replace a source's `fetch` with an actual HTTP call —
// see the "wiring in a real source" note at the bottom of this file. Real
// scraping should prefer official APIs / RSS / iCal feeds over parsing
// arbitrary HTML (more reliable, and respects each site's terms).

export type EventCategory = "education" | "disability" | "corporate" | "ce";

export const CATEGORY_META: Record<
  EventCategory,
  { label: string; description: string }
> = {
  education: {
    label: "Educational",
    description: "Certificate programs, trainings, and workshops",
  },
  disability: {
    label: "Disability-related",
    description: "Accessibility expos, disability pride, assistive tech",
  },
  corporate: {
    label: "Corporate / rehab industry",
    description: "Employer DEI events, hiring fairs, industry meetups",
  },
  ce: {
    label: "CE for counselors",
    description: "CRCC / NBCC / ACA continuing-education credit events",
  },
};

export interface DiscoveredEvent {
  id: string;
  title: string;
  category: EventCategory;
  source: string; // e.g. "CRCC", "Disability:IN Chicago"
  sourceUrl: string; // link to the original listing
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
  location: string; // "Chicago, IL" or "Virtual"
  description: string;
  ceCredits?: number; // set when category === "ce"
  fetchedAt: string;
}

export interface EventSource {
  id: string;
  label: string;
  category: EventCategory;
  /** Returns normalized events. Demo sources synthesize dates relative to
   *  "now"; a real source would fetch from an API/RSS/iCal feed instead. */
  fetch: () => Promise<DiscoveredEvent[]>;
}

// ── date helpers for seed data (relative to today, deterministic-ish) ────
function daysFromNow(d: number, hour = 13, durationHrs = 1.5): { startsAt: string; endsAt: string } {
  const s = new Date();
  s.setHours(hour, 0, 0, 0);
  s.setDate(s.getDate() + d);
  const e = new Date(s.getTime() + durationHrs * 3600_000);
  return { startsAt: s.toISOString(), endsAt: e.toISOString() };
}

// ── demo sources (realistic, VR/rehab-counseling-relevant) ───────────────
// Replace `fetch` with a real HTTP call to go live; see note at bottom.

const ceSource: EventSource = {
  id: "crcc-nbcc-ce",
  label: "CRCC / NBCC / ACA CE Calendar",
  category: "ce",
  async fetch() {
    return [
      {
        id: "ce-crcc-ethics",
        title: "Ethics in Vocational Rehabilitation: 2026 Update",
        category: "ce",
        source: "CRCC",
        sourceUrl: "https://crccertification.com/ce",
        ...daysFromNow(3, 12, 2),
        location: "Virtual",
        description: "2 CE credits. Covers the 2026 CRCC Code updates and case-based ethics scenarios.",
        ceCredits: 2,
        fetchedAt: new Date().toISOString(),
      },
      {
        id: "ce-nbcc-telehealth",
        title: "Telehealth Counseling: Best Practices & Compliance",
        category: "ce",
        source: "NBCC",
        sourceUrl: "https://nbcc.org/continuing-education",
        ...daysFromNow(9, 14, 1.5),
        location: "Virtual",
        description: "1.5 CE credits. HIPAA-aligned telehealth delivery for licensed counselors.",
        ceCredits: 1.5,
        fetchedAt: new Date().toISOString(),
      },
      {
        id: "ce-aca-trauma",
        title: "Trauma-Informed Career Counseling Webinar",
        category: "ce",
        source: "ACA",
        sourceUrl: "https://counseling.org/continuing-education",
        ...daysFromNow(16, 12, 1),
        location: "Virtual",
        description: "1 CE credit. Applying trauma-informed principles to employment counseling.",
        ceCredits: 1,
        fetchedAt: new Date().toISOString(),
      },
    ];
  },
};

const disabilitySource: EventSource = {
  id: "disability-community",
  label: "Disability Community Events",
  category: "disability",
  async fetch() {
    return [
      {
        id: "dis-at-expo",
        title: "Assistive Technology Expo",
        category: "disability",
        source: "Regional AT Coalition",
        sourceUrl: "https://example.org/at-expo",
        ...daysFromNow(5, 10, 4),
        location: "Convention Center",
        description: "Hands-on demos of adaptive tech for workplace accommodation.",
        fetchedAt: new Date().toISOString(),
      },
      {
        id: "dis-pride",
        title: "Disability Pride Community Fair",
        category: "disability",
        source: "Disability Pride Coalition",
        sourceUrl: "https://example.org/disability-pride",
        ...daysFromNow(21, 11, 5),
        location: "Downtown Plaza",
        description: "Community fair with employer booths, resource tables, and accessible activities.",
        fetchedAt: new Date().toISOString(),
      },
    ];
  },
};

const corporateSource: EventSource = {
  id: "rehab-industry-corporate",
  label: "Employer & Industry Events",
  category: "corporate",
  async fetch() {
    return [
      {
        id: "corp-disability-in",
        title: "Disability:IN Regional Employer Roundtable",
        category: "corporate",
        source: "Disability:IN",
        sourceUrl: "https://disabilityin.org/events",
        ...daysFromNow(7, 9, 2),
        location: "Virtual",
        description: "Employers discuss inclusive hiring pipelines and accommodation practices.",
        fetchedAt: new Date().toISOString(),
      },
      {
        id: "corp-hiring-fair",
        title: "Inclusive Hiring Fair — Local Employers",
        category: "corporate",
        source: "Regional Chamber of Commerce",
        sourceUrl: "https://example.org/hiring-fair",
        ...daysFromNow(12, 10, 3),
        location: "Community Center",
        description: "Employers actively recruiting candidates with disabilities; on-site interviews.",
        fetchedAt: new Date().toISOString(),
      },
    ];
  },
};

const educationSource: EventSource = {
  id: "education-training",
  label: "Educational & Training Programs",
  category: "education",
  async fetch() {
    return [
      {
        id: "edu-cert-it",
        title: "Free IT Support Certificate — Info Session",
        category: "education",
        source: "Community College Workforce Program",
        sourceUrl: "https://example.edu/it-cert",
        ...daysFromNow(4, 17, 1),
        location: "Virtual",
        description: "Tuition-free certificate pathway; accommodations available on request.",
        fetchedAt: new Date().toISOString(),
      },
      {
        id: "edu-preets",
        title: "Pre-ETS Summer Workshop Series — Registration Opens",
        category: "education",
        source: "State Department of Education",
        sourceUrl: "https://example.gov/pre-ets",
        ...daysFromNow(18, 9, 1),
        location: "Multiple sites",
        description: "Pre-Employment Transition Services workshops for students with disabilities.",
        fetchedAt: new Date().toISOString(),
      },
    ];
  },
};

export const EVENT_SOURCES: EventSource[] = [
  ceSource,
  disabilitySource,
  corporateSource,
  educationSource,
];

// ── persistence (per-counselor dismissals + cached results) ──────────────
const CACHE_KEY = "pathways-pro:discovered-events-cache-v1";
const DISMISSED_KEY = "pathways-pro:discovered-events-dismissed-v1";

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

/** Runs all sources, caches the merged result. Call on calendar mount and
 *  on a manual "Refresh events" action; a real deployment would run this
 *  server-side on a schedule instead (see note at bottom). */
export async function refreshDiscoveredEvents(): Promise<DiscoveredEvent[]> {
  const results = await Promise.all(EVENT_SOURCES.map((s) => s.fetch()));
  const merged = results.flat();
  write(CACHE_KEY, merged);
  return merged;
}

export function loadCachedEvents(): DiscoveredEvent[] {
  return read<DiscoveredEvent[]>(CACHE_KEY, []);
}

export function dismissedIds(counselorEmail: string): Set<string> {
  const all = read<Record<string, string[]>>(DISMISSED_KEY, {});
  return new Set(all[counselorEmail] ?? []);
}

export function dismissEvent(counselorEmail: string, eventId: string) {
  const all = read<Record<string, string[]>>(DISMISSED_KEY, {});
  all[counselorEmail] = [...new Set([...(all[counselorEmail] ?? []), eventId])];
  write(DISMISSED_KEY, all);
}

export function restoreEvent(counselorEmail: string, eventId: string) {
  const all = read<Record<string, string[]>>(DISMISSED_KEY, {});
  all[counselorEmail] = (all[counselorEmail] ?? []).filter((id) => id !== eventId);
  write(DISMISSED_KEY, all);
}

/** Events for a counselor's calendar, dismissed ones excluded. */
export function visibleEventsForCounselor(
  counselorEmail: string,
  events: DiscoveredEvent[],
): DiscoveredEvent[] {
  const dismissed = dismissedIds(counselorEmail);
  return events.filter((e) => !dismissed.has(e.id));
}

// ── wiring in a real source ───────────────────────────────────────────────
// Replace a source's `fetch` (or add a new EventSource) with a real call:
//
//   const eventbriteSource: EventSource = {
//     id: "eventbrite-local",
//     label: "Eventbrite — local disability & CE events",
//     category: "disability",
//     async fetch() {
//       const res = await fetch(
//         `https://www.eventbriteapi.com/v3/events/search/?q=disability&location.address=${ZIP}`,
//         { headers: { Authorization: `Bearer ${process.env.EVENTBRITE_TOKEN}` } },
//       );
//       const data = await res.json();
//       return data.events.map(normalizeEventbriteEvent); // map to DiscoveredEvent
//     },
//   };
//
// Prefer official APIs / RSS / iCal feeds over parsing raw HTML — more
// reliable, and respects each site's terms of service. For a production
// deployment, move `fetch` calls server-side (an API route on a cron
// schedule, e.g. Vercel Cron) rather than running them in the browser, and
// persist results to the database (see prisma/scheduling-schema-extension
// for the pattern) instead of localStorage.
