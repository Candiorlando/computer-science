"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import {
  loadActivity,
  loadAuthorizations,
  loadCoachingLogs,
  loadEngagements,
  loadPlacements,
  loadDocuments,
  loadRoutes,
  decisionAuthorization,
  acknowledgeRoute,
  type ActivityEntry,
  type Placement,
  type ServiceAuthorization,
  type CoachingLogEntry,
  type ForensicEngagement,
  type VaultDocument,
  type DocumentRoute,
} from "@/lib/business-portal";
import { seedBusinessPortal } from "@/lib/business-portal-seed";

export default function CounselorBusinessView() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "counselor") {
      const dest =
        s.role === "business"
          ? "/business-portal"
          : s.role === "vendor"
            ? "/vendor-portal"
            : "/portal";
      return router.replace(dest);
    }
    seedBusinessPortal();
    setUser(s);
  }, [router, bump]);

  const data = useMemo(() => {
    if (!user) return null;
    const placements = loadPlacements().filter(
      (p) => p.counselorEmail === user.email,
    );
    const auths = loadAuthorizations().filter((a) =>
      placements.some((p) => p.caseId === a.caseId),
    );
    const logs = loadCoachingLogs().filter((l) =>
      placements.some((p) => p.id === l.placementId),
    );
    const unsignedLogs = logs.filter((l) => !l.signedByCounselor);
    const engagements = loadEngagements();
    const docs = loadDocuments();
    const routes = loadRoutes().filter(
      (r) => r.recipientEmail === user.email && !r.revokedAt,
    );
    const unackedRoutes = routes.filter((r) => !r.acknowledgedAt);
    const activity = loadActivity()
      .filter(
        (a) =>
          (a.caseId && placements.some((p) => p.caseId === a.caseId)) ||
          (a.actorRole && a.actorRole !== "counselor"),
      )
      .slice(0, 20);
    const employerSummary = summarizeEmployers(placements);
    return {
      placements,
      auths,
      pendingAuths: auths.filter((a) => a.status === "requested"),
      logs,
      unsignedLogs,
      engagements,
      docs,
      routes,
      unackedRoutes,
      activity,
      employerSummary,
    };
  }, [user, bump]);

  if (!user || !data) return null;

  const refresh = () => setBump((n) => n + 1);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Business View · Cross-caseload roll-up
        </p>
        <h1 className="text-4xl">
          Everything on the business / vendor side of your caseload.
        </h1>
        <p className="text-ink/70 mt-2 max-w-2xl">
          Employers your clients are placed with, vendor coaching logs awaiting
          your sign-off, forensic deliverables routed to you, and authorization
          decisions you owe a vendor.
        </p>
      </header>

      {/* ① Roll-up strip */}
      <section
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        aria-label="Business view summary"
      >
        <Stat
          label="Active placements"
          value={String(
            data.placements.filter((p) => p.status === "active").length,
          )}
          sub={`${data.placements.length} total`}
        />
        <Stat
          label="Vendor logs to sign"
          value={String(data.unsignedLogs.length)}
          sub="From CRPs you've authorized"
        />
        <Stat
          label="Docs to acknowledge"
          value={String(data.unackedRoutes.length)}
          sub="Routed to you"
        />
        <Stat
          label="Authorizations pending"
          value={String(data.pendingAuths.length)}
          sub="Vendors awaiting your decision"
        />
      </section>

      {/* ② Employers offering integrated settings */}
      <section>
        <h2 className="text-2xl mb-3">
          Employers offering integrated competitive settings
        </h2>
        <div className="space-y-3">
          {data.employerSummary.map((e) => (
            <article
              key={e.orgId}
              className="border border-ink/15 rounded-lg p-5 bg-cream"
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
                <h3 className="text-xl font-semibold">{e.orgName}</h3>
                <span className="text-xs text-emerald-700 font-semibold">
                  ✓ All placements in integrated settings
                </span>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-sm">
                <SmallStat label="Active placements" value={String(e.active)} />
                <SmallStat
                  label="Open accommodations"
                  value={String(e.openAccommodations)}
                  warn={e.openAccommodations > 0}
                />
                <SmallStat
                  label="In place"
                  value={String(e.placedAccommodations)}
                />
              </div>
              <ul className="mt-3 text-sm text-ink/75 space-y-1">
                {e.placements.map((p) => (
                  <li key={p.id} className="flex justify-between">
                    <span>
                      Case <strong>{p.caseId}</strong> · {p.clientName}{" "}
                      <span className="text-ink/50">· {p.jobTitle}</span>
                    </span>
                    <span className="text-ink/60">Day {p.dayCount} / 90</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
          {data.employerSummary.length === 0 && (
            <Empty>
              No employer placements on your caseload yet. Once a client is
              placed, the employer profile appears here.
            </Empty>
          )}
        </div>
      </section>

      {/* ③ Vendor logs awaiting sign-off */}
      <section>
        <h2 className="text-2xl mb-3">Vendor logs awaiting your sign-off</h2>
        <UnsignedLogList
          logs={data.unsignedLogs}
          placements={data.placements}
          onSign={refresh}
        />
      </section>

      {/* ④ Forensic & document inbox */}
      <section>
        <h2 className="text-2xl mb-3">
          Document inbox <span className="text-sm text-ink/50 font-normal">(routed to you)</span>
        </h2>
        <DocumentInbox
          routes={data.unackedRoutes}
          docs={data.docs}
          engagements={data.engagements}
          onAck={refresh}
        />
      </section>

      {/* ⑤ Authorization decisions queue */}
      <section>
        <h2 className="text-2xl mb-3">Authorization decisions queue</h2>
        <AuthQueue
          auths={data.pendingAuths}
          counselorEmail={user.email}
          onDecision={refresh}
        />
      </section>

      {/* ⑥ Activity feed */}
      <section>
        <h2 className="text-2xl mb-3">Recent activity across your caseload</h2>
        <ActivityList items={data.activity} />
      </section>

      <footer className="text-xs text-ink/55 border-t border-ink/10 pt-4">
        <p>
          PHI boundary: business and vendor recipients never see clinical
          screener results or full case notes — they receive routed
          deliverables (FCE, RTW, JD analysis, accommodation letters)
          plus the placement workspace scoped to each engagement.
        </p>
      </footer>
    </div>
  );
}

// ─── Subcomponents ──────────────────────────────────────────────────────

interface EmployerSummary {
  orgId: string;
  orgName: string;
  active: number;
  openAccommodations: number;
  placedAccommodations: number;
  placements: Placement[];
}

function summarizeEmployers(placements: Placement[]): EmployerSummary[] {
  const map = new Map<string, EmployerSummary>();
  for (const p of placements) {
    const cur = map.get(p.employerOrgId);
    if (cur) {
      cur.active += p.status === "active" ? 1 : 0;
      cur.openAccommodations += p.accommodationsOpen;
      cur.placedAccommodations += p.accommodationsInPlace;
      cur.placements.push(p);
    } else {
      map.set(p.employerOrgId, {
        orgId: p.employerOrgId,
        orgName: p.employerOrgName,
        active: p.status === "active" ? 1 : 0,
        openAccommodations: p.accommodationsOpen,
        placedAccommodations: p.accommodationsInPlace,
        placements: [p],
      });
    }
  }
  return Array.from(map.values());
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
      <div className="text-xs uppercase tracking-wider text-ink/50">
        {label}
      </div>
      <div className="text-3xl text-accent leading-none mt-1">{value}</div>
      <div className="text-xs text-ink/55 mt-1">{sub}</div>
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
        className={`text-lg font-semibold ${warn ? "text-accent" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-ink/20 rounded-lg p-6 text-center text-ink/55">
      {children}
    </div>
  );
}

function UnsignedLogList({
  logs,
  placements,
  onSign,
}: {
  logs: CoachingLogEntry[];
  placements: Placement[];
  onSign: () => void;
}) {
  if (logs.length === 0) {
    return <Empty>No coaching logs awaiting your sign-off.</Empty>;
  }

  function sign(logId: string) {
    const all = loadCoachingLogs();
    const target = all.find((l) => l.id === logId);
    if (!target) return;
    target.signedByCounselor = true;
    // saveCoachingLogs replaces; pass full list back
    const next = all.map((l) => (l.id === logId ? target : l));
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "pathways-pro:coaching-logs-v1",
        JSON.stringify(
          next.reduce<Record<string, CoachingLogEntry>>((acc, l) => {
            acc[l.id] = l;
            return acc;
          }, {}),
        ),
      );
    }
    onSign();
  }

  return (
    <div className="space-y-3">
      {logs.map((l) => {
        const p = placements.find((x) => x.id === l.placementId);
        return (
          <article
            key={l.id}
            className="border border-ink/15 rounded-lg p-4 bg-cream"
          >
            <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
              <h3 className="font-semibold">
                {p?.clientName ?? "Unknown client"}{" "}
                <span className="text-ink/55 font-normal text-sm">
                  · {p?.jobTitle}
                </span>
              </h3>
              <span className="text-xs text-ink/55">
                {new Date(l.occurredAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-ink/75">
              <strong>Intervention:</strong> {l.intervention}
            </p>
            <p className="text-sm text-ink/75">
              <strong>Outcome:</strong> {l.outcome}
            </p>
            <div className="flex items-center justify-between gap-2 mt-3 text-xs text-ink/60">
              <span>
                {l.encounterType} · {l.setting} · {l.durationMin} min ·
                vendor-signed {l.signedByVendor ? "✓" : "—"}
              </span>
              <button
                onClick={() => sign(l.id)}
                className="bg-accent text-cream px-3 py-1.5 rounded font-semibold text-xs hover:bg-accent/90"
              >
                Sign this entry
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function DocumentInbox({
  routes,
  docs,
  engagements,
  onAck,
}: {
  routes: DocumentRoute[];
  docs: VaultDocument[];
  engagements: ForensicEngagement[];
  onAck: () => void;
}) {
  if (routes.length === 0) {
    return <Empty>Nothing unacknowledged in your inbox.</Empty>;
  }

  function ack(routeId: string) {
    acknowledgeRoute(routeId);
    onAck();
  }

  return (
    <div className="space-y-3">
      {routes.map((r) => {
        const doc = docs.find((d) => d.id === r.documentId);
        if (!doc) return null;
        const eng = engagements.find((e) => e.id === doc.relatedEngagementId);
        return (
          <article
            key={r.id}
            className="border border-amber-300 bg-amber-50/40 rounded-lg p-4"
          >
            <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
              <h3 className="font-semibold">{doc.title}</h3>
              <span className="text-xs text-amber-900 font-semibold">
                ⚠ Awaiting your acknowledgment
              </span>
            </div>
            <div className="text-sm text-ink/75">
              {eng && (
                <p>
                  <strong>Matter:</strong> {eng.matterCaption} · Retained by{" "}
                  {eng.retainingOrgName} ({eng.retainingParty})
                </p>
              )}
              <p>
                Uploaded by {doc.uploadedByName} ·{" "}
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => ack(r.id)}
                className="bg-accent text-cream px-3 py-1.5 rounded font-semibold text-xs"
              >
                Acknowledge
              </button>
              <button
                disabled
                className="border border-ink/15 px-3 py-1.5 rounded text-xs text-ink/50"
                title="Document viewer not wired in demo"
              >
                View document
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function AuthQueue({
  auths,
  counselorEmail,
  onDecision,
}: {
  auths: ServiceAuthorization[];
  counselorEmail: string;
  onDecision: () => void;
}) {
  if (auths.length === 0) {
    return <Empty>No vendor authorizations pending your decision.</Empty>;
  }

  return (
    <div className="space-y-3">
      {auths.map((a) => (
        <article
          key={a.id}
          className="border border-ink/15 bg-cream rounded-lg p-4"
        >
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
            <h3 className="font-semibold">
              {a.serviceLabel}{" "}
              <span className="text-ink/55 font-normal text-sm">
                · {a.vendorOrgName}
              </span>
            </h3>
            <span className="text-xs text-ink/55">
              Requested {new Date(a.requestedAt).toLocaleDateString()}
            </span>
          </div>
          <div className="text-sm text-ink/75">
            <p>
              <strong>Case:</strong> {a.caseId} · {a.serviceCode}
            </p>
            <p>
              <strong>Units:</strong> {a.unitsAuthorized} @ ${a.rate.toFixed(2)} ·
              total ${(a.rate * a.unitsAuthorized).toFixed(2)}
            </p>
            <p className="text-xs text-ink/55 mt-1">
              Period: {a.startDate} → {a.endDate}
            </p>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => {
                decisionAuthorization(a.id, "approved", counselorEmail);
                onDecision();
              }}
              className="bg-accent text-cream px-3 py-1.5 rounded font-semibold text-xs"
            >
              Approve
            </button>
            <button
              onClick={() => {
                const reason = window.prompt("Reason for denial?");
                if (reason !== null) {
                  decisionAuthorization(a.id, "denied", counselorEmail, reason);
                  onDecision();
                }
              }}
              className="border border-ink/20 px-3 py-1.5 rounded text-xs hover:bg-ink/5"
            >
              Deny
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function ActivityList({ items }: { items: ActivityEntry[] }) {
  if (items.length === 0) {
    return <Empty>No recent business-side activity.</Empty>;
  }
  return (
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
              {a.actorRole ? ` · by ${a.actorRole}` : ""}
              {a.caseId ? ` · case ${a.caseId}` : ""}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
