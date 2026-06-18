"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { ClientUser } from "@/lib/users";
import {
  loadProblemAnalysisReports,
  saveProblemAnalysisReport,
  deleteProblemAnalysisReport,
  newSelfAdvocacyId,
  LEGAL_DISCLAIMER,
  type Incident,
  type ProblemAnalysisReport,
} from "@/lib/self-advocacy";

interface ApiResponse {
  executiveSummary: string;
  patternAnalysis: string;
  legalCrossReference: { law: string; analysis: string }[];
  nextSteps: string[];
}

export default function IncidentReportPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [client, setClient] = useState<ClientUser | null>(null);

  const [clientName, setClientName] = useState("");
  const [clientRole, setClientRole] = useState("");
  const [natureOfCondition, setNatureOfCondition] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [employerLocation, setEmployerLocation] = useState("");
  const [employerContact, setEmployerContact] = useState("");
  const [clientStartDate, setClientStartDate] = useState("");
  const [clientEndDate, setClientEndDate] = useState("");
  const [incidents, setIncidents] = useState<Incident[]>([newIncident()]);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ProblemAnalysisReport[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setAuthorized(true);
    setClientName(s.name);
    if (s.role === "client") setClient(s);
    const list = loadProblemAnalysisReports();
    setReports(list);
    if (list.length > 0) setActiveId(list[0].id);
  }, [router]);

  const active = useMemo(
    () => reports.find((r) => r.id === activeId) ?? null,
    [reports, activeId],
  );

  function updateIncident(id: string, patch: Partial<Incident>) {
    setIncidents((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    );
  }
  function addIncident() {
    setIncidents((prev) => [...prev, newIncident()]);
  }
  function removeIncident(id: string) {
    setIncidents((prev) =>
      prev.length > 1 ? prev.filter((i) => i.id !== id) : prev,
    );
  }

  async function generate() {
    if (!employerName.trim()) {
      setError("Tell us the employer name.");
      return;
    }
    const validIncidents = incidents.filter(
      (i) => i.date.trim() && i.description.trim() && i.impact.trim(),
    );
    if (validIncidents.length === 0) {
      setError(
        "Log at least one incident with a date, description, and impact.",
      );
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const resp = await fetch("/api/generate-problem-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientRole,
          natureOfCondition: natureOfCondition || undefined,
          employerName,
          employerLocation,
          employerContact,
          clientStartDate,
          clientEndDate,
          incidents: validIncidents,
        }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: "Request failed" }));
        setError(body.error ?? "Generation failed.");
        setGenerating(false);
        return;
      }
      const data = (await resp.json()) as ApiResponse;
      const report: ProblemAnalysisReport = {
        id: newSelfAdvocacyId("par"),
        caseId: client?.caseId,
        clientName,
        clientRole,
        natureOfCondition,
        employerName,
        employerLocation,
        employerContact,
        clientStartDate,
        clientEndDate,
        incidents: validIncidents,
        executiveSummary: data.executiveSummary,
        patternAnalysis: data.patternAnalysis,
        legalCrossReference: data.legalCrossReference,
        nextSteps: data.nextSteps,
        createdAt: new Date().toISOString(),
        generatedByModel: "claude-opus-4-8",
      };
      saveProblemAnalysisReport(report);
      setReports(loadProblemAnalysisReports());
      setActiveId(report.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  function remove(id: string) {
    if (!window.confirm("Delete this Problem Analysis Report?")) return;
    deleteProblemAnalysisReport(id);
    const next = loadProblemAnalysisReports();
    setReports(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  }

  if (!authorized) return null;

  return (
    <div className="space-y-6">
      <header className="print:hidden">
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Self Advocacy · Discrimination Documentation
        </p>
        <h1 className="text-4xl mb-2">
          Problem <em className="italic text-accent">Analysis</em> Report
        </h1>
        <p className="text-ink/70 prose-narrow">
          Log every incident as it happens. We compile your timeline into
          a professional report with executive summary, statute cross-
          reference, and concrete next steps — ready for an attorney, the
          EEOC, or your state&apos;s Protection &amp; Advocacy agency.
        </p>
      </header>

      <section className="border border-ink/15 rounded-lg p-5 bg-cream space-y-4 print:hidden">
        <h2 className="text-xl">About you &amp; the employer</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Your name">
            <input
              className="input"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </Field>
          <Field label="Your role">
            <input
              className="input"
              value={clientRole}
              onChange={(e) => setClientRole(e.target.value)}
              placeholder="e.g., Cashier · Software Engineer"
            />
          </Field>
          <Field label="Employer name" required>
            <input
              className="input"
              value={employerName}
              onChange={(e) => setEmployerName(e.target.value)}
              required
            />
          </Field>
          <Field label="Employer location">
            <input
              className="input"
              value={employerLocation}
              onChange={(e) => setEmployerLocation(e.target.value)}
              placeholder="e.g., Chicago, IL"
            />
          </Field>
          <Field label="Employment start">
            <input
              type="date"
              className="input"
              value={clientStartDate}
              onChange={(e) => setClientStartDate(e.target.value)}
            />
          </Field>
          <Field label="Employment end (if separated)">
            <input
              type="date"
              className="input"
              value={clientEndDate}
              onChange={(e) => setClientEndDate(e.target.value)}
            />
          </Field>
          <Field label="Key contact (HR / manager name)">
            <input
              className="input"
              value={employerContact}
              onChange={(e) => setEmployerContact(e.target.value)}
            />
          </Field>
          <Field label="Disability context (optional)">
            <input
              className="input"
              value={natureOfCondition}
              onChange={(e) => setNatureOfCondition(e.target.value)}
              placeholder="e.g., chronic migraine, requesting accommodations on file"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-3 print:hidden">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <h2 className="text-xl">Incident log</h2>
          <span className="text-xs text-ink/55">
            {incidents.length} entr{incidents.length === 1 ? "y" : "ies"}
          </span>
        </div>
        {incidents.map((inc, idx) => (
          <IncidentForm
            key={inc.id}
            inc={inc}
            n={idx + 1}
            onChange={(p) => updateIncident(inc.id, p)}
            onRemove={() => removeIncident(inc.id)}
            removable={incidents.length > 1}
          />
        ))}
        <button
          onClick={addIncident}
          className="text-sm border border-accent text-accent px-3 py-1.5 rounded hover:bg-accent/5"
        >
          + Add another incident
        </button>
      </section>

      <div className="print:hidden">
        <button
          onClick={generate}
          disabled={generating}
          className="px-5 py-2.5 bg-accent text-cream rounded font-semibold disabled:opacity-50"
        >
          {generating
            ? "Compiling Problem Analysis Report with Claude Opus 4.8…"
            : reports.length > 0
              ? "Generate another report ✨"
              : "Compile Problem Analysis Report ✨"}
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

      {reports.length > 0 && (
        <section
          aria-label="Saved reports"
          className="border border-accent/30 bg-accent/5 rounded-lg p-4 print:hidden"
        >
          <h2 className="text-sm font-semibold mb-2">
            Saved reports ({reports.length})
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {reports.map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveId(r.id)}
                aria-pressed={activeId === r.id}
                className={`text-left text-xs border rounded p-2 ${
                  activeId === r.id
                    ? "border-accent bg-cream"
                    : "border-ink/15 bg-white hover:border-accent"
                }`}
              >
                <div className="font-semibold">{r.employerName}</div>
                <div className="text-ink/55">
                  {r.incidents.length} incidents ·{" "}
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(r.id);
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

      {active && <ReportPreview report={active} />}

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

function newIncident(): Incident {
  return {
    id: Math.random().toString(36).slice(2, 10),
    date: "",
    time: "",
    offenders: "",
    description: "",
    impact: "",
    witnesses: "",
    evidence: "",
  };
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

function IncidentForm({
  inc,
  n,
  onChange,
  onRemove,
  removable,
}: {
  inc: Incident;
  n: number;
  onChange: (p: Partial<Incident>) => void;
  onRemove: () => void;
  removable: boolean;
}) {
  return (
    <fieldset className="border border-ink/15 bg-cream rounded-lg p-4">
      <legend className="px-2 text-sm font-semibold text-accent">
        Incident #{n}
      </legend>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Date" required>
          <input
            className="input"
            value={inc.date}
            onChange={(e) => onChange({ date: e.target.value })}
            placeholder='YYYY-MM-DD or "Fall 2024"'
          />
        </Field>
        <Field label="Time of day (optional)">
          <input
            className="input"
            value={inc.time ?? ""}
            onChange={(e) => onChange({ time: e.target.value })}
            placeholder='e.g., "morning shift"'
          />
        </Field>
        <Field label="Offender(s) — name + role">
          <input
            className="input"
            value={inc.offenders}
            onChange={(e) => onChange({ offenders: e.target.value })}
            placeholder="e.g., M. Rivera (shift supervisor), HR rep S. Cole"
          />
        </Field>
        <Field label="Witnesses">
          <input
            className="input"
            value={inc.witnesses ?? ""}
            onChange={(e) => onChange({ witnesses: e.target.value })}
          />
        </Field>
      </div>
      <Field label="What happened — describe in order" required>
        <textarea
          className="input min-h-[80px] mt-3"
          value={inc.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </Field>
      <Field label="Impact on your employment or access" required>
        <textarea
          className="input min-h-[60px] mt-3"
          value={inc.impact}
          onChange={(e) => onChange({ impact: e.target.value })}
          placeholder="e.g., missed two shifts, lost promotion opportunity, denied accommodation"
        />
      </Field>
      <Field label="Evidence on file (emails, texts, photos)">
        <input
          className="input mt-3"
          value={inc.evidence ?? ""}
          onChange={(e) => onChange({ evidence: e.target.value })}
        />
      </Field>
      {removable && (
        <div className="text-right mt-3">
          <button
            onClick={onRemove}
            className="text-xs text-ink/55 hover:text-accent"
          >
            Remove incident
          </button>
        </div>
      )}
    </fieldset>
  );
}

function ReportPreview({ report }: { report: ProblemAnalysisReport }) {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-3 print:hidden">
        <h2 className="text-2xl">Problem Analysis Report</h2>
        <button
          onClick={() => window.print()}
          className="text-sm bg-accent text-cream px-4 py-2 rounded font-semibold"
        >
          🖨️ Print / Save as PDF
        </button>
      </div>

      <article className="par-page bg-white shadow-sm border border-ink/15 rounded-sm p-8 space-y-6">
        <header className="text-center border-b border-ink/15 pb-4">
          <h1 className="text-2xl font-semibold uppercase tracking-wider">
            Problem Analysis Report
          </h1>
          <p className="text-sm text-ink/65">
            Drafted {new Date(report.createdAt).toLocaleDateString()} ·
            Prepared for: {report.clientName}
          </p>
        </header>

        <Section title="Executive Summary">
          <p className="text-sm leading-relaxed">{report.executiveSummary}</p>
        </Section>

        <Section title="Employer Information">
          <ul className="text-sm space-y-1">
            <li><strong>Employer:</strong> {report.employerName}</li>
            {report.employerLocation && (
              <li><strong>Location:</strong> {report.employerLocation}</li>
            )}
            {report.employerContact && (
              <li><strong>Key contact:</strong> {report.employerContact}</li>
            )}
            {report.clientRole && (
              <li><strong>Complainant role:</strong> {report.clientRole}</li>
            )}
            {report.clientStartDate && (
              <li><strong>Employment dates:</strong> {report.clientStartDate}{report.clientEndDate ? ` to ${report.clientEndDate}` : " (current)"}</li>
            )}
          </ul>
        </Section>

        <Section title="Chronological Incident Log">
          <table className="text-sm w-full">
            <thead>
              <tr className="border-b border-ink/30">
                <th className="text-left py-1 pr-3">Date</th>
                <th className="text-left py-1 pr-3">Offender(s)</th>
                <th className="text-left py-1 pr-3">Description</th>
                <th className="text-left py-1">Impact</th>
              </tr>
            </thead>
            <tbody>
              {report.incidents.map((i, idx) => (
                <tr key={idx} className="border-b border-ink/10 align-top">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {i.date}
                    {i.time && <div className="text-xs text-ink/55">{i.time}</div>}
                  </td>
                  <td className="py-2 pr-3">{i.offenders}</td>
                  <td className="py-2 pr-3">
                    {i.description}
                    {i.witnesses && (
                      <div className="text-xs text-ink/55 mt-1">
                        Witnesses: {i.witnesses}
                      </div>
                    )}
                    {i.evidence && (
                      <div className="text-xs text-ink/55">
                        Evidence: {i.evidence}
                      </div>
                    )}
                  </td>
                  <td className="py-2">{i.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        <Section title="Pattern Analysis">
          <p className="text-sm leading-relaxed">{report.patternAnalysis}</p>
        </Section>

        <Section title="Legal &amp; Advocacy Cross-Reference">
          <div className="space-y-3">
            {report.legalCrossReference.map((l, i) => (
              <div key={i} className="border-l-4 border-accent pl-3">
                <h3 className="font-semibold text-sm">{l.law}</h3>
                <p className="text-sm text-ink/80">{l.analysis}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Next Steps">
          <ol className="text-sm list-decimal pl-5 space-y-2">
            {report.nextSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </Section>

        <footer className="text-xs text-ink/55 italic border-t border-ink/15 pt-4">
          {LEGAL_DISCLAIMER}
        </footer>
      </article>

      <style jsx>{`
        .par-page {
          font-family: Georgia, "Times New Roman", Times, serif;
          color: #1a1a1a;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .par-page,
          .par-page * {
            visibility: visible;
          }
          .par-page {
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none;
            border: none;
            padding: 0.6in;
          }
        }
      `}</style>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold uppercase tracking-wider text-ink border-b border-ink/30 pb-1 mb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}
