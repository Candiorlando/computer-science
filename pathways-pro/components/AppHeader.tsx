"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, loadMode, loadSession, saveMode, type ViewMode } from "@/lib/session";
import type { AnyUser, ClientUser, CounselorUser } from "@/lib/users";

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
    if (u) setMode(loadMode(u.role));
  }, [pathname]);

  function handleLogout() {
    clearSession();
    setUser(null);
    router.push("/");
  }

  function switchMode(next: ViewMode) {
    setMode(next);
    saveMode(next);
    router.push(next === "counselor" ? "/dashboard" : "/portal");
  }

  // While not mounted, render a static header to avoid hydration mismatch.
  const isCounselor = user?.role === "counselor";

  const counselorTabs = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/resources/counselor", label: "Resource Library" },
    { href: "/caseload", label: "Caseload" },
    { href: "/assessment", label: "Interest Profiler" },
  ];

  const clientTabs = [
    { href: "/portal", label: "Home" },
    { href: "/intake", label: "Find My Path" },
    { href: "/results", label: "My Matches" },
    { href: "/resources/client", label: "Resources" },
    { href: "/coach", label: "Coach" },
  ];

  const tabs = mounted && user ? (mode === "counselor" ? counselorTabs : clientTabs) : [];

  return (
    <header className="border-b border-ink/10 bg-cream">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href={user ? (mode === "counselor" ? "/dashboard" : "/portal") : "/"} className="flex items-baseline gap-3">
          <span className="text-2xl tracking-tight">Pathways Pro</span>
          <span className="text-xs uppercase tracking-widest text-ink/50">VR · WIOA</span>
        </Link>

        {mounted && user && isCounselor && (
          <div className="flex bg-ink/5 rounded-md p-1">
            <button
              onClick={() => switchMode("counselor")}
              className={`px-3 py-1.5 text-xs rounded ${mode === "counselor" ? "bg-cream shadow-sm text-accent" : "text-ink/60 hover:text-ink"}`}
            >
              Counselor View
            </button>
            <button
              onClick={() => switchMode("client")}
              className={`px-3 py-1.5 text-xs rounded ${mode === "client" ? "bg-cream shadow-sm text-accent" : "text-ink/60 hover:text-ink"}`}
            >
              Client Portal Preview
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
                <div className="text-ink/50">
                  {user.role === "counselor"
                    ? (user as CounselorUser).credentials
                    : (user as ClientUser).caseId}
                </div>
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
          <Link
            href="/"
            className="text-sm border border-ink/20 px-4 py-2 rounded hover:bg-ink/5"
          >
            Sign in
          </Link>
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

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
