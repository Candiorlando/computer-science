"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, loadMode, loadSession, saveMode, type ViewMode } from "@/lib/session";
import type {
  AnyUser,
  BusinessUser,
  ClientUser,
  CounselorUser,
  VendorUser,
} from "@/lib/users";

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [mode, setMode] = useState<ViewMode>("counselor");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = loadSession();
    setUser(u);
    if (u && (u.role === "counselor" || u.role === "client")) {
      // Sync the pill to whatever page the counselor is actually on,
      // so navigating directly to /dashboard/business via URL or a deep
      // link still highlights the Business View pill.
      if (u.role === "counselor" && pathname.startsWith("/dashboard/business")) {
        setMode("business");
        saveMode("business");
      } else {
        setMode(loadMode(u.role));
      }
    }
  }, [pathname]);

  const isCounselor = user?.role === "counselor";
  const isBusiness = user?.role === "business";
  const isVendor = user?.role === "vendor";
  const isExternal = isBusiness || isVendor;

  function handleLogout() {
    clearSession();
    setUser(null);
    router.push(isExternal ? "/business" : "/");
  }

  function switchMode(next: ViewMode) {
    setMode(next);
    saveMode(next);
    const dest =
      next === "counselor"
        ? "/dashboard"
        : next === "client"
          ? "/portal"
          : "/dashboard/business";
    router.push(dest);
  }

  function homeHref(): string {
    if (!user) return "/";
    if (user.role === "business") return "/business-portal";
    if (user.role === "vendor") return "/vendor-portal";
    if (mode === "business") return "/dashboard/business";
    return mode === "counselor" ? "/dashboard" : "/portal";
  }

  const counselorTabs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/caseload", label: "Caseload" },
    { href: "/ipe", label: "IPE Builder" },
    { href: "/report", label: "Assessment Reports" },
    { href: "/labor-market", label: "Labor Market" },
    { href: "/self-advocacy", label: "Self Advocacy" },
    { href: "/entrepreneurship", label: "Self Employment" },
    { href: "/clinical-assessments", label: "Assessment Library" },
    { href: "/practitioner-hub", label: "Practitioner Hub" },
    { href: "/ce", label: "CE Tracker" },
    { href: "/resources/counselor", label: "Resource Library" },
  ];

  // Counselor's Business View mode — shown when the "Business View" pill
  // is active. Single-tab nav for now; expands when /dashboard/business
  // grows sub-routes (employers, vendors, forensic inbox, etc.).
  const counselorBusinessTabs = [
    { href: "/dashboard/business", label: "Business Dashboard" },
  ];

  const clientTabs = [
    { href: "/portal", label: "Home" },
    { href: "/intake", label: "Find My Path" },
    { href: "/assessment", label: "Interest Profiler" },
    { href: "/results", label: "My Matches" },
    { href: "/my-assessments", label: "My Assessments" },
    { href: "/transferable-skills", label: "My Skills" },
    { href: "/resume", label: "Resume" },
    { href: "/self-advocacy", label: "Self Advocacy" },
    { href: "/entrepreneurship", label: "Self Employment" },
    { href: "/funding", label: "Funding" },
    { href: "/report", label: "My Report" },
    { href: "/ipe", label: "My IPE Plan" },
    { href: "/resources/client", label: "Resources" },
    { href: "/coach", label: "Coach" },
  ];

  const businessTabs = [
    { href: "/business-portal", label: "Dashboard" },
    { href: "/business-portal/services", label: "Services" },
  ];

  const vendorTabs = [
    { href: "/vendor-portal", label: "Dashboard" },
  ];

  let tabs: { href: string; label: string }[] = [];
  if (mounted && user) {
    if (isBusiness) tabs = businessTabs;
    else if (isVendor) tabs = vendorTabs;
    else if (mode === "business") tabs = counselorBusinessTabs;
    else tabs = mode === "counselor" ? counselorTabs : clientTabs;
  }

  return (
    <header className="border-b border-ink/10 bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href={homeHref()} className="flex items-baseline gap-3">
          <span className="text-2xl tracking-tight">Pathways Pro</span>
          <span className="text-xs uppercase tracking-widest text-ink/50">
            {isExternal ? "Business · Vendor" : "VR · WIOA"}
          </span>
        </Link>

        {mounted && user && isCounselor && (
          <div
            className="flex bg-ink/5 rounded-md p-1"
            role="tablist"
            aria-label="Counselor view mode"
          >
            <button
              role="tab"
              aria-selected={mode === "counselor"}
              onClick={() => switchMode("counselor")}
              className={`px-3 py-1.5 text-xs rounded ${mode === "counselor" ? "bg-cream shadow-sm text-accent" : "text-ink/60 hover:text-ink"}`}
            >
              Counselor View
            </button>
            <button
              role="tab"
              aria-selected={mode === "client"}
              onClick={() => switchMode("client")}
              className={`px-3 py-1.5 text-xs rounded ${mode === "client" ? "bg-cream shadow-sm text-accent" : "text-ink/60 hover:text-ink"}`}
            >
              Client Portal Preview
            </button>
            <button
              role="tab"
              aria-selected={mode === "business"}
              onClick={() => switchMode("business")}
              className={`px-3 py-1.5 text-xs rounded ${mode === "business" ? "bg-cream shadow-sm text-accent" : "text-ink/60 hover:text-ink"}`}
            >
              Business View
            </button>
          </div>
        )}

        {mounted && user ? (
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 bg-accent text-cream rounded-full grid place-items-center text-xs font-bold">
                {initials(user.name)}
              </div>
              <div className="text-right text-xs leading-tight">
                <div className="text-ink">{user.name}</div>
                <div className="text-ink/50">{metaLine(user)}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs border border-ink/20 px-3 py-1.5 rounded hover:bg-ink/5"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              href="/business"
              className="text-sm text-ink/60 hover:text-accent px-3 py-2"
            >
              For business
            </Link>
            <Link
              href="/"
              className="text-sm border border-ink/20 px-4 py-2 rounded hover:bg-ink/5"
            >
              Sign in
            </Link>
          </div>
        )}
      </div>

      {mounted && user && tabs.length > 0 && (
        <nav className="border-t border-ink/10 bg-cream">
          <div className="max-w-6xl mx-auto px-6 flex gap-1 overflow-x-auto">
            {tabs.map((t) => {
              const active = pathname === t.href || (t.href !== "/" && pathname.startsWith(t.href));
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 ${
                    active
                      ? "border-accent text-accent"
                      : "border-transparent text-ink/60 hover:text-ink"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

function metaLine(user: AnyUser): string {
  switch (user.role) {
    case "counselor":
      return (user as CounselorUser).credentials;
    case "client":
      return (user as ClientUser).caseId;
    case "business":
      return (user as BusinessUser).orgName;
    case "vendor":
      return (user as VendorUser).vendorOrgName;
    case "partner":
      return (user as { partnerOrgName: string }).partnerOrgName;
  }
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
