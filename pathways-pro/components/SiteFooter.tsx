import Link from "next/link";

// Global two-zone footer, rendered by AppShell on every page.
//
//  Zone 1 — Main footer: brand, platform links, and contact, in three
//           columns on the ivory ground.
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
  return (
    <footer className="mt-16">
      {/* Zone 1 — main footer */}
      <div className="border-t border-ink/10">
        <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
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
        </div>
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
