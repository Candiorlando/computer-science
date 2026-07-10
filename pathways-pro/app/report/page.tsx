"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import {
  CLIENTS,
  getCounselorClients,
  type AnyUser,
  type ClientUser,
  type CounselorUser,
} from "@/lib/users";
import {
  listClientReports,
  loadClientReport,
  patchClientReport,
  type ClientReport,
} from "@/lib/client-report";
import { loadProfile } from "@/lib/storage";
import { loadTSA } from "@/lib/tsa-storage";
import { rankOccupations } from "@/lib/onet-data";
import { riasecNames, traitNames } from "@/lib/assessments";
import { analyzeHollandCode } from "@/lib/holland-analysis";
import { nameWithInitial } from "@/lib/document-id";
import { supportLabel } from "@/lib/intake-supports";
import { notesForClient } from "@/lib/case-notes";
import { CaseNotesPanel } from "@/components/CaseNotesPanel";
import type { IPE } from "@/lib/ipe";
import { loadScreenerResults, SCREENERS, type ScreenerResult } from "@/lib/screeners";

// ─── Clinical IPE Report (CRC formal structure) ─────────────────────────
interface ClinicalReport {
  clientProfile: string;
  disabilityAndFunctionalLimitations: {
    primaryDisability: string;
    secondaryConditions: string;
    functionalLimitations: string[];
    impedimentNarrative: string;
  };
  vocationalAssessmentSummary: {
    transferableSkills: string[];
    aptitudes: string[];
    careerInterests: string[];
    summaryNarrative: string;
  };
  proposedEmploymentGoal: {
    goal: string;
    socCode: string;
    justification: string;
  };
  barrierMitigationAndServices: {
    assistiveTechAndAccommodations: string[];
    placementServices: string[];
    trainingAndEducation: string[];
  };
  clientResponsibilitiesAndMilestones: {
    immediateActions: string[];
    shortTermMilestones: string[];
    longTermMilestones: string[];
  };
  generatedAt: string;
}

const CLINICAL_KEY_PREFIX = "pathways-pro:clinical-report-v1:";

function loadClinicalReport(caseId: string): ClinicalReport | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CLINICAL_KEY_PREFIX + caseId);
    return raw ? (JSON.parse(raw) as ClinicalReport) : null;
  } catch {
    return null;
  }
}

function saveClinicalReport(caseId: string, report: ClinicalReport) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    CLINICAL_KEY_PREFIX + caseId,
    JSON.stringify(report),
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={<p className="text-ink/50">Loading…</p>}>
      <ReportInner />
    </Suspense>
  );
}

function ReportInner() {
  const router = useRouter();
  const search = useSearchParams();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = loadSession();
    if (!s) {
      router.replace("/");
      return;
    }
    setUser(s);

    // For clients, also self-sync any local data so the report is current
    if (s.role === "client") {
      const c = s as ClientUser;
      const profile = loadProfile();
      const tsa = loadTSA();
      const matches = profile.riasec
        ? rankOccupations(profile.riasec)
            .slice(0, 10)
            .map((m) => ({
              title: m.occ.title,
              socCode: m.occ.socCode,
              fit: Math.round(m.fit * 33),
              riasec: m.occ.riasec.join(""),
            }))
        : undefined;
      patchClientReport(c.caseId, c.name, {
        clientDob: c.dob,
        counselorName: c.counselorName,
        intake: profile.intake,
        bigFive: profile.bigFive,
        riasec: profile.riasec,
        hollandCode: profile.hollandCode,
        assessmentCompletedAt: profile.completedAt,
        topMatches: matches,
        tsa: tsa ?? undefined,
      });
    }
  }, [router]);

  if (!mounted || !user) return null;
  if (user.role === "counselor")
    return <CounselorReportPicker user={user} caseIdParam={search.get("case")} />;
  return <ReportDocument caseId={(user as ClientUser).caseId} isClient />;
}

