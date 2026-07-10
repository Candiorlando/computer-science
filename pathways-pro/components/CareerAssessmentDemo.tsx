"use client";

// A free, no-login taste of the Pathways Pro assessment experience, embedded in
// the Course 1 "Interactive activities" section. It runs three real inputs —
// the O*NET-style RIASEC Interest Profiler, the Mini-IPIP Big Five personality
// inventory, and a short work-environment preferences check — and returns
// instant results: trait/interest bars plus best-fit "dream job" occupations.

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

// Work-environment preferences — optional, but they refine the job matches.
type PrefKey = "team" | "structure" | "setting" | "pace" | "contact" | "impact";
const PREFERENCES: {
  id: PrefKey;
  q: string;
  options: { v: string; label: string }[];
}[] = [
  {
    id: "team",
    q: "How do you prefer to work?",
    options: [
      { v: "team", label: "On a team" },
      { v: "mix", label: "A mix" },
      { v: "solo", label: "Independently" },
    ],
  },
  {
    id: "structure",
    q: "What kind of day suits you?",
    options: [
      { v: "structured", label: "Structured routine" },
      { v: "flexible", label: "Variety & flexibility" },
    ],
  },
  {
    id: "setting",
    q: "Where do you like to work?",
    options: [
      { v: "office", label: "Office / indoors" },
      { v: "field", label: "Out in the field" },
      { v: "remote", label: "Remote / flexible" },
    ],
  },
  {
    id: "pace",
    q: "What pace energizes you?",
    options: [
      { v: "steady", label: "Steady & predictable" },
      { v: "fast", label: "Fast & changing" },
    ],
  },
  {
    id: "contact",
    q: "How much people contact do you want?",
    options: [
      { v: "high", label: "Lots of people contact" },
      { v: "low", label: "Mostly focused solo work" },
    ],
  },
  {
    id: "impact",
    q: "What feels most rewarding?",
    options: [
      { v: "helping", label: "Helping people directly" },
      { v: "technical", label: "Solving technical problems" },
      { v: "leading", label: "Building or leading ventures" },
    ],
  },
];

// Curated "dream job" occupations tagged with their Holland interest areas and
// work-style traits, so matches reflect both interests and preferences. The
// vocational-rehabilitation roles are included so a helping/social profile
// surfaces this profession as one of its best matches.
type Occupation = {
  title: string;
  types: RiasecType[];
  helping?: boolean;
  leading?: boolean;
  technical?: boolean;
  team?: boolean;
  voc?: boolean; // a vocational-rehabilitation / counseling role
};

