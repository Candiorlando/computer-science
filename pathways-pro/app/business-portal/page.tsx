"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession, clearSession } from "@/lib/session";
import type { BusinessUser } from "@/lib/users";
import {
  acknowledgeRoute,
  documentsForOrg,
  getCurrentBusinessOrg,
  loadActivity,
  loadEngagements,
  placementsByEmployer,
  activityForOrg,
  type ActivityEntry,
  type Placement,
  type ForensicEngagement,
  type DocumentForRecipient,
  type BusinessOrg,
} from "@/lib/business-portal";
import { seedBusinessPortal } from "@/lib/business-portal-seed";

export default function BusinessPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<BusinessUser | null>(null);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    seedBusinessPortal();
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "business") {
      const dest =
        s.role === "vendor"
          ? "/vendor-portal"
          : s.role === "counselor"
            ? "/dashboard/business"
            : "/portal";
      return router.replace(dest);
    }
    setUser(s);
  }, [router, bump]);

  const data = useMemo(() => {
    if (!user) return null;
    const org = getCurrentBusinessOrg(user);
    const placements = placementsByEmployer(user.orgId);
    const docs = documentsForOrg(user.orgId);
    const unackedDocs = docs.filter((d) => !d.route.acknowledgedAt);
    const engagements = loadEngagements().filter(
      (e) => e.retainingOrgId === user.orgId,
    );
    const activity = activityForOrg(user.orgId);
    return { org, placements, docs, unackedDocs, engagements, activity };
  }, [user, bump]);

  if (!user || !data) return null;

  function signOut() {
    clearSession();
    router.push("/business");
  }

  return (
    <div className="space-y-8">
      <PortalHeader user={user} org={data.org} onSignOut={signOut} />

      {/* Roll-up */}
      <section
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        aria-label="Business portal summary"
      >
        <Stat
          label="Active placements"
          value={String(
            data.placements.filter((p) => p.status === "active").length,
          )}
          sub="from VR caseload referrals"
        />
        <Stat
          label="Open accommodations"
          value={String(
            data.placements.reduce((s, p) => s + p.accommodationsOpen, 0),
          )}
          sub="awaiting your verification"
        />
        <Stat
          label="Documents to acknowledge"
          value={String(data.unackedDocs.length)}
          sub="routed to your org"
        />
        <Stat
          label="Active forensic engagements"
          value={String(
            data.engagements.filter((e) => e.status !== "closed").length,
          )}
          sub="retained by your org"
        />
      </section>

      <PlacementsBlock placements={data.placements} />
      <DocumentsBlock docs={data.docs} onAck={() => setBump((n) => n + 1)} />
      <EngagementsBlock engagements={data.engagements} />
      <ActivityBlock items={data.activity} />

      <footer className="text-xs text-ink/55 border-t border-ink/10 pt-4">
        Your view is scoped to <strong>{data.org?.legalName ?? "your organization"}</strong>.
        Clinical PHI never crosses this boundary — you receive routed
        deliverables (FCE, RTW, JD analyses, accommodation letters,
        wage-earning capacity reports) plus placement workspaces.
      </footer>
    </div>
  );
}

function PortalHeader({
  user,
  org,
  onSignOut,
}: {
  user: BusinessUser;
  org: BusinessOrg | null;
  onSignOut: () => void;
}) {
  return (
    <header className="flex items-baseline justify-between gap-4 flex-wrap">
      <div>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          {scopeLabel(user.scopeRole)} ·{" "}
          {org?.legalName ?? user.orgName}
        </p>
        <h1 className="text-4xl">
          Welcome, <span className="text-accent">{user.name.split(" ")[0]}</span>.
        </h1>
        {org && (
          <p className="text-sm text-ink/60 mt-1">
            {org.industry} · {org.size} employees · {org.hqCity}, {org.hqState}
          </p>
        )}
      </div>
      <button
        onClick={onSignOut}
        className="text-xs border border-ink/20 px-3 py-1.5 rounded hover:bg-ink/5"
      >
        Sign out
      </button>
    </header>
  );
}

function scopeLabel(s: BusinessUser["scopeRole"]): string {
  return {
    hr_director: "HR Director",
    risk_manager: "Risk Manager",
    adjuster: "Workers' Comp Adjuster",
    attorney: "Attorney",
  }[s];
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="border border-ink/15 bg-cream rounded-lg p-4">
      <div className="text-xs uppercase tracking-wider text-ink/50">{label}</div>
      <div className="text-3xl text-accent leading-none mt-1">{value}</div>
      <div className="text-xs text-ink/55 mt-1">{sub}</div>
    </div>
  );
}

