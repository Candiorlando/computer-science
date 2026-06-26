"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { getAllPartnerUsers } from "@/lib/users";
import {
  ceForPartner,
  inquiriesForPartner,
  loadPartnerOrgs,
  opportunitiesForPartner,
  placementsForPartner,
  type AccommodationInquiry,
  type CustomizedEmploymentEngagement,
  type Opportunity,
  type PartnerOrg,
  type PartnerPlacement,
} from "@/lib/employment-partners";
import {
  documentsForOrg,
  loadActivity,
  type ActivityEntry,
  type DocumentForRecipient,
} from "@/lib/business-portal";
import {
  loadServiceRequests,
  type ServiceRequest,
} from "@/lib/service-requests";
import { notesForPartnerOrg } from "@/lib/case-notes";
import { CaseNotesPanel } from "@/components/CaseNotesPanel";
import { CaseAssessmentsPanel } from "@/components/CaseAssessmentsPanel";
import { threadsForUser, type MessageThread } from "@/lib/messages";
import { seedPartnerDemo } from "@/lib/partner-seed";
import { recordCaseOpen } from "@/lib/recent-cases";

type Tab =
  | "overview"
  | "documents"
  | "case-notes"
  | "messages"
  | "timeline"
  | "assessments";

export default function CounselorPartnerCaseFile() {
  const router = useRouter();
  const params = useParams();
  const partnerId = String(params.id);
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    seedPartnerDemo();
    setUser(s);
    recordCaseOpen(s.email, partnerId);
  }, [router, partnerId]);

  const data = useMemo(() => {
    if (!user) return null;
    const org = loadPartnerOrgs()[partnerId];
    if (!org) return null;
    const partnerEmails = Object.values(getAllPartnerUsers())
      .filter((u) => u.partnerOrgId === partnerId)
      .map((u) => u.email);
    return {
      org,
      opps: opportunitiesForPartner(partnerId),
      places: placementsForPartner(partnerId),
      ce: ceForPartner(partnerId),
      inquiries: inquiriesForPartner(partnerId),
      notes: notesForPartnerOrg(partnerId),
      docs: documentsForOrg(partnerId),
      requests: loadServiceRequests().filter(
        (r) => r.requesterOrgId === partnerId,
      ),
      threads: threadsForUser(user.email).filter((t) =>
        t.participants.some((p) => partnerEmails.includes(p.email)),
      ),
      activity: loadActivity().filter((a) => {
        const p = a.payload as Record<string, unknown> | undefined;
        return (
          p?.["partnerOrgId"] === partnerId ||
          p?.["retainingOrgId"] === partnerId
        );
      }),
    };
  }, [partnerId, user, bump]);

  if (!user) return null;
  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl">Partner not found</h1>
        <Link
          href="/dashboard/partners"
          className="text-cyan-700 hover:underline"
        >
          ← Back to Employment Partners
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/dashboard/partners"
          className="text-xs text-cyan-700 hover:underline mb-1 inline-block"
        >
          ← All Employment Partners
        </Link>
        <div className="flex items-baseline justify-between gap-3 flex-wrap mt-1">
          <h1 className="text-3xl font-semibold">{data.org.legalName}</h1>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-cyan-100 text-cyan-900">
            Employment Partner
          </span>
        </div>
        <p className="text-ink/65 text-sm mt-1">
          {data.org.industry} · {data.org.hqCity}, {data.org.hqState}{" "}
          {data.org.hqZip} · {data.org.primaryContact}
        </p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {data.org.participatesInCustomizedEmployment && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-cyan-100 text-cyan-900">
              🎯 Customized Employment
            </span>
          )}
          {data.org.participatesInSupportedEmployment && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
              🤝 Supported Employment
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-ink/10 pb-2">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>
          Overview
        </TabBtn>
        <TabBtn active={tab === "documents"} onClick={() => setTab("documents")}>
          Documents
        </TabBtn>
        <TabBtn
          active={tab === "case-notes"}
          onClick={() => setTab("case-notes")}
        >
          Case Notes
        </TabBtn>
        <TabBtn active={tab === "messages"} onClick={() => setTab("messages")}>
          Messages
        </TabBtn>
        <TabBtn active={tab === "timeline"} onClick={() => setTab("timeline")}>
          Activity Timeline
        </TabBtn>
        <TabBtn
          active={tab === "assessments"}
          onClick={() => setTab("assessments")}
        >
          Assessments
        </TabBtn>
      </div>

      {tab === "overview" && (
        <OverviewTab
          org={data.org}
          opps={data.opps}
          places={data.places}
          ce={data.ce}
          inquiries={data.inquiries}
          requests={data.requests}
        />
      )}
      {tab === "documents" && <DocumentsTab docs={data.docs} />}
      {tab === "case-notes" && (
        <CaseNotesPanel
          notes={data.notes}
          title=""
          emptyLabel="No case notes yet for this partner."
          scope={{
            kind: "partner",
            orgId: partnerId,
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
          scopeKind="partner-org"
          scopeId={partnerId}
          audience="counselor"
          counselorEmail={user.email}
          launchRoute={(toolId) =>
            `/dashboard/partners/${partnerId}/assessment/${toolId}`
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
  org,
  opps,
  places,
  ce,
  inquiries,
  requests,
}: {
  org: PartnerOrg;
  opps: Opportunity[];
  places: PartnerPlacement[];
  ce: CustomizedEmploymentEngagement[];
  inquiries: AccommodationInquiry[];
  requests: ServiceRequest[];
}) {
  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Opportunities" value={opps.length} />
        <Stat label="Placements" value={places.length} />
        <Stat label="CE engagements" value={ce.length} />
        <Stat
          label="Open inquiries"
          value={inquiries.filter((i) => i.status === "pending").length}
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Service requests</h2>
        {requests.length === 0 ? (
          <Empty text="No service requests from this partner." />
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
                  {r.sentToClientAt &&
                    ` · Delivered ${new Date(r.sentToClientAt).toLocaleDateString()}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Opportunities</h2>
        {opps.length === 0 ? (
          <Empty text="No opportunities posted." />
        ) : (
          <ul role="list" className="space-y-2">
            {opps.map((o) => (
              <li key={o.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold">{o.title}</h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
                    {o.kind.replaceAll("-", " ")}
                  </span>
                </div>
                <p className="text-sm text-ink/75 mt-1">{o.description}</p>
                <p className="text-xs text-ink/55 mt-2">
                  {o.hoursPerWeek} hrs/wk · {o.wage ?? "—"} · {o.location} ·{" "}
                  {o.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {org.participatesInCustomizedEmployment && (
        <section>
          <h2 className="text-lg font-semibold mb-2">
            🎯 Customized Employment engagements
          </h2>
          {ce.length === 0 ? (
            <Empty text="No Customized Employment engagements yet." />
          ) : (
            <ul role="list" className="space-y-2">
              {ce.map((e) => (
                <li key={e.id} className="saas-card">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                    <h3 className="font-semibold">
                      {e.clientName ?? "Unassigned"}
                      {e.proposedTitle && (
                        <span className="text-ink/55 font-normal">
                          {" · "}
                          {e.proposedTitle}
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-cyan-100 text-cyan-900">
                      {e.currentStage.replaceAll("-", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-ink/65">
                    {e.caseId ? `Case ${e.caseId} · ` : ""}Updated{" "}
                    {new Date(e.updatedAt).toLocaleDateString()}
                  </p>
                  {e.carvedTasks.length > 0 && (
                    <p className="text-sm text-ink/75 mt-2">
                      <strong>Carved tasks:</strong>{" "}
                      {e.carvedTasks.join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-2">Placements</h2>
        {places.length === 0 ? (
          <Empty text="No placements yet." />
        ) : (
          <ul role="list" className="space-y-2">
            {places.map((p) => (
              <li key={p.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold">
                    {p.clientName}
                    <span className="text-ink/55 font-normal text-sm">
                      {" "}
                      · {p.opportunityTitle}
                    </span>
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-ink/65 mt-1">
                  Case {p.caseId} · {p.hoursPerWeek} hrs/wk · started{" "}
                  {p.hireDate}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Accommodation inquiries</h2>
        {inquiries.length === 0 ? (
          <Empty text="No inquiries yet." />
        ) : (
          <ul role="list" className="space-y-2">
            {inquiries.map((i) => (
              <li key={i.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                  <h3 className="font-semibold">{i.jobTitle}</h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-900">
                    {i.status}
                  </span>
                </div>
                <p className="text-sm text-ink/75 italic">
                  &ldquo;{i.question}&rdquo;
                </p>
                <p className="text-xs text-ink/55 mt-1">
                  Submitted {new Date(i.createdAt).toLocaleString()}
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
        No documents in this partner&apos;s vault.
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
        No conversations with this partner yet.
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
        No timeline events for this partner yet.
      </div>
    );
  }
  return (
    <ol role="list" className="space-y-2">
      {activity.slice(0, 30).map((a) => (
        <li
          key={a.id}
          className="flex items-start gap-3 border-l-2 border-cyan-300 pl-3 py-1"
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

function Stat({ label, value }: { label: string; value: number }) {
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
