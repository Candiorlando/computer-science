"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import { CLIENTS, type ClientUser, type CounselorUser } from "@/lib/users";
import { loadClientReport, type ClientReport } from "@/lib/client-report";
import {
  rankOccupations,
  jobZoneDescription,
  wageBandDescription,
  getOohUrl,
  type Occupation,
} from "@/lib/onet-data";
import { analyzeHollandCode } from "@/lib/holland-analysis";
import { riasecNames, type RiasecType } from "@/lib/assessments";
import { extractZip } from "@/lib/storage";
import { seedDemoClientReports } from "@/lib/demo-seed";

export default function LaborMarketPage() {
  return (
    <Suspense fallback={<p className="text-ink/50">Loading…</p>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const search = useSearchParams();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    search.get("case"),
  );

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    seedDemoClientReports();
    setUser(s);
  }, [router]);

  const clients = useMemo(
    () =>
      user
        ? user.clientKeys
            .map((k) => CLIENTS[k])
            .filter((c): c is ClientUser => Boolean(c))
        : [],
    [user],
  );

  const selectedClient = useMemo(
    () => clients.find((c) => c.caseId === selectedCaseId),
    [clients, selectedCaseId],
  );

  const clientReport: ClientReport | null = useMemo(() => {
    if (!selectedCaseId) return null;
    return loadClientReport(selectedCaseId);
  }, [selectedCaseId]);

  const ranked = useMemo(() => {
    if (!clientReport?.riasec) return [];
    return rankOccupations(clientReport.riasec).slice(0, 12);
  }, [clientReport]);

  const hollandAnalysis = useMemo(
    () =>
      clientReport?.hollandCode
        ? analyzeHollandCode(clientReport.hollandCode)
        : null,
    [clientReport],
  );

  if (!user) return null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Labor Market Analysis · Driven by Interest Profiler
        </p>
        <h1 className="text-4xl mb-2">
          Wage, growth, and entry pathways for client matches
        </h1>
        <p className="text-ink/70 prose-narrow">
          Pick a client to see local labor market data for every occupation
          their{" "}
          <Link href="/assessment" className="text-accent underline">
            Interest Profiler
          </Link>{" "}
          RIASEC scores match. Each row links to BLS Occupational Outlook
          Handbook, CareerOneStop wage data by ZIP, registered apprenticeships,
          WIOA-eligible training providers, and live job openings.
        </p>
      </header>

      <ClientPicker
        clients={clients}
        selected={selectedClient ?? null}
        onSelect={(id) => {
          setSelectedCaseId(id);
          router.replace(id ? `/labor-market?case=${id}` : "/labor-market");
        }}
      />

      {!selectedClient && (
        <p className="text-center text-ink/50 py-8">
          Pick a client above to load their labor market analysis.
        </p>
      )}

      {selectedClient && !clientReport?.riasec && (
        <div className="border border-amber-300 bg-amber-50 rounded-lg p-5 text-sm">
          <strong className="text-amber-900 block mb-1">
            Assessment not yet completed
          </strong>
          <p className="text-amber-900/80">
            {selectedClient.name} hasn&apos;t completed the interest profiler
            yet, so we don&apos;t have RIASEC data to drive an occupation
            ranking. Once they take the assessment, this page will populate
            automatically.
          </p>
        </div>
      )}

      {selectedClient && clientReport?.riasec && (
        <>
          <ProfileSummary
            client={selectedClient}
            report={clientReport}
            hollandAnalysis={hollandAnalysis}
          />

          <InterestProfilerPanel report={clientReport} />

          <MarketDistribution ranked={ranked} />

          <section>
            <h2 className="text-2xl mb-1">
              Top {ranked.length} Occupational Matches
            </h2>
            <p className="text-sm text-ink/60 mb-4">
              Ranked by RIASEC fit against the O*NET-curated occupation set.
              Each card links out to live data sources for current wages,
              growth, openings, and training near{" "}
              <strong>
                {extractZip(clientReport.intake?.zipCode) ||
                  clientReport.intake?.location ||
                  "the client's location"}
              </strong>
              .
            </p>
            <div className="space-y-3">
              {ranked.map(({ occ, fit }, idx) => (
                <OccupationRow
                  key={occ.socCode}
                  occ={occ}
                  fit={fit}
                  rank={idx + 1}
                  location={
                    extractZip(clientReport.intake?.zipCode) ||
                    clientReport.intake?.location ||
                    ""
                  }
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function ClientPicker({
  clients,
  selected,
  onSelect,
}: {
  clients: ClientUser[];
  selected: ClientUser | null;
  onSelect: (caseId: string | null) => void;
}) {
  return (
    <section className="border border-accent/30 bg-accent/5 rounded-lg p-4">
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-ink/60">
          Analyzing for client:
        </span>
        <select
          value={selected?.caseId ?? ""}
          onChange={(e) => onSelect(e.target.value || null)}
          className="bg-white border border-ink/20 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
        >
          <option value="">— Pick a client —</option>
          {clients.map((c) => (
            <option key={c.caseId} value={c.caseId}>
              {c.name} ({c.caseId})
            </option>
          ))}
        </select>
      </div>
    </section>
  );
}

function ProfileSummary({
  client,
  report,
  hollandAnalysis,
}: {
  client: ClientUser;
  report: ClientReport;
  hollandAnalysis: ReturnType<typeof analyzeHollandCode> | null;
}) {
  return (
    <section className="border border-ink/15 rounded-lg p-5 bg-cream space-y-2">
      <div className="flex items-baseline justify-between gap-4 flex-wrap">
        <h2 className="text-xl">
          {client.name}{" "}
          <span className="text-ink/50 font-normal text-sm">
            · Case {client.caseId}
          </span>
        </h2>
        {report.hollandCode && (
          <div className="text-sm">
            <span className="text-ink/60">Holland code:</span>{" "}
            <strong className="text-accent">{report.hollandCode}</strong>
          </div>
        )}
      </div>
      {hollandAnalysis && (
        <p className="text-sm text-ink/80">
          <strong>
            {hollandAnalysis.primary.shortName} /{" "}
            {hollandAnalysis.secondary.shortName} /{" "}
            {hollandAnalysis.tertiary.shortName}.
          </strong>{" "}
          {hollandAnalysis.workStyleNarrative}
        </p>
      )}
      <div className="grid sm:grid-cols-3 gap-3 text-sm pt-2 border-t border-ink/10">
        <div>
          <div className="text-xs uppercase tracking-wider text-ink/50">
            Goal on file
          </div>
          <div>{client.goal}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-ink/50">
            Education
          </div>
          <div>{report.intake?.educationLevel ?? "Not on file"}</div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-ink/50">
            Search location
          </div>
          <div>
            {extractZip(report.intake?.zipCode) ||
              report.intake?.location ||
              "Not on file"}
          </div>
        </div>
      </div>
    </section>
  );
}

function InterestProfilerPanel({ report }: { report: ClientReport }) {
  const riasec = report.riasec!;
  const sorted = (Object.entries(riasec) as [RiasecType, number][]).sort(
    (a, b) => b[1] - a[1],
  );
  const top3 = sorted.slice(0, 3);
  const completedAt = report.assessmentCompletedAt
    ? new Date(report.assessmentCompletedAt)
    : null;

  return (
    <section className="border-2 border-accent/30 bg-accent/5 rounded-lg p-5">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
            📊 From Interest Profiler
          </p>
          <h2 className="text-xl">
            RIASEC scores driving this analysis
          </h2>
        </div>
        {completedAt && (
          <div className="text-xs text-ink/60 text-right">
            Assessment completed
            <div className="text-ink font-semibold">
              {completedAt.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-ink/70 mb-4">
        These six scores from the client&apos;s Holland RIASEC inventory are
        what rank every occupation below. Higher scores in a category mean
        occupations tagged with that letter rise to the top.
      </p>

      <ul className="space-y-2 mb-4">
        {sorted.map(([t, v], idx) => (
          <li key={t} className="flex items-center gap-3 text-sm">
            <span className="w-6 text-center text-accent font-bold">{t}</span>
            <span className="w-28 text-ink/80">{riasecNames[t]}</span>
            <div className="flex-1 h-2.5 bg-ink/10 rounded overflow-hidden">
              <div
                className={`h-2.5 rounded ${idx < 3 ? "bg-accent" : "bg-accent/40"}`}
                style={{ width: `${v}%` }}
              />
            </div>
            <span className="w-10 text-right tabular-nums text-ink/80">
              {v}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-accent/20 pt-3 flex items-baseline justify-between gap-3 flex-wrap text-sm">
        <div>
          <span className="text-ink/60">Top 3 driving rankings: </span>
          {top3.map(([t], i) => (
            <span key={t}>
              {i > 0 && <span className="text-ink/40"> · </span>}
              <strong className="text-accent">{riasecNames[t]}</strong>
            </span>
          ))}
        </div>
        <Link
          href={`/report?case=${report.caseId}`}
          className="text-xs text-accent underline"
        >
          See full client report →
        </Link>
      </div>
    </section>
  );
}

function MarketDistribution({
  ranked,
}: {
  ranked: { occ: Occupation; fit: number }[];
}) {
  const wageBands = ranked.reduce<Record<string, number>>((acc, { occ }) => {
    acc[occ.medianWageBand] = (acc[occ.medianWageBand] || 0) + 1;
    return acc;
  }, {});
  const apprenticeshipCount = ranked.filter(
    ({ occ }) => occ.apprenticeshipPath,
  ).length;
  const ojtCount = ranked.filter(({ occ }) => occ.onTheJobTraining).length;
  const noDegreeCount = ranked.filter(({ occ }) => occ.jobZone <= 3).length;

  return (
    <section className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
      <Stat
        label="Apprenticeship paths"
        value={`${apprenticeshipCount} / ${ranked.length}`}
        sub="formally registered on apprenticeship.gov"
      />
      <Stat
        label="On-the-job training"
        value={`${ojtCount} / ${ranked.length}`}
        sub="strong OJT entry pathway"
      />
      <Stat
        label="No bachelor's required"
        value={`${noDegreeCount} / ${ranked.length}`}
        sub="O*NET Job Zone ≤ 3"
      />
      <Stat
        label="Wage band spread"
        value={`${Object.keys(wageBands).length} bands`}
        sub={wageBandSpread(wageBands)}
      />
    </section>
  );
}

function wageBandSpread(bands: Record<string, number>): string {
  const sorted = Object.entries(bands).sort((a, b) => b[1] - a[1]);
  return sorted
    .map(([band, n]) => `${band}: ${n}`)
    .slice(0, 3)
    .join(" · ");
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="border border-ink/15 rounded-lg p-4 bg-cream">
      <div className="text-xs uppercase tracking-wider text-ink/50 mb-1">
        {label}
      </div>
      <div className="text-2xl text-accent leading-none">{value}</div>
      <div className="text-xs text-ink/60 mt-2">{sub}</div>
    </div>
  );
}

function OccupationRow({
  occ,
  fit,
  rank,
  location,
}: {
  occ: Occupation;
  fit: number;
  rank: number;
  location: string;
}) {
  const fitPct = Math.round(fit * 33);
  const oohUrl = getOohUrl(occ);
  const cosWageUrl = `https://www.careeronestop.org/Toolkit/Wages/wages-occupation-results.aspx?keyword=${encodeURIComponent(occ.title)}&location=${encodeURIComponent(location)}&soccode=${encodeURIComponent(occ.socCode)}`;
  const cosOpeningsUrl = `https://www.careeronestop.org/Toolkit/Jobs/find-jobs-results.aspx?keyword=${encodeURIComponent(occ.title)}&location=${encodeURIComponent(location)}&radius=25`;
  const apprUrl = `https://www.apprenticeship.gov/apprenticeship-job-finder?keyword=${encodeURIComponent(occ.title)}&location=${encodeURIComponent(location)}`;
  const trainingUrl = `https://www.careeronestop.org/Toolkit/Training/find-local-training.aspx?keyword=${encodeURIComponent(occ.title)}&location=${encodeURIComponent(location)}`;
  const onetUrl = `https://www.onetonline.org/link/summary/${occ.socCode}`;
  const projectionsUrl = `https://www.projectionscentral.org/Projections/LongTerm`;

  return (
    <article className="border border-ink/15 rounded-lg p-5 bg-cream">
      <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-ink/50 mb-1">
            #{rank} · O*NET-SOC {occ.socCode} · RIASEC {occ.riasec.join("")}
          </div>
          <h3 className="text-xl font-semibold">{occ.title}</h3>
          <p className="text-sm text-ink/70 mt-1">{occ.blurb}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl text-accent font-bold">{fitPct}% fit</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-3 text-sm mb-4">
        <DataCell
          label="Median wage band (BLS)"
          value={wageBandDescription[occ.medianWageBand]}
        />
        <DataCell label="Typical preparation" value={jobZoneDescription[occ.jobZone]} />
        <DataCell
          label="Entry pathways"
          value={[
            occ.apprenticeshipPath ? "Apprenticeship" : null,
            occ.onTheJobTraining ? "On-the-job training" : null,
            occ.jobZone <= 3 ? "No bachelor's required" : null,
          ]
            .filter(Boolean)
            .join(" · ") || "Bachelor's+"}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <LinkBtn href={oohUrl} priority>
          📊 BLS OOH outlook
        </LinkBtn>
        <LinkBtn href={cosWageUrl} priority>
          💵 Wage data {location ? `near ${location}` : "by location"}
        </LinkBtn>
        <LinkBtn href={cosOpeningsUrl}>
          🔎 Current openings
        </LinkBtn>
        {occ.apprenticeshipPath && (
          <LinkBtn href={apprUrl}>🔧 Apprenticeships</LinkBtn>
        )}
        <LinkBtn href={trainingUrl}>🎓 WIOA training providers</LinkBtn>
        <LinkBtn href={onetUrl}>O*NET profile</LinkBtn>
        <LinkBtn href={projectionsUrl}>State projections</LinkBtn>
      </div>
    </article>
  );
}

function DataCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/10 rounded p-3 bg-white/60">
      <div className="text-xs uppercase tracking-wider text-ink/50">
        {label}
      </div>
      <div className="text-sm font-semibold mt-1">{value}</div>
    </div>
  );
}

function LinkBtn({
  href,
  priority,
  children,
}: {
  href: string;
  priority?: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={
        priority
          ? "bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 px-3 py-1.5 rounded font-semibold"
          : "border border-ink/20 hover:border-accent hover:bg-accent/5 px-3 py-1.5 rounded"
      }
    >
      {children} ↗
    </a>
  );
}
