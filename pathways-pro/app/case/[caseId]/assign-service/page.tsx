"use client";

// Counselor-facing client service assignment. Used to assign a
// Category A (client-facing ancillary) service to a vocational client.
// Creates a ServiceRequest with the client as both subject and
// recipient — status starts as "approved-in-progress" because the
// counselor is the one assigning it.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { CLIENTS } from "@/lib/users";
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

export default function AssignServicePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = String(params.caseId);
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [selected, setSelected] = useState<CatalogService | null>(null);
  const [category, setCategory] = useState<ServiceCategory | "all">(
    "client-services",
  );
  const [notes, setNotes] = useState("");
  const [urgency, setUrgency] =
    useState<ServiceRequest["urgency"]>("routine");
  const defaultDue = useMemo(
    () =>
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
    [],
  );
  const [dueDate, setDueDate] = useState(defaultDue);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const client = useMemo(
    () => Object.values(CLIENTS).find((c) => c.caseId === caseId),
    [caseId],
  );

  const services = useMemo(() => {
    const all = servicesForAudience("client");
    return category === "all"
      ? all
      : all.filter((s) => s.category === category);
  }, [category]);

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
        <h1 className="text-2xl">Client not found</h1>
      </div>
    );
  }

  function assign() {
    if (!selected || !user || !client) return;
    setCreating(true);
    const id = newServiceRequestId();
    appendServiceRequest({
      id,
      serviceId: selected.id,
      serviceTitle: selected.title,
      requesterEmail: user.email,
      requesterName: user.name,
      requesterOrgId: "agency-" + user.email.split("@")[1],
      requesterOrgName: user.agency,
      subjectClientName: client.name,
      subjectCaseId: client.caseId,
      notes:
        notes ||
        `Assigned by counselor ${user.name} for client ${client.name}.`,
      urgency,
      dueDate,
      assignedCounselorEmail: user.email,
      status: "approved-in-progress",
      requestedAt: new Date().toISOString(),
      decisionedAt: new Date().toISOString(),
      decisionedByEmail: user.email,
    });
    approveRequest(id, user.email);
    router.push(`/dashboard/service-orders/${id}`);
  }

  const availableCategories = Array.from(
    new Set(servicesForAudience("client").map((s) => s.category)),
  );

  return (
    <div className="space-y-6">
      <header>
        <Link
          href={`/case/${caseId}`}
          className="text-xs text-cyan-700 hover:underline mb-1 inline-block"
        >
          ← {client.name}
        </Link>
        <h1 className="text-3xl font-semibold">
          Assign a service to {client.name}
        </h1>
        <p className="text-ink/65 text-sm mt-1">
          Pick from the client-facing ancillary services to add to{" "}
          {client.name}&apos;s active plan. The service lands on your
          Service Orders queue pre-approved, ready for you to deliver, and
          appears in {client.name}&apos;s portal under their active services.
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
            All ({servicesForAudience("client").length})
          </CatPill>
          {availableCategories.map((cat) => {
            const count = servicesForAudience("client").filter(
              (s) => s.category === cat,
            ).length;
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
                  <p className="text-[10px] uppercase tracking-wider text-ink/55 mt-2">
                    Turnaround: {s.turnaround}
                  </p>
                </button>
              </li>
            );
          })}
        </ul>
        {services.length === 0 && (
          <p className="text-sm text-ink/55 italic">
            No client-facing services in this category.
          </p>
        )}
      </section>

      {selected && (
        <section className="saas-card">
          <h2 className="text-lg font-semibold mb-3">
            Step 2 · Confirm assignment of{" "}
            <span className="text-cyan-700">{selected.title}</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
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
            <Field label="Target completion">
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
                placeholder="Why this service? What outcome are you targeting?"
                className="w-full bg-white border border-ink/15 rounded-md px-3 py-2 text-sm sm:col-span-2"
              />
            </Field>
          </div>

          <div className="mt-5 flex gap-2 items-center flex-wrap">
            <button
              onClick={assign}
              disabled={creating}
              className="grad-tealblue text-white font-semibold px-5 py-2.5 rounded-md text-sm disabled:opacity-50"
            >
              {creating
                ? "Assigning…"
                : `✓ Assign to ${client.name} and open`}
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
