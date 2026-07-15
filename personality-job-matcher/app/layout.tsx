import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Career Compass — Personality-Based Job Matching",
  description:
    "Take validated personality assessments, get career matches, find openings near you, and chat with an AI career coach.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-serif">
        <header className="border-b border-ink/10">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl tracking-tight">
              Career Compass
            </Link>
            <nav className="text-sm space-x-5">
              <Link href="/intake" className="hover:text-accent">Start</Link>
              <Link href="/assessment" className="hover:text-accent">Assessment</Link>
              <Link href="/results" className="hover:text-accent">Matches</Link>
              <Link href="/coach" className="hover:text-accent">Coach</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
        <footer className="border-t border-ink/10 mt-16">
          <div className="max-w-5xl mx-auto px-6 py-6 text-xs text-ink/60 prose-narrow">
            <p>
              <strong>Important:</strong> Career Compass is an educational and informational tool.
              It is <strong>not</strong> a substitute for advice from a licensed vocational
              rehabilitation counselor, career counselor, mental-health professional, attorney,
              physician, or accommodations specialist. Information about disability, ADA
              accommodations, benefits eligibility, and state vocational rehabilitation programs
              varies by jurisdiction and individual circumstance — please verify anything
              consequential with a qualified professional before acting on it.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
