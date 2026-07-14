"use client";

import Link from "next/link";
import { useState } from "react";

// Global two-zone footer, rendered by AppShell on every page.
//
//  Zone 1 — Main footer: brand, platform links, contact, and subscribe
//           panel on the ivory ground.
//  Zone 2 — Legal & compliance sub-footer: a separated, smaller, muted
//           bar at the absolute bottom with disclaimer, copyright, legal
//           links, and trust text.

const EXPLORE = [
  { href: "/mission", label: "Our Mission" },
  { href: "/features", label: "Platform Features" },
  { href: "/accessibility", label: "Accessibility Commitment" },
];

const CONNECT = [
  { href: "/contact", label: "Let’s Connect" },
  { href: "/demo", label: "Request a Demo" },
];

export function SiteFooter() {
  const [showPricing, setShowPricing] = useState(false);

  return (
    <footer className="mt-16">
      {/* Zone 1 — main footer */}
      <div className="border-t border-ink/10">
        <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3 max-w-xs">
            <p className="text-xl tracking-tight">Pathways Pro</p>
            <p className="text-sm text-ink/65 leading-relaxed">
              A person-centered rehabilitation ecosystem driving empowerment
              and competitive integrated employment.
            </p>
          </div>

          <nav aria-label="Explore the platform" className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-accent">
              Explore the Platform
            </p>
            <ul className="space-y-2">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink/70 hover:text-accent transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Connect and collaborate" className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-accent">
              Connect &amp; Collaborate
            </p>
            <ul className="space-y-2">
              {CONNECT.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-ink/70 hover:text-accent transition"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="text-sm text-ink/70">
                Email us at:{" "}
                <a
                  href="mailto:collaborate@pathwayspro.app"
                  className="text-accent hover:underline"
                >
                  collaborate@pathwayspro.app
                </a>
              </li>
              <li className="text-sm text-ink/70">
                Need help?{" "}
                <a
                  href="mailto:guidance@pathwayspro.app"
                  className="text-accent hover:underline"
                >
                  guidance@pathwayspro.app
                </a>
              </li>
            </ul>
          </nav>

          {/* Subscribe column */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-widest text-accent">
              Subscribe
            </p>
            <p className="text-sm text-ink/65 leading-relaxed">
              Join the ecosystem. Choose the plan that fits your practice.
            </p>
            <button
              type="button"
              onClick={() => setShowPricing((v) => !v)}
              className="bg-accent text-cream font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-accent/90 transition"
            >
              {showPricing ? "Hide plans" : "View plans & pricing"}
            </button>
          </div>
        </div>

        {/* Expandable pricing panel */}
        {showPricing && (
          <div className="border-t border-ink/10">
            <div className="max-w-6xl mx-auto px-6 py-10">
              <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Solo tier */}
                <div className="border border-ink/15 bg-cream rounded-lg p-6 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-accent font-semibold">
                      Solo Practitioner
                    </p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-bold text-ink">$250</span>
                      <span className="text-ink/60 text-sm">/month</span>
                    </div>
                  </div>
                  <p className="text-sm text-ink/70 leading-relaxed">
                    A single-user workspace for independent rehabilitation
                    counselors and solo practitioners. Full platform access
                    with every tool in the ecosystem.
                  </p>
                  <ul className="space-y-2 text-sm text-ink/75">
                    <li className="flex gap-2">
                      <span className="text-accent font-bold flex-none">&#10003;</span>
                      <span>Single counselor seat</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent font-bold flex-none">&#10003;</span>
                      <span>Unlimited client cases</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent font-bold flex-none">&#10003;</span>
                      <span>AI-powered IPE drafting</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent font-bold flex-none">&#10003;</span>
                      <span>Live BLS &amp; O*NET data</span>
                    </li>
                  </ul>
                  <a
                    href="/dashboard/payments"
                    className="block text-center bg-accent text-cream font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-accent/90 transition"
                  >
                    Get started
                  </a>
                </div>

                {/* Agency tier */}
                <div className="border-2 border-accent bg-cream rounded-lg p-6 space-y-4 relative">
                  <div className="absolute -top-3 right-4 bg-accent text-cream text-[11px] font-semibold px-3 py-0.5 rounded-full">
                    Best for teams
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-accent font-semibold">
                      Agency
                    </p>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-bold text-ink">$125</span>
                      <span className="text-ink/60 text-sm">/user/month</span>
                    </div>
                    <p className="text-xs text-ink/55 mt-1">
                      10-seat minimum &middot; $1,250/month starting
                    </p>
                  </div>
                  <p className="text-sm text-ink/70 leading-relaxed">
                    A multi-user workspace for agencies and CRPs. Seats
                    scale automatically — when an admin invites a new
                    counselor, the invoice prorates and adjusts.
                  </p>
                  <ul className="space-y-2 text-sm text-ink/75">
                    <li className="flex gap-2">
                      <span className="text-accent font-bold flex-none">&#10003;</span>
                      <span>10+ counselor seats (per-seat billing)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent font-bold flex-none">&#10003;</span>
                      <span>Admin dashboard for seat &amp; billing management</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent font-bold flex-none">&#10003;</span>
                      <span>Everything in Solo, plus shared caseloads</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-accent font-bold flex-none">&#10003;</span>
                      <span>Automatic proration when seats change</span>
                    </li>
                  </ul>
                  <a
                    href="/dashboard/payments"
                    className="block text-center bg-accent text-cream font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-accent/90 transition"
                  >
                    Get started
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone 2 — legal & compliance sub-footer */}
      <div className="border-t border-ink/10 bg-ink/[0.03]">
        <div className="max-w-6xl mx-auto px-6 py-5 space-y-2 text-xs text-ink/55">
          <p className="italic">
            Pathways Pro is an informational and case-management ecosystem. It
            does not constitute formal legal counsel or clinical diagnosis.
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>© 2026 Candace Metcalf. All rights reserved.</span>
            <span aria-hidden="true">·</span>
            <Link href="/privacy" className="hover:text-accent underline">
              Privacy Policy
            </Link>
            <span aria-hidden="true">·</span>
            <Link href="/terms" className="hover:text-accent underline">
              Terms of Service
            </Link>
          </div>
          <p>
            HIPAA Compliant · ADA Title I &amp; WIOA Aligned · CRCC Ethical
            Standards
          </p>
        </div>
      </div>
    </footer>
  );
}
