"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import {
  loadConceptMatches,
  loadBusinessPlans,
} from "@/lib/entrepreneurship";
import { LEGAL_DISCLAIMER } from "@/lib/self-advocacy";

export default function EntrepreneurshipHub() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [counts, setCounts] = useState({ matches: 0, plans: 0 });

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setMounted(true);
    setCounts({
      matches: loadConceptMatches().length,
      plans: loadBusinessPlans().length,
    });
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          VR Self-Employment · Business Coach
        </p>
        <h1 className="text-4xl mb-2">
          Own your <em className="italic text-accent">work</em>.
        </h1>
        <p className="text-ink/70 prose-narrow">
          The VR program can fund self-employment as a competitive
          employment outcome. Three AI-assisted tools to help you find
          the right business concept, draft a VR-fundable plan, and
          locate real funding and mentorship.
        </p>
      </header>

      <section className="border border-amber-300 bg-amber-50 rounded-lg p-4 text-sm">
        <strong className="text-amber-900 block mb-1">
          ⚖️ Important: this is preparation, not approval
        </strong>
        <p className="text-amber-900/85">{LEGAL_DISCLAIMER}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl">Pick a tool</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <ToolCard
            href="/entrepreneurship/concept-match"
            icon="💡"
            title="Business Concept Matchmaker"
            tag="Start here"
            desc="We pull your assessment, transferable skills, intake goals, and any disability/accommodation context, then pitch 3 distinct business concepts tailored to your specific strengths and constraints — each one VR-fundable, each one with an AT budget."
            count={counts.matches}
          />
          <ToolCard
            href="/entrepreneurship/business-plan"
            icon="📊"
            title="Business Plan Generator"
            tag="Once you've picked one"
            desc="Full VR-fundable plan: executive summary, target market, operations workflow with accommodations built in, financial projections, dedicated assistive-tech budget line items, risks &amp; funding pathways."
            count={counts.plans}
          />
          <ToolCard
            href="/entrepreneurship/funding"
            icon="💰"
            title="Funding &amp; Resources"
            tag="Money &amp; mentors"
            desc="State VR self-employment guidelines, Social Security PASS plans, federal grants for disability entrepreneurship, SCORE chapters, SBDCs, and disability-specific business networks — curated and linked."
          />
        </div>
      </section>

      <section className="border border-ink/15 rounded-lg p-5 bg-cream space-y-3">
        <h2 className="text-xl">How VR self-employment actually works</h2>
        <ol className="text-sm text-ink/80 space-y-2 list-decimal pl-5">
          <li>
            <strong>Talk to your counselor.</strong> Self-employment must
            be added to your IPE as the vocational goal. Your counselor
            writes the goal; you don&apos;t go around them.
          </li>
          <li>
            <strong>Build the business plan.</strong> Most state VR
            programs require a written plan — executive summary, market,
            operations, financials, AT budget. This is what the Business
            Plan Generator gives you in draft form.
          </li>
          <li>
            <strong>VR review &amp; authorization.</strong> The state VR
            agency reviews the plan, sometimes through a SCORE or SBDC
            partner, and decides what they&apos;ll authorize as
            self-employment services (startup costs, AT, training).
          </li>
          <li>
            <strong>PASS plan, if you&apos;re on SSI/SSDI.</strong> A
            Plan to Achieve Self-Support lets you set aside income or
            resources for business setup without losing benefits while
            you&apos;re ramping up.
          </li>
          <li>
            <strong>Self-employment is a long arc.</strong> Most
            successful clients hit positive cash flow between months 9
            and 18. Your VR plan typically supports the runway.
          </li>
        </ol>
      </section>

      <footer className="text-xs text-ink/55 italic">
        Self-employment outcomes count under WIOA Title IV common
        performance indicators (§ 116) when the venture reaches
        sustained, integrated competitive earnings.
      </footer>
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
  count?: number;
}) {
  return (
    <Link
      href={href}
      className="block border border-ink/15 bg-cream rounded-lg p-5 hover:border-accent hover:shadow-sm transition group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <div className="text-3xl">{icon}</div>
        {count != null && count > 0 && (
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
      <p className="text-sm text-ink/70" dangerouslySetInnerHTML={{ __html: desc }} />
    </Link>
  );
}
