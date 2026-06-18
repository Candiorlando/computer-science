"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import {
  loadProblemAnalysisReports,
  loadEEOCCharges,
  loadOCRComplaints,
  LEGAL_DISCLAIMER,
} from "@/lib/self-advocacy";
import { loadAccommodationLetters } from "@/lib/accommodation-letters";

export default function SelfAdvocacyHub() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [counts, setCounts] = useState({ acc: 0, par: 0, eeoc: 0, ocr: 0 });

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setMounted(true);
    setCounts({
      acc: loadAccommodationLetters().length,
      par: loadProblemAnalysisReports().length,
      eeoc: loadEEOCCharges().length,
      ocr: loadOCRComplaints().length,
    });
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Self Advocacy · Legal-Tech Tools
        </p>
        <h1 className="text-4xl mb-2">
          Your <em className="italic text-accent">rights</em>, drafted.
        </h1>
        <p className="text-ink/70 prose-narrow">
          Four AI-assisted tools to help you document discrimination,
          request accommodations, and prepare formal civil-rights
          filings. Everything is drafted in your browser, ready to
          edit, save, print, or hand to an attorney.
        </p>
      </header>

      <section className="border border-amber-300 bg-amber-50 rounded-lg p-4 text-sm">
        <strong className="text-amber-900 block mb-1">
          ⚖️ Important: this is preparation, not legal representation
        </strong>
        <p className="text-amber-900/85">{LEGAL_DISCLAIMER}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">Pick a tool</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <ToolCard
            href="/accommodation-letter"
            icon="🛠️"
            title="ADA Accommodation Request"
            tag="Step 1 for most workers"
            desc="Draft a formal Reasonable Accommodation request letter to your employer's HR. Pre-empts the &ldquo;undue hardship&rdquo; defense with JAN-backed cost data and ADA Title I interactive-process language."
            count={counts.acc}
          />
          <ToolCard
            href="/self-advocacy/incident-report"
            icon="📋"
            title="Discrimination Documentation"
            tag="Build your timeline"
            desc="Log every incident as it happens. We&apos;ll compile a professional Problem Analysis Report with executive summary, chronological log, statute cross-reference, and next steps — ready for an attorney or the EEOC."
            count={counts.par}
          />
          <ToolCard
            href="/self-advocacy/eeoc"
            icon="🏛️"
            title="EEOC Charge of Discrimination"
            tag="180 / 300-day window"
            desc="Draft the &ldquo;Particulars&rdquo; section of the EEOC charge — first-person, factual, neutral. Cites the right statute for your basis (disability, retaliation, sex, age, etc.) and walks through prima facie elements."
            count={counts.eeoc}
          />
          <ToolCard
            href="/self-advocacy/ocr-doj"
            icon="📨"
            title="OCR / DOJ Civil Rights Complaint"
            tag="Public bodies & federally funded"
            desc="Formal complaint to the Department of Education OCR, HHS OCR, or DOJ Disability Rights Section. For schools, healthcare, state/local government, and public accommodations — covers Section 504 and ADA Titles II/III."
            count={counts.ocr}
          />
        </div>
      </section>

      <section className="border border-ink/15 rounded-lg p-5 bg-cream space-y-3">
        <h2 className="text-xl">How these tools fit together</h2>
        <ol className="text-sm text-ink/80 space-y-2 list-decimal pl-5">
          <li>
            <strong>Start with the Accommodation Request.</strong> Most
            workplace barriers resolve through the ADA interactive process
            without anyone going to court.
          </li>
          <li>
            <strong>Document everything in the Incident Log</strong> from
            day one — even if you don&apos;t plan to file anywhere. The
            Problem Analysis Report it generates is the single most useful
            artifact for any future attorney or investigator.
          </li>
          <li>
            <strong>If the employer retaliates, denies, or fires you</strong>,
            use the documentation to draft the EEOC Charge. You have 180
            days (300 in deferral-state jurisdictions) from the most recent
            incident.
          </li>
          <li>
            <strong>For public schools, hospitals, government programs,
            or public accommodations</strong>, use the OCR/DOJ Complaint
            tool instead of the EEOC — these agencies handle non-employment
            discrimination.
          </li>
          <li>
            <strong>Always run the final document past a licensed
            attorney</strong> — your state&apos;s Protection &amp; Advocacy
            agency provides free legal screening for disability cases.
            Your VR counselor can refer you.
          </li>
        </ol>
      </section>
    </div>
  );
}

function ToolCard({
  href,
  icon,
  title,
  tag,
  desc,
  count,
}: {
  href: string;
  icon: string;
  title: string;
  tag: string;
  desc: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="block border border-ink/15 bg-cream rounded-lg p-5 hover:border-accent hover:shadow-sm transition group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <div className="text-3xl">{icon}</div>
        {count > 0 && (
          <span className="text-xs uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold">
            {count} saved
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2 flex-wrap mb-2">
        <h3 className="text-lg font-semibold group-hover:text-accent">
          {title}
        </h3>
        <span className="text-[10px] uppercase tracking-wider text-ink/50">
          {tag}
        </span>
      </div>
      <p className="text-sm text-ink/70">{desc}</p>
    </Link>
  );
}
