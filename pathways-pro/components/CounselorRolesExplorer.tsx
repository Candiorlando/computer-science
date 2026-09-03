"use client";

// Shared explorer for the top 30 vocational rehabilitation counseling
// roles — curated tier ranking, salary sort, certification grouping,
// and the featured Services & Markets profile. Rendered inline on the
// public homepage and standalone at /counselor-roles.

import { useMemo, useState } from "react";

type Tier = 1 | 2 | 3;
type Cert =
  | "CRC"
  | "CVE"
  | "CDMS"
  | "CESP"
  | "ABVE"
  | "ATP"
  | "CEAS"
  | "GCDF"
  | "Varies";

interface Role {
  rank: number;
  tier: Tier;
  title: string;
  description: string;
  salaryLow: number; // USD, estimated national average band
  salaryHigh: number;
  certs: Cert[]; // primary credential first
}

const ROLES: Role[] = [
  // ── Tier 1 · High-Density Vocational Occupations ──
  { rank: 1, tier: 1, title: "State Vocational Rehabilitation Counselor (VRC)", description: "Manages public caseloads under state agencies to determine federal eligibility and fund academic or job retraining programs.", salaryLow: 55_000, salaryHigh: 80_000, certs: ["CRC"] },
  { rank: 2, tier: 1, title: "School-to-Work Transition Counselor", description: "Guides high school students with physical or cognitive Individualized Education Programs (IEPs) into workplace or career tracks.", salaryLow: 52_000, salaryHigh: 75_000, certs: ["CRC"] },
  { rank: 3, tier: 1, title: "Job Coach / Employment Specialist", description: "Provides direct, on-site task instruction and behavioral scaffolding to neurodivergent adults entering commercial work environments.", salaryLow: 38_000, salaryHigh: 55_000, certs: ["CESP"] },
  { rank: 4, tier: 1, title: "Career Development Advisor", description: "Assists adults in higher education or workforce centers with résumé building, skill mapping, and career transitions.", salaryLow: 50_000, salaryHigh: 75_000, certs: ["GCDF"] },
  { rank: 5, tier: 1, title: "Disability Case Manager", description: "Reviews medical documentation for corporate employers or insurers to validate return-to-work timelines for private disability benefits.", salaryLow: 70_000, salaryHigh: 95_000, certs: ["CDMS"] },
  { rank: 6, tier: 1, title: "Workers' Compensation Specialist", description: "Manages the bridge between occupational injury recovery, insurance payouts, and employer return-to-work compliance tracks.", salaryLow: 68_000, salaryHigh: 98_000, certs: ["CDMS", "CRC"] },

  // ── Tier 2 · Mid-Market & Agency Vocational Specialties ──
  { rank: 7, tier: 2, title: "Veterans Affairs VR&E Counselor", description: "Works within the federal Vocational Rehabilitation and Employment (Chapter 31) program to retrain service-disabled military veterans.", salaryLow: 75_000, salaryHigh: 105_000, certs: ["CRC"] },
  { rank: 8, tier: 2, title: "Job Development Specialist", description: "Conducts labor market surveys, identifies employment leads, and builds partnerships with local businesses to secure client placements.", salaryLow: 48_000, salaryHigh: 70_000, certs: ["CESP", "CRC"] },
  { rank: 9, tier: 2, title: "Academic Disability Accommodations Coordinator", description: "Evaluates documentation at universities to assign legal workplace and testing accommodations like screen readers or ergonomic furniture.", salaryLow: 55_000, salaryHigh: 78_000, certs: ["Varies", "CRC"] },
  { rank: 10, tier: 2, title: "Supported Employment Coordinator", description: "Oversees agency programs that place individuals with complex intellectual or developmental disabilities into integrated work environments.", salaryLow: 50_000, salaryHigh: 72_000, certs: ["CESP", "CRC"] },
  { rank: 11, tier: 2, title: "Corrections Re-entry Vocational Specialist", description: "Prepares incarcerated individuals nearing release for workforce integration through trades, soft-skills training, and job placement.", salaryLow: 48_000, salaryHigh: 70_000, certs: ["CRC", "Varies"] },
  { rank: 12, tier: 2, title: "Military Transition Assistance Program (TAP) Counselor", description: "Assists departing military personnel in translating operational skills into civilian career sectors and private industry roles.", salaryLow: 55_000, salaryHigh: 80_000, certs: ["GCDF"] },
  { rank: 13, tier: 2, title: "Workforce Innovation and Opportunity Act (WIOA) Counselor", description: "Administers federally funded retraining services for dislocated workers, low-income adults, and youth facing employment barriers.", salaryLow: 52_000, salaryHigh: 75_000, certs: ["Varies", "GCDF"] },
  { rank: 14, tier: 2, title: "Juvenile Justice Vocational Instructor", description: "Designs structured trade and career-readiness pathways for youth within correctional systems to minimize recidivism.", salaryLow: 48_000, salaryHigh: 68_000, certs: ["Varies"] },
  { rank: 15, tier: 2, title: "Ticket to Work Case Manager", description: "Helps Social Security Disability Insurance (SSDI) beneficiaries transition back into full-time employment without immediately losing health benefits.", salaryLow: 48_000, salaryHigh: 68_000, certs: ["CRC", "Varies"] },
  { rank: 16, tier: 2, title: "Community Rehab Program (CRP) Employment Director", description: "Manages non-profit budgets and service delivery pipelines for community-based vocational training facilities.", salaryLow: 68_000, salaryHigh: 100_000, certs: ["CRC"] },

  // ── Tier 3 · Highly Specialized Niche Vocational Roles ──
  { rank: 17, tier: 3, title: "Forensic Vocational Expert", description: "Testifies in courtrooms regarding an injured individual's post-accident residual earning capacity and labor market access.", salaryLow: 95_000, salaryHigh: 160_000, certs: ["ABVE", "CRC", "CVE"] },
  { rank: 18, tier: 3, title: "Certified Vocational Evaluation Specialist (CVE)", description: "Administers standardized psychometric and work-sample testing tools to establish baseline employability profiles.", salaryLow: 75_000, salaryHigh: 110_000, certs: ["CVE", "CRC"] },
  { rank: 19, tier: 3, title: "Assistive Technology Vocational Consultant", description: "Audits workplace environments to configure ergonomic hardware, sensory devices, and communication software for employee retention.", salaryLow: 65_000, salaryHigh: 98_000, certs: ["ATP"] },
  { rank: 20, tier: 3, title: "Private-Practice Outplacement Consultant", description: "Offers direct-hire outplacement services and customized career counseling tailored to individuals paying out-of-pocket or via corporate layoff packages.", salaryLow: 85_000, salaryHigh: 140_000, certs: ["GCDF"] },
  { rank: 21, tier: 3, title: "Deaf & Hard of Hearing Vocational Specialist", description: "Utilizes American Sign Language (ASL) and specialized culture models to facilitate job placement and workplace tech accommodations.", salaryLow: 55_000, salaryHigh: 80_000, certs: ["CRC"] },
  { rank: 22, tier: 3, title: "Blind & Visually Impaired Vocational Counselor", description: "Coordinates orientation, mobility instruction, and braille/screen-reading transitions to help blind professionals retain corporate employment.", salaryLow: 55_000, salaryHigh: 80_000, certs: ["CRC"] },
  { rank: 23, tier: 3, title: "Industrial Rehabilitation Consultant", description: "Partners with industrial operations to design injury-prevention protocols and modify heavy machinery fields for altered capabilities.", salaryLow: 82_000, salaryHigh: 125_000, certs: ["CDMS", "CEAS"] },
  { rank: 24, tier: 3, title: "Autism Spectrum Employment Consultant", description: "Builds structured, sensory-adjusted, and predictable employment workflows tailored specifically for neurodivergent professionals.", salaryLow: 60_000, salaryHigh: 88_000, certs: ["CESP"] },
  { rank: 25, tier: 3, title: "Traumatic Brain Injury (TBI) Vocational Coach", description: "Designs cognitive pacing plans and memory aids to help individuals recovering from head trauma safely re-enter their previous professions.", salaryLow: 60_000, salaryHigh: 85_000, certs: ["CRC"] },
  { rank: 26, tier: 3, title: "Employee Assistance Program (EAP) Career Counselor", description: "Delivers short-term corporate counseling interventions to resolve workplace performance issues, burnout, or internal job displacement.", salaryLow: 65_000, salaryHigh: 95_000, certs: ["GCDF", "Varies"] },
  { rank: 27, tier: 3, title: "Ergonomic Job Modification Specialist", description: "Redesigns physical workstations and modifies job descriptions to meet ADA compliance and accommodate worker physical limitations.", salaryLow: 65_000, salaryHigh: 95_000, certs: ["CEAS"] },
  { rank: 28, tier: 3, title: "Labor Market Analyst / Vocational Researcher", description: "Gathers and interprets complex employment trends, hiring projections, and wage data for large-scale rehabilitation firms.", salaryLow: 80_000, salaryHigh: 120_000, certs: ["CVE", "Varies"] },
  { rank: 29, tier: 3, title: "Senior Living & Geriatric Vocational Consultant", description: "Assists aging adults who want or need to stay in the workforce by identifying low-impact, flexible, or part-time career alternatives.", salaryLow: 55_000, salaryHigh: 85_000, certs: ["GCDF", "CRC"] },
  { rank: 30, tier: 3, title: "Rehabilitation One-Stop Center Manager", description: "Oversees the daily operations and cross-agency collaboration at public, comprehensive American Job Centers (AJCs).", salaryLow: 70_000, salaryHigh: 105_000, certs: ["Varies"] },
];

