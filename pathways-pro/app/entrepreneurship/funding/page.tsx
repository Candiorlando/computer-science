"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import { LEGAL_DISCLAIMER } from "@/lib/self-advocacy";

export default function FundingResourcesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setMounted(true);
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Self-Employment · Step 3
        </p>
        <h1 className="text-4xl mb-2">
          Funding &amp; <em className="italic text-accent">Resources</em>
        </h1>
        <p className="text-ink/70 prose-narrow">
          Real funding routes and mentor networks for entrepreneurs with
          disabilities. Curated and linked — none of these are pay-to-play.
        </p>
      </header>

      <Group
        title="Public funding (state &amp; federal)"
        eyebrow="Money you don't pay back"
        items={[
          {
            label: "State VR self-employment authorization",
            href: "https://rsa.ed.gov/about/states",
            desc: "Your assigned VR counselor can authorize startup costs, AT, training, and ongoing services under the IPE. Authorization caps and rules vary by state — find your state's RSA-listed agency for specific guidelines.",
            tag: "Up to $5k–$25k typical",
          },
          {
            label: "PASS Plan (Plan to Achieve Self-Support, SSA)",
            href: "https://www.ssa.gov/disabilityresearch/wi/pass.htm",
            desc: "If you receive SSI or SSDI, a PASS plan lets you set aside income or resources for a self-employment goal without losing your monthly benefit. Approved plans typically run 18-48 months.",
            tag: "SSI / SSDI recipients",
          },
          {
            label: "Ticket to Work program",
            href: "https://choosework.ssa.gov/",
            desc: "Free SSA program for SSI/SSDI beneficiaries. Connects you with Employment Networks (ENs) that include self-employment support providers. Lets you try work without immediately losing benefits.",
            tag: "Benefits counseling",
          },
          {
            label: "WIPA — Work Incentives Planning &amp; Assistance",
            href: "https://choosework.ssa.gov/findhelp/",
            desc: "Free, individualized benefits counseling on how self-employment income affects SSI, SSDI, Medicaid, Medicare, SNAP, and Section 8 housing. Find your local WIPA project before you draft the business plan.",
            tag: "Free benefits counseling",
          },
        ]}
      />

      <Group
        title="Disability-specific grants &amp; loans"
        eyebrow="Targeted entrepreneur capital"
        items={[
          {
            label: "ABLE accounts",
            href: "https://www.ablenrc.org/",
            desc: "Tax-advantaged savings accounts for disability-related expenses including business equipment, transportation, and AT. Doesn't count against SSI's $2,000 resource limit up to $100k. Most states have a program.",
            tag: "Tax-advantaged",
          },
          {
            label: "Disability:IN Inclusion Works",
            href: "https://disabilityin.org/",
            desc: "National network connecting entrepreneurs with disabilities to corporate supply chains via the Disability-Owned Business Enterprise (DOBE) certification.",
            tag: "Certification + contracts",
          },
          {
            label: "Kessler Foundation grants",
            href: "https://kesslerfoundation.org/grants",
            desc: "Disability employment grants — including programs supporting people with disabilities entering self-employment, especially in tech and creative fields.",
            tag: "Competitive grants",
          },
          {
            label: "USDA Rural Business-Cooperative Service",
            href: "https://www.rd.usda.gov/programs-services/business-programs",
            desc: "Rural Business Development Grants and microenterprise assistance for rural entrepreneurs. Several programs prioritize underserved populations including people with disabilities.",
            tag: "Rural businesses",
          },
        ]}
      />

      <Group
        title="SBA loan programs"
        eyebrow="Federally guaranteed small-business loans"
        items={[
          {
            label: "SBA Microloan Program",
            href: "https://www.sba.gov/funding-programs/loans/microloans",
            desc: "Loans up to $50,000 (avg ~$13,000) through nonprofit community lenders. More flexible than bank loans on credit and collateral. Often paired with free technical assistance.",
            tag: "Up to $50k",
          },
          {
            label: "SBA 7(a) — Community Advantage",
            href: "https://www.sba.gov/funding-programs/loans/7a-loans",
            desc: "Up to $350,000 for underserved markets. Mission-driven lenders prioritize businesses owned by people with disabilities, veterans, women, and minorities.",
            tag: "Up to $350k",
          },
          {
            label: "Lendistry",
            href: "https://lendistry.com/",
            desc: "Mission-driven CDFI focused on underserved entrepreneurs. Offers SBA loans, lines of credit, and equipment financing with a more flexible underwriting model.",
            tag: "CDFI",
          },
        ]}
      />

      <Group
        title="Mentorship &amp; technical assistance"
        eyebrow="Free coaches and SMEs"
        items={[
          {
            label: "SCORE",
            href: "https://www.score.org/",
            desc: "Network of 10,000+ volunteer business mentors. Free 1:1 mentoring, free workshops, free business plan review. Has chapter coverage in every state.",
            tag: "Free mentors",
          },
          {
            label: "Small Business Development Centers (SBDCs)",
            href: "https://americassbdc.org/",
            desc: "950+ centers nationally, usually hosted by universities. Free 1:1 business consulting plus low-cost training. Many have disability-business specialists on staff.",
            tag: "Free consulting",
          },
          {
            label: "Women's Business Centers",
            href: "https://www.sba.gov/local-assistance/resource-partners/womens-business-centers",
            desc: "Open to all genders despite the name — particularly strong support for first-time founders. SBA-funded so the services are free or very low cost.",
            tag: "First-time founders",
          },
          {
            label: "RespectAbility entrepreneurship programs",
            href: "https://www.respectability.org/",
            desc: "Disability-specific career and entrepreneurship programs. Cohort-based, peer-supported, and led by disabled professionals.",
            tag: "Disability-led",
          },
          {
            label: "Disability Rights Education &amp; Defense Fund (DREDF)",
            href: "https://dredf.org/",
            desc: "Not a business mentor — but if a funder, landlord, or vendor discriminates against your business because you have a disability, DREDF is the legal-defense partner you call.",
            tag: "Legal defense",
          },
        ]}
      />

      <section className="border border-accent/30 bg-accent/5 rounded-lg p-5 space-y-3">
        <h2 className="text-xl">Before you apply for anything</h2>
        <ol className="text-sm text-ink/80 space-y-2 list-decimal pl-5">
          <li>
            <strong>Talk to a WIPA counselor</strong> (link above) to
            understand how self-employment income will affect your benefits.
          </li>
          <li>
            <strong>Get your business plan reviewed by SCORE or an SBDC</strong>{" "}
            before submitting to your VR counselor. Free reviews from
            experienced operators catch a lot of state-VR rejection triggers.
          </li>
          <li>
            <strong>File your business structure</strong> (sole prop is fine
            to start; LLC if you're worried about personal liability) and get
            an EIN from the IRS — free, online, takes 10 minutes.
          </li>
          <li>
            <strong>Open a separate business bank account</strong> before
            you receive any VR-authorized funds.
          </li>
        </ol>
      </section>

      <div className="flex gap-2 flex-wrap">
        <Link
          href="/entrepreneurship/concept-match"
          className="border border-accent text-accent px-4 py-2 rounded font-semibold text-sm hover:bg-accent/5"
        >
          ← Back to concept matcher
        </Link>
        <Link
          href="/entrepreneurship/business-plan"
          className="bg-accent text-cream px-4 py-2 rounded font-semibold text-sm"
        >
          Draft a business plan →
        </Link>
      </div>

      <footer className="text-xs text-ink/55 italic border-t border-ink/10 pt-3">
        {LEGAL_DISCLAIMER}
      </footer>
    </div>
  );
}

function Group({
  title,
  eyebrow,
  items,
}: {
  title: string;
  eyebrow: string;
  items: { label: string; href: string; desc: string; tag: string }[];
}) {
  return (
    <section className="space-y-3">
      <header>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold">
          {eyebrow}
        </p>
        <h2 className="text-2xl">{title}</h2>
      </header>
      <div className="space-y-3">
        {items.map((it) => (
          <a
            key={it.label}
            href={it.href}
            target="_blank"
            rel="noreferrer"
            className="block border border-ink/15 rounded-lg p-4 bg-cream hover:border-accent transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <div className="flex items-baseline justify-between gap-2 flex-wrap mb-1">
              <h3 className="font-semibold">
                {it.label} <span className="text-ink/40">↗</span>
              </h3>
              <span className="text-[10px] uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold">
                {it.tag}
              </span>
            </div>
            <p className="text-sm text-ink/70">{it.desc}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
