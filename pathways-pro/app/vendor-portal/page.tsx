"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession, clearSession } from "@/lib/session";
import type { VendorUser } from "@/lib/users";
import {
  authorizationsByVendor,
  documentsForUser,
  documentsForOrg,
  getCurrentVendorOrg,
  loadActivity,
  loadCoachingLogs,
  loadEngagements,
  placementsByVendor,
  type ActivityEntry,
  type CoachingLogEntry,
  type ForensicEngagement,
  type Placement,
  type ServiceAuthorization,
  type VendorOrg,
  type DocumentForRecipient,
} from "@/lib/business-portal";
import { seedBusinessPortal } from "@/lib/business-portal-seed";
import { seedDemoAccounts } from "@/lib/demo-accounts-seed";

export default function VendorPortalPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);

  useEffect(() => {
    seedBusinessPortal();
    seedDemoAccounts();
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "vendor") {
      const dest =
        s.role === "business"
          ? "/business-portal"
          : s.role === "counselor"
            ? "/dashboard/business"
            : "/portal";
      return router.replace(dest);
    }
    setUser(s);
  }, [router]);

  const data = useMemo(() => {
    if (!user) return null;
    const org = getCurrentVendorOrg(user);
    const placements = placementsByVendor(user.vendorOrgId);
    const engagements = loadEngagements().filter(
      (e) => e.vendorOrgId === user.vendorOrgId,
    );
    const logs = loadCoachingLogs().filter((l) =>
      placements.some((p) => p.id === l.placementId),
    );
    const auths = authorizationsByVendor(user.vendorOrgId);
    const myDocs = documentsForUser(user.email);
    const orgDocs = documentsForOrg(user.vendorOrgId);
    const recentActivity = loadActivity()
      .filter((a) => {
        const p = a.payload as Record<string, unknown> | undefined;
        return (
          p?.["vendorOrgId"] === user.vendorOrgId ||
          a.actorEmail === user.email
        );
      })
      .slice(0, 20);
    return {
      org,
      placements,
      engagements,
      logs,
      auths,
      myDocs,
      orgDocs,
      recentActivity,
    };
  }, [user]);

  if (!user || !data) return null;

  function signOut() {
    clearSession();
    router.push("/business");
  }

  return (
    <div className="space-y-8">
      <Header user={user} org={data.org} onSignOut={signOut} />

      <section
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
        aria-label="Vendor portal summary"
      >
        <Stat
          label="Active engagements"
          value={String(
            data.placements.filter((p) => p.status === "active").length +
              data.engagements.filter((e) => e.status !== "closed").length,
          )}
          sub="placements + forensic"
        />
        <Stat
          label="Authorizations active"
          value={String(
            data.auths.filter((a) => a.status === "active").length,
          )}
          sub={`${data.auths.filter((a) => a.status === "requested").length} requested`}
        />
        <Stat
          label="Logs this week"
          value={String(logsThisWeek(data.logs))}
          sub="across placements"
        />
        <Stat
          label="Awaiting CRC sign-off"
          value={String(data.logs.filter((l) => !l.signedByCounselor).length)}
          sub="vendor-signed only"
        />
      </section>

      {user.vendorType === "forensic" && (
        <ForensicEngagementsBlock engagements={data.engagements} />
      )}

      {data.placements.length > 0 && (
        <PlacementEngagementsBlock
          placements={data.placements}
          logs={data.logs}
          auths={data.auths}
        />
      )}

      <AuthBlock auths={data.auths} />
      <DocumentsBlock docs={data.orgDocs.concat(data.myDocs)} />
      <ActivityBlock items={data.recentActivity} />

      <footer className="text-xs text-ink/55 border-t border-ink/10 pt-4">
        Your view is scoped to{" "}
        <strong>{data.org?.legalName ?? user.vendorOrgName}</strong>. Logs and
        deliverables you upload route automatically to the assigned counselor
        and (for engagements with a retaining business client) the paying
        organization.
      </footer>
    </div>
  );
}

