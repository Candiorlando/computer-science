import type { Metadata } from "next";
import Link from "next/link";
import { HomeRedirect } from "@/components/HomeRedirect";

export const metadata: Metadata = {
  title: "Pathways Pro — AI-Powered Vocational Rehabilitation Platform",
  description:
    "WIOA-compliant AI casework automation for state agencies, community rehabilitation providers, and corporate partners. Automated IPEs, O*NET-SOC data streams, RSA-911 reporting.",
};

export default function HomePage() {
  return (
    <div
      className="bg-[#0B1120] min-h-screen"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      <HomeRedirect />
      <LandingStyles />
      <TopNav />
      <Hero />
      <DualFunnel />
      <FeatureMatrix />
      <DarkFooter />
    </div>
  );
}

// Plain <style> element (server component) for the handful of effects
// Tailwind utilities can't express directly.
function LandingStyles() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <style>{`
      html { scroll-behavior: smooth; }
      .gradient-text {
        background: linear-gradient(to right, #6366F1, #0D9488);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      @keyframes pulse-dot {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.4; }
      }
      .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
      .glow-card { position: relative; transition: all 0.3s ease; }
      .glow-card:hover { box-shadow: 0 0 40px rgba(99, 102, 241, 0.15); }
      .feature-card { transition: border-color 0.3s ease; }
      .feature-card:hover { border-color: rgba(99, 102, 241, 0.5); }
    `}</style>
    </>
  );
}

// ===== TOP NAV =====
function TopNav() {
  return (
    <header className="relative z-10 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="text-xl font-bold text-white tracking-tight">
            Pathways Pro
          </span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-slate-500">
            VR · WIOA
          </span>
        </Link>
        <nav className="flex items-center gap-2 flex-wrap" aria-label="Primary">
          <Link
            href="/business"
            className="text-sm text-slate-400 hover:text-white px-3 py-2.5 min-h-[44px] inline-flex items-center transition-colors"
          >
            For business
          </Link>
          <Link
            href="/signin"
            className="text-sm text-white border border-white/20 px-4 py-2.5 min-h-[44px] inline-flex items-center rounded-lg hover:bg-white/5 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/request-demo"
            className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-2.5 min-h-[44px] inline-flex items-center rounded-lg hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            Request a Demo
          </Link>
        </nav>
      </div>
    </header>
  );
}

// ===== HERO SECTION =====
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Glow background blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-8 pt-24 pb-16">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 mb-8">
              <div className="w-2 h-2 rounded-full bg-indigo-500 pulse-dot" aria-hidden />
              <span className="text-xs text-indigo-300 font-medium">
                AI-Powered VR Platform
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight">
              Modernize Your
              <span className="block gradient-text">Counseling Workflows</span>
            </h1>
            <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-lg">
              WIOA-compliant AI casework automation. From IPE generation to
              RSA-911 reporting — one platform connecting agencies, providers,
              and employers.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-10">
              <Link
                href="/request-demo"
                className="group inline-flex items-center gap-2 px-8 py-4 min-h-[48px] bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
              >
                Schedule Agency Demo
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/business"
                className="inline-flex items-center px-8 py-4 min-h-[48px] border border-white/20 text-white rounded-xl font-semibold hover:bg-white/5 transition-colors"
              >
                Provider Sign Up
              </Link>
            </div>
          </div>
          <div className="relative">
            <div
              className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-teal-500/20 rounded-2xl blur-xl"
              aria-hidden
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://media.base44.com/images/public/6a48262f023b38b58b1172af/b815a4348_generated_b91fc4dd.png"
              alt="Professionals collaborating around data displays"
              loading="lazy"
              className="relative rounded-2xl border border-white/10 shadow-2xl w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== SPLIT VALUE PROPOSITION =====
function DualFunnel() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-indigo-400">
            Dual Funnels
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white">
            Built for Both Sides of the Equation
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {/* B2G: State Agencies */}
          <article className="glow-card relative bg-gray-900 border border-white/10 rounded-2xl p-8 md:p-10 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-blue-700/20 flex items-center justify-center">
                <ShieldIcon className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wide">
                State Agencies
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://media.base44.com/images/public/6a48262f023b38b58b1172af/c9b875850_generated_10184956.png"
              alt="Professional reviewing data in government boardroom"
              loading="lazy"
              className="w-full rounded-xl mb-6 border border-white/5"
            />
            <h3 className="text-2xl font-bold text-white mb-4">
              Compliance-Grade Infrastructure
            </h3>
            <ul className="space-y-3">
              <FunnelItem tone="blue">
                WIOA § 102 Unified State Plan automation
              </FunnelItem>
              <FunnelItem tone="blue">
                Automated IPEs with O*NET-SOC/BLS data streams
              </FunnelItem>
              <FunnelItem tone="blue">
                RSA-911 pipelines with audit-ready trails
              </FunnelItem>
            </ul>
          </article>

          {/* B2B: Providers */}
          <article className="glow-card relative bg-gray-900 border border-white/10 rounded-2xl p-8 md:p-10 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-teal-600/20 flex items-center justify-center">
                <ActivityIcon className="w-5 h-5 text-teal-300" />
              </div>
              <span className="text-sm font-semibold text-teal-300 uppercase tracking-wide">
                Providers
              </span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://media.base44.com/images/public/6a48262f023b38b58b1172af/a0ddfe266_generated_037197ff.png"
              alt="Vocational counselor reviewing tablet"
              loading="lazy"
              className="w-full rounded-xl mb-6 border border-white/5"
            />
            <h3 className="text-2xl font-bold text-white mb-4">
              Practitioner Workflows
            </h3>
            <ul className="space-y-3">
              <FunnelItem tone="teal">
                Client intake portals with pre-populated data
              </FunnelItem>
              <FunnelItem tone="teal">
                AI-native transferable skills assessments
              </FunnelItem>
              <FunnelItem tone="teal">
                Employer ADA/EEO consulting and job-match tools
              </FunnelItem>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

