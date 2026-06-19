"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  authenticate,
  registerBusinessUser,
  registerVendorUser,
  type BusinessScopeRole,
  type VendorType,
} from "@/lib/users";
import { loadSession, saveSession } from "@/lib/session";
import { seedBusinessPortal } from "@/lib/business-portal-seed";

type Tab = "signin" | "signup-business" | "signup-vendor";

export default function BusinessLandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    seedBusinessPortal();
    const u = loadSession();
    if (u) {
      const dest =
        u.role === "business"
          ? "/business-portal"
          : u.role === "vendor"
            ? "/vendor-portal"
            : u.role === "counselor"
              ? "/dashboard/business"
              : "/portal";
      router.replace(dest);
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="-mx-6 -mt-6 mb-[-2rem]">
      <Hero />
      <TrustBar />
      <ServicePathways />
      <RoiMetrics />
      <Testimonials />
      <FinalCta />
    </div>
  );
}

// ───────────── Hero ─────────────

function Hero() {
  return (
    <section className="border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
            Business · Vendor · Forensic Services Portal
          </p>
          <h1 className="text-5xl md:text-6xl tracking-tight leading-[1.05]">
            Defensible vocational opinions, on the platform that already runs the
            <em className="italic text-accent"> rehab</em>.
          </h1>
          <p className="text-lg text-ink/85 prose-narrow font-medium">
            Pathways Pro is an AI-powered vocational rehabilitation and
            compliance platform that increases competitive integrated
            employment for disabled individuals. It also provides
            business-facing solutions — including inclusive hiring
            assessments, job task analysis, retention risk reporting, and
            ADA / Section 504 / EEO compliance consulting — creating a
            unified ecosystem where clients, counselors, businesses, and
            vendors collaborate to improve employment outcomes and
            accessibility.
          </p>
          <p className="text-base text-ink/70 prose-narrow">
            Workers&apos; comp adjusters, HR directors, defense and
            applicant attorneys, and supported-employment vendors all work
            in one auditable system — with documents routed automatically
            to every party who needs them, and the counselor of record
            kept in the loop by default.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#cta"
              className="bg-accent text-cream font-semibold px-6 py-3 rounded-md hover:bg-accent/90 transition"
            >
              Book a forensic consult →
            </a>
            <a
              href="#vendor"
              className="border border-accent text-accent font-semibold px-6 py-3 rounded-md hover:bg-accent/5 transition"
            >
              Become an authorized vendor
            </a>
            <a
              href="#signin"
              className="text-ink/70 px-6 py-3 hover:text-accent transition"
            >
              Sign in →
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="border border-ink/15 rounded-lg bg-white shadow-sm p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-ink/50">
                Live deliverable preview
              </span>
              <span className="text-xs text-emerald-700 font-semibold">
                ✓ Routed to 3 parties
              </span>
            </div>
            <div className="border-l-4 border-accent pl-3 py-1">
              <div className="text-xs text-ink/50">Wage-Earning Capacity Report</div>
              <div className="font-semibold">Smith v. Acme Logistics</div>
              <div className="text-xs text-ink/60">
                IWCC — Chicago · Retained by Meridian Claims
              </div>
            </div>
            <ul className="text-xs text-ink/70 space-y-1.5 pt-1">
              <li>→ Vendor expert (author) · downloaded</li>
              <li>→ Retaining carrier · acknowledged</li>
              <li>→ Assigned VR counselor · view-only</li>
            </ul>
            <div className="text-xs text-ink/60 border-t border-ink/10 pt-2">
              Methodology appendix · Daubert-defensible · Rule 26 disclosure ready
            </div>
          </div>
          <div className="absolute -bottom-3 -right-3 bg-accent text-cream text-xs px-3 py-1 rounded-full shadow">
            Tri-party routed in 1 click
          </div>
        </div>
      </div>
    </section>
  );
}

// ───────────── Trust bar ─────────────

