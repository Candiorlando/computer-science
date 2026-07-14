"use client";

import type { AnyUser } from "./users";

const SESSION_KEY = "pathways-pro:session-v1";
const MODE_KEY = "pathways-pro:mode-v1";

export type ViewMode = "counselor" | "client" | "business";

export function loadSession(): AnyUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AnyUser) : null;
  } catch {
    return null;
  }
}

export function saveSession(user: AnyUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(MODE_KEY);
}

export function loadMode(defaultMode: ViewMode): ViewMode {
  if (typeof window === "undefined") return defaultMode;
  const v = window.localStorage.getItem(MODE_KEY);
  return v === "counselor" || v === "client" || v === "business"
    ? v
    : defaultMode;
}

export function saveMode(mode: ViewMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MODE_KEY, mode);
}
