"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { ClientUser } from "@/lib/users";
import {
  loadEEOCCharges,
  saveEEOCCharge,
  deleteEEOCCharge,
  newSelfAdvocacyId,
  LEGAL_DISCLAIMER,
  type EEOCBasis,
  type EEOCCharge,
} from "@/lib/self-advocacy";
import { recordCaseNoteEvent } from "@/lib/case-notes";

const BASES: EEOCBasis[] = [
  "Disability",
  "Race",
  "Color",
  "Religion",
  "Sex",
  "Sexual orientation",
  "Gender identity",
  "National origin",
  "Age",
  "Genetic information",
  "Retaliation",
  "Equal Pay Act",
];

interface ApiResponse {
  formalParticulars: string;
  legalAnalysis: string;
  recommendedNextSteps: string[];
}

export default function EEOCPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [client, setClient] = useState<ClientUser | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  const [employerName, setEmployerName] = useState("");
  const [employerAddress, setEmployerAddress] = useState("");
  const [employerCity, setEmployerCity] = useState("");
  const [employerState, setEmployerState] = useState("");
  const [employerZip, setEmployerZip] = useState("");
  const [employerPhone, setEmployerPhone] = useState("");
  const [employerEmployees, setEmployerEmployees] = useState("");

  const [bases, setBases] = useState<EEOCBasis[]>(["Disability"]);
  const [earliestDate, setEarliestDate] = useState("");
  const [latestDate, setLatestDate] = useState("");
  const [continuingAction, setContinuingAction] = useState(false);
  const [briefStatement, setBriefStatement] = useState("");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charges, setCharges] = useState<EEOCCharge[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setAuthorized(true);
    setClientName(s.name);
    if (s.role === "client") {
      setClient(s);
      setClientEmail(s.email);
    }
    const list = loadEEOCCharges();
    setCharges(list);
    if (list.length > 0) setActiveId(list[0].id);
  }, [router]);

  const active = useMemo(
    () => charges.find((c) => c.id === activeId) ?? null,
    [charges, activeId],
  );

  function toggleBasis(b: EEOCBasis) {
    setBases((prev) =>
      prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b],
    );
  }

  async function generate() {
    if (briefStatement.length < 20) {
      setError("Tell us what happened — at least a couple of sentences.");
      return;
    }
    if (bases.length === 0) {
      setError("Pick at least one basis of discrimination.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const resp = await fetch("/api/generate-eeoc-charge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientAddress,
          clientPhone,
          clientEmail,
          employerName,
          employerAddress,
          employerCity,
          employerState,
          employerZip,
          employerPhone,
          employerEmployees,
          basesOfDiscrimination: bases,
          earliestDate,
          latestDate,
          continuingAction,
          briefStatement,
        }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: "Request failed" }));
        setError(body.error ?? "Generation failed.");
        setGenerating(false);
        return;
      }
      const data = (await resp.json()) as ApiResponse;
      const charge: EEOCCharge = {
        id: newSelfAdvocacyId("eeoc"),
        caseId: client?.caseId,
        clientName,
        clientAddress,
        clientPhone,
        clientEmail,
        employerName,
        employerAddress,
        employerCity,
        employerState,
        employerZip,
        employerPhone,
        employerEmployees,
        basesOfDiscrimination: bases,
        earliestDate,
        latestDate,
        continuingAction,
        briefStatement,
        formalParticulars: data.formalParticulars,
        legalAnalysis: data.legalAnalysis,
        recommendedNextSteps: data.recommendedNextSteps,
        createdAt: new Date().toISOString(),
        generatedByModel: "claude-opus-4-8",
      };
      saveEEOCCharge(charge);
      setCharges(loadEEOCCharges());
      setActiveId(charge.id);
      recordCaseNoteEvent({
        kind: "eeoc-charge-generated",
        participantType: "individual-client",
        caseId: client?.caseId,
        clientName,
        sourceArtifactId: charge.id,
        employerName,
        bases: bases as string[],
        earliestDate,
        latestDate,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  function remove(id: string) {
    if (!window.confirm("Delete this draft charge?")) return;
    deleteEEOCCharge(id);
    const next = loadEEOCCharges();
    setCharges(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  }

  if (!authorized) return null;

  return (
    <div className="space-y-6">
      <header className="print:hidden">
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Self Advocacy · EEOC Charge of Discrimination
        </p>
        <h1 className="text-4xl mb-2">
          EEOC <em className="italic text-accent">Charge</em> Draft
        </h1>
        <p className="text-ink/70 prose-narrow">
          Drafts the &ldquo;Particulars&rdquo; section of EEOC Form 5 — the
          first-person, factual narrative the EEOC investigator reads. Files
          electronically at <a href="https://publicportal.eeoc.gov" className="text-accent underline">publicportal.eeoc.gov</a>.
          You have 180 days from the most recent incident (300 in deferral
          states).
        </p>
      </header>

      <FormBlock title="Complainant (you)">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Full legal name"><input className="input" value={clientName} onChange={(e) => setClientName(e.target.value)} /></Field>
          <Field label="Email"><input type="email" className="input" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} /></Field>
          <Field label="Mailing address"><input className="input" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} /></Field>
          <Field label="Phone"><input type="tel" className="input" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} /></Field>
        </div>
      </FormBlock>

      <FormBlock title="Respondent (employer)">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Employer name"><input className="input" value={employerName} onChange={(e) => setEmployerName(e.target.value)} /></Field>
          <Field label="Employee count">
            <select className="input" value={employerEmployees} onChange={(e) => setEmployerEmployees(e.target.value)}>
              <option value="">Select…</option>
              <option>1–14 (may not be covered)</option>
              <option>15–100</option>
              <option>101–500</option>
              <option>500+</option>
            </select>
          </Field>
          <Field label="Street address"><input className="input" value={employerAddress} onChange={(e) => setEmployerAddress(e.target.value)} /></Field>
          <Field label="Phone (optional)"><input className="input" value={employerPhone} onChange={(e) => setEmployerPhone(e.target.value)} /></Field>
          <Field label="City"><input className="input" value={employerCity} onChange={(e) => setEmployerCity(e.target.value)} /></Field>
          <Field label="State"><input className="input" value={employerState} onChange={(e) => setEmployerState(e.target.value)} /></Field>
          <Field label="ZIP"><input className="input" value={employerZip} onChange={(e) => setEmployerZip(e.target.value)} /></Field>
        </div>
      </FormBlock>

      <FormBlock title="What basis & when">
        <fieldset className="space-y-2 mb-3">
          <legend className="text-sm text-ink/80 mb-1">
            Basis of discrimination (check all that apply)
          </legend>
          <div className="grid sm:grid-cols-3 gap-2">
            {BASES.map((b) => {
              const checked = bases.includes(b);
              return (
                <label
                  key={b}
                  className={`text-xs border rounded p-2 cursor-pointer ${checked ? "border-accent bg-accent/10 font-semibold text-accent" : "border-ink/20 bg-white hover:border-accent"}`}
                >
                  <input
                    type="checkbox"
                    className="mr-2 accent-accent"
                    checked={checked}
                    onChange={() => toggleBasis(b)}
                  />
                  {b}
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Earliest date of discrimination"><input type="date" className="input" value={earliestDate} onChange={(e) => setEarliestDate(e.target.value)} /></Field>
          <Field label="Most recent date"><input type="date" className="input" value={latestDate} onChange={(e) => setLatestDate(e.target.value)} /></Field>
        </div>
        <label className="flex items-center gap-2 mt-3 text-sm">
          <input type="checkbox" checked={continuingAction} onChange={(e) => setContinuingAction(e.target.checked)} className="accent-accent" />
          <span>Continuing action — the discrimination is ongoing</span>
        </label>
      </FormBlock>

      <FormBlock title="Tell us what happened (in your own words)">
        <textarea
          className="input min-h-[160px]"
          value={briefStatement}
          onChange={(e) => setBriefStatement(e.target.value)}
          placeholder="Tell the EEOC investigator what happened in order. Names, dates, specifics. Don't worry about legal language — we'll handle that. What did they do, when, and how did it affect you?"
          required
        />
      </FormBlock>

      <div className="print:hidden">
        <button
          onClick={generate}
          disabled={generating}
          className="px-5 py-2.5 bg-accent text-cream rounded font-semibold disabled:opacity-50"
        >
          {generating
            ? "Drafting EEOC charge with Claude Opus 4.8…"
            : charges.length > 0
              ? "Generate another draft ✨"
              : "Draft EEOC Charge ✨"}
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

      {charges.length > 0 && (
        <HistoryStrip charges={charges} activeId={activeId} setActiveId={setActiveId} remove={remove} />
      )}

      {active && <ChargePreview charge={active} />}

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

function FormBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-ink/15 rounded-lg p-5 bg-cream print:hidden">
      <h2 className="text-xl mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block mb-1 text-sm text-ink/80">{label}</span>
      {children}
    </label>
  );
}

function HistoryStrip({
  charges,
  activeId,
  setActiveId,
  remove,
}: {
  charges: EEOCCharge[];
  activeId: string | null;
  setActiveId: (id: string) => void;
  remove: (id: string) => void;
}) {
  return (
    <section className="border border-accent/30 bg-accent/5 rounded-lg p-4 print:hidden">
      <h2 className="text-sm font-semibold mb-2">
        Saved charges ({charges.length})
      </h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
        {charges.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveId(c.id)}
            aria-pressed={activeId === c.id}
            className={`text-left text-xs border rounded p-2 ${activeId === c.id ? "border-accent bg-cream" : "border-ink/15 bg-white hover:border-accent"}`}
          >
            <div className="font-semibold">{c.employerName}</div>
            <div className="text-ink/55">{c.basesOfDiscrimination.join(", ")}</div>
            <div className="text-ink/55">{new Date(c.createdAt).toLocaleDateString()}</div>
            <button onClick={(e) => { e.stopPropagation(); remove(c.id); }} className="text-ink/40 hover:text-accent mt-1">Delete</button>
          </button>
        ))}
      </div>
    </section>
  );
}

