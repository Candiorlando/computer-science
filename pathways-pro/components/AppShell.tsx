"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { loadSession } from "@/lib/session";
import { isAdminRole } from "@/lib/rbac";
import type { AnyUser } from "@/lib/users";
import { LeftNav } from "./LeftNav";
import { ClientTopNav } from "./ClientTopNav";
import { MarketingHeader } from "./MarketingHeader";
import { SiteFooter } from "./SiteFooter";

// AppShell decides which chrome wraps the page:
//
//  - Authenticated admin/counselor → left sidebar nav (full case management).
//  - Authenticated client/vendor/partner → simplified top header nav.
//  - Unauthenticated / public routes → marketing header with centered nav.

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
  "/employment-partners",
  "/onboarding",
  "/request-demo",
  "/signin",
  "/login",
  "/claim-account",
  "/services",
  "/partners",
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

  // Public / unauthenticated — marketing header + centered content.
  if (!mounted || !user || isPublicPath(pathname)) {
    return (
      <>
        <MarketingHeader />
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
        <SiteFooter />
      </>
    );
  }

  // Admin / Counselor — full sidebar layout.
  if (isAdminRole(user.role)) {
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

  // Client / Vendor / Business / Partner — simplified top header layout.
  return (
    <div className="min-h-screen flex flex-col">
      <ClientTopNav />
      <main className="flex-1 px-6 md:px-10 py-8 max-w-6xl w-full mx-auto">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
