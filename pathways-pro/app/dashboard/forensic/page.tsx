"use client";

// Counselor Forensic Practice tab — everything relevant to the
// forensic side of a rehabilitation counselor's work: ABVE-conversant
// vocational opinion standards, the forensic service line with the
// legal/practice standards each deliverable must meet, embedded
// forensic instruments, and a deposition-readiness checklist.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { toolsForCounselorRole } from "@/lib/assessment-tools";
import { getService, formatPrice, effectivePrice } from "@/lib/service-catalog";
import { loadServiceRequests } from "@/lib/service-requests";

interface ForensicService {
  catalogId: string; // matches lib/service-catalog.ts id
  title: string;
  useCase: string;
  standards: string[];
}

// Each service lists the standards required by law and in current
// practice — the checklist an opinion must satisfy to survive a
// Daubert/Frye challenge and ABVE ethics review.
const FORENSIC_SERVICES: ForensicService[] = [
  {
    catalogId: "forensic-vocational-evaluation",
    title: "Forensic Vocational Evaluation",
    useCase:
      "Foundation evaluation for personal injury, workers' compensation, and wrongful-death matters — establishes pre- and post-injury vocational capacity.",
    standards: [
      "FRCP Rule 26(a)(2)(B) — signed written report: complete opinions, basis and reasons, facts/data considered, exhibits, qualifications, prior testimony list (4 years), compensation statement.",
      "FRE 702 — expert qualified by knowledge, skill, experience, training, or education; testimony based on sufficient facts and reliable methods, reliably applied.",
      "Daubert v. Merrell Dow (509 U.S. 579) / Kumho Tire — methodology tested, peer-reviewed, known error rate, generally accepted. Frye general-acceptance standard in Frye jurisdictions (e.g., IL, NY, PA as applicable).",
      "Objective record review — all medical records, FCE results, IEP/school records, employment and earnings records (W-2 / tax transcripts) itemized with source notes.",
      "DOT + Selected Characteristics of Occupations, crosswalked to O*NET; worker-trait transferability methodology documented step-by-step.",
      "Standardized instruments with published norms only (WAIS-IV, WRAT-5) — scores reported with norm tables cited.",
      "ABVE Code of Ethics — objectivity, opinions within scope of expertise, no contingency-fee arrangements.",
    ],
  },
  {
    catalogId: "earning-capacity-assessment",
    title: "Wage-Earning Capacity / Loss of Earning Capacity",
    useCase:
      "Quantifies the difference between pre-injury earning capacity and residual capacity — the core damages number in PI, WC, and marital dissolution matters.",
    standards: [
      "Capacity vs. actual earnings distinction — opinion addresses what the evaluee CAN earn, anchored to demonstrated capacity, not merely past wages.",
      "Accepted earning-capacity model applied and named (RAPEL, PEEDS-RAPEL, Shahnasarian, or Vocational & Rehabilitation Assessment Model) with each element documented.",
      "Residual functional capacity anchored to medical evidence / FCE — no vocational opinion beyond the medical restrictions of record.",
      "BLS OEWS wage data for pre- and post-injury occupations, geography-specific; state LMI cited where used.",
      "Worklife expectancy from published tables (Skoog-Ciecka-Krueger) — assumption stated, not implied.",
      "Mitigation analysis — reasonable diligence of the evaluee's job search addressed where earnings are below capacity.",
      "Present-value calculation handed to the economist OR methodology disclosed if performed (discount rate sourced).",
    ],
  },
  {
    catalogId: "labor-market-analysis",
    title: "Labor Market Assessment (Litigation)",
    useCase:
      "Establishes whether jobs within the evaluee's residual capacity actually exist in the relevant labor market — pairs with the TSA for placeability opinions.",
    standards: [
      "Contemporary labor-market survey — employer contacts documented with date, contact name/title, openings confirmed, and wage quoted, per finding.",
      "BLS QCEW + OEWS and state LMI as the statistical base; ORS (Occupational Requirements Survey) referenced for physical-demand validation of cited occupations.",
      "Geographic scope justified — commuting radius tied to the evaluee's documented transportation capacity and pre-injury commute pattern.",
      "Openings density reported as of a stated date range — no undated 'jobs exist' assertions.",
      "Sources reproducible — a second expert following the notes could reconstruct every finding (Daubert reliability).",
    ],
  },
  {
    catalogId: "expert-testimony-deposition",
    title: "Expert Testimony & Deposition Support",
    useCase:
      "Live vocational-expert testimony at deposition or trial, with disclosure hygiene and opinion defense preparation.",
    standards: [
      "FRE 702/703/705 — opinions based on facts of record or facts experts in the field reasonably rely on; basis disclosable on cross.",
      "Rule 26 report is the ceiling — no new opinions at deposition that were not disclosed in the written report.",
      "Testimony list (prior 4 years) and compensation disclosure current and produced on request.",
      "Methodology terms defined in plain language for the finder of fact — DOT, O*NET, OEWS, ORS, and the capacity model used.",
      "ABVE Code of Ethics — no advocacy; the opinion serves the trier of fact, not the retaining party.",
    ],
  },
  {
    catalogId: "forensic-file-review-rebuttal",
    title: "VE File Review & Rebuttal Report",
    useCase:
      "Methodology audit of an opposing vocational expert's report and a written rebuttal opinion with its own defensible basis.",
    standards: [
      "Opposing opinions inventoried verbatim with page cites before critique — rebut what was said, not a paraphrase.",
      "Daubert-factor audit — was the method tested, peer-reviewed, error-rate-known, generally accepted, and reliably applied?",
      "Data-source verification — cited wages, openings, and transferability runs re-pulled and checked for reproducibility.",
      "Unsupported analytical leaps identified with record citations (ipse dixit flagged per GE v. Joiner).",
      "Rebuttal opinion carries its own Rule 26-compliant basis — a critique alone is not an opinion.",
    ],
  },
  {
    catalogId: "transferable-skills-analysis",
    title: "Transferable Skills Analysis (Litigation)",
    useCase:
      "Maps pre-injury work history to residual-capacity-compatible occupations — the bridge between medical restrictions and the labor market.",
    standards: [
      "Worker-trait methodology (DOT/SCO factors) or SkillTRAN-class software — inputs and settings disclosed so the run is reproducible.",
      "Work history verified against records (SSA earnings, W-2s, job descriptions) — not solely evaluee self-report.",
      "Each skill-transfer conclusion tied to specific DOT work fields / MPSMS codes, not narrative assertion.",
      "SSR 82-41 framework applied where the matter intersects Social Security (skills, not traits, transfer).",
      "Signed by a CRC / CVE with credentials stated — ABVE certification (Fellow/Diplomate) noted where held.",
    ],
  },
];

