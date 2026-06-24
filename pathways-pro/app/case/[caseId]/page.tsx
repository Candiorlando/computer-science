"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { CLIENTS } from "@/lib/users";
import { loadCaseNotes, notesForClient } from "@/lib/case-notes";
import { CaseNotesPanel } from "@/components/CaseNotesPanel";
import { loadAccommodationLetters } from "@/lib/accommodation-letters";
import {
  loadProblemAnalysisReports,
  loadEEOCCharges,
  loadOCRComplaints,
} from "@/lib/self-advocacy";
import { threadsForUser } from "@/lib/messages";
import { buildProgress } from "@/lib/positive-psychology";
import { recordCaseOpen } from "@/lib/recent-cases";

type Tab =
  | "overview"
  | "documents"
  | "case-notes"
  | "messages"
  | "timeline"
  | "progress";

export default function CaseFilePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = String(params.caseId);
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [tab, setTab] = useState<Tab>("overview");

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
          className="text-xs text-cyan-700 hover:underline"
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
          className="text-xs text-cyan-700 hover:underline mb-1 inline-block"
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
        <TabBtn active={tab === "progress"} onClick={() => setTab("progress")}>
          Progress
        </TabBtn>
      </div>

      {tab === "overview" && <OverviewTab caseId={caseId} client={client} />}
      {tab === "documents" && <DocumentsTab caseId={caseId} />}
      {tab === "case-notes" && <CaseNotesTab caseId={caseId} />}
      {tab === "messages" && (
        <MessagesTab userEmail={user.email} clientEmail={client.email} />
      )}
      {tab === "timeline" && <TimelineTab caseId={caseId} />}
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
        <h2 className="text-sm uppercase tracking-wider font-semibold text-cyan-700 mb-2">
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
  const letters = loadAccommodationLetters().filter((l) => l.caseId === caseId);
  const reports = loadProblemAnalysisReports().filter((r) => r.caseId === caseId);
  const eeoc = loadEEOCCharges().filter((c) => c.caseId === caseId);
  const ocr = loadOCRComplaints().filter((c) => c.caseId === caseId);

  const groups: { label: string; items: { id: string; title: string; date: string }[] }[] = [
    {
      label: "Accommodation letters",
      items: letters.map((l) => ({
        id: l.id,
        title: l.workplaceProblem.slice(0, 60),
        date: l.createdAt,
      })),
    },
    {
      label: "Problem Analysis Reports",
      items: reports.map((r) => ({
        id: r.id,
        title: r.employerName,
        date: r.createdAt,
      })),
    },
    {
      label: "EEOC charges",
      items: eeoc.map((c) => ({
        id: c.id,
        title: `${c.employerName} — ${c.basesOfDiscrimination.join(", ")}`,
        date: c.createdAt,
      })),
    },
    {
      label: "OCR / DOJ complaints",
      items: ocr.map((c) => ({
        id: c.id,
        title: `${c.respondentName} — ${c.agency}`,
        date: c.createdAt,
      })),
    },
  ];

  const total = groups.reduce((s, g) => s + g.items.length, 0);

  if (total === 0) {
    return (
      <div className="saas-card text-center text-ink/55 italic">
        No documents generated for this case yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups
        .filter((g) => g.items.length > 0)
        .map((g) => (
          <section key={g.label} className="saas-card">
            <h2 className="text-lg font-semibold mb-3">{g.label}</h2>
            <ol role="list" className="space-y-1.5">
              {g.items.map((it) => (
                <li
                  key={it.id}
                  className="flex items-baseline justify-between gap-2 text-sm border-b border-ink/10 pb-1.5 last:border-0"
                >
                  <span className="truncate">{it.title}</span>
                  <span className="text-xs text-ink/55">
                    {new Date(it.date).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ))}
    </div>
  );
}

function CaseNotesTab({ caseId }: { caseId: string }) {
  const notes = notesForClient(caseId);
  return (
    <CaseNotesPanel
      notes={notes}
      title=""
      emptyLabel="No case notes for this client yet."
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
        <Link href="/messages" className="text-cyan-700 hover:underline">
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
            className="flex items-start gap-3 border-l-2 border-cyan-300 pl-3 py-1"
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
        <h2 className="text-sm uppercase tracking-wider font-semibold text-cyan-700 mb-2">
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
