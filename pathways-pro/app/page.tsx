"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import { dashboardRoute } from "@/lib/rbac";
import {
  ArrowRight,
  Shield,
  Users,
  Building2,
  Handshake,
  FileCheck,
  BarChart3,
  CheckCircle2,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = loadSession();
    if (u) router.replace(dashboardRoute(u.role));
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="-mx-6 -mt-6 mb-[-2rem]">
      <Hero />
      <TrustBar />
      <StakeholderPillars />
      <PlatformFeatures />
      <FinalCta />
    </div>
  );
}

/* ─────────────────────────── Hero ────────────────────────────────── */

function Hero() {
  return (
    <section className="border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-24 md:py-32 text-center space-y-8">
        <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full font-semibold">
          B2B Rehabilitation Case Management
        </p>
        <h1 className="text-5xl md:text-6xl tracking-tight leading-[1.05] max-w-4xl mx-auto">
          Rehabilitation,{" "}
          <em className="italic text-accent">unified</em>.
        </h1>
        <p className="text-lg text-ink/75 max-w-2xl mx-auto leading-relaxed">
          A closed-ecosystem platform that brings together counselors,
          clients, businesses, and partners into a single case-management
          framework — driving competitive integrated employment and
          measurable outcomes.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-accent text-cream font-semibold px-7 py-3.5 rounded-md hover:bg-accent/90 transition text-sm"
          >
            Log In / Request Access
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="border border-accent text-accent font-semibold px-7 py-3.5 rounded-md hover:bg-accent/5 transition text-sm"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────── Trust bar ──────────────────────────────── */

function TrustBar() {
  const badges = [
    { label: "HIPAA-aligned", icon: Shield },
    { label: "WCAG 2.1 AA", icon: CheckCircle2 },
    { label: "WIOA Title IV", icon: FileCheck },
    { label: "Section 508", icon: Shield },
    { label: "RSA-911 Ready", icon: BarChart3 },
  ];

  return (
    <section className="bg-ink/5 border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-center text-xs uppercase tracking-widest text-ink/60 mb-5">
          Built for the standards state agencies and CRPs already procure against
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-ink/70">
              <b.icon className="w-4 h-4 text-accent" />
              <span className="text-sm font-medium">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────── Stakeholder pillars ──────────────────────────── */

function StakeholderPillars() {
  const pillars = [
    {
      icon: Users,
      title: "For Counselors",
      body: "Full case management with IPE drafting, assessments, compliance reporting, and caseload oversight — all from one sidebar.",
    },
    {
      icon: CheckCircle2,
      title: "For Clients",
      body: "A transparent, dignified portal with appointments, progress tracking, secure messages, and self-advocacy tools.",
    },
    {
      icon: Building2,
      title: "For Business Clients",
      body: "ADA compliance consulting, inclusive hiring assessments, job task analysis, and service orders in one workspace.",
    },
    {
      icon: Handshake,
      title: "For Partners & Vendors",
      body: "Service catalogs, order management, accommodation workflows, and direct messaging woven into each case file.",
    },
  ];

  return (
    <section className="border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <header className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">
            One ecosystem, every stakeholder
          </p>
          <h2 className="text-4xl tracking-tight">
            Purpose-built dashboards for every role in the rehabilitation lifecycle.
          </h2>
        </header>
        <div className="grid sm:grid-cols-2 gap-6">
          {pillars.map((p) => (
            <div
              key={p.title}
              className="border border-ink/15 bg-white rounded-lg p-7 space-y-3 hover:border-gold/50 hover:shadow-sm transition"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/10 grid place-items-center">
                <p.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
              <p className="text-ink/70 text-sm leading-relaxed">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────── Platform features ───────────────────────────── */

function PlatformFeatures() {
  const features = [
    {
      icon: FileCheck,
      title: "Automated IPE Drafting",
      desc: "WIOA-compliant Individualized Plans for Employment generated in minutes from client data.",
    },
    {
      icon: BarChart3,
      title: "Live Labor Market Data",
      desc: "BLS and O*NET pipelines wired directly into each case file, localized to ZIP.",
    },
    {
      icon: Shield,
      title: "Role-Based Access Control",
      desc: "Every user sees only what their role permits. Admin approval gates new accounts.",
    },
    {
      icon: Users,
      title: "Secure Messaging",
      desc: "HIPAA-aligned messaging tied to case files — no external email chains.",
    },
    {
      icon: Building2,
      title: "Service Order Workflows",
      desc: "End-to-end vendor referrals, service authorization, deliverables, and billing.",
    },
    {
      icon: Handshake,
      title: "Multi-Portal Ecosystem",
      desc: "Counselors, clients, businesses, vendors, and employment partners — one source of truth.",
    },
  ];

  return (
    <section className="border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-12">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-widest text-accent font-semibold">
            Platform capabilities
          </p>
          <h2 className="text-4xl tracking-tight">
            Everything your agency needs, nothing it doesn&apos;t.
          </h2>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="space-y-3">
              <div className="w-9 h-9 rounded-md bg-accent/10 grid place-items-center">
                <f.icon className="w-4 h-4 text-accent" />
              </div>
              <h3 className="font-semibold text-sm">{f.title}</h3>
              <p className="text-ink/65 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────── Final CTA ───────────────────────────────── */

function FinalCta() {
  return (
    <section>
      <div className="max-w-6xl mx-auto px-6 py-20 text-center space-y-6">
        <h2 className="text-3xl md:text-4xl tracking-tight">
          Ready to unify your rehabilitation workflow?
        </h2>
        <p className="text-ink/70 max-w-xl mx-auto">
          Request access to explore the platform, or contact our team to
          schedule a personalized demo for your agency.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-accent text-cream font-semibold px-7 py-3.5 rounded-md hover:bg-accent/90 transition text-sm"
          >
            Log In / Request Access
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/request-demo"
            className="border border-ink/20 text-ink font-semibold px-7 py-3.5 rounded-md hover:border-ink/40 transition text-sm"
          >
            Book a Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
