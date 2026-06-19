"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate, registerClient, type Role } from "@/lib/users";
import { loadSession, saveMode, saveSession } from "@/lib/session";

type Tab = "signin" | "signup";

export default function HomePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = loadSession();
    if (u) {
      router.replace(u.role === "counselor" ? "/dashboard" : "/portal");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="-mx-6 -mt-6 mb-[-2rem]">
      <Hero />
      <TrustBar />
      <HowItWorks />
      <RoiMetrics />
      <Testimonial />
      <FinalCta />
    </div>
  );
}

// ───────────────────────────── Hero ─────────────────────────────────────

function Hero() {
  return (
    <section className="border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
            For state VR agencies & community rehab providers
          </p>
          <h1 className="text-5xl md:text-6xl tracking-tight leading-[1.05]">
            Vocational Rehabilitation,{" "}
            <em className="italic text-accent">unified</em>.
          </h1>
          <p className="text-lg text-ink/85 prose-narrow font-medium">
            Pathways Pro is an AI-powered vocational rehabilitation and
            compliance platform that increases competitive integrated
            employment for disabled individuals by automating ADA / 504 /
            EEO documentation, case strategy, evidence organization, remote
            work safety, and entrepreneurship support.
          </p>
          <p className="text-base text-ink/70 prose-narrow">
            One WIOA-compliant platform replaces the patchwork of
            spreadsheets, PDFs, and third-party portals. Generate
            signature-ready IPEs in minutes, give every client a real
            assessment, and surface live BLS labor-market data without
            leaving the case.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <a
              href="#demo"
              className="bg-accent text-cream font-semibold px-6 py-3 rounded-md hover:bg-accent/90 transition"
            >
              Book a demo →
            </a>
            <a
              href="#start"
              className="border border-accent text-accent font-semibold px-6 py-3 rounded-md hover:bg-accent/5 transition"
            >
              Start a pilot
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
                Live IPE preview
              </span>
              <span className="text-xs text-emerald-700 font-semibold">
                ✓ WIOA § 102(b) compliant
              </span>
            </div>
            <div className="border-l-4 border-accent pl-3 py-1">
              <div className="text-xs text-ink/50">Employment goal</div>
              <div className="font-semibold">Medical Office Administrator</div>
              <div className="text-xs text-ink/60">
                SOC 43-6013.00 · Timeline 12 months
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <MiniStat label="RIASEC fit" value="91%" />
              <MiniStat label="BLS outlook" value="+5.4%" />
              <MiniStat label="Local wage" value="$42k" />
            </div>
            <div className="text-xs text-ink/60 border-t border-ink/10 pt-2">
              Auto-generated from Mini-IPIP + Holland scores · localized to ZIP
              60652 · drafted by Claude Opus 4.8
            </div>
          </div>
          <div className="absolute -bottom-3 -right-3 bg-accent text-cream text-xs px-3 py-1 rounded-full shadow">
            Drafted in 8 minutes
          </div>
        </div>
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ink/10 rounded p-2 bg-cream">
      <div className="text-[10px] uppercase tracking-wider text-ink/50">
        {label}
      </div>
      <div className="text-sm font-semibold text-accent">{value}</div>
    </div>
  );
}

// ────────────────────────── Trust bar ───────────────────────────────────

