import "./globals.css";
import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";

export const metadata: Metadata = {
  title: "Pathways Pro — Vocational Rehabilitation Platform",
  description:
    "Dual-mode platform for VR counselors and clients. WIOA Title IV aligned. Built on O*NET, BLS OOH, and CRCC standards.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-serif">
        <AppHeader />
        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
        <footer className="border-t border-ink/10 mt-16">
          <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-ink/60">
            <p className="mb-2">
              <span className="font-semibold text-ink">🔒 Pathways Pro</span> ·
              HIPAA-compliant · ADA Title I · Section 504 / 501 · WIOA Title IV
              · CRCC Code of Ethics
            </p>
            <p>
              Data sources: BLS OOH 2024–34 · O*NET 28.3 · RSA WIOA FY2026 ·
              Mini-IPIP (Donnellan et al., 2006) · O*NET Interest Profiler
              (public domain).
            </p>
            <p className="mt-2 italic">
              Pathways Pro is an informational and case-management tool. It
              does not replace the professional judgment of a Certified
              Rehabilitation Counselor or licensed clinician.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
