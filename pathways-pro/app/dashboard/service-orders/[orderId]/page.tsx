"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
          className="text-xs text-cyan-700 hover:underline"
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
          className="text-xs text-cyan-700 hover:underline mb-1 inline-block"
        >
          ← Service Orders
        </Link>
        <div className="flex items-baseline justify-between gap-3 flex-wrap mt-1">
          <h1 className="text-3xl font-semibold">{order.serviceTitle}</h1>
          <StatusChip status={order.status} />
        </div>
        <p className="text-ink/65 text-sm mt-1">
          Requested by{" "}
          <Link href={caseFileHref} className="text-cyan-700 hover:underline">
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
          <p className="text-sm text-ink/75 italic mt-3 border-l-2 border-cyan-300 pl-3">
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

      {/* Embedded assessment tools */}
      {order.status !== "pending-counselor-review" &&
        order.status !== "declined" && (
          <Section title={`Step 2 · Embedded assessment tools (${tools.length})`}>
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
          <Section title="Step 3 · AI-drafted deliverable">
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
                        className="text-xs border border-cyan-500 text-cyan-700 px-3 py-1.5 rounded-md hover:bg-cyan-50"
                      >
                        ✏️ Edit
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={saveEdit}
                          className="text-xs bg-cyan-600 text-white px-3 py-1.5 rounded-md font-semibold"
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
        <Section title="Step 4 · Sign deliverable">
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
                      className="text-sm border border-cyan-500 text-cyan-700 px-4 py-2 rounded-md hover:bg-cyan-50"
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
                className="text-xs text-cyan-700 hover:underline"
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
        <Section title="Step 5 · Send to client">
          <p className="text-sm text-ink/65 mb-3">
            Sending releases the deliverable into{" "}
            <strong>{order.requesterOrgName}</strong>&apos;s portal with your
            signature applied. They see exactly the document you see above —
            your edited final version, signed.
          </p>
          <button
            onClick={send}
            disabled={!order.signedAt}
            className="bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-md text-sm disabled:bg-ink/25 disabled:cursor-not-allowed"
            title={
              order.signedAt
                ? undefined
                : "Apply your signature in Step 4 before sending"
            }
          >
            🚀 Send to client
          </button>
          {!order.signedAt && (
            <p className="text-xs text-ink/55 mt-2 italic">
              Apply your signature in Step 4 before sending.
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
          <div className="text-xs uppercase tracking-wider font-semibold text-cyan-700">
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
          <div className="text-xs uppercase tracking-wider font-semibold text-cyan-700">
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
    "approved-in-progress": "bg-blue-100 text-blue-900",
    "draft-awaiting-release": "bg-purple-100 text-purple-900",
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
