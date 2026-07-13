import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Pathways Pro",
  description:
    "How Pathways Pro collects, uses, protects, and retains information across counselor, client, employer, vendor, and partner workspaces.",
};

const SECTIONS: { heading: string; body: string }[] = [
  {
    heading: "Information we collect",
    body: "Account details you provide (name, work email, organization, role), case information entered by counselors and clients in the course of vocational rehabilitation services, service-request details submitted by employers and vendors, and standard technical logs needed to operate the service.",
  },
  {
    heading: "How we use information",
    body: "To deliver case-management, assessment, and document-generation features; to route deliverables between the parties you authorize; to meet WIOA Title IV documentation requirements; and to maintain the security and reliability of the platform. We do not sell personal information.",
  },
  {
    heading: "Protected health information",
    body: "Pathways Pro is built on a HIPAA-aligned architecture. Clinical and disability-related information entered into a case file is visible only to the client and the counselor of record. Business, vendor, and employment-partner users receive only the deliverables a counselor explicitly releases — never raw case notes or screener results.",
  },
  {
    heading: "AI processing",
    body: "Drafting features (IPEs, assessments interpretations, service deliverables, letters) send the minimum necessary case context to our AI provider to generate a draft for counselor review. Drafts are never released to another party without counselor approval and signature.",
  },
  {
    heading: "Retention & deletion",
    body: "Case records are retained for the period required by the funding agency and applicable regulations, then purged. You may request export or deletion of your account data by contacting us.",
  },
  {
    heading: "Contact",
    body: "Questions about this policy or a data request: privacy@pathwayspro.app.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-accent">
          Legal
        </p>
        <h1 className="text-4xl tracking-tight">Privacy Policy</h1>
        <p className="text-ink/60 text-sm">
          Effective July 2026 · This is a working policy for the pilot
          program and will be finalized with counsel before general
          availability.
        </p>
      </header>

      {SECTIONS.map((s) => (
        <section key={s.heading}>
          <h2 className="text-xl font-semibold mb-2">{s.heading}</h2>
          <p className="text-ink/80 leading-relaxed text-sm">{s.body}</p>
        </section>
      ))}

      <footer className="border-t border-ink/10 pt-5">
        <Link href="/" className="text-accent underline text-sm">
          ← Back to home
        </Link>
      </footer>
    </div>
  );
}