const OCCUPATIONS: Occupation[] = [
  // Social / helping — incl. vocational rehabilitation
  { title: "Vocational Rehabilitation Counselor", types: ["S", "I", "E"], helping: true, team: true, voc: true },
  { title: "Rehabilitation Counselor", types: ["S", "I"], helping: true, team: true, voc: true },
  { title: "Supported Employment Specialist", types: ["S", "E"], helping: true, team: true, voc: true },
  { title: "Case Manager", types: ["S", "C"], helping: true, team: true, voc: true },
  { title: "School Counselor", types: ["S", "A"], helping: true, team: true },
  { title: "Social Worker", types: ["S", "I"], helping: true, team: true },
  { title: "Speech-Language Pathologist", types: ["S", "I"], helping: true },
  { title: "Occupational Therapist", types: ["S", "R", "I"], helping: true },
  { title: "Registered Nurse", types: ["S", "I"], helping: true, team: true },
  { title: "Teacher / Instructor", types: ["S", "A"], helping: true, team: true },
  // Investigative
  { title: "Data Analyst", types: ["I", "C"], technical: true },
  { title: "Research Scientist", types: ["I", "R"], technical: true },
  { title: "Psychologist", types: ["I", "S"], helping: true, technical: true },
  { title: "Epidemiologist", types: ["I", "C"], technical: true },
  { title: "Software Developer", types: ["I", "C"], technical: true, team: true },
  // Realistic
  { title: "Civil Engineering Technician", types: ["R", "I"], technical: true, team: true },
  { title: "Electrician", types: ["R", "C"], technical: true },
  { title: "Physical Therapist Assistant", types: ["R", "S"], helping: true },
  // Artistic
  { title: "UX / Product Designer", types: ["A", "I"], technical: true, team: true },
  { title: "Graphic Designer", types: ["A", "E"] },
  { title: "Writer / Content Strategist", types: ["A", "I"] },
  { title: "Art Therapist", types: ["A", "S"], helping: true, voc: true },
  // Enterprising / leadership
  { title: "Program Manager", types: ["E", "C"], leading: true, team: true },
  { title: "Disability Inclusion Manager", types: ["E", "S"], leading: true, helping: true, team: true, voc: true },
  { title: "Business Consultant", types: ["E", "I"], leading: true },
  { title: "Human Resources Manager", types: ["E", "S", "C"], leading: true, team: true },
  { title: "Small-Business Owner / Entrepreneur", types: ["E", "A"], leading: true },
  // Conventional
  { title: "Accountant", types: ["C", "E"], technical: true },
  { title: "Benefits Counselor", types: ["C", "S"], helping: true, voc: true },
  { title: "Operations Coordinator", types: ["C", "E"], team: true },
  { title: "Compliance Specialist", types: ["C", "I"], technical: true },
  { title: "Medical Records Specialist", types: ["C", "I"], technical: true },
];

type Answers = Record<string, number>;
type Prefs = Partial<Record<PrefKey, string>>;

