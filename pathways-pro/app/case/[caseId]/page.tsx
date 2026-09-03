"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { CLIENTS } from "@/lib/users";
import { loadCaseNotes, notesForClient } from "@/lib/case-notes";
import { CaseNotesPanel } from "@/components/CaseNotesPanel";
import {
  documentsForCase,
  CASE_DOCUMENT_KIND_LABELS,
} from "@/lib/case-documents";
import { loadIPE } from "@/lib/ipe";
import { threadsForUser } from "@/lib/messages";
import { buildProgress } from "@/lib/positive-psychology";
import { recordCaseOpen } from "@/lib/recent-cases";
import { CaseAssessmentsPanel } from "@/components/CaseAssessmentsPanel";

type Tab =
  | "overview"
  | "documents"
  | "case-notes"
  | "messages"
  | "timeline"
  | "ipe"
  | "assessments"
  | "progress";

const VALID_TABS: Tab[] = [
  "overview",
  "documents",
  "case-notes",
  "messages",
  "timeline",
  "ipe",
  "assessments",
  "progress",
];

export default function CaseFilePage() {
  return (
    <Suspense fallback={null}>
      <CaseFileInner />
    </Suspense>
  );
}

function CaseFileInner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const caseId = String(params.caseId);
  const [user, setUser] = useState<CounselorUser | null>(null);
  // ?tab= deep links (e.g. a Documents-tab entry pointing back at the
  // Assessments tab) land on the right tab directly.
  const [tab, setTab] = useState<Tab>(() => {
    const t = searchParams.get("tab") as Tab | null;
    return t && VALID_TABS.includes(t) ? t : "overview";
  });

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
    recordCaseOpen(s.email, caseId);
  }, [router, caseId]);

  const client = useMemo(
    () => Object.values(CLIENTS).find((c) => c.caseId === caseId),
    [caseId],
  );

  if (!user) return null;
  if (!client) {
    return (
      <div className="space-y-3">
        <Link
          href="/caseload"
          className="text-xs text-emerald-700 hover:underline"
        >
          ← Caseload
        </Link>
        <h1 className="text-2xl">Case not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/caseload"
          className="text-xs text-emerald-700 hover:underline mb-1 inline-block"
        >
          ← Caseload
        </Link>
        <div className="flex items-baseline justify-between gap-3 flex-wrap mt-1">
          <h1 className="text-3xl font-semibold">{client.name}</h1>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
            {client.status}
          </span>
        </div>
        <p className="text-ink/65 text-sm mt-1">
          <span className="font-mono">{client.caseId}</span> · DOB {client.dob} ·
          Goal: <strong>{client.goal}</strong>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href={`/case/${caseId}/assign-service`}
            className="grad-tealblue text-white text-sm font-semibold px-4 py-2 rounded-md"
          >
            🤝 Assign service to client
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
        <TabBtn active={tab === "ipe"} onClick={() => setTab("ipe")}>
          IPE
        </TabBtn>
        <TabBtn active={tab === "assessments"} onClick={() => setTab("assessments")}>
          Assessments
        </TabBtn>
        <TabBtn active={tab === "progress"} onClick={() => setTab("progress")}>
          Progress
        </TabBtn>
      </div>

      {tab === "overview" && <OverviewTab caseId={caseId} client={client} />}
      {tab === "documents" && <DocumentsTab caseId={caseId} />}
      {tab === "case-notes" && (
        <CaseNotesTab
          caseId={caseId}
          clientName={client.name}
          counselorEmail={user.email}
        />
      )}
      {tab === "messages" && (
        <MessagesTab userEmail={user.email} clientEmail={client.email} />
      )}
      {tab === "timeline" && <TimelineTab caseId={caseId} />}
      {tab === "ipe" && <IpeTab caseId={caseId} />}
      {tab === "assessments" && (
        <CaseAssessmentsPanel
          scopeKind="client-case"
          scopeId={caseId}
          audience="counselor"
          counselorEmail={user.email}
          counselorName={user.name}
          launchRoute={(toolId) => `/case/${caseId}/assessment/${toolId}`}
        />
      )}
      {tab === "progress" && <ProgressTab caseId={caseId} client={client} />}
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
        active
          ? "grad-tealblue text-white"
          : "text-ink/65 hover:bg-ink/5"
      }`}
    >
      {children}
    </button>
  );
}

function OverviewTab({
  caseId,
  client,
}: {
  caseId: string;
  client: { name: string; goal: string; progress: number; counselorName: string; nextAppt: string; email: string };
}) {
  const progress = buildProgress(caseId);
  return (
    <div className="space-y-4">
      <section className="saas-card grad-tealblue-soft">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-emerald-700 mb-2">
          🎯 Employment goal
        </h2>
        <p className="text-xl font-semibold">{client.goal}</p>
        <div className="mt-3">
          <div className="flex items-baseline justify-between text-xs mb-1">
            <span className="text-ink/65">Progress</span>
            <span className="font-semibold">{client.progress}%</span>
          </div>
          <div className="h-3 bg-ink/10 rounded-full overflow-hidden">
            <div
              className="h-full grad-tealblue"
              style={{ width: `${client.progress}%` }}
            />
          </div>
        </div>
      </section>

      <div className="grid sm:grid-cols-2 gap-3">
        <KV label="Assigned counselor" value={client.counselorName} />
        <KV label="Next appointment" value={client.nextAppt} />
        <KV label="Client email" value={client.email} />
        <KV label="Total actions logged" value={String(progress.totalActions)} />
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Self-advocacy actions" value={progress.selfAdvocacyActions} />
        <Stat label="Documents generated" value={progress.jobApplicationsSubmitted} />
        <Stat label="Assessments" value={progress.counselingParticipation} />
        <Stat label="Employment milestones" value={progress.employmentMilestones} />
      </section>
    </div>
  );
}

function DocumentsTab({ caseId }: { caseId: string }) {
  const docs = documentsForCase(caseId);

  if (docs.length === 0) {
    return (
      <div className="saas-card text-center text-ink/55 italic">
        No documents generated for this case yet. Anything produced for
        this client — completed assessments, the signed IPE, letters,
        reports, complaints, business plans — files here automatically.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-ink/55">
        {docs.length} document{docs.length === 1 ? "" : "s"} on file —
        every deliverable generated for this client, newest first.
      </p>
      <ol role="list" className="space-y-2">
        {docs.map((d) => (
          <li key={d.id} className="saas-card">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                  {CASE_DOCUMENT_KIND_LABELS[d.kind]}
                </span>
                <h3 className="font-semibold mt-1.5">{d.title}</h3>
                <p className="text-xs text-ink/55 mt-0.5">
                  {new Date(d.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                  {d.createdByName && <> · by {d.createdByName}</>}
                  {d.status && (
                    <>
                      {" · "}
                      <span
                        className={
                          d.status === "Approved" || d.status === "Signed"
                            ? "text-emerald-400 font-semibold"
                            : "text-amber-300 font-semibold"
                        }
                      >
                        {d.status}
                      </span>
                    </>
                  )}
                </p>
              </div>
              {d.href && (
                <Link
                  href={d.href}
                  className="text-xs text-emerald-700 hover:underline shrink-0 py-2"
                >
                  Open →
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function IpeTab({ caseId }: { caseId: string }) {
  const [bump, setBump] = useState(0);
  const ipe = useMemo(() => loadIPE(caseId), [caseId, bump]);

  const statusMeta = (() => {
    if (!ipe)
      return { label: "Not started", cls: "bg-ink/10 text-ink/60" };
    if (ipe.status === "draft")
      return { label: "Draft", cls: "bg-amber-500/15 text-amber-300" };
    if (ipe.status === "pending-client-signature")
      return {
        label: "Awaiting client signature",
        cls: "bg-amber-500/15 text-amber-300",
      };
    return { label: "Signed", cls: "bg-emerald-500/15 text-emerald-300" };
  })();

  return (
    <div className="space-y-4">
      <section className="saas-card">
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-lg font-semibold">
              Individualized Plan for Employment
            </h2>
            <p className="text-xs text-ink/55 mt-0.5">
              WIOA Title IV § 102(b){ipe && ` · updated ${new Date(ipe.updatedAt).toLocaleDateString()}`}
            </p>
          </div>
          <span
            className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold ${statusMeta.cls}`}
          >
            {statusMeta.label}
          </span>
        </div>

        {ipe ? (
          <div className="mt-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <KV label="Employment goal" value={ipe.employmentGoal || "—"} />
              <KV label="SOC code" value={ipe.goalSocCode || "—"} />
              <KV
                label="Timeline"
                value={`${ipe.timelineMonths} months`}
              />
              <KV
                label="Counselor signature"
                value={ipe.counselorSignature.signed ? "✓ Signed" : "Pending"}
              />
              <KV
                label="Client signature"
                value={ipe.clientSignature.signed ? "✓ Signed" : "Pending"}
              />
              <KV
                label="Services listed"
                value={String(ipe.vrServices.length)}
              />
            </div>
            <div className="flex gap-2 flex-wrap pt-1">
              <Link
                href={`/ipe?case=${caseId}`}
                className="grad-tealblue text-white text-sm font-semibold px-4 py-2.5 min-h-[44px] inline-flex items-center rounded-md"
              >
                {ipe.status === "draft"
                  ? "✏️ Continue IPE draft →"
                  : "Open IPE →"}
              </Link>
              <Link
                href={`/case/${caseId}/document/ipe-${caseId}`}
                className="border border-ink/20 text-sm px-4 py-2.5 min-h-[44px] inline-flex items-center rounded-md hover:bg-ink/5"
              >
                🖨️ View / print
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="text-sm text-ink/65 mb-3">
              No IPE has been started for this client yet. Draft the plan —
              the builder pulls in the interest profile, transferable skills,
              screener results, and case notes, then drafts every § 102(b)
              section for you to review and sign.
            </p>
            <Link
              href={`/ipe?case=${caseId}`}
              className="grad-tealblue text-white text-sm font-semibold px-4 py-2.5 min-h-[44px] inline-flex items-center rounded-md"
            >
              ✨ Start IPE draft →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function CaseNotesTab({
  caseId,
  clientName,
  counselorEmail,
}: {
  caseId: string;
  clientName: string;
  counselorEmail: string;
}) {
  const [bump, setBump] = useState(0);
  const notes = useMemo(() => notesForClient(caseId), [caseId, bump]);
  return (
    <CaseNotesPanel
      notes={notes}
      title=""
      emptyLabel="No case notes for this client yet."
      scope={{ kind: "client", caseId, clientName }}
      counselorEmail={counselorEmail}
      onAdded={() => setBump((n) => n + 1)}
    />
  );
}

function MessagesTab({
  userEmail,
  clientEmail,
}: {
  userEmail: string;
  clientEmail: string;
}) {
  const threads = threadsForUser(userEmail).filter((t) =>
    t.participants.some((p) => p.email === clientEmail),
  );
  if (threads.length === 0) {
    return (
      <div className="saas-card text-center text-ink/55 italic">
        No conversations with this client yet.{" "}
        <Link href="/messages" className="text-emerald-700 hover:underline">
          Start one →
        </Link>
      </div>
    );
  }
  return (
    <ol role="list" className="space-y-2">
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
    </ol>
  );
}

function TimelineTab({ caseId }: { caseId: string }) {
  const events = notesForClient(caseId);
  if (events.length === 0) {
    return (
      <div className="saas-card text-center text-ink/55 italic">
        No timeline events for this case yet.
      </div>
    );
  }
  return (
    <section aria-label="Activity timeline">
      <ol role="list" className="space-y-2">
        {events.map((e) => (
          <li
            key={e.id}
            className="flex items-start gap-3 border-l-2 border-emerald-300 pl-3 py-1"
          >
            <time
              dateTime={e.sessionAt}
              className="text-xs text-ink/55 w-36 shrink-0"
            >
              {new Date(e.sessionAt).toLocaleString()}
            </time>
            <div className="text-sm">
              <div className="font-semibold">{e.activityType}</div>
              <div className="text-xs text-ink/65 line-clamp-2">{e.data}</div>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ProgressTab({
  caseId,
  client,
}: {
  caseId: string;
  client: { progress: number };
}) {
  const indicators = buildProgress(caseId);
  return (
    <div className="space-y-4">
      <section className="saas-card grad-tealblue-soft">
        <h2 className="text-sm uppercase tracking-wider font-semibold text-emerald-700 mb-2">
          Overall progress
        </h2>
        <div className="text-4xl font-bold">{client.progress}%</div>
        <div className="h-3 bg-white/50 rounded-full overflow-hidden mt-2">
          <div
            className="h-full grad-tealblue"
            style={{ width: `${client.progress}%` }}
          />
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <ProgressTile label="Goals identified" value={indicators.goalsIdentified} />
        <ProgressTile label="Tasks completed" value={indicators.tasksCompleted} />
        <ProgressTile label="Documents generated" value={indicators.jobApplicationsSubmitted} />
        <ProgressTile label="Assessments" value={indicators.counselingParticipation} />
        <ProgressTile label="Self-advocacy actions" value={indicators.selfAdvocacyActions} />
        <ProgressTile label="Employment milestones" value={indicators.employmentMilestones} />
      </section>
    </div>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="saas-card">
      <div className="text-[10px] uppercase tracking-wider text-ink/55">
        {label}
      </div>
      <div className="text-sm font-semibold mt-1">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="saas-card">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-wider text-ink/55 mt-1">
        {label}
      </div>
    </div>
  );
}

function ProgressTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="saas-card">
      <div className="text-3xl font-bold text-grad-tealblue">{value}</div>
      <div className="text-xs uppercase tracking-wider text-ink/55 mt-1">
        {label}
      </div>
    </div>
  );
}