function FunnelItem({
  tone,
  children,
}: {
  tone: "blue" | "teal";
  children: React.ReactNode;
}) {
  const box = tone === "blue" ? "bg-blue-700/20" : "bg-teal-600/20";
  const dot = tone === "blue" ? "bg-blue-400" : "bg-teal-300";
  return (
    <li className="flex items-start gap-3 text-slate-400">
      <div
        className={`w-5 h-5 rounded ${box} flex items-center justify-center mt-0.5 shrink-0`}
        aria-hidden
      >
        <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      </div>
      {children}
    </li>
  );
}

// ===== FEATURE MATRIX =====
function FeatureMatrix() {
  return (
    <section className="py-24 bg-slate-900">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-indigo-400">
            Core Modules
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold text-white">
            The Flow Catalyst
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="feature-card bg-slate-800 border border-white/10 p-8 rounded-xl">
            <FileTextIcon className="w-6 h-6 text-indigo-300 mb-4" />
            <h3 className="text-lg font-semibold text-white">
              Case Note Synthesis
            </h3>
            <p className="mt-2 text-slate-400 leading-relaxed">
              AI-generated narrative summaries from structured session data.
              Compliance-ready documentation produced in seconds, not hours.
            </p>
          </div>

          <div className="feature-card bg-slate-800 border border-white/10 p-8 rounded-xl">
            <BarChartIcon className="w-6 h-6 text-teal-300 mb-4" />
            <h3 className="text-lg font-semibold text-white">
              Integrated Assessments
            </h3>
            <p className="mt-2 text-slate-400 leading-relaxed">
              Unified transferable skills analysis, vocational profiling, and
              labor market alignment — all in one assessment engine.
            </p>
          </div>

          <div className="feature-card bg-slate-800 border border-white/10 p-8 rounded-xl">
            <ShieldIcon className="w-6 h-6 text-indigo-300 mb-4" />
            <h3 className="text-lg font-semibold text-white">
              Compliance Pipelines
            </h3>
            <p className="mt-2 text-slate-400 leading-relaxed">
              Automated WIOA reporting, RSA-911 validation, and audit-trail
              generation for state and federal oversight requirements.
            </p>
          </div>

          <div className="feature-card bg-slate-800 border border-white/10 p-8 rounded-xl">
            <ActivityIcon className="w-6 h-6 text-teal-300 mb-4" />
            <h3 className="text-lg font-semibold text-white">
              Real-Time Dashboards
            </h3>
            <p className="mt-2 text-slate-400 leading-relaxed">
              Live case tracking, milestone visualization, and outcome
              analytics across the complete rehabilitation lifecycle.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ===== FOOTER =====
function DarkFooter() {
  return (
    <footer className="bg-[#080E1B] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <h4 className="text-lg font-bold text-white mb-4">Pathways Pro</h4>
            <p className="text-sm text-slate-500 leading-relaxed">
              Next-generation AI infrastructure for vocational rehabilitation.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-4">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link href="/request-demo" className="hover:text-white transition-colors inline-flex py-1">
                  For Agencies
                </Link>
              </li>
              <li>
                <Link href="/business" className="hover:text-white transition-colors inline-flex py-1">
                  For Providers
                </Link>
              </li>
              <li>
                <Link href="/counselor-roles" className="hover:text-white transition-colors inline-flex py-1">
                  Top 30 Counselor Roles
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-4">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="https://www.dol.gov/agencies/eta/wioa"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition-colors inline-flex py-1"
                >
                  WIOA Standards ↗
                </a>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors inline-flex py-1">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="hover:text-white transition-colors inline-flex py-1">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-4">
              Trust
            </h4>
            <div className="flex flex-wrap gap-2">
              <TrustChip>HIPAA-aligned</TrustChip>
              <TrustChip>WCAG 2.1 AA</TrustChip>
              <TrustChip>WIOA Title IV</TrustChip>
              <TrustChip>Section 508</TrustChip>
            </div>
          </div>
        </div>
        <div className="border-t border-white/5 mt-12 pt-8 text-center text-xs text-slate-600">
          © 2026 Pathways Pro. All rights reserved. pathwayspro.app
        </div>
      </div>
    </footer>
  );
}

function TrustChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-xs text-slate-400">
      {children}
    </span>
  );
}

// ===== Inline icons (Lucide path data, no CDN script) =====

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function ActivityIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function BarChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
