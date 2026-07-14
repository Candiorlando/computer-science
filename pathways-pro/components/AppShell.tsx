"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { AnyUser } from "@/lib/users";
import { LeftNav } from "./LeftNav";
import { AppHeader } from "./AppHeader";
import { SiteFooter } from "./SiteFooter";

// AppShell decides which chrome wraps the page:
//
//  - Authenticated user → left sidebar nav + main content (modern SaaS).
//  - Unauthenticated / public landing routes → full-bleed with the
//    original top header so the marketing pages render edge-to-edge.
//
// We keep AppHeader available for the unauthenticated path so /, /business,
// /accessibility, and any future public pages keep their existing look.

const PUBLIC_PREFIXES = [
  "/",
  "/business",
  "/accessibility",
  "/privacy",
  "/careers",
  "/training",
  "/about",
  "/mission",
  "/features",
  "/contact",
  "/demo",
  "/terms",
];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "/business") return true;
  return PUBLIC_PREFIXES.some(
    (p) => p !== "/" && pathname.startsWith(p) && !pathname.startsWith(p + "-"),
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(loadSession());
  }, [pathname]);

  // Public landing pages — keep the existing top header + centered main.
  if (!mounted || !user || isPublicPath(pathname)) {
    return (
      <>
        <AppHeader />
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
        <SiteFooter />
      </>
    );
  }

  // Authenticated app — left sidebar + main content area.
  return (
    <div className="flex min-h-screen">
      <LeftNav />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 px-6 md:px-10 py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
