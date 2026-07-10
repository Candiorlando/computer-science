"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import type { ClientUser } from "@/lib/users";
import { loadProfile } from "@/lib/storage";
import { loadTSA } from "@/lib/tsa-storage";
import {
  loadConceptMatches,
  saveConceptMatch,
  deleteConceptMatch,
  newEntrepreneurshipId,
  type BusinessConcept,
  type ConceptMatchSession,
} from "@/lib/entrepreneurship";
import { LEGAL_DISCLAIMER } from "@/lib/self-advocacy";
import { recordCaseNoteEvent } from "@/lib/case-notes";

interface ApiResponse {
  concepts: BusinessConcept[];
  rationaleNarrative: string;
  generalCautions: string[];
}

export default function ConceptMatchPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [client, setClient] = useState<ClientUser | null>(null);
  const [clientName, setClientName] = useState("");
  const [natureOfCondition, setNatureOfCondition] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessions, setSessions] = useState<ConceptMatchSession[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setAuthorized(true);
    setClientName(s.name);
    if (s.role === "client") setClient(s);
    const list = loadConceptMatches();
    setSessions(list);
    if (list.length > 0) setActiveId(list[0].id);
  }, [router]);

  const profile = useMemo(() => (authorized ? loadProfile() : null), [authorized]);
  const tsa = useMemo(() => (authorized ? loadTSA() : null), [authorized]);
  const active = useMemo(
    () => sessions.find((s) => s.id === activeId) ?? null,
    [sessions, activeId],
  );

  async function generate() {
    setError(null);
    setGenerating(true);
    try {
      const topRiasec = profile?.riasec
        ? Object.entries(profile.riasec)
            .sort((a, b) => (b[1] as number) - (a[1] as number))
            .slice(0, 3)
            .map(([k]) => k)
        : undefined;
      const resp = await fetch("/api/generate-business-concepts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          hollandCode: profile?.hollandCode,
          topRiasec,
          transferableSkills: tsa?.coreSkills?.map((s) => s.skill),
          dreamJob: profile?.intake?.dreamJob,
          employmentGoal: profile?.intake?.employmentGoal,
          constraints: profile?.intake?.constraints,
          schedulePreference: profile?.intake?.schedulePreference,
          educationLevel: profile?.intake?.educationLevel,
          zipCode: profile?.intake?.zipCode,
          natureOfCondition: natureOfCondition || undefined,
        }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: "Request failed" }));
        setError(body.error ?? "Generation failed.");
        setGenerating(false);
        return;
      }
      const data = (await resp.json()) as ApiResponse;
      const session: ConceptMatchSession = {
        id: newEntrepreneurshipId("match"),
        caseId: client?.caseId,
        clientName,
        profileSnapshot: {
          hollandCode: profile?.hollandCode,
          topRiasec,
          transferableSkills: tsa?.coreSkills?.map((s) => s.skill),
          dreamJob: profile?.intake?.dreamJob,
          employmentGoal: profile?.intake?.employmentGoal,
          constraints: profile?.intake?.constraints,
          schedulePreference: profile?.intake?.schedulePreference,
          educationLevel: profile?.intake?.educationLevel,
          zipCode: profile?.intake?.zipCode,
          natureOfCondition: natureOfCondition || undefined,
        },
        concepts: data.concepts,
        rationaleNarrative: data.rationaleNarrative,
        generalCautions: data.generalCautions,
        createdAt: new Date().toISOString(),
        generatedByModel: "claude-opus-4-8",
      };
      saveConceptMatch(session);
      setSessions(loadConceptMatches());
      setActiveId(session.id);
      recordCaseNoteEvent({
        kind: "concept-match-generated",
        participantType: "individual-client",
        caseId: client?.caseId,
        clientName,
        sourceArtifactId: session.id,
        hollandCode: profile?.hollandCode,
        conceptCount: session.concepts.length,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  function remove(id: string) {
    if (!window.confirm("Delete this concept-match session?")) return;
    deleteConceptMatch(id);
    const next = loadConceptMatches();
    setSessions(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  }

  if (!authorized) return null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Self-Employment · Step 1
        </p>
        <h1 className="text-4xl mb-2">
          Business Concept <em className="italic text-accent">Matchmaker</em>
        </h1>
        <p className="text-ink/70 prose-narrow">
          We pull your assessment, TSA, intake answers, and any disability
          context you share, then pitch 3 distinct business concepts — each
          accommodation-aware, each with realistic startup costs, each with a
          dedicated assistive-tech budget.
        </p>
      </header>

      <section className="border border-ink/15 rounded-lg p-5 bg-cream space-y-4">
        <h2 className="text-xl">Your profile snapshot</h2>
        <ProfilePeek profile={profile} tsa={tsa} />

        <label className="block">
          <span className="block mb-1 text-sm text-ink/80">
            Disability context for matching (optional)
          </span>
          <textarea
            value={natureOfCondition}
            onChange={(e) => setNatureOfCondition(e.target.value)}
            placeholder="e.g., chronic fatigue limits 4-5 productive hours/day · autism + strong pattern recognition · low-vision needing screen reader compatibility"
            className="input min-h-[80px]"
          />
          <p className="text-xs text-ink/55 mt-1">
            Helps us flag accommodation considerations and AT line items.
            Leave blank if you&apos;d rather not share — we&apos;ll match on
            the profile data alone.
          </p>
        </label>
      </section>

      <div>
        <button
          onClick={generate}
          disabled={generating}
          className="px-5 py-2.5 bg-accent text-cream rounded font-semibold disabled:opacity-50"
        >
          {generating
            ? "Synthesizing 3 concepts with Claude Opus 4.8…"
            : sessions.length > 0
              ? "Generate another set of concepts ✨"
              : "Pitch 3 business concepts ✨"}
        </button>
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mt-3 text-sm border border-accent/40 bg-accent/10 text-accent p-3 rounded"
          >
            {error}
          </div>
        )}
      </div>

      {sessions.length > 1 && (
        <section
          aria-label="Previous concept sessions"
          className="border border-accent/30 bg-accent/5 rounded-lg p-4"
        >
          <h2 className="text-sm font-semibold mb-2">Past sessions</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveId(s.id)}
                aria-pressed={activeId === s.id}
                className={`text-left text-xs border rounded p-2 ${
                  activeId === s.id
                    ? "border-accent bg-cream"
                    : "border-ink/15 bg-white hover:border-accent"
                }`}
              >
                <div className="font-semibold">
                  {s.concepts.map((c) => c.name.split(" ")[0]).join(" · ")}
                </div>
                <div className="text-ink/55">
                  {new Date(s.createdAt).toLocaleString()}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(s.id);
                  }}
                  className="text-ink/40 hover:text-accent mt-1"
                >
                  Delete
                </button>
              </button>
            ))}
          </div>
        </section>
      )}

      {active && <Results session={active} />}

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: white;
          border: 1px solid rgba(31, 29, 26, 0.2);
          border-radius: 6px;
          padding: 0.55rem 0.75rem;
          font-family: inherit;
        }
        :global(.input:focus-visible) {
          outline: 2px solid #0F6B54;
          outline-offset: -1px;
        }
      `}</style>
    </div>
  );
}

function ProfilePeek({
  profile,
  tsa,
}: {
  profile: ReturnType<typeof loadProfile> | null;
  tsa: ReturnType<typeof loadTSA> | null;
}) {
  if (!profile) return null;
  return (
    <ul className="text-sm space-y-1 text-ink/75">
      {profile.hollandCode && (
        <li>
          <strong>Holland code:</strong>{" "}
          <span className="text-accent font-semibold">{profile.hollandCode}</span>
        </li>
      )}
      {profile.intake?.dreamJob && (
        <li>
          <strong>Dream job:</strong> {profile.intake.dreamJob}
        </li>
      )}
      {profile.intake?.employmentGoal && (
        <li>
          <strong>VR goal:</strong> {profile.intake.employmentGoal}
        </li>
      )}
      {profile.intake?.constraints && (
        <li>
          <strong>Constraints on file:</strong> {profile.intake.constraints}
        </li>
      )}
      {tsa && tsa.coreSkills.length > 0 && (
        <li>
          <strong>TSA skills:</strong>{" "}
          {tsa.coreSkills.map((s) => s.skill).slice(0, 5).join(" · ")}
        </li>
      )}
    </ul>
  );
}

function Results({ session }: { session: ConceptMatchSession }) {
  return (
    <div className="space-y-6">
      <section className="border border-accent/30 bg-accent/5 rounded-lg p-5">
        <h2 className="text-xl mb-2">Why these three</h2>
        <p className="text-sm text-ink/80">{session.rationaleNarrative}</p>
      </section>

      <div className="space-y-4">
        {session.concepts.map((c, i) => (
          <ConceptCard key={i} c={c} idx={i + 1} />
        ))}
      </div>

      <section
        aria-label="General cautions"
        className="border border-amber-300 bg-amber-50 rounded-lg p-5"
      >
        <h3 className="font-semibold text-amber-900 mb-2">Read these first</h3>
        <ul className="text-sm text-amber-900/85 space-y-1 list-disc pl-5">
          {session.generalCautions.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      </section>

      <footer className="text-xs text-ink/55 italic border-t border-ink/10 pt-3">
        {LEGAL_DISCLAIMER}
      </footer>

      <div>
        <Link
          href="/entrepreneurship/business-plan"
          className="inline-block bg-accent text-cream font-semibold px-5 py-2.5 rounded hover:bg-accent/90"
        >
          Pick one → Build a full business plan →
        </Link>
      </div>
    </div>
  );
}

function ConceptCard({ c, idx }: { c: BusinessConcept; idx: number }) {
  const riskColor =
    c.riskLevel === "low"
      ? "border-emerald-300 bg-emerald-50/40"
      : c.riskLevel === "moderate"
        ? "border-amber-300 bg-amber-50/30"
        : "border-amber-300 bg-amber-50/30";
  const atTotal = c.assistiveTechNeeded.reduce((s, a) => s + a.estimatedCost, 0);
  return (
    <article className={`border-2 rounded-lg p-5 ${riskColor}`}>
      <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
        <h3 className="text-2xl font-semibold">
          <span className="text-accent">#{idx}</span> {c.name}
        </h3>
        <span className="text-xs uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-white border border-ink/15">
          {c.riskLevel} risk · {c.scaleCeiling.replace("-", " ")}
        </span>
      </div>
      <p className="italic text-ink/70 mb-3">{c.tagline}</p>
      <p className="text-sm text-ink/85 mb-4">{c.whatItIs}</p>

      <div className="border-l-4 border-accent pl-3 mb-4">
        <div className="text-xs uppercase tracking-wider text-accent font-semibold">
          Why this fits you
        </div>
        <p className="text-sm text-ink/80">{c.whyItFits}</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-4 text-sm">
        <Stat
          label="Startup costs"
          value={`$${c.startupCostsLow.toLocaleString()}–$${c.startupCostsHigh.toLocaleString()}`}
        />
        <Stat
          label="Monthly operating"
          value={`$${c.monthlyOperatingLow.toLocaleString()}–$${c.monthlyOperatingHigh.toLocaleString()}`}
        />
        <Stat
          label="Time to first revenue"
          value={`~${c.timeToFirstRevenueMonths} months`}
        />
        <Stat label="AT budget total" value={`$${atTotal.toLocaleString()}`} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold mb-1">Accommodation considerations</h4>
          <ul className="text-xs text-ink/70 list-disc pl-4 space-y-1">
            {c.accommodationConsiderations.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-1">Assistive tech budget</h4>
          {c.assistiveTechNeeded.length === 0 ? (
            <p className="text-xs text-ink/55 italic">
              No specific AT line items identified.
            </p>
          ) : (
            <ul className="text-xs text-ink/70 list-disc pl-4 space-y-1">
              {c.assistiveTechNeeded.map((a, i) => (
                <li key={i}>
                  {a.item} —{" "}
                  <span className="text-ink/85 font-semibold">
                    ${a.estimatedCost.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-4 pt-3 border-t border-ink/15">
        <div>
          <h4 className="text-xs uppercase tracking-wider text-emerald-700 font-semibold">
            Early wins (this week)
          </h4>
          <ul className="text-xs text-ink/75 list-disc pl-4 space-y-1 mt-1">
            {c.earlyWins.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-amber-700 font-semibold">
            Risk factors
          </h4>
          <ul className="text-xs text-ink/75 list-disc pl-4 space-y-1 mt-1">
            {c.riskFactors.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-wider text-amber-700 font-semibold">
            Red flags (abandon if…)
          </h4>
          <ul className="text-xs text-ink/75 list-disc pl-4 space-y-1 mt-1">
            {c.redFlags.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/10 rounded p-2 bg-white">
      <div className="text-[10px] uppercase tracking-wider text-ink/55">
        {label}
      </div>
      <div className="text-sm font-semibold text-ink">{value}</div>
    </div>
  );
}
