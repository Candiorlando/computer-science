"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import type { BusinessUser } from "@/lib/users";
import {
  SERVICE_CATALOG,
  appendServiceRequest,
  loadServiceRequests,
  newServiceRequestId,
  requestsForOrg,
  type ServiceCatalogItem,
  type ServiceRequest,
} from "@/lib/service-requests";

export default function BusinessServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<BusinessUser | null>(null);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "business") {
      const dest =
        s.role === "vendor"
          ? "/vendor-portal"
          : s.role === "counselor"
            ? "/dashboard/business"
            : "/portal";
      return router.replace(dest);
    }
    setUser(s);
  }, [router, bump]);

  const myRequests = useMemo(
    () => (user ? requestsForOrg(user.orgId) : []),
    [user, bump],
  );

  if (!user) return null;

  const enterprise = SERVICE_CATALOG.filter((s) => !s.free);
  const freeTools = SERVICE_CATALOG.filter((s) => s.free);

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Service Catalog · Empowering Individuals · Elevating Institutions
        </p>
        <h1 className="text-4xl mb-2">
          Services available to <span className="text-accent">{user.orgName}</span>
        </h1>
        <p className="text-ink/70 prose-narrow">
          Enterprise-grade forensic, ergonomic, and placement services from
          credentialed VR counselors and partner vendors. Every paid
          deliverable is reviewed and signed off by your assigned counselor
          before it&apos;s released to you — no draft documents reach your
          inbox unvetted.
        </p>
      </header>

      <section className="border border-accent/30 bg-accent/5 rounded-lg p-5 text-sm">
        <strong className="text-accent block mb-1">
          🔒 How counselor review works
        </strong>
        <p className="text-ink/80">
          When you request a service marked &ldquo;Counselor review
          required,&rdquo; the request enters your counselor&apos;s queue
          first. They approve the engagement, the vendor or in-house expert
          produces the document, and your counselor signs off before it
          appears in your vault. Status updates flow back to you in real
          time on this page.
        </p>
      </section>

      <section>
        <header className="mb-4">
          <p className="text-xs uppercase tracking-widest text-accent">
            🏛️ Enterprise services
          </p>
          <h2 className="text-2xl">Forensic · Ergonomic · Placement</h2>
        </header>
        <div className="grid md:grid-cols-2 gap-4">
          {enterprise.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              user={user}
              myRequests={myRequests}
              onChange={() => setBump((n) => n + 1)}
            />
          ))}
        </div>
      </section>

      <section>
        <header className="mb-4">
          <p className="text-xs uppercase tracking-widest text-accent">
            🆓 Free advocacy tools for your workforce
          </p>
          <h2 className="text-2xl">Community-first tools your employees can use directly</h2>
          <p className="text-sm text-ink/65 mt-1">
            Pathways Pro is community-first. These tools are free and live
            for any individual to use directly — share them with employees
            who could benefit. No employer involvement required.
          </p>
        </header>
        <div className="grid md:grid-cols-2 gap-3">
          {freeTools.map((s) => (
            <FreeToolRow key={s.id} service={s} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl mb-3">Your service requests</h2>
        {myRequests.length === 0 ? (
          <div className="border border-dashed border-ink/20 rounded-lg p-6 text-center text-ink/55">
            You haven&apos;t requested any services yet.
          </div>
        ) : (
          <div className="space-y-3">
            {myRequests.map((r) => (
              <RequestStatusRow key={r.id} req={r} />
            ))}
          </div>
        )}
      </section>

      <footer className="text-xs text-ink/55 italic border-t border-ink/10 pt-3">
        Your view is scoped to your organization. Clinical PHI never crosses
        the boundary — you receive routed deliverables only after counselor
        sign-off.
      </footer>
    </div>
  );
}

function ServiceCard({
  service,
  user,
  myRequests,
  onChange,
}: {
  service: ServiceCatalogItem;
  user: BusinessUser;
  myRequests: ServiceRequest[];
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const eligible = service.audience.includes(user.scopeRole);
  const existing = myRequests.find(
    (r) =>
      r.serviceId === service.id &&
      r.status !== "delivered" &&
      r.status !== "declined",
  );

  return (
    <article className="border border-ink/15 rounded-lg p-5 bg-cream flex flex-col">
      <div className="flex items-baseline justify-between gap-2 flex-wrap mb-2">
        <h3 className="text-lg font-semibold">{service.title}</h3>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-white border border-ink/15">
          {service.category}
        </span>
      </div>
      <p className="text-sm text-ink/70 mb-3 grow">{service.description}</p>
      <ul className="text-xs text-ink/60 space-y-1 mb-3 border-t border-ink/10 pt-2">
        <li>
          <strong>Turnaround:</strong> {service.typicalTurnaround}
        </li>
        <li>
          <strong>Pricing:</strong> {service.priceBand}
        </li>
        {service.counselorReviewRequired && (
          <li className="text-amber-800">
            🔒 Counselor review required before release
          </li>
        )}
      </ul>

      {existing ? (
        <div className="text-xs border border-amber-300 bg-amber-50 text-amber-900 rounded p-2">
          You already have an active request for this service:{" "}
          <strong>{statusLabel(existing.status)}</strong>.
        </div>
      ) : !eligible ? (
        <div className="text-xs text-ink/55 italic">
          Not available for your role ({user.scopeRole}). Talk to your account
          manager.
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="bg-accent text-cream font-semibold px-3 py-1.5 rounded text-sm self-start"
        >
          Request this service →
        </button>
      )}

      {open && (
        <RequestModal
          service={service}
          user={user}
          onClose={() => setOpen(false)}
          onSubmitted={() => {
            setOpen(false);
            onChange();
          }}
        />
      )}
    </article>
  );
}

function RequestModal({
  service,
  user,
  onClose,
  onSubmitted,
}: {
  service: ServiceCatalogItem;
  user: BusinessUser;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [subjectClientName, setSubjectClientName] = useState("");
  const [subjectCaseId, setSubjectCaseId] = useState("");
  const [matterCaption, setMatterCaption] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [notes, setNotes] = useState("");
  const [urgency, setUrgency] =
    useState<ServiceRequest["urgency"]>("routine");

  function submit() {
    const req: ServiceRequest = {
      id: newServiceRequestId(),
      serviceId: service.id,
      serviceTitle: service.title,
      requesterEmail: user.email,
      requesterName: user.name,
      requesterOrgId: user.orgId,
      requesterOrgName: user.orgName,
      subjectClientName: subjectClientName || undefined,
      subjectCaseId: subjectCaseId || undefined,
      matterCaption: matterCaption || undefined,
      jurisdiction: jurisdiction || undefined,
      notes,
      urgency,
      status: service.counselorReviewRequired
        ? "pending-counselor-review"
        : "approved-in-progress",
      requestedAt: new Date().toISOString(),
    };
    appendServiceRequest(req, user.scopeRole);
    onSubmitted();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-modal-title"
      className="fixed inset-0 z-50 bg-ink/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-lg shadow-lg max-w-lg w-full p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <header>
          <h3 id="request-modal-title" className="text-xl font-semibold">
            Request: {service.title}
          </h3>
          <p className="text-xs text-ink/60">
            Submits to your assigned VR counselor for review.
          </p>
        </header>

        <Field label="Subject / claimant name (if applicable)">
          <input
            className="input"
            value={subjectClientName}
            onChange={(e) => setSubjectClientName(e.target.value)}
            placeholder="e.g., Robert Smith"
          />
        </Field>
        <Field label="Case ID (if known)">
          <input
            className="input"
            value={subjectCaseId}
            onChange={(e) => setSubjectCaseId(e.target.value)}
            placeholder="e.g., VR-2026-0029"
          />
        </Field>
        <Field label="Matter caption (for forensic engagements)">
          <input
            className="input"
            value={matterCaption}
            onChange={(e) => setMatterCaption(e.target.value)}
            placeholder='e.g., "Smith v. Acme Logistics"'
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Jurisdiction">
            <input
              className="input"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="e.g., IL · WCAB / IWCC"
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
        </div>
        <Field label="Notes for your counselor">
          <textarea
            className="input min-h-[100px]"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything the reviewing counselor needs to know about scope, deadlines, prior records, etc."
          />
        </Field>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="border border-ink/20 px-4 py-1.5 rounded text-sm hover:bg-ink/5"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="bg-accent text-cream font-semibold px-4 py-1.5 rounded text-sm"
          >
            Submit request →
          </button>
        </div>

        <style jsx>{`
          :global(.input) {
            width: 100%;
            background: white;
            border: 1px solid rgba(31, 29, 26, 0.2);
            border-radius: 6px;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
          }
          :global(.input:focus-visible) {
            outline: 2px solid #b95c3c;
            outline-offset: -1px;
          }
        `}</style>
      </div>
    </div>
  );
}

function FreeToolRow({ service }: { service: ServiceCatalogItem }) {
  const href: Record<string, string> = {
    "accommodation-letter": "/accommodation-letter",
    "problem-analysis": "/self-advocacy/incident-report",
    "eeoc-charge": "/self-advocacy/eeoc",
    "ocr-doj": "/self-advocacy/ocr-doj",
    "business-plan": "/entrepreneurship/business-plan",
  };
  return (
    <a
      href={href[service.id] ?? "#"}
      target="_blank"
      rel="noreferrer"
      className="block border border-emerald-300 bg-emerald-50/30 rounded p-3 hover:border-emerald-500 transition"
    >
      <div className="font-semibold text-sm">
        {service.title} <span className="text-ink/40">↗</span>
      </div>
      <div className="text-xs text-ink/65">{service.description}</div>
    </a>
  );
}

function RequestStatusRow({ req }: { req: ServiceRequest }) {
  return (
    <article className="border border-ink/15 rounded-lg p-4 bg-cream">
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
        <h3 className="font-semibold">{req.serviceTitle}</h3>
        <StatusChip status={req.status} />
      </div>
      <div className="text-sm text-ink/70">
        {req.matterCaption && <span>{req.matterCaption} · </span>}
        Requested {new Date(req.requestedAt).toLocaleDateString()}
        {req.urgency !== "routine" && (
          <span className="text-accent">
            {" "}
            · {req.urgency}
          </span>
        )}
      </div>
      {req.decisionNotes && (
        <div className="text-xs text-ink/65 italic mt-1">
          Counselor note: &ldquo;{req.decisionNotes}&rdquo;
        </div>
      )}
    </article>
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

function StatusChip({ status }: { status: ServiceRequest["status"] }) {
  const styles: Record<ServiceRequest["status"], string> = {
    "pending-counselor-review": "bg-amber-100 text-amber-900",
    "approved-in-progress": "bg-blue-100 text-blue-900",
    "draft-awaiting-release": "bg-purple-100 text-purple-900",
    delivered: "bg-emerald-100 text-emerald-900",
    declined: "bg-rose-100 text-rose-900",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${styles[status]}`}
    >
      {statusLabel(status)}
    </span>
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
      <span className="block mb-1 text-xs uppercase tracking-wider text-ink/60">
        {label}
      </span>
      {children}
    </label>
  );
}