const CASE_TYPES = [
  "Personal injury",
  "Workers' compensation",
  "Wrongful death",
  "Marital dissolution / family law",
  "Employment & ADA litigation",
  "Social Security (VE testimony)",
  "FELA / LHWCA / Jones Act",
];

const DEPOSITION_CHECKLIST = [
  "Rule 26 report finalized, signed, and disclosed on time — opinions in the report are the ceiling of what you may offer at deposition.",
  "Testimony list (last 4 years) and fee schedule current and produced.",
  "Every opinion traceable to a record, a dataset, or a named methodology — no 'experience tells me' as the sole basis.",
  "Methodology matches what you have published/testified before — inconsistency is the first cross-examination attack.",
  "File organized: records reviewed log, labor-market survey notes, instrument protocols, and raw scores available for inspection.",
  "Prepared to define DOT, O*NET, OEWS, ORS, and your capacity model in plain language for the finder of fact.",
  "No opinions beyond vocational scope — medical causation and psychiatric diagnosis stay with the physicians.",
];

const REFERENCES: { label: string; href: string }[] = [
  { label: "ABVE — Certification standards", href: "https://www.abve.net/certification-main" },
  { label: "ABVE — Code of Ethics", href: "https://www.abve.net/code-of-ethics" },
  { label: "ORS in vocational expert testimony (IARP)", href: "https://iarp-rehabpro.scholasticahq.com/article/159850-the-occupational-requirements-survey-navigating-its-use-in-vocational-expert-testimony" },
  { label: "FRE 702 — Testimony by expert witnesses", href: "https://www.law.cornell.edu/rules/fre/rule_702" },
  { label: "FRCP Rule 26 — Duty to disclose", href: "https://www.law.cornell.edu/rules/frcp/rule_26" },
  { label: "BLS OEWS wage data", href: "https://www.bls.gov/oes/" },
  { label: "BLS Occupational Requirements Survey", href: "https://www.bls.gov/ors/" },
];

