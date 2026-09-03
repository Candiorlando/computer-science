"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import type { AnyUser, CounselorUser, VendorUser, BusinessUser } from "@/lib/users";
import { getCounselorClients, type ClientUser } from "@/lib/users";
import { useDebounce } from "@/lib/use-debounce";
import {
  authorizationsByVendor,
  placementsByEmployer,
  placementsByVendor,
  type ServiceAuthorization,
  type Placement,
} from "@/lib/business-portal";
import { seedBusinessPortal } from "@/lib/business-portal-seed";
import { loadCaseNotes, notesForClient, notesForBusinessOrg } from "@/lib/case-notes";
import { loadIPE } from "@/lib/ipe";
import { loadServiceRequests } from "@/lib/service-requests";

/* ═══════════════════════════════════════════════════════════════════════
   Ecosystem Dashboard — Role-Adaptive Master-Detail Interface

   Dynamically renders different master list rows and detail panels
   based on the logged-in user's role:
     - COUNSELOR: Cases (Case ID, Client Name, Vocational Stage)
     - VENDOR: Authorizations (Auth ID, Client, Service Type, Units)
     - BUSINESS: Placements (Candidate, Job Req, Hiring Stage)

   WCAG 2.1 AA: keyboard nav, aria-selected, semantic landmarks, focus rings
   Responsive: collapses to single-pane drawer on mobile/tablet
═══════════════════════════════════════════════════════════════════════ */

type ActiveRole = "COUNSELOR" | "VENDOR" | "BUSINESS";
type DetailTab = "overview" | "timeline" | "notes" | "actions";

// Unified record type for the master list
interface MasterRecord {
  id: string;
  primaryName: string;
  secondaryId: string;
  badge: string;
  badgeColor: string;
  subtitle: string;
  phone?: string;
  serviceCode?: string;
  raw: ClientUser | ServiceAuthorization | Placement;
}

