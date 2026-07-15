"use client";

// Component C — Learning Viewport. Left: sticky accordion of modules/lessons
// with completed/locked states. Right: 16:9 video + downloadable assets.

import { useMemo, useState } from "react";
import type { TrainingModule, Lesson, CourseAsset, AssetKind } from "@/lib/courses-data";

// ── icons ─────────────────────────────────────────────────────────────────
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="text-emerald-600 shrink-0" aria-hidden>
      <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className="text-ink/35 shrink-0" aria-hidden>
      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2h1a1 1 0 011 1v7a1 1 0 01-1 1H4a1 1 0 01-1-1v-7a1 1 0 011-1h1zm2 0h6V7a3 3 0 00-6 0v2z" clipRule="evenodd" />
    </svg>
  );
}
function DotIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className={active ? "text-accent shrink-0" : "text-ink/30 shrink-0"} aria-hidden>
      <circle cx="10" cy="10" r={active ? 5 : 3} />
    </svg>
  );
}
function FileIcon({ kind }: { kind: AssetKind }) {
  const tint =
    kind === "pdf" ? "text-red-600" : kind === "xlsx" ? "text-emerald-700" : "text-emerald-600";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={`${tint} shrink-0`} aria-hidden>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill="currentColor" opacity="0.12" />
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M10 3a1 1 0 011 1v7.6l2.3-2.3a1 1 0 011.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 011.4-1.4L9 11.6V4a1 1 0 011-1z" />
      <path d="M4 15a1 1 0 011 1v1h10v-1a1 1 0 112 0v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1a1 1 0 011-1z" />
    </svg>
  );
}

// ── viewer ─────────────────────────────────────────────────────────────────
export default function LessonViewer({
  modules,
  initialModuleId,
  onBack,
}: {
  modules: TrainingModule[];
  initialModuleId?: string;
  onBack?: () => void;
}) {
  const firstModule = modules.find((m) => m.id === initialModuleId) ?? modules[0];
  const firstPlayable =
    firstModule?.lessons.find((l) => l.status !== "locked") ?? firstModule?.lessons[0];

  const [openModules, setOpenModules] = useState<Set<string>>(
    () => new Set(firstModule ? [firstModule.id] : []),
  );
  const [selectedId, setSelectedId] = useState<string | undefined>(firstPlayable?.id);

  const selected = useMemo(() => {
    for (const m of modules) {
      const l = m.lessons.find((x) => x.id === selectedId);
      if (l) return { module: m, lesson: l };
    }
    return firstModule && firstPlayable ? { module: firstModule, lesson: firstPlayable } : null;
  }, [modules, selectedId, firstModule, firstPlayable]);

  function toggleModule(id: string) {
    setOpenModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      {/* Left — lesson navigation */}
      <nav aria-label="Course lessons" className="w-full md:w-1/3 md:sticky md:top-4 space-y-3">
        {onBack && (
          <button onClick={onBack} className="text-sm text-accent hover:underline min-h-[44px] inline-flex items-center">
            ← All modules
          </button>
        )}
        <ul role="list" className="space-y-2">
          {modules.map((m) => {
            const open = openModules.has(m.id);
            const done = m.lessons.filter((l) => l.status === "completed").length;
            return (
              <li key={m.id} className="saas-card p-0 overflow-hidden">
                <h3>
                  <button
                    aria-expanded={open}
                    aria-controls={`lessons-${m.id}`}
                    onClick={() => toggleModule(m.id)}
                    className="w-full flex items-center justify-between gap-2 px-4 py-3 min-h-[44px] text-left hover:bg-ink/5 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset"
                  >
                    <span className="font-semibold text-sm text-ink">{m.title}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-ink/50">{done}/{m.lessons.length}</span>
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" className={`text-ink/50 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden>
                        <path fillRule="evenodd" d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                </h3>
                {open && (
                  <ul id={`lessons-${m.id}`} role="list" className="border-t border-ink/10 divide-y divide-ink/5">
                    {m.lessons.map((l) => {
                      const isSel = selected?.lesson.id === l.id;
                      const locked = l.status === "locked";
                      return (
                        <li key={l.id}>
                          <button
                            disabled={locked}
                            aria-current={isSel ? "true" : undefined}
                            onClick={() => setSelectedId(l.id)}
                            className={[
                              "w-full flex items-center gap-2.5 px-4 py-2.5 min-h-[44px] text-left text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:ring-inset",
                              locked ? "text-ink/40 cursor-not-allowed" : "hover:bg-ink/5",
                              isSel ? "bg-accent/10 font-semibold text-ink" : "text-ink/80",
                            ].join(" ")}
                          >
                            {l.status === "completed" ? <CheckIcon /> : locked ? <LockIcon /> : <DotIcon active={isSel} />}
                            <span className="flex-1">{l.title}</span>
                            <span className="text-[11px] text-ink/45">{l.durationMin}m</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Right — workspace */}
      <div className="w-full md:w-2/3 space-y-5">
        {selected && (
          <>
            <div>
              <p className="text-xs uppercase tracking-wider text-accent">{selected.module.title}</p>
              <h2 className="text-xl font-semibold text-ink mt-1">{selected.lesson.title}</h2>
            </div>

            {/* 16:9 video */}
            <div className="relative w-full overflow-hidden rounded-xl border border-ink/15 bg-black" style={{ aspectRatio: "16 / 9" }}>
              {selected.lesson.videoUrl && selected.lesson.status !== "locked" ? (
                <iframe
                  title={`Video: ${selected.lesson.title}`}
                  src={selected.lesson.videoUrl}
                  allow="autoplay; fullscreen; picture-in-picture"
                  className="absolute inset-0 w-full h-full"
                />
              ) : (
                <div className="absolute inset-0 grid place-items-center text-white/70 text-sm gap-2">
                  <span className="text-3xl" aria-hidden>▶</span>
                  <span>Video loads here once this lesson unlocks.</span>
                </div>
              )}
            </div>

            {/* Assets */}
            <section aria-label="Lesson materials" className="space-y-2">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-ink/60">Downloadable materials</h3>
              <ul role="list" className="space-y-2">
                {selected.module.assets.map((a: CourseAsset) => (
                  <li key={a.id}>
                    <a
                      href={a.href}
                      download
                      className="saas-card flex items-center gap-3 hover:border-accent/50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <FileIcon kind={a.kind} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-ink truncate">{a.name}</span>
                        <span className="block text-xs text-ink/55 uppercase">.{a.kind} · {a.sizeLabel}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent shrink-0">
                        <DownloadIcon />
                        <span className="hidden sm:inline">Download</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
