import type { Metadata } from "next";
import Link from "next/link";
import { CounselorRolesExplorer } from "@/components/CounselorRolesExplorer";
import { HomeRedirect } from "@/components/HomeRedirect";

export const metadata: Metadata = {
  title: "Pathways Pro — AI Case Management for Vocational Rehabilitation",
  description:
    "Draft signature-ready IPEs in minutes, run validated career assessments, and keep WIOA documentation audit-ready — one HIPAA-aligned workspace for VR counselors, their clients, and employer partners.",
};

export default function HomePage() {
  return (
    <div className="-mx-6 -mt-6 mb-[-2rem]">
      <HomeRedirect />
      <Hero />
      <AudienceSplit />
      <TrustBar />
      <HowItWorks />
      <SpecializedCounselors />
      <TopRolesSection />
      <RoiMetrics />
      <AboutPlatform />
      <Testimonial />
      <FinalCta />
    </div>
  );
}

interface CounselorSpec {
  title: string;
  services: { label: string; detail: string }[];
  markets: string;
}

const SPECIALIZED_COUNSELORS: CounselorSpec[] = [
  {
    title: "Career Counselors",
    services: [
      {
        label: "Assessment & Appraisal",
        detail:
          "Selecting and interpreting vocational, interest, achievement, and psychological tests.",
      },
      {
        label: "Vocational Counseling",
        detail:
          "Guiding clients through the educational and career implications of their limitations and assets.",
      },
      {
        label: "Advocacy & Barrier Removal",
        detail:
          "Eliminating attitudinal, environmental, and employment barriers.",
      },
    ],
    markets:
      "K-12 school systems, colleges/universities, state vocational rehabilitation agencies, and community non-profits.",
  },
  {
    title: "Return-to-Work Coordinators",
    services: [
      {
        label: "Diagnosis & Treatment Planning",
        detail:
          "Analyzing medical and psychosocial info to develop formal, individualized rehabilitation plans.",
      },
      {
        label: "Rehabilitation Technology",
        detail:
          "Providing consultation on and securing access to assistive workplace accommodations.",
      },
      {
        label: "Case Management & Referral",
        detail:
          "Coordinating multidisciplinary services, managing benefits, and ensuring continuity of care.",
      },
    ],
    markets:
      "For-profit corporations, private insurance companies, industrial health settings, and human resource departments.",
  },
  {
    title: "Forensic Rehabilitation Specialists",
    services: [
      {
        label: "Consultation",
        detail:
          "Providing professional expert advice across multiple regulatory, medical, and corporate systems.",
      },
      {
        label: "Wage-Earning Analysis",
        detail:
          "Evaluating the impact of injury on quality of life and earning capacity.",
      },
      {
        label: "Legal Testimony",
        detail:
          "Offering objective data and testimony within legal proceedings.",
      },
    ],
    markets:
      "Court systems, private legal practices, workers' compensation carriers, and federal defense agencies.",
  },
  {
    title: "Job Development & Placement Specialists",
    services: [
      {
        label: "Job Placement",
        detail:
          "Conducting labor market surveys, identifying leads, and teaching job-seeking skills.",
      },
      {
        label: "Employer Negotiation",
        detail:
          "Matching client skills with employer needs and consulting on workplace inclusion.",
      },
      {
        label: "Assistive Tech Coordination",
        detail:
          "Collaborating with technology teams to modify work environments.",
      },
    ],
    markets:
      "Supported employment agencies, commercial staffing firms, non-profit rehabilitation centers, and public workforce centers.",
  },
  {
    title: "Mental Health & Psychiatric Rehabilitation Counselors",
    services: [
      {
        label: "Psychotherapy",
        detail:
          "Providing individual and group counseling aimed at building behavioral independence.",
      },
      {
        label: "Psychosocial Analysis",
        detail:
          "Evaluating the intersection of mental health diagnoses with vocational capability.",
      },
      {
        label: "Crisis Intervention",
        detail:
          "Coordinating continuity of care during psychological distress.",
      },
    ],
    markets:
      "Inpatient and outpatient psychiatric facilities, community mental health clinics, and private practices.",
  },
  {
    title: "Certified Vocational Evaluation Specialists (CVE)",
    services: [
      {
        label: "Comprehensive Evaluation",
        detail:
          "Administering extensive, community-based vocational assessments.",
      },
      {
        label: "Data Synthesis",
        detail:
          "Translating multi-disciplinary medical, psychological, and social data into employment recommendations.",
      },
      {
        label: "Plan Formulation",
        detail:
          "Designing baseline actionable vocational pathways for other counselors to execute.",
      },
    ],
    markets:
      "Veterans Affairs (VA) hospitals, state/federal rehabilitation agencies, and specialized disability evaluation centers.",
  },
];

