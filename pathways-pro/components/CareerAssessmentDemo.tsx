"use client";

// A free, no-login taste of the Pathways Pro assessment experience, embedded in
// the Course 1 "Interactive activities" section. It runs two real instruments —
// the O*NET-style RIASEC Interest Profiler and the Mini-IPIP Big Five personality
// inventory — and scores them instantly with the same library the full app uses.

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  bigFiveItems,
  riasecItems,
  scoreBigFive,
  scoreRiasec,
  hollandCode,
  traitNames,
  riasecNames,
  type BigFiveTrait,
  type RiasecType,
} from "@/lib/assessments";
import { RIASEC_PROFILES } from "@/lib/holland-analysis";

const INTEREST_SCALE = [
  { v: 1, label: "Strongly dislike" },
  { v: 2, label: "Dislike" },
  { v: 3, label: "Unsure" },
  { v: 4, label: "Like" },
  { v: 5, label: "Strongly like" },
];

const AGREE_SCALE = [
  { v: 1, label: "Disagree" },
  { v: 2, label: "Slightly disagree" },
  { v: 3, label: "Neutral" },
  { v: 4, label: "Slightly agree" },
  { v: 5, label: "Agree" },
];

const TRAIT_BLURB: Record<BigFiveTrait, { high: string; low: string }> = {
  E: {
    high: "Outgoing and energized by people — thrives in team-facing, client-contact roles.",
    low: "Reserved and focused — does deep, independent work well.",
  },
  A: {
    high: "Cooperative and compassionate — a natural fit for helping and service work.",
    low: "Direct and candid — comfortable with negotiation and tough calls.",
  },
  C: {
    high: "Organized and dependable — strong with plans, deadlines, and detail.",
    low: "Flexible and spontaneous — adapts easily when priorities shift.",
  },
  N: {
    high: "Emotionally sensitive — reads situations deeply; benefits from steady, low-chaos environments.",
    low: "Calm and resilient — steady under pressure and change.",
  },
  O: {
    high: "Curious and creative — drawn to variety, ideas, and new approaches.",
    low: "Practical and concrete — prefers proven methods and clear expectations.",
  },
};

type Answers = Record<string, number>;

