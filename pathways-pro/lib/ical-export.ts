// RFC 5545 (iCalendar) feed generation — genuine interop with Google
// Calendar, Outlook, and Apple Calendar with zero OAuth/connector setup.
// All three support "subscribe to a calendar by URL"; this produces that
// feed from a user's appointments.

import type { Appointment } from "./scheduling";

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

function icsDate(iso: string): string {
  // UTC, basic format: YYYYMMDDTHHMMSSZ
  return new Date(iso).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function foldLine(line: string): string {
  // RFC 5545 §3.1: lines over 75 octets should be folded with CRLF + space.
  if (line.length <= 75) return line;
  let out = "";
  let rest = line;
  out = rest.slice(0, 75);
  rest = rest.slice(75);
  while (rest.length > 0) {
    out += "\r\n " + rest.slice(0, 74);
    rest = rest.slice(74);
  }
  return out;
}

export interface IcsEventInput {
  uid: string;
  title: string;
  description?: string;
  startsAt: string; // ISO UTC
  endsAt: string; // ISO UTC
  location?: string;
  url?: string;
}

export function buildIcsFeed(calendarName: string, events: IcsEventInput[]): string {
  const now = icsDate(new Date().toISOString());
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Pathways Pro//Scheduling//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${icsEscape(calendarName)}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    "X-PUBLISHED-TTL:PT1H",
  ];
  for (const e of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.uid}@pathwayspro.app`,
      `DTSTAMP:${now}`,
      `DTSTART:${icsDate(e.startsAt)}`,
      `DTEND:${icsDate(e.endsAt)}`,
      `SUMMARY:${icsEscape(e.title)}`,
    );
    if (e.description) lines.push(foldLine(`DESCRIPTION:${icsEscape(e.description)}`));
    if (e.location) lines.push(`LOCATION:${icsEscape(e.location)}`);
    if (e.url) lines.push(`URL:${e.url}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

export function appointmentToIcsEvent(a: Appointment, counterpartLabel: string): IcsEventInput {
  return {
    uid: a.id,
    title: `Pathways Pro session with ${counterpartLabel}`,
    description:
      `${a.modality === "TELEHEALTH" ? "Telehealth session" : a.modality === "PHONE" ? "Phone session" : "In-person session"}. ` +
      `Sign in to pathwayspro.app for details.`,
    startsAt: a.startsAt,
    endsAt: a.endsAt,
    url: a.modality === "TELEHEALTH" ? `https://www.pathwayspro.app/appointments/${a.id}/join` : undefined,
  };
}
