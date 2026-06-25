"use client";

// Counselor-facing service request creation page. Used when the
// counselor is on a call or in a meeting with a business client and
// wants to spin up a service order on the spot. The request is
// created in "approved-in-progress" status because the counselor is
// the one making it — no separate approval step needed.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { getAllBusinessUsers } from "@/lib/users";
import {
  loadBusinessOrgs,
  type BusinessOrg,
} from "@/lib/business-portal";
import {
  appendServiceRequest,
  newServiceRequestId,
  approveRequest,
  type ServiceRequest,
} from "@/lib/service-requests";
import {
  CATEGORY_LABELS,
  effectivePrice,
  formatPrice,
  servicesForAudience,
  type CatalogService,
  type ServiceCategory,
} from "@/lib/service-catalog";

export default function CounselorRequestServicePage() {
  const router = useRouter();
  const params = useParams();
  const orgId = String(params.orgId);
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [org, setOrg] = useState<BusinessOrg | null>(null);
  const [selected, setSelected] = useState<CatalogService | null>(null);
  const [category, setCategory] = useState<ServiceCategory | "all">("all");
  const [matter, setMatter] = useState("");
  const [subjectClient, setSubjectClient] = useState("");
  const [subjectCaseId, setSubjectCaseId] = useState("");
  const [urgency, setUrgency] =
    useState<ServiceRequest["urgency"]>("routine");
  const defaultDue = useMemo(
    () =>
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
    [],
  );
  const [dueDate, setDueDate] = useState(defaultDue);
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
    setOrg(loadBusinessOrgs()[orgId] ?? null);
  }, [router, orgId]);

  const services = useMemo(() => {
    const all = servicesForAudience("business");
    return category === "all"
      ? all
      : all.filter((s) => s.category === category);
  }, [category]);

  const primaryContact = useMemo(() => {
    if (!org) return null;
    return Object.values(getAllBusinessUsers()).find(
      (u) => u.orgId === orgId,
    );
  }, [org, orgId]);

  if (!user) return null;
  if (!org) {
    return (
      <div className="space-y-3">
        <Link
          href="/dashboard/business"
          className="text-xs text-cyan-700 hover:underline"
        >
          ← Business Clients
        </Link>
        <h1 className="text-2xl">Business not found</h1>
      </div>
    );
  }

  function createRequest() {
    if (!selected || !user || !org) return;
    setCreating(true);
    const id = newServiceRequestId();
    const requesterEmail =
      primaryContact?.email ?? `${orgId}@pathwayspro.app`;
    const requesterName =
      primaryContact?.name ?? org.primaryContact?.split(" · ")[0] ?? org.legalName;
    appendServiceRequest({
      id,
      serviceId: selected.id,
      serviceTitle: selected.title,
      requesterEmail,
      requesterName,
      requesterOrgId: orgId,
      requesterOrgName: org.legalName,
      subjectClientName: subjectClient || undefined,
      subjectCaseId: subjectCaseId || undefined,
      matterCaption: matter || undefined,
      notes: notes || "Created by counselor during business consultation.",
      urgency,
      dueDate,
      assignedCounselorEmail: user.email,
      status: "approved-in-progress",
      requestedAt: new Date().toISOString(),
      decisionedAt: new Date().toISOString(),
      decisionedByEmail: user.email,
    });
    // Also run approveRequest so the case-note and activity feed get
    // an "approved" event recorded the same way they would for a
    // business-initiated request.
    approveRequest(id, user.email);
    router.push(`/dashboard/service-orders/${id}`);
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href={`/dashboard/business/${orgId}`}
          className="text-xs text-cyan-700 hover:underline mb-1 inline-block"
        >
          ← {org.legalName}
        </Link>
        <h1 className="text-3xl font-semibold">
          Request a service for {org.legalName}
        </h1>
        <p className="text-ink/65 text-sm mt-1">
          Spin up a service order on the spot — useful when you&apos;re on a
          call or in a meeting with the business and want to commit to a
          deliverable. The order opens in your Service Orders queue with
          your name on it, pre-approved, ready to draft.
        </p>
      </header>

      <section className="saas-card">
        <h2 className="text-lg font-semibold mb-3">Step 1 · Pick a service</h2>
        <div
          role="tablist"
          aria-label="Filter services by category"
          className="flex flex-wrap gap-2 mb-4"
        >
          <CatPill
            current={category}
            target="all"
            onClick={() => setCategory("all")}
          >
            All ({servicesForAudience("business").length})
          </CatPill>
          {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((cat) => {
            const count = servicesForAudience("business").filter(
              (s) => s.category === cat,
            ).length;
            if (count === 0) return null;
            return (
              <CatPill
                key={cat}
                current={category}
                target={cat}
                onClick={() => setCategory(cat)}
              >
                {CATEGORY_LABELS[cat]} ({count})
              </CatPill>
            );
          })}
        </div>

        <ul role="list" className="grid sm:grid-cols-2 gap-3">
          {services.map((s) => {
            const isSelected = selected?.id === s.id;
            const price = effectivePrice(s.id, user.email);
            return (
              <li key={s.id}>
                <button
                  onClick={() => setSelected(s)}
                  aria-pressed={isSelected}
                  className={`text-left w-full border-2 rounded-lg p-3 transition ${
                    isSelected
                      ? "border-cyan-500 bg-cyan-50/40"
                      : "border-ink/15 hover:border-cyan-300 hover:bg-cyan-50/20"
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm">{s.title}</h3>
                    <span className="text-xs text-cyan-700 font-semibold">
                      {formatPrice(price, s.priceUnit)}
                    </span>
                  </div>
                  <p className="text-xs text-ink/65 mt-1 line-clamp-2">
                    {s.description}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
        {services.length === 0 && (
          <p className="text-sm text-ink/55 italic">
            No services in this category.
          </p>
        )}
      </section>

      {selected && (
        <section className="saas-card">
          <h2 className="text-lg font-semibold mb-3">
            Step 2 · Confirm details for{" "}
            <span className="text-cyan-700">{selected.title}</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Matter / engagement caption">
              <input
                value={matter}
                onChange={(e) => setMatter(e.target.value)}
                placeholder="e.g., Logistics ADA audit Q3 2026"
                className="w-full bg-white border border-ink/15 rounded-md px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Subject client (optional)">
              <input
                value={subjectClient}
                onChange={(e) => setSubjectClient(e.target.value)}
                placeholder="e.g., Marcus Thomas"
                className="w-full bg-white border border-ink/15 rounded-md px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Case ID (optional)">
              <input
                value={subjectCaseId}
                onChange={(e) => setSubjectCaseId(e.target.value)}
                placeholder="e.g., VR-2026-0029"
                className="w-full bg-white border border-ink/15 rounded-md px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Urgency">
              <select
                value={urgency}
                onChange={(e) =>
                  setUrgency(e.target.value as ServiceRequest["urgency"])
                }
                className="w-full bg-white border border-ink/15 rounded-md px-3 py-2 text-sm"
              >
                <option value="routine">Routine</option>
                <option value="expedited">Expedited</option>
                <option value="wioa-deadline">WIOA / statutory deadline</option>
              </select>
            </Field>
            <Field label="Due date">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-white border border-ink/15 rounded-md px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Internal notes (counselor)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="What did the business ask for? Any specifics from the conversation?"
                className="w-full bg-white border border-ink/15 rounded-md px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <div className="mt-5 flex gap-2 items-center flex-wrap">
            <button
              onClick={createRequest}
              disabled={creating}
              className="grad-tealblue text-white font-semibold px-5 py-2.5 rounded-md text-sm disabled:opacity-50"
            >
              {creating
                ? "Creating order…"
                : "✓ Create service order and open"}
            </button>
            <button
              onClick={() => setSelected(null)}
              className="text-sm text-ink/65 hover:text-ink px-3 py-2"
            >
              Pick a different service
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

function CatPill({
  current,
  target,
  onClick,
  children,
}: {
  current: ServiceCategory | "all";
  target: ServiceCategory | "all";
  onClick: () => void;
  children: React.ReactNode;
}) {
  const active = current === target;
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
        active
          ? "grad-tealblue text-white"
          : "bg-white border border-ink/15 hover:bg-ink/5"
      }`}
    >
      {children}
    </button>
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
      <span className="block text-[10px] uppercase tracking-wider text-ink/55 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