function PlacementsBlock({ placements }: { placements: Placement[] }) {
  return (
    <section>
      <h2 className="text-2xl mb-3">Active placements</h2>
      {placements.length === 0 ? (
        <Empty>
          No placements yet. Once a VR counselor refers a candidate and your
          team makes a hire, that placement opens here.
        </Empty>
      ) : (
        <div className="space-y-3">
          {placements.map((p) => (
            <article
              key={p.id}
              className="border border-ink/15 rounded-lg p-5 bg-cream"
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
                <h3 className="text-lg font-semibold">
                  Case {p.caseId} · {initialOnly(p.clientName)}
                </h3>
                <span className="text-xs text-emerald-700 font-semibold">
                  ✓ Integrated competitive setting
                </span>
              </div>
              <div className="text-sm text-ink/75 mb-2">
                {p.jobTitle} · SOC {p.socCode} · hired {p.hireDate} · $
                {p.hourlyWage.toFixed(2)}/hr · {p.weeklyHours} hrs/wk
              </div>
              <RetentionBar day={p.dayCount} />
              <div className="grid sm:grid-cols-3 gap-3 mt-3 text-sm">
                <SmallStat
                  label="Job coach"
                  value={p.jobCoachName ?? "—"}
                />
                <SmallStat
                  label="Accommodations in place"
                  value={String(p.accommodationsInPlace)}
                />
                <SmallStat
                  label="Open accommodations"
                  value={String(p.accommodationsOpen)}
                  warn={p.accommodationsOpen > 0}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function RetentionBar({ day }: { day: number }) {
  const pct = Math.min(100, Math.round((day / 90) * 100));
  const milestone =
    day >= 90
      ? "Day 90 ✓ — retention milestone met"
      : day >= 60
        ? "Day 60 ✓ — Day 90 in progress"
        : day >= 30
          ? "Day 30 ✓ — Day 60 in progress"
          : "Day 30 in progress";
  return (
    <div>
      <div className="flex items-baseline justify-between text-xs mb-1">
        <span className="text-ink/60">Retention timer</span>
        <span className="text-ink/80 font-semibold">Day {day} / 90</span>
      </div>
      <div
        className="h-2 bg-ink/10 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Retention progress: ${milestone}`}
      >
        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[11px] text-ink/55 mt-1">{milestone}</p>
    </div>
  );
}

function SmallStat({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div className="border border-ink/10 rounded p-2 bg-white">
      <div className="text-[10px] uppercase tracking-wider text-ink/50">
        {label}
      </div>
      <div
        className={`text-sm font-semibold ${warn ? "text-accent" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}

function DocumentsBlock({
  docs,
  onAck,
}: {
  docs: DocumentForRecipient[];
  onAck: () => void;
}) {
  return (
    <section>
      <h2 className="text-2xl mb-3">Documents routed to you</h2>
      {docs.length === 0 ? (
        <Empty>No documents in your vault yet.</Empty>
      ) : (
        <div className="space-y-3">
          {docs.map(({ doc, route }) => (
            <article
              key={route.id}
              className={`border rounded-lg p-4 ${
                route.acknowledgedAt
                  ? "border-ink/15 bg-cream"
                  : "border-amber-300 bg-amber-50/40"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                <h3 className="font-semibold">{doc.title}</h3>
                <span className="text-xs uppercase tracking-wider text-ink/55">
                  {kindLabel(doc.kind)}
                </span>
              </div>
              <div className="text-sm text-ink/70">
                Uploaded by {doc.uploadedByName} ·{" "}
                {new Date(doc.uploadedAt).toLocaleDateString()} ·{" "}
                {Math.round(doc.sizeBytes / 1024)} KB
              </div>
              <div className="flex items-center justify-between gap-2 mt-3 text-xs">
                {route.acknowledgedAt ? (
                  <span className="text-emerald-700 font-semibold">
                    ✓ Acknowledged{" "}
                    {new Date(route.acknowledgedAt).toLocaleDateString()}
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      acknowledgeRoute(route.id);
                      onAck();
                    }}
                    className="bg-accent text-cream px-3 py-1.5 rounded font-semibold"
                  >
                    Acknowledge
                  </button>
                )}
                <span className="text-ink/55">
                  Access: {route.accessKind}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function kindLabel(k: string): string {
  return (
    {
      wec: "Wage-Earning Capacity",
      lma: "Labor Market Assessment",
      fce: "Functional Capacity Eval",
      rtw: "Return-to-Work clearance",
      "jd-analysis": "JD / ADA Analysis",
      "accommodation-letter": "Accommodation letter",
      "ipe-summary": "IPE summary",
      invoice: "Invoice",
      msa: "Master Service Agreement",
      coi: "Certificate of Insurance",
    } as Record<string, string>
  )[k] ?? k;
}

function EngagementsBlock({
  engagements,
}: {
  engagements: ForensicEngagement[];
}) {
  return (
    <section>
      <h2 className="text-2xl mb-3">Forensic engagements you've retained</h2>
      {engagements.length === 0 ? (
        <Empty>No active forensic engagements.</Empty>
      ) : (
        <div className="space-y-3">
          {engagements.map((e) => (
            <article
              key={e.id}
              className="border border-ink/15 rounded-lg p-4 bg-cream"
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                <h3 className="font-semibold">{e.matterCaption}</h3>
                <span className="text-xs uppercase tracking-wider text-accent font-semibold">
                  {e.status}
                </span>
              </div>
              <div className="text-sm text-ink/75">
                {e.kind.replaceAll("_", " ")} · {e.jurisdiction} · {e.venue}
              </div>
              <div className="text-sm text-ink/65 mt-1">
                Expert {e.expertName} · ${e.hourlyRate.toFixed(2)}/hr ·{" "}
                {e.hoursBilled.toFixed(1)} hrs billed · retained {e.retainedOn}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function ActivityBlock({ items }: { items: ActivityEntry[] }) {
  return (
    <section>
      <h2 className="text-2xl mb-3">Activity feed</h2>
      {items.length === 0 ? (
        <Empty>No recent activity scoped to your org.</Empty>
      ) : (
        <ol className="space-y-2" role="list">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex items-start gap-3 border-l-2 border-accent/30 pl-3 py-1"
            >
              <time
                dateTime={a.occurredAt}
                className="text-xs text-ink/55 w-32 shrink-0"
              >
                {new Date(a.occurredAt).toLocaleString()}
              </time>
              <div className="text-sm">
                <div className="text-ink/85">{a.summary}</div>
                <div className="text-[11px] text-ink/55">
                  {a.kind.replaceAll("_", " ")}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-ink/20 rounded-lg p-6 text-center text-ink/55">
      {children}
    </div>
  );
}

function initialOnly(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? "";
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}
