"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ComponentType } from "react";
import { clearSession, loadSession } from "@/lib/session";
import type { AnyUser } from "@/lib/users";
import { unreadCount } from "@/lib/messages";
import { isMasterAdmin, isTenantAdmin, canManageBilling } from "@/lib/rbac";
import {
  Search,
  ClipboardList,
  CalendarDays,
  Wrench,
  Building2,
  Handshake,
  Package,
  Scale,
  Newspaper,
  DollarSign,
  CreditCard,
  BarChart3,
  Briefcase,
  GraduationCap,
  Settings,
  Home,
  CalendarCheck,
  TrendingUp,
  FileText,
  Lightbulb,
  PenTool,
  BookOpen,
  Mail,
  StickyNote,
  Rocket,
  FolderOpen,
  Users,
  UserPlus,
  ShieldCheck,
  ListChecks,
  Megaphone,
  Landmark,
  LockKeyhole,
  LogOut,
  Globe,
  Store,
} from "lucide-react";

/* ── Icon type for menu items ────────────────────────────────────── */

type LucideIcon = ComponentType<{ className?: string }>;

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// ── Counselor / Admin sidebar menu ─────────────────────────────────

function counselorMenu(
  unread: number,
  masterAdmin: boolean,
  billingAccess: boolean,
  tenantAdmin: boolean,
): NavSection[] {
  return [
    {
      items: [
        { href: "/case-search", label: "Case Search", icon: Search, badge: unread },
        { href: "/caseload", label: "Caseload", icon: ClipboardList },
        { href: "/schedule", label: "Scheduling", icon: CalendarDays },
      ],
    },
    {
      title: "Network",
      items: [
        { href: "/dashboard/vendors", label: "Vendors", icon: Wrench },
        { href: "/dashboard/business", label: "Business Clients", icon: Building2 },
        { href: "/dashboard/partners", label: "Employment Partners", icon: Handshake },
      ],
    },
    {
      title: "Operations",
      items: [
        { href: "/dashboard/service-orders", label: "Service Orders", icon: Package },
        { href: "/dashboard/forensic", label: "Forensic", icon: Scale },
        { href: "/dashboard/daily-briefing", label: "Daily Briefing", icon: Newspaper },
        { href: "/dashboard/financials", label: "Financials (AR/AP)", icon: DollarSign },
        // Stripe/AR setup: tenant admins bill for their whole agency;
        // solopreneurs (no tenant) bill for themselves. Ordinary
        // tenant-affiliated counselors don't manage billing at all.
        ...(billingAccess
          ? [{ href: "/dashboard/payments", label: "Payments & Subscriptions", icon: CreditCard }]
          : []),
        { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
        { href: "/dashboard/gem-suite", label: "GEM Suite", icon: Megaphone },
        { href: "/dashboard/wioa-compliance-suite", label: "WIOA Compliance", icon: Landmark },
        { href: "/dashboard/services-catalog", label: "Service Catalog", icon: Briefcase },
        { href: "/dashboard/client-curriculum", label: "Client Curriculum", icon: BookOpen },
        { href: "/ce", label: "CE Tracker", icon: GraduationCap },
        // Public marketplace listing — every counselor (solopreneur or
        // tenant-affiliated) manages their own; never shows pricing.
        ...(!masterAdmin
          ? [{ href: "/provider-profile", label: "Marketplace Profile", icon: Globe }]
          : []),
      ],
    },
    {
      title: "Admin",
      items: [
        // Master Admin and Pricing Engine are platform-level tools —
        // visible only to the Master Administrator, never to ordinary
        // (including tenant-admin) counselor accounts.
        ...(masterAdmin
          ? [
              { href: "/admin/master-admin", label: "Master Admin", icon: LockKeyhole },
              { href: "/admin/pricing-engine", label: "Pricing Engine", icon: DollarSign },
            ]
          : []),
        // Tenant legal/business documents: the tenant admin manages
        // theirs; master admin can view the contractual relationship
        // read-only. Ordinary counselors don't see this at all.
        ...(tenantAdmin || masterAdmin
          ? [{ href: "/admin/tenant-documents", label: "Agency Documents", icon: FileText }]
          : []),
        // Agency-level public profile (the roster of published
        // counselors + agency description) — Tenant Admin only.
        ...(tenantAdmin
          ? [{ href: "/admin/agency-profile", label: "Agency Public Profile", icon: Store }]
          : []),
        { href: "/admin/client-roster", label: "Client Roster", icon: Users },
        { href: "/admin/vendor-directory", label: "Vendor Directory", icon: ListChecks },
        { href: "/admin/approval-queue", label: "Approval Queue", icon: ShieldCheck },
        { href: "/admin/user-management", label: "User Management", icon: UserPlus },
      ],
    },
    {
      items: [{ href: "/settings", label: "Settings", icon: Settings }],
    },
  ];
}

// ── Client sidebar menu (kept for completeness — shown if client
//    is ever routed to sidebar layout) ───────────────────────────────

function clientMenu(unread: number): NavSection[] {
  return [
    {
      items: [
        { href: "/portal", label: "Home", icon: Home },
        { href: "/appointments", label: "Appointments", icon: CalendarCheck },
        { href: "/progress", label: "My Progress", icon: TrendingUp },
        { href: "/ipe", label: "My IPE Plan", icon: ClipboardList },
        { href: "/my-benefits", label: "My Benefits", icon: Lightbulb },
        { href: "/assessment", label: "Assessments", icon: PenTool },
        { href: "/my-assessments", label: "My Assessments", icon: FolderOpen },
        { href: "/transferable-skills", label: "My Skills", icon: Wrench },
        { href: "/my-courses", label: "My Courses", icon: BookOpen },
        { href: "/courses", label: "Courses", icon: GraduationCap },
        { href: "/report", label: "Documents", icon: FileText },
        { href: "/messages", label: "Messages", icon: Mail, badge: unread },
        { href: "/case-notes", label: "Case Notes", icon: StickyNote },
        { href: "/self-advocacy", label: "Tools", icon: Rocket },
        { href: "/settings", label: "Settings", icon: Settings },
      ],
    },
  ];
}

function businessMenu(unread: number): NavSection[] {
  return [
    {
      items: [
        { href: "/business-portal", label: "Home", icon: Home },
        { href: "/business-portal/services", label: "Service Catalog", icon: Briefcase },
        { href: "/business-portal/orders", label: "Service Orders", icon: Package },
        { href: "/business-portal/accounts-payable", label: "Accounts Payable", icon: DollarSign },
        { href: "/business-portal/documents", label: "Documents", icon: FileText },
        { href: "/messages", label: "Messages", icon: Mail, badge: unread },
        { href: "/case-notes", label: "Case Notes", icon: StickyNote },
        { href: "/settings", label: "Settings", icon: Settings },
      ],
    },
  ];
}

function vendorMenu(unread: number): NavSection[] {
  return [
    {
      items: [
        { href: "/vendor-portal", label: "Home", icon: Home },
        { href: "/vendor-portal/orders", label: "Service Orders", icon: Package },
        { href: "/vendor-portal/services", label: "Service Catalog", icon: Briefcase },
        { href: "/vendor-portal", label: "Documents", icon: FileText },
        { href: "/messages", label: "Messages", icon: Mail, badge: unread },
        { href: "/case-notes", label: "Case Notes", icon: StickyNote },
        { href: "/settings", label: "Settings", icon: Settings },
      ],
    },
  ];
}

function partnerMenu(unread: number): NavSection[] {
  return [
    {
      items: [
        { href: "/partner-portal", label: "Home", icon: Home },
        { href: "/partner-portal/orders", label: "Service Orders", icon: Package },
        { href: "/partner-portal/opportunities", label: "Opportunities", icon: ClipboardList },
        { href: "/partner-portal/supported-employment", label: "Supported Employment", icon: Handshake },
        { href: "/partner-portal/services", label: "Service Catalog", icon: Briefcase },
        { href: "/partner-portal/documents", label: "Documents", icon: FileText },
        { href: "/messages", label: "Messages", icon: Mail, badge: unread },
        { href: "/case-notes", label: "Case Notes", icon: StickyNote },
        { href: "/settings", label: "Settings", icon: Settings },
      ],
    },
  ];
}

function sectionsFor(user: AnyUser, unread: number): NavSection[] {
  switch (user.role) {
    case "counselor":
      return counselorMenu(unread, isMasterAdmin(user), canManageBilling(user), isTenantAdmin(user));
    case "client":
      return clientMenu(unread);
    case "business":
      return businessMenu(unread);
    case "vendor":
      return vendorMenu(unread);
    case "partner":
      return partnerMenu(unread);
  }
}

function roleBadge(role: AnyUser["role"]): { label: string; bg: string } {
  return {
    counselor: { label: "Counselor", bg: "bg-emerald-100 text-emerald-900" },
    client: { label: "Client", bg: "bg-emerald-100 text-emerald-900" },
    business: { label: "Business", bg: "bg-emerald-100 text-emerald-900" },
    vendor: { label: "Vendor", bg: "bg-amber-100 text-amber-900" },
    partner: { label: "Partner", bg: "bg-emerald-100 text-emerald-900" },
  }[role];
}

/* ── Component ───���──────────────────────────────────────────────── */

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

  const sections = sectionsFor(user, unread);
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
      {/* Branding + user */}
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

      {/* Menu sections */}
      <div className="flex-1 overflow-y-auto py-3 px-2">
        {sections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-4" : ""}>
            {section.title && (
              <p className="px-3 mb-1 text-[10px] uppercase tracking-widest text-ink/45 font-semibold">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5" role="list">
              {section.items.map((it) => {
                const Icon = it.icon;
                const active =
                  pathname === it.href ||
                  (it.href !== "/" && pathname.startsWith(it.href + "/"));
                return (
                  <li key={it.href + it.label}>
                    <Link
                      href={it.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
                        active
                          ? "grad-tealblue text-white font-semibold"
                          : "text-ink/75 hover:bg-ink/5"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          active ? "text-white" : "text-ink/50"
                        }`}
                      />
                      <span className="flex-1 leftnav-label">{it.label}</span>
                      {it.badge != null && it.badge > 0 && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            active
                              ? "bg-white/25 text-white"
                              : "bg-emerald-500 text-white"
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
          </div>
        ))}
      </div>

      {/* Sign out */}
      <div className="p-3 border-t border-ink/10">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 text-xs text-ink/65 hover:text-ink px-3 py-2 rounded-md hover:bg-ink/5"
        >
          <LogOut className="w-4 h-4" />
          <span className="leftnav-label">Sign out</span>
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
          .leftnav :global(.leftnav-label) {
            display: none;
          }
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
