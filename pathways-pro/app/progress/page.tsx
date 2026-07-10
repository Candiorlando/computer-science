"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { AnyUser, ClientUser } from "@/lib/users";
import { loadCaseNotes } from "@/lib/case-notes";
import { buildProgress, pickEncouragement } from "@/lib/positive-psychology";

export default function ClientProgressPage() {
  const router = useRouter();
  const [user, setUser] = useState<AnyUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "client") return router.replace("/dashboard");
    setUser(s);
  }, [router]);

  const data = useMemo(() => {
    if (!user || user.role !== "client") return null;
    const c = user as ClientUser;
    const indicators = buildProgress(c.caseId);
    const notes = loadCaseNotes().filter((n) => n.clientCaseId === c.caseId);
    const encouragement = pickEncouragement(notes);
    return { c, indicators, notes, encouragement };
  }, [user]);

  if (!user || !data) return null;
  const { c, indicators, encouragement } = data;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          My progress
        </p>
        <h1 className="text-3xl font-semibold">
          You&apos;re working toward: {c.goal}
        </h1>
      </header>

      <section className="saas-card grad-tealblue-soft">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-emerald-700 mb-2">
          Today
        </h2>
        <p className="text-xl text-ink leading-snug">{encouragement.text}</p>
      </section>

      <section className="saas-card">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold">Progress toward your goal</h2>
          <span className="text-3xl font-bold text-grad-tealblue">
            {c.progress}%
          </span>
        </div>
        <div
          className="h-4 bg-ink/10 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={c.progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full grad-tealblue"
            style={{ width: `${c.progress}%` }}
          />
        </div>
        <p className="text-sm text-ink/65 mt-3">
          Stage: <strong>{c.status}</strong>. Your counselor{" "}
          <strong>{c.counselorName}</strong> updates this as you hit milestones.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">What you&apos;ve done</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          <Tile
            icon="🎯"
            label="Goals identified"
            value={indicators.goalsIdentified}
          />
          <Tile
            icon="✓"
            label="Tasks completed"
            value={indicators.tasksCompleted}
          />
          <Tile
            icon="📄"
            label="Documents generated"
            value={indicators.jobApplicationsSubmitted}
          />
          <Tile
            icon="📝"
            label="Assessments completed"
            value={indicators.counselingParticipation}
          />
          <Tile
            icon="⚖️"
            label="Self-advocacy actions"
            value={indicators.selfAdvocacyActions}
          />
          <Tile
            icon="💼"
            label="Employment milestones"
            value={indicators.employmentMilestones}
          />
        </div>
      </section>

      <section className="saas-card">
        <h2 className="text-lg font-semibold mb-3">Keep going</h2>
        <p className="text-sm text-ink/75">
          Want to take another step forward?
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <CTA href="/intake" label="Update intake" />
          <CTA href="/assessment" label="Take an assessment" />
          <CTA href="/resume" label="Build a resume" />
          <CTA href="/self-advocacy" label="Document a problem" />
          <CTA href="/entrepreneurship" label="Explore self-employment" />
          <CTA href="/messages" label="Message your counselor" />
        </div>
      </section>

      <footer className="text-xs text-ink/55 italic">
        Encouragement is anchored to what you&apos;ve actually done — no
        empty praise. The metrics above update automatically as you use the
        platform.
      </footer>
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: number;
}) {
  return (
    <div className="saas-card">
      <div className="text-2xl">{icon}</div>
      <div className="text-3xl font-bold mt-1 text-grad-tealblue">{value}</div>
      <div className="text-xs uppercase tracking-wider text-ink/55 mt-1">
        {label}
      </div>
    </div>
  );
}

function CTA({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="text-xs border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-full hover:bg-emerald-50"
    >
      {label} →
    </Link>
  );
}
