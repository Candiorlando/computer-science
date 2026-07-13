"use client";

// Invisible client island: bounces already-authenticated users from
// the marketing homepage to their role home. Lives outside the page
// component so the marketing content itself server-renders fully —
// crawlers and curl get the complete HTML.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";

export function HomeRedirect() {
  const router = useRouter();
  useEffect(() => {
    const u = loadSession();
    if (u) {
      router.replace(u.role === "counselor" ? "/case-search" : "/portal");
    }
  }, [router]);
  return null;
}