const TIER_META: Record<Tier, { label: string; blurb: string }> = {
  1: {
    label: "Tier 1 · High-Density Vocational Occupations",
    blurb:
      "Core employment roles averaging more than 1,000 active professionals per individual state and per major metropolitan area.",
  },
  2: {
    label: "Tier 2 · Mid-Market & Agency Vocational Specialties",
    blurb:
      "Roles averaging more than 1,000 active professionals in large states (California, Texas, New York) but under 1,000 in smaller state populations.",
  },
  3: {
    label: "Tier 3 · Highly Specialized Niche Vocational Roles",
    blurb:
      "Expert positions functioning as highly specialized private consultants, legal experts, or sub-specialists within the vocational field.",
  },
};

const CERT_META: Record<Cert, { name: string; body: string }> = {
  CRC: { name: "CRC — Certified Rehabilitation Counselor", body: "Commission on Rehabilitation Counselor Certification (CRCC)" },
  CVE: { name: "CVE — Certified Vocational Evaluation Specialist", body: "Commission on Rehabilitation Counselor Certification (CRCC)" },
  CDMS: { name: "CDMS — Certified Disability Management Specialist", body: "Certification of Disability Management Specialists Commission" },
  CESP: { name: "CESP — Certified Employment Support Professional", body: "APSE Employment Support Professional Certification Council" },
  ABVE: { name: "ABVE — Fellow / Diplomate", body: "American Board of Vocational Experts" },
  ATP: { name: "ATP — Assistive Technology Professional", body: "RESNA" },
  CEAS: { name: "CEAS — Certified Ergonomic Assessment Specialist", body: "The Back School / ergonomics certification bodies" },
  GCDF: { name: "GCDF / CCSP — Career Development Facilitator", body: "Center for Credentialing & Education (CCE) / NCDA" },
  Varies: { name: "No single required credential (role- or agency-based)", body: "Requirements set by employer, state, or federal program" },
};

