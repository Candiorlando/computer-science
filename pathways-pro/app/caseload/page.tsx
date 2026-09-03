"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import {
  getCounselorClients,
  sortCaseload,
  type ClientUser,
  type CounselorUser,
} from "@/lib/users";
import { visibleCounselorsFor } from "@/lib/tenants";
import { isMasterAdmin } from "@/lib/rbac";

type SortKey = "caseId" | "name";

export default function CaseloadPage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("caseId");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    if (isMasterAdmin(s)) return router.replace("/admin/master-admin");
    setUser(s);
  }, [router]);

  const clients = useMemo(() => {
    if (!user) return [];
    // Tenant Admins see their whole agency's caseload; Tenant Users and
    // solopreneurs see only their own (visibleCounselorsFor returns just
    // [user] for those, so this is a no-op expansion for them).
    const seen = new Set<string>();
    const roster: ClientUser[] = [];
    for (const c of visibleCounselorsFor(user)) {
      for (const client of getCounselorClients(c)) {
        if (!seen.has(client.email)) {
          seen.add(client.email);
          roster.push(client);
        }
      }
    }
    const sorted =
      sortKey === "name"
        ? [...roster].sort((a, b) => {
            const al = lastFirst(a.name);
            const bl = lastFirst(b.name);
            return al < bl ? -1 : al > bl ? 1 : 0;
          })
        : sortCaseload(roster);
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.caseId.toLowerCase().includes(q) ||
        c.goal.toLowerCase().includes(q),
    );
  }, [user, sortKey, query]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
            Caseload
          </p>
          <h1 className="text-4xl">
            {clients.length} active client{clients.length === 1 ? "" : "s"}
          </h1>
        </div>
        <input
          type="search"
          role="searchbox"
          aria-label="Search caseload by name, case ID, or goal"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter opens the top match's case file directly.
            if (e.key === "Enter" && clients.length > 0) {
              router.push(`/case/${clients[0].caseId}`);
            }
          }}
          placeholder="Search by name, case ID, goal…"
          className="bg-white border border-ink/20 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent w-72"
        />
      </header>

      <div className="flex gap-2 text-xs">
        <span className="text-ink/50 uppercase tracking-wider self-center">
          Sort by:
        </span>
        <SortPill active={sortKey === "caseId"} onClick={() => setSortKey("caseId")}>
          Case ID
        </SortPill>
        <SortPill active={sortKey === "name"} onClick={() => setSortKey("name")}>
          Last name, first name
        </SortPill>
      </div>

      <div className="border border-ink/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ink/5 text-xs uppercase tracking-wider text-ink/60">
            <tr>
              <th className="text-left px-4 py-3">
                <SortHeader
                  label="Case ID"
                  active={sortKey === "caseId"}
                  onClick={() => setSortKey("caseId")}
                />
              </th>
              <th className="text-left px-4 py-3">
                <SortHeader
                  label="Client"
                  active={sortKey === "name"}
                  onClick={() => setSortKey("name")}
                />
              </th>
              <th className="text-left px-4 py-3">Goal</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Progress</th>
              <th className="text-left px-4 py-3">Next Appt</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr
                key={c.email}
                className="border-t border-ink/10 bg-cream hover:bg-accent/5"
              >
                <td className="px-4 py-3 text-ink/80 font-mono text-xs whitespace-nowrap">
                  {c.caseId}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/case/${c.caseId}`}
                    className="font-semibold hover:text-accent"
                  >
                    {c.name}
                  </Link>
                  <div className="text-xs text-ink/50">DOB {c.dob}</div>
                </td>
                <td className="px-4 py-3 text-ink/80">{c.goal}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-ink/60">{c.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-ink/70">{c.nextAppt}</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr className="border-t border-ink/10 bg-cream">
                <td colSpan={6} className="px-4 py-8 text-center text-ink/60">
                  <p>
                    No clients on your roster match
                    {query.trim() ? (
                      <>
                        {" "}
                        &ldquo;<strong>{query.trim()}</strong>&rdquo;
                      </>
                    ) : (
                      " your search"
                    )}
                    .
                  </p>
                  <Link
                    href={`/case-search${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`}
                    className="inline-block mt-3 text-accent hover:underline font-semibold"
                  >
                    Search all cases — businesses, vendors &amp; partners →
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function lastFirst(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length < 2) return fullName.toLowerCase();
  const last = parts[parts.length - 1];
  const first = parts.slice(0, -1).join(" ");
  return `${last} ${first}`.toLowerCase();
}

function SortPill({
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
      className={`px-3 py-1.5 rounded-full border ${
        active
          ? "bg-accent text-cream border-accent"
          : "border-ink/20 text-ink/70 hover:border-accent"
      }`}
    >
      {children}
    </button>
  );
}

function SortHeader({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} className="flex items-center gap-1 hover:text-accent">
      {label}
      {active && <span className="text-accent">↑</span>}
    </button>
  );
}

function StatusBadge({ status }: { status: ClientUser["status"] }) {
  const styles: Record<ClientUser["status"], string> = {
    "In Training": "bg-emerald-100 text-emerald-800",
    "Job Placement": "bg-green-100 text-green-800",
    "Assessment Phase": "bg-amber-100 text-amber-800",
    Intake: "bg-pink-100 text-pink-800",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
}
