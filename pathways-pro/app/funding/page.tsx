"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadSession } from "@/lib/session";
import { Disclaimer } from "@/components/Disclaimer";
import { FUNDING_CATEGORIES } from "@/lib/funding-sources";

export default function FundingPage() {
  return (
    <Suspense fallback={<p className="text-ink/50">Loading…</p>}>
      <FundingInner />
    </Suspense>
  );
}

function FundingInner() {
  const router = useRouter();
  const search = useSearchParams();
  const targetJob = search.get("for");
  const [authorized, setAuthorized] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!loadSession()) {
      router.replace("/");
      return;
    }
    setAuthorized(true);
  }, [router]);

  if (!authorized) return null;

  const filtered = FUNDING_CATEGORIES.map((cat) => {
    const q = query.trim().toLowerCase();
    if (!q) return cat;
    return {
      ...cat,
      sources: cat.sources.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.who.toLowerCase().includes(q) ||
          s.pays.toLowerCase().includes(q),
      ),
    };
  }).filter((cat) => cat.sources.length > 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Funding & Financial Aid
        </p>
        <h1 className="text-4xl mb-2">Ways to pay for training</h1>
        <p className="text-ink/70 prose-narrow">
          Every source on this page is a federal agency, state agency, or
          trusted nonprofit. We don&apos;t link to commercial scholarship
          aggregators — most charge fees or harvest emails.
          {targetJob && (
            <>
              {" "}You came here looking for help paying for{" "}
              <strong className="text-accent">{targetJob}</strong>.
            </>
          )}
        </p>
      </header>

      <Disclaimer kind="general" />

      <div className="border border-accent/30 bg-accent/5 rounded-lg p-5">
        <h2 className="text-lg font-semibold mb-2">
          📋 Start with the FAFSA — even if you&apos;re not sure
        </h2>
        <p className="text-sm text-ink/80 mb-3">
          The Free Application for Federal Student Aid (FAFSA) unlocks Pell
          Grants, federal loans, work-study, and most state aid. It&apos;s
          free. If a website asks for a credit card to apply for the FAFSA,
          you&apos;re on the wrong site.
        </p>
        <a
          href="https://studentaid.gov/h/apply-for-aid/fafsa"
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-accent text-white px-5 py-2.5 rounded font-semibold text-sm"
        >
          Start FAFSA at studentaid.gov ↗
        </a>
      </div>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by source, eligibility, or what it pays for…"
        className="w-full bg-cream border border-ink/15 rounded-lg px-4 py-3 focus:outline-none focus:border-accent"
      />

      <div className="space-y-8">
        {filtered.map((cat) => (
          <section key={cat.category}>
            <div className="mb-3 pb-2 border-b border-ink/10">
              <h2 className="text-2xl">
                {cat.icon} {cat.category}
              </h2>
              <p className="text-sm text-ink/70 mt-1">{cat.blurb}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {cat.sources.map((s) => (
                <a
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-ink/10 rounded-lg p-4 bg-cream hover:border-accent transition flex flex-col gap-2"
                >
                  <div className="font-semibold">{s.name}</div>
                  <div className="text-xs">
                    <span className="text-accent uppercase tracking-wider mr-1">
                      For
                    </span>
                    <span className="text-ink/80">{s.who}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-accent uppercase tracking-wider mr-1">
                      Pays
                    </span>
                    <span className="text-ink/80">{s.pays}</span>
                  </div>
                  {s.notes && (
                    <div className="text-xs italic text-ink/60 border-t border-ink/10 pt-2">
                      💡 {s.notes}
                    </div>
                  )}
                  <div className="text-xs text-ink/40 truncate mt-1">
                    {s.url}
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-ink/50 py-8">
            No funding sources match your search.
          </p>
        )}
      </div>

      <section className="border border-amber-300 bg-amber-50 rounded-lg p-5 text-sm">
        <h2 className="font-semibold text-amber-900 mb-2">
          ⚠️ Things to watch out for
        </h2>
        <ul className="space-y-1 text-amber-900/90 list-disc pl-5">
          <li>
            <strong>No legitimate scholarship requires an application fee.</strong>{" "}
            If a site asks for a credit card to apply or "guarantees" awards,
            it&apos;s a scam.
          </li>
          <li>
            <strong>FAFSA is always free</strong> — at studentaid.gov. Don&apos;t
            pay anyone to file it for you.
          </li>
          <li>
            <strong>Private loans should be last</strong>. Use federal Direct
            Loans first — better terms, income-driven repayment, forgiveness
            options.
          </li>
          <li>
            <strong>If you have a disability</strong>, contact your state VR
            agency before paying out of pocket. They may cover the full cost.
          </li>
        </ul>
      </section>
    </div>
  );
}