export function CareerAssessmentDemo() {
  const [answers, setAnswers] = useState<Answers>({});
  const [prefs, setPrefs] = useState<Prefs>({});
  const [submitted, setSubmitted] = useState(false);

  const totalItems = riasecItems.length + bigFiveItems.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalItems;

  function setAnswer(id: string, v: number) {
    setAnswers((prev) => ({ ...prev, [id]: v }));
  }
  function setPref(id: PrefKey, v: string) {
    setPrefs((prev) => ({ ...prev, [id]: v }));
  }

  const results = useMemo(() => {
    if (!submitted) return null;
    const riasec = scoreRiasec(answers);
    const code = hollandCode(riasec);
    const big = scoreBigFive(answers);
    const topType = code[0] as RiasecType;
    const matches = matchOccupations(riasec, prefs);
    return { riasec, code, big, topType, matches };
  }, [submitted, answers, prefs]);

  function handleSubmit() {
    setSubmitted(true);
    requestAnimationFrame(() => {
      document.getElementById("assessment-results")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }

  function handleReset() {
    setAnswers({});
    setPrefs({});
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
          Take the same instruments Pathways Pro uses with clients — the{" "}
          <strong>Interest Profiler</strong> (RIASEC), the{" "}
          <strong>Personality Inventory</strong> (Big Five / Mini-IPIP), and a
          quick <strong>work-environment</strong> check — and get your results
          instantly, including the <strong>careers that best match you</strong>.
          A real taste of what clients and counselors experience inside Pathways
          Pro.
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

      {/* Work-environment preferences */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <h4 className="text-xl tracking-tight">
            3 · Work Environment Preferences
          </h4>
          <span className="text-xs uppercase tracking-wider text-ink/50">
            Optional · sharpens your matches
          </span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {PREFERENCES.map((p) => (
            <div
              key={p.id}
              className="border border-ink/10 rounded-lg bg-white px-4 py-3"
            >
              <div className="text-ink/85 mb-2">{p.q}</div>
              <div className="flex flex-wrap gap-1.5">
                {p.options.map((opt) => {
                  const active = prefs[p.id] === opt.v;
                  return (
                    <button
                      key={opt.v}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setPref(p.id, opt.v)}
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
            {allAnswered ? "See my matches →" : "See matches so far →"}
          </button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div id="assessment-results" className="space-y-6 scroll-mt-6">
          <header className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-accent">
              Your matches
            </p>
            <h3 className="text-3xl tracking-tight">
              Holland Code:{" "}
              <span className="text-accent font-semibold">{results.code}</span>
            </h3>
            {!allAnswered && (
              <p className="text-sm text-ink/60">
                Based on the {answeredCount} question
                {answeredCount === 1 ? "" : "s"} you answered — finish the rest
                for sharper matches.
              </p>
            )}
          </header>

          {/* Best-fit "dream job" occupations */}
          <div className="saas-card space-y-3">
            <h4 className="text-lg font-semibold text-ink">
              Careers that best match you
            </h4>
            <p className="text-sm text-ink/60">
              Occupations that fit your interests
              {Object.keys(prefs).length > 0
                ? " and work-environment preferences"
                : ""}
              . Roles marked{" "}
              <span className="text-accent font-semibold">Vocational Rehab</span>{" "}
              are careers in this very field.
            </p>
            <ol className="space-y-2">
              {results.matches.map((m, i) => (
                <li
                  key={m.title}
                  className="flex items-start gap-3 border-b border-ink/5 pb-2 last:border-0"
                >
                  <span className="flex-none w-6 h-6 grid place-items-center rounded-md bg-accent text-cream text-xs font-bold tabular-nums mt-0.5">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-ink font-medium flex items-center gap-2 flex-wrap">
                      {m.title}
                      {m.voc && (
                        <span className="text-[10px] uppercase tracking-wider text-accent border border-accent/40 bg-accent/5 rounded-full px-2 py-0.5">
                          Vocational Rehab
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-ink/55">
                      {m.types.map((t) => riasecNames[t]).join(" · ")}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <p className="text-xs text-ink/50">
              Drawn to helping others reach meaningful work?{" "}
              <Link href="/careers" className="text-accent underline">
                Explore careers in vocational rehabilitation →
              </Link>
            </p>
          </div>

          {/* Ideal work environment summary */}
          {Object.keys(prefs).length > 0 && (
            <div className="saas-card space-y-2">
              <h4 className="text-lg font-semibold text-ink">
                Your ideal work environment
              </h4>
              <div className="flex flex-wrap gap-2">
                {prefSummary(prefs).map((s) => (
                  <span
                    key={s}
                    className="text-sm border border-ink/15 bg-cream rounded-full px-3 py-1 text-ink/80"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

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
              Inside Pathways Pro, matches like these become full career paths
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

// Scores every occupation by how well its interest areas match the user's
// RIASEC profile, then nudges by the optional work-environment preferences.
function matchOccupations(
  riasec: Record<RiasecType, number>,
  prefs: Prefs,
): Occupation[] {
  return OCCUPATIONS.map((o) => {
    const interestFit =
      o.types.reduce((sum, t) => sum + riasec[t], 0) / o.types.length;
    let score = interestFit;
    if (prefs.impact === "helping" && o.helping) score += 22;
    if (prefs.impact === "technical" && o.technical) score += 22;
    if (prefs.impact === "leading" && o.leading) score += 22;
    if (prefs.team === "team" && o.team) score += 10;
    if (prefs.team === "solo" && o.team === false) score += 10;
    if (prefs.contact === "high" && o.helping) score += 8;
    if (prefs.contact === "low" && o.technical) score += 8;
    return { o, score };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((x) => x.o);
}

function prefSummary(prefs: Prefs): string[] {
  const map: Record<string, string> = {
    team: "Team-based",
    mix: "Team & solo mix",
    solo: "Independent work",
    structured: "Structured routine",
    flexible: "Variety & flexibility",
    office: "Office / indoors",
    field: "Out in the field",
    remote: "Remote / flexible",
    steady: "Steady pace",
    fast: "Fast & changing",
    high: "People-facing",
    low: "Focused solo work",
    helping: "Helping people directly",
    technical: "Solving technical problems",
    leading: "Building / leading ventures",
  };
  return (Object.values(prefs) as string[])
    .map((v) => map[v])
    .filter(Boolean);
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
