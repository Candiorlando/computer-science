"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  BookOpenCheck,
  FileCheck2,
  Handshake,
  Landmark,
  Scale,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from "lucide-react";

type LucideIcon = ComponentType<{ className?: string }>;

type ValueCard = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  philosophy: string;
  implementation: string;
  accent: string;
  bg: string;
};

const values: ValueCard[] = [
  {
    icon: UserRoundCheck,
    eyebrow: "Value 01",
    title: "The Sanctity of Agency (Person-Centered Autonomy)",
    philosophy:
      "We reject paternalistic structures that diminish the individual. Drawing upon the deepest ethics of person-centered counseling, we honor the client as the ultimate author of their narrative. True rehabilitation requires a space where the individual’s right to chart their psychosocial adjustment is structurally protected and deeply respected.",
    implementation:
      "Product decisions are intended to support client voice, appropriate access, and meaningful participation in planning.",
    accent: "text-amber-700",
    bg: "bg-amber-50",
  },
  {
    icon: Scale,
    eyebrow: "Value 02",
    title: "The Moral Fabric of Inclusion (Uncompromised Equity)",
    philosophy:
      "To segregate individuals or devalue their labor is to fracture our social ecology. Every individual possesses an inherent right to Competitive Integrated Employment (CIE)—to labor alongside their peers, earning equitable wages, and contributing meaningfully to the shared life of the community.",
    implementation:
      "The system is being designed with equity, integration, and responsible accountability in mind.",
    accent: "text-indigo-700",
    bg: "bg-indigo-50",
  },
  {
    icon: Sparkles,
    eyebrow: "Value 03",
    title: "The Restoration of Vocation (Administrative Liberation)",
    philosophy:
      "The calling of a rehabilitation counselor is a profound civic duty, one that belongs in the presence of the client, not lost in the machinery of bureaucracy. We build intelligent automation to dismantle administrative burdens, liberating the professional to return to the transformative, human work of counseling.",
    implementation:
      "Administrative support is being designed to reduce burden while preserving professional judgment and review.",
    accent: "text-rose-700",
    bg: "bg-rose-50",
  },
  {
    icon: Landmark,
    eyebrow: "Value 04",
    title: "Institutional Integrity (Systemic Accountability)",
    philosophy:
      "Genuine reform demands institutions that hold themselves accountable to the common good. By embedding ethical compliance directly into our technological workflows, we ensure that public resources are stewarded transparently, transforming data into a faithful record of human flourishing rather than a mechanism of control.",
    implementation:
      "Information practices are being developed to support responsible stewardship and transparent organizational review.",
    accent: "text-slate-700",
    bg: "bg-slate-50",
  },
  {
    icon: Handshake,
    eyebrow: "Value 05",
    title: "The Ecology of Belonging (Civic Co-Responsibility)",
    philosophy:
      "Inclusion is not a charitable concession; it is the realization of our interconnectedness. We cultivate alliances across corporate, educational, and state institutions to foster a natural, accessible talent ecosystem. We are all co-authors of a society where the dignity of work is a shared civic virtue.",
    implementation:
      "Partnership design is intended to foster respectful collaboration among organizations committed to inclusive opportunity.",
    accent: "text-emerald-700",
    bg: "bg-emerald-50",
  },
];

export default function ValuesPage() {
  return (
    <div className="-mx-6 -mt-10 mb-[-2rem] pt-16 bg-[#FAF9F6]">
      <HeroManifesto />
      <ValuesMatrix />
      <SystemsImpactBanner />
    </div>
  );
}

function HeroManifesto() {
  return (
    <section className="relative overflow-hidden border-b border-ink/10">
      <div className="absolute inset-0 bg-gradient-to-br from-[#111827] via-[#1E2A5A] to-[#7C3F2C]" />
      <div className="absolute inset-0 opacity-[0.045]">
        <div className="absolute left-1/4 top-0 h-full w-px bg-white" />
        <div className="absolute left-2/4 top-0 h-full w-px bg-white" />
        <div className="absolute left-3/4 top-0 h-full w-px bg-white" />
        <div className="absolute left-0 top-1/3 h-px w-full bg-white" />
        <div className="absolute left-0 top-2/3 h-px w-full bg-white" />
      </div>
      <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-20 text-center space-y-6">
        <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-amber-200/85 font-bold">
          <ShieldCheck className="w-4 h-4" />
          Our Values
        </p>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.08] text-white">
          The Covenant of Dignity. The Ecology of Reform.
        </h1>
        <div className="mx-auto h-px w-20 bg-amber-300/70" />
        <p className="text-base md:text-lg leading-relaxed text-white/85 max-w-3xl mx-auto">
          Pathways Pro was founded upon a fundamental sociological and ethical
          truth: true rehabilitation is not a solitary endeavor, but a
          restoration of the individual's place within the community. We believe
          that technology must serve as a moral architecture, empowering human
          potential rather than reducing the profound vocation of counseling to
          a mere transaction.
        </p>
      </div>
    </section>
  );
}

