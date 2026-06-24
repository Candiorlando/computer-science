"use client";

// Counselor Case Search Menu — the counselor's new landing page.
// No dashboard until a case is picked. Aggregate counts that surface
// here (unread messages, pending notes) deep-link straight into the
// relevant case rather than showing any content cross-case.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import {
  CLIENTS,
  getAllBusinessUsers,
  getAllVendorUsers,
} from "@/lib/users";
import { loadPartnerOrgs } from "@/lib/employment-partners";
import { loadCaseNotes } from "@/lib/case-notes";
import { threadsForUser, unreadCount } from "@/lib/messages";

type CaseType = "client" | "vendor" | "business" | "partner";

interface CaseRow {
  id: string;            // case-id-like identifier (caseId for clients; orgId for others)
  type: CaseType;
  name: string;
  subtitle: string;
  href: string;
  pendingActivity: number;     // count of "new since last visit" items
  unreadMessages: number;
}

const RECENT_KEY = "pathways-pro:counselor-recents-v1";

function loadRecents(counselorEmail: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return Array.isArray(map[counselorEmail]) ? map[counselorEmail] : [];
  } catch {
    return [];
  }
}

export default function CaseSearchPage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | CaseType>("all");

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const cases = useMemo(() => buildCaseList(user), [user]);
  const recents = useMemo(() => (user ? loadRecents(user.email) : []), [user]);

  if (!user) return null;

  const q = query.trim().toLowerCase();
  const filtered = cases
    .filter((c) => (filter === "all" ? true : c.type === filter))
    .filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.subtitle.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q),
    );

  const recentRows = recents
    .map((id) => cases.find((c) => c.id === id))
    .filter((c): c is CaseRow => Boolean(c))
    .slice(0, 5);

  const totalUnread = cases.reduce((s, c) => s + c.unreadMessages, 0);
  const totalPending = cases.reduce((s, c) => s + c.pendingActivity, 0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pt-8 pb-12">
      <header className="text-center space-y-2">
        <p className="text-xs uppercase tracking-widest text-cyan-700">
          Case Search · {user.agency}
        </p>
        <h1 className="text-4xl font-semibold">
          Welcome back, {user.name.split(" ")[0]}.
        </h1>
        <p className="text-ink/65">
          Pick a case to open. Case notes, messages, and documents live
          inside each case — never on this page.
        </p>
      </header>

      {(totalUnread > 0 || totalPending > 0) && (
        <section
          className="saas-card border-cyan-300 bg-cyan-50/60 text-center"
          aria-live="polite"
        >
          <p className="text-sm">
            {totalUnread > 0 && (
              <span className="font-semibold">
                {totalUnread} unread message{totalUnread === 1 ? "" : "s"}
              </span>
            )}
            {totalUnread > 0 && totalPending > 0 && (
              <span className="text-ink/40"> · </span>
            )}
            {totalPending > 0 && (
              <span className="font-semibold">
                {totalPending} case{totalPending === 1 ? "" : "s"} with new
                activity
              </span>
            )}
            <span className="text-ink/65">
              {" "}
              — open the case to read.
            </span>
          </p>
        </section>
      )}

      <section className="saas-card">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-ink/55">
            Search cases
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a name, case ID, or organization…"
            className="w-full text-lg bg-white border-2 border-cyan-300 focus:border-cyan-600 focus:outline-none rounded-lg px-4 py-3 mt-2"
            autoFocus
          />
        </label>

        <div className="flex flex-wrap gap-2 mt-4 text-xs">
          <span className="text-ink/55 uppercase tracking-wider mr-1 self-center">
            Filter:
          </span>
          <Pill active={filter === "all"} onClick={() => setFilter("all")}>
            All ({cases.length})
          </Pill>
          <Pill active={filter === "client"} onClick={() => setFilter("client")}>
            Clients ({cases.filter((c) => c.type === "client").length})
          </Pill>
          <Pill active={filter === "vendor"} onClick={() => setFilter("vendor")}>
            Vendors ({cases.filter((c) => c.type === "vendor").length})
          </Pill>
          <Pill
            active={filter === "business"}
            onClick={() => setFilter("business")}
          >
            Business ({cases.filter((c) => c.type === "business").length})
          </Pill>
          <Pill active={filter === "partner"} onClick={() => setFilter("partner")}>
            Employment Partners ({cases.filter((c) => c.type === "partner").length})
          </Pill>
        </div>
      </section>

      {recentRows.length > 0 && !query && filter === "all" && (
        <section>
          <h2 className="text-xs uppercase tracking-widest text-ink/55 mb-2">
            Recent cases
          </h2>
          <ul className="space-y-2" role="list">
            {recentRows.map((c) => (
              <CaseRowItem key={c.id} c={c} />
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-xs uppercase tracking-widest text-ink/55 mb-2">
          {filter === "all" ? "All cases" : `${filter} cases`} ·{" "}
          {filtered.length}
        </h2>
        {filtered.length === 0 ? (
          <div className="saas-card text-center text-ink/55 italic">
            No matching cases.
          </div>
        ) : (
          <ul className="space-y-2" role="list">
            {filtered.map((c) => (
              <CaseRowItem key={c.id} c={c} />
            ))}
          </ul>
        )}
      </section>

      <footer className="text-center text-xs text-ink/55 border-t border-ink/10 pt-4">
        Need to onboard a new case? Clients sign up at the{" "}
        <Link href="/" className="text-cyan-700 hover:underline">
          public landing
        </Link>
        ; business / vendor / partner accounts sign up at{" "}
        <Link href="/business" className="text-cyan-700 hover:underline">
          /business
        </Link>
        .
      </footer>
    </div>
  );
}

function CaseRowItem({ c }: { c: CaseRow }) {
  const typeStyles: Record<CaseType, { bg: string; label: string; icon: string }> = {
    client: { bg: "bg-blue-100 text-blue-900", label: "Client", icon: "👤" },
    vendor: { bg: "bg-amber-100 text-amber-900", label: "Vendor", icon: "🛠️" },
    business: { bg: "bg-purple-100 text-purple-900", label: "Business", icon: "🏢" },
    partner: { bg: "bg-cyan-100 text-cyan-900", label: "Partner", icon: "🤝" },
  };
  const t = typeStyles[c.type];
  return (
    <li>
      <Link
        href={c.href}
        className="saas-card flex items-center gap-4 hover:no-underline"
      >
        <div className="w-10 h-10 grad-tealblue text-white rounded-full grid place-items-center text-base flex-shrink-0">
          {t.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold">{c.name}</h3>
            <span
              className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${t.bg}`}
            >
              {t.label}
            </span>
          </div>
          <p className="text-xs text-ink/65 truncate">{c.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          {c.unreadMessages > 0 && (
            <span className="text-[10px] font-bold bg-cyan-500 text-white px-2 py-1 rounded-full">
              ✉️ {c.unreadMessages}
            </span>
          )}
          {c.pendingActivity > 0 && (
            <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-1 rounded-full">
              ● {c.pendingActivity} new
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

function buildCaseList(user: CounselorUser | null): CaseRow[] {
  if (!user) return [];
  const out: CaseRow[] = [];
  const allNotes = loadCaseNotes();
  const threads = threadsForUser(user.email);

  // Clients
  for (const k of user.clientKeys) {
    const c = CLIENTS[k];
    if (!c) continue;
    const noteCount = allNotes.filter((n) => n.clientCaseId === c.caseId)
      .length;
    const thread = threads.find((t) =>
      t.participants.some((p) => p.email === c.email),
    );
    const unread = thread ? unreadCount(user.email) : 0;
    out.push({
      id: c.caseId,
      type: "client",
      name: c.name,
      subtitle: `${c.caseId} · ${c.goal} · ${c.status}`,
      href: `/case/${c.caseId}`,
      pendingActivity: noteCount > 0 ? 1 : 0, // simplified: "new" = anything since seed
      unreadMessages: unread > 0 ? 1 : 0,
    });
  }

  // Vendors
  for (const v of Object.values(getAllVendorUsers())) {
    const thread = threads.find((t) =>
      t.participants.some((p) => p.email === v.email),
    );
    out.push({
      id: v.vendorOrgId,
      type: "vendor",
      name: v.vendorOrgName,
      subtitle: `${v.vendorType} · ${v.name}`,
      href: `/dashboard/vendors/${v.vendorOrgId}`,
      pendingActivity: 0,
      unreadMessages: thread && unreadCount(user.email) > 0 ? 1 : 0,
    });
  }

  // Business clients
  for (const b of Object.values(getAllBusinessUsers())) {
    const thread = threads.find((t) =>
      t.participants.some((p) => p.email === b.email),
    );
    out.push({
      id: b.orgId,
      type: "business",
      name: b.orgName,
      subtitle: `${b.scopeRole.replaceAll("_", " ")} · ${b.name}`,
      href: `/dashboard/business/${b.orgId}`,
      pendingActivity: 0,
      unreadMessages: thread && unreadCount(user.email) > 0 ? 1 : 0,
    });
  }

  // Employment Partners
  for (const p of Object.values(loadPartnerOrgs())) {
    out.push({
      id: p.id,
      type: "partner",
      name: p.legalName,
      subtitle: `${p.partnerOrgType.replaceAll("-", " ")} · ${p.industry ?? ""}`,
      href: `/dashboard/partners/${p.id}`,
      pendingActivity: 0,
      unreadMessages: 0,
    });
  }

  // Sort by name within each type
  return out.sort((a, b) => {
    if (a.type !== b.type) return a.type.localeCompare(b.type);
    return a.name.localeCompare(b.name);
  });
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
        active
          ? "grad-tealblue text-white"
          : "border border-ink/15 text-ink/70 hover:border-cyan-500"
      }`}
    >
      {children}
    </button>
  );
}
