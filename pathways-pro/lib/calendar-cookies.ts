// Shared httpOnly cookie helpers for calendar OAuth tokens. Server-only.
//
// Note: cookie contents are NOT encrypted here, only httpOnly + secure +
// sameSite=lax (unreadable by client JS, sent only over HTTPS, not sent
// cross-site). For a production hardening pass, encrypt the JSON payload
// (e.g. with `iron-session` or a KMS-backed envelope) before setting it,
// or — better long-term — move to database-backed storage per the
// migration note in lib/google-calendar.ts / lib/outlook-calendar.ts.

import { NextResponse } from "next/server";

const GOOGLE_COOKIE = "pp_gcal_tokens";
const OUTLOOK_COOKIE = "pp_outlook_tokens";
const STATE_COOKIE = "pp_oauth_state";

const COOKIE_OPTS = {
  httpOnly: true,
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 60, // 60 days
};

export function setTokenCookie(res: NextResponse, name: "google" | "outlook", tokens: unknown) {
  res.cookies.set(name === "google" ? GOOGLE_COOKIE : OUTLOOK_COOKIE, JSON.stringify(tokens), COOKIE_OPTS);
}

export function readTokenCookie<T>(req: Request, name: "google" | "outlook"): T | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const key = name === "google" ? GOOGLE_COOKIE : OUTLOOK_COOKIE;
  const match = cookieHeader.match(new RegExp(`${key}=([^;]+)`));
  if (!match) return null;
  try {
    return JSON.parse(decodeURIComponent(match[1])) as T;
  } catch {
    return null;
  }
}

export function clearTokenCookie(res: NextResponse, name: "google" | "outlook") {
  res.cookies.set(name === "google" ? GOOGLE_COOKIE : OUTLOOK_COOKIE, "", { ...COOKIE_OPTS, maxAge: 0 });
}

export function setStateCookie(res: NextResponse, state: string) {
  res.cookies.set(STATE_COOKIE, state, { ...COOKIE_OPTS, maxAge: 600 }); // 10 min
}

export function readStateCookie(req: Request): string | null {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${STATE_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function randomState(): string {
  return crypto.randomUUID();
}
