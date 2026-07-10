"use client";

// Shared service-catalog UI for external portals (Business · Partner ·
// Vendor). Renders the full catalog filtered by audience, lets the
// user request services, and lists their own request history with
// live status.

import { useMemo, useState } from "react";
import {
  CATEGORY_LABELS,
  effectiveEnabled,
  effectivePrice,
  formatPrice,
  servicesForAudience,
  type CatalogService,
  type ExternalAudience,
  type ServiceCategory,
} from "@/lib/service-catalog";
import {
  appendServiceRequest,
  loadServiceRequests,
  newServiceRequestId,
  type ServiceRequest,
} from "@/lib/service-requests";

interface RequesterContext {
  email: string;
  name: string;
  orgId: string;
  orgName: string;
  audience: ExternalAudience;
  // Counselor whose pricing applies (defaults to Candace if not given)
  effectiveCounselorEmail: string;
  // Optional scope label for case-note narrative
  scopeRole?: string;
}

export function ExternalServiceCatalog({
  requester,
  introNote,
}: {
  requester: RequesterContext;
  introNote?: string;
}) {
  const [category, setCategory] = useState<ServiceCategory | "all">("all");
  const [bump, setBump] = useState(0);

  const services = useMemo(() => {
    const all = servicesForAudience(requester.audience).filter((s) =>
      effectiveEnabled(s.id, requester.effectiveCounselorEmail),
    );
    if (category === "all") return all;
    return all.filter((s) => s.category === category);
  }, [requester, category]);

  const myRequests = useMemo(
    () =>
      loadServiceRequests().filter((r) => r.requesterOrgId === requester.orgId),
    [requester, bump],
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          Service Catalog
        </p>
        <h1 className="text-3xl font-semibold">
          Request a service from your counselor
        </h1>
        <p className="text-ink/65 text-sm mt-1 prose-narrow">
          {introNote ??
            "Every request routes to your assigned VR counselor for review. Once approved, the counselor drafts the deliverable, edits as needed, and delivers it to this portal."}
        </p>
      </header>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs uppercase tracking-wider text-ink/55 mr-2">
          Filter:
        </span>
        <Pill
          active={category === "all"}
          onClick={() => setCategory("all")}
          label={`All (${servicesForAudience(requester.audience).length})`}
        />
        {(Object.entries(CATEGORY_LABELS) as [ServiceCategory, string][]).map(
          ([k, label]) => {
            const count = servicesForAudience(requester.audience).filter(
              (s) => s.category === k,
            ).length;
            if (count === 0) return null;
            return (
              <Pill
                key={k}
                active={category === k}
                onClick={() => setCategory(k)}
                label={`${label.replace(/^[^a-zA-Z]+/, "")} (${count})`}
              />
            );
          },
        )}
      </div>

      <ul role="list" className="grid md:grid-cols-2 gap-3">
        {services.map((s) => (
          <ServiceCard
            key={s.id}
            service={s}
            requester={requester}
            myRequests={myRequests}
            onSubmit={() => setBump((n) => n + 1)}
          />
        ))}
      </ul>

      <section>
        <h2 className="text-xl font-semibold mb-3">Your service requests</h2>
        {myRequests.length === 0 ? (
          <div className="saas-card text-center text-ink/55 italic">
            You haven&apos;t requested any services yet.
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {myRequests.map((r) => (
              <li key={r.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                  <h3 className="font-semibold">{r.serviceTitle}</h3>
                  <StatusChip status={r.status} />
                </div>
                <p className="text-xs text-ink/65">
                  {r.matterCaption && (
                    <>
                      <span>{r.matterCaption}</span> ·{" "}
                    </>
                  )}
                  Requested {new Date(r.requestedAt).toLocaleDateString()}
                  {r.urgency !== "routine" && (
                    <span className="text-emerald-700"> · {r.urgency}</span>
                  )}
                </p>
                {r.decisionNotes && (
                  <div className="text-xs italic mt-1 border-l-2 border-emerald-300 pl-3">
                    Counselor: &ldquo;{r.decisionNotes}&rdquo;
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function ServiceCard({
  service,
  requester,
  myRequests,
  onSubmit,
}: {
  service: CatalogService;
  requester: RequesterContext;
  myRequests: ServiceRequest[];
  onSubmit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const existing = myRequests.find(
    (r) =>
      r.serviceId === service.id &&
      r.status !== "delivered" &&
      r.status !== "declined",
  );
  const price = effectivePrice(
    service.id,
    requester.effectiveCounselorEmail,
  );

  return (
    <article className="saas-card flex flex-col">
      <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
        <h3 className="text-base font-semibold">{service.title}</h3>
        <span className="text-[10px] uppercase tracking-wider bg-ink/5 text-ink/65 px-2 py-0.5 rounded-full">
          {service.category.replaceAll("-", " ")}
        </span>
      </div>
      <p className="text-sm text-ink/70 mb-3 grow">{service.description}</p>
      <ul className="text-xs text-ink/65 space-y-1 mb-3 border-t border-ink/10 pt-2">
        <li>
          <strong>Price:</strong>{" "}
          {formatPrice(price, service.priceUnit)}
        </li>
        <li>
          <strong>Turnaround:</strong> {service.turnaround}
        </li>
        {service.visibleToClient && (
          <li className="text-emerald-700">
            👁️ Affected client receives a read-only view
          </li>
        )}
      </ul>

      {existing ? (
        <div className="text-xs border border-amber-300 bg-amber-50 text-amber-900 rounded p-2">
          Active request: <strong>{statusLabel(existing.status)}</strong>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="grad-tealblue text-white font-semibold px-3 py-1.5 rounded-md text-xs self-start"
        >
          Request this service →
        </button>
      )}

      {open && (
        <RequestModal
          service={service}
          price={price}
          requester={requester}
          onClose={() => setOpen(false)}
          onSubmitted={() => {
            setOpen(false);
            onSubmit();
          }}
        />
      )}
    </article>
  );
}

function RequestModal({
  service,
  price,
  requester,
  onClose,
  onSubmitted,
}: {
  service: CatalogService;
  price: number;
  requester: RequesterContext;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [subjectName, setSubjectName] = useState("");
  const [subjectCaseId, setSubjectCaseId] = useState("");
  const [matterCaption, setMatterCaption] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [notes, setNotes] = useState("");
  const [urgency, setUrgency] = useState<ServiceRequest["urgency"]>("routine");
  // Default due date = today + 14 days. Required field — the
  // counselor's queue is sorted by it.
  const defaultDue = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const [dueDate, setDueDate] = useState(defaultDue);

  function submit() {
    const req: ServiceRequest = {
      id: newServiceRequestId(),
      serviceId: service.id,
      serviceTitle: service.title,
      requesterEmail: requester.email,
      requesterName: requester.name,
      requesterOrgId: requester.orgId,
      requesterOrgName: requester.orgName,
      subjectClientName: subjectName || undefined,
      subjectCaseId: subjectCaseId || undefined,
      matterCaption: matterCaption || undefined,
      jurisdiction: jurisdiction || undefined,
      notes,
      urgency,
      dueDate,
      status: "pending-counselor-review",
      requestedAt: new Date().toISOString(),
    };
    appendServiceRequest(req, requester.scopeRole ?? requester.audience);
    onSubmitted();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-ink/40 grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-lg shadow-lg max-w-lg w-full p-6 space-y-3 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">{service.title}</h3>
        <p className="text-xs text-ink/55">
          Counselor review required · {formatPrice(price, service.priceUnit)}
        </p>
        <Field label="Subject / client (if applicable)">
          <input
            className="input"
            value={subjectName}
            onChange={(e) => setSubjectName(e.target.value)}
          />
        </Field>
        <Field label="Case ID (if known)">
          <input
            className="input"
            value={subjectCaseId}
            onChange={(e) => setSubjectCaseId(e.target.value)}
            placeholder="VR-2026-NNNN"
          />
        </Field>
        <Field label="Matter caption">
          <input
            className="input"
            value={matterCaption}
            onChange={(e) => setMatterCaption(e.target.value)}
            placeholder="e.g., Hire of M. Thomas — Welder I"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Jurisdiction">
            <input
              className="input"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            />
          </Field>
          <Field label="Urgency">
            <select
              className="input"
              value={urgency}
              onChange={(e) =>
                setUrgency(e.target.value as ServiceRequest["urgency"])
              }
            >
              <option value="routine">Routine</option>
              <option value="expedited">Expedited</option>
              <option value="wioa-deadline">WIOA deadline</option>
            </select>
          </Field>
          <Field label="Deliverable needed by">
            <input
              type="date"
              className="input"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </Field>
        </div>
        <Field label="Notes for your counselor">
          <textarea
            className="input min-h-[80px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </Field>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="border border-ink/15 px-4 py-1.5 rounded-md text-sm"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="grad-tealblue text-white px-4 py-1.5 rounded-md font-semibold text-sm"
          >
            Submit request →
          </button>
        </div>
        <style jsx>{`
          :global(.input) {
            width: 100%;
            background: white;
            border: 1px solid rgba(31, 29, 26, 0.15);
            border-radius: 8px;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
          }
          :global(.input:focus-visible) {
            outline: 2px solid #0F6B54;
            outline-offset: -1px;
          }
        `}</style>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function Pill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
        active
          ? "grad-tealblue text-white"
          : "border border-ink/15 text-ink/70 hover:border-emerald-500"
      }`}
    >
      {label}
    </button>
  );
}

function StatusChip({ status }: { status: ServiceRequest["status"] }) {
  const styles: Record<ServiceRequest["status"], string> = {
    "pending-counselor-review": "bg-amber-100 text-amber-900",
    "approved-in-progress": "bg-emerald-100 text-emerald-900",
    "draft-awaiting-release": "bg-emerald-100 text-emerald-900",
    delivered: "bg-emerald-100 text-emerald-900",
    declined: "bg-amber-100 text-amber-900",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${styles[status]}`}
    >
      {statusLabel(status)}
    </span>
  );
}

function statusLabel(s: ServiceRequest["status"]): string {
  return {
    "pending-counselor-review": "Awaiting counselor review",
    "approved-in-progress": "Approved · in progress",
    "draft-awaiting-release": "Draft awaiting counselor sign-off",
    delivered: "Delivered",
    declined: "Declined",
  }[s];
}
