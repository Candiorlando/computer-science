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
  TrendingUp,
  Award,
  Briefcase,
  ShieldCheck,
  BarChart3,
  Handshake,
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
            Personalized support, holistic wellness, and actionable
            opportunity — for individuals rebuilding their lives, agencies
            scaling their mission, and partners driving inclusive
            employment.
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
              94% Client Satisfaction
            </div>
            <div className="absolute bottom-4 left-4 bg-fresh/30 backdrop-blur rounded-lg px-3 py-2 text-xs text-white font-semibold">
              2,400+ Lives Transformed
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
  const metrics = [
    {
      label: "Successful Transition Rate",
      value: 87,
      color: "#4CAF50",
      suffix: "%",
      description: "Clients transitioning to competitive integrated employment",
    },
    {
      label: "Placement Success",
      value: 92,
      color: "#0F4C5C",
      suffix: "%",
      description: "Job placement rate within 90 days of plan completion",
    },
    {
      label: "Long-term Retention",
      value: 78,
      color: "#9CB4A6",
      suffix: "%",
      description: "Clients retained at 12+ months post-placement",
    },
  ];

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20 space-y-10">
        <header className="text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-fresh font-bold">
            Results That Matter
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">
            Data-Driven Outcomes
          </h2>
          <p className="text-ink/60 max-w-2xl mx-auto">
            Our platform tracks every milestone in the rehabilitation
            journey, delivering transparent performance metrics that
            stakeholders can trust.
          </p>
        </header>

        <div className="grid sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {metrics.map((m) => (
            <MetricDial key={m.label} {...m} />
          ))}
        </div>

        {/* Secondary stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          {[
            { stat: "2,400+", label: "Lives Impacted" },
            { stat: "150+", label: "Agency Partners" },
            { stat: "98%", label: "Compliance Rate" },
            { stat: "4.9/5", label: "Client Satisfaction" },
          ].map((s) => (
            <div
              key={s.label}
              className="text-center py-4 px-3 bg-cream rounded-xl border border-ink/5"
            >
              <div className="text-2xl font-bold text-accent">{s.stat}</div>
              <div className="text-xs text-ink/55 font-medium mt-1">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** SVG circular progress dial */
function MetricDial({
  label,
  value,
  color,
  suffix,
  description,
}: {
  label: string;
  value: number;
  color: string;
  suffix: string;
  description: string;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center space-y-4">
      <div className="relative w-36 h-36">
        <svg className="metric-ring w-full h-full" viewBox="0 0 128 128">
          {/* Track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke="#E8ECEF"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={color}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-ink">
            {value}
            <span className="text-lg">{suffix}</span>
          </span>
        </div>
      </div>
      <div>
        <h3 className="font-bold text-sm text-ink">{label}</h3>
        <p className="text-xs text-ink/55 mt-1 max-w-[200px]">
          {description}
        </p>
      </div>
    </div>
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
      subtitle: "Counseling, Empowerment & Personal Wellness",
      points: [
        "Personalized rehabilitation plans tailored to your strengths",
        "One-on-one adjustment counseling for injury and disability",
        "Career assessments mapped to real labor market opportunities",
        "Self-advocacy tools and skills-based empowerment resources",
        "Secure portal for tracking progress, appointments, and goals",
      ],
      cta: "Start Your Journey",
      ctaHref: "/login",
    },
    {
      icon: Building2,
      accent: "bg-accent/10 text-accent",
      iconBg: "bg-accent/15",
      title: "For Governments & Agencies",
      subtitle: "State Compliance, Scalable Solutions & Reporting",
      points: [
        "WIOA Title IV and RSA-911 compliant documentation",
        "Automated IPE drafting with full regulatory field coverage",
        "Real-time caseload analytics and performance dashboards",
        "HIPAA-aligned data handling with audit-ready trails",
        "Scalable multi-counselor deployment across regions",
      ],
      cta: "Schedule a Demo",
      ctaHref: "/request-demo",
    },
    {
      icon: Briefcase,
      accent: "bg-sage/30 text-accent",
      iconBg: "bg-sage/30",
      title: "For Business Clients & Partners",
      subtitle: "Employment Partnerships, ROI & Streamlined Integration",
      points: [
        "ADA compliance consulting and job task analysis tools",
        "Workers' compensation adjustment and return-to-work programs",
        "Streamlined vendor referrals and service order management",
        "Inclusive hiring pipelines connected to qualified candidates",
        "Forensic vocational evaluations and expert testimony services",
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
          Join agencies, counselors, and businesses already using Pathways
          Pro to drive competitive integrated employment and measurable
          results.
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