function ChargePreview({ charge }: { charge: EEOCCharge }) {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-3 print:hidden">
        <h2 className="text-2xl">EEOC Charge — Draft Particulars</h2>
        <button onClick={() => window.print()} className="text-sm bg-accent text-cream px-4 py-2 rounded font-semibold">
          🖨️ Print / Save as PDF
        </button>
      </div>
      <article className="eeoc-page bg-white shadow-sm border border-ink/15 rounded-sm p-8 space-y-6">
        <header className="text-center border-b border-ink/15 pb-4">
          <h1 className="text-2xl font-semibold uppercase tracking-wider">
            EEOC Charge of Discrimination — Draft
          </h1>
          <p className="text-sm text-ink/65">
            Complainant: {charge.clientName} · Respondent: {charge.employerName}
          </p>
        </header>

        <section>
          <h2 className="font-semibold mb-1 uppercase tracking-wider text-sm">Bases</h2>
          <p className="text-sm">{charge.basesOfDiscrimination.join(" · ")}</p>
        </section>

        <section>
          <h2 className="font-semibold mb-1 uppercase tracking-wider text-sm">Dates</h2>
          <p className="text-sm">
            Earliest: {charge.earliestDate || "—"} · Most recent: {charge.latestDate || "—"}
            {charge.continuingAction && " · Continuing action"}
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2 uppercase tracking-wider text-sm">Particulars</h2>
          <p className="text-sm whitespace-pre-line leading-relaxed">{charge.formalParticulars}</p>
        </section>

        <section>
          <h2 className="font-semibold mb-2 uppercase tracking-wider text-sm">What the EEOC will look at</h2>
          <p className="text-sm">{charge.legalAnalysis}</p>
        </section>

        <section>
          <h2 className="font-semibold mb-2 uppercase tracking-wider text-sm">Next Steps</h2>
          <ol className="text-sm list-decimal pl-5 space-y-1">
            {charge.recommendedNextSteps.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
        </section>

        <footer className="text-xs text-ink/55 italic border-t border-ink/15 pt-4">
          {LEGAL_DISCLAIMER}
        </footer>
      </article>

      <style jsx>{`
        .eeoc-page { font-family: Georgia, "Times New Roman", Times, serif; color: #1a1a1a; }
        @media print {
          body * { visibility: hidden; }
          .eeoc-page, .eeoc-page * { visibility: visible; }
          .eeoc-page { position: absolute; left: 0; top: 0; box-shadow: none; border: none; padding: 0.6in; }
        }
      `}</style>
    </div>
  );
}
