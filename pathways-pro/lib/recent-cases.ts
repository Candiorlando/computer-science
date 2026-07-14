"use client";

// Track the counselor's recently opened cases so the Case Search Menu
// can surface a quick-access list. Per-counselor, FIFO, keep last 10.

const KEY = "pathways-pro:counselor-recents-v1";

interface RecentMap {
  [counselorEmail: string]: string[];
}

function readMap(): RecentMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentMap) : {};
  } catch {
    return {};
  }
}
function writeMap(map: RecentMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(map));
}

export function recordCaseOpen(counselorEmail: string, caseRef: string) {
  const map = readMap();
  const cur = map[counselorEmail] ?? [];
  const next = [caseRef, ...cur.filter((c) => c !== caseRef)].slice(0, 10);
  map[counselorEmail] = next;
  writeMap(map);
}

export function getRecentCases(counselorEmail: string): string[] {
  return readMap()[counselorEmail] ?? [];
}