const CERT_ORDER: Cert[] = ["CRC", "CVE", "CDMS", "CESP", "ABVE", "ATP", "CEAS", "GCDF", "Varies"];

const REFERENCES: { label: string; href: string }[] = [
  { label: "Pearson — Career Assessment Inventory (Vocational Version)", href: "https://www.pearsonassessments.com/en-us/Store/Professional-Assessments/Career-Planning/Career-Assessment-Inventory-%7C-The-Vocational-Version/p/100000425" },
  { label: "Ohio DBH — Supported Employment", href: "https://dbh.ohio.gov/community-partners/employment/supported-employment" },
  { label: "CounselingPsychology.org — VR Counselor careers", href: "https://www.counselingpsychology.org/counseling/careers/vocational-rehabilitation-counselor/" },
  { label: "DB101 — Ticket to Work program", href: "https://ca.db101.org/ca/programs/job_planning/work_support/program2b.htm" },
  { label: "ABAedu.org — What is a VR counselor?", href: "https://www.appliedbehavioranalysisedu.org/jobs-related-to-applied-behavior-analysis/what-is-a-vocational-rehabilitation-counselor/" },
];

type View = "tier" | "salary" | "cert";

function money(n: number): string {
  return "$" + Math.round(n / 1000) + "k";
}

