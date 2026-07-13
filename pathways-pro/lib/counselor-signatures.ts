"use client";

// Per-counselor saved signature, stored in localStorage so the
// counselor doesn't have to re-sign every deliverable. Separate from
// the user record so we don't have to mutate the seeded COUNSELORS
// constant — the user record stays read-only.

export interface SavedSignature {
  dataUrl?: string; // base64 PNG (drawn)
  text?: string;    // typed cursive
  printedName: string;
  credentials?: string;
  savedAt: string;
}

const KEY = "pathways-pro:counselor-signatures-v1";

type Map = Record<string, SavedSignature>;

function load(): Map {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Map) : {};
  } catch {
    return {};
  }
}

function save(map: Map) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

export function loadSavedSignature(email: string): SavedSignature | undefined {
  return load()[email];
}

export function saveSignature(email: string, sig: Omit<SavedSignature, "savedAt">) {
  const all = load();
  all[email] = { ...sig, savedAt: new Date().toISOString() };
  save(all);
}

export function clearSavedSignature(email: string) {
  const all = load();
  delete all[email];
  save(all);
}
