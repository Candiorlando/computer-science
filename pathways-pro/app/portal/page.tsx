"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { AnyUser, ClientUser } from "@/lib/users";

export default function PortalHome() {
  const router = useRouter();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = loadSession();
    if (!s) {
      router.replace("/");
      return;
    }
    setUser(s);
  }, [router]);

  if (!mounted || !user) return null;

  const isClient = user.role === "client";
  const c = isClient ? (user as ClientUser) : null;
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          {isClient ? `Case ${c!.caseId} · ${c!.counselorName}` : "Client Portal Preview"}
        </p>
        <h1 className="text-4xl">
          Welcome, <span className="text-accent">{firstName}</span>.
        </h1>
        {isClient && (
          <p className="text-ink/70 mt-2 max-w-2xl">
            Your current goal: <strong>{c!.goal}</strong>. Your next appointment is{" "}
            <strong>{c!.nextAppt}</strong>.
          </p>
        )}
      </header>

      {isClient && (
        <section className="border border-ink/15 rounded-lg p-6 bg-cream">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-xl">Progress on your plan</h2>
            <span className="text-sm text-accent font-semibold">{c!.progress}%</span>
          </div>
          <div className="h-2 bg-ink/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${c!.progress}%` }}
            />
          </div>
          <p className="text-sm text-ink/60 mt-3">
            Stage: <strong>{c!.status}</strong>. Talk to{" "}
            <strong>{c!.counselorName}</strong> about next milestones.
          </p>
        </section>
      )}

      <section>
        <h2 className="text-2xl mb-1">Where do you want to start?</h2>
        <p className="text-sm text-ink/60 mb-6">
          Pick a card below — you can always come back.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <QuickStart
            href="/intake"
            icon="🧭"
            title="Find My Career Path"
            desc="Short intake + personality and interest assessment. Get matched to careers that fit you."
            badge="44-item assessment"
          />
          <QuickStart
            href="/resources/client"
            icon="💼"
            title="Find a Job or Training"
            desc="Search free national job listings, training programs, and American Job Centers near you."
          />
          <QuickStart
            href="/coach"
            icon="💬"
            title="Talk to a Coach"
            desc="Chat with an AI career coach about applications, accommodations, training, and next steps."
            badge="Claude Opus 4.8"
          />
          <QuickStart
            href="/transferable-skills"
            icon="🧰"
            title="Find My Transferable Skills"
            desc="Tell us about your work, volunteering, hobbies, or caregiving — we'll find the skills employers want."
            badge="AI analysis"
          />
          <QuickStart
            href="/resume"
            icon="📄"
            title="Build My Resume"
            desc="Generate a one-page resume tailored to a specific job, ready to print or save as PDF."
            badge="AI-generated"
          />
          <QuickStart
            href="/ipe"
            icon="📋"
            title="My IPE Plan"
            desc="View, review, and digitally sign your Individualized Plan for Employment."
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl mb-4">All your resources</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          <CategoryCard href="/resources/client#cat-Explore-Careers" icon="🧭" title="Explore Careers" count={4} />
          <CategoryCard href="/resources/client#cat-Job-Search-&-Training" icon="💼" title="Job Search & Training" count={4} />
          <CategoryCard href="/resources/client#cat-Disability-&-Workplace-Rights" icon="⚖️" title="Disability Rights" count={4} />
          <CategoryCard href="/resources/client#cat-Benefits-&-Financial" icon="💰" title="Benefits & Financial" count={4} />
          <CategoryCard href="/resources/client#cat-Independent-Living" icon="🏠" title="Independent Living" count={3} />
          <CategoryCard href="/resources/client#cat-Assistive-Technology" icon="🦾" title="Assistive Technology" count={3} />
        </div>
      </section>
    </div>
  );
}

function QuickStart({
  href,
  icon,
  title,
  desc,
  badge,
}: {
  href: string;
  icon: string;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className="block border border-ink/15 rounded-lg p-6 bg-cream hover:border-accent hover:shadow-sm transition group"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <div className="flex items-baseline gap-2 mb-2">
        <h3 className="text-lg font-semibold group-hover:text-accent">{title}</h3>
        {badge && (
          <span className="text-[10px] uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="text-sm text-ink/70">{desc}</p>
    </Link>
  );
}

function CategoryCard({
  href,
  icon,
  title,
  count,
}: {
  href: string;
  icon: string;
  title: string;
  count: number;
}) {
  return (
    <Link
      href={href}
      className="border border-ink/10 rounded-lg p-4 bg-cream hover:border-accent transition flex items-center gap-3"
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="font-semibold text-sm">{title}</div>
        <div className="text-xs text-ink/50">{count} resources</div>
      </div>
    </Link>
  );
}
