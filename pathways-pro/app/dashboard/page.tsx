"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import {
  CLIENTS,
  getAllBusinessUsers,
  getAllVendorUsers,
  type ClientUser,
  type CounselorUser,
} from "@/lib/users";
import { loadCaseNotes } from "@/lib/case-notes";
import { threadsForUser, unreadCount } from "@/lib/messages";
import { seedDemoMessages } from "@/lib/demo-messages-seed";
import { seedDemoClientReports } from "@/lib/demo-seed";

export default function CounselorHome() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    // The legacy home dashboard surfaced recent case-note content and
    // recent conversations cross-case. Under the strict case-isolation
    // model the counselor lands on /case-search instead; aggregate-only
    // utility pages (Daily Briefing, Financials, Reports) remain in the
    // LeftNav.
    return router.replace("/case-search");
  }, [router]);

  const data = useMemo(() => {
    if (!user) return null;
    const clients = user.clientKeys
      .map((k) => CLIENTS[k])
      .filter((c): c is ClientUser => Boolean(c));
    const businesses = Object.values(getAllBusinessUsers());
    const vendors = Object.values(getAllVendorUsers());
    const unread = unreadCount(user.email);
    const threads = threadsForUser(user.email);
    const recentNotes = loadCaseNotes()
      .filter(
        (n) =>
          (n.clientCaseId &&
            clients.some((c) => c.caseId === n.clientCaseId)) ||
          n.participantType === "business-vendor",
      )
      .slice(0, 6);
    return { clients, businesses, vendors, unread, threads, recentNotes };
  }, [user]);

  if (!user || !data) return null;

  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Welcome hero */}
      <section className="saas-card grad-tealblue-soft">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
              Counselor
            </span>
            <h1 className="text-4xl mt-2 font-semibold">
              Welcome back, <span className="text-grad-tealblue">{firstName}</span>.
            </h1>
            <p className="text-ink/65 text-sm mt-1">
              {user.credentials} · {user.agency} · {user.office}
            </p>
          </div>
          <Link
            href="/messages"
            className="grad-tealblue text-white font-semibold px-4 py-2 rounded-md text-sm"
          >
            ✉️ Open Messages
            {data.unread > 0 && (
              <span className="ml-2 bg-white/25 px-2 rounded-full text-xs">
                {data.unread} new
              </span>
            )}
          </Link>
        </div>
      </section>

      {/* Stat row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Active clients" value={data.clients.length} icon="👥" />
        <Stat
          label="Business clients"
          value={data.businesses.length}
          icon="🏢"
        />
        <Stat label="Vendors" value={data.vendors.length} icon="🛠️" />
        <Stat label="Unread messages" value={data.unread} icon="✉️" alert={data.unread > 0} />
      </section>

      {/* Alerts strip */}
      <Alerts unread={data.unread} recentNotes={data.recentNotes.length} />

      {/* Two-column: caseload + side rail */}
      <section className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <SectionHeader title="Recent activity" link="/case-notes" linkLabel="See all" />
          <div className="space-y-2">
            {data.recentNotes.length === 0 ? (
              <p className="text-sm text-ink/55 italic">
                Quiet day — no recent client or business actions.
              </p>
            ) : (
              data.recentNotes.slice(0, 5).map((n) => (
                <article
                  key={n.id}
                  className="saas-card flex items-start gap-3"
                >
                  <div className="w-8 h-8 grad-tealblue rounded-full grid place-items-center text-white text-xs font-bold flex-shrink-0">
                    {n.participantType === "individual-client" ? "C" : "B"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{n.activityType}</div>
                    <div className="text-xs text-ink/65 truncate">
                      {n.clientName ?? n.businessOrgName} ·{" "}
                      {new Date(n.sessionAt).toLocaleString()}
                    </div>
                    <p className="text-xs text-ink/65 mt-1 line-clamp-2">{n.data}</p>
                  </div>
                </article>
              ))
            )}
          </div>

          <SectionHeader title="My caseload" link="/caseload" linkLabel="Full caseload →" />
          <ul role="list" className="space-y-2">
            {data.clients.map((c) => (
              <li key={c.email}>
                <Link
                  href={`/report?case=${c.caseId}`}
                  className="saas-card flex items-center gap-4 hover:no-underline"
                >
                  <div className="w-9 h-9 grad-tealblue text-white rounded-full grid place-items-center text-xs font-bold flex-shrink-0">
                    {initials(c.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{c.name}</div>
                    <div className="text-xs text-ink/55 truncate">
                      {c.caseId} · {c.goal}
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-end text-xs gap-1">
                    <span className="font-semibold text-ink">{c.progress}%</span>
                    <div className="w-24 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                      <div
                        className="h-full grad-tealblue"
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>
                  <StatusBadge status={c.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Side rail: quick actions + notifications */}
        <aside className="space-y-4">
          <section className="saas-card">
            <h2 className="text-sm uppercase tracking-wider text-ink/55 mb-3 font-semibold">
              Quick actions
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction href="/ipe" icon="✍️" label="New IPE" />
              <QuickAction href="/caseload" icon="📋" label="Caseload" />
              <QuickAction href="/dashboard/business" icon="🏢" label="Business" />
              <QuickAction href="/labor-market" icon="📊" label="Labor Market" />
              <QuickAction href="/clinical-assessments" icon="📝" label="Assessments" />
              <QuickAction href="/messages" icon="✉️" label="Messages" />
            </div>
          </section>

          <section className="saas-card">
            <h2 className="text-sm uppercase tracking-wider text-ink/55 mb-3 font-semibold">
              Recent conversations
            </h2>
            {data.threads.length === 0 ? (
              <p className="text-xs text-ink/55 italic">
                Nothing yet. Start a new conversation.
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

          <section className="saas-card text-xs text-ink/65 leading-relaxed">
            <h2 className="text-sm uppercase tracking-wider text-ink/55 mb-2 font-semibold">
              Tutorials &amp; support
            </h2>
            <ul className="space-y-1">
              <li>📖 <Link href="/practitioner-hub" className="text-cyan-700 hover:underline">Practitioner Hub</Link></li>
              <li>📚 <Link href="/resources/counselor" className="text-cyan-700 hover:underline">Resource Library</Link></li>
              <li>⚙️ <Link href="/settings" className="text-cyan-700 hover:underline">Settings &amp; preferences</Link></li>
            </ul>
          </section>
        </aside>
      </section>
    </div>
  );
}

function Alerts({ unread, recentNotes }: { unread: number; recentNotes: number }) {
  if (unread === 0 && recentNotes === 0) return null;
  return (
    <section
      className="saas-card border-cyan-300 bg-cyan-50/60"
      aria-live="polite"
    >
      <div className="flex items-baseline gap-3 flex-wrap text-sm">
        <span className="text-base">🔔</span>
        <span className="font-semibold">Notifications:</span>
        {unread > 0 && (
          <Link href="/messages" className="text-cyan-800 hover:underline">
            {unread} new message{unread === 1 ? "" : "s"}
          </Link>
        )}
        {unread > 0 && recentNotes > 0 && <span className="text-ink/30">·</span>}
        {recentNotes > 0 && (
          <Link href="/case-notes" className="text-cyan-800 hover:underline">
            {recentNotes} recent case note{recentNotes === 1 ? "" : "s"}
          </Link>
        )}
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  icon,
  alert,
}: {
  label: string;
  value: number;
  icon: string;
  alert?: boolean;
}) {
  return (
    <div className={`saas-card ${alert ? "ring-tealblue" : ""}`}>
      <div className="text-2xl">{icon}</div>
      <div className="text-3xl font-bold mt-1 text-ink">{value}</div>
      <div className="text-xs uppercase tracking-wider text-ink/55 mt-1">
        {label}
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  link,
  linkLabel,
}: {
  title: string;
  link: string;
  linkLabel: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 pt-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      <Link
        href={link}
        className="text-xs text-cyan-700 hover:underline"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
}: {
  href: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="border border-ink/10 rounded-lg p-3 text-xs text-center hover:border-cyan-500 hover:bg-cyan-50/50 transition"
    >
      <div className="text-xl mb-1">{icon}</div>
      <div className="font-semibold">{label}</div>
    </Link>
  );
}

function StatusBadge({ status }: { status: ClientUser["status"] }) {
  const styles: Record<ClientUser["status"], string> = {
    "In Training": "bg-blue-100 text-blue-800",
    "Job Placement": "bg-emerald-100 text-emerald-800",
    "Assessment Phase": "bg-amber-100 text-amber-800",
    Intake: "bg-pink-100 text-pink-800",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
