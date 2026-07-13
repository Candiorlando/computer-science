"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { ClientUser } from "@/lib/users";
import {
  loadOCRComplaints,
  saveOCRComplaint,
  deleteOCRComplaint,
  newSelfAdvocacyId,
  LEGAL_DISCLAIMER,
  type CivilRightsAgency,
  type OCRDOJComplaint,
  type RespondentType,
} from "@/lib/self-advocacy";
import { recordCaseNoteEvent } from "@/lib/case-notes";

const RIGHTS = [
  "ADA Title II (state/local government)",
  "ADA Title III (public accommodations)",
  "Section 504 (Rehabilitation Act)",
  "Section 508 (electronic accessibility)",
  "IDEA (K-12 special education)",
  "ACA Section 1557 (healthcare)",
];

interface ApiResponse {
  formalComplaint: string;
  legalBasis: string;
  remediesSought: string[];
}

export default function OCRDOJPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [client, setClient] = useState<ClientUser | null>(null);

  const [agency, setAgency] = useState<CivilRightsAgency>("DOJ-DRS");
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [respondentName, setRespondentName] = useState("");
  const [respondentType, setRespondentType] =
    useState<RespondentType>("state-government");
  const [respondentAddress, setRespondentAddress] = useState("");
  const [respondentContact, setRespondentContact] = useState("");
  const [whatHappened, setWhatHappened] = useState("");
  const [whenHappened, setWhenHappened] = useState("");
  const [rightsViolated, setRightsViolated] = useState<string[]>([
    "ADA Title II (state/local government)",
  ]);
  const [priorComplaints, setPriorComplaints] = useState("");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complaints, setComplaints] = useState<OCRDOJComplaint[]>([]);
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
    const list = loadOCRComplaints();
    setComplaints(list);
    if (list.length > 0) setActiveId(list[0].id);
  }, [router]);

  const active = useMemo(
    () => complaints.find((c) => c.id === activeId) ?? null,
    [complaints, activeId],
  );

  function toggleRight(r: string) {
    setRightsViolated((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );
  }

  async function generate() {
    if (whatHappened.length < 20) {
      setError("Tell us what happened — at least a couple of sentences.");
      return;
    }
    if (rightsViolated.length === 0) {
      setError("Pick at least one right that was violated.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const resp = await fetch("/api/generate-ocr-doj-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agency,
          clientName,
          clientAddress,
          clientPhone,
          clientEmail,
          respondentName,
          respondentType,
          respondentAddress,
          respondentContact,
          whatHappened,
          whenHappened,
          rightsViolated,
          priorComplaints,
        }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: "Request failed" }));
        setError(body.error ?? "Generation failed.");
        setGenerating(false);
        return;
      }
      const data = (await resp.json()) as ApiResponse;
      const complaint: OCRDOJComplaint = {
        id: newSelfAdvocacyId("ocr"),
        caseId: client?.caseId,
        agency,
        clientName,
        clientAddress,
        clientPhone,
        clientEmail,
        respondentName,
        respondentType,
        respondentAddress,
        respondentContact,
        whatHappened,
        whenHappened,
        rightsViolated,
        priorComplaints,
        formalComplaint: data.formalComplaint,
        legalBasis: data.legalBasis,
        remediesSought: data.remediesSought,
        createdAt: new Date().toISOString(),
        generatedByModel: "claude-opus-4-8",
      };
      saveOCRComplaint(complaint);
      setComplaints(loadOCRComplaints());
      setActiveId(complaint.id);
      recordCaseNoteEvent({
        kind: "ocr-doj-complaint-generated",
        participantType: "individual-client",
        caseId: client?.caseId,
        clientName,
        sourceArtifactId: complaint.id,
        agency,
        respondentName,
        rightsViolated,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  function remove(id: string) {
    if (!window.confirm("Delete this complaint?")) return;
    deleteOCRComplaint(id);
    const next = loadOCRComplaints();
    setComplaints(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  }

  if (!authorized) return null;

  return (
    <div className="space-y-6">
      <header className="print:hidden">
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Self Advocacy · OCR / DOJ Civil Rights Complaint
        </p>
        <h1 className="text-4xl mb-2">
          OCR / DOJ <em className="italic text-accent">Complaint</em> Draft
        </h1>
        <p className="text-ink/70 prose-narrow">
          For discrimination by schools, healthcare providers, state/local
          government, federally-funded programs, or public accommodations —
          not employment. The EEOC handles employment; these agencies handle
          everything else.
        </p>
      </header>

      <FormBlock title="Which agency?">
        <select
          value={agency}
          onChange={(e) => setAgency(e.target.value as CivilRightsAgency)}
          className="input max-w-md"
        >
          <option value="DOJ-DRS">DOJ — Civil Rights Division, Disability Rights Section (state/local government, ADA Title II / III, public schools)</option>
          <option value="OCR-HHS">OCR-HHS — Health &amp; Human Services (healthcare, social services)</option>
        </select>
        <p className="text-xs text-ink/55 mt-2 italic">
          Note: the Department of Education Office for Civil Rights is no
          longer accepting new disability rights complaints. K-12 and higher
          education ADA Title II complaints now route to DOJ-DRS.
        </p>
      </FormBlock>

      <FormBlock title="Complainant (you)">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Full name"><input className="input" value={clientName} onChange={(e) => setClientName(e.target.value)} /></Field>
          <Field label="Email"><input type="email" className="input" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} /></Field>
          <Field label="Mailing address"><input className="input" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} /></Field>
          <Field label="Phone"><input type="tel" className="input" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} /></Field>
        </div>
      </FormBlock>

      <FormBlock title="Respondent">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Organization name"><input className="input" value={respondentName} onChange={(e) => setRespondentName(e.target.value)} /></Field>
          <Field label="Type">
            <select className="input" value={respondentType} onChange={(e) => setRespondentType(e.target.value as RespondentType)}>
              <option value="state-government">State government</option>
              <option value="local-government">Local government</option>
              <option value="public-school">Public school (K-12)</option>
              <option value="higher-education-institution">Higher education</option>
              <option value="federally-funded-program">Federally-funded program</option>
              <option value="public-accommodation">Public accommodation (private business)</option>
            </select>
          </Field>
          <Field label="Address"><input className="input" value={respondentAddress} onChange={(e) => setRespondentAddress(e.target.value)} /></Field>
          <Field label="Contact / official (if known)"><input className="input" value={respondentContact} onChange={(e) => setRespondentContact(e.target.value)} /></Field>
        </div>
      </FormBlock>

      <FormBlock title="Allegation">
        <fieldset className="space-y-2 mb-3">
          <legend className="text-sm text-ink/80 mb-1">Right(s) violated (check all that apply)</legend>
          <div className="grid sm:grid-cols-2 gap-2">
            {RIGHTS.map((r) => {
              const checked = rightsViolated.includes(r);
              return (
                <label key={r} className={`text-xs border rounded p-2 cursor-pointer ${checked ? "border-accent bg-accent/10 font-semibold text-accent" : "border-ink/20 bg-white hover:border-accent"}`}>
                  <input type="checkbox" className="mr-2 accent-accent" checked={checked} onChange={() => toggleRight(r)} />
                  {r}
                </label>
              );
            })}
          </div>
        </fieldset>
        <Field label="When did this happen?">
          <input className="input" value={whenHappened} onChange={(e) => setWhenHappened(e.target.value)} placeholder='YYYY-MM-DD, range, or "Spring 2025"' />
        </Field>
        <Field label="What happened (in your own words)">
          <textarea className="input min-h-[150px]" value={whatHappened} onChange={(e) => setWhatHappened(e.target.value)} placeholder="Tell the investigator what happened. Be specific: names, dates, locations, exactly what was denied or done." required />
        </Field>
        <Field label="Prior filings, appeals, or contacts with the respondent">
          <textarea className="input min-h-[60px]" value={priorComplaints} onChange={(e) => setPriorComplaints(e.target.value)} placeholder="e.g., I filed an internal grievance on 2025-03-12 and never received a response." />
        </Field>
      </FormBlock>

      <div className="print:hidden">
        <button onClick={generate} disabled={generating} className="px-5 py-2.5 bg-accent text-cream rounded font-semibold disabled:opacity-50">
          {generating ? "Drafting complaint with Claude Opus 4.8…" : complaints.length > 0 ? "Generate another draft ✨" : "Draft civil rights complaint ✨"}
        </button>
        {error && (
          <div role="alert" aria-live="polite" className="mt-3 text-sm border border-accent/40 bg-accent/10 text-accent p-3 rounded">
            {error}
          </div>
        )}
      </div>

      {complaints.length > 0 && (
        <section className="border border-accent/30 bg-accent/5 rounded-lg p-4 print:hidden">
          <h2 className="text-sm font-semibold mb-2">Saved complaints ({complaints.length})</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {complaints.map((c) => (
              <button key={c.id} onClick={() => setActiveId(c.id)} aria-pressed={activeId === c.id} className={`text-left text-xs border rounded p-2 ${activeId === c.id ? "border-accent bg-cream" : "border-ink/15 bg-white hover:border-accent"}`}>
                <div className="font-semibold">{c.respondentName}</div>
                <div className="text-ink/55">{c.agency}</div>
                <div className="text-ink/55">{new Date(c.createdAt).toLocaleDateString()}</div>
                <button onClick={(e) => { e.stopPropagation(); remove(c.id); }} className="text-ink/40 hover:text-accent mt-1">Delete</button>
              </button>
            ))}
          </div>
        </section>
      )}

      {active && <ComplaintPreview complaint={active} />}

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: #1E293B;
          border: 1px solid rgba(230, 234, 242, 0.2);
          border-radius: 6px;
          padding: 0.55rem 0.75rem;
          font-family: inherit;
        }
        :global(.input:focus-visible) {
          outline: 2px solid #6366F1;
          outline-offset: -1px;
        }
      `}</style>
    </div>
  );
}

function FormBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-ink/15 rounded-lg p-5 bg-cream print:hidden">
      <h2 className="text-xl mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block mb-1 text-sm text-ink/80">{label}</span>
      {children}
    </label>
  );
}

function ComplaintPreview({ complaint }: { complaint: OCRDOJComplaint }) {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-3 print:hidden">
        <h2 className="text-2xl">Civil Rights Complaint — Draft</h2>
        <button onClick={() => window.print()} className="text-sm bg-accent text-cream px-4 py-2 rounded font-semibold">🖨️ Print / Save as PDF</button>
      </div>
      <article className="ocr-page bg-white shadow-sm border border-ink/15 rounded-sm p-8 space-y-6">
        <header className="text-center border-b border-ink/15 pb-4">
          <h1 className="text-xl font-semibold uppercase tracking-wider">
            {complaint.agency} Civil Rights Complaint — Draft
          </h1>
          <p className="text-sm text-ink/65 mt-1">
            Complainant: {complaint.clientName} · Respondent: {complaint.respondentName}
          </p>
        </header>

        <section>
          <h2 className="font-semibold mb-2 uppercase tracking-wider text-sm">Formal Complaint</h2>
          <p className="text-sm whitespace-pre-line leading-relaxed">{complaint.formalComplaint}</p>
        </section>

        <section>
          <h2 className="font-semibold mb-2 uppercase tracking-wider text-sm">Legal Basis</h2>
          <p className="text-sm">{complaint.legalBasis}</p>
        </section>

        <section>
          <h2 className="font-semibold mb-2 uppercase tracking-wider text-sm">Remedies Sought</h2>
          <ul className="text-sm list-disc pl-5 space-y-1">
            {complaint.remediesSought.map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </section>

        <footer className="text-xs text-ink/55 italic border-t border-ink/15 pt-4">
          {LEGAL_DISCLAIMER}
        </footer>
      </article>

      <style jsx>{`
        .ocr-page { font-family: Georgia, "Times New Roman", Times, serif; color: #1a1a1a; }
        @media print {
          body * { visibility: hidden; }
          .ocr-page, .ocr-page * { visibility: visible; }
          .ocr-page { position: absolute; left: 0; top: 0; box-shadow: none; border: none; padding: 0.6in; }
        }
      `}</style>
    </div>
  );
}