function TrustBar() {
  const badges = [
    { label: "HIPAA-aligned", sub: "PHI envelope encryption" },
    { label: "WCAG 2.1 AA", sub: "Audited at every release" },
    { label: "WIOA Title IV", sub: "§ 102(b) field coverage" },
    { label: "Section 508", sub: "Federal procurement ready" },
    { label: "RSA-911", sub: "Reporting elements mapped" },
    { label: "O*NET 28.3 · BLS OOH", sub: "Refreshed quarterly" },
  ];
  return (
    <section className="bg-ink/5 border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <p className="text-center text-xs uppercase tracking-widest text-ink/60 mb-5">
          Built for the standards state agencies and CRPs already procure against
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

// ────────────────────────── How it works ────────────────────────────────

function HowItWorks() {
  return (
    <section className="border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-20">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-widest text-accent">
            How Pathways Pro changes your workflow
          </p>
          <h2 className="text-4xl tracking-tight">
            From three apps and a binder to one record per client.
          </h2>
          <p className="text-ink/70">
            Every part of the VR workflow — intake, assessment, IPE drafting,
            services, signatures, reporting — happens against a single case
            file. No re-keying, no copy-paste, no missing audit trail.
          </p>
        </header>

        <FeatureBlock
          eyebrow="01 · Automated compliance"
          title="WIOA-compliant IPEs drafted in minutes, not hours."
          body="The IPE Builder pulls the client's interest profile, transferable skills, screener results, and counselor case notes, then drafts every § 102(b) section — vocational goal with SOC code, functional limitations, timeline, services with provider type and integrated-setting flag, mutual responsibilities, and evaluation criteria. You review, edit, and sign."
          bullets={[
            "Every required WIOA § 102(b) element prefilled",
            "Provider settings flagged for integrated competitive employment",
            "Audit-ready signature block with timestamp + IP",
            "Drafted by Claude Opus 4.8 against your client's real data",
          ]}
          visual={<IpeVisual />}
        />

        <FeatureBlock
          reversed
          eyebrow="02 · Dual interfaces"
          title="One source of truth, two ways in."
          body="Counselors get 36 tools across caseload, IPE, reporting, labor market, and CE tracking. Clients get 22 tools across intake, assessments, resume building, funding, and an AI coach. Every action on either side updates the shared client report — no double entry, no version drift."
          bullets={[
            "Counselors see real-time client progress without asking",
            "Clients see exactly which assessments are assigned to them",
            "Counselor preview mode mirrors the client portal during sessions",
            "Same data, different surfaces — never reconciled by hand",
          ]}
          visual={<DualInterfaceVisual />}
        />

        <FeatureBlock
          eyebrow="03 · Live labor market data"
          title="BLS and O*NET pipelines wired directly into the case."
          body="Pick any client on your caseload to see their Holland-matched occupations with current BLS Occupational Outlook, CareerOneStop wage data localized to ZIP, registered apprenticeship paths, and WIOA-eligible training providers. Every link goes to a live federal source — no stale screenshots."
          bullets={[
            "60+ O*NET-SOC occupations matched by RIASEC fit",
            "BLS OOH 2024–34 projections refreshed quarterly",
            "Wage and openings data scoped to the client's ZIP code",
            "One-click to JAN accommodation lookup per occupation",
          ]}
          visual={<LaborMarketVisual />}
        />
      </div>
    </section>
  );
}

function FeatureBlock({
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
    <div className={`grid md:grid-cols-2 gap-10 items-center ${reversed ? "md:[&>*:first-child]:order-2" : ""}`}>
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

function IpeVisual() {
  return (
    <div className="border border-ink/15 rounded-lg bg-white shadow-sm p-5 space-y-3">
      <div className="text-xs uppercase tracking-wider text-ink/50">
        IPE draft · v3
      </div>
      {[
        { label: "Employment Goal", value: "Medical Office Administrator" },
        { label: "Timeline", value: "12 months · Goal date Jun 2027" },
        { label: "VR Services", value: "5 services · 2 integrated CRPs" },
        { label: "Accommodations", value: "Workplace, training, AT" },
        { label: "Mutual Responsibilities", value: "Agency + Client signed" },
      ].map((row) => (
        <div
          key={row.label}
          className="flex items-baseline justify-between gap-2 text-sm border-b border-ink/10 pb-2 last:border-0"
        >
          <span className="text-ink/60">{row.label}</span>
          <span className="text-ink font-semibold text-right">{row.value}</span>
        </div>
      ))}
      <div className="text-[11px] text-emerald-700 font-semibold pt-1">
        ✓ All WIOA § 102(b) required fields present
      </div>
    </div>
  );
}

function DualInterfaceVisual() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="border border-ink/15 rounded-lg bg-white shadow-sm p-4">
        <div className="text-xs uppercase tracking-wider text-ink/50 mb-2">
          Counselor
        </div>
        <ul className="text-xs space-y-1.5 text-ink/80">
          <li>📋 Caseload (5)</li>
          <li>📝 IPE Builder</li>
          <li>📊 Labor Market</li>
          <li>📁 Reports</li>
          <li>🎓 CE Tracker</li>
        </ul>
      </div>
      <div className="border border-ink/15 rounded-lg bg-cream shadow-sm p-4">
        <div className="text-xs uppercase tracking-wider text-accent mb-2">
          Client
        </div>
        <ul className="text-xs space-y-1.5 text-ink/80">
          <li>🧭 Find My Path</li>
          <li>📝 Interest Profiler</li>
          <li>🎯 My Matches</li>
          <li>📄 Resume</li>
          <li>💬 AI Coach</li>
        </ul>
      </div>
      <div className="col-span-2 text-[11px] text-center text-ink/55 italic">
        Both views update the same client record in real time
      </div>
    </div>
  );
}

function LaborMarketVisual() {
  const rows = [
    { title: "Medical Records Specialist", soc: "29-2072", fit: "91%", wage: "$47k" },
    { title: "Medical Office Administrator", soc: "43-6013", fit: "88%", wage: "$42k" },
    { title: "Patient Services Rep", soc: "43-4051", fit: "84%", wage: "$38k" },
    { title: "Health Information Tech", soc: "29-2072", fit: "82%", wage: "$45k" },
  ];
  return (
    <div className="border border-ink/15 rounded-lg bg-white shadow-sm p-5 space-y-3">
      <div className="flex items-baseline justify-between">
        <div className="text-xs uppercase tracking-wider text-ink/50">
          Labor Market for VR-2026-0041
        </div>
        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">
          BLS + O*NET
        </span>
      </div>
      {rows.map((r) => (
        <div
          key={r.soc}
          className="flex items-center justify-between text-sm border-b border-ink/10 pb-2 last:border-0"
        >
          <div>
            <div className="font-semibold">{r.title}</div>
            <div className="text-[11px] text-ink/55">SOC {r.soc}</div>
          </div>
          <div className="text-right">
            <div className="text-accent font-bold text-sm">{r.fit}</div>
            <div className="text-[11px] text-ink/55">{r.wage} median</div>
          </div>
        </div>
      ))}
      <div className="text-[11px] text-ink/55 italic">
        Localized to ZIP 60652 · OOH 2024–34
      </div>
    </div>
  );
}

// ────────────────────────── ROI metrics ─────────────────────────────────

function RoiMetrics() {
  return (
    <section className="bg-ink/[0.02] border-b border-ink/10">
      <div className="max-w-6xl mx-auto px-6 py-20 space-y-10">
        <header className="text-center max-w-2xl mx-auto space-y-3">
          <p className="text-xs uppercase tracking-widest text-accent">
            Quantifiable impact
          </p>
          <h2 className="text-4xl tracking-tight">
            The math state agencies and CRP directors actually care about.
          </h2>
          <p className="text-ink/70">
            Every metric below is designed in — measured against the
            tools-of-record state VR programs use today (Microsoft Word,
            spreadsheets, agency-specific CMS, and third-party assessment
            vendors).
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric
            value="8 min"
            label="To draft a WIOA-compliant IPE"
            sub="Down from a typical 2–3 hours of counselor time"
          />
          <Metric
            value="44"
            label="Validated assessment items"
            sub="Mini-IPIP Big Five + O*NET Interest Profiler"
          />
          <Metric
            value="60+"
            label="O*NET occupations matched per client"
            sub="By Holland (RIASEC) fit against BLS wage band"
          />
          <Metric
            value="0"
            label="Tabs to switch for labor-market data"
            sub="BLS, CareerOneStop, apprenticeship.gov inline"
          />
          <Metric
            value="36 / 22"
            label="Counselor / client tools in one platform"
            sub="Replaces 5–8 third-party portals on a typical caseload"
          />
          <Metric
            value="7"
            label="WIOA § 102(b) required IPE elements"
            sub="All prefilled and validated before signature"
          />
          <Metric
            value="Real-time"
            label="Client progress visible to counselor"
            sub="No follow-up email needed to know what's done"
          />
          <Metric
            value="$0"
            label="Pilot pricing for state VR programs"
            sub="First 90 days, up to 25 active cases"
          />
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
      <div className="text-4xl text-accent font-bold leading-none mb-2">
        {value}
      </div>
      <div className="text-sm font-semibold text-ink">{label}</div>
      <div className="text-xs text-ink/60 mt-1">{sub}</div>
    </div>
  );
}

// ────────────────────────── Testimonial ─────────────────────────────────

function Testimonial() {
  return (
    <section className="border-b border-ink/10">
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-6">
        <p className="text-xs uppercase tracking-widest text-accent">
          From the field
        </p>
        <blockquote className="text-2xl md:text-3xl tracking-tight leading-snug text-ink/90 italic">
          &ldquo;After eight years on the caseload I was spending more time
          formatting IPE Word docs than I was with my clients. Pathways Pro is
          the tool I wished I had on day one — every WIOA element is already
          there, the labor-market data is live, and my clients can finally see
          what I see.&rdquo;
        </blockquote>
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="w-12 h-12 bg-accent text-cream rounded-full grid place-items-center font-bold">
            CM
          </div>
          <div className="text-left">
            <div className="font-semibold">Candace Metcalf, CRC · LPC</div>
            <div className="text-sm text-ink/60">
              Founder, Pathways Pro · IDHS-DRS, Chicago
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────────────────────────── Final CTA ───────────────────────────────────

function FinalCta() {
  const [tab, setTab] = useState<Tab>("signin");
  return (
    <section id="signin" className="bg-accent/5">
      <div id="demo" className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-start">
        <div id="start" className="space-y-5 pt-2">
          <p className="text-xs uppercase tracking-widest text-accent">
            Get started
          </p>
          <h2 className="text-4xl tracking-tight">
            See your caseload running on Pathways Pro this week.
          </h2>
          <p className="text-ink/75">
            State VR agencies and community rehab providers can book a 30-minute
            walkthrough with the founder, or stand up a 90-day pilot for up to
            25 active cases — no procurement paperwork required.
          </p>
          <ul className="space-y-2 text-sm text-ink/80 pt-1">
            <li className="flex gap-2">
              <span className="text-accent font-bold">✓</span>
              <span>Live demo against your real workflow questions</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold">✓</span>
              <span>HIPAA &amp; § 508 compliance documentation on request</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold">✓</span>
              <span>White-glove import of your existing caseload</span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-3 pt-3">
            <a
              href="mailto:candace@pathwayspro.app?subject=Pathways%20Pro%20demo%20request"
              className="bg-accent text-cream font-semibold px-5 py-3 rounded-md hover:bg-accent/90 transition"
            >
              Book a demo →
            </a>
            <a
              href="mailto:candace@pathwayspro.app?subject=Pathways%20Pro%20pilot"
              className="border border-accent text-accent font-semibold px-5 py-3 rounded-md hover:bg-accent/5 transition"
            >
              Start a 90-day pilot
            </a>
          </div>
        </div>

        <div className="bg-cream border border-ink/15 rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b border-ink/10">
            <TabButton active={tab === "signin"} onClick={() => setTab("signin")}>
              Sign in
            </TabButton>
            <TabButton active={tab === "signup"} onClick={() => setTab("signup")}>
              New client? Sign up
            </TabButton>
          </div>
          {tab === "signin" ? (
            <SignInPanel />
          ) : (
            <SignUpPanel onDone={() => setTab("signin")} />
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
      className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-cream text-accent border-b-2 border-accent"
          : "bg-ink/5 text-ink/60 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

// ── Auth panels (preserved from earlier sign-up implementation) ─────────

function SignInPanel() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("counselor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const u = authenticate(email, password, role);
    if (!u) {
      setError("Invalid credentials. Try the demo account below.");
      return;
    }
    saveSession(u);
    if (u.role === "counselor" || u.role === "client") saveMode(u.role);
    router.push(u.role === "counselor" ? "/dashboard" : "/portal");
  }

  function demoLogin() {
    const demoEmail =
      role === "counselor"
        ? "demo.counselor@pathwayspro.app"
        : "demo.client@pathwayspro.app";
    const u = authenticate(demoEmail, "demo1234", role);
    if (u) {
      saveSession(u);
      if (u.role === "counselor" || u.role === "client") saveMode(u.role);
      router.push(u.role === "counselor" ? "/dashboard" : "/portal");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-7 space-y-5">
      <div className="flex bg-ink/5 rounded-md p-1">
        <button
          type="button"
          onClick={() => setRole("counselor")}
          className={`flex-1 px-3 py-2 text-sm rounded transition ${
            role === "counselor"
              ? "bg-cream shadow-sm text-accent font-semibold"
              : "text-ink/60"
          }`}
        >
          Counselor
        </button>
        <button
          type="button"
          onClick={() => setRole("client")}
          className={`flex-1 px-3 py-2 text-sm rounded transition ${
            role === "client"
              ? "bg-cream shadow-sm text-accent font-semibold"
              : "text-ink/60"
          }`}
        >
          Client
        </button>
      </div>

      {error && (
        <div className="bg-accent/10 border border-accent/30 text-accent text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={
            role === "counselor" ? "counselor@agency.gov" : "you@example.com"
          }
          className="input"
          autoComplete="username"
        />
      </Field>
      <Field label="Password">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input"
          autoComplete="current-password"
        />
      </Field>

      <button
        type="submit"
        className="w-full bg-accent text-cream font-semibold py-2.5 rounded hover:bg-accent/90 transition"
      >
        Sign in as {role === "counselor" ? "Counselor" : "Client"}
      </button>

      <div className="border-t border-ink/10 pt-4 text-xs text-ink/60 space-y-1">
        <div>
          <strong className="text-ink/80">Demo account:</strong>
        </div>
        <div>
          Email:{" "}
          <code className="bg-ink/5 px-1 rounded">
            {role === "counselor"
              ? "demo.counselor@pathwayspro.app"
              : "demo.client@pathwayspro.app"}
          </code>
        </div>
        <div>
          Password: <code className="bg-ink/5 px-1 rounded">demo1234</code>
        </div>
        <button
          type="button"
          onClick={demoLogin}
          className="text-accent hover:underline mt-1"
        >
          → One-click demo login
        </button>
      </div>

      <Styles />
    </form>
  );
}

function SignUpPanel({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = registerClient({
      firstName,
      lastName,
      email,
      password,
      dob,
      goal,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    saveSession(result.user);
    saveMode("client");
    router.push("/portal");
  }

  return (
    <form onSubmit={handleSubmit} className="p-7 space-y-5">
      <div>
        <h3 className="text-xl mb-1">Create your client account</h3>
        <p className="text-xs text-ink/60">
          We&apos;ll assign you a case number and place you on the next
          available counselor&apos;s caseload.
        </p>
      </div>

      {error && (
        <div className="bg-accent/10 border border-accent/30 text-accent text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirst(e.target.value)}
            placeholder="Jordan"
            className="input"
            autoComplete="given-name"
          />
        </Field>
        <Field label="Last name">
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLast(e.target.value)}
            placeholder="Hayes"
            className="input"
            autoComplete="family-name"
          />
        </Field>
      </div>

      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input"
          autoComplete="email"
        />
      </Field>

      <Field label="Password (6+ characters)">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input"
          autoComplete="new-password"
        />
      </Field>

      <Field label="Date of birth">
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="input"
          autoComplete="bday"
        />
      </Field>

      <Field label="What are you hoping to do? (optional)">
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Find a job in office administration"
          className="input"
        />
      </Field>

      <button
        type="submit"
        className="w-full bg-accent text-cream font-semibold py-2.5 rounded hover:bg-accent/90 transition"
      >
        Create account & assign case number →
      </button>

      <p className="text-xs text-ink/60 text-center">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onDone}
          className="text-accent underline"
        >
          Sign in
        </button>
      </p>

      <Styles />
    </form>
  );
}

function Field({
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