export default function EcosystemDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [role, setRole] = useState<ActiveRole>("COUNSELOR");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<DetailTab>("overview");
  const [loading, setLoading] = useState(false);
  const [mobileDetail, setMobileDetail] = useState(false);
  const debouncedQuery = useDebounce(query, 200);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    seedBusinessPortal();
    const s = loadSession();
    if (!s) return router.replace("/");
    setUser(s);
    if (s.role === "vendor") setRole("VENDOR");
    else if (s.role === "business" || s.role === "partner") setRole("BUSINESS");
    else setRole("COUNSELOR");
  }, [router]);

  // ── Build role-specific record list ───────────────────────────────
  const records: MasterRecord[] = useMemo(() => {
    if (!user) return [];
    switch (role) {
      case "COUNSELOR": {
        const u = user as CounselorUser;
        return getCounselorClients(u).map((c) => ({
          id: c.caseId,
          primaryName: c.name,
          secondaryId: c.caseId,
          badge: c.status,
          badgeColor: stageBadgeColor(c.status),
          subtitle: c.goal,
          raw: c,
        }));
      }
      case "VENDOR": {
        const u = user as VendorUser;
        return authorizationsByVendor(u.vendorOrgId).map((a) => ({
          id: a.id,
          primaryName: a.caseId,
          secondaryId: a.id,
          badge: a.status,
          badgeColor: authBadgeColor(a.status),
          subtitle: `${a.serviceLabel} — ${a.unitsAuthorized - a.unitsUsed} units remaining`,
          serviceCode: a.serviceCode,
          raw: a,
        }));
      }
      case "BUSINESS": {
        const u = user as BusinessUser;
        return placementsByEmployer(u.orgId).map((p) => ({
          id: p.id,
          primaryName: p.clientName,
          secondaryId: p.socCode ? `SOC ${p.socCode}` : p.id,
          badge: placementLabel(p.status),
          badgeColor: placementBadgeColor(p.status),
          subtitle: `${p.jobTitle} — ${p.hourlyWage > 0 ? "$" + p.hourlyWage + "/hr" : "Unpaid"}`,
          raw: p,
        }));
      }
    }
  }, [user, role]);

  // ── Search ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!debouncedQuery) return records;
    const q = debouncedQuery.toLowerCase();
    const digits = q.replace(/[\s\-\(\)\.]/g, "");
    return records.filter((r) => {
      if (r.primaryName.toLowerCase().includes(q)) return true;
      if (r.secondaryId.toLowerCase().includes(q)) return true;
      if (r.subtitle.toLowerCase().includes(q)) return true;
      if (role === "VENDOR" && r.serviceCode?.toLowerCase().includes(q)) return true;
      if (digits.length >= 3 && r.phone?.replace(/\D/g, "").includes(digits)) return true;
      return false;
    });
  }, [records, debouncedQuery, role]);

  const selected = useMemo(
    () => records.find((r) => r.id === selectedId) ?? null,
    [records, selectedId],
  );

  const focusedIdx = useMemo(
    () => filtered.findIndex((r) => r.id === selectedId),
    [filtered, selectedId],
  );

  const selectRecord = useCallback((id: string) => {
    setLoading(true);
    setSelectedId(id);
    setTab("overview");
    setMobileDetail(true);
    setTimeout(() => setLoading(false), 120);
  }, []);

  // ── Keyboard navigation ───────────────────────────────────────────
  function handleListKeyDown(e: React.KeyboardEvent) {
    if (!filtered.length) return;
    let next = focusedIdx;
    switch (e.key) {
      case "ArrowDown": e.preventDefault(); next = Math.min(focusedIdx + 1, filtered.length - 1); break;
      case "ArrowUp": e.preventDefault(); next = Math.max(focusedIdx - 1, 0); break;
      case "Enter": case " ": e.preventDefault(); if (focusedIdx >= 0) selectRecord(filtered[focusedIdx].id); return;
      case "Escape": e.preventDefault(); setSelectedId(null); setMobileDetail(false); return;
      default: return;
    }
    if (next !== focusedIdx && next >= 0) {
      selectRecord(filtered[next].id);
      listRef.current?.querySelector(`[data-idx="${next}"]`)?.scrollIntoView({ block: "nearest" });
    }
  }

  const searchPlaceholder = role === "COUNSELOR"
    ? "Search by client name, case ID, or phone..."
    : role === "VENDOR"
      ? "Search by client, authorization ID, or service code..."
      : "Search by candidate name, SOC code, or req ID...";

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mx-6 md:-mx-10 -my-8">
      {/* ── Omnibar + role indicator ─────────────────────────────── */}
      <div className="border-b border-ink/10 bg-cream px-4 py-3 flex-none">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <RolePill role={role} />
          <div className="flex-1 relative">
            <label htmlFor="eco-search" className="sr-only">
              {searchPlaceholder}
            </label>
            <input
              id="eco-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-white border border-ink/20 rounded-lg px-4 py-2.5 text-sm pl-10 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              autoComplete="off"
            />
            <svg aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {query && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/50">
                {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Split layout ─────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Master list */}
        <div
          ref={listRef}
          role="listbox"
          aria-label={`${role.toLowerCase()} records`}
          tabIndex={0}
          onKeyDown={handleListKeyDown}
          className={`w-full md:w-80 lg:w-96 flex-none border-r border-ink/10 overflow-y-auto bg-cream focus:outline-none ${
            mobileDetail ? "hidden md:block" : ""
          }`}
        >
          {/* Column headers */}
          <div className="sticky top-0 bg-cream border-b border-ink/10 px-4 py-2 text-[10px] uppercase tracking-wider text-ink/50 flex items-center justify-between z-10">
            <span>{role === "COUNSELOR" ? "Client / Case ID" : role === "VENDOR" ? "Client / Auth ID" : "Candidate / SOC"}</span>
            <span>{role === "COUNSELOR" ? "Stage" : role === "VENDOR" ? "Status" : "Hiring Stage"}</span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-ink/55 italic">
              {query ? "No records match." : "No records assigned."}
            </div>
          ) : (
            filtered.map((r, idx) => (
              <button
                key={r.id}
                data-idx={idx}
                role="option"
                aria-selected={r.id === selectedId}
                onClick={() => selectRecord(r.id)}
                className={`w-full text-left px-4 py-3 border-b border-ink/10 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px] ${
                  r.id === selectedId
                    ? "bg-accent/10 border-l-[3px] border-l-accent"
                    : "hover:bg-ink/[0.03] border-l-[3px] border-l-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">
                      {r.primaryName}
                    </div>
                    <div className="text-xs text-ink/55 font-mono">
                      {r.secondaryId}
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold whitespace-nowrap flex-none ${r.badgeColor}`}>
                    {r.badge}
                  </span>
                </div>
                <div className="text-xs text-ink/50 mt-1 truncate">{r.subtitle}</div>
              </button>
            ))
          )}
        </div>

        {/* Detail panel */}
        <div className={`flex-1 min-w-0 overflow-y-auto bg-white ${!mobileDetail ? "hidden md:block" : ""}`}>
          {!selected ? (
            <EmptyDetail role={role} />
          ) : loading ? (
            <DetailSkeleton />
          ) : (
            <RoleDetail
              role={role}
              record={selected}
              tab={tab}
              onTabChange={setTab}
              onBack={() => { setMobileDetail(false); setSelectedId(null); }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ Role Detail Panel ═════════════════════════════ */

function RoleDetail({
  role,
  record,
  tab,
  onTabChange,
  onBack,
}: {
  role: ActiveRole;
  record: MasterRecord;
  tab: DetailTab;
  onTabChange: (t: DetailTab) => void;
  onBack: () => void;
}) {
  const tabs: { key: DetailTab; label: string }[] =
    role === "COUNSELOR"
      ? [{ key: "overview", label: "Overview" }, { key: "timeline", label: "Timeline" }, { key: "notes", label: "Notes" }, { key: "actions", label: "Actions" }]
      : role === "VENDOR"
        ? [{ key: "overview", label: "Authorization" }, { key: "notes", label: "Progress Notes" }, { key: "actions", label: "Actions" }]
        : [{ key: "overview", label: "Placement" }, { key: "timeline", label: "Hiring Stage" }, { key: "actions", label: "Actions" }];

  return (
    <div className="p-6 space-y-6">
      <button onClick={onBack} className="md:hidden text-xs text-accent hover:underline mb-2">
        &#8592; Back to list
      </button>

      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{record.primaryName}</h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-ink/60">
            <span className="font-mono">{record.secondaryId}</span>
            <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${record.badgeColor}`}>
              {record.badge}
            </span>
          </div>
          <div className="text-sm text-ink/70 mt-1">{record.subtitle}</div>
        </div>
      </header>

      <nav role="tablist" aria-label="Detail tabs" className="flex gap-1 border-b border-ink/10">
        {tabs.map((t) => (
          <button key={t.key} role="tab" aria-selected={tab === t.key} onClick={() => onTabChange(t.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition ${tab === t.key ? "border-accent text-accent" : "border-transparent text-ink/55 hover:text-ink"}`}>
            {t.label}
          </button>
        ))}
      </nav>

      <div role="tabpanel" aria-label={`${tab} content`}>
        {role === "COUNSELOR" && <CounselorTabContent record={record} tab={tab} />}
        {role === "VENDOR" && <VendorTabContent record={record} tab={tab} />}
        {role === "BUSINESS" && <BusinessTabContent record={record} tab={tab} />}
      </div>
    </div>
  );
}

