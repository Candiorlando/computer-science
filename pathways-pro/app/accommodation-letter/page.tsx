"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { ClientUser } from "@/lib/users";
import { Disclaimer } from "@/components/Disclaimer";
import {
  appendAccommodationLetter,
  deleteAccommodationLetter,
  loadAccommodationLetters,
  newLetterId,
  type AccommodationLetter,
  type PaidSolution,
  type ZeroCostSolution,
  JAN_CITATION,
} from "@/lib/accommodation-letters";
import { nameWithInitial } from "@/lib/document-id";
import { recordCaseNoteEvent } from "@/lib/case-notes";

interface ApiResponse {
  barrierAnalysis: string;
  janCitation: string;
  zeroCostSolutions: ZeroCostSolution[];
  paidSolutions: PaidSolution[];
  totalPaidLow: number;
  totalPaidHigh: number;
  letter: AccommodationLetter["letter"];
}

export default function AccommodationLetterPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [client, setClient] = useState<ClientUser | null>(null);

  const [natureOfCondition, setNatureOfCondition] = useState("");
  const [workplaceProblem, setWorkplaceProblem] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [hrContactName, setHrContactName] = useState("");
  const [hrContactTitle, setHrContactTitle] = useState("");
  const [workLocation, setWorkLocation] = useState("");
  const [fullName, setFullName] = useState("");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [letters, setLetters] = useState<AccommodationLetter[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setAuthorized(true);
    setFullName(s.name);
    if (s.role === "client") setClient(s);
    const list = loadAccommodationLetters();
    setLetters(list);
    if (list.length > 0) setActiveId(list[0].id);
  }, [router]);

  const active = useMemo(
    () => letters.find((l) => l.id === activeId) ?? null,
    [letters, activeId],
  );

  async function generate() {
    if (!workplaceProblem.trim() || !fullName.trim()) {
      setError("Tell us your name and the specific workplace problem.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const resp = await fetch("/api/generate-accommodation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: fullName,
          jobTitle,
          employerName,
          hrContactName,
          hrContactTitle,
          workLocation,
          natureOfCondition,
          workplaceProblem,
        }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: "Request failed" }));
        setError(body.error ?? "Generation failed.");
        setGenerating(false);
        return;
      }
      const data = (await resp.json()) as ApiResponse;
      const now = new Date().toISOString();
      const saved: AccommodationLetter = {
        id: newLetterId(),
        caseId: client?.caseId,
        clientName: fullName,
        jobTitle: jobTitle || undefined,
        employerName: employerName || undefined,
        hrContactName: hrContactName || undefined,
        hrContactTitle: hrContactTitle || undefined,
        workLocation: workLocation || undefined,
        natureOfCondition: natureOfCondition || undefined,
        workplaceProblem,
        barrierAnalysis: data.barrierAnalysis,
        janCitation: data.janCitation,
        zeroCostSolutions: data.zeroCostSolutions,
        paidSolutions: data.paidSolutions,
        totalPaidLow: data.totalPaidLow,
        totalPaidHigh: data.totalPaidHigh,
        letter: data.letter,
        createdAt: now,
        updatedAt: now,
        generatedByModel: "claude-opus-4-8",
      };
      const next = appendAccommodationLetter(saved);
      setLetters(next);
      setActiveId(saved.id);
      recordCaseNoteEvent({
        kind: "accommodation-letter-generated",
        participantType: "individual-client",
        caseId: client?.caseId,
        clientName: fullName,
        sourceArtifactId: saved.id,
        workplaceProblem,
        zeroCostCount: saved.zeroCostSolutions.length,
        paidCount: saved.paidSolutions.length,
        totalPaidLow: saved.totalPaidLow,
        totalPaidHigh: saved.totalPaidHigh,
        priceVerified: saved.paidSolutions.some(
          (s) => s.priceSource === "live-verified",
        ),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  function remove(id: string) {
    if (
      !window.confirm(
        "Delete this accommodation letter? This can't be undone.",
      )
    )
      return;
    const next = deleteAccommodationLetter(id);
    setLetters(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  }

  if (!authorized) return null;

  return (
    <div className="space-y-6">
      <header className="print:hidden">
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          ADA Title I · Reasonable Accommodation
        </p>
        <h1 className="text-4xl mb-2">
          AI <em className="italic text-accent">Accommodation Letter</em> Generator
        </h1>
        <p className="text-ink/70 prose-narrow">
          Describe a specific workplace barrier. We&apos;ll suggest both
          zero-cost adjustments and paid solutions with realistic price
          ranges, then draft a formal accommodation-request letter you
          can send to HR. The letter opens the ADA interactive process
          and pre-empts the &ldquo;undue hardship&rdquo; defense by
          showing what JAN data already says about real costs.
        </p>
      </header>

      <div className="print:hidden">
        <Disclaimer kind="general" />
      </div>

      {/* History */}
      {letters.length > 0 && (
        <section
          aria-label="Previously generated letters"
          className="border border-accent/30 bg-accent/5 rounded-lg p-5 print:hidden"
        >
          <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
            <h2 className="text-xl">Past letters ({letters.length})</h2>
            <button
              onClick={() => {
                setActiveId(null);
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="text-sm text-accent hover:underline"
            >
              + Draft a new letter
            </button>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {letters.map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveId(l.id)}
                aria-pressed={activeId === l.id}
                className={`text-left border rounded-lg p-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  activeId === l.id
                    ? "border-accent bg-cream shadow-sm"
                    : "border-ink/15 bg-cream hover:border-accent"
                }`}
              >
                <div className="font-semibold text-sm line-clamp-2">
                  {l.workplaceProblem}
                </div>
                {l.employerName && (
                  <div className="text-xs text-ink/50">{l.employerName}</div>
                )}
                <div className="text-xs text-ink/60 mt-1">
                  {new Date(l.createdAt).toLocaleString()}
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  {activeId === l.id && (
                    <span className="text-accent font-semibold">
                      ✓ Showing now
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(l.id);
                    }}
                    className="ml-auto text-ink/40 hover:text-accent"
                  >
                    Delete
                  </button>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Step 1 — Barrier */}
      <FormSection
        n={1}
        title="What's getting in your way at work?"
        sub="Be specific about the activity. We do not need a diagnosis to draft a strong letter."
      >
        <Field label="Specific workplace problem" required>
          <textarea
            value={workplaceProblem}
            onChange={(e) => setWorkplaceProblem(e.target.value)}
            placeholder="e.g., Cannot stand at the register for 8 hours · Fluorescent lights trigger migraines · Open-office noise prevents focused work"
            className="input min-h-[100px]"
            aria-required
            required
          />
        </Field>

        <Field label="Nature of condition (optional — increases letter precision)">
          <input
            type="text"
            value={natureOfCondition}
            onChange={(e) => setNatureOfCondition(e.target.value)}
            placeholder="e.g., chronic back pain · migraine disorder · autism spectrum"
            className="input"
          />
          <p className="text-xs text-ink/55 mt-1">
            You control what HR sees. If you leave this blank, the letter
            refers to &ldquo;a medical condition affecting [function]&rdquo;
            instead of naming the diagnosis.
          </p>
        </Field>
      </FormSection>

      {/* Step 2 — You + workplace */}
      <FormSection
        n={2}
        title="You and your workplace"
        sub="The letter is addressed to a specific employer when you fill these in. Leave any field blank for a more generic version."
      >
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Your full name" required>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input"
              aria-required
              required
            />
          </Field>
          <Field label="Your job title">
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="input"
              placeholder="e.g., Cashier"
            />
          </Field>
          <Field label="Employer name">
            <input
              type="text"
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
              className="input"
              placeholder="e.g., Acme Logistics"
            />
          </Field>
          <Field label="Work location">
            <input
              type="text"
              value={workLocation}
              onChange={(e) => setWorkLocation(e.target.value)}
              className="input"
              placeholder="e.g., Chicago, IL"
            />
          </Field>
          <Field label="HR contact name">
            <input
              type="text"
              value={hrContactName}
              onChange={(e) => setHrContactName(e.target.value)}
              className="input"
              placeholder="e.g., Aisha Hassan"
            />
          </Field>
          <Field label="HR contact title">
            <input
              type="text"
              value={hrContactTitle}
              onChange={(e) => setHrContactTitle(e.target.value)}
              className="input"
              placeholder="e.g., Director of HR"
            />
          </Field>
        </div>
      </FormSection>

      {/* Step 3 — Generate */}
      <div className="print:hidden">
        <button
          onClick={generate}
          disabled={generating}
          aria-disabled={generating}
          className="px-5 py-2.5 bg-accent text-cream rounded font-semibold disabled:opacity-50"
        >
          {generating
            ? "Drafting your letter with Claude Opus 4.8…"
            : letters.length > 0
              ? "Generate another accommodation letter ✨"
              : "Generate accommodation letter ✨"}
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

      {/* Results + letter */}
      {active && <Result letter={active} />}

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
          outline: 2px solid #b95c3c;
          outline-offset: -1px;
        }
      `}</style>
    </div>
  );
}

// ───────────── Result + letter render ─────────────

function Result({ letter }: { letter: AccommodationLetter }) {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4 flex-wrap print:hidden">
        <h2 className="text-2xl">Your accommodation packet — preview</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => window.print()}
            className="text-sm bg-accent text-cream px-4 py-2 rounded font-semibold"
          >
            🖨️ Print letter / Save as PDF
          </button>
        </div>
      </div>

      <Analysis letter={letter} />

      <div className="grid lg:grid-cols-2 gap-4 print:hidden">
        <ZeroCostBlock items={letter.zeroCostSolutions} />
        <PaidBlock
          items={letter.paidSolutions}
          totalLow={letter.totalPaidLow}
          totalHigh={letter.totalPaidHigh}
        />
      </div>

      <LetterPreview letter={letter} />
    </div>
  );
}

function Analysis({ letter }: { letter: AccommodationLetter }) {
  return (
    <section
      aria-label="Barrier analysis"
      className="border border-ink/15 rounded-lg p-5 bg-cream print:hidden"
    >
      <h3 className="text-lg font-semibold mb-2">What we heard</h3>
      <p className="text-sm text-ink/80 mb-3">
        <strong>Your problem:</strong> {letter.workplaceProblem}
      </p>
      <p className="text-sm text-ink/80">{letter.barrierAnalysis}</p>
      <p className="text-xs text-ink/55 mt-3 italic">{letter.janCitation}</p>
      <p className="text-xs text-ink/55 mt-1">{JAN_CITATION}</p>
    </section>
  );
}

function ZeroCostBlock({ items }: { items: ZeroCostSolution[] }) {
  return (
    <section
      aria-label="Zero-cost solutions"
      className="border-2 border-emerald-300 bg-emerald-50/40 rounded-lg p-5"
    >
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <h3 className="text-lg font-semibold text-emerald-900">
          🆓 Zero-cost solutions
        </h3>
        <span className="text-xs uppercase tracking-wider text-emerald-800 font-semibold">
          {items.length} option{items.length === 1 ? "" : "s"}
        </span>
      </div>
      <p className="text-xs text-emerald-900/80 mb-3">
        Administrative changes that cost the employer nothing — schedule
        adjustments, policy tweaks, task reassignment.
      </p>
      <ul className="space-y-3" role="list">
        {items.map((s, i) => (
          <li key={i} className="border-l-2 border-emerald-400 pl-3">
            <div className="font-semibold text-sm">{s.label}</div>
            <div className="text-xs text-ink/70 mt-0.5">{s.rationale}</div>
            <div className="text-[11px] uppercase tracking-wider text-emerald-700 mt-1">
              {s.category}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PaidBlock({
  items,
  totalLow,
  totalHigh,
}: {
  items: PaidSolution[];
  totalLow: number;
  totalHigh: number;
}) {
  return (
    <section
      aria-label="Paid solutions with estimated price ranges"
      className="border-2 border-amber-300 bg-amber-50/40 rounded-lg p-5"
    >
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <h3 className="text-lg font-semibold text-amber-900">
          💰 Paid solutions
        </h3>
        <span className="text-xs uppercase tracking-wider text-amber-800 font-semibold">
          {items.length} option{items.length === 1 ? "" : "s"}
        </span>
      </div>
      <p className="text-xs text-amber-900/80 mb-3">
        Hardware, software, furniture. Prices are estimated retail ranges
        based on training data — confirm current pricing before purchase.
      </p>
      <ul className="space-y-3" role="list">
        {items.map((s, i) => (
          <li key={i} className="border-l-2 border-amber-400 pl-3">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <div className="font-semibold text-sm">{s.label}</div>
              <div className="text-sm font-semibold text-amber-900">
                ${s.estimatedPriceLow.toLocaleString()}–$
                {s.estimatedPriceHigh.toLocaleString()}
              </div>
            </div>
            <div className="text-xs text-ink/70 mt-0.5">{s.rationale}</div>
            <div className="text-[11px] text-ink/55 mt-1 flex flex-wrap gap-2 items-baseline">
              <span className="uppercase tracking-wider text-amber-700">
                {s.category}
              </span>
              <PriceBadge solution={s} />
              {s.exampleSources.length > 0 && (
                <span>· Look at: {s.exampleSources.join(" · ")}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
      {items.length > 0 && (
        <div className="mt-4 pt-3 border-t border-amber-300 text-sm">
          <strong>Total estimated range:</strong>{" "}
          <span className="text-amber-900 font-bold">
            ${totalLow.toLocaleString()}–${totalHigh.toLocaleString()}
          </span>
          {totalHigh <= 500 && (
            <span className="block text-xs text-amber-800 mt-1 italic">
              ✓ Falls within JAN&apos;s median paid-accommodation range —
              easy to defend as reasonable.
            </span>
          )}
        </div>
      )}
    </section>
  );
}

function LetterPreview({ letter }: { letter: AccommodationLetter }) {
  return (
    <article className="letter-page bg-white shadow-sm border border-ink/15 rounded-sm">
      <header className="letter-header">
        <h1 className="letter-author">{letter.clientName}</h1>
        {letter.workLocation && (
          <p className="letter-meta">{letter.workLocation}</p>
        )}
        <p className="letter-meta">
          Case {letter.caseId ?? "—"} ·{" "}
          {nameWithInitial(letter.clientName)} · Self-advocacy packet
        </p>
      </header>

      <p className="letter-date">{letter.letter.date}</p>
      {letter.letter.recipientBlock.length > 0 && (
        <div className="letter-recipient">
          {letter.letter.recipientBlock.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      )}
      <p className="letter-subject">
        <strong>Re:</strong> {letter.letter.subject}
      </p>
      <p className="letter-salutation">{letter.letter.salutation}</p>
      <div className="letter-body">
        {letter.letter.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <p className="letter-closing">{letter.letter.closing}</p>
      <p className="letter-signature">{letter.clientName}</p>

      <style jsx>{`
        .letter-page {
          font-family: Georgia, "Times New Roman", Times, serif;
          color: #1a1a1a;
          background: #ffffff;
          padding: 0.8in 0.85in;
          max-width: 8.5in;
          margin: 0 auto;
          font-size: 11pt;
          line-height: 1.55;
        }
        .letter-header {
          text-align: center;
          border-bottom: 1.5pt solid #1a1a1a;
          padding-bottom: 8px;
          margin-bottom: 24px;
        }
        .letter-author {
          font-size: 22pt;
          margin: 0 0 4px;
          letter-spacing: 0.02em;
        }
        .letter-meta {
          margin: 0;
          font-size: 10pt;
          color: #444;
        }
        .letter-date {
          margin: 0 0 18px;
        }
        .letter-recipient {
          margin: 0 0 18px;
          line-height: 1.4;
        }
        .letter-subject {
          margin: 0 0 18px;
        }
        .letter-salutation {
          margin: 0 0 14px;
        }
        .letter-body p {
          margin: 0 0 12px;
          text-align: justify;
        }
        .letter-closing {
          margin-top: 22px;
        }
        .letter-signature {
          margin-top: 30px;
          font-weight: 600;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .letter-page,
          .letter-page * {
            visibility: visible;
          }
          .letter-page {
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
    </article>
  );
}

function PriceBadge({ solution }: { solution: PaidSolution }) {
  if (solution.priceSource === "live-verified") {
    return (
      <span
        className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold"
        title={
          solution.verifiedSources?.length
            ? `Pulled from ${solution.verifiedSources.length} retail source(s)`
            : "Live retail verified"
        }
      >
        ✓ Verified retail
      </span>
    );
  }
  return (
    <span
      className="text-[10px] uppercase tracking-wider bg-ink/10 text-ink/65 px-2 py-0.5 rounded-full font-semibold"
      title="Estimated by Claude from training data"
    >
      AI estimate
    </span>
  );
}

// ───────────── tiny helpers ─────────────

function FormSection({
  n,
  title,
  sub,
  children,
}: {
  n: number;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-ink/15 rounded-lg p-5 bg-cream space-y-4 print:hidden">
      <header>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
          Step {n}
        </p>
        <h2 className="text-xl">{title}</h2>
        <p className="text-sm text-ink/65 mt-1">{sub}</p>
      </header>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block mb-1 text-sm text-ink/80">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      {children}
    </label>
  );
}
