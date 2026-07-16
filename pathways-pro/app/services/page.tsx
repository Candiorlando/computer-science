"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Shield,
  Scale,
  Heart,
  GraduationCap,
  Building2,
  Accessibility,
  ChevronRight,
  Lock,
  Brain,
  DollarSign,
  Clock,
  FolderSearch,
  BarChart3,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import type { ComponentType } from "react";

/* ═══════════════════════════════════════════════════════════════════
   PATHWAYS SERVICES — PUBLIC MARKETING PAGE
   Seven Pillars of Practice in a warm, architectural layout.
   ═══════════════════════════════════════════════════════════════════ */

type LucideIcon = ComponentType<{ className?: string }>;

interface Pillar {
  icon: LucideIcon;
  number: string;
  title: string;
  focus: string;
  description: string;
  /** Warm accent color for the icon badge */
  accent: string;
  accentBg: string;
}

const PILLARS: Pillar[] = [
  {
    icon: Briefcase,
    number: "01",
    title: "Vocational Empowerment & CIE",
    focus: "Navigating the journey to Competitive Integrated Employment.",
    description:
      "Aligned with Olmstead principles, we emphasize autonomy, community integration, and strengths-based placement rather than just checking a \"hired\" box. Every career plan is anchored in the individual's inherent capabilities and the labor market realities of their community.",
    accent: "text-amber-700",
    accentBg: "bg-amber-100",
  },
  {
    icon: Shield,
    number: "02",
    title: "Workers' Compensation & Adjustment",
    focus: "Guiding employers and individuals through the psychosocial complexities of acute injury.",
    description:
      "Emphasizing restorative adjustment counseling and transparent, ethical compliance frameworks for all parties involved. We bridge the gap between clinical recovery and vocational re-engagement, ensuring the human dimension is never lost in the administrative process.",
    accent: "text-sky-700",
    accentBg: "bg-sky-100",
  },
  {
    icon: Scale,
    number: "03",
    title: "Forensic & Expert Testimony",
    focus: "Objective, authoritative insight.",
    description:
      "Providing definitive forensic evaluations and expert witness testimony to uphold systemic integrity and the standard of care in complex cases. Our forensic practice is rooted in methodological rigor, ethical neutrality, and a deep respect for the gravity of the proceedings we inform.",
    accent: "text-slate-700",
    accentBg: "bg-slate-100",
  },
  {
    icon: Heart,
    number: "04",
    title: "Clinical Counseling & Behavioral Health Integration",
    focus: "Restoring purpose requires healing the whole person.",
    description:
      "Bridging the gap between vocational objectives and psychological well-being, providing the clinical architecture needed to support emotional resilience. Trauma-informed, strengths-based, and always oriented toward the restoration of agency and self-determination.",
    accent: "text-rose-700",
    accentBg: "bg-rose-100",
  },
  {
    icon: GraduationCap,
    number: "05",
    title: "Youth Transition Services (Pre-ETS)",
    focus: "Dignity begins early.",
    description:
      "Providing the framework to guide young adults through critical transition periods, shifting focus from special education to lifelong self-determination and autonomy. We prepare the next generation not merely for employment, but for purposeful participation in civic and economic life.",
    accent: "text-violet-700",
    accentBg: "bg-violet-100",
  },
  {
    icon: Building2,
    number: "06",
    title: "Corporate Consulting & EAP Solutions",
    focus: "True integration requires systemic employer support.",
    description:
      "Empowering businesses through comprehensive workplace assessments, structural consulting, and independent Employee Assistance Programs (EAP) that transform standard compliance into a culture of holistic well-being. We position employers as active partners in the rehabilitation continuum.",
    accent: "text-teal-700",
    accentBg: "bg-teal-100",
  },
  {
    icon: Accessibility,
    number: "07",
    title: "Assistive Technology & Environmental Accommodations",
    focus: "Belonging means having the right tools to succeed.",
    description:
      "Seamless coordination of assistive technology, ensuring environments adapt to the individual, rather than forcing the individual to conform to the environment. From ergonomic assessment to adaptive software, we architect the conditions for genuine inclusion.",
    accent: "text-emerald-700",
    accentBg: "bg-emerald-100",
  },
];

export default function ServicesPage() {
  return (
    <div className="-mx-6 -mt-10 mb-[-2rem]">
      <HeroSection />
      <PillarGrid />
      <WioaComplianceSuite />
      <PlatformTieIn />
    </div>
  );
}

/* ─────────────────────────── Hero ────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]" />
      {/* Architectural line accents */}
      <div className="absolute inset-0 opacity-[0.04]">
        <div className="absolute top-0 left-1/4 w-px h-full bg-white" />
        <div className="absolute top-0 left-1/2 w-px h-full bg-white" />
        <div className="absolute top-0 left-3/4 w-px h-full bg-white" />
        <div className="absolute top-1/3 left-0 w-full h-px bg-white" />
        <div className="absolute top-2/3 left-0 w-full h-px bg-white" />
      </div>

      <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32 text-center space-y-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80 font-semibold">
          The Rehabilitation Continuum
        </p>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.08]">
          The Pathways Continuum
        </h1>
        <div className="w-16 h-px bg-amber-400/60 mx-auto" />
        <p className="text-lg md:text-xl text-white/75 leading-relaxed max-w-3xl mx-auto">
          Rehabilitation is not a disjointed timeline of isolated
          interventions. It is a unified ecosystem where every clinical
          decision, every employer partnership, and every act of
          self-advocacy converges toward a single destination: purpose.
        </p>
      </div>
    </section>
  );
}

