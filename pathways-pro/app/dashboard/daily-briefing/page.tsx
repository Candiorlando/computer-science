"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { CLIENTS } from "@/lib/users";
import { loadCaseNotes } from "@/lib/case-notes";
import {
  pendingRequestsForCounselor,
  loadServiceRequests,
} from "@/lib/service-requests";
import { threadsForUser, unreadCount } from "@/lib/messages";
import { loadAccommodationInquiries } from "@/lib/employment-partners";
import { arSummary, apSummary, seedAPDemoIfEmpty } from "@/lib/financials";

export default function DailyBriefingPage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    seedAPDemoIfEmpty();
    setUser(s);
  }, [router]);

  const briefing = useMemo(() => {
    if (!user) return null;
    const pendingService = pendingRequestsForCounselor(user.email);
    const inquiries = loadAccommodationInquiries().filter(
      (i) => i.status === "pending",
    );
    const unsignedClientThreads = threadsForUser(user.email).filter((t) =>
      t.participants.some((p) => p.email !== user.email),
    );
    const unread = unreadCount(user.email);
    const myClients = user.clientKeys
      .map((k) => CLIENTS[k])
      .filter(Boolean);
    const todayNotes = loadCaseNotes().filter(
      (n) =>
        Date.parse(n.sessionAt) >
          Date.now() - 24 * 60 * 60 * 1000 &&
        n.clientCaseId &&
        myClients.some((c) => c.caseId === n.clientCaseId),
    );
    const ar = arSummary(user.email);
    const ap = apSummary();

    // Urgent: any service request pending > 2 days
    const overdueReviews = loadServiceRequests().filter(
      (r) =>
        r.status === "pending-counselor-review" &&
        Date.now() - Date.parse(r.requestedAt) > 2 * 24 * 60 * 60 * 1000,
    );

    return {
      pendingService,
      inquiries,
      unread,
      unsignedClientThreads,
      todayNotes,
      ar,
      ap,
      overdueReviews,
    };
  }, [user]);

  if (!user || !briefing) return null;

  const summary = aiPrioritySummary(briefing);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          Daily Briefing
        </p>
        <h1 className="text-3xl font-semibold">
          {dateGreeting()}, {user.name.split(" ")[0]}.
        </h1>
        <p className="text-ink/65 text-sm mt-1">
          Here&apos;s what needs your attention today.
        </p>
      </header>

      <section className="saas-card grad-tealblue-soft">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-cyan-700 mb-2">
          🧠 Priority summary
        </h2>
        <p className="text-ink/85 leading-relaxed">{summary}</p>
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        <Alert
          label="Urgent reviews overdue"
          count={briefing.overdueReviews.length}
          href="/dashboard/business"
          severe={briefing.overdueReviews.length > 0}
        />
        <Alert
          label="Service requests pending"
          count={briefing.pendingService.length}
          href="/dashboard/business"
        />
        <Alert
          label="Unread messages"
          count={briefing.unread}
          href="/messages"
          severe={briefing.unread > 3}
        />
        <Alert
          label="Accommodation inquiries"
          count={briefing.inquiries.length}
          href="/dashboard/partners"
        />
      </section>

      <div className="grid lg:grid-cols-2 gap-5">
        <section className="saas-card">
          <h2 className="text-lg font-semibold mb-3">Deliverables due today</h2>
          {briefing.pendingService.length === 0 ? (
            <p className="text-sm text-ink/55 italic">Nothing on the deck.</p>
          ) : (
            <ol className="space-y-2" role="list">
              {briefing.pendingService.map((r) => (
                <li
                  key={r.id}
                  className="flex items-baseline justify-between gap-2 text-sm border-b border-ink/10 pb-2 last:border-0"
                >
                  <div>
                    <div className="font-semibold">{r.serviceTitle}</div>
                    <div className="text-xs text-ink/55">
                      {r.requesterOrgName} · {r.urgency}
                    </div>
                  </div>
                  <Link
                    href="/dashboard/business"
                    className="text-xs text-cyan-700 hover:underline"
                  >
                    Open →
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="saas-card">
          <h2 className="text-lg font-semibold mb-3">
            Messages requiring response
          </h2>
          {briefing.unread === 0 ? (
            <p className="text-sm text-ink/55 italic">Inbox at zero.</p>
          ) : (
            <ol className="space-y-2" role="list">
              {briefing.unsignedClientThreads
                .slice(0, 5)
                .map((t) => {
                  const counter = t.participants.find(
                    (p) => p.email !== user.email,
                  );
                  return (
                    <li
                      key={t.id}
                      className="flex items-start justify-between gap-3 text-sm border-b border-ink/10 pb-2 last:border-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold">{counter?.name}</div>
                        <div className="text-xs text-ink/60 break-words line-clamp-2">
                          {t.lastMessagePreview}
                        </div>
                      </div>
                      <Link
                        href={`/messages?thread=${t.id}`}
                        className="text-xs text-cyan-700 hover:underline shrink-0"
                      >
                        Reply →
                      </Link>
                    </li>
                  );
                })}
            </ol>
          )}
        </section>
      </div>

      <section className="saas-card">
        <h2 className="text-lg font-semibold mb-3">Today on your caseload</h2>
        {briefing.todayNotes.length === 0 ? (
          <p className="text-sm text-ink/55 italic">
            No client activity in the last 24 hours.
          </p>
        ) : (
          <ol role="list" className="space-y-2">
            {briefing.todayNotes.slice(0, 8).map((n) => (
              <li
                key={n.id}
                className="flex items-baseline justify-between gap-2 text-sm border-b border-ink/10 pb-2 last:border-0"
              >
                <div>
                  <div className="font-semibold">{n.activityType}</div>
                  <div className="text-xs text-ink/55">
                    {n.clientName} · {n.clientCaseId}
                  </div>
                </div>
                <Link
                  href={`/case/${n.clientCaseId}`}
                  className="text-xs text-cyan-700 hover:underline"
                >
                  Case →
                </Link>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function aiPrioritySummary(b: {
  overdueReviews: { length: number };
  pendingService: { length: number };
  unread: number;
  inquiries: { length: number };
  ar: { overdueCents: number; outstandingCents: number };
  ap: { overdueCents: number; totalCents: number };
  todayNotes: { length: number };
}): string {
  const parts: string[] = [];
  if (b.overdueReviews.length > 0)
    parts.push(
      `🚨 ${b.overdueReviews.length} service request${b.overdueReviews.length === 1 ? "" : "s"} have been pending review for more than 48 hours — clear those first.`,
    );
  if (b.unread > 0)
    parts.push(
      `${b.unread} message${b.unread === 1 ? "" : "s"} waiting in your inbox.`,
    );
  if (b.inquiries.length > 0)
    parts.push(
      `${b.inquiries.length} employment partner accommodation inquir${b.inquiries.length === 1 ? "y" : "ies"} need your guidance.`,
    );
  if (b.ar.overdueCents > 0)
    parts.push(
      `$${(b.ar.overdueCents / 100).toLocaleString()} in receivables is overdue — review the Financials page.`,
    );
  if (b.todayNotes.length > 0)
    parts.push(
      `${b.todayNotes.length} client actions logged in the last 24 hours — quick wins to acknowledge in session.`,
    );
  if (parts.length === 0)
    return "Clean slate. No urgent items. Take this hour to do proactive outreach or finish a long-tail task.";
  return parts.join(" ");
}

function dateGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function Alert({
  label,
  count,
  href,
  severe,
}: {
  label: string;
  count: number;
  href: string;
  severe?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`saas-card block hover:no-underline ${
        severe && count > 0 ? "border-rose-300 bg-rose-50/40" : ""
      }`}
    >
      <div className="text-3xl font-bold leading-none">{count}</div>
      <div className="text-xs uppercase tracking-wider text-ink/55 mt-1">
        {label}
      </div>
    </Link>
  );
}