function Header({
  user,
  org,
  onSignOut,
}: {
  user: VendorUser;
  org: VendorOrg | null;
  onSignOut: () => void;
}) {
  return (
    <header className="flex items-baseline justify-between gap-4 flex-wrap">
      <div>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          {vendorTypeLabel(user.vendorType)} · {org?.legalName ?? user.vendorOrgName}
        </p>
        <h1 className="text-4xl">
          Welcome, <span className="text-accent">{user.name.split(" ")[0]}</span>.
        </h1>
        <p className="text-sm text-ink/60 mt-1">
          {user.credentials}{" "}
          {org?.stateVendorId && (
            <span className="text-ink/50">· State vendor ID {org.stateVendorId}</span>
          )}
        </p>
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

function vendorTypeLabel(t: VendorUser["vendorType"]): string {
  return {
    crp: "Community Rehabilitation Provider",
    forensic: "Forensic Vocational Consultant",
    ergonomic: "Ergonomic / FCE Specialist",
    "legal-consult": "Legal-Consult Expert Witness",
    training: "Training Provider",
  }[t];
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

function logsThisWeek(logs: CoachingLogEntry[]): number {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return logs.filter((l) => Date.parse(l.occurredAt) >= cutoff).length;
}

function ForensicEngagementsBlock({
  engagements,
}: {
  engagements: ForensicEngagement[];
}) {
  return (
    <section>
      <h2 className="text-2xl mb-3">Forensic engagements</h2>
      {engagements.length === 0 ? (
        <Empty>No active engagements on your roster.</Empty>
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
                {e.kind.replaceAll("_", " ")} · retained by {e.retainingOrgName} (
                {e.retainingParty}) · {e.jurisdiction} · {e.venue}
              </div>
              <div className="text-sm text-ink/65 mt-1">
                Retained {e.retainedOn} · ${e.hourlyRate.toFixed(2)}/hr ·{" "}
                {e.hoursBilled.toFixed(1)} hrs billed
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function PlacementEngagementsBlock({
  placements,
  logs,
  auths,
}: {
  placements: Placement[];
  logs: CoachingLogEntry[];
  auths: ServiceAuthorization[];
}) {
  return (
    <section>
      <h2 className="text-2xl mb-3">Job-coaching engagements</h2>
      <div className="space-y-3">
        {placements.map((p) => {
          const pLogs = logs.filter((l) => l.placementId === p.id);
          const auth = auths.find(
            (a) => a.caseId === p.caseId && a.status === "active",
          );
          return (
            <article
              key={p.id}
              className="border border-ink/15 rounded-lg p-4 bg-cream"
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                <h3 className="font-semibold">
                  Case {p.caseId} · {initialOnly(p.clientName)}{" "}
                  <span className="text-ink/55 font-normal text-sm">
                    @ {p.employerOrgName}
                  </span>
                </h3>
                <span className="text-xs text-ink/55">
                  Day {p.dayCount} / 90
                </span>
              </div>
              <div className="text-sm text-ink/75">{p.jobTitle}</div>
              {auth && (
                <div className="mt-2 text-xs text-ink/65">
                  <strong>{auth.serviceLabel}</strong> · {auth.unitsUsed} /{" "}
                  {auth.unitsAuthorized} units used · ${auth.rate.toFixed(2)} /
                  unit
                </div>
              )}
              <div className="mt-2 text-xs text-ink/65">
                Logs: {pLogs.length} total ·{" "}
                {pLogs.filter((l) => !l.signedByCounselor).length} awaiting CRC
                sign-off
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AuthBlock({ auths }: { auths: ServiceAuthorization[] }) {
  if (auths.length === 0) return null;
  return (
    <section>
      <h2 className="text-2xl mb-3">Service authorizations</h2>
      <div className="space-y-2">
        {auths.map((a) => (
          <article
            key={a.id}
            className="border border-ink/15 rounded-lg p-4 bg-cream"
          >
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <h3 className="font-semibold">
                {a.serviceLabel}{" "}
                <span className="text-ink/55 font-normal text-sm">
                  · Case {a.caseId}
                </span>
              </h3>
              <span
                className={`text-xs uppercase tracking-wider font-semibold ${
                  a.status === "active"
                    ? "text-emerald-700"
                    : a.status === "requested"
                      ? "text-amber-700"
                      : "text-ink/55"
                }`}
              >
                {a.status}
              </span>
            </div>
            <div className="text-sm text-ink/65 mt-1">
              {a.unitsUsed} / {a.unitsAuthorized} units used · $
              {a.rate.toFixed(2)} / unit · {a.startDate} → {a.endDate}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function DocumentsBlock({ docs }: { docs: DocumentForRecipient[] }) {
  if (docs.length === 0) return null;
  return (
    <section>
      <h2 className="text-2xl mb-3">Vault</h2>
      <div className="space-y-2">
        {docs.map(({ doc, route }) => (
          <article
            key={route.id}
            className="border border-ink/15 rounded-lg p-3 bg-cream flex items-baseline justify-between gap-3 flex-wrap"
          >
            <div>
              <div className="font-semibold text-sm">{doc.title}</div>
              <div className="text-xs text-ink/55">
                {doc.kind} · uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
              </div>
            </div>
            <span className="text-xs text-ink/55">{route.accessKind}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function ActivityBlock({ items }: { items: ActivityEntry[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="text-2xl mb-3">Activity feed</h2>
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
