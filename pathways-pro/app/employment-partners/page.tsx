import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Employment Partners | Pathways Pro",
  description:
    "Join the Pathways Pro partner network. Co-design inclusive employment pipelines, meet Section 503 utilization goals, and access WOTC-eligible talent — all from a single platform.",
};

/* ────────────────────────────────────────────────────────────────────────
   Employment Partners — B2B landing page
   Targets: corporate leaders, HR executives, talent acquisition teams
   WCAG 2.1 AA: semantic HTML, landmark regions, visible focus,
   contrast-checked against ink/cream/accent palette.
──────────────────────────────────────────────────────────────────────── */

export default function EmploymentPartnersPage() {
  return (
    <main className="space-y-0 -mx-6 -mt-6 mb-[-2rem]">
      <Hero />
      <ThreePillars />
      <ComplianceRoi />
      <WorkplaceHighlights />
      <NetworkDirectory />
      <PartnerCta />
    </main>
  );
}

/* ═══════════════════════════════════ Hero ═══════════════════════════════ */

function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="border-b border-ink/10 bg-accent/[0.03]"
    >
      <div className="max-w-6xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-14 items-center">
        <div className="space-y-6">
          <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
            Employment Partners
          </p>
          <h1
            id="hero-heading"
            className="text-5xl md:text-[3.4rem] tracking-tight leading-[1.08]"
          >
            Your workforce strategy,{" "}
            <em className="italic text-accent">unified</em> with purpose.
          </h1>
          <p className="text-lg text-ink/85 prose-narrow font-medium">
            The companies that will define the next decade of talent are
            the ones building inclusive pipelines today. Pathways Pro
            connects your enterprise directly to a vetted network of
            job-ready candidates, rehabilitation counselors, and
            compliance infrastructure — turning disability inclusion from
            a checkbox into a competitive advantage.
          </p>
          <p className="text-base text-ink/70 prose-narrow">
            Section 503 utilization. ADA accommodation tracking. WOTC
            verification. One platform, zero fragmentation.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#become-partner"
              className="bg-accent text-cream font-semibold px-6 py-3 rounded-md hover:bg-accent/90 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Become a partner
            </a>
            <a
              href="mailto:candace@pathwayspro.app?subject=Employment%20Partnership%20inquiry"
              className="border border-accent text-accent font-semibold px-6 py-3 rounded-md hover:bg-accent/5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Schedule a briefing
            </a>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="border border-ink/15 rounded-lg bg-white shadow-sm p-6 space-y-4"
        >
          <div className="text-xs uppercase tracking-wider text-ink/50">
            Partner impact dashboard
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Active placements" value="47" />
            <StatCard label="Retention rate (12 mo)" value="91%" />
            <StatCard label="Section 503 progress" value="6.8%" sub="of 7% goal" />
            <StatCard label="WOTC credits captured" value="$184k" sub="YTD" />
          </div>
          <p className="text-[11px] text-ink/50 italic">
            Illustrative dashboard — real metrics populate when connected
          </p>
        </div>
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="border border-ink/10 rounded-md p-3 bg-cream">
      <div className="text-[10px] uppercase tracking-wider text-ink/50">
        {label}
      </div>
      <div className="text-2xl font-bold text-accent leading-tight mt-1">
        {value}
      </div>
      {sub && <div className="text-[11px] text-ink/50">{sub}</div>}
    </div>
  );
}

/* ═══════════════════════════ Three Pillars ═════════════════════════════ */