export default function ForensicPracticePage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const forensicTools = useMemo(() => toolsForCounselorRole("forensic"), []);

  const activeForensicOrders = useMemo(() => {
    if (!user) return [];
    const forensicIds = new Set(FORENSIC_SERVICES.map((s) => s.catalogId));
    return loadServiceRequests().filter(
      (r) =>
        forensicIds.has(r.serviceId) &&
        r.status !== "delivered" &&
        r.status !== "declined",
    );
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Forensic Practice · Vocational Expert Work
        </p>
        <h1 className="text-4xl">
          ABVE-conversant vocational opinions that survive scrutiny.
        </h1>
        <p className="text-ink/70 mt-2 max-w-3xl">
          Forensic methodology and ethics for expert work in legal disputes —
          how a Vocational Expert evaluates ability to work, earning capacity,
          and the impact of injury so the opinion holds up under Daubert/Frye
          and meets American Board of Vocational Experts standards.
        </p>
      </header>

      {/* Three pillars */}
      <section
        aria-label="Vocational opinion standards"
        className="grid md:grid-cols-3 gap-3"
      >
        <article className="saas-card grad-tealblue-soft">
          <div className="text-2xl" aria-hidden>📁</div>
          <h2 className="font-semibold mt-1">Objective Evidence</h2>
          <p className="text-sm text-ink/75 mt-1">
            Thorough analysis of medical records, functional limitations,
            education, and work history — every conclusion anchored to a
            document in the file, itemized with source notes.
          </p>
        </article>
        <article className="saas-card grad-tealblue-soft">
          <div className="text-2xl" aria-hidden>📊</div>
          <h2 className="font-semibold mt-1">Labor Market Data</h2>
          <p className="text-sm text-ink/75 mt-1">
            Standardized sources — DOT / O*NET, BLS OEWS and ORS, state LMI,
            and documented employer surveys — to establish that specific jobs
            exist at specific wages in the relevant geography.
          </p>
        </article>
        <article className="saas-card grad-tealblue-soft">
          <div className="text-2xl" aria-hidden>⚖️</div>
          <h2 className="font-semibold mt-1">Daubert / Frye Criteria</h2>
          <p className="text-sm text-ink/75 mt-1">
            Methodologies that are tested, peer-reviewed, reproducible, and
            generally accepted — scientifically valid, reliable, and
            admissible in a court of law.
          </p>
        </article>
      </section>

      {/* Case types */}
      <section aria-label="Case types served">
        <h2 className="text-sm uppercase tracking-wider text-ink/55 font-semibold mb-2">
          Matters these opinions serve
        </h2>
        <ul role="list" className="flex flex-wrap gap-2">
          {CASE_TYPES.map((c) => (
            <li
              key={c}
              className="text-xs bg-white border border-ink/15 rounded-full px-3 py-1.5 font-semibold text-ink/75"
            >
              {c}
            </li>
          ))}
        </ul>
      </section>

      {/* Active forensic orders */}
      {activeForensicOrders.length > 0 && (
        <section className="saas-card border-amber-300 bg-amber-50/40">
          <h2 className="text-lg font-semibold">
            ⏳ Active forensic engagements ({activeForensicOrders.length})
          </h2>
          <ul role="list" className="mt-2 space-y-1">
            {activeForensicOrders.map((r) => (
              <li key={r.id} className="text-sm flex items-baseline justify-between gap-3 flex-wrap">
                <span>
                  <strong>{r.serviceTitle}</strong>
                  <span className="text-ink/60">
                    {" "}· {r.requesterOrgName}
                    {r.matterCaption ? ` · ${r.matterCaption}` : ""}
                  </span>
                </span>
                <Link
                  href={`/dashboard/service-orders/${r.id}`}
                  className="text-xs text-cyan-700 hover:underline"
                >
                  Open order →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Service line with standards */}
      <section aria-label="Forensic service line">
        <h2 className="text-2xl mb-1">Forensic service line</h2>
        <p className="text-sm text-ink/65 mb-4 max-w-3xl">
          Each deliverable lists the standards required by law and in current
          practice. Treat every item as a gate — an opinion missing one is an
          opinion opposing counsel will find.
        </p>
        <div className="space-y-4">
          {FORENSIC_SERVICES.map((svc) => {
            const cat = getService(svc.catalogId);
            const price = cat ? effectivePrice(svc.catalogId, user.email) : 0;
            return (
              <article key={svc.catalogId} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="text-xl font-semibold">{svc.title}</h3>
                  {cat && (
                    <span className="text-sm text-cyan-700 font-semibold">
                      {formatPrice(price, cat.priceUnit)} ·{" "}
                      <span className="text-ink/55 font-normal">
                        {cat.turnaround}
                      </span>
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink/75 mt-1">{svc.useCase}</p>
                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-cyan-700 mb-1.5">
                    Standards required — law &amp; current practice
                  </div>
                  <ul role="list" className="space-y-1.5">
                    {svc.standards.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <span aria-hidden className="text-emerald-600 shrink-0 mt-0.5">✓</span>
                        <span className="text-ink/80">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Embedded forensic instruments */}
      <section aria-label="Forensic assessment instruments">
        <h2 className="text-2xl mb-1">
          Embedded forensic instruments ({forensicTools.length})
        </h2>
        <p className="text-sm text-ink/65 mb-3 max-w-3xl">
          Standardized tools tagged to the forensic archetype. Launch from a
          business or vendor case file — results store case-isolated with an
          AI-drafted interpretation you edit and approve.
        </p>
        <ul role="list" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {forensicTools.map((t) => (
            <li key={t.id} className="saas-card">
              <h3 className="font-semibold text-sm">{t.title}</h3>
              <p className="text-xs text-ink/65 mt-1 line-clamp-2">
                {t.description}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-cyan-700 mt-2">
                {t.items.length} items
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* Deposition readiness */}
      <section className="saas-card border-purple-300 bg-purple-50/30">
        <h2 className="text-lg font-semibold">
          🎯 Deposition &amp; testimony readiness checklist
        </h2>
        <ul role="list" className="mt-2 space-y-1.5">
          {DEPOSITION_CHECKLIST.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span aria-hidden className="text-purple-700 shrink-0 mt-0.5">▢</span>
              <span className="text-ink/80">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* References */}
      <footer className="border-t border-ink/10 pt-4">
        <h2 className="text-sm uppercase tracking-wider text-ink/55 font-semibold mb-2">
          Authorities &amp; references
        </h2>
        <ul role="list" className="flex flex-wrap gap-x-6 gap-y-1.5">
          {REFERENCES.map((r) => (
            <li key={r.href}>
              <a
                href={r.href}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-cyan-700 hover:underline"
              >
                {r.label} ↗
              </a>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink/50 mt-3 italic">
          The American Board of Vocational Experts (ABVE) sets these guidelines
          to preserve the integrity, ethics, and rigor of vocational analysis.
          Verify jurisdiction-specific admissibility standards (Daubert vs.
          Frye) with retaining counsel before finalizing any opinion.
        </p>
      </footer>
    </div>
  );
}
