"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { AnyUser } from "@/lib/users";
import { LeftNav } from "./LeftNav";
import { AppHeader } from "./AppHeader";

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
        <ComplianceFooter />
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
        <ComplianceFooter />
      </div>
    </div>
  );
}

function ComplianceFooter() {
  return (
    <footer className="border-t border-ink/10 mt-16">
      <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-ink/60">
        <p className="mb-3 text-ink/85 leading-relaxed">
          <span className="font-semibold text-ink">Pathways Pro</span> is an
          AI-powered vocational rehabilitation and compliance platform that
          increases competitive integrated employment for disabled individuals.
          It also provides business-facing solutions — including inclusive
          hiring assessments, job task analysis, retention risk reporting, and
          ADA / Section 504 / EEO compliance consulting — creating a unified
          ecosystem where clients, counselors, businesses, and vendors
          collaborate to improve employment outcomes and accessibility.
        </p>
        <p className="mb-2">
          <span className="font-semibold text-ink">🔒 Pathways Pro</span> ·
          HIPAA-compliant · ADA Title I · Section 504 / 501 · WIOA Title IV ·
          CRCC Code of Ethics
        </p>
        <p>
          Data sources: BLS OOH 2024–34 · O*NET 28.3 · RSA WIOA FY2026 ·
          Mini-IPIP (Donnellan et al., 2006) · O*NET Interest Profiler (public
          domain).
        </p>
        <p className="mt-2 italic">
          Pathways Pro is an informational and case-management tool. It does
          not replace the professional judgment of a Certified Rehabilitation
          Counselor or licensed clinician.
        </p>
      </div>
    </footer>
  );
}
