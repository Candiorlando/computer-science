"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { clearSession, loadSession } from "@/lib/session";
import type { AnyUser } from "@/lib/users";
import { unreadCount } from "@/lib/messages";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  badge?: number;
}

// Returns the role-scoped menu. Same seven sections per spec:
//   Home · Assessments · Documents · Messages · Case Notes · Tools · Settings
function menuFor(user: AnyUser, unread: number): NavItem[] {
  if (user.role === "counselor") {
    return [
      { href: "/dashboard", label: "Home", icon: "🏠" },
      { href: "/caseload", label: "Caseload", icon: "📋" },
      { href: "/dashboard/partners", label: "Employment Partners", icon: "🤝" },
      { href: "/dashboard/services-catalog", label: "Service Catalog", icon: "💼" },
      { href: "/clinical-assessments", label: "Assessments", icon: "📝" },
      { href: "/report", label: "Documents", icon: "📄" },
      { href: "/messages", label: "Messages", icon: "✉️", badge: unread },
      { href: "/case-notes", label: "Case Notes", icon: "🗒️" },
      { href: "/practitioner-hub", label: "Tools", icon: "🛠️" },
      { href: "/settings", label: "Settings", icon: "⚙️" },
    ];
  }
  if (user.role === "client") {
    return [
      { href: "/portal", label: "Home", icon: "🏠" },
      { href: "/assessment", label: "Assessments", icon: "📝" },
      { href: "/report", label: "Documents", icon: "📄" },
      { href: "/messages", label: "Messages", icon: "✉️", badge: unread },
      { href: "/case-notes", label: "Case Notes", icon: "🗒️" },
      { href: "/self-advocacy", label: "Tools", icon: "🛠️" },
      { href: "/settings", label: "Settings", icon: "⚙️" },
    ];
  }
  if (user.role === "business") {
    return [
      { href: "/business-portal", label: "Home", icon: "🏠" },
      { href: "/business-portal/services", label: "Service Catalog", icon: "💼" },
      { href: "/business-portal", label: "Documents", icon: "📄" },
      { href: "/messages", label: "Messages", icon: "✉️", badge: unread },
      { href: "/case-notes", label: "Case Notes", icon: "🗒️" },
      { href: "/settings", label: "Settings", icon: "⚙️" },
    ];
  }
  if (user.role === "vendor") {
    return [
      { href: "/vendor-portal", label: "Home", icon: "🏠" },
      { href: "/vendor-portal", label: "Engagements", icon: "📋" },
      { href: "/vendor-portal/services", label: "Services", icon: "💼" },
      { href: "/vendor-portal", label: "Documents", icon: "📄" },
      { href: "/messages", label: "Messages", icon: "✉️", badge: unread },
      { href: "/case-notes", label: "Case Notes", icon: "🗒️" },
      { href: "/settings", label: "Settings", icon: "⚙️" },
    ];
  }
  // partner — Employment Partner
  const items: NavItem[] = [
    { href: "/partner-portal", label: "Home", icon: "🏠" },
    { href: "/partner-portal/opportunities", label: "Opportunities", icon: "📋" },
    { href: "/partner-portal/supported-employment", label: "Supported Employment", icon: "🤝" },
  ];
  if (
    "participatesInCustomizedEmployment" in user &&
    user.participatesInCustomizedEmployment
  ) {
    items.push({
      href: "/partner-portal/customized-employment",
      label: "Customized Employment",
      icon: "🎯",
    });
  }
  items.push(
    { href: "/partner-portal/services", label: "Service Catalog", icon: "💼" },
    { href: "/partner-portal/accommodation-requests", label: "Accommodation Requests", icon: "♿" },
    { href: "/partner-portal/documents", label: "Documents", icon: "📄" },
    { href: "/messages", label: "Messages", icon: "✉️", badge: unread },
    { href: "/case-notes", label: "Case Notes", icon: "🗒️" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  );
  return items;
}

function roleBadge(role: AnyUser["role"]): { label: string; bg: string } {
  return {
    counselor: { label: "Counselor", bg: "bg-emerald-100 text-emerald-900" },
    client: { label: "Client", bg: "bg-blue-100 text-blue-900" },
    business: { label: "Business", bg: "bg-purple-100 text-purple-900" },
    vendor: { label: "Vendor", bg: "bg-amber-100 text-amber-900" },
    partner: { label: "Partner", bg: "bg-cyan-100 text-cyan-900" },
  }[role];
}

export function LeftNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const u = loadSession();
    setUser(u);
    if (u) setUnread(unreadCount(u.email));
  }, [pathname]);

  if (!user) return null;

  const menu = menuFor(user, unread);
  const badge = roleBadge(user.role);

  function signOut() {
    clearSession();
    router.push(
      user!.role === "business" ||
        user!.role === "vendor" ||
        user!.role === "partner"
        ? "/business"
        : "/",
    );
  }

  return (
    <aside
      role="navigation"
      aria-label="Primary"
      className="leftnav bg-cream border-r border-ink/10 flex-shrink-0 flex flex-col"
    >
      <div className="p-5 border-b border-ink/10">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl tracking-tight font-semibold">
            Pathways Pro
          </span>
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <div className="w-8 h-8 grad-tealblue text-white rounded-full grid place-items-center text-xs font-bold">
            {initials(user.name)}
          </div>
          <div className="text-xs leading-tight">
            <div className="font-semibold text-ink">{user.name}</div>
            <span
              className={`inline-block mt-0.5 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-semibold ${badge.bg}`}
            >
              {badge.label}
            </span>
          </div>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto py-3 space-y-1 px-2" role="list">
        {menu.map((it) => {
          const active =
            pathname === it.href ||
            (it.href !== "/" && pathname.startsWith(it.href + "/"));
          return (
            <li key={it.href + it.label}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                  active
                    ? "grad-tealblue text-white font-semibold"
                    : "text-ink/75 hover:bg-ink/5"
                }`}
              >
                <span aria-hidden className="text-base w-5 text-center">
                  {it.icon}
                </span>
                <span className="flex-1">{it.label}</span>
                {it.badge != null && it.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      active
                        ? "bg-white/25 text-white"
                        : "bg-cyan-500 text-white"
                    }`}
                  >
                    {it.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="p-3 border-t border-ink/10">
        <button
          onClick={signOut}
          className="w-full text-xs text-ink/65 hover:text-ink px-3 py-2 rounded-md hover:bg-ink/5"
        >
          Sign out
        </button>
      </div>

      <style jsx>{`
        .leftnav {
          width: 240px;
          min-height: 100vh;
          position: sticky;
          top: 0;
        }
        @media (max-width: 768px) {
          .leftnav {
            width: 60px;
          }
          .leftnav :global(span:not([aria-hidden]):not(.text-\\[10px\\])) {
            display: none;
          }
        }
        :global(.grad-tealblue) {
          background-image: linear-gradient(135deg, #14b8a6 0%, #06b6d4 50%, #3b82f6 100%);
        }
      `}</style>
    </aside>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