function ThreePillars() {
  const pillars = [
    {
      number: "01",
      title: "Supported & Customized Employment",
      headline: "Co-design workflows that match unique talents to real business needs.",
      body: "Our counselors work directly with your operations and HR teams to carve roles, design accommodations, and build structural supports that let every hire contribute at full capacity. Customized Employment goes beyond placement — it redesigns the job itself around the person's strengths.",
      points: [
        "Job carving and role restructuring consultation",
        "On-site and remote accommodation co-design",
        "Ongoing job coaching and natural supports setup",
        "Discovery-based profiling to surface hidden talent",
      ],
    },
    {
      number: "02",
      title: "Inclusive Pipelines & Internships",
      headline: "Build experiential learning tracks optimized for individuals with disabilities.",
      body: "Move beyond the one-off accommodation request. Pathways Pro helps you design structured internship, apprenticeship, and volunteer pathways with built-in accessibility — from application through onboarding through promotion. Every track feeds a measurable, diverse talent pipeline.",
      points: [
        "Pre-ETS transition pipelines for students with disabilities",
        "Apprenticeship frameworks with WIOA-aligned support",
        "Accessible application and interview toolkits",
        "Pipeline-to-hire conversion tracking and analytics",
      ],
    },
    {
      number: "03",
      title: "Integrated Business Services",
      headline: "Job task analysis, inclusive assessments, and structural consulting — all in-platform.",
      body: "Your HR and operations teams get direct access to Pathways Pro's business-facing tools: detailed job task analyses that surface accommodation opportunities, inclusive hiring assessments that reduce bias, and ADA / Section 504 structural consulting that protects your organization and your people.",
      points: [
        "Job task analysis with accommodation mapping",
        "Inclusive hiring assessments (bias-reduction scoring)",
        "ADA / Section 504 workplace consulting",
        "Retention risk analysis and intervention planning",
      ],
    },
  ];

  return (
    <section aria-labelledby="pillars-heading" className="border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-16">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs uppercase tracking-widest text-accent">
            The three pillars of partnership
          </p>
          <h2 id="pillars-heading" className="text-4xl tracking-tight">
            From compliance obligation to workforce competitive advantage.
          </h2>
        </header>

        {pillars.map((p, i) => (
          <article
            key={p.number}
            className={`grid md:grid-cols-2 gap-10 items-start ${
              i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex-none w-10 h-10 grid place-items-center rounded-md bg-accent text-cream text-sm font-bold"
                >
                  {p.number}
                </span>
                <span className="text-xs uppercase tracking-widest text-accent font-semibold">
                  {p.title}
                </span>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight">
                {p.headline}
              </h3>
              <p className="text-ink/75 leading-relaxed">{p.body}</p>
              <ul className="space-y-2 pt-1" role="list">
                {p.points.map((pt) => (
                  <li key={pt} className="flex gap-2 text-sm text-ink/80">
                    <span aria-hidden="true" className="text-accent font-bold mt-0.5 flex-none">
                      &#10003;
                    </span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
            <PillarVisual index={i} />
          </article>
        ))}
      </div>
    </section>
  );
}

function PillarVisual({ index }: { index: number }) {
  const visuals = [
    {
      header: "Customized Employment workflow",
      rows: [
        { step: "Discovery", status: "Complete", accent: true },
        { step: "Job carve proposal", status: "Under review", accent: false },
        { step: "Accommodation plan", status: "Drafted", accent: false },
        { step: "90-day supported placement", status: "Pending", accent: false },
      ],
    },
    {
      header: "Inclusive internship pipeline",
      rows: [
        { step: "Applications received", status: "34", accent: true },
        { step: "Accommodation requests", status: "12 (auto-matched)", accent: false },
        { step: "Interviews scheduled", status: "18", accent: false },
        { step: "Offers extended", status: "8", accent: true },
      ],
    },
    {
      header: "Job task analysis — Warehouse Associate",
      rows: [
        { step: "Essential functions mapped", status: "14 of 14", accent: true },
        { step: "Accommodation opportunities", status: "6 identified", accent: false },
        { step: "JAN resources linked", status: "4 solutions", accent: false },
        { step: "Inclusive assessment score", status: "92 / 100", accent: true },
      ],
    },
  ];
  const v = visuals[index];
  return (
    <div
      aria-hidden="true"
      className="border border-ink/15 rounded-lg bg-white shadow-sm p-5 space-y-3"
    >
      <div className="text-xs uppercase tracking-wider text-ink/50">
        {v.header}
      </div>
      {v.rows.map((r) => (
        <div
          key={r.step}
          className="flex items-center justify-between text-sm border-b border-ink/10 pb-2 last:border-0"
        >
          <span className="text-ink/70">{r.step}</span>
          <span
            className={
              r.accent ? "text-accent font-semibold" : "text-ink/60"
            }
          >
            {r.status}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════ Compliance & Legal ROI ════════════════════════ */

function ComplianceRoi() {
  const items = [
    {
      title: "Section 503 utilization goals",
      stat: "7%",
      statLabel: "federal workforce target",
      body: "Federal contractors must maintain a 7% utilization goal for individuals with disabilities. Pathways Pro tracks your progress in real time, surfaces pipeline gaps, and connects you directly to qualified candidates — so audits become milestones, not emergencies.",
    },
    {
      title: "Title I ADA risk mitigation",
      stat: "JAN",
      statLabel: "integrated",
      body: "Every accommodation request is logged, tracked, and linked to Job Accommodation Network (JAN) solutions automatically. Your legal and HR teams get a complete audit trail — from interactive-process initiation through implementation — reducing exposure and demonstrating good-faith compliance.",
    },
    {
      title: "Work Opportunity Tax Credits",
      stat: "WOTC",
      statLabel: "auto-verified",
      body: "Pathways Pro identifies WOTC-eligible hires during onboarding and pre-populates IRS Form 8850 documentation. Stop leaving credits on the table — employers typically capture $2,400 to $9,600 per qualifying hire.",
    },
  ];

  return (
    <section
      aria-labelledby="compliance-heading"
      className="border-b border-ink/10 bg-ink/[0.02]"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs uppercase tracking-widest text-accent">
            Compliance & legal ROI
          </p>
          <h2 id="compliance-heading" className="text-4xl tracking-tight">
            Turn mandates into measurable returns.
          </h2>
          <p className="text-ink/70 text-lg">
            Disability inclusion isn&apos;t just the right thing — it&apos;s a
            federal requirement with real financial incentives. Pathways
            Pro automates the compliance infrastructure so your team can
            focus on the strategy.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item) => (
            <article
              key={item.title}
              className="border border-ink/15 bg-cream rounded-lg p-6 space-y-4"
            >
              <div>
                <div className="text-4xl font-bold text-accent leading-none">
                  {item.stat}
                </div>
                <div className="text-xs text-ink/55 mt-1">{item.statLabel}</div>
              </div>
              <h3 className="text-lg font-semibold text-ink">{item.title}</h3>
              <p className="text-sm text-ink/70 leading-relaxed">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ Disability-Friendly Workplace ═════════════════════ */

function WorkplaceHighlights() {
  const highlights = [
    {
      icon: "01",
      title: "Accessible onboarding",
      description:
        "Orientation materials in multiple formats, assistive technology provisioned before day one, and a dedicated accommodation liaison assigned during the first 90 days.",
    },
    {
      icon: "02",
      title: "Universal design infrastructure",
      description:
        "Workspaces, tools, and digital systems designed for the widest range of abilities from the start — reducing reactive accommodations and increasing everyone's productivity.",
    },
    {
      icon: "03",
      title: "Measurable retention metrics",
      description:
        "Track 30/60/90-day and 12-month retention rates for hires with disabilities alongside your general workforce. Surface intervention triggers before turnover happens.",
    },
    {
      icon: "04",
      title: "Natural supports framework",
      description:
        "Trained mentors and peer-support structures embedded in your teams — not external job coaches. Sustainable, scalable, and integrated into your existing culture.",
    },
    {
      icon: "05",
      title: "Interactive process documentation",
      description:
        "Every accommodation request flows through a structured interactive process with automatic documentation, timeline tracking, and outcome recording for legal defensibility.",
    },
    {
      icon: "06",
      title: "Executive visibility dashboard",
      description:
        "C-suite and board-level reporting on inclusion KPIs: utilization rate, pipeline diversity, accommodation turnaround time, and WOTC credits captured.",
    },
  ];

  return (
    <section
      aria-labelledby="workplace-heading"
      className="border-b border-ink/10"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs uppercase tracking-widest text-accent">
            What defines a premium partner
          </p>
          <h2 id="workplace-heading" className="text-4xl tracking-tight">
            The anatomy of a disability-forward workplace.
          </h2>
          <p className="text-ink/70">
            These are the operational hallmarks we look for — and help you
            build — when you join the Pathways Pro partner network.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {highlights.map((h) => (
            <article
              key={h.icon}
              className="border border-ink/15 bg-cream rounded-lg p-5 space-y-3"
            >
              <span
                aria-hidden="true"
                className="inline-flex w-9 h-9 items-center justify-center rounded-md bg-accent text-cream text-sm font-bold"
              >
                {h.icon}
              </span>
              <h3 className="text-base font-semibold text-ink">{h.title}</h3>
              <p className="text-sm text-ink/70 leading-relaxed">
                {h.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ Dynamic Network Directory ═════════════════════════ */

function NetworkDirectory() {
  // Static seed for the landing page; when connected to the API, this
  // fetches from /api/network and renders real partner/vendor/client records.
  const partners = [
    { name: "North Branch Cafe", type: "Small Employer", location: "Chicago, IL", status: "Verified" },
    { name: "Chicago Public Libraries — Workforce Programs", type: "Government", location: "Chicago, IL", status: "Verified" },
    { name: "Community Connections Co-op", type: "Small Employer", location: "Chicago, IL", status: "Verified" },
    { name: "Brightside Supported Employment", type: "Non-Profit", location: "Chicago, IL", status: "Verified" },
    { name: "Launch Internship Network", type: "Community Org", location: "Chicago, IL", status: "Verified" },
  ];
  const vendors = [
    { name: "Vocational Connections, Inc.", type: "CRP", specialty: "Supported Employment" },
    { name: "Piedmont Forensic Vocational", type: "Forensic", specialty: "Forensic Assessment" },
    { name: "AbilityBridge AT Solutions", type: "Ergonomic", specialty: "Assistive Technology" },
    { name: "Cornerstone Workforce Training", type: "Training", specialty: "ETPL Provider" },
  ];

  return (
    <section
      aria-labelledby="network-heading"
      className="border-b border-ink/10 bg-accent/[0.03]"
    >
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-10">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs uppercase tracking-widest text-accent">
            The network
          </p>
          <h2 id="network-heading" className="text-4xl tracking-tight">
            You&apos;re joining an ecosystem, not signing a contract.
          </h2>
          <p className="text-ink/70">
            Every verified partner, vendor, and service provider in the
            Pathways Pro network is connected to counselors and clients
            working toward the same goal: competitive, integrated
            employment.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Employment Partners */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-accent font-semibold">
              Employment Partners
            </h3>
            <div className="space-y-2">
              {partners.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center justify-between border border-ink/10 bg-cream rounded-md px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-ink">
                      {p.name}
                    </div>
                    <div className="text-xs text-ink/55">
                      {p.type} &middot; {p.location}
                    </div>
                  </div>
                  <span className="text-[11px] bg-accent/10 text-accent font-semibold px-2 py-0.5 rounded-full">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Vendors & Service Providers */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-widest text-accent font-semibold">
              Vendors &amp; Service Providers
            </h3>
            <div className="space-y-2">
              {vendors.map((v) => (
                <div
                  key={v.name}
                  className="flex items-center justify-between border border-ink/10 bg-cream rounded-md px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-ink">
                      {v.name}
                    </div>
                    <div className="text-xs text-ink/55">
                      {v.type} &middot; {v.specialty}
                    </div>
                  </div>
                  <span className="text-[11px] bg-accent/10 text-accent font-semibold px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════ Partner CTA ═══════════════════════════════ */

function PartnerCta() {
  return (
    <section
      id="become-partner"
      aria-labelledby="cta-heading"
      className="bg-accent/5"
    >
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-6">
        <h2 id="cta-heading" className="text-4xl tracking-tight">
          Ready to build a workforce that reflects the full diversity of
          human capability?
        </h2>
        <p className="text-ink/70 text-lg max-w-2xl mx-auto">
          Join companies, government agencies, and non-profits already
          using Pathways Pro to transform compliance into competitive
          advantage. A 30-minute briefing is all it takes to see how the
          platform connects to your existing talent strategy.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-3">
          <a
            href="mailto:candace@pathwayspro.app?subject=Employment%20Partnership%20-%20Briefing%20Request"
            className="bg-accent text-cream font-semibold px-6 py-3 rounded-md hover:bg-accent/90 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Schedule a briefing
          </a>
          <Link
            href="/request-demo"
            className="border border-accent text-accent font-semibold px-6 py-3 rounded-md hover:bg-accent/5 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Request a full demo
          </Link>
        </div>
        <p className="text-xs text-ink/50 pt-4">
          Pathways Pro. Rehabilitation, unified.
        </p>
      </div>
    </section>
  );
}