/* ─────────────────── Pillar Grid (7 cards) ──────────────────────── */

function PillarGrid() {
  // Layout: first row 3 cards, second row 3 cards, third row 1 card centered
  const firstRow = PILLARS.slice(0, 3);
  const secondRow = PILLARS.slice(3, 6);
  const lastCard = PILLARS[6];

  return (
    <section className="bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 space-y-12">
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-accent font-bold">
            Seven Pillars of Practice
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
            A Unified Ecosystem of Care
          </h2>
          <p className="text-ink/60 leading-relaxed">
            Each pillar represents a dimension of the rehabilitation
            continuum — distinct in focus, unified in purpose. Together
            they form the architecture of genuine, systemic restoration.
          </p>
        </header>

        {/* Row 1: 3 cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {firstRow.map((p) => (
            <PillarCard key={p.number} pillar={p} />
          ))}
        </div>

        {/* Row 2: 3 cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {secondRow.map((p) => (
            <PillarCard key={p.number} pillar={p} />
          ))}
        </div>

        {/* Row 3: 1 card centered, wider */}
        <div className="max-w-2xl mx-auto">
          <PillarCard pillar={lastCard} wide />
        </div>
      </div>
    </section>
  );
}

function PillarCard({
  pillar,
  wide = false,
}: {
  pillar: Pillar;
  wide?: boolean;
}) {
  const Icon = pillar.icon;

  return (
    <article
      className={`bg-white border border-ink/8 rounded-2xl p-7 space-y-5 transition-all duration-200 hover:shadow-lg hover:border-ink/15 hover:-translate-y-0.5 ${
        wide ? "md:flex md:gap-8 md:items-start md:text-left" : ""
      }`}
    >
      {/* Icon + number */}
      <div
        className={`flex items-center gap-4 ${wide ? "md:flex-col md:items-start md:gap-3 md:flex-shrink-0" : ""}`}
      >
        <div
          className={`w-12 h-12 rounded-xl ${pillar.accentBg} grid place-items-center flex-shrink-0`}
        >
          <Icon className={`w-6 h-6 ${pillar.accent}`} />
        </div>
        <span className="text-[11px] font-bold tracking-[0.2em] text-ink/30 uppercase">
          Pillar {pillar.number}
        </span>
      </div>

      <div className={wide ? "space-y-4" : "space-y-3"}>
        <h3 className="text-lg font-bold text-ink leading-snug tracking-tight">
          {pillar.title}
        </h3>

        <p className={`text-sm font-medium italic ${pillar.accent}`}>
          {pillar.focus}
        </p>

        <p className="text-sm text-ink/65 leading-relaxed">
          {pillar.description}
        </p>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   WIOA & STATE GRANT COMPLIANCE SUITE
   ═══════════════════════════════════════════════════════════════════ */

interface ComplianceSolution {
  icon: LucideIcon;
  id: string;
  headline: string;
  title: string;
  capability: string;
  accent: string;
  accentBg: string;
}

const COMPLIANCE_SOLUTIONS: ComplianceSolution[] = [
  {
    icon: Brain,
    id: "note-parser",
    headline: "Clinical Narrative to Compliance Mapping",
    title: 'AI "Note-to-Metric" Progress Note Parser',
    capability:
      "Our integrated AI natural language processing engine scans regular clinical case notes written by counselors, automatically extracting and mapping required activities to official Illinois workNet and WIOA service categories — matching a resume review note directly to Pre-ETS Workplace Readiness, a job-site visit to Work-Based Learning, or a benefits discussion to Counseling on Post-Secondary opportunities.",
    accent: "text-violet-700",
    accentBg: "bg-violet-50",
  },
  {
    icon: DollarSign,
    id: "billing-generator",
    headline: "One-Click IDHS-DRS Roster Compilations",
    title: "Automated Milestone & Phase Billing Generator",
    capability:
      "Eliminates manual Excel tracking. The system dynamically tracks participant retention timelines (15, 45, 90-day targets) against the calendar, auto-generating perfectly formatted, audit-ready IDHS-DRS Monthly Group Billing Sheets the moment a milestone is achieved. Counselors review and submit — never reconstruct.",
    accent: "text-emerald-700",
    accentBg: "bg-emerald-50",
  },
  {
    icon: Clock,
    id: "preets-tracker",
    headline: "Federal Mandate Allocation Safeguards",
    title: "Pre-ETS Core Activity Time-Tracker",
    capability:
      "A specialized tracking matrix for youth transition programs. It ensures every minute of service is explicitly logged under one of the five mandated Pre-ETS categories (Job Exploration, Counseling on Post-Secondary, Workplace Readiness, Work-Based Learning, Self-Advocacy), giving agencies ironclad proof of fund utilization during federal reviews.",
    accent: "text-sky-700",
    accentBg: "bg-sky-50",
  },
  {
    icon: FolderSearch,
    id: "gata-centralizer",
    headline: "Risk Mitigation & Structural Compliance",
    title: "GATA Audit-Ready Document Centralizer",
    capability:
      "A role-based, secure file repository built explicitly to survive strict Illinois Grant Accountability and Transparency Act (GATA) reviews. It links eligibility verifications, employer paystubs, and Individual Plans for Employment (IPEs) directly to case profiles with randomized sampling views for external auditors — structured so every document is exactly where an auditor expects it.",
    accent: "text-amber-700",
    accentBg: "bg-amber-50",
  },
  {
    icon: BarChart3,
    id: "wioa-analytics",
    headline: "Real-Time Predictive Performance Metrics",
    title: "WIOA Performance Indicator Analytics",
    capability:
      "Tracks the crucial federal indicators of performance (Median Earnings, 2nd & 4th Quarter Employment/Education Retention, and Measurable Skill Gains) long after a participant exits, ensuring the agency maintains the optimal scoring required to secure consecutive state funding rounds. Predictive trend lines flag at-risk metrics before they impact your next grant cycle.",
    accent: "text-rose-700",
    accentBg: "bg-rose-50",
  },
];

function WioaComplianceSuite() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <section className="bg-white border-y border-ink/8">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 space-y-12">
        {/* Section header */}
        <header className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs uppercase tracking-[0.2em] font-bold px-4 py-1.5 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Compliance
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
            WIOA &amp; State Grant Compliance Suite
          </h2>
          <p className="text-ink/60 leading-relaxed">
            Five integrated, AI-powered solutions that transform manual
            compliance workflows into automated, audit-ready systems —
            protecting your state funding and freeing counselors to focus
            on what matters.
          </p>
        </header>

        {/* Solution grid: 3 top, 2 bottom centered */}
        <div className="space-y-5">
          <div className="grid md:grid-cols-3 gap-5">
            {COMPLIANCE_SOLUTIONS.slice(0, 3).map((sol) => (
              <ComplianceCard
                key={sol.id}
                solution={sol}
                isExpanded={expandedId === sol.id}
                onToggle={() => toggle(sol.id)}
              />
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {COMPLIANCE_SOLUTIONS.slice(3).map((sol) => (
              <ComplianceCard
                key={sol.id}
                solution={sol}
                isExpanded={expandedId === sol.id}
                onToggle={() => toggle(sol.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ComplianceCard({
  solution,
  isExpanded,
  onToggle,
}: {
  solution: ComplianceSolution;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const Icon = solution.icon;

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full text-left bg-white border rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
        isExpanded
          ? "border-ink/20 shadow-md ring-1 ring-ink/5"
          : "border-ink/8 hover:border-ink/15"
      }`}
    >
      {/* Header — always visible */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`w-11 h-11 rounded-xl ${solution.accentBg} grid place-items-center flex-shrink-0`}
          >
            <Icon className={`w-5 h-5 ${solution.accent}`} />
          </div>
          <ChevronDown
            className={`w-5 h-5 text-ink/30 flex-shrink-0 mt-1 transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>

        <div className="space-y-1.5">
          <h3 className="font-bold text-[15px] text-ink leading-snug tracking-tight">
            {solution.title}
          </h3>
          <p className={`text-xs font-semibold ${solution.accent}`}>
            {solution.headline}
          </p>
        </div>
      </div>

      {/* Expandable capability body */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 pb-6 pt-0">
          <div className="border-t border-ink/8 pt-4">
            <p className="text-sm text-ink/65 leading-relaxed">
              {solution.capability}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}

/* ────────────────── Platform Tie-In & CTA ───────────────────────── */

function PlatformTieIn() {
  return (
    <section className="bg-white border-t border-ink/8">
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-24 space-y-10">
        {/* Architectural quote block */}
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-accent via-sage to-transparent rounded-full hidden md:block" />
          <div className="md:pl-8 space-y-6 text-center md:text-left">
            <p className="text-xs uppercase tracking-[0.25em] text-accent font-bold">
              The Architecture Behind It
            </p>
            <p className="text-xl md:text-2xl text-ink/85 leading-relaxed font-medium max-w-4xl">
              A secure, role-based architecture designed for the
              complexities of modern case management. Whether you are a
              counselor documenting a success story or an employment
              partner reviewing a placement, the right information is
              always exactly where it needs to be.
            </p>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-2">
          {[
            { icon: Lock, label: "HIPAA-Aligned Security" },
            { icon: Shield, label: "Role-Based Access Control" },
            { icon: Scale, label: "WIOA & Section 508 Compliant" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-sm text-ink/55 font-medium"
            >
              <item.icon className="w-4 h-4 text-accent" />
              {item.label}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-8 py-4 rounded-lg hover:bg-accent-light transition text-sm shadow-lg shadow-accent/15"
          >
            Request Platform Access
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 border border-ink/20 text-ink font-semibold px-8 py-4 rounded-lg hover:border-ink/40 transition text-sm"
          >
            Contact Our Team
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