export function CounselorRolesExplorer() {
  const [view, setView] = useState<View>("tier");

  const bySalary = useMemo(
    () =>
      [...ROLES].sort(
        (a, b) =>
          (b.salaryLow + b.salaryHigh) / 2 - (a.salaryLow + a.salaryHigh) / 2,
      ),
    [],
  );

  return (
    <div className="space-y-10">
      <div
        role="tablist"
        aria-label="Change how the roles are organized"
        className="flex flex-wrap gap-2"
      >
        <ViewTab current={view} target="tier" onClick={setView}>
          By tier (curated ranking)
        </ViewTab>
        <ViewTab current={view} target="salary" onClick={setView}>
          By highest average salary
        </ViewTab>
        <ViewTab current={view} target="cert" onClick={setView}>
          By required certification
        </ViewTab>
      </div>

      {view === "tier" && (
        <div className="space-y-10">
          {([1, 2, 3] as Tier[]).map((tier) => (
            <section key={tier} aria-label={TIER_META[tier].label}>
              <h2 className="text-2xl">{TIER_META[tier].label}</h2>
              <p className="text-sm text-ink/65 mt-1 mb-4 max-w-3xl">
                {TIER_META[tier].blurb}
              </p>
              <ol role="list" className="grid md:grid-cols-2 gap-3">
                {ROLES.filter((r) => r.tier === tier).map((r) => (
                  <RoleCard key={r.rank} role={r} showRank />
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}

      {view === "salary" && (
        <section aria-label="Roles sorted by estimated average salary">
          <p className="text-xs text-ink/55 italic mb-4">
            Estimated national average bands; actual pay varies by region,
            credential, setting, and (for consultants) book of business.
          </p>
          <ol role="list" className="space-y-2">
            {bySalary.map((r, i) => (
              <li key={r.rank} className="saas-card flex items-center gap-4">
                <span className="text-xl font-bold text-accent w-8 text-right shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{r.title}</div>
                  <div className="text-xs text-ink/60 line-clamp-1">
                    {r.description}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-grad-tealblue">
                    {money(r.salaryLow)}–{money(r.salaryHigh)}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-ink/50">
                    Tier {r.tier}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {view === "cert" && (
        <div className="space-y-8">
          <p className="text-xs text-ink/55 italic">
            Roles appear under every credential commonly required or strongly
            preferred for the title — many titles accept more than one.
          </p>
          {CERT_ORDER.map((cert) => {
            const matches = ROLES.filter((r) => r.certs.includes(cert));
            if (matches.length === 0) return null;
            return (
              <section key={cert} aria-label={CERT_META[cert].name}>
                <h2 className="text-lg font-semibold">
                  {CERT_META[cert].name}
                </h2>
                <p className="text-xs text-ink/55 mb-3">
                  Credentialing body: {CERT_META[cert].body} ·{" "}
                  {matches.length} role{matches.length === 1 ? "" : "s"}
                </p>
                <ul role="list" className="grid md:grid-cols-2 gap-2">
                  {matches.map((r) => (
                    <li
                      key={r.rank}
                      className="border border-ink/15 bg-cream rounded-md px-4 py-2.5 flex items-baseline justify-between gap-3"
                    >
                      <span className="text-sm font-semibold">{r.title}</span>
                      <span className="text-[10px] uppercase tracking-wider text-ink/50 shrink-0">
                        {r.certs[0] === cert ? "Primary" : "Accepted"}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* Complete Services & Markets profile — Forensic Vocational Expert */}
      <section
        aria-labelledby="fve-profile-heading"
        className="border-2 border-emerald-300 rounded-xl p-6 bg-emerald-50/30"
      >
        <p className="text-[10px] uppercase tracking-widest text-emerald-700 font-semibold mb-1">
          Complete Services &amp; Markets Profile · Featured Title
        </p>
        <h2 id="fve-profile-heading" className="text-3xl">
          Forensic Vocational Expert
        </h2>
        <p className="text-ink/75 mt-2 max-w-3xl">
          The highest-earning title on the list. Testifies in courtrooms on an
          injured individual&apos;s post-accident residual earning capacity and
          labor market access — every opinion built to survive Daubert/Frye
          scrutiny and ABVE ethics review.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div>
            <h3 className="text-sm uppercase tracking-wider font-semibold text-emerald-800 mb-2">
              Core services
            </h3>
            <ul role="list" className="space-y-2 text-sm">
              {[
                ["Forensic Vocational Evaluation", "Foundation pre- vs post-injury capacity opinion under FRCP 26(a)(2)(B) with itemized record review."],
                ["Wage-Earning Capacity Analysis", "Named-model capacity opinions (RAPEL / PEEDS-RAPEL) with OEWS wages and worklife-expectancy tables."],
                ["Labor Market Assessment (Litigation)", "Documented employer surveys, QCEW/OEWS/ORS statistical base, justified commuting radius."],
                ["Transferable Skills Analysis (Litigation)", "Worker-trait methodology with verified work history and DOT work-field tie-outs."],
                ["Expert Testimony & Deposition", "FRE 702/703/705 testimony with disclosure hygiene and plain-language methodology defense."],
                ["VE File Review & Rebuttal", "Daubert-factor audit of opposing expert reports with reproducibility verification."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-2">
                  <span aria-hidden className="text-emerald-700 shrink-0 mt-0.5">✓</span>
                  <span>
                    <strong>{t}:</strong>{" "}
                    <span className="text-ink/75">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-emerald-800 mb-2">
                Employment markets
              </h3>
              <p className="text-sm text-ink/80 bg-white border border-emerald-200 rounded-md p-3">
                Court systems, private legal practices (plaintiff and defense),
                workers&apos; compensation carriers, federal defense agencies,
                Social Security OHO (VE panel testimony), and marital
                dissolution / family law practices.
              </p>
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-emerald-800 mb-2">
                Credentials &amp; earnings
              </h3>
              <ul role="list" className="text-sm space-y-1 text-ink/80">
                <li>• ABVE Fellow / Diplomate (primary) · CRC · CVE</li>
                <li>• Estimated band: <strong>$95k–$160k+</strong> (case-rate consultants exceed this)</li>
                <li>• Typical engagement pricing: evaluations $2,850–$4,500 flat · testimony $425/hr</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm uppercase tracking-wider font-semibold text-emerald-800 mb-2">
                How Pathways Pro supports this title
              </h3>
              <p className="text-sm text-ink/80">
                A dedicated Forensic workspace with ABVE-conversant standards
                checklists per service, Daubert-aware AI work plans, embedded
                standardized instruments (TSA, WRAT, WAIS-IV, LMS), drafted
                findings the expert edits and signs, and deposition-readiness
                checklists.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-ink/10 pt-4">
        <h2 className="text-sm uppercase tracking-wider text-ink/55 font-semibold mb-2">
          Sources
        </h2>
        <ul role="list" className="flex flex-wrap gap-x-6 gap-y-1.5">
          {REFERENCES.map((r) => (
            <li key={r.href}>
              <a
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-700 hover:underline"
              >
                {r.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </footer>
    </div>
  );
}

function ViewTab({
  current,
  target,
  onClick,
  children,
}: {
  current: View;
  target: View;
  onClick: (v: View) => void;
  children: React.ReactNode;
}) {
  const active = current === target;
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => onClick(target)}
      className={`text-sm px-4 py-2 rounded-full font-semibold transition ${
        active
          ? "grad-tealblue text-white"
          : "bg-white border border-ink/15 hover:bg-ink/5"
      }`}
    >
      {children}
    </button>
  );
}

function RoleCard({ role, showRank }: { role: Role; showRank?: boolean }) {
  return (
    <li className="saas-card h-full">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-semibold text-sm leading-snug">
          {showRank && (
            <span className="text-accent mr-1.5">{role.rank}.</span>
          )}
          {role.title}
        </h3>
        <span className="text-xs font-bold text-grad-tealblue shrink-0">
          {money(role.salaryLow)}–{money(role.salaryHigh)}
        </span>
      </div>
      <p className="text-xs text-ink/70 mt-1.5">{role.description}</p>
      <div className="flex flex-wrap gap-1.5 mt-2.5">
        {role.certs.map((c) => (
          <span
            key={c}
            className="text-[9px] uppercase tracking-wider bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded-full font-semibold"
          >
            {c}
          </span>
        ))}
      </div>
    </li>
  );
}