/* ═══════════════════ Counselor Detail Tabs ═════════════════════════════ */

function CounselorTabContent({ record, tab }: { record: MasterRecord; tab: DetailTab }) {
  const client = record.raw as ClientUser;
  const notes = useMemo(() => { loadCaseNotes(); return notesForClient(client.caseId); }, [client.caseId]);
  const ipe = useMemo(() => loadIPE(client.caseId), [client.caseId]);

  if (tab === "overview") {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <InfoCard label="Date of birth" value={client.dob} />
        <InfoCard label="Counselor" value={client.counselorName} />
        <InfoCard label="Next appointment" value={client.nextAppt} />
        <InfoCard label="Progress" value={`${client.progress}%`} />
        <InfoCard label="Case notes" value={String(notes.length)} />
        <InfoCard label="IPE status" value={ipe ? "Drafted" : "Not started"} />
      </div>
    );
  }
  if (tab === "timeline") {
    const stages = [
      { label: "Intake", done: true },
      { label: "Assessment", done: ["Assessment Phase", "In Training", "Job Placement"].includes(client.status) },
      { label: "In Training", done: ["In Training", "Job Placement"].includes(client.status) },
      { label: "Job Placement", done: client.status === "Job Placement" },
    ];
    return (
      <div className="space-y-3">
        {stages.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold flex-none ${s.done ? "bg-accent text-cream" : "bg-ink/10 text-ink/40"}`}>
              {s.done ? "\u2713" : i + 1}
            </div>
            <span className={`text-sm ${s.done ? "font-semibold text-ink" : "text-ink/50"}`}>{s.label}</span>
          </div>
        ))}
      </div>
    );
  }
  if (tab === "notes") {
    if (!notes.length) return <p className="text-sm text-ink/55 italic">No case notes yet.</p>;
    return (
      <div className="space-y-3">
        {notes.slice(0, 5).map((n) => (
          <div key={n.id} className="border border-ink/10 rounded-md p-3 text-sm">
            <div className="flex justify-between text-xs text-ink/50 mb-1">
              <span>
                {n.authorEmail ?? (n.autoGenerated ? "Auto-generated" : "Counselor")}
              </span>
              <span>{new Date(n.generatedAt).toLocaleDateString()}</span>
            </div>
            <p className="text-ink/80 line-clamp-3">
              {n.activityType}: {n.data || n.assessment || n.plan}
            </p>
          </div>
        ))}
      </div>
    );
  }
  // Actions
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <ActionLink href={`/case/${client.caseId}`} label="Open full case file" />
      <ActionLink href={`/ipe?caseId=${client.caseId}`} label="Draft IPE" />
      <ActionLink href={`/case/${client.caseId}?tab=case-notes`} label="Add case note" />
      <ActionLink href={`/case/${client.caseId}?tab=assessments`} label="Assign assessment" />
    </div>
  );
}

/* ═══════════════════ Vendor Detail Tabs ════════════════════════════════ */

function VendorTabContent({ record, tab }: { record: MasterRecord; tab: DetailTab }) {
  const auth = record.raw as ServiceAuthorization;
  const unitsRemaining = auth.unitsAuthorized - auth.unitsUsed;
  const pctUsed = auth.unitsAuthorized > 0 ? Math.round((auth.unitsUsed / auth.unitsAuthorized) * 100) : 0;

  if (tab === "overview") {
    return (
      <div className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoCard label="Service" value={auth.serviceLabel} />
          <InfoCard label="Service code" value={auth.serviceCode} />
          <InfoCard label="Rate" value={`$${auth.rate}/unit`} />
          <InfoCard label="Units authorized" value={String(auth.unitsAuthorized)} />
          <InfoCard label="Units used" value={String(auth.unitsUsed)} />
          <InfoCard label="Units remaining" value={String(unitsRemaining)} />
          <InfoCard label="Start date" value={new Date(auth.startDate).toLocaleDateString()} />
          <InfoCard label="End date" value={new Date(auth.endDate).toLocaleDateString()} />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-ink/60">
            <span>Unit utilization</span>
            <span className={pctUsed >= 90 ? "text-red-600 font-semibold" : ""}>{pctUsed}%</span>
          </div>
          <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${pctUsed >= 90 ? "bg-red-500" : pctUsed >= 70 ? "bg-amber-500" : "bg-accent"}`} style={{ width: `${pctUsed}%` }} />
          </div>
        </div>
      </div>
    );
  }
  if (tab === "notes") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-ink/55 italic">
          Progress notes for authorization {auth.id}. Upload session notes and
          documentation to maintain the service record.
        </p>
        <ActionLink href={`/vendor-portal/orders/${auth.id}`} label="View service order details" />
      </div>
    );
  }
  // Actions
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <ActionLink href={`/vendor-portal/orders/${auth.id}`} label="View service order" />
      <ActionLink href="/vendor-portal/services" label="Service catalog" />
      <ActionLink href="/messages" label="Message counselor" />
      {auth.status === "active" && (
        <div className="border border-accent/30 bg-accent/5 rounded-md px-4 py-3 text-sm text-accent">
          Invoice auto-triggers when units are exhausted or authorization ends.
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ Business Detail Tabs ══════════════════════════════ */

function BusinessTabContent({ record, tab }: { record: MasterRecord; tab: DetailTab }) {
  const placement = record.raw as Placement;

  if (tab === "overview") {
    return (
      <div className="grid sm:grid-cols-2 gap-4">
        <InfoCard label="Job title" value={placement.jobTitle} />
        <InfoCard label="SOC code" value={placement.socCode || "N/A"} />
        <InfoCard label="Hire date" value={new Date(placement.hireDate).toLocaleDateString()} />
        <InfoCard label="Hourly wage" value={`$${placement.hourlyWage}`} />
        <InfoCard label="Weekly hours" value={String(placement.weeklyHours)} />
        <InfoCard label="Integrated setting" value={placement.integratedSetting ? "Yes" : "No"} />
        <InfoCard label="Accommodations in place" value={String(placement.accommodationsInPlace)} />
        <InfoCard label="Accommodations open" value={String(placement.accommodationsOpen)} />
        <InfoCard label="Day count" value={`${placement.dayCount} days`} />
        {placement.jobCoachName && <InfoCard label="Job coach" value={placement.jobCoachName} />}
      </div>
    );
  }
  if (tab === "timeline") {
    const stages = [
      { label: "Screening", done: true },
      { label: "Interviewing", done: ["active", "on-leave", "retained-90", "onboarding"].includes(placement.status) },
      { label: "Onboarding", done: ["active", "on-leave", "retained-90"].includes(placement.status) },
      { label: "Placed with Accommodations", done: ["active", "retained-90"].includes(placement.status) },
      { label: "90-Day Retention", done: placement.status === "retained-90" },
    ];
    return (
      <div className="space-y-3">
        {stages.map((s, i) => (
          <div key={s.label} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold flex-none ${s.done ? "bg-accent text-cream" : "bg-ink/10 text-ink/40"}`}>
              {s.done ? "\u2713" : i + 1}
            </div>
            <span className={`text-sm ${s.done ? "font-semibold text-ink" : "text-ink/50"}`}>{s.label}</span>
          </div>
        ))}
      </div>
    );
  }
  // Actions
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <ActionLink href={`/business-portal`} label="View dashboard" />
      <ActionLink href="/business-portal/accounts-payable" label="Accounts payable" />
      <ActionLink href="/business-portal/services" label="Request a service" />
      <ActionLink href="/messages" label="Message counselor" />
    </div>
  );
}

/* ═══════════════════════ UI Primitives ═════════════════════════════════ */

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/10 rounded-md p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/50">{label}</div>
      <div className="text-sm font-semibold text-ink mt-0.5">{value}</div>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="border border-ink/15 rounded-md px-4 py-3 text-sm font-medium text-ink hover:bg-accent/5 hover:border-accent/30 transition flex items-center gap-2">
      <span className="text-accent">&#8594;</span> {label}
    </Link>
  );
}

function RolePill({ role }: { role: ActiveRole }) {
  const config = {
    COUNSELOR: { label: "Counselor", color: "bg-accent/10 text-accent" },
    VENDOR: { label: "Vendor", color: "bg-amber-100 text-amber-800" },
    BUSINESS: { label: "Business", color: "bg-sky-100 text-sky-800" },
  };
  const c = config[role];
  return (
    <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded-full font-semibold flex-none ${c.color}`}>
      {c.label}
    </span>
  );
}

function EmptyDetail({ role }: { role: ActiveRole }) {
  const noun = role === "COUNSELOR" ? "a client" : role === "VENDOR" ? "an authorization" : "a candidate";
  return (
    <div className="h-full flex items-center justify-center text-center p-8">
      <div className="space-y-3 max-w-sm">
        <div className="text-4xl text-ink/20">&#8592;</div>
        <h3 className="text-lg font-semibold text-ink/40">Select {noun}</h3>
        <p className="text-sm text-ink/40">Choose a record from the list to view details, notes, and actions.</p>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-48 bg-ink/10 rounded" />
        <div className="h-4 w-32 bg-ink/10 rounded" />
      </div>
      <div className="h-8 w-64 bg-ink/10 rounded" />
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-ink/5 border border-ink/10 rounded-md" />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════ Badge colors ══════════════════════════════════ */

function stageBadgeColor(status: string): string {
  const m: Record<string, string> = {
    Intake: "bg-sky-100 text-sky-800",
    "Assessment Phase": "bg-amber-100 text-amber-800",
    "In Training": "bg-violet-100 text-violet-800",
    "Job Placement": "bg-emerald-100 text-emerald-800",
  };
  return m[status] ?? "bg-ink/10 text-ink/55";
}

function authBadgeColor(status: string): string {
  const m: Record<string, string> = {
    requested: "bg-sky-100 text-sky-800",
    approved: "bg-emerald-100 text-emerald-800",
    active: "bg-accent/10 text-accent",
    exhausted: "bg-amber-100 text-amber-800",
    denied: "bg-red-100 text-red-800",
    revoked: "bg-ink/10 text-ink/55",
  };
  return m[status] ?? "bg-ink/10 text-ink/55";
}

function placementBadgeColor(status: string): string {
  const m: Record<string, string> = {
    onboarding: "bg-sky-100 text-sky-800",
    active: "bg-emerald-100 text-emerald-800",
    "on-leave": "bg-amber-100 text-amber-800",
    separated: "bg-red-100 text-red-800",
    "retained-90": "bg-accent/10 text-accent",
  };
  return m[status] ?? "bg-ink/10 text-ink/55";
}

function placementLabel(status: string): string {
  const m: Record<string, string> = {
    onboarding: "Onboarding",
    active: "Placed",
    "on-leave": "On Leave",
    separated: "Separated",
    "retained-90": "90-Day Retained",
  };
  return m[status] ?? status;
}