function TrustBar() {
  const badges = [
    { label: "HIPAA-aligned", sub: "Envelope-encrypted PHI" },
    { label: "Daubert-defensible", sub: "Methodology appendix on every report" },
    { label: "ABVE-conversant", sub: "Vocational opinion standards" },
    { label: "NAACVR member", sub: "Code-compliant forensic practice" },
    { label: "WIOA Title IV", sub: "§ 102(b) alignment" },
    { label: "WCAG 2.1 AA", sub: "Audited at every release" },
  ];
  return (
    <section className="bg-ink/5 border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-center text-xs uppercase tracking-widest text-ink/60 mb-5">
          Built for the standards risk managers, adjusters, and defense bar already
          procure against
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((b) => (
            <div
              key={b.label}
              className="text-center border border-ink/15 bg-cream rounded-md px-3 py-3"
            >
              <div className="text-sm font-semibold text-ink">{b.label}</div>
              <div className="text-[11px] text-ink/55 mt-0.5">{b.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────── Service pathways ─────────────

function ServicePathways() {
  return (
    <section className="border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-20">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-widest text-accent">
            Three service pathways, one auditable system
          </p>
          <h2 className="text-4xl tracking-tight">
            From litigated claim to job-coached retention — same case file, same
            audit trail.
          </h2>
        </header>

        <ServiceBlock
          eyebrow="A · Forensic Vocational Services"
          title="Wage-earning capacity, labor market, and expert testimony — defensible by design."
          body="Every Wage-Earning Capacity Report and Labor Market Assessment ships with a methodology appendix the court can read. The expert testimony log produces a Rule 26 disclosure for the last four years in a single CSV. Retain a Pathways Pro expert directly or invite your own — the workflow is identical."
          bullets={[
            "Wage-earning capacity evaluations (jurisdiction-specific methodology)",
            "Labor market assessments with sourcing notes per finding",
            "Transferable Skills Analysis prepared for litigation",
            "Expert testimony log — Rule 26 disclosure on demand",
            "Daubert-ready methodology appendix on every PDF",
          ]}
          visual={<ForensicVisual />}
        />

        <ServiceBlock
          reversed
          eyebrow="B · Job Description & Ergonomic Analysis"
          title="Upload a JD. Get O*NET-mapped physical demands and JAN accommodations back."
          body="The Job Description Analyzer extracts physical and cognitive demands from raw JD text, cross-references against the O*NET Content Model, and returns ranked accommodation recommendations against the Job Accommodation Network. Use the same workflow for on-site ergonomic observations with measured factor data."
          bullets={[
            "Extracts essential vs. marginal functions",
            "Physical demands mapped to O*NET 4.A.3 elements",
            "JAN accommodation suggestions with cost bands",
            "ADA risk flags on language that exceeds median demand",
            "Companion on-site ergonomic observation log",
          ]}
          visual={<JdVisual />}
        />

        <ServiceBlock
          eyebrow="C · Supported Employment & Job Coaching"
          title="Vendor onboarding, three-way workspaces, 90-day retention tracking."
          body="Community rehab providers onboard with their COI, W-9, state vendor ID, and master service agreement all on file. Each coaching engagement opens a three-way workspace shared with the employer and the VR counselor. Coaching log entries auto-route for counselor sign-off. Authorizations and invoices never leave the system."
          bullets={[
            "Vendor onboarding: credentials, contracts, rate cards",
            "Three-way workspace (vendor + employer + counselor)",
            "Coaching log with intervention taxonomy",
            "30 / 60 / 90-day retention milestones auto-flagged",
            "Service authorizations + invoices linked to the IPE",
          ]}
          visual={<VendorVisual />}
        />
      </div>
    </section>
  );
}

function ServiceBlock({
  eyebrow,
  title,
  body,
  bullets,
  visual,
  reversed,
}: {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  visual: React.ReactNode;
  reversed?: boolean;
}) {
  return (
    <div
      className={`grid md:grid-cols-2 gap-10 items-center ${
        reversed ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">
          {eyebrow}
        </p>
        <h3 className="text-3xl tracking-tight">{title}</h3>
        <p className="text-ink/75">{body}</p>
        <ul className="space-y-2 pt-1">
          {bullets.map((b) => (
            <li key={b} className="flex gap-2 text-sm text-ink/80">
              <span className="text-accent font-bold mt-0.5">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>{visual}</div>
    </div>
  );
}

function ForensicVisual() {
  const rows = [
    { label: "Engagement", value: "Smith v. Acme Logistics" },
    { label: "Kind", value: "Wage-earning capacity" },
    { label: "Retained by", value: "Meridian Claims (carrier)" },
    { label: "Methodology", value: "RFC + LMA · IL schedule" },
    { label: "Routed to", value: "3 parties · 1 click" },
  ];
  return (
    <div className="border border-ink/15 rounded-lg bg-white shadow-sm p-5 space-y-3">
      <div className="text-xs uppercase tracking-wider text-ink/50">
        Forensic engagement file
      </div>
      {rows.map((r) => (
        <div
          key={r.label}
          className="flex items-baseline justify-between gap-2 text-sm border-b border-ink/10 pb-2 last:border-0"
        >
          <span className="text-ink/60">{r.label}</span>
          <span className="text-ink font-semibold text-right">{r.value}</span>
        </div>
      ))}
      <div className="text-[11px] text-emerald-700 font-semibold pt-1">
        ✓ Rule 26 disclosure ready · methodology appendix attached
      </div>
    </div>
  );
}

function JdVisual() {
  const demands = [
    { label: "Lifting", value: "Medium — 25–50 lbs", flag: true },
    { label: "Standing", value: "Frequent — 4–6 hrs", flag: false },
    { label: "Reaching overhead", value: "Occasional", flag: false },
    { label: "Sustained focus", value: "Constant", flag: true },
  ];
  return (
    <div className="border border-ink/15 rounded-lg bg-white shadow-sm p-5 space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="text-xs uppercase tracking-wider text-ink/50">
          JD Analyzer — Welder I
        </div>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
          O*NET + JAN
        </span>
      </div>
      {demands.map((d) => (
        <div
          key={d.label}
          className="flex items-center justify-between text-sm border-b border-ink/10 pb-2 last:border-0"
        >
          <div>
            <div className="font-semibold">{d.label}</div>
          </div>
          <div className="text-right">
            <div className="text-ink/80">{d.value}</div>
            {d.flag && (
              <div className="text-[11px] text-accent">⚠ accommodation suggested</div>
            )}
          </div>
        </div>
      ))}
      <div className="text-[11px] text-ink/55 italic">
        2 ADA risk flags · 4 JAN suggestions queued
      </div>
    </div>
  );
}

function VendorVisual() {
  return (
    <div className="border border-ink/15 rounded-lg bg-white shadow-sm p-5 space-y-3">
      <div className="text-xs uppercase tracking-wider text-ink/50">
        Engagement — Marcus T. @ Acme · Day 53 / 90
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <Mini label="Day 30" value="✓ Met" tone="green" />
        <Mini label="Day 60" value="In 7 days" tone="amber" />
        <Mini label="Day 90" value="In 37 days" tone="muted" />
      </div>
      <div className="text-xs text-ink/70 border-t border-ink/10 pt-2">
        <strong>Recent log:</strong> Task coaching on torch handling · 90 min ·
        signed by vendor, awaiting CRC sign-off
      </div>
      <div className="text-xs text-ink/70">
        <strong>Authorization:</strong> VR-JC-90 · 28 / 60 units used · active
      </div>
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "amber" | "muted";
}) {
  const cls =
    tone === "green"
      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
      : tone === "amber"
        ? "bg-amber-50 border-amber-200 text-amber-800"
        : "bg-ink/5 border-ink/15 text-ink/70";
  return (
    <div className={`border rounded p-2 ${cls}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-70">
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}

// ───────────── ROI metrics ─────────────

function RoiMetrics() {
  return (
    <section className="bg-ink/[0.02] border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-10">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-widest text-accent">
            Quantifiable impact
          </p>
          <h2 className="text-4xl tracking-tight">
            What carriers, defense counsel, and HR teams actually measure.
          </h2>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric value="1 click" label="Tri-party routing" sub="Vendor → carrier → counselor in one upload" />
          <Metric value="Rule 26" label="Disclosure on demand" sub="4-year prior testimony CSV in one click" />
          <Metric value="< 14 days" label="WEC report turnaround" sub="From engagement to signed PDF" />
          <Metric value="0" label="Manual handoffs" sub="Between vendor, employer, and counselor" />
          <Metric value="100%" label="IPE-linked authorizations" sub="No invoice can bypass the active plan" />
          <Metric value="90-day" label="Retention tracking" sub="WIOA § 116 indicators auto-computed" />
          <Metric value="Real-time" label="Activity feed" sub="Every party sees every state change" />
          <Metric value="Daubert-ready" label="Methodology appendix" sub="Defensibility built into the template" />
        </div>
      </div>
    </section>
  );
}

function Metric({
  value,
  label,
  sub,
}: {
  value: string;
  label: string;
  sub: string;
}) {
  return (
    <div className="border border-ink/15 bg-cream rounded-lg p-5">
      <div className="text-3xl text-accent font-bold leading-none mb-2">
        {value}
      </div>
      <div className="text-sm font-semibold text-ink">{label}</div>
      <div className="text-xs text-ink/60 mt-1">{sub}</div>
    </div>
  );
}

// ───────────── Testimonials ─────────────

function Testimonials() {
  const quotes = [
    {
      quote:
        "Three days from retainer to a wage-earning capacity report I could read in front of the WCAB. The methodology appendix is what sold defense counsel.",
      name: "Defense WC partner · IL bar",
    },
    {
      quote:
        "We stopped chasing the counselor for sign-off. Coaching logs now route automatically and our 90-day retention tracking is clean.",
      name: "Vendor clinical lead · CRP, statewide",
    },
    {
      quote:
        "I see the FCE the moment the vendor uploads it. No more PDFs in email, no more wondering which version is current.",
      name: "Risk manager · 250+ FTE employer",
    },
  ];
  return (
    <section className="border-b border-ink/10">
      <div className="max-w-5xl mx-auto px-6 py-20 space-y-10">
        <header className="text-center max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-widest text-accent mb-2">
            From the field
          </p>
          <h2 className="text-3xl tracking-tight">
            Three stakeholders, one platform.
          </h2>
        </header>
        <div className="grid md:grid-cols-3 gap-6">
          {quotes.map((q) => (
            <blockquote
              key={q.name}
              className="border border-ink/15 bg-cream rounded-lg p-6 space-y-3"
            >
              <p className="text-ink/85 italic leading-snug">&ldquo;{q.quote}&rdquo;</p>
              <footer className="text-xs text-ink/60 not-italic">— {q.name}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

// ───────────── Final CTA + sign-in / sign-up ─────────────

function FinalCta() {
  const [tab, setTab] = useState<Tab>("signin");
  return (
    <section id="signin" className="bg-accent/5">
      <div
        id="cta"
        className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-start"
      >
        <div id="vendor" className="space-y-5 pt-2">
          <p className="text-xs uppercase tracking-widest text-accent">
            Get started
          </p>
          <h2 className="text-4xl tracking-tight">
            Pick a path. Sign in or stand up an account in 60 seconds.
          </h2>
          <p className="text-ink/75">
            Two demo accounts ship populated with one warehouse employer, one
            workers&apos; comp carrier, two vendor orgs, three active placements,
            and one issued forensic deliverable — so you can click through every
            workflow without seeding your own data.
          </p>

          <div className="grid grid-cols-1 gap-3 text-sm pt-2">
            <DemoChip
              label="Business client (HR / Risk / Adjuster)"
              email="aisha.hassan@acmelogistics.com"
              password="demo1234"
            />
            <DemoChip
              label="Vendor (Job coach or Forensic expert)"
              email="damon.r@vocconnections.org"
              password="demo1234"
            />
            <DemoChip
              label="Counselor (sees Business View)"
              email="candace.metcalf@idhs.illinois.gov"
              password="CRC2026!"
            />
          </div>
        </div>

        <div className="bg-cream border border-ink/15 rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b border-ink/10">
            <TabButton active={tab === "signin"} onClick={() => setTab("signin")}>
              Sign in
            </TabButton>
            <TabButton
              active={tab === "signup-business"}
              onClick={() => setTab("signup-business")}
            >
              Business sign up
            </TabButton>
            <TabButton
              active={tab === "signup-vendor"}
              onClick={() => setTab("signup-vendor")}
            >
              Vendor sign up
            </TabButton>
          </div>
          {tab === "signin" ? (
            <SignInPanel />
          ) : tab === "signup-business" ? (
            <BusinessSignUpPanel onDone={() => setTab("signin")} />
          ) : (
            <VendorSignUpPanel onDone={() => setTab("signin")} />
          )}
        </div>
      </div>
    </section>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-3 py-3 text-xs font-semibold transition ${
        active
          ? "bg-cream text-accent border-b-2 border-accent"
          : "bg-ink/5 text-ink/60 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function DemoChip({
  label,
  email,
  password,
}: {
  label: string;
  email: string;
  password: string;
}) {
  return (
    <div className="border border-ink/15 bg-cream rounded-md p-3">
      <div className="text-xs uppercase tracking-wider text-ink/50 mb-1">
        {label}
      </div>
      <div className="text-xs">
        Email <code className="bg-ink/5 px-1 rounded">{email}</code>
      </div>
      <div className="text-xs mt-1">
        Password <code className="bg-ink/5 px-1 rounded">{password}</code>
      </div>
    </div>
  );
}

function SignInPanel() {
  const router = useRouter();
  const [role, setRole] = useState<"business" | "vendor" | "counselor">(
    "business",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const u = authenticate(email, password, role);
    if (!u) {
      setError("Invalid credentials. Use one of the demo accounts on the left.");
      return;
    }
    saveSession(u);
    const dest =
      u.role === "business"
        ? "/business-portal"
        : u.role === "vendor"
          ? "/vendor-portal"
          : "/dashboard/business";
    router.push(dest);
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div className="grid grid-cols-3 bg-ink/5 rounded-md p-1 text-xs">
        {(["business", "vendor", "counselor"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`px-2 py-1.5 rounded transition ${
              role === r
                ? "bg-cream shadow-sm text-accent font-semibold"
                : "text-ink/60"
            }`}
          >
            {r === "business"
              ? "Business"
              : r === "vendor"
                ? "Vendor"
                : "Counselor"}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-accent/10 border border-accent/30 text-accent text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      <FieldS label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          autoComplete="username"
        />
      </FieldS>
      <FieldS label="Password">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          autoComplete="current-password"
        />
      </FieldS>

      <button
        type="submit"
        className="w-full bg-accent text-cream font-semibold py-2.5 rounded hover:bg-accent/90 transition"
      >
        Sign in
      </button>

      <Styles />
    </form>
  );
}

function BusinessSignUpPanel({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [orgName, setOrgName] = useState("");
  const [scopeRole, setScopeRole] = useState<BusinessScopeRole>("hr_director");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = registerBusinessUser({
      firstName,
      lastName,
      email,
      password,
      title,
      orgName,
      scopeRole,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    saveSession(result.user);
    router.push("/business-portal");
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="bg-accent/10 border border-accent/30 text-accent text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <FieldS label="First name">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirst(e.target.value)}
            className="input"
            autoComplete="given-name"
          />
        </FieldS>
        <FieldS label="Last name">
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLast(e.target.value)}
            className="input"
            autoComplete="family-name"
          />
        </FieldS>
      </div>
      <FieldS label="Work email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          autoComplete="email"
        />
      </FieldS>
      <FieldS label="Password (6+ chars)">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          autoComplete="new-password"
        />
      </FieldS>
      <FieldS label="Organization name">
        <input
          type="text"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          className="input"
          autoComplete="organization"
        />
      </FieldS>
      <FieldS label="Your title">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
          autoComplete="organization-title"
        />
      </FieldS>
      <FieldS label="Your role">
        <select
          value={scopeRole}
          onChange={(e) => setScopeRole(e.target.value as BusinessScopeRole)}
          className="input"
        >
          <option value="hr_director">HR Director / Manager</option>
          <option value="risk_manager">Risk Manager</option>
          <option value="adjuster">Workers&apos; Comp Adjuster</option>
          <option value="attorney">Attorney</option>
        </select>
      </FieldS>

      <button
        type="submit"
        className="w-full bg-accent text-cream font-semibold py-2.5 rounded hover:bg-accent/90 transition"
      >
        Create business account →
      </button>
      <p className="text-xs text-ink/60 text-center">
        Already a user?{" "}
        <button type="button" onClick={onDone} className="text-accent underline">
          Sign in
        </button>
      </p>
      <Styles />
    </form>
  );
}

function VendorSignUpPanel({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [credentials, setCredentials] = useState("");
  const [vendorOrgName, setVendorOrgName] = useState("");
  const [vendorType, setVendorType] = useState<VendorType>("crp");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = registerVendorUser({
      firstName,
      lastName,
      email,
      password,
      credentials,
      vendorOrgName,
      vendorType,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    saveSession(result.user);
    router.push("/vendor-portal");
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      {error && (
        <div className="bg-accent/10 border border-accent/30 text-accent text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <FieldS label="First name">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirst(e.target.value)}
            className="input"
            autoComplete="given-name"
          />
        </FieldS>
        <FieldS label="Last name">
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLast(e.target.value)}
            className="input"
            autoComplete="family-name"
          />
        </FieldS>
      </div>
      <FieldS label="Work email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          autoComplete="email"
        />
      </FieldS>
      <FieldS label="Password (6+ chars)">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          autoComplete="new-password"
        />
      </FieldS>
      <FieldS label="Vendor organization name">
        <input
          type="text"
          value={vendorOrgName}
          onChange={(e) => setVendorOrgName(e.target.value)}
          className="input"
          autoComplete="organization"
        />
      </FieldS>
      <FieldS label="Vendor type">
        <select
          value={vendorType}
          onChange={(e) => setVendorType(e.target.value as VendorType)}
          className="input"
        >
          <option value="crp">Community Rehabilitation Provider (CRP)</option>
          <option value="forensic">Forensic Vocational Consultant</option>
          <option value="ergonomic">Ergonomic / FCE Specialist</option>
          <option value="legal-consult">Legal-Consult Expert Witness</option>
          <option value="training">Training Provider</option>
        </select>
      </FieldS>
      <FieldS label="Your credentials (e.g. CRC · CVE · CESP)">
        <input
          type="text"
          value={credentials}
          onChange={(e) => setCredentials(e.target.value)}
          className="input"
        />
      </FieldS>

      <button
        type="submit"
        className="w-full bg-accent text-cream font-semibold py-2.5 rounded hover:bg-accent/90 transition"
      >
        Create vendor account →
      </button>
      <p className="text-xs text-ink/60 text-center">
        Already onboarded?{" "}
        <button type="button" onClick={onDone} className="text-accent underline">
          Sign in
        </button>
      </p>
      <Styles />
    </form>
  );
}

function FieldS({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function Styles() {
  return (
    <style jsx>{`
      :global(.input) {
        width: 100%;
        background: white;
        border: 1px solid rgba(31, 29, 26, 0.2);
        border-radius: 6px;
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
      }
      :global(.input:focus) {
        outline: none;
        border-color: #b95c3c;
      }
    `}</style>
  );
}
