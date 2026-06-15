"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import {
  CLIENTS,
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
  const clients = user.clientKeys
    .map((k) => CLIENTS[k])
    .filter((c): c is ClientUser => Boolean(c));

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

      <Link
        href="/clinical-assessments"
        className="block border border-accent/40 bg-accent/5 rounded-lg p-5 hover:bg-accent/10 transition"
      >
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold mb-1">
              📚 Clinical Assessment Library →
            </h2>
            <p className="text-sm text-ink/80">
              Browse the VR assessment instruments by purpose — vocational
              interests, aptitudes, achievement, personality, adjustment to
              disability, mental health, transferable skills, dexterity, and
              Pre-ETS. Filterable by free / proprietary and by who administers.
            </p>
          </div>
          <span className="text-sm text-accent font-semibold whitespace-nowrap">
            Open library →
          </span>
        </div>
      </Link>

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

  useEffect(() => {
    setReport(loadClientReport(caseId));
  }, [caseId]);

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
        <div className="flex gap-2">
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

      <article className="report-page bg-white shadow-sm border border-ink/15 rounded-sm">
        <ReportHeader report={report} />

        {report.intake && <IntakeBlock intake={report.intake} />}

        {hasAssessment && (
          <AssessmentBlock
            bigFive={report.bigFive!}
            riasec={report.riasec!}
            hollandCode={report.hollandCode!}
            completedAt={report.assessmentCompletedAt}
          />
        )}

        {report.topMatches && report.topMatches.length > 0 && (
          <MatchesBlock matches={report.topMatches} />
        )}

        {report.tsa && <TSABlock tsa={report.tsa} />}

        {report.ipeStatus && (
          <IPEBlock status={report.ipeStatus} updatedAt={report.ipeUpdatedAt} />
        )}

        <FooterBlock report={report} />
      </article>

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
          background: #b95c3c;
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
          background: #b95c3c;
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
          color: #b95c3c;
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

function ReportHeader({ report }: { report: ClientReport }) {
  return (
    <header className="r-head">
      <h1 className="r-name">{report.clientName}</h1>
      <p className="r-meta">
        Pathways Pro Assessment Report · Case {report.caseId}
        {report.clientDob && ` · DOB ${report.clientDob}`}
        {report.counselorName && ` · Counselor: ${report.counselorName}`}
      </p>
      <p className="r-meta">
        Last updated {new Date(report.lastUpdated).toLocaleString()}
      </p>
    </header>
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
        {intake.workHistory && (
          <>
            <dt>Work History</dt>
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
            <dt>Goals</dt>
            <dd>{intake.goals}</dd>
          </>
        )}
        {intake.openToApprenticeship !== undefined && (
          <>
            <dt>Apprenticeship?</dt>
            <dd>{intake.openToApprenticeship ? "Yes" : "No"}</dd>
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
        <span style={{ color: "#b95c3c", fontWeight: "bold" }}>{hollandCode}</span>
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
