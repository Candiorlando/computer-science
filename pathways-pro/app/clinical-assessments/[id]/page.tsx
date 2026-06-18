"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import {
  SCREENERS,
  loadLatestResult,
  saveScreenerResult,
  scoreScreener,
  type ScreenerResult,
  type SeverityBand,
} from "@/lib/screeners";
import type { ClientUser } from "@/lib/users";
import { nameWithInitial } from "@/lib/document-id";

export default function ScreenerPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params.id);
  const config = SCREENERS[id];

  const [authorized, setAuthorized] = useState(false);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<ScreenerResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [client, setClient] = useState<ClientUser | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setAuthorized(true);
    if (s.role === "client") {
      setClient(s);
      setIsClient(true);
    }
    const prior = loadLatestResult(id);
    if (prior) {
      setResult(prior);
      setAnswers(prior.itemScores);
    }
  }, [router, id]);

  // Clients reach a screener from /my-assessments (their assigned list),
  // so "back" should return them there — not to the counselor-side
  // Assessment Library. Counselors continue to navigate back to the
  // full library.
  const backHref = isClient ? "/my-assessments" : "/clinical-assessments";
  const backLabel = isClient
    ? "← Back to my assessments"
    : "← Back to the library";

  const allAnswered = useMemo(
    () => (config ? config.items.every((it) => typeof answers[it.id] === "number") : false),
    [config, answers],
  );

  if (!config) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl">Assessment not found</h1>
        <p className="text-ink/70">
          The screener id <code>{id}</code> isn&apos;t in the registry.
        </p>
        <Link href={backHref} className="text-accent hover:underline">
          {backLabel}
        </Link>
      </div>
    );
  }

  if (!authorized) return null;

  function submit() {
    const r = scoreScreener(config, answers);
    saveScreenerResult(r);
    setResult(r);
    setShowResult(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function retake() {
    setAnswers({});
    setShowResult(false);
    setResult(null);
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Link
          href={backHref}
          className="text-sm text-accent hover:underline"
        >
          {backLabel}
        </Link>
      </div>

      {client && (
        <header className="hidden print:block border-b-2 border-ink pb-2 mb-4">
          <p className="text-xs uppercase tracking-widest">
            Pathways Pro · {config.acronym} Assessment
          </p>
          <p className="text-sm">
            Case <strong>{client.caseId}</strong> ·{" "}
            <strong>{nameWithInitial(client.name)}</strong>
          </p>
        </header>
      )}

      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          {config.domain}
        </p>
        <h1 className="text-4xl mb-2">
          {config.name}{" "}
          <span className="text-ink/50 text-2xl font-normal">
            ({config.acronym})
          </span>
        </h1>
        <p className="text-ink/70 text-sm">{config.instructions}</p>
      </header>

      {result && (showResult || !!result) && (
        <ResultsCard config={config} result={result} onRetake={retake} />
      )}

      {!showResult && (
        <section className="border border-ink/15 rounded-lg bg-cream p-5">
          <h2 className="text-xl mb-3">{config.prompt}</h2>
          <div className="space-y-5">
            {config.items.map((item, idx) => {
              const opts = item.options ?? config.defaultOptions;
              return (
                <div
                  key={item.id}
                  className="border-b border-ink/10 last:border-b-0 pb-4 last:pb-0"
                >
                  <p className="font-medium mb-2">
                    <span className="text-ink/50 mr-2">{idx + 1}.</span>
                    {item.text}
                  </p>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {opts.map((o) => {
                      const selected = answers[item.id] === o.value;
                      return (
                        <button
                          key={o.value}
                          onClick={() =>
                            setAnswers((s) => ({ ...s, [item.id]: o.value }))
                          }
                          className={`text-left border rounded px-3 py-2 text-sm ${
                            selected
                              ? "border-accent bg-accent/10 font-semibold text-accent"
                              : "border-ink/20 hover:border-accent bg-white"
                          }`}
                        >
                          <span className="text-xs text-ink/50 mr-2">
                            {o.value}
                          </span>
                          {o.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-ink/10 flex items-center gap-3 flex-wrap">
            <button
              onClick={submit}
              disabled={!allAnswered}
              className="px-6 py-2.5 bg-accent text-cream rounded font-semibold disabled:opacity-50"
            >
              Score it
            </button>
            <span className="text-xs text-ink/60">
              {Object.keys(answers).length} / {config.items.length} answered
            </span>
          </div>
        </section>
      )}

      <footer className="text-xs text-ink/50 border-t border-ink/10 pt-4">
        <p className="mb-1">
          <strong>Source.</strong> {config.source}
        </p>
        <p>{config.citation}</p>
      </footer>
    </div>
  );
}

function ResultsCard({
  config,
  result,
  onRetake,
}: {
  config: import("@/lib/screeners").ScreenerConfig;
  result: ScreenerResult;
  onRetake: () => void;
}) {
  const bandColor = bandTone(result.band.color);
  return (
    <section className={`border rounded-lg p-5 ${bandColor.box}`}>
      <div className="flex items-baseline justify-between gap-4 flex-wrap mb-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/60 mb-1">
            {config.acronym} score
          </p>
          <div className="flex items-baseline gap-3">
            <span className={`text-5xl font-bold ${bandColor.text}`}>
              {result.totalScore}
            </span>
            <span className="text-sm text-ink/50">
              of {result.maxScore} possible
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRetake}
            className="text-sm border border-ink/20 px-4 py-2 rounded hover:bg-ink/5"
          >
            Retake
          </button>
          <button
            onClick={() => window.print()}
            className="text-sm bg-accent text-cream px-4 py-2 rounded font-semibold"
          >
            🖨️ Print
          </button>
        </div>
      </div>

      <h3 className={`text-2xl font-semibold ${bandColor.text}`}>
        {result.band.label}
      </h3>
      <p className="text-sm text-ink/80 mt-2">{result.band.guidance}</p>

      {result.safetyFlag && (
        <div className="mt-4 border border-red-400 bg-red-50 rounded p-4">
          <p className="text-sm font-semibold text-red-900 mb-1">
            ⚠️ Safety flag — Item {result.safetyFlag.itemId.slice(-1)} endorsed
          </p>
          <p className="text-sm text-red-900/90">{result.safetyFlag.message}</p>
        </div>
      )}

      <p className="text-xs text-ink/50 mt-4">
        Scored {new Date(result.completedAt).toLocaleString()}
      </p>
    </section>
  );
}

function bandTone(color: SeverityBand["color"]) {
  switch (color) {
    case "green":
      return { box: "border-green-300 bg-green-50", text: "text-green-800" };
    case "yellow":
      return { box: "border-yellow-300 bg-yellow-50", text: "text-yellow-800" };
    case "orange":
      return { box: "border-orange-300 bg-orange-50", text: "text-orange-800" };
    case "red":
      return { box: "border-red-300 bg-red-50", text: "text-red-800" };
    case "blue":
      return { box: "border-blue-300 bg-blue-50", text: "text-blue-800" };
    case "purple":
      return { box: "border-purple-300 bg-purple-50", text: "text-purple-800" };
  }
}
