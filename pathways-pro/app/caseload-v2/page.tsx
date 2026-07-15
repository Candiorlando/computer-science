"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import {
  getCounselorClients,
  type ClientUser,
  type CounselorUser,
} from "@/lib/users";
import { useDebounce } from "@/lib/use-debounce";
import { notesForClient, loadCaseNotes } from "@/lib/case-notes";
import { loadIPE, type IPE } from "@/lib/ipe";

/* ═══════════════════════════════════════════════════════════════════════
   Master-Detail Caseload Dashboard
   - Left panel: searchable, keyboard-navigable client list
   - Right panel: selected client's detail view with tabs
   - Omnibar: fuzzy search across name, case ID, and phone
   - Responsive: collapses to single-pane drawer on tablet
   - WCAG 2.1 AA: aria-selected, keyboard nav, focus management
═══════════════════════════════════════════════════════════════════════ */

type DetailTab = "overview" | "timeline" | "notes" | "actions";

export default function CaseloadSplitView() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [detailTab, setDetailTab] = useState<DetailTab>("overview");
  const [detailLoading, setDetailLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 200);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const clients = useMemo(() => {
    if (!user) return [];
    return getCounselorClients(user);
  }, [user]);

  // ── Fuzzy search across name, case ID, phone ──────────────────────
  const filtered = useMemo(() => {
    if (!debouncedQuery) return clients;
    const q = debouncedQuery.toLowerCase();
    const digits = q.replace(/[\s\-\(\)\.]/g, "");

    return clients.filter((c) => {
      // Name match (first + last)
      if (c.name.toLowerCase().includes(q)) return true;
      // Case ID match
      if (c.caseId.toLowerCase().includes(q)) return true;
      // Phone match (strip formatting, match digits)
      if (digits.length >= 3) {
        const phone = (c as ClientUser & { phone?: string }).phone;
        if (phone && phone.replace(/\D/g, "").includes(digits)) return true;
      }
      // Goal match (bonus)
      if (c.goal.toLowerCase().includes(q)) return true;
      return false;
    });
  }, [clients, debouncedQuery]);

  const selectedClient = useMemo(
    () => clients.find((c) => c.caseId === selectedId) ?? null,
    [clients, selectedId],
  );

  // ── Keyboard navigation ───────────────────────────────────────────
  const focusedIndex = useMemo(
    () => filtered.findIndex((c) => c.caseId === selectedId),
    [filtered, selectedId],
  );

  const selectClient = useCallback(
    (caseId: string) => {
      setDetailLoading(true);
      setSelectedId(caseId);
      setDetailTab("overview");
      // Simulate data fetch latency
      setTimeout(() => setDetailLoading(false), 150);
    },
    [],
  );

  function handleListKeyDown(e: React.KeyboardEvent) {
    if (filtered.length === 0) return;
    let nextIndex = focusedIndex;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        nextIndex = Math.min(focusedIndex + 1, filtered.length - 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        nextIndex = Math.max(focusedIndex - 1, 0);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0) selectClient(filtered[focusedIndex].caseId);
        return;
      case "Escape":
        e.preventDefault();
        setSelectedId(null);
        return;
      default:
        return;
    }

    if (nextIndex !== focusedIndex && nextIndex >= 0) {
      selectClient(filtered[nextIndex].caseId);
      // Scroll into view
      const el = listRef.current?.querySelector(`[data-index="${nextIndex}"]`);
      el?.scrollIntoView({ block: "nearest" });
    }
  }

  // ── Mobile: show detail as overlay when client selected ───────────
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  useEffect(() => {
    if (selectedId) setMobileShowDetail(true);
  }, [selectedId]);

  if (!user) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -mx-6 md:-mx-10 -my-8">
      {/* ── Omnibar ──────────────────────────────────────────────── */}
      <div className="border-b border-ink/10 bg-cream px-4 py-3 flex-none">
        <div className="max-w-6xl mx-auto relative">
          <label htmlFor="case-search" className="sr-only">
            Search cases by name, case ID, or phone number
          </label>
          <input
            id="case-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, case ID, or phone..."
            className="w-full bg-white border border-ink/20 rounded-lg px-4 py-2.5 text-sm pl-10 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            autoComplete="off"
          />
          <svg
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {query && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink/50">
              {filtered.length} result{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* ── Split layout ─────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Master: client list */}
        <div
          ref={listRef}
          role="listbox"
          aria-label="Client caseload"
          tabIndex={0}
          onKeyDown={handleListKeyDown}
          className={`w-full md:w-80 lg:w-96 flex-none border-r border-ink/10 overflow-y-auto bg-cream focus:outline-none ${
            mobileShowDetail ? "hidden md:block" : ""
          }`}
        >
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-ink/55 italic">
              {query
                ? "No cases match your search."
                : "No cases on your caseload."}
            </div>
          ) : (
            filtered.map((client, index) => (
              <button
                key={client.caseId}
                data-index={index}
                role="option"
                aria-selected={client.caseId === selectedId}
                onClick={() => selectClient(client.caseId)}
                className={`w-full text-left px-4 py-3 border-b border-ink/10 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px] ${
                  client.caseId === selectedId
                    ? "bg-accent/10 border-l-[3px] border-l-accent"
                    : "hover:bg-ink/[0.03] border-l-[3px] border-l-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink truncate">
                      {client.name}
                    </div>
                    <div className="text-xs text-ink/55 font-mono">
                      {client.caseId}
                    </div>
                  </div>
                  <WorkflowBadge status={client.status} />
                </div>
                <div className="text-xs text-ink/50 mt-1 truncate">
                  {client.goal}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Detail panel */}
        <div
          className={`flex-1 min-w-0 overflow-y-auto bg-white ${
            !mobileShowDetail ? "hidden md:block" : ""
          }`}
        >
          {!selectedClient ? (
            <EmptyDetail />
          ) : detailLoading ? (
            <DetailSkeleton />
          ) : (
            <DetailPanel
              client={selectedClient}
              tab={detailTab}
              onTabChange={setDetailTab}
              onBack={() => {
                setMobileShowDetail(false);
                setSelectedId(null);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════ Detail Panel ══════════════════════════════════ */

function DetailPanel({
  client,
  tab,
  onTabChange,
  onBack,
}: {
  client: ClientUser;
  tab: DetailTab;
  onTabChange: (t: DetailTab) => void;
  onBack: () => void;
}) {
  const notes = useMemo(() => {
    loadCaseNotes();
    return notesForClient(client.caseId);
  }, [client.caseId]);

  const ipe = useMemo(() => loadIPE(client.caseId), [client.caseId]);

  const tabs: { key: DetailTab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "timeline", label: "Timeline" },
    { key: "notes", label: `Notes (${notes.length})` },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Mobile back button */}
      <button
        onClick={onBack}
        className="md:hidden text-xs text-accent hover:underline mb-2"
      >
        &#8592; Back to list
      </button>

      {/* Client header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {client.name}
          </h2>
          <div className="flex items-center gap-3 mt-1 text-sm text-ink/60">
            <span className="font-mono">{client.caseId}</span>
            <WorkflowBadge status={client.status} />
          </div>
          <div className="text-sm text-ink/70 mt-1">
            Goal: {client.goal}
          </div>
        </div>
        <Link
          href={`/case/${client.caseId}`}
          className="text-xs bg-accent text-cream font-semibold px-4 py-2 rounded-md hover:bg-accent/90 transition"
        >
          Open full case file
        </Link>
      </header>

      {/* Tabs */}
      <nav
        role="tablist"
        aria-label="Case detail tabs"
        className="flex gap-1 border-b border-ink/10"
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => onTabChange(t.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition ${
              tab === t.key
                ? "border-accent text-accent"
                : "border-transparent text-ink/55 hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div role="tabpanel" aria-label={`${tab} tab content`}>
        {tab === "overview" && (
          <OverviewTab client={client} ipe={ipe} notesCount={notes.length} />
        )}
        {tab === "timeline" && <TimelineTab client={client} />}
        {tab === "notes" && <NotesTab notes={notes} caseId={client.caseId} />}
        {tab === "actions" && <ActionsTab client={client} />}
      </div>
    </div>
  );
}

/* ═══════════════════════ Tab Content ══════════════════════════════════ */

function OverviewTab({
  client,
  ipe,
  notesCount,
}: {
  client: ClientUser;
  ipe: IPE | null;
  notesCount: number;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <InfoCard label="Date of birth" value={client.dob} />
      <InfoCard label="Counselor" value={client.counselorName} />
      <InfoCard label="Next appointment" value={client.nextAppt} />
      <InfoCard label="Progress" value={`${client.progress}%`} />
      <InfoCard label="Case notes" value={String(notesCount)} />
      <InfoCard
        label="IPE status"
        value={ipe ? "Drafted" : "Not started"}
      />
    </div>
  );
}

function TimelineTab({ client }: { client: ClientUser }) {
  const stages = [
    { label: "Intake", done: true },
    {
      label: "Assessment Phase",
      done: ["Assessment Phase", "In Training", "Job Placement"].includes(
        client.status,
      ),
    },
    {
      label: "In Training",
      done: ["In Training", "Job Placement"].includes(client.status),
    },
    { label: "Job Placement", done: client.status === "Job Placement" },
  ];

  return (
    <div className="space-y-3">
      {stages.map((s, i) => (
        <div key={s.label} className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-full grid place-items-center text-sm font-bold flex-none ${
              s.done
                ? "bg-accent text-cream"
                : "bg-ink/10 text-ink/40"
            }`}
          >
            {s.done ? "\u2713" : i + 1}
          </div>
          <div
            className={`text-sm ${
              s.done ? "font-semibold text-ink" : "text-ink/50"
            }`}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function NotesTab({
  notes,
  caseId,
}: {
  notes: { id: string; content: string; createdAt: string; author: string }[];
  caseId: string;
}) {
  if (notes.length === 0) {
    return (
      <div className="text-sm text-ink/55 italic py-4">
        No case notes yet.{" "}
        <Link
          href={`/case/${caseId}?tab=case-notes`}
          className="text-accent underline"
        >
          Add one in the full case file.
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {notes.slice(0, 5).map((n) => (
        <div
          key={n.id}
          className="border border-ink/10 rounded-md p-3 text-sm"
        >
          <div className="flex justify-between text-xs text-ink/50 mb-1">
            <span>{n.author}</span>
            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="text-ink/80 line-clamp-3">{n.content}</p>
        </div>
      ))}
      {notes.length > 5 && (
        <Link
          href={`/case/${caseId}?tab=case-notes`}
          className="text-xs text-accent hover:underline"
        >
          View all {notes.length} notes in full case file &#8594;
        </Link>
      )}
    </div>
  );
}

function ActionsTab({ client }: { client: ClientUser }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      <ActionLink
        href={`/case/${client.caseId}?tab=case-notes`}
        label="Add case note"
      />
      <ActionLink href={`/ipe?caseId=${client.caseId}`} label="Draft IPE" />
      <ActionLink
        href={`/case/${client.caseId}?tab=assessments`}
        label="Assign assessment"
      />
      <ActionLink
        href={`/case/${client.caseId}?tab=documents`}
        label="Upload document"
      />
      <ActionLink
        href={`/case/${client.caseId}/assign-service`}
        label="Request service"
      />
      <ActionLink href={`/messages`} label="Send message" />
    </div>
  );
}

/* ═══════════════════════ UI Primitives ═════════════════════════════════ */

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/10 rounded-md p-3">
      <div className="text-[10px] uppercase tracking-wider text-ink/50">
        {label}
      </div>
      <div className="text-sm font-semibold text-ink mt-0.5">{value}</div>
    </div>
  );
}

function ActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="border border-ink/15 rounded-md px-4 py-3 text-sm font-medium text-ink hover:bg-accent/5 hover:border-accent/30 transition flex items-center gap-2"
    >
      <span className="text-accent">&#8594;</span> {label}
    </Link>
  );
}

function WorkflowBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Intake: "bg-sky-100 text-sky-800",
    "Assessment Phase": "bg-amber-100 text-amber-800",
    "In Training": "bg-violet-100 text-violet-800",
    "Job Placement": "bg-emerald-100 text-emerald-800",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold whitespace-nowrap flex-none ${
        styles[status] ?? "bg-ink/10 text-ink/55"
      }`}
    >
      {status}
    </span>
  );
}

function EmptyDetail() {
  return (
    <div className="h-full flex items-center justify-center text-center p-8">
      <div className="space-y-3 max-w-sm">
        <div className="text-4xl text-ink/20">&#8592;</div>
        <h3 className="text-lg font-semibold text-ink/40">
          Select a client
        </h3>
        <p className="text-sm text-ink/40">
          Choose a case from the list to view their profile, timeline,
          notes, and actions.
        </p>
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
