"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, loadSession } from "@/lib/session";
import type { AnyUser } from "@/lib/users";
import { dashboardRoute, ROLE_LABELS } from "@/lib/rbac";
import {
  CalendarDays,
  MessageSquare,
  CreditCard,
  BookOpen,
  LogOut,
  Menu,
  X,
} from "lucide-react";

interface NavTab {
  href: string;
  label: string;
  icon: React.ReactNode;
}

function tabsForRole(role: AnyUser["role"]): NavTab[] {
  // All non-admin roles get the simplified tab set
  const home = dashboardRoute(role);
  return [
    { href: home, label: "Home", icon: <CalendarDays className="w-4 h-4" /> },
    {
      href: "/appointments",
      label: "Appointments",
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      href: "/my-courses",
      label: "My Courses",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      href: "/messages",
      label: "Secure Messages",
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      href: "/settings",
      label: "Billing",
      icon: <CreditCard className="w-4 h-4" />,
    },
  ];
}

export function ClientTopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setUser(loadSession());
    setMobileOpen(false);
  }, [pathname]);

  if (!user) return null;

  const tabs = tabsForRole(user.role);
  const badge = ROLE_LABELS[user.role] || user.role;

  function signOut() {
    clearSession();
    router.push("/");
  }

  return (
    <header className="bg-cream border-b border-ink/10 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href={dashboardRoute(user.role)}
            className="text-lg tracking-tight font-semibold text-ink flex-shrink-0"
          >
            Pathways Pro
          </Link>

          {/* Desktop tabs */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {tabs.map((tab) => {
              const active =
                pathname === tab.href ||
                (tab.href !== "/" && pathname.startsWith(tab.href + "/"));
              return (
                <Link
                  key={tab.href + tab.label}
                  href={tab.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition ${
                    active
                      ? "bg-accent/10 text-accent font-semibold"
                      : "text-ink/65 hover:text-ink hover:bg-ink/5"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {/* User / sign-out */}
          <div className="hidden md:flex items-center gap-3">
            <div className="text-right text-xs leading-tight">
              <div className="font-semibold text-ink">{user.name}</div>
              <span className="text-ink/50">{badge}</span>
            </div>
            <button
              onClick={signOut}
              className="p-2 text-ink/50 hover:text-ink rounded-md hover:bg-ink/5 transition"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-ink/70 hover:text-ink"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-ink/10 py-3 space-y-1">
            {tabs.map((tab) => {
              const active =
                pathname === tab.href ||
                (tab.href !== "/" && pathname.startsWith(tab.href + "/"));
              return (
                <Link
                  key={tab.href + tab.label}
                  href={tab.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm ${
                    active
                      ? "bg-accent/10 text-accent font-semibold"
                      : "text-ink/65 hover:bg-ink/5"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              );
            })}
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-ink/65 hover:bg-ink/5 w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
