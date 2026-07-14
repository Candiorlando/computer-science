"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import {
  getAllBusinessUsers,
  getAllPartnerUsers,
  getAllVendorUsers,
} from "@/lib/users";
import {
  approveRequest,
  declineRequest,
  loadServiceRequests,
  saveCounselorSignature,
  saveDeliverableDraft,
  saveDeliverableEdit,
  saveSelectedScenario,
  saveWorkplan,
  saveWorkplanProgress,
  saveWorkplanScenarios,
  sendToClient,
  type ServiceRequest,
} from "@/lib/service-requests";
import {
  CATEGORY_LABELS,
  effectivePrice,
  formatPrice,
  getService,
} from "@/lib/service-catalog";
import { toolsForService } from "@/lib/assessment-tools";
import { CaseAssessmentsPanel } from "@/components/CaseAssessmentsPanel";
import {
  SignatureBlock,
  SignaturePad,
  type SignatureValue,
} from "@/components/SignaturePad";
import {
  loadSavedSignature,
  saveSignature as saveSignatureToProfile,
} from "@/lib/counselor-signatures";

type OrgKind = "business" | "vendor" | "partner";

export default function ServiceOrderDetail() {
  const router = useRouter();
  const params = useParams();
  const orderId = String(params.orderId);
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [bump, setBump] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const data = useMemo(() => {
    const order = loadServiceRequests().find((r) => r.id === orderId);
    if (!order) return null;
    const service = getService(order.serviceId);
    const tools = toolsForService(order.serviceId);

    // Figure out the requester kind for routing
    const bizIds = new Set(
      Object.values(getAllBusinessUsers()).map((u) => u.orgId),
    );
    const vendorIds = new Set(
      Object.values(getAllVendorUsers()).map((u) => u.vendorOrgId),
    );
    const partnerIds = new Set(
      Object.values(getAllPartnerUsers()).map((u) => u.partnerOrgId),
    );
    const orgKind: OrgKind = bizIds.has(order.requesterOrgId)
      ? "business"
      : vendorIds.has(order.requesterOrgId)
        ? "vendor"
        : partnerIds.has(order.requesterOrgId)
          ? "partner"
          : "business";
    return { order, service, tools, orgKind };
  }, [orderId, bump]);

  if (!user) return null;
  if (!data) {
    return (
      <div className="space-y-3">
        <Link
          href="/dashboard/service-orders"
          className="text-xs text-emerald-700 hover:underline"
        >
          ← Service Orders
        </Link>
        <h1 className="text-2xl">Service order not found</h1>
      </div>
    );
  }

  const { order, service, tools, orgKind } = data;
  const price = service ? effectivePrice(order.serviceId, user.email) : 0;
  const dueDays = order.dueDate ? daysUntil(order.dueDate) : null;

  async function generateDraft() {
    if (!service) return;
    setError(null);
    setGenerating(true);
    try {
      const resp = await fetch("/api/generate-service-deliverable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceTitle: service.title,
          serviceCategory: service.category,
          aiTemplate: service.aiTemplate,
          requesterOrgName: order.requesterOrgName,
          requesterName: order.requesterName,
          subjectClientName: order.subjectClientName,
          subjectCaseId: order.subjectCaseId,
          matterCaption: order.matterCaption,
          jurisdiction: order.jurisdiction,
          requesterNotes: order.notes,
          urgency: order.urgency,
          dueDate: order.dueDate,
          counselorName: user!.name,
          counselorCredentials: user!.credentials,
          collectedInformation: buildCollectedInfo(order),
        }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: "Request failed" }));
        setError(body.error ?? "Generation failed.");
        setGenerating(false);
        return;
      }
      const json = (await resp.json()) as { draft: string; model: string };
      saveDeliverableDraft(order.id, json.draft, json.model);
      setEditText(json.draft);
      setEditing(false);
      setBump((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  function saveEdit() {
    saveDeliverableEdit(order.id, editText);
    setEditing(false);
    setBump((n) => n + 1);
  }

  function send() {
    if (
      !window.confirm(
        `Send the deliverable to ${order.requesterOrgName}? Once sent, the document appears in their portal immediately.`,
      )
    )
      return;
    sendToClient(order.id, user!.email);
    setBump((n) => n + 1);
  }

  function applySignature(sig: SignatureValue) {
    saveCounselorSignature(order.id, {
      dataUrl: sig.dataUrl,
      text: sig.text,
      printedName: sig.printedName,
      credentials: sig.credentials,
    });
    if (sig.rememberOnProfile) {
      saveSignatureToProfile(user!.email, {
        dataUrl: sig.dataUrl,
        text: sig.text,
        printedName: sig.printedName,
        credentials: sig.credentials,
      });
    }
    setSigning(false);
    setBump((n) => n + 1);
  }

  const caseFileHref =
    orgKind === "business"
      ? `/dashboard/business/${order.requesterOrgId}`
      : orgKind === "vendor"
        ? `/dashboard/vendors/${order.requesterOrgId}`
        : `/dashboard/partners/${order.requesterOrgId}`;

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/dashboard/service-orders"
          className="text-xs text-emerald-700 hover:underline mb-1 inline-block"
        >
          ← Service Orders
        </Link>
        <div className="flex items-baseline justify-between gap-3 flex-wrap mt-1">
          <h1 className="text-3xl font-semibold">{order.serviceTitle}</h1>
          <StatusChip status={order.status} />
        </div>
        <p className="text-ink/65 text-sm mt-1">
          Requested by{" "}
          <Link href={caseFileHref} className="text-emerald-700 hover:underline">
            {order.requesterOrgName}
          </Link>{" "}
          · {order.requesterName} · {formatPrice(price, service?.priceUnit ?? "flat")}
          {service && (
            <span className="text-ink/55">
              {" "}
              · {CATEGORY_LABELS[service.category]}
            </span>
          )}
        </p>
      </header>

      <DueAndUrgency order={order} dueDays={dueDays} />

      <Section title="Request details">
        <dl className="grid sm:grid-cols-2 gap-3 text-sm">
          {order.matterCaption && (
            <Row label="Matter" value={order.matterCaption} />
          )}
          {order.subjectClientName && (
            <Row label="Subject" value={order.subjectClientName} />
          )}
          {order.subjectCaseId && (
            <Row label="Case ID" value={order.subjectCaseId} />
          )}
          {order.jurisdiction && (
            <Row label="Jurisdiction" value={order.jurisdiction} />
          )}
          <Row
            label="Requested"
            value={new Date(order.requestedAt).toLocaleDateString()}
          />
          {order.dueDate && (
            <Row label="Due" value={new Date(order.dueDate).toLocaleDateString()} />
          )}
        </dl>
        {order.notes && (
          <p className="text-sm text-ink/75 italic mt-3 border-l-2 border-emerald-300 pl-3">
            &ldquo;{order.notes}&rdquo;
          </p>
        )}
      </Section>

      {/* Approval gate */}
      {order.status === "pending-counselor-review" && (
        <Section title="Step 1 · Approve to begin">
          <p className="text-sm text-ink/75 mb-3">
            Review the request and approve to begin work, or decline with a
            reason that the requester will see.
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => {
                approveRequest(order.id, user!.email);
                setBump((n) => n + 1);
              }}
              className="grad-tealblue text-white font-semibold px-4 py-2 rounded-md text-sm"
            >
              ✓ Approve · begin engagement
            </button>
            <button
              onClick={() => {
                const reason = window.prompt("Reason for declining?");
                if (reason !== null) {
                  declineRequest(order.id, user!.email, reason);
                  setBump((n) => n + 1);
                }
              }}
              className="border border-ink/15 text-sm px-4 py-2 rounded-md hover:bg-ink/5"
            >
              Decline
            </button>
          </div>
        </Section>
      )}

      {/* AI work plan — information & collection tooling */}
      {order.status !== "pending-counselor-review" &&
        order.status !== "declined" && (
          <Section title="Step 2 · AI work plan — information & collection">
            <WorkPlanSection
              order={order}
              serviceDescription={service?.description}
              aiTemplate={service?.aiTemplate}
              counselorName={user!.name}
              onChange={() => setBump((n) => n + 1)}
            />
          </Section>
        )}

      {/* Embedded assessment tools */}
      {order.status !== "pending-counselor-review" &&
        order.status !== "declined" && (
          <Section title={`Step 3 · Embedded assessment tools (${tools.length})`}>
            <p className="text-sm text-ink/65 mb-3">
              Assessments wired specifically to <strong>{order.serviceTitle}</strong>.
              Each one stores responses inside the requester&apos;s case file
              with an AI-drafted interpretation you can edit and approve.
            </p>
            <CaseAssessmentsPanel
              scopeKind={
                orgKind === "business"
                  ? "business-org"
                  : orgKind === "vendor"
                    ? "vendor-org"
                    : "partner-org"
              }
              scopeId={order.requesterOrgId}
              audience="counselor"
              counselorEmail={user.email}
              filterServiceId={order.serviceId}
              launchRoute={(toolId) =>
                `${caseFileHref}/assessment/${toolId}`
              }
            />
          </Section>
        )}

      {/* AI-drafted deliverable */}
      {order.status !== "pending-counselor-review" &&
        order.status !== "declined" && (
          <Section title="Step 4 · AI-drafted findings & summary report">
            {!order.deliverableDraft ? (
              <>
                <p className="text-sm text-ink/65 mb-3">
                  Generate a draft of the deliverable using the service&apos;s
                  embedded AI template. The draft uses Claude Opus 4.8 and
                  pulls in the request context, requester notes, and your
                  counselor identity.
                </p>
                <button
                  onClick={generateDraft}
                  disabled={generating}
                  className="grad-tealblue text-white font-semibold px-4 py-2 rounded-md text-sm disabled:opacity-50"
                >
                  {generating
                    ? "Drafting with Claude Opus 4.8…"
                    : "✨ Generate AI draft"}
                </button>
                {error && (
                  <div
                    role="alert"
                    className="mt-3 text-sm border border-rose-300 bg-rose-50 text-rose-900 p-3 rounded"
                  >
                    {error}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
                  <p className="text-xs text-ink/55">
                    Draft generated{" "}
                    {new Date(order.deliverableDraftGeneratedAt!).toLocaleString()}{" "}
                    by {order.deliverableDraftModel}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={generateDraft}
                      disabled={generating}
                      className="text-xs border border-ink/15 px-3 py-1.5 rounded-md hover:bg-ink/5"
                    >
                      ↻ Regenerate
                    </button>
                    {!editing ? (
                      <button
                        onClick={() => {
                          setEditText(order.deliverableFinal ?? order.deliverableDraft ?? "");
                          setEditing(true);
                        }}
                        className="text-xs border border-emerald-500 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-50"
                      >
                        ✏️ Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={saveEdit}
                          className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-md font-semibold"
                        >
                          Save edits
                        </button>
                        <button
                          onClick={() => setEditing(false)}
                          className="text-xs text-ink/55"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {editing ? (
                  <textarea
                    className="w-full bg-white border border-ink/15 rounded-md px-3 py-2 text-sm min-h-[400px] font-mono"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <>
                    <div className="flex justify-end mb-2 print:hidden">
                      <button
                        onClick={() => window.print()}
                        className="text-xs border border-ink/15 px-3 py-1.5 rounded-md hover:bg-ink/5"
                      >
                        🖨️ Print / Save as PDF
                      </button>
                    </div>
                    <article
                      className="deliverable-page bg-white border border-ink/15 rounded p-8 leading-relaxed text-sm"
                      aria-label="Deliverable preview"
                    >
                      <header className="border-b border-ink/15 pb-4 mb-4">
                        <h1 className="text-xl font-semibold">
                          {order.serviceTitle}
                        </h1>
                        <p className="text-xs text-ink/65 mt-1">
                          Prepared for {order.requesterOrgName} ·{" "}
                          {order.requesterName}
                          {order.matterCaption && (
                            <span> · Matter: {order.matterCaption}</span>
                          )}
                        </p>
                        <p className="text-xs text-ink/55 mt-0.5">
                          Counselor of record: {user!.name}
                          {user!.credentials && `, ${user!.credentials}`} ·{" "}
                          {new Date(
                            order.deliverableFinalEditedAt ??
                              order.deliverableDraftGeneratedAt ??
                              new Date().toISOString(),
                          ).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </header>
                      <MarkdownBody
                        text={order.deliverableFinal ?? order.deliverableDraft ?? ""}
                      />
                      {order.signedAt && (
                        <SignatureBlock
                          dataUrl={order.counselorSignatureDataUrl}
                          text={order.counselorSignatureText}
                          printedName={order.counselorSignatureName ?? user!.name}
                          credentials={
                            order.counselorSignatureCredentials ??
                            user!.credentials
                          }
                          signedAt={order.signedAt}
                        />
                      )}
                      <footer className="border-t border-ink/15 mt-6 pt-4 text-xs text-ink/55 italic">
                        Prepared via Pathways Pro · Claude Opus 4.8 ·{" "}
                        Reviewed and approved by the counselor of record.
                      </footer>
                    </article>
                  </>
                )}
                <p className="text-xs text-ink/55 italic mt-2">
                  Counselor edit log:{" "}
                  {order.deliverableFinalEditedAt
                    ? `last saved ${new Date(order.deliverableFinalEditedAt).toLocaleString()}`
                    : "no edits yet"}
                </p>
              </>
            )}
          </Section>
        )}

      {/* Sign deliverable */}
      {order.deliverableFinal && order.status !== "delivered" && (
        <Section title="Step 5 · Sign deliverable">
          {!order.signedAt ? (
            <>
              <p className="text-sm text-ink/65 mb-3">
                Apply your signature before releasing the document. You can
                type your signature in cursive or draw it with mouse / trackpad
                / touch. Save it on your profile to skip this step on future
                deliverables.
              </p>
              {signing ? (
                <SignaturePad
                  suggestedName={user!.name}
                  credentials={user!.credentials}
                  savedDataUrl={loadSavedSignature(user!.email)?.dataUrl}
                  savedText={loadSavedSignature(user!.email)?.text}
                  onSave={applySignature}
                  onCancel={() => setSigning(false)}
                />
              ) : (
                <div className="flex gap-2 flex-wrap items-baseline">
                  <button
                    onClick={() => setSigning(true)}
                    className="grad-tealblue text-white font-semibold px-5 py-2 rounded-md text-sm"
                  >
                    ✍️ Open signature pad
                  </button>
                  {loadSavedSignature(user!.email) && (
                    <button
                      onClick={() => {
                        const saved = loadSavedSignature(user!.email)!;
                        applySignature({
                          dataUrl: saved.dataUrl,
                          text: saved.text,
                          printedName: saved.printedName,
                          credentials: saved.credentials,
                          rememberOnProfile: false,
                        });
                      }}
                      className="text-sm border border-emerald-500 text-emerald-700 px-4 py-2 rounded-md hover:bg-emerald-50"
                    >
                      Use saved signature
                    </button>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              <div className="text-sm">
                <span className="text-emerald-700 font-semibold">
                  ✓ Signed
                </span>{" "}
                <span className="text-ink/65">
                  {new Date(order.signedAt).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSigning(true)}
                className="text-xs text-emerald-700 hover:underline"
              >
                Replace signature
              </button>
              {signing && (
                <div className="w-full mt-3">
                  <SignaturePad
                    suggestedName={user!.name}
                    credentials={user!.credentials}
                    savedDataUrl={loadSavedSignature(user!.email)?.dataUrl}
                    savedText={loadSavedSignature(user!.email)?.text}
                    onSave={applySignature}
                    onCancel={() => setSigning(false)}
                  />
                </div>
              )}
            </div>
          )}
        </Section>
      )}

      {/* Send to client */}
      {order.deliverableFinal && order.status !== "delivered" && (
        <Section title="Step 6 · Send to client">
          <p className="text-sm text-ink/65 mb-3">
            Sending releases the deliverable into{" "}
            <strong>{order.requesterOrgName}</strong>&apos;s portal with your
            signature applied. They see exactly the document you see above —
            your edited final version, signed.
          </p>
          <button
            onClick={send}
            disabled={!order.signedAt}
            className="bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-md text-sm disabled:bg-ink/25 disabled:cursor-not-allowed"
            title={
              order.signedAt
                ? undefined
                : "Apply your signature in Step 5 before sending"
            }
          >
            🚀 Send to client
          </button>
          {!order.signedAt && (
            <p className="text-xs text-ink/55 mt-2 italic">
              Apply your signature in Step 5 before sending.
            </p>
          )}
        </Section>
      )}

      {order.status === "delivered" && order.sentToClientAt && (
        <section className="saas-card border-emerald-300 bg-emerald-50/40">
          <h2 className="text-lg font-semibold text-emerald-900">
            ✓ Delivered to {order.requesterOrgName}
          </h2>
          <p className="text-sm text-emerald-900/85 mt-1">
            Sent {new Date(order.sentToClientAt).toLocaleString()} by{" "}
            {order.sentToClientByEmail}. The deliverable is visible in their
            portal now.
          </p>
        </section>
      )}

      {order.status === "declined" && (
        <section className="saas-card border-rose-300 bg-rose-50/40">
          <h2 className="text-lg font-semibold text-rose-900">Declined</h2>
          <p className="text-sm text-rose-900/85 mt-1">
            <strong>Reason:</strong> {order.decisionNotes ?? "No reason recorded."}
          </p>
        </section>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .deliverable-page,
          .deliverable-page * {
            visibility: visible;
          }
          .deliverable-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            border: none;
            font-family: Georgia, "Times New Roman", Times, serif;
          }
        }
      `}</style>
    </div>
  );
}

function DueAndUrgency({
  order,
  dueDays,
}: {
  order: ServiceRequest;
  dueDays: number | null;
}) {
  const urgencyAlert = order.urgency === "wioa-deadline";
  const dueAlert = dueDays !== null && dueDays <= 3;
  return (
    <section
      className={`saas-card ${dueAlert || urgencyAlert ? "border-rose-300 bg-rose-50/40" : "grad-tealblue-soft"}`}
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-emerald-700">
            Priority
          </div>
          <div className="text-2xl font-bold mt-1">
            {dueDays === null
              ? "No due date"
              : dueDays < 0
                ? `${Math.abs(dueDays)} day${Math.abs(dueDays) === 1 ? "" : "s"} OVERDUE`
                : dueDays === 0
                  ? "DUE TODAY"
                  : `Due in ${dueDays} day${dueDays === 1 ? "" : "s"}`}
          </div>
          {order.dueDate && (
            <div className="text-xs text-ink/65 mt-0.5">
              {new Date(order.dueDate).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wider font-semibold text-emerald-700">
            Urgency
          </div>
          <div className="text-lg font-semibold capitalize mt-1">
            {order.urgency.replaceAll("-", " ")}
          </div>
        </div>
      </div>
    </section>
  );
}

function daysUntil(iso: string): number {
  const due = new Date(iso);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="saas-card">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-ink/55">{label}</dt>
      <dd className="text-sm font-semibold mt-0.5">{value}</dd>
    </div>
  );
}

// ── AI Work Plan ──────────────────────────────────────────────────────

interface Workplan {
  rationale: string;
  informationChecklist: { item: string; why: string; source: string }[];
  recommendedTools: { name: string; purpose: string; kind: string }[];
  intakeQuestions: { prompt: string; hint?: string }[];
}

function parseWorkplan(json?: string): Workplan | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as Workplan;
  } catch {
    return null;
  }
}

// Serializes collected work-plan progress into the findings block the
// deliverable endpoint grounds the draft in.
function buildCollectedInfo(order: ServiceRequest): string | undefined {
  const plan = parseWorkplan(order.workplanJson);
  if (!plan) return undefined;
  const lines: string[] = [];
  const checklist = order.workplanChecklist ?? {};
  const collected = plan.informationChecklist.filter((_, i) => checklist[`c${i}`]);
  const missing = plan.informationChecklist.filter((_, i) => !checklist[`c${i}`]);
  if (collected.length) {
    lines.push("Records/data collected: " + collected.map((c) => c.item).join("; "));
  }
  if (missing.length) {
    lines.push(
      "Not yet obtained (note as limitation if material): " +
        missing.map((c) => c.item).join("; "),
    );
  }
  const answers = order.workplanAnswers ?? {};
  plan.intakeQuestions.forEach((q, i) => {
    const a = answers[`q${i}`]?.trim();
    if (a) lines.push(`${q.prompt} — ${a}`);
  });
  return lines.length ? lines.join("\n") : undefined;
}

const TOOL_KIND_LABELS: Record<string, string> = {
  "standardized-assessment": "Standardized assessment",
  survey: "Survey",
  observation: "Observation",
  "records-review": "Records review",
  "interview-protocol": "Interview protocol",
};

interface Scenario {
  title: string;
  description: string;
  custom?: boolean;
}

function parseScenarios(json?: string): Scenario[] {
  if (!json) return [];
  try {
    return JSON.parse(json) as Scenario[];
  } catch {
    return [];
  }
}

function WorkPlanSection({
  order,
  serviceDescription,
  aiTemplate,
  counselorName,
  onChange,
}: {
  order: ServiceRequest;
  serviceDescription?: string;
  aiTemplate?: string;
  counselorName: string;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const plan = parseWorkplan(order.workplanJson);
  const checklist = order.workplanChecklist ?? {};
  const answers = order.workplanAnswers ?? {};
  const [draftAnswers, setDraftAnswers] = useState<Record<string, string>>(answers);

  // ── Top scenarios ──
  const scenarios = parseScenarios(order.workplanScenariosJson);
  const selectedScenario = order.workplanSelectedScenario;
  const [scenBusy, setScenBusy] = useState(false);
  const [scenError, setScenError] = useState<string | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const scenFetchedRef = useRef(false);

  async function fetchScenarios(keepCustom: boolean) {
    setScenBusy(true);
    setScenError(null);
    try {
      const resp = await fetch("/api/generate-service-scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceTitle: order.serviceTitle,
          serviceCategory: getService(order.serviceId)?.category ?? "one-time",
          serviceDescription,
          requesterOrgName: order.requesterOrgName,
          matterCaption: order.matterCaption,
          requesterNotes: order.notes,
        }),
      });
      if (!resp.ok) {
        const j = (await resp.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Request failed (${resp.status})`);
      }
      const j = (await resp.json()) as { scenarios: Scenario[] };
      const custom = keepCustom ? scenarios.filter((s) => s.custom) : [];
      saveWorkplanScenarios(order.id, JSON.stringify([...j.scenarios, ...custom]));
      onChange();
    } catch (e) {
      setScenError(e instanceof Error ? e.message : "Network error");
    } finally {
      setScenBusy(false);
    }
  }

  // Load scenarios once per order on first open of this section.
  useEffect(() => {
    if (scenarios.length === 0 && !scenFetchedRef.current) {
      scenFetchedRef.current = true;
      fetchScenarios(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function selectScenario(title: string) {
    saveSelectedScenario(order.id, title);
    onChange();
  }

  function addCustomScenario() {
    const title = customTitle.trim();
    if (!title) return;
    const next: Scenario[] = [
      ...scenarios,
      { title, description: "Counselor-defined scenario.", custom: true },
    ];
    saveWorkplanScenarios(order.id, JSON.stringify(next));
    saveSelectedScenario(order.id, title);
    setCustomTitle("");
    onChange();
  }

  const selectedScenarioText = (() => {
    if (!selectedScenario) return undefined;
    const m = scenarios.find((s) => s.title === selectedScenario);
    return m ? `${m.title} — ${m.description}` : selectedScenario;
  })();

  const scenarioSection = (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-2 flex-wrap">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
          Top scenarios requested for this service
        </h3>
        <button
          onClick={() => fetchScenarios(true)}
          disabled={scenBusy}
          className="text-xs border border-ink/15 px-3 py-1.5 rounded-md hover:bg-ink/5 disabled:opacity-50"
        >
          {scenBusy ? "Loading…" : "↻ Regenerate scenarios"}
        </button>
      </div>
      {scenBusy && scenarios.length === 0 ? (
        <div className="border border-dashed border-ink/20 rounded-md p-4 text-center text-xs text-ink/55 italic">
          Asking Claude Opus 4.8 for the most common engagement scenarios…
        </div>
      ) : (
        <ul role="list" className="grid sm:grid-cols-2 gap-2">
          {scenarios.map((s) => {
            const active = selectedScenario === s.title;
            return (
              <li key={s.title}>
                <button
                  onClick={() => selectScenario(s.title)}
                  aria-pressed={active}
                  className={`text-left w-full border-2 rounded-md p-3 transition ${
                    active
                      ? "border-emerald-500 bg-emerald-50/50"
                      : "border-ink/15 bg-white hover:border-emerald-300"
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <strong className="text-sm">{s.title}</strong>
                    {s.custom && (
                      <span className="text-[9px] uppercase tracking-wider bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                        Yours
                      </span>
                    )}
                    {active && !s.custom && (
                      <span aria-hidden className="text-emerald-700 shrink-0">✓</span>
                    )}
                  </span>
                  <span className="block text-xs text-ink/65 mt-0.5">
                    {s.description}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {scenError && (
        <div role="alert" className="mt-2 text-xs border border-rose-300 bg-rose-50 text-rose-900 rounded-md p-2">
          {scenError}
        </div>
      )}
      <div className="mt-3 flex gap-2 items-center flex-wrap">
        <input
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addCustomScenario();
          }}
          placeholder="Or describe your own scenario…"
          className="flex-1 min-w-[220px] bg-white border border-ink/15 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-emerald-500"
        />
        <button
          onClick={addCustomScenario}
          disabled={!customTitle.trim()}
          className="text-xs border border-emerald-500 text-emerald-700 px-3 py-1.5 rounded-md hover:bg-emerald-50 font-semibold disabled:opacity-40"
        >
          + Add &amp; select
        </button>
      </div>
      <p className="text-xs text-ink/55 italic mt-2">
        {selectedScenario
          ? `Scenario locked in: "${selectedScenario}" — the work plan tailors to it. Changed your pick? Hit ${plan ? "↻ Regenerate plan" : "Generate AI work plan"} below.`
          : "Pick the scenario that matches this engagement (or add your own) — the AI tailors the checklist, tools, and questions to it."}
      </p>
    </div>
  );

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const resp = await fetch("/api/generate-service-workplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceTitle: order.serviceTitle,
          serviceCategory: getService(order.serviceId)?.category ?? "one-time",
          serviceDescription,
          aiTemplate,
          requesterOrgName: order.requesterOrgName,
          requesterName: order.requesterName,
          subjectClientName: order.subjectClientName,
          matterCaption: order.matterCaption,
          jurisdiction: order.jurisdiction,
          requesterNotes: order.notes,
          counselorName,
          scenario: selectedScenarioText,
        }),
      });
      if (!resp.ok) {
        const j = (await resp.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Request failed (${resp.status})`);
      }
      const j = (await resp.json()) as { workplan: Workplan; model: string };
      saveWorkplan(order.id, JSON.stringify(j.workplan), j.model);
      setDraftAnswers({});
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  function toggleItem(key: string) {
    const next = { ...checklist, [key]: !checklist[key] };
    saveWorkplanProgress(order.id, { checklist: next });
    onChange();
  }

  function saveAnswer(key: string) {
    const next = { ...answers, [key]: draftAnswers[key] ?? "" };
    saveWorkplanProgress(order.id, { answers: next });
    onChange();
  }

  if (!plan) {
    return (
      <div className="space-y-5">
        {scenarioSection}
        <div className="border-t border-ink/10 pt-4">
          <p className="text-sm text-ink/65 mb-3">
            Let the AI determine what information to collect, which assessment
            and collection tools this service needs, and the intake questions
            to answer while you work. Your answers ground the drafted findings
            in Step 4.
          </p>
          <button
            onClick={generate}
            disabled={busy}
            className="grad-tealblue text-white font-semibold px-4 py-2 rounded-md text-sm disabled:opacity-50"
          >
            {busy ? "Planning with Claude Opus 4.8…" : "✨ Generate AI work plan"}
          </button>
          {error && (
            <div role="alert" className="mt-3 text-sm border border-rose-300 bg-rose-50 text-rose-900 p-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    );
  }

  const collectedCount = plan.informationChecklist.filter(
    (_, i) => checklist[`c${i}`],
  ).length;
  const answeredCount = plan.intakeQuestions.filter((_, i) =>
    (answers[`q${i}`] ?? "").trim(),
  ).length;

  return (
    <div className="space-y-5">
      {scenarioSection}
      <div className="flex items-baseline justify-between gap-3 flex-wrap border-t border-ink/10 pt-4">
        <p className="text-sm italic text-ink/75 border-l-2 border-emerald-400 pl-3 flex-1 min-w-[240px]">
          {plan.rationale}
        </p>
        <button
          onClick={generate}
          disabled={busy}
          className="text-xs border border-ink/15 px-3 py-1.5 rounded-md hover:bg-ink/5 shrink-0"
        >
          {busy ? "Regenerating…" : "↻ Regenerate plan"}
        </button>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Information to collect
          </h3>
          <span className="text-xs text-ink/55">
            {collectedCount} / {plan.informationChecklist.length} obtained
          </span>
        </div>
        <ul role="list" className="space-y-2">
          {plan.informationChecklist.map((c, i) => {
            const key = `c${i}`;
            const done = Boolean(checklist[key]);
            return (
              <li key={key} className={`border rounded-md p-3 ${done ? "border-emerald-300 bg-emerald-50/40" : "border-ink/15 bg-white"}`}>
                <label className="flex gap-3 items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleItem(key)}
                    className="mt-1 rounded"
                  />
                  <span className="text-sm flex-1">
                    <strong className={done ? "line-through text-ink/55" : ""}>{c.item}</strong>
                    <span className="block text-xs text-ink/65 mt-0.5">{c.why}</span>
                    <span className="block text-[10px] uppercase tracking-wider text-ink/50 mt-1">
                      Source: {c.source}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-700 mb-2">
          Recommended tools
        </h3>
        <ul role="list" className="grid sm:grid-cols-2 gap-2">
          {plan.recommendedTools.map((t, i) => (
            <li key={i} className="border border-ink/15 bg-white rounded-md p-3">
              <div className="flex items-baseline justify-between gap-2">
                <strong className="text-sm">{t.name}</strong>
                <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded-full font-semibold shrink-0">
                  {TOOL_KIND_LABELS[t.kind] ?? t.kind}
                </span>
              </div>
              <p className="text-xs text-ink/65 mt-1">{t.purpose}</p>
            </li>
          ))}
        </ul>
        <p className="text-xs text-ink/55 italic mt-2">
          Standardized instruments live in Step 3 below — launch them there so
          results store case-isolated with an AI-drafted interpretation.
        </p>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-emerald-700">
            Data collection — record findings as you work
          </h3>
          <span className="text-xs text-ink/55">
            {answeredCount} / {plan.intakeQuestions.length} answered
          </span>
        </div>
        <ol role="list" className="space-y-3">
          {plan.intakeQuestions.map((q, i) => {
            const key = `q${i}`;
            const saved = (answers[key] ?? "").trim().length > 0;
            return (
              <li key={key} className="border border-ink/15 bg-white rounded-md p-3">
                <label className="block">
                  <span className="text-sm font-semibold">
                    {i + 1}. {q.prompt}
                    {saved && <span className="text-emerald-600 ml-1" aria-label="answered">✓</span>}
                  </span>
                  {q.hint && (
                    <span className="block text-xs text-ink/55 mt-0.5">{q.hint}</span>
                  )}
                  <textarea
                    value={draftAnswers[key] ?? answers[key] ?? ""}
                    onChange={(e) =>
                      setDraftAnswers((d) => ({ ...d, [key]: e.target.value }))
                    }
                    onBlur={() => saveAnswer(key)}
                    rows={2}
                    className="w-full mt-2 bg-cream/40 border border-ink/15 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                    placeholder="Record your finding…"
                  />
                </label>
              </li>
            );
          })}
        </ol>
        <p className="text-xs text-ink/55 italic mt-2">
          Answers save when you click away. Everything recorded here — plus
          the checklist state — feeds the AI findings draft in Step 4, and
          uncollected items get flagged as limitations.
        </p>
      </div>

      {error && (
        <div role="alert" className="text-sm border border-rose-300 bg-rose-50 text-rose-900 p-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
}

// Tiny Markdown renderer — handles the subset the AI deliverable
// template emits: headings (#, ##, ###), bullet lists (-, *), numbered
// lists (1.), bold (**), italic (*), and paragraph breaks. Keeps the
// bundle small and never executes HTML from the model output.
function MarkdownBody({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let listBuf: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function flushList() {
    if (listType === "ul") {
      out.push(
        <ul
          key={out.length}
          className="list-disc pl-6 my-2 space-y-1"
          role="list"
        >
          {listBuf.map((li, i) => (
            <li key={i}>{renderInline(li)}</li>
          ))}
        </ul>,
      );
    } else if (listType === "ol") {
      out.push(
        <ol
          key={out.length}
          className="list-decimal pl-6 my-2 space-y-1"
          role="list"
        >
          {listBuf.map((li, i) => (
            <li key={i}>{renderInline(li)}</li>
          ))}
        </ol>,
      );
    }
    listBuf = [];
    listType = null;
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }
    const h3 = line.match(/^###\s+(.*)$/);
    const h2 = line.match(/^##\s+(.*)$/);
    const h1 = line.match(/^#\s+(.*)$/);
    const ulItem = line.match(/^[-*]\s+(.*)$/);
    const olItem = line.match(/^\d+\.\s+(.*)$/);
    if (h1) {
      flushList();
      out.push(<h2 key={out.length} className="text-lg font-semibold mt-4 mb-2">{renderInline(h1[1])}</h2>);
    } else if (h2) {
      flushList();
      out.push(<h3 key={out.length} className="text-base font-semibold mt-4 mb-1">{renderInline(h2[1])}</h3>);
    } else if (h3) {
      flushList();
      out.push(<h4 key={out.length} className="text-sm font-semibold mt-3 mb-1 uppercase tracking-wider text-ink/65">{renderInline(h3[1])}</h4>);
    } else if (ulItem) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listBuf.push(ulItem[1]);
    } else if (olItem) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listBuf.push(olItem[1]);
    } else {
      flushList();
      out.push(<p key={out.length} className="my-2">{renderInline(line)}</p>);
    }
  }
  flushList();
  return <>{out}</>;
}

function renderInline(s: string): React.ReactNode {
  // Parse **bold** and *italic* recursively into spans. Plain-text fallback.
  const parts: React.ReactNode[] = [];
  let rest = s;
  let key = 0;
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/;
  while (rest.length) {
    const m = re.exec(rest);
    if (!m) {
      parts.push(<span key={key++}>{rest}</span>);
      break;
    }
    if (m.index > 0) parts.push(<span key={key++}>{rest.slice(0, m.index)}</span>);
    const token = m[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    rest = rest.slice(m.index + token.length);
  }
  return parts;
}

function StatusChip({ status }: { status: ServiceRequest["status"] }) {
  const styles: Record<ServiceRequest["status"], string> = {
    "pending-counselor-review": "bg-amber-100 text-amber-900",
    "approved-in-progress": "bg-emerald-100 text-emerald-900",
    "draft-awaiting-release": "bg-emerald-100 text-emerald-900",
    delivered: "bg-emerald-100 text-emerald-900",
    declined: "bg-rose-100 text-rose-900",
  };
  const labels: Record<ServiceRequest["status"], string> = {
    "pending-counselor-review": "Awaiting review",
    "approved-in-progress": "In progress",
    "draft-awaiting-release": "Draft ready",
    delivered: "Delivered",
    declined: "Declined",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
