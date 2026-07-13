"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { EmploymentPartnerUser } from "@/lib/users";
import {
  ceForPartner,
  inquiriesForPartner,
  loadPartnerOrgs,
  opportunitiesForPartner,
  placementsForPartner,
} from "@/lib/employment-partners";
import { threadsForUser, unreadCount } from "@/lib/messages";
import { notesForPartnerOrg } from "@/lib/case-notes";
import { seedPartnerDemo } from "@/lib/partner-seed";
import { seedDemoAccounts } from "@/lib/demo-accounts-seed";
import { loadServiceRequests } from "@/lib/service-requests";

export default function PartnerHome() {
  const router = useRouter();
  const [user, setUser] = useState<EmploymentPartnerUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "partner") {
      const dest =
        s.role === "business"
          ? "/business-portal"
          : s.role === "vendor"
            ? "/vendor-portal"
            : s.role === "counselor"
              ? "/dashboard"
              : "/portal";
      return router.replace(dest);
    }
    seedPartnerDemo();
    seedDemoAccounts();
    setUser(s);
  }, [router]);

  const data = useMemo(() => {
    if (!user) return null;
    const org = loadPartnerOrgs()[user.partnerOrgId];
    const opps = opportunitiesForPartner(user.partnerOrgId);
    const placements = placementsForPartner(user.partnerOrgId);
    const inquiries = inquiriesForPartner(user.partnerOrgId);
    const ce = ceForPartner(user.partnerOrgId);
    const unread = unreadCount(user.email);
    const threads = threadsForUser(user.email);
    const notes = notesForPartnerOrg(user.partnerOrgId).slice(0, 6);
    const deliveredOrders = loadServiceRequests()
      .filter(
        (r) =>
          r.requesterOrgId === user.partnerOrgId &&
          r.status === "delivered",
      )
      .sort(
        (a, b) =>
          new Date(b.sentToClientAt ?? b.requestedAt).getTime() -
          new Date(a.sentToClientAt ?? a.requestedAt).getTime(),
      )
      .slice(0, 4);
    return {
      org,
      opps,
      placements,
      inquiries,
      ce,
      unread,
      threads,
      notes,
      deliveredOrders,
    };
  }, [user]);

  if (!user || !data) return null;

  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-8">
      <section className="saas-card grad-tealblue-soft">
        <div className="flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-semibold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
              Employment Partner
            </span>
            <h1 className="text-4xl mt-2 font-semibold">
              Welcome, <span className="text-grad-tealblue">{firstName}</span>.
            </h1>
            <p className="text-ink/65 text-sm mt-2">
              {user.partnerOrgName} · {user.title}
              {user.participatesInCustomizedEmployment && (
                <>
                  {" · "}
                  <span className="text-emerald-700 font-semibold">
                    🎯 Customized Employment partner
                  </span>
                </>
              )}
            </p>
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

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="Open opportunities"
          value={data.opps.filter((o) => o.status === "open").length}
          icon="📋"
        />
        <Stat label="Active placements" value={data.placements.length} icon="🤝" />
        <Stat
          label="Customized Employment"
          value={data.ce.length}
          icon="🎯"
        />
        <Stat
          label="Open inquiries"
          value={data.inquiries.filter((i) => i.status === "pending").length}
          icon="♿"
        />
      </section>

      {data.deliveredOrders.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-3">
            <h2 className="text-xl font-semibold">
              Recently delivered to you
            </h2>
            <Link
              href="/partner-portal/orders"
              className="text-xs text-emerald-700 hover:underline font-semibold"
            >
              View all orders →
            </Link>
          </div>
          <ul role="list" className="grid sm:grid-cols-2 gap-3">
            {data.deliveredOrders.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/partner-portal/orders/${o.id}`}
                  className="block saas-card hover:shadow-md transition border-emerald-200 bg-emerald-50/30"
                >
                  <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">
                    Delivered
                  </div>
                  <div className="font-semibold text-sm mt-1">
                    {o.serviceTitle}
                  </div>
                  <div className="text-xs text-ink/55 mt-1">
                    {o.matterCaption ? `${o.matterCaption} · ` : ""}
                    {new Date(
                      o.sentToClientAt ?? o.requestedAt,
                    ).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-emerald-700 font-semibold mt-2">
                    📄 View / print →
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="saas-card">
        <h2 className="text-sm uppercase tracking-wider text-ink/55 mb-3 font-semibold">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <QuickAction
            href="/partner-portal/opportunities"
            icon="➕"
            label="Post opportunity"
          />
          <QuickAction
            href="/partner-portal/accommodation-requests"
            icon="♿"
            label="Submit accommodation inquiry"
          />
          <QuickAction
            href="/partner-portal/documents"
            icon="📤"
            label="Upload document"
          />
          {user.participatesInCustomizedEmployment ? (
            <QuickAction
              href="/partner-portal/customized-employment"
              icon="🎯"
              label="Customized Employment"
            />
          ) : (
            <QuickAction
              href="/settings"
              icon="⚙️"
              label="Enable CE"
            />
          )}
        </div>
      </section>

      <section className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-4">
          <SectionHeader title="Placement pipeline" />
          {data.placements.length === 0 ? (
            <Empty text="No active placements yet. Post an opportunity to get started." />
          ) : (
            <ul role="list" className="space-y-2">
              {data.placements.map((p) => (
                <li key={p.id} className="saas-card flex items-center gap-3">
                  <div className="w-9 h-9 grad-tealblue text-white rounded-full grid place-items-center text-xs font-bold flex-shrink-0">
                    {initials(p.clientName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{p.clientName}</div>
                    <div className="text-xs text-ink/65">
                      {p.opportunityTitle} · {p.hoursPerWeek} hrs/wk
                      {p.isCustomizedEmployment && (
                        <span className="ml-2 text-emerald-700 font-semibold">
                          🎯 CE
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    {p.status}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {user.participatesInCustomizedEmployment && data.ce.length > 0 && (
            <>
              <SectionHeader
                title="Customized Employment engagements"
                link="/partner-portal/customized-employment"
                linkLabel="Open workspace →"
              />
              <ul role="list" className="space-y-2">
                {data.ce.map((e) => (
                  <li key={e.id} className="saas-card">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">
                        {e.clientName ?? "Unassigned"}
                        {e.proposedTitle && (
                          <span className="text-ink/55 font-normal">
                            {" "}
                            · {e.proposedTitle}
                          </span>
                        )}
                      </h3>
                      <span className="text-[10px] uppercase tracking-wider font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {e.currentStage.replaceAll("-", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-ink/65 mt-1">
                      Last updated {new Date(e.updatedAt).toLocaleDateString()}
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}

          <SectionHeader title="Recent activity" link="/case-notes" linkLabel="See all" />
          {data.notes.length === 0 ? (
            <Empty text="No platform activity recorded yet." />
          ) : (
            <ul className="space-y-2" role="list">
              {data.notes.slice(0, 4).map((n) => (
                <li key={n.id} className="saas-card flex items-start gap-3">
                  <div className="w-8 h-8 grad-tealblue rounded-full grid place-items-center text-white text-xs font-bold flex-shrink-0">
                    P
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm">{n.activityType}</div>
                    <div className="text-xs text-ink/65">
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
              Notifications
            </h2>
            {data.unread === 0 &&
            data.inquiries.filter((i) => i.status === "responded").length === 0 ? (
              <p className="text-xs text-ink/55 italic">All caught up.</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {data.unread > 0 && (
                  <li>
                    🔔{" "}
                    <Link
                      href="/messages"
                      className="text-emerald-700 hover:underline"
                    >
                      {data.unread} new message{data.unread === 1 ? "" : "s"}
                    </Link>
                  </li>
                )}
                {data.inquiries
                  .filter((i) => i.status === "responded")
                  .slice(0, 3)
                  .map((i) => (
                    <li key={i.id}>
                      ♿ Counselor responded to your inquiry about{" "}
                      <strong>{i.jobTitle}</strong>
                    </li>
                  ))}
              </ul>
            )}
          </section>

          <section className="saas-card">
            <h2 className="text-sm uppercase tracking-wider text-ink/55 mb-3 font-semibold">
              Recent conversations
            </h2>
            {data.threads.length === 0 ? (
              <p className="text-xs text-ink/55 italic">
                Start a thread with your assigned counselor.
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
        </aside>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="saas-card">
      <div className="text-2xl">{icon}</div>
      <div className="text-3xl font-bold mt-1 text-ink">{value}</div>
      <div className="text-xs uppercase tracking-wider text-ink/55 mt-1">
        {label}
      </div>
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
      className="border border-ink/10 rounded-lg p-3 text-xs text-center hover:border-emerald-500 hover:bg-emerald-50/50 transition"
    >
      <div className="text-xl mb-1">{icon}</div>
      <div className="font-semibold">{label}</div>
    </Link>
  );
}

function SectionHeader({
  title,
  link,
  linkLabel,
}: {
  title: string;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 pt-2">
      <h2 className="text-xl font-semibold">{title}</h2>
      {link && linkLabel && (
        <Link href={link} className="text-xs text-emerald-700 hover:underline">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-ink/20 rounded-lg p-6 text-center text-ink/55 text-sm">
      {text}
    </div>
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
