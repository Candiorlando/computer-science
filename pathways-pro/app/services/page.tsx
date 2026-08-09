"use client";

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
      "A values-led approach to rehabilitation services centered on autonomy, meaningful participation, and community connection.",
    accent: "text-amber-700",
    accentBg: "bg-amber-100",
  },
  {
    icon: Shield,
    number: "02",
    title: "Workers' Compensation & Adjustment",
    focus: "Guiding employers and individuals through the psychosocial complexities of acute injury.",
    description:
      "A general service area focused on supporting adjustment, communication, and responsible return-to-work conversations.",
    accent: "text-sky-700",
    accentBg: "bg-sky-100",
  },
  {
    icon: Scale,
    number: "03",
    title: "Forensic & Expert Testimony",
    focus: "Objective, authoritative insight.",
    description:
      "A professional service area for organizations seeking objective vocational insight in complex situations.",
    accent: "text-slate-700",
    accentBg: "bg-slate-100",
  },
  {
    icon: Heart,
    number: "04",
    title: "Clinical Counseling & Behavioral Health Integration",
    focus: "Restoring purpose requires healing the whole person.",
    description:
      "A whole-person perspective that recognizes wellbeing, resilience, and vocational purpose are interconnected.",
    accent: "text-rose-700",
    accentBg: "bg-rose-100",
  },
  {
    icon: GraduationCap,
    number: "05",
    title: "Youth Transition Services (Pre-ETS)",
    focus: "Dignity begins early.",
    description:
      "A transition-focused service area centered on self-determination, exploration, and meaningful early opportunities.",
    accent: "text-violet-700",
    accentBg: "bg-violet-100",
  },
  {
    icon: Building2,
    number: "06",
    title: "Corporate Consulting & EAP Solutions",
    focus: "True integration requires systemic employer support.",
    description:
      "A consultative area for organizations interested in accessible, inclusive, and people-centered workplace practices.",
    accent: "text-teal-700",
    accentBg: "bg-teal-100",
  },
  {
    icon: Accessibility,
    number: "07",
    title: "Assistive Technology & Environmental Accommodations",
    focus: "Belonging means having the right tools to succeed.",
    description:
      "A service area guided by the principle that environments should adapt to people and support meaningful participation.",
    accent: "text-emerald-700",
    accentBg: "bg-emerald-100",
  },
];

export default function ServicesPage() {
  return (
    <div className="-mx-6 -mt-10 mb-[-2rem]">
      <HeroSection />
      <PillarGrid />
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
            { icon: Lock, label: "Security-conscious development" },
            { icon: Shield, label: "Appropriate access design" },
            { icon: Scale, label: "Standards-informed development" },
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
