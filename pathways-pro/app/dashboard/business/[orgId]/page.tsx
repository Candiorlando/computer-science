"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { getAllBusinessUsers } from "@/lib/users";
import {
  documentsForOrg,
  loadActivity,
  loadEngagements,
  placementsByEmployer,
  type ActivityEntry,
  type ForensicEngagement,
  type Placement,
  type DocumentForRecipient,
  loadBusinessOrgs,
  type BusinessOrg,
} from "@/lib/business-portal";
import { loadServiceRequests, type ServiceRequest } from "@/lib/service-requests";
import { notesForBusinessOrg } from "@/lib/case-notes";
import { CaseNotesPanel } from "@/components/CaseNotesPanel";
import { CaseAssessmentsPanel } from "@/components/CaseAssessmentsPanel";
import { threadsForUser, type MessageThread } from "@/lib/messages";
import { recordCaseOpen } from "@/lib/recent-cases";

type Tab = "overview" | "documents" | "case-notes" | "messages" | "timeline" | "assessments";

export default function CounselorBusinessCaseFile() {
  const router = useRouter();
  const params = useParams();
  const orgId = String(params.orgId);
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
    recordCaseOpen(s.email, orgId);
  }, [router, orgId]);

  const data = useMemo(() => {
    if (!user) return null;
    const org = loadBusinessOrgs()[orgId];
    if (!org) return null;
    const primary = Object.values(getAllBusinessUsers()).find(
      (u) => u.orgId === orgId,
    );
    const placements = placementsByEmployer(orgId);
    const engagements = loadEngagements().filter(
      (e) => e.retainingOrgId === orgId,
    );
    const docs = documentsForOrg(orgId);
    const requests = loadServiceRequests().filter(
      (r) => r.requesterOrgId === orgId,
    );
    const notes = notesForBusinessOrg(orgId);
    const orgEmails = Object.values(getAllBusinessUsers())
      .filter((u) => u.orgId === orgId)
      .map((u) => u.email);
    const threads = threadsForUser(user.email).filter((t) =>
      t.participants.some((p) => orgEmails.includes(p.email)),
    );
    const activity = loadActivity().filter((a) => {
      const p = a.payload as Record<string, unknown> | undefined;
      return (
        p?.["employerOrgId"] === orgId ||
        p?.["retainingOrgId"] === orgId
      );
    });
    return {
      org,
      primary,
      placements,
      engagements,
      docs,
      requests,
      notes,
      threads,
      activity,
    };
  }, [user, orgId, bump]);

  if (!user) return null;
  if (!data) {
    return (
      <div className="space-y-3">
        <Link
          href="/dashboard/business"
          className="text-xs text-emerald-700 hover:underline"
        >
          ← Business Clients
        </Link>
        <h1 className="text-2xl">Business not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/dashboard/business"
          className="text-xs text-emerald-700 hover:underline mb-1 inline-block"
        >
          ← Business Clients
        </Link>
        <div className="flex items-baseline justify-between gap-3 flex-wrap mt-1">
          <h1 className="text-3xl font-semibold">{data.org.legalName}</h1>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
            Business · {data.org.status}
          </span>
        </div>
        <p className="text-ink/65 text-sm mt-1">
          {data.org.industry} · {data.org.hqCity}, {data.org.hqState}{" "}
          {data.org.hqZip} · {data.org.size} employees
          {data.org.primaryContact && (
            <span className="block mt-1 text-ink/55">
              Contact: {data.org.primaryContact}
            </span>
          )}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/dashboard/business/${orgId}/request-service`}
            className="grad-tealblue text-white text-sm font-semibold px-4 py-2 rounded-md"
          >
            📦 Request service for this business
          </Link>
          <Link
            href={`/dashboard/service-orders?org=${orgId}`}
            className="text-sm border border-ink/15 px-4 py-2 rounded-md hover:bg-ink/5 font-semibold"
          >
            View all orders ({data.requests.length})
          </Link>
        </div>
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
          org={data.org}
          placements={data.placements}
          engagements={data.engagements}
          requests={data.requests}
        />
      )}
      {tab === "documents" && <DocumentsTab docs={data.docs} />}
      {tab === "case-notes" && (
        <CaseNotesPanel
          notes={data.notes}
          title=""
          emptyLabel="No case notes for this business yet."
          scope={{
            kind: "business",
            orgId,
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
          scopeKind="business-org"
          scopeId={orgId}
          audience="counselor"
          counselorEmail={user.email}
          launchRoute={(toolId) => `/dashboard/business/${orgId}/assessment/${toolId}`}
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
  org,
  placements,
  engagements,
  requests,
}: {
  org: BusinessOrg;
  placements: Placement[];
  engagements: ForensicEngagement[];
  requests: ServiceRequest[];
}) {
  const activePlacements = placements.filter((p) => p.status === "active");
  const pendingRequests = requests.filter(
    (r) => r.status === "pending-counselor-review",
  );
  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Active placements" value={activePlacements.length} />
        <Stat label="Service requests" value={requests.length} />
        <Stat
          label="Pending review"
          value={pendingRequests.length}
          alert={pendingRequests.length > 0}
        />
        <Stat label="Forensic engagements" value={engagements.length} />
      </section>

      {activePlacements.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Active placements</h2>
          <ul role="list" className="space-y-2">
            {activePlacements.map((p) => (
              <li key={p.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold">
                    {p.clientName}
                    <span className="text-ink/55 font-normal text-sm">
                      {" "}
                      · {p.jobTitle}
                    </span>
                  </h3>
                  <span className="text-xs text-ink/65">
                    Day {p.dayCount} / 90
                  </span>
                </div>
                <p className="text-xs text-ink/65 mt-1">
                  Case {p.caseId} · ${p.hourlyWage.toFixed(2)}/hr ·{" "}
                  {p.weeklyHours} hrs/wk · hired {p.hireDate}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {engagements.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-2">Forensic engagements</h2>
          <ul role="list" className="space-y-2">
            {engagements.map((e) => (
              <li key={e.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold">{e.matterCaption}</h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
                    {e.status}
                  </span>
                </div>
                <p className="text-xs text-ink/65 mt-1">
                  {e.kind.replaceAll("_", " ")} · {e.jurisdiction} ·{" "}
                  Retained {e.retainedOn}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-2">Service requests</h2>
        {requests.length === 0 ? (
          <div className="border border-dashed border-ink/20 rounded-lg p-4 text-center text-ink/55 text-sm italic">
            No service requests from {org.legalName} yet.
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {requests.map((r) => (
              <li key={r.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold">{r.serviceTitle}</h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-900">
                    {r.status.replaceAll("-", " ")}
                  </span>
                </div>
                <p className="text-xs text-ink/65 mt-1">
                  Requested {new Date(r.requestedAt).toLocaleDateString()}
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
        No documents in this business&apos;s vault.
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
            {route.acknowledgedAt && (
              <span className="text-emerald-700">
                {" "}
                · ✓ acknowledged{" "}
                {new Date(route.acknowledgedAt).toLocaleDateString()}
              </span>
            )}
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
        No conversations with this business yet.
      </div>
    );
  }
  return (
    <ul role="list" className="space-y-2">
      {threads.map((t) => (
        <li key={t.id} className="saas-card">
          <Link
            href={`/messages?thread=${t.id}`}
            className="hover:no-underline"
          >
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
        No timeline events for this business yet.
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

function Stat({
  label,
  value,
  alert,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div
      className={`saas-card ${alert && value > 0 ? "border-amber-300 bg-amber-50/40" : ""}`}
    >
      <div className="text-[10px] uppercase tracking-wider text-ink/55">
        {label}
      </div>
      <div
        className={`text-2xl font-bold mt-1 ${alert && value > 0 ? "text-amber-700" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}