function CounselorReportPicker({
  user,
  caseIdParam,
}: {
  user: CounselorUser;
  caseIdParam: string | null;
}) {
  const router = useRouter();
  const clients = getCounselorClients(user);

  const [selected, setSelected] = useState<string | null>(caseIdParam);
  const allReports = useMemo(
    () => (typeof window !== "undefined" ? listClientReports() : []),
    [],
  );

  if (selected) {
    return (
      <ReportDocument
        caseId={selected}
        onBack={() => {
          setSelected(null);
          router.replace("/report");
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Assessment Reports
        </p>
        <h1 className="text-4xl mb-2">Pick a client to view their report</h1>
        <p className="text-ink/70 prose-narrow">
          Each report aggregates the client&apos;s intake, Big Five, RIASEC
          interest profile, top occupation matches, transferable skills
          analysis, and IPE status — all in one printable document.
        </p>
      </header>

      <div className="grid md:grid-cols-2 gap-3">
        {clients.map((c) => {
          const r = allReports.find((x) => x.caseId === c.caseId);
          return (
            <button
              key={c.email}
              onClick={() => setSelected(c.caseId)}
              className="text-left border border-ink/15 rounded-lg p-4 bg-cream hover:border-accent transition"
            >
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="font-semibold">{c.name}</span>
                <span className="text-xs text-ink/50">{c.caseId}</span>
              </div>
              <div className="text-xs text-ink/60">Goal: {c.goal}</div>
              <div className="mt-2 flex items-center gap-1 flex-wrap text-xs">
                <ReportBadge label="Intake" present={!!r?.intake} />
                <ReportBadge label="Assessment" present={!!r?.hollandCode} />
                <ReportBadge label="TSA" present={!!r?.tsa} />
                <ReportBadge label="IPE" present={!!r?.ipeStatus} />
              </div>
              <div className="text-xs text-accent mt-3">View report →</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ReportBadge({ label, present }: { label: string; present: boolean }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
        present
          ? "bg-green-100 text-green-800"
          : "bg-ink/5 text-ink/40"
      }`}
    >
      {present ? "✓" : "○"} {label}
    </span>
  );
}

function ReportDocument({
  caseId,
  isClient,
  onBack,
}: {
  caseId: string;
  isClient?: boolean;
  onBack?: () => void;
}) {
  const [report, setReport] = useState<ClientReport | null>(null);
  const [clinical, setClinical] = useState<ClinicalReport | null>(null);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    setReport(loadClientReport(caseId));
    setClinical(loadClinicalReport(caseId));
  }, [caseId]);

  async function generateClinical() {
    if (!report) return;
    setGenError(null);
    setGenerating(true);
    try {
      const age = report.intake?.age;
      const isYouth =
        !!age &&
        (parseInt(age) <= 21 ||
          /youth|hs|high school|teen/i.test(age));
      const resp = await fetch("/api/generate-clinical-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: report.clientName,
          caseId: report.caseId,
          clientDob: report.clientDob,
          counselorName: report.counselorName,
          isTransitionYouth: isYouth,
          intake: report.intake,
          bigFive: report.bigFive,
          riasec: report.riasec,
          hollandCode: report.hollandCode,
          topMatches: report.topMatches,
          tsa: report.tsa,
          ipe: report.ipe,
          screenerResults: (typeof window !== "undefined"
            ? loadScreenerResults()
            : []
          ).map((r) => ({
            acronym: r.acronym,
            domain: SCREENERS[r.screenerId]?.domain ?? "",
            totalScore: r.totalScore,
            maxScore: r.maxScore,
            bandLabel: r.band.label,
            bandGuidance: r.band.guidance,
          })),
        }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: "Request failed" }));
        setGenError(body.error ?? "Generation failed.");
        setGenerating(false);
        return;
      }
      const data = (await resp.json()) as Omit<ClinicalReport, "generatedAt">;
      const cr: ClinicalReport = {
        ...data,
        generatedAt: new Date().toISOString(),
      };
      saveClinicalReport(caseId, cr);
      setClinical(cr);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  if (!report) {
    return (
      <div className="space-y-4">
        {onBack && (
          <button onClick={onBack} className="text-sm text-accent hover:underline">
            ← Back to client list
          </button>
        )}
        <h1 className="text-3xl">No report yet</h1>
        <p className="text-ink/70">
          {isClient
            ? "Once you complete your intake and assessment, your report will appear here."
            : "This client hasn't completed any assessments yet."}
        </p>
        {isClient && (
          <Link href="/intake" className="text-accent hover:underline">
            Start with intake →
          </Link>
        )}
      </div>
    );
  }

  const hasAssessment = !!report.hollandCode && !!report.bigFive && !!report.riasec;
  const ipeFullySigned =
    report.ipe?.counselorSignature.signed &&
    report.ipe?.clientSignature.signed;
  const hollandAnalysis = hasAssessment
    ? analyzeHollandCode(report.hollandCode!)
    : null;
  const screenerResults =
    typeof window !== "undefined" ? loadScreenerResults() : [];

  return (
    <div className="space-y-5">
      <div className="flex items-baseline justify-between gap-4 flex-wrap print:hidden">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm text-accent hover:underline mb-1"
            >
              ← Back to client list
            </button>
          )}
          <h1 className="text-2xl">Assessment Report</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!isClient && ipeFullySigned && (
            <button
              onClick={generateClinical}
              disabled={generating}
              className="bg-emerald-700 text-white px-4 py-2 rounded font-semibold text-sm disabled:opacity-50"
            >
              {generating
                ? "Synthesizing with Claude Opus 4.8…"
                : clinical
                  ? "Re-generate Clinical IPE Report ↻"
                  : "🧠 Generate Clinical IPE Report"}
            </button>
          )}
          {!isClient && hasAssessment && (
            <Link
              href={`/labor-market?case=${report.caseId}`}
              className="border border-accent text-accent px-4 py-2 rounded font-semibold text-sm hover:bg-accent/5"
            >
              📊 Labor Market Analysis →
            </Link>
          )}
          {!isClient && (
            <Link
              href="/clinical-assessments"
              className="border border-ink/20 px-4 py-2 rounded text-sm hover:bg-ink/5"
            >
              📚 Recommend an assessment
            </Link>
          )}
          <button
            onClick={() => window.print()}
            className="bg-accent text-cream px-4 py-2 rounded font-semibold text-sm"
          >
            🖨️ Print / Save as PDF
          </button>
        </div>
      </div>
      {genError && (
        <div className="text-sm border border-accent/40 bg-accent/10 text-accent p-3 rounded print:hidden">
          {genError}
        </div>
      )}

      {ipeFullySigned && (
        <section className="border border-emerald-300 bg-emerald-50 rounded-lg p-5 print:hidden">
          <h2 className="text-lg font-semibold text-emerald-900 mb-1">
            ✓ Comprehensive IPE Report is ready
          </h2>
          <p className="text-sm text-emerald-900/80">
            Both signatures are in. This report now includes the full signed
            IPE plan, assessment results with analysis, transferable skills,
            and a career-personality match section. Use{" "}
            <strong>Print / Save as PDF</strong> above for a single PDF.
          </p>
        </section>
      )}

      <article className="report-page bg-white shadow-sm border border-ink/15 rounded-sm">
        <ReportHeader
          report={report}
          comprehensive={!!ipeFullySigned}
        />

        {ipeFullySigned && report.ipe && (
          <ExecutiveSummaryBlock
            report={report}
            ipe={report.ipe}
            hollandAnalysis={hollandAnalysis}
          />
        )}

        {clinical && <ClinicalReportBlock report={clinical} />}

        {(report.intake?.goals || report.ipe?.employmentGoal) && (
          <ClientGoalsBlock report={report} />
        )}

        {report.intake && <IntakeBlock intake={report.intake} />}

        {hasAssessment && (
          <AssessmentBlock
            bigFive={report.bigFive!}
            riasec={report.riasec!}
            hollandCode={report.hollandCode!}
            completedAt={report.assessmentCompletedAt}
          />
        )}

        {hollandAnalysis && (
          <HollandAnalysisBlock analysis={hollandAnalysis} />
        )}

        {screenerResults.length > 0 && (
          <ScreenerResultsBlock results={screenerResults} />
        )}

        {report.topMatches && report.topMatches.length > 0 && (
          <MatchesBlock matches={report.topMatches} />
        )}

        {report.tsa && (
          <>
            <TSAHighlightBlock tsa={report.tsa} />
            <TSABlock tsa={report.tsa} />
          </>
        )}

        {ipeFullySigned && report.ipe && <IPEPlanBlock ipe={report.ipe} />}

        {report.ipeStatus && !ipeFullySigned && (
          <IPEBlock status={report.ipeStatus} updatedAt={report.ipeUpdatedAt} />
        )}

        <FooterBlock report={report} />
      </article>

      {/* Case Notes (auto-generated DAP) — shown only on screen, not
          on the printable assessment report PDF. */}
      <div className="print:hidden">
        <CaseNotesPanel
          notes={notesForClient(report.caseId)}
          title="Case notes (auto-generated DAP)"
          emptyLabel="No case notes generated yet — they appear as the client uses platform tools."
        />
      </div>

      <style jsx global>{`
        .report-page {
          font-family: Georgia, "Times New Roman", Times, serif;
          color: #1a1a1a;
          background: #ffffff;
          padding: 0.6in 0.7in;
          max-width: 8.5in;
          margin: 0 auto;
          font-size: 11pt;
          line-height: 1.5;
        }
        .report-page h1.r-name {
          font-size: 22pt;
          margin: 0 0 4px;
          letter-spacing: 0.02em;
        }
        .report-page .r-meta {
          color: #555;
          font-size: 10pt;
        }
        .report-page .r-head {
          border-bottom: 1.5pt solid #1a1a1a;
          padding-bottom: 8px;
          margin-bottom: 14px;
        }
        .report-page h2 {
          font-size: 12pt;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-bottom: 0.5pt solid #999;
          padding-bottom: 2px;
          margin: 14px 0 8px;
        }
        .report-page h3 {
          font-size: 11pt;
          margin: 8px 0 4px;
          font-style: italic;
          color: #444;
        }
        .report-page section {
          margin-bottom: 10px;
        }
        .report-page p {
          margin: 0 0 6px;
        }
        .report-page ul {
          margin: 4px 0 6px;
          padding-left: 18px;
        }
        .report-page li {
          margin-bottom: 3px;
        }
        .report-page .r-grid {
          display: grid;
          grid-template-columns: max-content 1fr;
          gap: 4px 16px;
          font-size: 10.5pt;
        }
        .report-page .r-grid dt {
          font-weight: bold;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-size: 9pt;
          padding-top: 2px;
        }
        .report-page .r-grid dd {
          margin: 0;
        }
        .report-page .r-bar {
          display: grid;
          grid-template-columns: 130px 1fr 40px;
          gap: 8px;
          align-items: center;
          font-size: 10pt;
          margin-bottom: 3px;
        }
        .report-page .r-bar .r-bar-fill {
          height: 6px;
          background: #e5e5e5;
          border-radius: 3px;
          overflow: hidden;
        }
        .report-page .r-bar .r-bar-fill span {
          display: block;
          height: 100%;
          background: #0F6B54;
        }
        .report-page .r-bar .r-bar-val {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }
        .report-page .holland-row {
          display: flex;
          gap: 10px;
          margin: 8px 0 12px;
        }
        .report-page .holland-letter {
          width: 38px;
          height: 38px;
          border-radius: 6px;
          display: grid;
          place-items: center;
          font-weight: bold;
          font-size: 14pt;
          background: #0F6B54;
          color: white;
        }
        .report-page .holland-letter.s2 {
          background: #e5e5e5;
          color: #1a1a1a;
        }
        .report-page .holland-letter.s3 {
          background: #f5f5f5;
          color: #666;
        }
        .report-page .match-row {
          display: grid;
          grid-template-columns: 1.5rem 1fr auto;
          gap: 8px;
          align-items: baseline;
          padding: 4px 0;
          border-bottom: 0.5pt dotted #ccc;
          font-size: 10.5pt;
        }
        .report-page .match-row:last-child {
          border-bottom: none;
        }
        .report-page .match-row .m-rank {
          color: #999;
          font-variant-numeric: tabular-nums;
        }
        .report-page .match-row .m-fit {
          color: #0F6B54;
          font-weight: bold;
        }
        .report-page .skill-card {
          margin-bottom: 8px;
          page-break-inside: avoid;
        }
        .report-page .skill-card .s-bullet {
          font-style: italic;
          color: #555;
          font-size: 10pt;
        }
        .report-page .r-footer {
          margin-top: 18px;
          padding-top: 8px;
          border-top: 0.5pt solid #ccc;
          font-size: 9pt;
          color: #666;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .report-page,
          .report-page * {
            visibility: visible;
          }
          .report-page {
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none;
            border: none;
          }
        }
      `}</style>
    </div>
  );
}

function ReportHeader({
  report,
  comprehensive,
}: {
  report: ClientReport;
  comprehensive?: boolean;
}) {
  // Printable docs identify the client by case ID + "First L." initial so
  // shared copies (with employers, vendors, training providers) don't
  // carry the client's full last name on every page.
  return (
    <header className="r-head">
      <h1 className="r-name">{nameWithInitial(report.clientName)}</h1>
      <p className="r-meta">
        Pathways Pro {comprehensive ? "Comprehensive IPE Report" : "Assessment Report"} · Case{" "}
        {report.caseId}
        {report.clientDob && ` · DOB ${report.clientDob}`}
        {report.counselorName && ` · Counselor: ${report.counselorName}`}
      </p>
      <p className="r-meta">
        Last updated {new Date(report.lastUpdated).toLocaleString()}
      </p>
    </header>
  );
}

function ClinicalReportBlock({ report }: { report: ClinicalReport }) {
  const dl = report.disabilityAndFunctionalLimitations;
  const va = report.vocationalAssessmentSummary;
  const eg = report.proposedEmploymentGoal;
  const bm = report.barrierMitigationAndServices;
  const cr = report.clientResponsibilitiesAndMilestones;

  return (
    <section style={{ pageBreakBefore: "always" }}>
      <h2 style={{ textAlign: "center", letterSpacing: "0.04em" }}>
        Clinical Individualized Plan for Employment Report
      </h2>
      <p
        style={{
          textAlign: "center",
          fontSize: "10pt",
          color: "#666",
          marginTop: "-4px",
        }}
      >
        Prepared per WIOA Title IV § 102(b) · CRCC ethical standards · AI-synthesized
        from source data, counselor-reviewed
      </p>

      <h3>1. Client Profile &amp; Background</h3>
      <p>{report.clientProfile}</p>

      <h3>2. Disability &amp; Functional Limitations</h3>
      <p>
        <strong>Primary disability:</strong> {dl.primaryDisability}
      </p>
      {dl.secondaryConditions && (
        <p>
          <strong>Secondary conditions:</strong> {dl.secondaryConditions}
        </p>
      )}
      {dl.functionalLimitations.length > 0 && (
        <>
          <p style={{ marginBottom: "2px" }}>
            <strong>Functional limitations:</strong>
          </p>
          <ul>
            {dl.functionalLimitations.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </>
      )}
      <p>
        <em>Substantial impediment to employment:</em> {dl.impedimentNarrative}
      </p>

      <h3>3. Vocational Assessment Summary</h3>
      {va.transferableSkills.length > 0 && (
        <>
          <p style={{ marginBottom: "2px" }}>
            <strong>Transferable skills:</strong>
          </p>
          <ul>
            {va.transferableSkills.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </>
      )}
      {va.aptitudes.length > 0 && (
        <>
          <p style={{ marginBottom: "2px" }}>
            <strong>Aptitudes:</strong>
          </p>
          <ul>
            {va.aptitudes.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}
      {va.careerInterests.length > 0 && (
        <>
          <p style={{ marginBottom: "2px" }}>
            <strong>Career interests:</strong>
          </p>
          <ul>
            {va.careerInterests.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </>
      )}
      <p>{va.summaryNarrative}</p>

      <h3>4. Proposed Employment Goal</h3>
      <p>
        <strong>{eg.goal}</strong>{" "}
        <span style={{ color: "#555" }}>(O*NET {eg.socCode})</span>
      </p>
      <p>{eg.justification}</p>

      <h3>5. Barrier Mitigation &amp; Required Services</h3>
      {bm.assistiveTechAndAccommodations.length > 0 && (
        <>
          <p style={{ marginBottom: "2px", marginTop: "8px" }}>
            <strong>Assistive technology &amp; workplace accommodations:</strong>
          </p>
          <ul>
            {bm.assistiveTechAndAccommodations.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}
      {bm.placementServices.length > 0 && (
        <>
          <p style={{ marginBottom: "2px", marginTop: "8px" }}>
            <strong>Job placement &amp; supported employment services:</strong>
          </p>
          <ul>
            {bm.placementServices.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </>
      )}
      {bm.trainingAndEducation.length > 0 && (
        <>
          <p style={{ marginBottom: "2px", marginTop: "8px" }}>
            <strong>Training &amp; educational programs:</strong>
          </p>
          <ul>
            {bm.trainingAndEducation.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </>
      )}

      <h3>6. Client Responsibilities &amp; Milestones</h3>
      {cr.immediateActions.length > 0 && (
        <>
          <p style={{ marginBottom: "2px", marginTop: "8px" }}>
            <strong>Immediate actions (0–30 days):</strong>
          </p>
          <ul>
            {cr.immediateActions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}
      {cr.shortTermMilestones.length > 0 && (
        <>
          <p style={{ marginBottom: "2px", marginTop: "8px" }}>
            <strong>Short-term milestones (1–6 months):</strong>
          </p>
          <ul>
            {cr.shortTermMilestones.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </>
      )}
      {cr.longTermMilestones.length > 0 && (
        <>
          <p style={{ marginBottom: "2px", marginTop: "8px" }}>
            <strong>Long-term milestones (6+ months):</strong>
          </p>
          <ul>
            {cr.longTermMilestones.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </>
      )}

      <p
        style={{
          fontSize: "9pt",
          color: "#666",
          marginTop: "16px",
          borderTop: "0.5pt solid #ccc",
          paddingTop: "6px",
        }}
      >
        Synthesized by Claude Opus 4.8 on{" "}
        {new Date(report.generatedAt).toLocaleString()}. This narrative is a
        counselor-reviewed clinical synthesis of source data. It does not
        replace the counselor&apos;s professional judgment or the signed IPE
        instrument.
      </p>
    </section>
  );
}

function ExecutiveSummaryBlock({
  report,
  ipe,
  hollandAnalysis,
}: {
  report: ClientReport;
  ipe: IPE;
  hollandAnalysis: NonNullable<ReturnType<typeof analyzeHollandCode>> | null;
}) {
  const firstName = report.clientName.split(" ")[0];
  const topMatch = report.topMatches?.[0]?.title;
  const topSkill = report.tsa?.coreSkills?.[0]?.skill;
  return (
    <section
      style={{
        background: "#fafafa",
        border: "0.5pt solid #ccc",
        padding: "12px 14px",
        borderRadius: "3px",
        marginBottom: "14px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Executive Summary</h2>
      <p>
        This Comprehensive Individualized Plan for Employment (IPE) Report
        summarizes the assessment, planning, and signed agreement for{" "}
        <strong>{report.clientName}</strong> (Case {report.caseId}), prepared
        by <strong>{ipe.counselorName}</strong> under WIOA Title IV § 102(b).
      </p>
      <p>
        {firstName}&apos;s employment goal is{" "}
        <strong>{ipe.employmentGoal}</strong>
        {ipe.timelineMonths > 0 && (
          <>
            , targeted within <strong>{ipe.timelineMonths} months</strong>
          </>
        )}
        .{" "}
        {hollandAnalysis && (
          <>
            Their personality profile (Holland code{" "}
            <strong>{hollandAnalysis.code}</strong> —{" "}
            {hollandAnalysis.primary.shortName} /{" "}
            {hollandAnalysis.secondary.shortName} /{" "}
            {hollandAnalysis.tertiary.shortName}) aligns with this goal.{" "}
          </>
        )}
        {topMatch && (
          <>
            Their top occupational match is <strong>{topMatch}</strong>.{" "}
          </>
        )}
        {topSkill && (
          <>
            A standout transferable skill identified is{" "}
            <em>&ldquo;{topSkill}&rdquo;</em>.{" "}
          </>
        )}
      </p>
      <p style={{ fontSize: "10pt", color: "#555" }}>
        Both counselor and client signatures are recorded at the close of this
        document. This plan is active and binding under WIOA.
      </p>
    </section>
  );
}

function ClientGoalsBlock({ report }: { report: ClientReport }) {
  const intakeGoals = report.intake?.goals;
  const ipeGoal = report.ipe?.employmentGoal;
  const ipeRationale = report.ipe?.goalRationale;
  return (
    <section>
      <h2>Client&apos;s Goals</h2>
      {intakeGoals && (
        <>
          <h3>In their own words (from intake)</h3>
          <p
            style={{
              fontStyle: "italic",
              borderLeft: "3pt solid #0F6B54",
              paddingLeft: "10px",
              margin: "6px 0",
            }}
          >
            &ldquo;{intakeGoals}&rdquo;
          </p>
        </>
      )}
      {ipeGoal && (
        <>
          <h3>Employment goal on the IPE</h3>
          <p>
            <strong>{ipeGoal}</strong>
            {report.ipe?.goalSocCode && (
              <span style={{ color: "#666" }}>
                {" "}
                (O*NET {report.ipe.goalSocCode})
              </span>
            )}
          </p>
          {ipeRationale && (
            <p style={{ fontSize: "10.5pt" }}>{ipeRationale}</p>
          )}
        </>
      )}
    </section>
  );
}

function ScreenerResultsBlock({ results }: { results: ScreenerResult[] }) {
  return (
    <section>
      <h2>Clinical Screeners Completed</h2>
      <p style={{ fontSize: "10pt", color: "#555" }}>
        Public-domain instruments administered through Pathways Pro. Used at
        intake to inform service planning, not for diagnosis.
      </p>
      {results.map((r) => {
        const config = SCREENERS[r.screenerId];
        if (!config) return null;
        return (
          <div
            key={r.screenerId + r.completedAt}
            style={{
              borderTop: "0.5pt solid #ddd",
              padding: "8px 0",
              marginTop: "6px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginBottom: "4px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <strong>
                {r.acronym} — {config.domain}
              </strong>
              <span style={{ fontSize: "10pt", color: "#666" }}>
                Score: {r.totalScore}/{r.maxScore} · {r.band.label}
              </span>
            </div>
            <p style={{ fontSize: "10pt", margin: "0 0 4px" }}>
              {r.band.guidance}
            </p>
            {r.safetyFlag && (
              <p
                style={{
                  fontSize: "10pt",
                  color: "#9b1c1c",
                  background: "#fee",
                  padding: "6px 8px",
                  borderRadius: "2px",
                  margin: "4px 0",
                }}
              >
                <strong>⚠ Safety flag:</strong> {r.safetyFlag.message}
              </p>
            )}
            <p style={{ fontSize: "9pt", color: "#777", margin: 0 }}>
              Completed {new Date(r.completedAt).toLocaleString()}
            </p>
          </div>
        );
      })}
    </section>
  );
}

function TSAHighlightBlock({ tsa }: { tsa: NonNullable<ClientReport["tsa"]> }) {
  const top = tsa.coreSkills.slice(0, 5);
  return (
    <section
      style={{
        background: "#fff8f3",
        border: "0.5pt solid #e9c8b2",
        padding: "10px 14px",
        borderRadius: "3px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Top Transferable Skills</h2>
      <p style={{ fontSize: "10pt", color: "#555", margin: "0 0 8px" }}>
        Pulled from work, volunteering, hobbies, and caregiving — and
        translated into employer-facing language.
      </p>
      <ol style={{ paddingLeft: "20px", margin: 0 }}>
        {top.map((s, i) => (
          <li key={i} style={{ marginBottom: "6px" }}>
            <strong>{s.skill}</strong>
            <br />
            <span style={{ fontSize: "10pt", color: "#666" }}>
              <em>Evidence:</em> {s.evidence}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

function HollandAnalysisBlock({
  analysis,
}: {
  analysis: NonNullable<ReturnType<typeof analyzeHollandCode>>;
}) {
  return (
    <section>
      <h2>Career Personality Profile</h2>
      <p>{analysis.combinedSummary}</p>

      <h3>Day-to-day work style</h3>
      <p>{analysis.workStyleNarrative}</p>

      <h3>Where you tend to do your best work</h3>
      <ul>
        {analysis.primary.preferredEnvironments.map((e, i) => (
          <li key={i}>{e}</li>
        ))}
      </ul>

      <h3>Strengths you bring to a job</h3>
      <ul>
        {analysis.primary.strengthsAtWork.slice(0, 3).map((s, i) => (
          <li key={`p${i}`}>{s}</li>
        ))}
        {analysis.secondary.strengthsAtWork.slice(0, 2).map((s, i) => (
          <li key={`s${i}`}>{s}</li>
        ))}
      </ul>

      <h3>Things to keep an eye on</h3>
      <ul>
        {analysis.primary.watchOuts.map((w, i) => (
          <li key={`pw${i}`}>{w}</li>
        ))}
        {analysis.secondary.watchOuts.slice(0, 1).map((w, i) => (
          <li key={`sw${i}`}>{w}</li>
        ))}
      </ul>

      <h3>Job categories where {analysis.code} types thrive</h3>
      <ul>
        {analysis.topJobCategories.map((c, i) => (
          <li key={i}>{c}</li>
        ))}
      </ul>
      <p style={{ fontSize: "9pt", color: "#666", marginTop: "6px" }}>
        Based on Holland&apos;s Theory of Vocational Choice and O*NET Interest
        Profiler interpretive materials.
      </p>
    </section>
  );
}

function providerTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    "state-agency": "State VR agency",
    "community-rehab-provider": "Community Rehab Provider (CRP)",
    "training-provider": "Training provider",
    "employer-partner": "Employer partner",
    vendor: "Vendor",
  };
  return labels[type] ?? type;
}

function IPEPlanBlock({ ipe }: { ipe: IPE }) {
  return (
    <section style={{ pageBreakBefore: "always" }}>
      <h2>Signed Individualized Plan for Employment</h2>
      <p style={{ fontSize: "10pt", color: "#555" }}>
        WIOA Title IV § 102(b) · {ipe.wioaSection}
      </p>

      <h3>Employment goal</h3>
      <p>
        <strong>{ipe.employmentGoal}</strong>
        {ipe.goalSocCode && (
          <span style={{ color: "#666" }}> (O*NET-SOC {ipe.goalSocCode})</span>
        )}
      </p>
      {ipe.goalRationale && <p>{ipe.goalRationale}</p>}
      {(ipe.expectedWage || ipe.expectedOutlook) && (
        <p style={{ fontSize: "10pt", color: "#555" }}>
          {ipe.expectedWage && <>Median wage: {ipe.expectedWage}. </>}
          {ipe.expectedOutlook && <>Outlook: {ipe.expectedOutlook}.</>}
        </p>
      )}
      {ipe.laborMarketOutlook && (
        <>
          <h3>Local labor market outlook (BLS OOH)</h3>
          <p>{ipe.laborMarketOutlook}</p>
        </>
      )}

      <h3>Primary disability</h3>
      <p>{ipe.primaryDisability}</p>
      {ipe.secondaryConditions && (
        <p>
          <em>Secondary conditions:</em> {ipe.secondaryConditions}
        </p>
      )}

      {ipe.functionalLimitations.length > 0 && (
        <>
          <h3>Functional limitations</h3>
          <ul>
            {ipe.functionalLimitations.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </>
      )}

      {ipe.vrServices.length > 0 && (
        <>
          <h3>VR services authorized</h3>
          <ul>
            {ipe.vrServices.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </>
      )}

      {ipe.serviceProviders && ipe.serviceProviders.length > 0 && (
        <>
          <h3>Service providers &amp; settings</h3>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "10pt",
              marginTop: "4px",
            }}
          >
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={{ textAlign: "left", padding: "4px 8px", border: "0.5pt solid #ccc" }}>
                  Provider
                </th>
                <th style={{ textAlign: "left", padding: "4px 8px", border: "0.5pt solid #ccc" }}>
                  Type
                </th>
                <th style={{ textAlign: "left", padding: "4px 8px", border: "0.5pt solid #ccc" }}>
                  Services
                </th>
                <th style={{ textAlign: "left", padding: "4px 8px", border: "0.5pt solid #ccc" }}>
                  Integrated
                </th>
              </tr>
            </thead>
            <tbody>
              {ipe.serviceProviders.map((p, i) => (
                <tr key={i}>
                  <td style={{ padding: "4px 8px", border: "0.5pt solid #ccc" }}>
                    <strong>{p.name}</strong>
                  </td>
                  <td style={{ padding: "4px 8px", border: "0.5pt solid #ccc" }}>
                    {providerTypeLabel(p.type)}
                  </td>
                  <td style={{ padding: "4px 8px", border: "0.5pt solid #ccc" }}>
                    {p.services}
                  </td>
                  <td style={{ padding: "4px 8px", border: "0.5pt solid #ccc" }}>
                    {p.integratedSetting ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {ipe.accommodations.workplace.length > 0 && (
        <>
          <h3>Workplace accommodations</h3>
          <ul>
            {ipe.accommodations.workplace.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}

      {ipe.accommodations.training.length > 0 && (
        <>
          <h3>Training accommodations</h3>
          <ul>
            {ipe.accommodations.training.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}

      {ipe.accommodations.assistiveTech.length > 0 && (
        <>
          <h3>Assistive technology</h3>
          <ul>
            {ipe.accommodations.assistiveTech.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}

      {ipe.disabilityBarriers.length > 0 && (
        <>
          <h3>Disability-related barriers</h3>
          <ul>
            {ipe.disabilityBarriers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </>
      )}

      {ipe.supports.length > 0 && (
        <>
          <h3>Natural supports</h3>
          <ul>
            {ipe.supports.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </>
      )}

      {ipe.agencyResponsibilities && ipe.agencyResponsibilities.length > 0 && (
        <>
          <h3>Agency responsibilities</h3>
          <p style={{ fontSize: "10pt", color: "#555" }}>
            What the VR agency commits to deliver as part of this signed
            contract under WIOA Title IV.
          </p>
          <ul>
            {ipe.agencyResponsibilities.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}

      {ipe.clientResponsibilities && ipe.clientResponsibilities.length > 0 && (
        <>
          <h3>Client responsibilities</h3>
          <p style={{ fontSize: "10pt", color: "#555" }}>
            What the client commits to do as part of this signed contract.
          </p>
          <ul>
            {ipe.clientResponsibilities.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </>
      )}

      {ipe.evaluationCriteria && ipe.evaluationCriteria.length > 0 && (
        <>
          <h3>Criteria for evaluation &amp; milestones</h3>
          <p style={{ fontSize: "10pt", color: "#555" }}>
            Objective check-in metrics for tracking progress toward the
            employment goal.
          </p>
          <ul>
            {ipe.evaluationCriteria.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </>
      )}

      <h3>Timeline &amp; review</h3>
      <p>
        Estimated time to employment: <strong>{ipe.timelineMonths} months</strong>.
        Estimated date of achievement:{" "}
        <strong>
          {ipe.estimatedAchievementDate
            ? new Date(ipe.estimatedAchievementDate).toLocaleDateString()
            : "—"}
        </strong>
        . Annual review on{" "}
        <strong>{new Date(ipe.reviewDate).toLocaleDateString()}</strong>.
      </p>

      <h3>Signatures</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginTop: "8px",
        }}
      >
        <div
          style={{
            border: "0.5pt solid #999",
            padding: "10px",
            borderRadius: "3px",
          }}
        >
          <div
            style={{
              fontSize: "9pt",
              textTransform: "uppercase",
              color: "#666",
              marginBottom: "4px",
            }}
          >
            Counselor
          </div>
          <div
            style={{
              fontFamily: "'Brush Script MT', cursive",
              fontStyle: "italic",
              fontSize: "14pt",
            }}
          >
            {ipe.counselorSignature.signedBy}
          </div>
          <div style={{ fontSize: "9pt", color: "#666", marginTop: "4px" }}>
            Digitally signed{" "}
            {new Date(ipe.counselorSignature.signedAt!).toLocaleString()}
          </div>
        </div>
        <div
          style={{
            border: "0.5pt solid #999",
            padding: "10px",
            borderRadius: "3px",
          }}
        >
          <div
            style={{
              fontSize: "9pt",
              textTransform: "uppercase",
              color: "#666",
              marginBottom: "4px",
            }}
          >
            Client
          </div>
          <div
            style={{
              fontFamily: "'Brush Script MT', cursive",
              fontStyle: "italic",
              fontSize: "14pt",
            }}
          >
            {ipe.clientSignature.signedBy}
          </div>
          <div style={{ fontSize: "9pt", color: "#666", marginTop: "4px" }}>
            Digitally signed{" "}
            {new Date(ipe.clientSignature.signedAt!).toLocaleString()}
          </div>
        </div>
      </div>
    </section>
  );
}

function IntakeBlock({
  intake,
}: {
  intake: NonNullable<ClientReport["intake"]>;
}) {
  return (
    <section>
      <h2>Intake Summary</h2>
      <dl className="r-grid">
        {intake.age && (
          <>
            <dt>Age</dt>
            <dd>{intake.age}</dd>
          </>
        )}
        {intake.location && (
          <>
            <dt>Location</dt>
            <dd>{intake.location}</dd>
          </>
        )}
        {intake.educationLevel && (
          <>
            <dt>Education</dt>
            <dd>{intake.educationLevel}</dd>
          </>
        )}
        {intake.dreamJob && (
          <>
            <dt>Dream Job</dt>
            <dd>{intake.dreamJob}</dd>
          </>
        )}
        {intake.employmentGoal && (
          <>
            <dt>Employment Goal</dt>
            <dd>{intake.employmentGoal}</dd>
          </>
        )}
        {intake.pastJobs && (
          <>
            <dt>Jobs Held</dt>
            <dd>{intake.pastJobs}</dd>
          </>
        )}
        {intake.workHistory && (
          <>
            <dt>Other Experience</dt>
            <dd>{intake.workHistory}</dd>
          </>
        )}
        {intake.constraints && (
          <>
            <dt>Constraints</dt>
            <dd>{intake.constraints}</dd>
          </>
        )}
        {intake.goals && (
          <>
            <dt>What They Want</dt>
            <dd>{intake.goals}</dd>
          </>
        )}
        {intake.schedulePreference && (
          <>
            <dt>Schedule</dt>
            <dd>{intake.schedulePreference}</dd>
          </>
        )}
        {intake.openToApprenticeship !== undefined && (
          <>
            <dt>Apprenticeship?</dt>
            <dd>{intake.openToApprenticeship ? "Yes" : "No"}</dd>
          </>
        )}
        {intake.supportRequests && intake.supportRequests.length > 0 && (
          <>
            <dt>Support Requested</dt>
            <dd>
              <ul style={{ margin: 0, paddingLeft: 18 }}>
                {intake.supportRequests.map((s) => (
                  <li key={s}>{supportLabel(s)}</li>
                ))}
              </ul>
            </dd>
          </>
        )}
        {intake.supportOther && (
          <>
            <dt>Other Support Needs</dt>
            <dd>{intake.supportOther}</dd>
          </>
        )}
      </dl>
    </section>
  );
}

function AssessmentBlock({
  bigFive,
  riasec,
  hollandCode,
  completedAt,
}: {
  bigFive: NonNullable<ClientReport["bigFive"]>;
  riasec: NonNullable<ClientReport["riasec"]>;
  hollandCode: string;
  completedAt?: string;
}) {
  const sortedRiasec = (Object.entries(riasec) as ["R" | "I" | "A" | "S" | "E" | "C", number][])
    .sort((a, b) => b[1] - a[1]);

  return (
    <section>
      <h2>Personality &amp; Interest Profile</h2>
      <h3>
        Holland Code:{" "}
        <span style={{ color: "#0F6B54", fontWeight: "bold" }}>{hollandCode}</span>
      </h3>
      <div className="holland-row">
        {hollandCode.split("").map((l, i) => (
          <div
            key={i}
            className={`holland-letter ${i === 1 ? "s2" : i === 2 ? "s3" : ""}`}
          >
            {l}
          </div>
        ))}
      </div>

      <h3>RIASEC Interest Scores (0–100)</h3>
      {sortedRiasec.map(([k, v]) => (
        <div key={k} className="r-bar">
          <span>{riasecNames[k]}</span>
          <div className="r-bar-fill">
            <span style={{ width: `${v}%` }} />
          </div>
          <span className="r-bar-val">{v}</span>
        </div>
      ))}

      <h3 style={{ marginTop: "12px" }}>Big Five (Mini-IPIP)</h3>
      {(Object.entries(bigFive) as ["E" | "A" | "C" | "N" | "O", number][]).map(
        ([k, v]) => (
          <div key={k} className="r-bar">
            <span>{traitNames[k]}</span>
            <div className="r-bar-fill">
              <span style={{ width: `${v}%` }} />
            </div>
            <span className="r-bar-val">{v}</span>
          </div>
        ),
      )}
      {completedAt && (
        <p style={{ fontSize: "9pt", color: "#666", marginTop: "6px" }}>
          Completed {new Date(completedAt).toLocaleDateString()}
        </p>
      )}
    </section>
  );
}

function MatchesBlock({
  matches,
}: {
  matches: NonNullable<ClientReport["topMatches"]>;
}) {
  return (
    <section>
      <h2>Top Occupation Matches</h2>
      <p style={{ fontSize: "10pt", color: "#555" }}>
        Ranked by RIASEC vector fit against ~60 O*NET-curated occupations.
      </p>
      {matches.slice(0, 10).map((m, i) => (
        <div key={m.socCode} className="match-row">
          <span className="m-rank">#{i + 1}</span>
          <span>
            <strong>{m.title}</strong>
            <span style={{ color: "#888", marginLeft: "8px", fontSize: "9pt" }}>
              O*NET {m.socCode} · RIASEC {m.riasec}
            </span>
          </span>
          <span className="m-fit">{m.fit}% fit</span>
        </div>
      ))}
    </section>
  );
}

function TSABlock({ tsa }: { tsa: NonNullable<ClientReport["tsa"]> }) {
  const grouped = tsa.coreSkills.reduce<Record<string, typeof tsa.coreSkills>>(
    (acc, s) => {
      (acc[s.category] = acc[s.category] || []).push(s);
      return acc;
    },
    {},
  );

  return (
    <section>
      <h2>Transferable Skills Analysis</h2>
      <p>{tsa.encouragement}</p>

      {Object.entries(grouped).map(([cat, skills]) => (
        <div key={cat}>
          <h3>{cat}</h3>
          {skills.map((s, i) => (
            <div key={i} className="skill-card">
              <strong>{s.skill}</strong>
              <br />
              <span style={{ fontSize: "10pt", color: "#555" }}>
                <em>From:</em> {s.evidence}
              </span>
              <br />
              <span className="s-bullet">→ {s.resumeBullet}</span>
            </div>
          ))}
        </div>
      ))}

      <h3>Suggested Occupations</h3>
      <ul>
        {tsa.occupationsToConsider.map((o, i) => (
          <li key={i}>
            <strong>{o.title}</strong> — {o.whyItFits}{" "}
            <em>(First step: {o.startingPoint})</em>
          </li>
        ))}
      </ul>

      {tsa.gapsToAddress.length > 0 && (
        <>
          <h3>Skills to Address Next</h3>
          <ul>
            {tsa.gapsToAddress.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function IPEBlock({
  status,
  updatedAt,
}: {
  status: NonNullable<ClientReport["ipeStatus"]>;
  updatedAt?: string;
}) {
  const labels: Record<typeof status, string> = {
    draft: "Draft — counselor is still preparing the plan",
    "pending-client-signature": "Counselor signed — awaiting client signature",
    signed: "Signed by both parties — active",
    active: "Active",
  };
  return (
    <section>
      <h2>Individualized Plan for Employment (IPE)</h2>
      <p>
        <strong>Status:</strong> {labels[status]}
      </p>
      {updatedAt && (
        <p style={{ fontSize: "10pt", color: "#555" }}>
          Last updated {new Date(updatedAt).toLocaleString()}
        </p>
      )}
    </section>
  );
}

function FooterBlock({ report }: { report: ClientReport }) {
  return (
    <footer className="r-footer">
      <p>
        Pathways Pro · WIOA Title IV § 102(b) · BLS OOH 2024–34 · O*NET 28.3 ·
        Mini-IPIP (Donnellan et al., 2006) · O*NET Interest Profiler (public
        domain).
      </p>
      <p>
        Generated {new Date(report.lastUpdated).toLocaleString()}. This report
        is informational. It does not replace the professional judgment of a
        Certified Rehabilitation Counselor or licensed clinician.
      </p>
    </footer>
  );
}
