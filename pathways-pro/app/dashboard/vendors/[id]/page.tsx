"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { getAllVendorUsers } from "@/lib/users";
import {
  authorizationsByVendor,
  documentsForOrg,
  loadActivity,
  loadCoachingLogs,
  loadVendorOrgs,
  placementsByVendor,
  type ActivityEntry,
  type DocumentForRecipient,
  type Placement,
  type ServiceAuthorization,
  type CoachingLogEntry,
} from "@/lib/business-portal";
import {
  loadServiceRequests,
  type ServiceRequest,
} from "@/lib/service-requests";
import { notesForBusinessOrg } from "@/lib/case-notes";
import { CaseNotesPanel } from "@/components/CaseNotesPanel";
import { CaseAssessmentsPanel } from "@/components/CaseAssessmentsPanel";
import { threadsForUser, type MessageThread } from "@/lib/messages";
import { recordCaseOpen } from "@/lib/recent-cases";

type Tab =
  | "overview"
  | "documents"
  | "case-notes"
  | "messages"
  | "timeline"
  | "assessments";

export default function CounselorVendorCaseFile() {
  const router = useRouter();
  const params = useParams();
  const vendorId = String(params.id);
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
    recordCaseOpen(s.email, vendorId);
  }, [router, vendorId]);

  const data = useMemo(() => {
    if (!user) return null;
    const org = loadVendorOrgs()[vendorId];
    if (!org) return null;
    const primary = Object.values(getAllVendorUsers()).find(
      (u) => u.vendorOrgId === vendorId,
    );
    const auths = authorizationsByVendor(vendorId);
    const placements = placementsByVendor(vendorId);
    const logs = loadCoachingLogs().filter((l) => l.vendorOrgId === vendorId);
    const requests = loadServiceRequests().filter(
      (r) => r.requesterOrgId === vendorId,
    );
    const notes = notesForBusinessOrg(vendorId);
    const docs = documentsForOrg(vendorId);
    const vendorEmails = Object.values(getAllVendorUsers())
      .filter((u) => u.vendorOrgId === vendorId)
      .map((u) => u.email);
    const threads = threadsForUser(user.email).filter((t) =>
      t.participants.some((p) => vendorEmails.includes(p.email)),
    );
    const activity = loadActivity().filter((a) => {
      const p = a.payload as Record<string, unknown> | undefined;
      return (
        p?.["vendorOrgId"] === vendorId ||
        p?.["retainingOrgId"] === vendorId
      );
    });
    return {
      org,
      primary,
      auths,
      placements,
      logs,
      requests,
      notes,
      docs,
      threads,
      activity,
    };
  }, [vendorId, user, bump]);

  if (!user) return null;
  if (!data) {
    return (
      <div className="space-y-3">
        <Link
          href="/dashboard/vendors"
          className="text-xs text-emerald-700 hover:underline"
        >
          ← Vendors
        </Link>
        <h1 className="text-2xl">Vendor not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/dashboard/vendors"
          className="text-xs text-emerald-700 hover:underline mb-1 inline-block"
        >
          ← All vendors
        </Link>
        <div className="flex items-baseline justify-between gap-3 flex-wrap mt-1">
          <h1 className="text-3xl font-semibold">{data.org.legalName}</h1>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-900">
            Vendor · {data.org.status}
          </span>
        </div>
        <p className="text-ink/65 text-sm mt-1">
          {data.primary?.name} · {data.primary?.credentials}
          {data.org.stateVendorId && (
            <span className="text-ink/55">
              {" "}
              · State ID {data.org.stateVendorId}
            </span>
          )}
        </p>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-ink/10 pb-2">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>
          Overview
        </TabBtn>
        <TabBtn active={tab === "documents"} onClick={() => setTab("documents")}>
          Documents
        </TabBtn>
        <TabBtn active={tab === "case-notes"} onClick={() => setTab("case-notes")}>
          Case Notes
        </TabBtn>
        <TabBtn active={tab === "messages"} onClick={() => setTab("messages")}>
          Messages
        </TabBtn>
        <TabBtn active={tab === "timeline"} onClick={() => setTab("timeline")}>
          Activity Timeline
        </TabBtn>
        <TabBtn active={tab === "assessments"} onClick={() => setTab("assessments")}>
          Assessments
        </TabBtn>
      </div>

      {tab === "overview" && (
        <OverviewTab
          auths={data.auths}
          placements={data.placements}
          logs={data.logs}
          requests={data.requests}
        />
      )}
      {tab === "documents" && <DocumentsTab docs={data.docs} />}
      {tab === "case-notes" && (
        <CaseNotesPanel
          notes={data.notes}
          title=""
          emptyLabel="No case notes for this vendor yet."
          scope={{
            kind: "vendor",
            orgId: vendorId,
            orgName: data.org.legalName,
          }}
          counselorEmail={user.email}
          onAdded={() => setBump((n) => n + 1)}
        />
      )}
      {tab === "messages" && <MessagesTab threads={data.threads} />}
      {tab === "timeline" && <TimelineTab activity={data.activity} />}
      {tab === "assessments" && (
        <CaseAssessmentsPanel
          scopeKind="vendor-org"
          scopeId={vendorId}
          audience="counselor"
          counselorEmail={user.email}
          launchRoute={(toolId) =>
            `/dashboard/vendors/${vendorId}/assessment/${toolId}`
          }
        />
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`text-sm px-3 py-1.5 rounded-md font-semibold ${
        active ? "grad-tealblue text-white" : "text-ink/65 hover:bg-ink/5"
      }`}
    >
      {children}
    </button>
  );
}

function OverviewTab({
  auths,
  placements,
  logs,
  requests,
}: {
  auths: ServiceAuthorization[];
  placements: Placement[];
  logs: CoachingLogEntry[];
  requests: ServiceRequest[];
}) {
  const responseRate = computeResponseRate(requests);
  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Authorizations" value={auths.length} />
        <Stat label="Placements" value={placements.length} />
        <Stat label="Coaching logs" value={logs.length} />
        <Stat
          label="Response rate"
          value={`${(responseRate * 100).toFixed(0)}%`}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Active authorizations</h2>
        {auths.length === 0 ? (
          <Empty text="No service authorizations on file." />
        ) : (
          <ul role="list" className="space-y-2">
            {auths.map((a) => (
              <li key={a.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold">{a.serviceLabel}</h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
                    {a.status}
                  </span>
                </div>
                <p className="text-xs text-ink/65 mt-1">
                  Case {a.caseId} · {a.unitsUsed} / {a.unitsAuthorized} units
                  used · ${a.rate.toFixed(2)}/unit
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Service deliverables</h2>
        {requests.length === 0 ? (
          <Empty text="No service requests from this vendor." />
        ) : (
          <ul role="list" className="space-y-2">
            {requests.map((r) => (
              <li key={r.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold">{r.serviceTitle}</h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
                    {r.status.replaceAll("-", " ")}
                  </span>
                </div>
                <p className="text-xs text-ink/65 mt-1">
                  Requested {new Date(r.requestedAt).toLocaleDateString()}
                  {r.releasedAt &&
                    ` · Released ${new Date(r.releasedAt).toLocaleDateString()}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function DocumentsTab({ docs }: { docs: DocumentForRecipient[] }) {
  if (docs.length === 0) {
    return (
      <div className="saas-card text-center text-ink/55 italic">
        No documents in this vendor&apos;s vault.
      </div>
    );
  }
  return (
    <ul role="list" className="space-y-2">
      {docs.map(({ doc, route }) => (
        <li key={route.id} className="saas-card">
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
            <h3 className="font-semibold">{doc.title}</h3>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-ink/5 text-ink/65">
              {doc.kind}
            </span>
          </div>
          <p className="text-xs text-ink/65">
            Uploaded by {doc.uploadedByName} ·{" "}
            {new Date(doc.uploadedAt).toLocaleDateString()} ·{" "}
            {Math.round(doc.sizeBytes / 1024)} KB · access: {route.accessKind}
          </p>
        </li>
      ))}
    </ul>
  );
}

function MessagesTab({ threads }: { threads: MessageThread[] }) {
  if (threads.length === 0) {
    return (
      <div className="saas-card text-center text-ink/55 italic">
        No conversations with this vendor yet.
      </div>
    );
  }
  return (
    <ul role="list" className="space-y-2">
      {threads.map((t) => (
        <li key={t.id} className="saas-card">
          <Link href={`/messages?thread=${t.id}`} className="hover:no-underline">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <h3 className="font-semibold">{t.subject}</h3>
              <span className="text-xs text-ink/55">
                {new Date(t.lastMessageAt).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-ink/65 mt-1 truncate">
              {t.lastMessagePreview}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function TimelineTab({ activity }: { activity: ActivityEntry[] }) {
  if (activity.length === 0) {
    return (
      <div className="saas-card text-center text-ink/55 italic">
        No timeline events for this vendor yet.
      </div>
    );
  }
  return (
    <ol role="list" className="space-y-2">
      {activity.slice(0, 30).map((a) => (
        <li
          key={a.id}
          className="flex items-start gap-3 border-l-2 border-emerald-300 pl-3 py-1"
        >
          <time
            dateTime={a.occurredAt}
            className="text-xs text-ink/55 w-36 shrink-0"
          >
            {new Date(a.occurredAt).toLocaleString()}
          </time>
          <div className="text-sm">
            <div className="font-semibold">{a.summary}</div>
            <div className="text-[11px] text-ink/55">
              {a.kind.replaceAll("_", " ")}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}

function computeResponseRate(requests: ServiceRequest[]): number {
  if (requests.length === 0) return 1;
  const responded = requests.filter(
    (r) => r.status === "delivered" || r.status === "declined",
  ).length;
  return responded / requests.length;
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="saas-card">
      <div className="text-[10px] uppercase tracking-wider text-ink/55">
        {label}
      </div>
      <div className="text-2xl font-bold mt-1 text-ink">{value}</div>
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
