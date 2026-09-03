"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import { dashboardRoute } from "@/lib/rbac";
import {
  ArrowRight,
  Heart,
  Building2,
  Scale,
  Users,
  Briefcase,
  ShieldCheck,
  Target,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = loadSession();
    if (u) router.replace(dashboardRoute(u));
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="-mx-6 -mt-10 mb-[-2rem]">
      <HeroSection />
      <MissionStatement />
      <MetricsDashboard />
      <StakeholderSections />
      <FinalCta />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   1. HERO SECTION
   ═══════════════════════════════════════════════════════════════════ */

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-accent via-accent-light to-accent overflow-hidden">
      {/* Decorative sage circles */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-sage/10" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-fresh/10" />

      <div className="relative max-w-7xl mx-auto px-6 py-20 md:py-28 grid md:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div className="space-y-7">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
            Restoring Dignity &amp; Paving New Pathways
          </h1>
          <p className="text-lg text-white/85 leading-relaxed max-w-xl">
            A rehabilitation case-management system in active development for
            practitioners, agencies, community organizations, and partners
            working toward more coordinated, person-centered services.
          </p>
          <div className="flex flex-wrap gap-4 pt-1">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-fresh text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-fresh-dark transition text-sm shadow-lg shadow-fresh/25"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#mission"
              className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-7 py-3.5 rounded-lg hover:bg-white/10 transition text-sm"
            >
              Learn More
            </Link>
          </div>
        </div>

        {/* Hero image placeholder */}
        <div className="hidden md:flex items-center justify-center">
          <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center overflow-hidden">
            <div className="text-center space-y-3 p-8">
              <div className="w-16 h-16 rounded-full bg-fresh/30 grid place-items-center mx-auto">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <p className="text-white/70 text-sm font-medium">
                Health, Wellness &amp; Human Connection
              </p>
              <p className="text-white/50 text-xs">
                Hero image placeholder — add uplifting imagery here
              </p>
            </div>
            {/* Floating metric badges */}
            <div className="absolute top-4 right-4 bg-white/20 backdrop-blur rounded-lg px-3 py-2 text-xs text-white font-semibold">
              Built for Rehabilitation Services
            </div>
            <div className="absolute bottom-4 left-4 bg-fresh/30 backdrop-blur rounded-lg px-3 py-2 text-xs text-white font-semibold">
              In Active Development
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   2. MISSION STATEMENT
   ═══════════════════════════════════════════════════════════════════ */

function MissionStatement() {
  return (
    <section id="mission" className="bg-sage/15 border-y border-sage/30">
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-20 text-center space-y-6">
        <p className="text-xs uppercase tracking-[0.2em] text-accent font-bold">
          The Rehabilitation Continuum
        </p>
        <blockquote className="text-xl md:text-2xl leading-relaxed text-ink/90 font-medium max-w-4xl mx-auto">
          &ldquo;Rehabilitation is fundamentally incomplete without a sense
          of purpose. Pathways Pro delivers expert Rehabilitation Services
          that span the entire industry continuum — from empowering
          individuals through integrated employment and adjustment
          counseling, to guiding employer compliance in workers&rsquo;
          compensation, to providing definitive forensic testimony — we
          champion the inherent strengths of the individual to ensure true
          belonging and systemic equity.&rdquo;
        </blockquote>
        <div className="flex flex-wrap justify-center gap-6 pt-4">
          {[
            { icon: Heart, label: "Adjustment to Injury" },
            { icon: Scale, label: "Authoritative Insight" },
            { icon: ShieldCheck, label: "Systemic Integrity" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 text-sm text-accent font-semibold"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   3. DATA-DRIVEN METRICS WIDGET
   ═══════════════════════════════════════════════════════════════════ */

function MetricsDashboard() {
  const principles = [
    { icon: ShieldCheck, title: "Human Judgment First", text: "Technology is designed to support informed professional judgment, not replace it." },
    { icon: Users, title: "Built for Coordination", text: "A developing system intended to reduce fragmentation across the rehabilitation ecosystem." },
    { icon: Heart, title: "Dignity by Design", text: "Every product decision begins with client voice, appropriate access, and meaningful participation." },
  ];

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 space-y-10">
        <header className="text-center space-y-3 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.2em] text-fresh font-bold">Built From the Inside of the Work</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">A system shaped by rehabilitation practice.</h2>
          <p className="text-ink/60">Pathways Pro is in active development. The goal is simple: make the administrative side of rehabilitation more coherent so professionals can focus on people, purpose, and progress.</p>
        </header>
        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {principles.map((item) => <div key={item.title} className="border border-ink/10 rounded-2xl p-6 bg-cream/50 space-y-3"><item.icon className="w-6 h-6 text-accent" /><h3 className="font-bold text-ink">{item.title}</h3><p className="text-sm text-ink/65 leading-relaxed">{item.text}</p></div>)}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   4. TARGETED STAKEHOLDER SECTIONS
   ═══════════════════════════════════════════════════════════════════ */

function StakeholderSections() {
  const stakeholders = [
    {
      icon: Users,
      accent: "bg-fresh/10 text-fresh",
      iconBg: "bg-fresh/15",
      title: "For Individuals",
      subtitle: "Dignity, Support & Opportunity",
      points: [
        "A person-centered approach to rehabilitation and meaningful participation.",
        "A developing system intended to keep individuals informed and connected to their goals.",
      ],
      cta: "Start Your Journey",
      ctaHref: "/login",
    },
    {
      icon: Building2,
      accent: "bg-accent/10 text-accent",
      iconBg: "bg-accent/15",
      title: "For Governments & Agencies",
      subtitle: "Secure Coordination, Accountability & Scale",
      points: [
        "A developing coordination system for teams delivering rehabilitation services.",
        "Designed to support accountable information stewardship and appropriate access.",
      ],
      cta: "Schedule a Demo",
      ctaHref: "/request-demo",
    },
    {
      icon: Briefcase,
      accent: "bg-sage/30 text-accent",
      iconBg: "bg-sage/30",
      title: "For Business Clients & Partners",
      subtitle: "Connected Partnerships & Shared Impact",
      points: [
        "A high-level pathway for organizations interested in inclusive workforce collaboration.",
        "Partnership conversations shaped around access, dignity, and shared community impact.",
      ],
      cta: "Partner With Us",
      ctaHref: "/contact",
    },
  ];

  return (
    <section className="bg-cream">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 space-y-10">
        <header className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-bold">
            Built for Every Stakeholder
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
            One Platform, Three Perspectives
          </h2>
          <p className="text-ink/60 max-w-2xl mx-auto">
            Whether you are an individual seeking support, an agency
            managing compliance, or a business building inclusive
            workplaces — Pathways Pro meets you where you are.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {stakeholders.map((s) => (
            <div
              key={s.title}
              className="bg-white border border-ink/10 rounded-2xl p-7 flex flex-col hover:shadow-lg hover:border-accent/30 transition-all duration-200"
            >
              {/* Icon + title */}
              <div className="flex items-start gap-4 mb-5">
                <div
                  className={`w-12 h-12 rounded-xl ${s.iconBg} grid place-items-center flex-shrink-0`}
                >
                  <s.icon className={`w-6 h-6 ${s.accent.split(" ")[1]}`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-ink">{s.title}</h3>
                  <p className="text-xs text-ink/55 font-medium mt-0.5">
                    {s.subtitle}
                  </p>
                </div>
              </div>

              {/* Feature list */}
              <ul className="space-y-3 flex-1 mb-6">
                {s.points.map((point, i) => (
                  <li key={i} className="flex gap-3 text-sm text-ink/75">
                    <Target className="w-4 h-4 text-fresh flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={s.ctaHref}
                className="inline-flex items-center justify-center gap-2 bg-accent text-white font-semibold text-sm px-5 py-3 rounded-lg hover:bg-accent-light transition w-full"
              >
                {s.cta}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   5. FINAL CTA
   ═══════════════════════════════════════════════════════════════════ */

function FinalCta() {
  return (
    <section className="bg-accent">
      <div className="max-w-4xl mx-auto px-6 py-16 md:py-20 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Ready to Transform Rehabilitation Outcomes?
        </h2>
        <p className="text-white/75 max-w-xl mx-auto leading-relaxed">
          We are welcoming conversations with agencies, practices, and organizations interested in the direction of Pathways Pro as development continues.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-fresh text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-fresh-dark transition text-sm shadow-lg shadow-fresh/25"
          >
            Get Started Today
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/request-demo"
            className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-white/10 transition text-sm"
          >
            Book a Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
