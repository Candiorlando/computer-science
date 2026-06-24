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
  type CatalogService,
} from "@/lib/service-catalog";
import { toolsForService } from "@/lib/assessment-tools";
import { CaseAssessmentsPanel } from "@/components/CaseAssessmentsPanel";

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
                  <pre className="text-sm whitespace-pre-wrap bg-cream border border-ink/10 rounded p-4 leading-relaxed">
                    {order.deliverableFinal ?? order.deliverableDraft}
                  </pre>
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

      {/* Send to client */}
      {order.deliverableFinal && order.status !== "delivered" && (
        <Section title="Step 4 · Send to client">
          <p className="text-sm text-ink/65 mb-3">
            Sending releases the deliverable into{" "}
            <strong>{order.requesterOrgName}</strong>&apos;s portal. They
            see exactly the document you see above — your edited final
            version, not the original AI draft.
          </p>
          <button
            onClick={send}
            className="bg-purple-700 text-white font-semibold px-5 py-2.5 rounded-md text-sm"
          >
            🚀 Send to client
          </button>
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
