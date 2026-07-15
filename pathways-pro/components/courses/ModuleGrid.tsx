"use client";

// Component B — Module Catalog Grid. Responsive cards with a status-driven
// action button (Start / Continue / Review).

import type { TrainingModule } from "@/lib/courses-data";

function ProgressLine({ pct, label }: { pct: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className="h-2 w-full rounded-full bg-ink/10 overflow-hidden"
    >
      <div
        className="h-full rounded-full grad-tealblue transition-[width] duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function CheckBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-full">
      <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z"
          clipRule="evenodd"
        />
      </svg>
      Completed
    </span>
  );
}

function ActionButton({
  module,
  onOpen,
}: {
  module: TrainingModule;
  onOpen: (id: string) => void;
}) {
  const base =
    "min-h-[44px] px-4 rounded-md text-sm font-semibold w-full focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-colors";
  if (module.status === "not_started") {
    return (
      <button onClick={() => onOpen(module.id)} className={`${base} grad-tealblue text-white`}>
        Start module
      </button>
    );
  }
  if (module.status === "in_progress") {
    return (
      <button
        onClick={() => onOpen(module.id)}
        className={`${base} border border-accent text-accent hover:bg-accent hover:text-cream`}
      >
        Continue lesson
      </button>
    );
  }
  return (
    <button
      onClick={() => onOpen(module.id)}
      className={`${base} border border-ink/20 text-ink hover:bg-ink/5`}
    >
      Review materials
    </button>
  );
}

export default function ModuleGrid({
  modules,
  onOpen,
}: {
  modules: TrainingModule[];
  onOpen: (moduleId: string) => void;
}) {
  return (
    <ul role="list" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {modules.map((m) => (
        <li key={m.id}>
          <article className="saas-card h-full flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-ink leading-snug">{m.title}</h3>
              {m.status === "completed" && <CheckBadge />}
            </div>

            <p className="text-sm text-ink/70 leading-relaxed flex-1">{m.description}</p>

            <div className="flex items-center justify-between text-xs text-ink/60">
              <span className="inline-flex items-center gap-1">
                <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.3.7l2.5 2.5a1 1 0 001.4-1.4L11 9.6V6z"
                    clipRule="evenodd"
                  />
                </svg>
                {m.durationLabel}
              </span>
              <span>{m.progressPct}% complete</span>
            </div>

            <ProgressLine pct={m.progressPct} label={`${m.title} progress: ${m.progressPct}%`} />

            <ActionButton module={m} onOpen={onOpen} />
          </article>
        </li>
      ))}
    </ul>
  );
}
