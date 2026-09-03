"use client";

// Component A — Progress Metric Bar. Three quick-scan stat cards:
// total progress (circular), completed count, and "up next" with a resume CTA.

import type { CourseSummary } from "@/lib/courses-data";

function CircularProgress({ pct }: { pct: number }) {
  const size = 76;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Overall completion ${pct} percent`}
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-ink/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="text-accent transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-lg font-bold text-ink">
        {pct}%
      </span>
    </div>
  );
}

export default function CourseProgressSummary({
  summary,
  onResume,
}: {
  summary: CourseSummary;
  onResume?: (moduleId: string) => void;
}) {
  const { totalProgressPct, completedCount, totalCount, upNext } = summary;

  return (
    <section aria-label="Your training progress" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* Card 1 — total progress */}
      <div className="saas-card flex items-center gap-4">
        <CircularProgress pct={totalProgressPct} />
        <div>
          <p className="text-xs uppercase tracking-wider text-ink/55">Total progress</p>
          <p className="text-2xl font-semibold text-ink leading-tight">{totalProgressPct}%</p>
          <p className="text-xs text-ink/60">across all training</p>
        </div>
      </div>

      {/* Card 2 — completed modules */}
      <div className="saas-card flex flex-col justify-center">
        <p className="text-xs uppercase tracking-wider text-ink/55">Completed modules</p>
        <p className="text-3xl font-semibold text-ink leading-tight mt-1">
          {completedCount} <span className="text-ink/40 text-xl">/ {totalCount}</span>
        </p>
        <p className="text-xs text-ink/60 mt-0.5">
          {completedCount === totalCount ? "All modules finished 🎉" : "modules finished"}
        </p>
      </div>

      {/* Card 3 — up next */}
      <div className="saas-card flex flex-col justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink/55">Up next</p>
          {upNext ? (
            <>
              <p className="font-semibold text-ink leading-snug mt-1 line-clamp-2">
                {upNext.lesson.title}
              </p>
              <p className="text-xs text-ink/60 mt-0.5">
                {upNext.module.title} · {upNext.lesson.durationMin} min
              </p>
            </>
          ) : (
            <p className="font-semibold text-ink mt-1">You&rsquo;re all caught up 🎉</p>
          )}
        </div>
        {upNext && (
          <button
            onClick={() => onResume?.(upNext.module.id)}
            className="min-h-[44px] px-4 rounded-md grad-tealblue text-white text-sm font-semibold self-start focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            ▶ Resume lesson
          </button>
        )}
      </div>
    </section>
  );
}
