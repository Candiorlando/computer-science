"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { AnyUser, ClientUser } from "@/lib/users";
import { loadCaseNotes } from "@/lib/case-notes";
import { threadsForUser, unreadCount } from "@/lib/messages";
import { seedDemoMessages } from "@/lib/demo-messages-seed";
import { loadAccommodationLetters } from "@/lib/accommodation-letters";
import {
  loadEEOCCharges,
  loadOCRComplaints,
  loadProblemAnalysisReports,
} from "@/lib/self-advocacy";

interface RecentDoc {
  id: string;
  kind: string;
  title: string;
  href: string;
  createdAt: string;
}

export default function ClientHome() {
  const router = useRouter();
  const [user, setUser] = useState<AnyUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    seedDemoMessages();
    setUser(s);
  }, [router]);

  const data = useMemo(() => {
    if (!user) return null;
    const unread = unreadCount(user.email);
    const threads = threadsForUser(user.email);
    const recentNotes =
      user.role === "client" && "caseId" in user
        ? loadCaseNotes()
            .filter((n) => n.clientCaseId === user.caseId)
            .slice(0, 6)
        : [];
    const recentDocs: RecentDoc[] = [
      ...loadAccommodationLetters().map((l) => ({
        id: l.id,
        kind: "Accommodation Letter",
        title: l.employerName
          ? `Accommodation Letter — ${l.employerName}`
          : "Accommodation Letter",
        href: `/accommodation-letter?id=${l.id}`,
        createdAt: l.createdAt,
      })),
      ...loadProblemAnalysisReports().map((r) => ({
        id: r.id,
        kind: "Problem Analysis",
        title: r.employerName
          ? `Problem Analysis — ${r.employerName}`
          : "Problem Analysis Report",
        href: `/self-advocacy/incident-report?id=${r.id}`,
        createdAt: r.createdAt,
      })),
      ...loadEEOCCharges().map((c) => ({
        id: c.id,
        kind: "EEOC Charge",
        title: "EEOC Charge of Discrimination",
        href: `/self-advocacy/eeoc?id=${c.id}`,
        createdAt: c.createdAt,
      })),
      ...loadOCRComplaints().map((c) => ({
        id: c.id,
        kind: "OCR/DOJ Complaint",
        title: "OCR / DOJ Civil Rights Complaint",
        href: `/self-advocacy/ocr-doj?id=${c.id}`,
        createdAt: c.createdAt,
      })),
    ]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 4);
    return { unread, threads, recentNotes, recentDocs };
  }, [user]);

  if (!user || !data) return null;

  const isClient = user.role === "client";
  const c = isClient ? (user as ClientUser) : null;
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <section className="saas-card grad-tealblue-soft">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full">
              {isClient ? "Client" : "Client Portal Preview"}
            </span>
            <h1 className="text-4xl mt-2 font-semibold">
              Welcome, <span className="text-grad-tealblue">{firstName}</span>.
            </h1>
            {c && (
              <p className="text-ink/65 text-sm mt-2">
                <strong className="font-mono text-ink">{c.caseId}</strong> ·{" "}
                {c.counselorName} · Next appointment {c.nextAppt}
              </p>
            )}
          </div>
          <Link
            href="/messages"
            className="grad-tealblue text-white font-semibold px-4 py-2 rounded-md text-sm"
          >
            ✉️ Messages
            {data.unread > 0 && (
              <span className="ml-2 bg-white/25 px-2 rounded-full text-xs">
                {data.unread}
              </span>
            )}
          </Link>
        </div>
      </section>

      {c && (
        <section className="saas-card">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-lg font-semibold">Progress on your plan</h2>
            <span className="text-sm font-semibold text-grad-tealblue">
              {c.progress}%
            </span>
          </div>
          <div className="h-3 bg-ink/10 rounded-full overflow-hidden">
            <div
              className="h-full grad-tealblue"
              style={{ width: `${c.progress}%` }}
            />
          </div>
          <p className="text-sm text-ink/65 mt-3">
            Stage: <strong>{c.status}</strong>. Goal: <strong>{c.goal}</strong>.
          </p>
        </section>
      )}

      <section className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Where do you want to start?</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <QuickStart
              href="/intake"
              icon="🧭"
              title="Find my path"
              desc="Short intake + assessment. Get matched to careers that fit you."
            />
            <QuickStart
              href="/assessment"
              icon="📝"
              title="Interest Profiler"
              desc="44-item validated assessment — Big Five + Holland RIASEC."
              badge="44 items"
            />
            <QuickStart
              href="/resume"
              icon="📄"
              title="Resume + cover letter"
              desc="One-page resume tailored to a specific job, with matching cover letter."
              badge="AI"
            />
            <QuickStart
              href="/self-advocacy"
              icon="🛠️"
              title="Self-advocacy tools"
              desc="ADA letters, EEOC charges, OCR/DOJ complaints, discrimination documentation."
            />
            <QuickStart
              href="/entrepreneurship"
              icon="💡"
              title="Self-employment"
              desc="Business concept matcher, VR-fundable business plan, funding directory."
            />
            <QuickStart
              href="/coach"
              icon="💬"
              title="Talk to the coach"
              desc="AI career coach grounded in your profile."
              badge="Claude Opus 4.8"
            />
          </div>

          {data.recentDocs.length > 0 && (
            <>
              <h2 className="text-xl font-semibold pt-2">
                Recently delivered to you
              </h2>
              <ul role="list" className="grid sm:grid-cols-2 gap-3">
                {data.recentDocs.map((d) => (
                  <li key={d.kind + d.id}>
                    <Link
                      href={d.href}
                      className="block saas-card hover:shadow-md transition border-emerald-200 bg-emerald-50/30"
                    >
                      <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">
                        {d.kind}
                      </div>
                      <div className="font-semibold text-sm mt-1">
                        {d.title}
                      </div>
                      <div className="text-xs text-ink/55 mt-1">
                        {new Date(d.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <div className="text-xs text-cyan-700 font-semibold mt-2">
                        📄 Open document →
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 className="text-xl font-semibold pt-2">Your activity</h2>
          {data.recentNotes.length === 0 ? (
            <p className="text-sm text-ink/55 italic">
              Nothing yet. Start with an assessment or the intake form.
            </p>
          ) : (
            <ul className="space-y-2" role="list">
              {data.recentNotes.slice(0, 5).map((n) => (
                <li
                  key={n.id}
                  className="saas-card flex items-start gap-3"
                >
                  <div className="w-8 h-8 grad-tealblue rounded-full grid place-items-center text-white text-xs font-bold flex-shrink-0">
                    ✓
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">
                      {n.activityType}
                    </div>
                    <div className="text-xs text-ink/55">
                      {new Date(n.sessionAt).toLocaleString()}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-4">
          <section className="saas-card">
            <h2 className="text-sm uppercase tracking-wider text-ink/55 mb-3 font-semibold">
              Recent conversations
            </h2>
            {data.threads.length === 0 ? (
              <p className="text-xs text-ink/55 italic">
                You and your counselor haven&apos;t started a thread yet.
              </p>
            ) : (
              <ul className="space-y-2" role="list">
                {data.threads.slice(0, 4).map((t) => {
                  const counterpart = t.participants.find(
                    (p) => p.email !== user.email,
                  );
                  return (
                    <li key={t.id}>
                      <Link
                        href={`/messages?thread=${t.id}`}
                        className="block text-xs hover:bg-ink/5 -mx-2 px-2 py-1.5 rounded"
                      >
                        <div className="font-semibold text-ink">
                          {counterpart?.name ?? "—"}
                        </div>
                        <div className="text-ink/60 truncate">
                          {t.lastMessagePreview || t.subject}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="saas-card text-xs text-ink/65">
            <h2 className="text-sm uppercase tracking-wider text-ink/55 mb-2 font-semibold">
              Tutorials &amp; support
            </h2>
            <ul className="space-y-1">
              <li>📖 <Link href="/resources/client" className="text-cyan-700 hover:underline">Resource Library</Link></li>
              <li>💰 <Link href="/funding" className="text-cyan-700 hover:underline">Funding directory</Link></li>
              <li>⚙️ <Link href="/settings" className="text-cyan-700 hover:underline">Settings</Link></li>
            </ul>
          </section>
        </aside>
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
    <Link href={href} className="saas-card block hover:no-underline">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="flex items-baseline gap-2 mb-1">
        <h3 className="font-semibold">{title}</h3>
        {badge && (
          <span className="text-[10px] uppercase tracking-wider bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-ink/65">{desc}</p>
    </Link>
  );
}