function TopRolesSection() {
  return (
    <section
      id="top-30-roles"
      aria-labelledby="top-roles-heading"
      className="border-b border-ink/10"
    >
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl mb-10">
          <p className="text-xs uppercase tracking-widest text-accent mb-2">
            Who the platform serves
          </p>
          <h2 id="top-roles-heading" className="text-4xl tracking-tight">
            Top 30 Vocational Rehabilitation Counseling Roles
          </h2>
          <p className="text-ink/75 mt-3">
            A curated ranking of the roles and job titles Pathways Pro is
            built for — strictly focused on career, employment, and
            workplace-reintegration specialties. View by market tier, sort
            by estimated salary, or group by required certification.
          </p>
        </div>
        <CounselorRolesExplorer />
      </div>
    </section>
  );
}

function SpecializedCounselors() {
  return (
    <section
      aria-labelledby="specialized-counselors-heading"
      className="border-b border-ink/10 bg-cream/40"
    >
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-2xl mb-10">
          <p className="text-xs uppercase tracking-widest text-accent mb-2">
            Who works on the platform
          </p>
          <h2
            id="specialized-counselors-heading"
            className="text-4xl tracking-tight"
          >
            Specialized Counselors: Services &amp; Markets
          </h2>
          <p className="text-ink/75 mt-3">
            Pathways Pro is built around six specialized rehabilitation
            counselor archetypes — each with distinct services, certifications,
            and the markets they serve.
          </p>
          <a
            href="#top-30-roles"
            className="inline-block mt-3 text-sm font-semibold text-cyan-700 hover:underline"
          >
            Jump to the full top-30 role ranking — by tier, salary, and
            certification ↓
          </a>
        </div>

        <ul
          role="list"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {SPECIALIZED_COUNSELORS.map((c, i) => (
            <li key={c.title}>
              <article className="saas-card h-full flex flex-col bg-white hover:shadow-md transition">
                <header>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-accent">
                    Counselor type {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold mt-1 leading-snug">
                    {c.title}
                  </h3>
                </header>

                <ul role="list" className="mt-3 space-y-2 flex-1">
                  {c.services.map((s) => (
                    <li key={s.label} className="flex gap-2 text-sm">
                      <span
                        aria-hidden
                        className="text-accent flex-shrink-0 mt-0.5"
                      >
                        ✓
                      </span>
                      <span>
                        <strong className="font-semibold">{s.label}:</strong>{" "}
                        <span className="text-ink/75">{s.detail}</span>
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-4 grad-tealblue-soft border border-cyan-200 rounded-md p-3">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-cyan-900 mb-1">
                    Employment Markets
                  </div>
                  <p className="text-xs text-ink/80 leading-snug">{c.markets}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ───────────────────────────── Hero ─────────────────────────────────────

function Hero() {
  return (
    <section className="border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
            For VR counselors, agencies &amp; the employers they serve
          </p>
          <h1 className="text-5xl md:text-6xl tracking-tight leading-[1.05]">
            AI-powered case management for vocational rehabilitation.
          </h1>
          <p className="text-lg text-ink/85 prose-narrow font-medium">
            Counselors close cases faster. Clients reach competitive
            integrated employment sooner.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/request-demo"
              className="bg-accent text-cream font-semibold px-6 py-3 min-h-[44px] rounded-md hover:bg-accent/90 transition"
            >
              Request a Demo →
            </Link>
            <Link
              href="/signin"
              className="border border-accent text-accent font-semibold px-6 py-3 min-h-[44px] rounded-md hover:bg-accent/5 transition"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="border border-ink/15 rounded-lg bg-white shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-ink/50">
                Live IPE preview
              </span>
              <span className="text-xs text-emerald-700 font-semibold">
                ✓ WIOA § 102(b) compliant
              </span>
            </div>
            <div className="border-l-4 border-accent pl-3 py-1">
              <div className="text-xs text-ink/50">Employment goal</div>
              <div className="font-semibold">Medical Office Administrator</div>
              <div className="text-xs text-ink/60">
                SOC 43-6013.00 · Timeline 12 months
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <MiniStat label="RIASEC fit" value="91%" />
              <MiniStat label="BLS outlook" value="+5.4%" />
              <MiniStat label="Local wage" value="$42k" />
            </div>
            <div className="text-xs text-ink/60 border-t border-ink/10 pt-2">
              Auto-generated from Mini-IPIP + Holland scores · localized to ZIP
              60652 · drafted by Claude Opus 4.8
            </div>
          </div>
          <div className="absolute -bottom-3 -right-3 bg-accent text-cream text-xs px-3 py-1 rounded-full shadow">
            Drafted in 8 minutes
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/10 rounded p-2 bg-cream">
      <div className="text-[10px] uppercase tracking-wider text-ink/50">
        {label}
      </div>
      <div className="text-sm font-semibold text-accent">{value}</div>
    </div>
  );
}

// ─────────────────────── Audience split ─────────────────────────────────

function AudienceSplit() {
  return (
    <section aria-label="Who Pathways Pro serves" className="border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-6">
        <article className="border border-ink/15 bg-cream rounded-lg p-7 flex flex-col">
          <p className="text-xs uppercase tracking-widest text-accent mb-2">
            For Counselors &amp; Agencies
          </p>
          <h2 className="text-2xl tracking-tight mb-4">
            Run the whole caseload from one record.
          </h2>
          <ul className="space-y-2.5 text-sm text-ink/80 flex-1">
            <li className="flex gap-2">
              <span className="text-accent font-bold" aria-hidden>✓</span>
              <span>
                Signature-ready, WIOA § 102(b)-complete IPEs drafted in
                minutes — you review, edit, and sign.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold" aria-hidden>✓</span>
              <span>
                Assessments, case notes, documents, and services on one case
                file — no re-keying across systems.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold" aria-hidden>✓</span>
              <span>
                RSA-911-mapped reporting without end-of-quarter spreadsheet
                triage.
              </span>
            </li>
          </ul>
          <div className="pt-5">
            <Link
              href="/request-demo"
              className="inline-block bg-accent text-cream font-semibold px-5 py-3 min-h-[44px] rounded-md hover:bg-accent/90 transition"
            >
              Request a demo →
            </Link>
          </div>
        </article>

        <article className="border border-ink/15 bg-cream rounded-lg p-7 flex flex-col">
          <p className="text-xs uppercase tracking-widest text-accent mb-2">
            For Employers
          </p>
          <h2 className="text-2xl tracking-tight mb-4">
            Hire inclusively and stay defensible.
          </h2>
          <ul className="space-y-2.5 text-sm text-ink/80 flex-1">
            <li className="flex gap-2">
              <span className="text-accent font-bold" aria-hidden>✓</span>
              <span>
                ADA Title I / Section 504 compliance audits with a 90-day
                corrective action plan.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold" aria-hidden>✓</span>
              <span>
                Job task analysis and accommodation plans backed by JAN cost
                data.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold" aria-hidden>✓</span>
              <span>
                Retention-risk reporting plus WOTC and § 44 tax-credit
                optimization.
              </span>
            </li>
          </ul>
          <div className="pt-5">
            <Link
              href="/business"
              className="inline-block border border-accent text-accent font-semibold px-5 py-3 min-h-[44px] rounded-md hover:bg-accent/5 transition"
            >
              Explore employer solutions →
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

// ─────────────────────── About the platform ─────────────────────────────
// The long-form positioning paragraph relocated below the fold from the
// old hero, per the UX audit.

function AboutPlatform() {
  return (
    <section aria-labelledby="about-platform-heading" className="border-b border-ink/10">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-xs uppercase tracking-widest text-accent mb-2">
          About the platform
        </p>
        <h2 id="about-platform-heading" className="text-3xl tracking-tight mb-4">
          One ecosystem, every party at the table.
        </h2>
        <p className="text-ink/80 leading-relaxed">
          Pathways Pro is an AI-powered vocational rehabilitation and
          compliance platform that increases competitive integrated
          employment for disabled individuals. It also provides
          business-facing solutions — including inclusive hiring assessments,
          job task analysis, retention risk reporting, and ADA / Section 504
          / EEO compliance consulting — creating a unified ecosystem where
          clients, counselors, businesses, and vendors collaborate to improve
          employment outcomes and accessibility.
        </p>
      </div>
    </section>
  );
}

// ────────────────────────── Trust bar ───────────────────────────────────

function TrustBar() {
  const badges = [
    { label: "HIPAA-aligned", sub: "PHI envelope encryption" },
    { label: "WCAG 2.1 AA", sub: "Audited at every release" },
    { label: "WIOA Title IV", sub: "§ 102(b) field coverage" },
    { label: "Section 508", sub: "Federal procurement ready" },
    { label: "RSA-911", sub: "Reporting elements mapped" },
    { label: "O*NET 28.3 · BLS OOH", sub: "Refreshed quarterly" },
  ];
  return (
    <section className="bg-ink/5 border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-center text-xs uppercase tracking-widest text-ink/60 mb-5">
          Built for the standards state agencies and CRPs already procure against
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((b) => (
            <div
              key={b.label}
              className="text-center border border-ink/15 bg-cream rounded-md px-3 py-3"
            >
              <div className="text-sm font-semibold text-ink">{b.label}</div>
              <div className="text-[11px] text-ink/55 mt-0.5">{b.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ────────────────────────── How it works ────────────────────────────────

function HowItWorks() {
  return (
    <section className="border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-20">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-widest text-accent">
            How Pathways Pro changes your workflow
          </p>
          <h2 className="text-4xl tracking-tight">
            From three apps and a binder to one record per client.
          </h2>
          <p className="text-ink/70">
            Every part of the VR workflow — intake, assessment, IPE drafting,
            services, signatures, reporting — happens against a single case
            file. No re-keying, no copy-paste, no missing audit trail.
          </p>
        </header>

        <FeatureBlock
          eyebrow="01 · Automated compliance"
          title="WIOA-compliant IPEs drafted in minutes, not hours."
          body="The IPE Builder pulls the client's interest profile, transferable skills, screener results, and counselor case notes, then drafts every § 102(b) section — vocational goal with SOC code, functional limitations, timeline, services with provider type and integrated-setting flag, mutual responsibilities, and evaluation criteria. You review, edit, and sign."
          bullets={[
            "Every required WIOA § 102(b) element prefilled",
            "Provider settings flagged for integrated competitive employment",
            "Audit-ready signature block with timestamp + IP",
            "Drafted by Claude Opus 4.8 against your client's real data",
          ]}
          visual={<IpeVisual />}
        />

        <FeatureBlock
          reversed
          eyebrow="02 · Dual interfaces"
          title="One source of truth, two ways in."
          body="Counselors get 36 tools across caseload, IPE, reporting, labor market, and CE tracking. Clients get 22 tools across intake, assessments, resume building, funding, and an AI coach. Every action on either side updates the shared client report — no double entry, no version drift."
          bullets={[
            "Counselors see real-time client progress without asking",
            "Clients see exactly which assessments are assigned to them",
            "Counselor preview mode mirrors the client portal during sessions",
            "Same data, different surfaces — never reconciled by hand",
          ]}
          visual={<DualInterfaceVisual />}
        />

        <FeatureBlock
          eyebrow="03 · Live labor market data"
          title="BLS and O*NET pipelines wired directly into the case."
          body="Pick any client on your caseload to see their Holland-matched occupations with current BLS Occupational Outlook, CareerOneStop wage data localized to ZIP, registered apprenticeship paths, and WIOA-eligible training providers. Every link goes to a live federal source — no stale screenshots."
          bullets={[
            "60+ O*NET-SOC occupations matched by RIASEC fit",
            "BLS OOH 2024–34 projections refreshed quarterly",
            "Wage and openings data scoped to the client's ZIP code",
            "One-click to JAN accommodation lookup per occupation",
          ]}
          visual={<LaborMarketVisual />}
        />
      </div>
    </section>
  );
}

function FeatureBlock({
  eyebrow,
  title,
  body,
  bullets,
  visual,
  reversed,
}: {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  visual: React.ReactNode;
  reversed?: boolean;
}) {
  return (
    <div className={`grid md:grid-cols-2 gap-10 items-center ${reversed ? "md:[&>*:first-child]:order-2" : ""}`}>
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">
          {eyebrow}
        </p>
        <h3 className="text-3xl tracking-tight">{title}</h3>
        <p className="text-ink/75">{body}</p>
        <ul className="space-y-2 pt-1">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2 text-sm text-ink/80">
              <span className="text-accent font-bold mt-0.5">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>{visual}</div>
    </div>
  );
}

function IpeVisual() {
  return (
    <div className="border border-ink/15 rounded-lg bg-white shadow-sm p-5 space-y-3">
      <div className="text-xs uppercase tracking-wider text-ink/50">
        IPE draft · v3
      </div>
      {[
        { label: "Employment Goal", value: "Medical Office Administrator" },
        { label: "Timeline", value: "12 months · Goal date Jun 2027" },
        { label: "VR Services", value: "5 services · 2 integrated CRPs" },
        { label: "Accommodations", value: "Workplace, training, AT" },
        { label: "Mutual Responsibilities", value: "Agency + Client signed" },
      ].map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-2 text-sm border-b border-ink/10 pb-2 last:border-0"
        >
          <span className="text-ink/60">{row.label}</span>
          <span className="text-ink font-semibold text-right">{row.value}</span>
        </div>
      ))}
      <div className="text-[11px] text-emerald-700 font-semibold pt-1">
        ✓ All WIOA § 102(b) required fields present
      </div>
    </div>
  );
}

function DualInterfaceVisual() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="border border-ink/15 rounded-lg bg-white shadow-sm p-4">
        <div className="text-xs uppercase tracking-wider text-ink/50 mb-2">
          Counselor
        </div>
        <ul className="text-xs space-y-1.5 text-ink/80">
          <li>📋 Caseload (5)</li>
          <li>📝 IPE Builder</li>
          <li>📊 Labor Market</li>
          <li>📁 Reports</li>
          <li>🎓 CE Tracker</li>
        </ul>
      </div>
      <div className="border border-ink/15 rounded-lg bg-cream shadow-sm p-4">
        <div className="text-xs uppercase tracking-wider text-accent mb-2">
          Client
        </div>
        <ul className="text-xs space-y-1.5 text-ink/80">
          <li>🧭 Find My Path</li>
          <li>📝 Interest Profiler</li>
          <li>🎯 My Matches</li>
          <li>📄 Resume</li>
          <li>💬 AI Coach</li>
        </ul>
      </div>
      <div className="col-span-2 text-[11px] text-center text-ink/55 italic">
        Both views update the same client record in real time
      </div>
    </div>
  );
}

function LaborMarketVisual() {
  const rows = [
    { title: "Medical Records Specialist", soc: "29-2072", fit: "91%", wage: "$47k" },
    { title: "Medical Office Administrator", soc: "43-6013", fit: "88%", wage: "$42k" },
    { title: "Patient Services Rep", soc: "43-4051", fit: "84%", wage: "$38k" },
    { title: "Health Information Tech", soc: "29-2072", fit: "82%", wage: "$45k" },
  ];
  return (
    <div className="border border-ink/15 rounded-lg bg-white shadow-sm p-5 space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="text-xs uppercase tracking-wider text-ink/50">
          Labor Market for VR-2026-0041
        </div>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
          BLS + O*NET
        </span>
      </div>
      {rows.map((r) => (
        <div
          key={r.soc}
          className="flex items-center justify-between text-sm border-b border-ink/10 pb-2 last:border-0"
        >
          <div>
            <div className="font-semibold">{r.title}</div>
            <div className="text-[11px] text-ink/55">SOC {r.soc}</div>
          </div>
          <div className="text-right">
            <div className="text-accent font-bold text-sm">{r.fit}</div>
            <div className="text-[11px] text-ink/55">{r.wage} median</div>
          </div>
        </div>
      ))}
      <div className="text-[11px] text-ink/55 italic">
        Localized to ZIP 60652 · OOH 2024–34
      </div>
    </div>
  );
}

// ────────────────────────── ROI metrics ─────────────────────────────────

function RoiMetrics() {
  return (
    <section className="bg-ink/[0.02] border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-10">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-widest text-accent">
            Quantifiable impact
          </p>
          <h2 className="text-4xl tracking-tight">
            The math state agencies and CRP directors actually care about.
          </h2>
          <p className="text-ink/70">
            Every metric below is designed in — measured against the
            tools-of-record state VR programs use today (Microsoft Word,
            spreadsheets, agency-specific CMS, and third-party assessment
            vendors).
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric
            value="8 min"
            label="To draft a WIOA-compliant IPE"
            sub="Down from a typical 2–3 hours of counselor time"
          />
          <Metric
            value="44"
            label="Validated assessment items"
            sub="Mini-IPIP Big Five + O*NET Interest Profiler"
          />
          <Metric
            value="60+"
            label="O*NET occupations matched per client"
            sub="By Holland (RIASEC) fit against BLS wage band"
          />
          <Metric
            value="0"
            label="Tabs to switch for labor-market data"
            sub="BLS, CareerOneStop, apprenticeship.gov inline"
          />
          <Metric
            value="36 / 22"
            label="Counselor / client tools in one platform"
            sub="Replaces 5–8 third-party portals on a typical caseload"
          />
          <Metric
            value="7"
            label="WIOA § 102(b) required IPE elements"
            sub="All prefilled and validated before signature"
          />
          <Metric
            value="Real-time"
            label="Client progress visible to counselor"
            sub="No follow-up email needed to know what's done"
          />
          <Metric
            value="$0"
            label="Pilot pricing for state VR programs"
            sub="First 90 days, up to 25 active cases"
          />
        </div>
      </div>
    </section>
  );
}

function Metric({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="border border-ink/15 bg-cream rounded-lg p-5">
      <div className="text-4xl text-accent font-bold leading-none mb-2">
        {value}
      </div>
      <div className="text-sm font-semibold text-ink">{label}</div>
      <div className="text-xs text-ink/60 mt-1">{sub}</div>
    </div>
  );
}

// ────────────────────────── Testimonial ─────────────────────────────────

function Testimonial() {
  return (
    <section className="border-b border-ink/10">
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-6">
        <p className="text-xs uppercase tracking-widest text-accent">
          From the field
        </p>
        <blockquote className="text-2xl md:text-3xl tracking-tight leading-snug text-ink/90 italic">
          &ldquo;After eight years on the caseload I was spending more time
          formatting IPE Word docs than I was with my clients. Pathways Pro is
          the tool I wished I had on day one — every WIOA element is already
          there, the labor-market data is live, and my clients can finally see
          what I see.&rdquo;
        </blockquote>
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="w-12 h-12 bg-accent text-cream rounded-full grid place-items-center font-bold">
            CM
          </div>
          <div className="text-left">
            <div className="font-semibold">Candace Metcalf, CRC · LPC</div>
            <div className="text-sm text-ink/60">
              Founder, Pathways Pro · Chicago
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────── Final CTA ───────────────────────────────────

function FinalCta() {
  return (
    <section id="signin" className="bg-accent/5">
      <div
        id="demo"
        className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-start"
      >
        <div id="start" className="space-y-5 pt-2">
          <p className="text-xs uppercase tracking-widest text-accent">
            Get started
          </p>
          <h2 className="text-4xl tracking-tight">
            See your caseload running on Pathways Pro this week.
          </h2>
          <p className="text-ink/75">
            State VR agencies and community rehab providers can book a
            30-minute walkthrough, or stand up a 90-day pilot for up to 25
            active cases — no procurement paperwork required.
          </p>
          <ul className="space-y-2 text-sm text-ink/80 pt-1">
            <li className="flex gap-2">
              <span className="text-accent font-bold" aria-hidden>✓</span>
              <span>Live demo against your real workflow questions</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold" aria-hidden>✓</span>
              <span>
                HIPAA-aligned architecture &amp; § 508 documentation on
                request
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold" aria-hidden>✓</span>
              <span>White-glove import of your existing caseload</span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-3">
            <Link
              href="/request-demo"
              className="bg-accent text-cream font-semibold px-5 py-3 min-h-[44px] rounded-md hover:bg-accent/90 transition"
            >
              Request a Demo →
            </Link>
            <Link
              href="/request-demo"
              className="border border-accent text-accent font-semibold px-5 py-3 min-h-[44px] rounded-md hover:bg-accent/5 transition"
            >
              Start a 90-day pilot
            </Link>
          </div>
        </div>

        <div className="bg-cream border border-ink/15 rounded-lg shadow-sm p-7 space-y-4">
          <h3 className="text-xl">Already using Pathways Pro?</h3>
          <p className="text-sm text-ink/70">
            Counselors and clients sign in to their workspace; employers,
            vendors, and employment partners enter through the business
            portal.
          </p>
          <div className="space-y-2">
            <Link
              href="/signin"
              className="block text-center bg-accent text-cream font-semibold py-3 min-h-[44px] rounded-md hover:bg-accent/90 transition"
            >
              Counselor / client sign in →
            </Link>
            <Link
              href="/business#signin"
              className="block text-center border border-accent text-accent font-semibold py-3 min-h-[44px] rounded-md hover:bg-accent/5 transition"
            >
              Business / vendor sign in →
            </Link>
          </div>
          <p className="text-xs text-ink/55 border-t border-ink/10 pt-3">
            Demo account: <code className="bg-ink/5 px-1 rounded">demo.counselor@pathwayspro.app</code>{" "}
            / <code className="bg-ink/5 px-1 rounded">demo1234</code>
          </p>
        </div>
      </div>
    </section>
  );
}
