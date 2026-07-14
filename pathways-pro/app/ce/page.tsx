"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import {
  CE_CATALOG,
  CATEGORY_LABELS,
  addCELog,
  computeCycleProgress,
  loadCELog,
  removeCELog,
  type CECategory,
  type CECourse,
  type CELogEntry,
} from "@/lib/ce";

type Tab = "library" | "log";

export default function CEPage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [log, setLog] = useState<CELogEntry[]>([]);
  const [tab, setTab] = useState<Tab>("library");
  const [filter, setFilter] = useState<CECategory | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
    setLog(loadCELog(s.email));
  }, [router]);

  const completedIds = useMemo(
    () => new Set(log.map((e) => e.courseId)),
    [log],
  );

  const cycle = useMemo(() => computeCycleProgress(log), [log]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CE_CATALOG.filter((c) => {
      if (filter !== "all" && c.category !== filter) return false;
      if (q && !`${c.title} ${c.provider} ${c.description}`.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [filter, query]);

  if (!user) return null;

  function markComplete(course: CECourse) {
    if (!user) return;
    const entry: CELogEntry = {
      courseId: course.id,
      completedAt: new Date().toISOString(),
      hoursEarned: course.hours,
    };
    addCELog(user.email, entry);
    setLog(loadCELog(user.email));
  }

  function unlog(entry: CELogEntry) {
    if (!user) return;
    if (!confirm("Remove this CE entry from your log?")) return;
    removeCELog(user.email, entry.completedAt);
    setLog(loadCELog(user.email));
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Continuing Education · {user.credentials}
        </p>
        <h1 className="text-4xl">CE Tracker</h1>
        <p className="text-ink/70 mt-2 max-w-2xl text-sm">
          Browse CRC-approved CE through Pathways Pro and your hours
          auto-track toward your renewal cycle. CRCC requires 100 hours every
          5 years, including at least 10 hours of ethics.
        </p>
      </header>

      <CycleProgress cycle={cycle} log={log} />

      <div className="flex gap-1 bg-ink/5 p-1 rounded-md w-fit">
        <TabBtn active={tab === "library"} onClick={() => setTab("library")}>
          CE Library · {CE_CATALOG.length}
        </TabBtn>
        <TabBtn active={tab === "log"} onClick={() => setTab("log")}>
          My Log · {log.length}
        </TabBtn>
      </div>

      {tab === "library" && (
        <>
          <div className="flex gap-3 flex-wrap items-center">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, provider, topic…"
              className="flex-1 min-w-[200px] bg-cream border border-ink/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as CECategory | "all")}
              className="bg-cream border border-ink/15 rounded px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              <option value="all">All categories</option>
              {(Object.entries(CATEGORY_LABELS) as [CECategory, string][]).map(
                ([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ),
              )}
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {filtered.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                completed={completedIds.has(c.id)}
                onComplete={() => markComplete(c)}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center text-ink/50 py-8">No CE matches.</p>
          )}
        </>
      )}

      {tab === "log" && <LogTable log={log} onRemove={unlog} />}
    </div>
  );
}

function CycleProgress({
  cycle,
  log,
}: {
  cycle: ReturnType<typeof computeCycleProgress>;
  log: CELogEntry[];
}) {
  const pct = Math.min(100, (cycle.totalEarned / cycle.totalRequired) * 100);
  const ethicsPct = Math.min(
    100,
    (cycle.ethicsEarned / cycle.ethicsRequired) * 100,
  );
  const recent = log.length > 0 ? log[0] : null;

  return (
    <section className="border border-ink/15 rounded-lg p-5 bg-cream">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-semibold">
          {cycle.cycleName} · {cycle.daysRemaining} days remaining
        </h2>
        <p className="text-xs text-ink/60">
          Cycle ends {new Date(cycle.cycleEnds).toLocaleDateString()}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <ProgressBar
          label="Total CE hours"
          earned={cycle.totalEarned}
          required={cycle.totalRequired}
          pct={pct}
        />
        <ProgressBar
          label="Ethics hours (within total)"
          earned={cycle.ethicsEarned}
          required={cycle.ethicsRequired}
          pct={ethicsPct}
          accent="amber"
        />
      </div>

      {recent && (
        <p className="text-xs text-ink/50 mt-4">
          Last logged: {recent.hoursEarned} hrs on{" "}
          {new Date(recent.completedAt).toLocaleDateString()}
        </p>
      )}
    </section>
  );
}

function ProgressBar({
  label,
  earned,
  required,
  pct,
  accent = "accent",
}: {
  label: string;
  earned: number;
  required: number;
  pct: number;
  accent?: "accent" | "amber";
}) {
  const barClass = accent === "amber" ? "bg-amber-500" : "bg-accent";
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-ink/70">{label}</span>
        <span className="font-semibold">
          {earned} / {required} hrs
        </span>
      </div>
      <div className="h-3 bg-ink/10 rounded-full overflow-hidden">
        <div
          className={`h-full ${barClass} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-xs text-ink/50 mt-1">
        {earned >= required
          ? "✓ Requirement met"
          : `${required - earned} hrs to go`}
      </div>
    </div>
  );
}

function TabBtn({
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
      className={`px-3 py-1.5 text-sm rounded ${
        active ? "bg-cream shadow-sm text-accent font-semibold" : "text-ink/60"
      }`}
    >
      {children}
    </button>
  );
}

function CourseCard({
  course,
  completed,
  onComplete,
}: {
  course: CECourse;
  completed: boolean;
  onComplete: () => void;
}) {
  return (
    <article
      className={`border rounded-lg p-4 bg-cream transition ${
        completed ? "border-green-300" : "border-ink/15"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h3 className="font-semibold">{course.title}</h3>
        <span className="text-xs text-accent uppercase tracking-wider whitespace-nowrap">
          {course.hours} hrs
        </span>
      </div>
      <div className="text-xs text-ink/60 mb-2">
        {course.provider} · {CATEGORY_LABELS[course.category]} ·{" "}
        {course.format}
      </div>
      <p className="text-sm text-ink/80 mb-3">{course.description}</p>
      <div className="flex items-center justify-between gap-3 text-xs text-ink/60 mb-3">
        <span>Cost: {course.cost}</span>
        <span>
          {course.crcApproved && "CRC ✓"}
          {course.lpcIllinoisApproved && " · LPC-IL ✓"}
        </span>
      </div>
      <div className="flex gap-2 text-sm">
        <a
          href={course.url}
          target="_blank"
          rel="noreferrer"
          className="border border-ink/20 px-3 py-1.5 rounded hover:border-accent"
        >
          Open course ↗
        </a>
        {completed ? (
          <span className="bg-green-100 text-green-800 text-xs uppercase tracking-wider px-3 py-1.5 rounded font-semibold">
            ✓ Logged
          </span>
        ) : (
          <button
            onClick={onComplete}
            className="bg-accent text-cream px-3 py-1.5 rounded font-semibold"
          >
            Mark complete
          </button>
        )}
      </div>
    </article>
  );
}

function LogTable({
  log,
  onRemove,
}: {
  log: CELogEntry[];
  onRemove: (e: CELogEntry) => void;
}) {
  if (log.length === 0) {
    return (
      <div className="border border-dashed border-ink/20 rounded-lg p-8 text-center text-ink/50">
        No CE logged yet. Mark a course complete from the Library tab and it
        will appear here, with hours counting toward your renewal cycle.
      </div>
    );
  }
  return (
    <div className="border border-ink/10 rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-ink/5 text-xs uppercase tracking-wider text-ink/60">
          <tr>
            <th className="text-left px-4 py-3">Course</th>
            <th className="text-left px-4 py-3">Provider</th>
            <th className="text-left px-4 py-3">Category</th>
            <th className="text-left px-4 py-3">Hours</th>
            <th className="text-left px-4 py-3">Completed</th>
            <th className="text-left px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {log.map((e) => {
            const c = CE_CATALOG.find((x) => x.id === e.courseId);
            return (
              <tr key={e.completedAt} className="border-t border-ink/10 bg-cream">
                <td className="px-4 py-3 font-semibold">
                  {c?.title ?? e.courseId}
                </td>
                <td className="px-4 py-3 text-ink/70">{c?.provider ?? "—"}</td>
                <td className="px-4 py-3 text-ink/70">
                  {c ? CATEGORY_LABELS[c.category] : "—"}
                </td>
                <td className="px-4 py-3 text-accent font-semibold">
                  {e.hoursEarned}
                </td>
                <td className="px-4 py-3 text-ink/70">
                  {new Date(e.completedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onRemove(e)}
                    className="text-xs text-ink/50 hover:text-accent"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
