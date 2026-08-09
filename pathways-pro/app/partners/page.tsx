"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  Handshake,
  Users,
  GraduationCap,
  ShieldCheck,
  DollarSign,
  Network,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Building2,
  Heart,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   CORPORATE PARTNERSHIPS — PUBLIC MARKETING PAGE
   Four partnership models + value proposition + CTA
   ═══════════════════════════════════════════════════════════════════ */

type LucideIcon = ComponentType<{ className?: string }>;

interface PartnershipModel {
  icon: LucideIcon;
  number: string;
  title: string;
  subtitle: string;
  focus: string;
  description: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
}

const PARTNERSHIP_MODELS: PartnershipModel[] = [
  {
    icon: Sparkles,
    number: "01",
    title: "Social Enterprise & Workforce Development",
    subtitle: "Cultivating Untapped Talent",
    focus:
      "Opportunities for employers to host internships, vocational training, and work experiences.",
    description:
      "Explore a values-led conversation about social impact, meaningful experience, and inclusive opportunity.",
    accent: "text-amber-700",
    accentBg: "bg-amber-50",
    accentBorder: "border-amber-200",
  },
  {
    icon: Handshake,
    number: "02",
    title: "Direct Hire & Competitive Integrated Employment",
    subtitle: "The Direct Hire Initiative",
    focus:
      "Seamlessly transitioning individuals into your permanent workforce.",
    description:
      "Explore pathways toward equitable hiring, workplace belonging, and mutually beneficial employment relationships.",
    accent: "text-sky-700",
    accentBg: "bg-sky-50",
    accentBorder: "border-sky-200",
  },
  {
    icon: GraduationCap,
    number: "03",
    title: "Youth Transition Pipelines",
    subtitle: "Empowering the Next Generation",
    focus:
      "Creating work-based learning experiences for young adults.",
    description:
      "Consider how early career exploration and supportive learning environments can expand opportunity for young adults.",
    accent: "text-violet-700",
    accentBg: "bg-violet-50",
    accentBorder: "border-violet-200",
  },
  {
    icon: ShieldCheck,
    number: "04",
    title: "Corporate Retention & Work Adjustment",
    subtitle: "Sustaining Your Existing Workforce",
    focus:
      "Keeping experienced employees on the job after an injury or acquired disability.",
    description:
      "Discuss people-centered approaches to retention, accessibility, and employee wellbeing as your organization navigates change.",
    accent: "text-teal-700",
    accentBg: "bg-teal-50",
    accentBorder: "border-teal-200",
  },
];

interface ValueProp {
  icon: LucideIcon;
  title: string;
  description: string;
}

const VALUE_PROPS: ValueProp[] = [
  {
    icon: DollarSign,
    title: "Tax & Financial Incentives",
    description:
      "A conversation about available incentives and resources may be part of a partnership discussion, subject to eligibility and independent review.",
  },
  {
    icon: Network,
    title: "Seamless Infrastructure",
    description:
      "A developing coordination environment intended to support clear, appropriate communication among approved participants.",
  },
  {
    icon: TrendingUp,
    title: "Systemic Impact",
    description:
      "Build an authentic, values-aligned approach to accessibility, inclusion, and community participation.",
  },
];

