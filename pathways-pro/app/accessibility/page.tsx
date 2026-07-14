import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accessibility Statement | Pathways Pro",
  description:
    "Pathways Pro's conformance target, testing practices, known limitations, and how to report an accessibility barrier.",
};

export default function AccessibilityPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-accent">
          Accessibility
        </p>
        <h1 className="text-4xl tracking-tight">Accessibility Statement</h1>
        <p className="text-ink/60 text-sm">
          Last reviewed July 2026 · Accessibility is core to our mission —
          this platform exists to expand employment access for disabled
          people, and we hold our own product to that standard.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-2">Conformance target</h2>
        <p className="text-ink/80 leading-relaxed text-sm">
          Pathways Pro targets{" "}
          <strong>WCAG 2.1 Level AA</strong> across all counselor, client,
          employer, vendor, and partner surfaces, consistent with Section 508
          procurement requirements. Body-text color contrast is maintained at
          4.5:1 or better, interactive targets at 44×44&nbsp;px minimum, and
          all interactive controls are keyboard-operable.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">What we test</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-ink/80">
          <li>Keyboard-only navigation of every workflow, including modals (focus trap, Escape dismiss) and menus</li>
          <li>Screen-reader semantics — landmarks, headings, labels, live regions on async content</li>
          <li>Color contrast in both content and data-visualization surfaces</li>
          <li>Zoom to 200% and 375&nbsp;px-wide mobile layouts without horizontal scrolling</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Known limitations</h2>
        <p className="text-ink/80 leading-relaxed text-sm">
          Print-to-PDF output relies on the browser&apos;s print dialog,
          whose accessibility varies by browser. Some embedded assessment
          instruments are being iteratively re-audited as they are added.
          Issues found in audits are tracked and fixed in priority order.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Report a barrier</h2>
        <p className="text-ink/80 leading-relaxed text-sm">
          If anything on this platform is hard to use with your assistive
          technology, we want to know:{" "}
          <a
            href="mailto:accessibility@pathwayspro.app"
            className="text-accent underline"
          >
            accessibility@pathwayspro.app
          </a>
          . Include the page, what you expected, and the AT/browser you were
          using. We aim to respond within two business days.
        </p>
      </section>

      <footer className="border-t border-ink/10 pt-5">
        <Link href="/" className="text-accent underline text-sm">
          ← Back to home
        </Link>
      </footer>
    </div>
  );
}