export function CareerAssessmentDemo() {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);

  const totalItems = riasecItems.length + bigFiveItems.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalItems;

  function setAnswer(id: string, v: number) {
    setAnswers((prev) => ({ ...prev, [id]: v }));
  }

  const results = useMemo(() => {
    if (!submitted) return null;
    const riasec = scoreRiasec(answers);
    const code = hollandCode(riasec);
    const big = scoreBigFive(answers);
    const topType = code[0] as RiasecType;
    return { riasec, code, big, topType };
  }, [submitted, answers]);

  function handleSubmit() {
    setSubmitted(true);
    // Move focus/scroll to results on the next paint.
    requestAnimationFrame(() => {
      document.getElementById("assessment-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleReset() {
    setAnswers({});
    setSubmitted(false);
    requestAnimationFrame(() => {
      document.getElementById("assessment-top")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  return (
    <div id="assessment-top" className="space-y-8">
      <div className="saas-card !bg-accent/5 border-accent/30 space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">
          Free Pathways Pro experience · no sign-up
        </p>
        <h3 className="text-2xl tracking-tight">Try the assessments yourself</h3>
        <p className="text-ink/75 prose-narrow">
          Take the same two instruments Pathways Pro uses with clients — the{" "}
          <strong>Interest Profiler</strong> (RIASEC) and the{" "}
          <strong>Personality Inventory</strong> (Big Five / Mini-IPIP) — and get
          your results instantly. Whether you&apos;re advancing your own career or
          exploring the platform, this is a real taste of what clients and
          counselors experience inside Pathways Pro.
        </p>
      </div>

      {/* Interest Profiler */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h4 className="text-xl tracking-tight">1 · Interest Profiler</h4>
          <span className="text-xs uppercase tracking-wider text-ink/50">
            How much would you enjoy each activity?
          </span>
        </div>
        <div className="space-y-3">
          {riasecItems.map((item, i) => (
            <ItemRow
              key={item.id}
              n={i + 1}
              text={item.text}
              scale={INTEREST_SCALE}
              value={answers[item.id]}
              onChange={(v) => setAnswer(item.id, v)}
            />
          ))}
        </div>
      </section>

      {/* Personality Inventory */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h4 className="text-xl tracking-tight">2 · Personality Inventory</h4>
          <span className="text-xs uppercase tracking-wider text-ink/50">
            How much do you agree? · &ldquo;I…&rdquo;
          </span>
        </div>
        <div className="space-y-3">
          {bigFiveItems.map((item, i) => (
            <ItemRow
              key={item.id}
              n={i + 1}
              text={item.text}
              scale={AGREE_SCALE}
              value={answers[item.id]}
              onChange={(v) => setAnswer(item.id, v)}
            />
          ))}
        </div>
      </section>

      {/* Submit bar */}
      <div className="sticky bottom-0 bg-cream/95 backdrop-blur border-t border-ink/10 py-3 flex items-center justify-between gap-4 flex-wrap">
        <span className="text-sm text-ink/60 tabular-nums">
          {answeredCount} / {totalItems} answered
        </span>
        <div className="flex gap-2">
          {submitted && (
            <button
              onClick={handleReset}
              className="text-sm border border-ink/20 px-4 py-2.5 rounded-md hover:bg-ink/5"
            >
              Start over
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={answeredCount === 0}
            className="bg-accent text-cream font-semibold px-6 py-2.5 rounded-md hover:bg-accent/90 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {allAnswered ? "See my results →" : "See results so far →"}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div id="assessment-results" className="space-y-6 scroll-mt-6">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-accent">
              Your results
            </p>
            <h3 className="text-3xl tracking-tight">
              Holland Code:{" "}
              <span className="text-accent font-semibold">{results.code}</span>
            </h3>
            {!allAnswered && (
              <p className="text-sm text-ink/60">
                Based on the {answeredCount} question
                {answeredCount === 1 ? "" : "s"} you answered — finish the rest
                for a sharper profile.
              </p>
            )}
          </header>

          {/* Top interest narrative */}
          <div className="saas-card space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 grid place-items-center rounded-md bg-accent text-cream font-bold">
                {results.topType}
              </span>
              <div>
                <div className="text-lg font-semibold text-ink">
                  {RIASEC_PROFILES[results.topType].name} ·{" "}
                  <span className="text-ink/60">
                    {RIASEC_PROFILES[results.topType].shortName}
                  </span>
                </div>
                <div className="text-xs uppercase tracking-wider text-ink/50">
                  Your strongest interest area
                </div>
              </div>
            </div>
            <p className="text-ink/80 prose-narrow">
              {RIASEC_PROFILES[results.topType].description}
            </p>
            <p className="text-sm text-ink/70">
              <span className="font-semibold text-ink">Work style: </span>
              {RIASEC_PROFILES[results.topType].workStyle}
            </p>
            <div>
              <div className="text-xs uppercase tracking-wider text-ink/50 mb-1">
                Career categories that often fit
              </div>
              <div className="flex flex-wrap gap-2">
                {RIASEC_PROFILES[results.topType].jobCategories.map((j) => (
                  <span
                    key={j}
                    className="text-sm border border-ink/15 bg-cream rounded-full px-3 py-1 text-ink/80"
                  >
                    {j}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Interest bars */}
          <div className="saas-card space-y-3">
            <h4 className="text-lg font-semibold text-ink">
              Interest Profiler (RIASEC)
            </h4>
            {(Object.keys(results.riasec) as RiasecType[]).map((t) => (
              <Bar
                key={t}
                label={riasecNames[t]}
                value={results.riasec[t]}
                highlight={results.code.includes(t)}
              />
            ))}
          </div>

          {/* Personality bars */}
          <div className="saas-card space-y-3">
            <h4 className="text-lg font-semibold text-ink">
              Personality Inventory (Big Five)
            </h4>
            {(Object.keys(results.big) as BigFiveTrait[]).map((t) => {
              const val = results.big[t];
              const blurb = val >= 50 ? TRAIT_BLURB[t].high : TRAIT_BLURB[t].low;
              return (
                <div key={t} className="space-y-1">
                  <Bar label={traitNames[t]} value={val} />
                  <p className="text-xs text-ink/55 pl-1">{blurb}</p>
                </div>
              );
            })}
          </div>

          {/* CTA into the full experience */}
          <div className="saas-card !bg-accent/5 border-accent/30 space-y-3">
            <h4 className="text-xl tracking-tight">
              This is just the start of the Pathways Pro experience
            </h4>
            <p className="text-ink/75 prose-narrow">
              Inside Pathways Pro, results like these become matched career paths
              with live labor-market data, a signature-ready plan, transferable-
              skills analysis, and more. Explore the full client experience:
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/intake"
                className="bg-accent text-cream font-semibold px-6 py-3 rounded-md hover:bg-accent/90 transition"
              >
                Find my path →
              </Link>
              <Link
                href="/assessment"
                className="border border-accent text-accent font-semibold px-6 py-3 rounded-md hover:bg-accent/5 transition"
              >
                Full Interest Profiler
              </Link>
              <Link
                href="/careers"
                className="text-ink/70 px-6 py-3 hover:text-accent transition"
              >
                Explore careers →
              </Link>
            </div>
            <p className="text-xs text-ink/50">
              This free preview scores your responses in your browser. Sign in to
              save results, generate a full report, and build an individualized
              plan.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ItemRow({
  n,
  text,
  scale,
  value,
  onChange,
}: {
  n: number;
  text: string;
  scale: { v: number; label: string }[];
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <div className="border border-ink/10 rounded-lg bg-white px-4 py-3">
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xs text-ink/40 tabular-nums mt-0.5">{n}.</span>
        <span className="text-ink/85">{text}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {scale.map((opt) => {
          const active = value === opt.v;
          return (
            <button
              key={opt.v}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(opt.v)}
              className={`text-xs px-2.5 py-1.5 rounded-md border transition ${
                active
                  ? "bg-accent text-cream border-accent"
                  : "border-ink/15 text-ink/60 hover:border-accent/50 hover:text-ink"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Bar({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className={highlight ? "font-semibold text-accent" : "text-ink/80"}>
          {label}
        </span>
        <span className="text-ink/50 tabular-nums">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-ink/10 overflow-hidden">
        <div
          className={`h-full rounded-full ${highlight ? "bg-accent" : "bg-ink/40"}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