export default function PartnersPage() {
  return (
    <div className="-mx-6 -mt-10 mb-[-2rem]">
      <HeroSection />
      <PartnershipPathways />
      <ValueProposition />
      <PartnershipCta />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   1. HERO — Partner for Purpose
   ═══════════════════════════════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Warm corporate gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f3460] via-[#16213e] to-[#1a1a2e]" />

      {/* Subtle warm overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 via-transparent to-transparent" />

      {/* Architectural accents */}
      <div className="absolute inset-0 opacity-[0.035]">
        <div className="absolute top-0 right-1/4 w-px h-full bg-white" />
        <div className="absolute top-0 right-1/2 w-px h-full bg-white" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-white" />
      </div>

      {/* Floating warmth shapes */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-teal-500/5 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-6 py-24 md:py-32 grid md:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div className="space-y-7">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80 font-semibold">
            Corporate Partnerships
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.08]">
            Partner for Purpose:{" "}
            <span className="text-amber-200">
              Elevating the Workforce Ecosystem
            </span>
          </h1>
          <div className="w-16 h-px bg-amber-400/50" />
          <p className="text-lg text-white/75 leading-relaxed max-w-xl">
            True corporate leadership involves building inclusive,
            structural pipelines. Partnering with the Pathways Pro network
            connects employers directly to untapped talent, social
            enterprise opportunities, and comprehensive workforce
            retention strategies.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-amber-500 text-white font-semibold px-8 py-4 rounded-lg hover:bg-amber-600 transition text-sm shadow-lg shadow-amber-500/20"
          >
            Become a Corporate Partner
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Visual element */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Stacked cards preview */}
            <div className="space-y-4">
              {[
                {
                  icon: Building2,
                  label: "Partnership Conversations",
                  sub: "Built around shared values",
                },
                {
                  icon: Users,
                  label: "Inclusive Opportunity",
                  sub: "People-centered workforce development",
                },
                {
                  icon: Heart,
                  label: "Thoughtful Collaboration",
                  sub: "Accessible partnership design",
                },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="bg-white/10 backdrop-blur border border-white/15 rounded-xl px-5 py-4 flex items-center gap-4"
                  style={{
                    marginLeft: `${i * 16}px`,
                    opacity: 1 - i * 0.1,
                  }}
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-400/20 grid place-items-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.label}
                    </p>
                    <p className="text-xs text-white/55">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   2. PARTNERSHIP PATHWAYS — 4 models
   ═══════════════════════════════════════════════════════════════════ */

function PartnershipPathways() {
  return (
    <section className="bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 space-y-12">
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-accent font-bold">
            Partnership Pathways
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
            Four Models, One Mission
          </h2>
          <p className="text-ink/60 leading-relaxed">
            Whether you are launching a social enterprise initiative,
            building a direct-hire pipeline, or retaining injured
            workers, our network provides the professional
            infrastructure your organization needs.
          </p>
        </header>

        {/* 2x2 grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {PARTNERSHIP_MODELS.map((model) => (
            <PartnershipCard key={model.number} model={model} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnershipCard({ model }: { model: PartnershipModel }) {
  const Icon = model.icon;

  return (
    <article
      className={`group bg-white border ${model.accentBorder} rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
    >
      {/* Top accent bar */}
      <div className={`h-1 ${model.accentBg}`}>
        <div
          className={`h-full w-1/3 bg-gradient-to-r ${
            model.accent === "text-amber-700"
              ? "from-amber-400 to-amber-300"
              : model.accent === "text-sky-700"
                ? "from-sky-400 to-sky-300"
                : model.accent === "text-violet-700"
                  ? "from-violet-400 to-violet-300"
                  : "from-teal-400 to-teal-300"
          }`}
        />
      </div>

      <div className="p-7 md:p-8 space-y-5">
        {/* Header row */}
        <div className="flex items-start gap-4">
          <div
            className={`w-14 h-14 rounded-xl ${model.accentBg} grid place-items-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className={`w-7 h-7 ${model.accent}`} />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold tracking-[0.2em] text-ink/30 uppercase">
              Pathway {model.number}
            </span>
            <h3 className="text-lg font-bold text-ink leading-snug tracking-tight">
              {model.subtitle}
            </h3>
          </div>
        </div>

        {/* Title */}
        <p className={`text-sm font-semibold ${model.accent}`}>
          {model.title}
        </p>

        {/* Focus line */}
        <p className="text-sm text-ink/55 italic border-l-2 border-ink/10 pl-4">
          {model.focus}
        </p>

        {/* Description */}
        <p className="text-sm text-ink/65 leading-relaxed">
          {model.description}
        </p>

        {/* Learn more link */}
        <div className="pt-2">
          <Link
            href="/contact"
            className={`inline-flex items-center gap-1.5 text-sm font-semibold ${model.accent} transition-all group-hover:gap-2.5`}
          >
            Learn more
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   3. VALUE PROPOSITION — 3-column banner
   ═══════════════════════════════════════════════════════════════════ */

function ValueProposition() {
  return (
    <section className="bg-white border-y border-ink/8">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 space-y-10">
        <header className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-accent font-bold">
            The Business Case
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
            Why Partner With Us
          </h2>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {VALUE_PROPS.map((prop) => (
            <ValuePropCard key={prop.title} prop={prop} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ValuePropCard({ prop }: { prop: ValueProp }) {
  const Icon = prop.icon;

  return (
    <div className="text-center md:text-left space-y-4 group">
      <div className="w-14 h-14 rounded-2xl bg-accent/10 grid place-items-center mx-auto md:mx-0 transition-transform duration-300 group-hover:scale-110">
        <Icon className="w-7 h-7 text-accent" />
      </div>
      <h3 className="text-lg font-bold text-ink tracking-tight">
        {prop.title}
      </h3>
      <p className="text-sm text-ink/60 leading-relaxed">
        {prop.description}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   4. CTA FOOTER — Partnership gateway
   ═══════════════════════════════════════════════════════════════════ */

function PartnershipCta() {
  return (
    <section className="relative overflow-hidden">
      {/* Deep warm gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f3460] via-accent to-[#1a1a2e]" />
      <div className="absolute inset-0 bg-gradient-to-t from-amber-900/15 via-transparent to-transparent" />

      {/* Decorative shape */}
      <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-amber-400/5 blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6 py-20 md:py-24 text-center space-y-8">
        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70 font-semibold">
          Join the Network
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-snug">
          Ready to transform your workforce and champion human potential?
        </h2>
        <p className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
          Connect with the Pathways Pro network today. Our team will
          work with you to identify the partnership model that aligns
          with your organization&rsquo;s goals, workforce needs, and
          community impact strategy.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-amber-500 text-white font-bold px-10 py-4 rounded-lg hover:bg-amber-600 transition text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40"
          >
            Request Partnership Details
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 border-2 border-white/30 text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition text-sm"
          >
            Explore Our Services
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