function ValuesMatrix() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 md:py-24 space-y-12">
      <header className="max-w-3xl mx-auto text-center space-y-4">
        <p className="text-xs uppercase tracking-[0.24em] text-[#7C3F2C] font-bold">
          Values-in-Action Core Matrix
        </p>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
          Ethical commitments encoded into the architecture.
        </h2>
        <p className="text-ink/60 leading-relaxed">
          Each value is not merely a statement of belief. It is a design
          obligation: a way the platform must protect dignity, reinforce equity,
          and make public systems more accountable to human flourishing.
        </p>
      </header>

      <div className="space-y-5">
        {values.map((value) => (
          <ValuePanel key={value.title} value={value} />
        ))}
      </div>
    </section>
  );
}

function ValuePanel({ value }: { value: ValueCard }) {
  const Icon = value.icon;
  return (
    <article className="group bg-white border border-ink/10 rounded-2xl p-6 md:p-8 transition-all duration-300 hover:border-[#7C3F2C]/30 hover:shadow-xl hover:-translate-y-0.5">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-2xl ${value.bg} grid place-items-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}>
            <Icon className={`w-6 h-6 ${value.accent}`} />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-ink/35 font-bold">
              {value.eyebrow}
            </p>
            <h3 className="text-xl md:text-2xl font-bold text-ink tracking-tight leading-tight">
              {value.title}
            </h3>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[15px] md:text-base text-ink/75 leading-relaxed">
            {value.philosophy}
          </p>
          <div className="border border-ink/10 rounded-xl bg-[#FAF9F6] p-4 md:p-5 space-y-2">
            <p className="text-xs uppercase tracking-[0.18em] text-[#7C3F2C] font-bold">
              Structural Implementation
            </p>
            <p className="text-sm md:text-[15px] text-ink/70 leading-relaxed">
              {value.implementation}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function SystemsImpactBanner() {
  const benchmarks = [
    {
      icon: FileCheck2,
      title: "WIOA Title IV Compliance",
      text: "A commitment to learning from relevant public standards and the needs of rehabilitation communities.",
    },
    {
      icon: Scale,
      title: "Olmstead Mandate",
      text: "A values-led commitment to community inclusion, equitable opportunity, and the dignity of work.",
    },
    {
      icon: BookOpenCheck,
      title: "State Transparency Standards",
      text: "A development posture that values responsible stewardship, transparent practice, and respect for people over paperwork.",
    },
  ];

  return (
    <section className="bg-white border-t border-ink/10">
      <div className="max-w-7xl mx-auto px-6 py-20 md:py-24 space-y-10">
        <div className="max-w-3xl space-y-4">
          <p className="text-xs uppercase tracking-[0.24em] text-[#7C3F2C] font-bold">
            Systems Impact
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
            Reform must be measurable, transparent, and worthy of trust.
          </h2>
          <p className="text-ink/65 leading-relaxed">
            Pathways Pro is built around a strict commitment to federal
            benchmarks and state transparency standards, including WIOA Title IV
            compliance, the Olmstead mandate, and state-level accountability
            obligations that protect public resources and human dignity alike.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {benchmarks.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="border border-ink/10 rounded-2xl p-6 bg-[#FAF9F6] hover:bg-white hover:shadow-md transition-all duration-300">
                <div className="w-11 h-11 rounded-xl bg-[#1E2A5A]/10 grid place-items-center mb-4">
                  <Icon className="w-5 h-5 text-[#1E2A5A]" />
                </div>
                <h3 className="font-bold text-ink mb-2">{item.title}</h3>
                <p className="text-sm text-ink/65 leading-relaxed">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="pt-2">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 bg-[#1E2A5A] text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-[#151d42] transition text-sm"
          >
            Explore Services &amp; Solutions
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
