"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  releaseDocument,
  type ServiceRequest,
} from "@/lib/service-requests";
import {
  effectivePrice,
  formatPrice,
  getService,
} from "@/lib/service-catalog";

type OrgKind = "business" | "vendor" | "partner";

interface EnrichedRequest extends ServiceRequest {
  orgKind: OrgKind;
  caseFileHref: string;
  priceLabel: string;
}

export default function ServiceOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [bump, setBump] = useState(0);
  const [orgFilter, setOrgFilter] = useState<"all" | OrgKind>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ServiceRequest["status"]>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const enriched = useMemo<EnrichedRequest[]>(() => {
    if (!user) return [];
    const bizIds = new Set(
      Object.values(getAllBusinessUsers()).map((u) => u.orgId),
    );
    const vendorIds = new Set(
      Object.values(getAllVendorUsers()).map((u) => u.vendorOrgId),
    );
    const partnerIds = new Set(
      Object.values(getAllPartnerUsers()).map((u) => u.partnerOrgId),
    );
    return loadServiceRequests()
      .map((r) => {
        let kind: OrgKind;
        let href: string;
        if (bizIds.has(r.requesterOrgId)) {
          kind = "business";
          href = `/dashboard/business/${r.requesterOrgId}`;
        } else if (vendorIds.has(r.requesterOrgId)) {
          kind = "vendor";
          href = `/dashboard/vendors/${r.requesterOrgId}`;
        } else if (partnerIds.has(r.requesterOrgId)) {
          kind = "partner";
          href = `/dashboard/partners/${r.requesterOrgId}`;
        } else {
          kind = "business";
          href = `/dashboard/business`;
        }
        const svc = getService(r.serviceId);
        const priceLabel = svc
          ? formatPrice(effectivePrice(r.serviceId, user.email), svc.priceUnit)
          : "—";
        return { ...r, orgKind: kind, caseFileHref: href, priceLabel };
      })
      // Prioritize: WIOA-deadline first, then overdue, then by due date
      // ascending, then most recent request. Counselors should clear
      // imminent work before browsing recent.
      .sort((a, b) => priorityScore(a) - priorityScore(b));
  }, [user, bump]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched.filter((r) => {
      if (orgFilter !== "all" && r.orgKind !== orgFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (
        q &&
        !r.serviceTitle.toLowerCase().includes(q) &&
        !r.requesterOrgName.toLowerCase().includes(q) &&
        !(r.matterCaption ?? "").toLowerCase().includes(q) &&
        !(r.subjectClientName ?? "").toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [enriched, orgFilter, statusFilter, query]);

  if (!user) return null;

  function refresh() {
    setBump((n) => n + 1);
  }

  const counts = computeCounts(enriched);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          Service Orders
        </p>
        <h1 className="text-3xl font-semibold">
          Every service request, every state, one queue
        </h1>
        <p className="text-ink/65 text-sm mt-1 prose-narrow">
          Approve, decline, or release deliverables here — all actions flow
          back into the requesting org&apos;s case file and emit the
          appropriate case notes automatically.
        </p>
      </header>

      <section
        className="grid grid-cols-2 md:grid-cols-5 gap-3"
        aria-label="Service order summary"
      >
        <Stat label="Awaiting review" value={counts.pending} alert={counts.pending > 0} />
        <Stat label="Approved · in progress" value={counts.inProgress} />
        <Stat label="Draft awaiting release" value={counts.draftAwaitingRelease} />
        <Stat label="Delivered" value={counts.delivered} />
        <Stat label="Declined" value={counts.declined} />
      </section>

      <section className="saas-card space-y-3">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-ink/55">
            Search service orders
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Service title, organization, matter caption…"
            className="w-full bg-white border border-ink/15 focus:border-cyan-500 rounded-md px-3 py-2 text-sm mt-2 focus:outline-none"
          />
        </label>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-ink/55 uppercase tracking-wider mr-1 self-center">
            Requester:
          </span>
          <Pill active={orgFilter === "all"} onClick={() => setOrgFilter("all")}>
            All ({enriched.length})
          </Pill>
          <Pill active={orgFilter === "business"} onClick={() => setOrgFilter("business")}>
            🏢 Business ({enriched.filter((r) => r.orgKind === "business").length})
          </Pill>
          <Pill active={orgFilter === "vendor"} onClick={() => setOrgFilter("vendor")}>
            🛠️ Vendor ({enriched.filter((r) => r.orgKind === "vendor").length})
          </Pill>
          <Pill active={orgFilter === "partner"} onClick={() => setOrgFilter("partner")}>
            🤝 Partner ({enriched.filter((r) => r.orgKind === "partner").length})
          </Pill>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-ink/55 uppercase tracking-wider mr-1 self-center">
            Status:
          </span>
          <Pill active={statusFilter === "all"} onClick={() => setStatusFilter("all")}>
            All
          </Pill>
          <Pill
            active={statusFilter === "pending-counselor-review"}
            onClick={() => setStatusFilter("pending-counselor-review")}
          >
            Awaiting review
          </Pill>
          <Pill
            active={statusFilter === "approved-in-progress"}
            onClick={() => setStatusFilter("approved-in-progress")}
          >
            In progress
          </Pill>
          <Pill
            active={statusFilter === "draft-awaiting-release"}
            onClick={() => setStatusFilter("draft-awaiting-release")}
          >
            Awaiting release
          </Pill>
          <Pill
            active={statusFilter === "delivered"}
            onClick={() => setStatusFilter("delivered")}
          >
            Delivered
          </Pill>
          <Pill
            active={statusFilter === "declined"}
            onClick={() => setStatusFilter("declined")}
          >
            Declined
          </Pill>
        </div>
      </section>

      <section aria-label="Service orders">
        <h2 className="text-xs uppercase tracking-widest text-ink/55 mb-2">
          {filtered.length} order{filtered.length === 1 ? "" : "s"} shown
        </h2>
        {filtered.length === 0 ? (
          <div className="saas-card text-center text-ink/55 italic">
            No service orders match the current filters.
          </div>
        ) : (
          <ul role="list" className="space-y-3">
            {filtered.map((r) => (
              <OrderRow
                key={r.id}
                order={r}
                counselorEmail={user.email}
                onChange={refresh}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function priorityScore(r: EnrichedRequest): number {
  // Lower number = higher priority. WIOA deadlines always float to top.
  // Then by days-until-due (overdue is negative → comes first).
  // Then by reverse request time (newer last among equally-prioritized).
  const wioaBoost = r.urgency === "wioa-deadline" ? -1_000_000 : 0;
  const expeditedBoost = r.urgency === "expedited" ? -500_000 : 0;
  const due = r.dueDate ? new Date(r.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
  return wioaBoost + expeditedBoost + due;
}

function computeCounts(rows: EnrichedRequest[]) {
  return {
    pending: rows.filter((r) => r.status === "pending-counselor-review").length,
    inProgress: rows.filter((r) => r.status === "approved-in-progress").length,
    draftAwaitingRelease: rows.filter(
      (r) => r.status === "draft-awaiting-release",
    ).length,
    delivered: rows.filter((r) => r.status === "delivered").length,
    declined: rows.filter((r) => r.status === "declined").length,
  };
}

function OrderRow({
  order,
  counselorEmail,
  onChange,
}: {
  order: EnrichedRequest;
  counselorEmail: string;
  onChange: () => void;
}) {
  const orgKindStyles: Record<OrgKind, { bg: string; label: string; icon: string }> = {
    business: { bg: "bg-purple-100 text-purple-900", label: "Business", icon: "🏢" },
    vendor: { bg: "bg-amber-100 text-amber-900", label: "Vendor", icon: "🛠️" },
    partner: { bg: "bg-cyan-100 text-cyan-900", label: "Partner", icon: "🤝" },
  };
  const ok = orgKindStyles[order.orgKind];

  function onApprove() {
    approveRequest(order.id, counselorEmail);
    onChange();
  }

  function onDecline() {
    const reason = window.prompt("Reason for declining this service order?");
    if (reason !== null) {
      declineRequest(order.id, counselorEmail, reason);
      onChange();
    }
  }

  function onRelease() {
    if (
      window.confirm(
        "Release this deliverable to the requesting org? It will appear in their portal immediately.",
      )
    ) {
      releaseDocument(order.id, counselorEmail);
      onChange();
    }
  }

  return (
    <li className="saas-card">
      <header className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span aria-hidden className="text-base">
            {ok.icon}
          </span>
          <h3 className="text-lg font-semibold">{order.serviceTitle}</h3>
          <span
            className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${ok.bg}`}
          >
            {ok.label}
          </span>
        </div>
        <StatusChip status={order.status} />
      </header>

      <p className="text-sm text-ink/75 mt-1">
        <Link
          href={order.caseFileHref}
          className="font-semibold text-cyan-700 hover:underline"
        >
          {order.requesterOrgName} →
        </Link>{" "}
        · requested by {order.requesterName}
      </p>

      <div className="grid sm:grid-cols-5 gap-2 mt-3 text-xs">
        <Tile
          label="Due"
          value={order.dueDate ? dueLabel(order.dueDate) : "—"}
          alert={
            !!order.dueDate &&
            (daysUntil(order.dueDate) <= 3 ||
              order.urgency === "wioa-deadline")
          }
        />
        <Tile label="Requested" value={shortDate(order.requestedAt)} />
        <Tile
          label="Urgency"
          value={order.urgency.replaceAll("-", " ")}
          alert={order.urgency === "wioa-deadline"}
        />
        <Tile label="Price" value={order.priceLabel} />
        <Tile
          label="Subject"
          value={
            order.matterCaption ||
            order.subjectClientName ||
            (order.subjectCaseId ? `Case ${order.subjectCaseId}` : "—")
          }
        />
      </div>

      {order.notes && (
        <p className="text-xs text-ink/65 italic mt-2 border-l-2 border-cyan-300 pl-3">
          &ldquo;{order.notes}&rdquo;
        </p>
      )}

      {order.decisionNotes && (
        <p className="text-xs text-ink/65 italic mt-2 border-l-2 border-emerald-400 pl-3">
          <strong>Counselor note:</strong> {order.decisionNotes}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <Link
          href={`/dashboard/service-orders/${order.id}`}
          className="grad-tealblue text-white text-xs px-3 py-1.5 rounded-md font-semibold"
        >
          {order.status === "pending-counselor-review"
            ? "✨ Open & run AI assessment →"
            : order.status === "approved-in-progress"
              ? "✨ Run AI deliverable →"
              : order.status === "draft-awaiting-release"
                ? "📄 Review & send PDF →"
                : order.status === "delivered"
                  ? "📄 View / print PDF →"
                  : "Open order →"}
        </Link>
        {order.status === "pending-counselor-review" && (
          <>
            <button
              onClick={onApprove}
              className="border border-cyan-500 text-cyan-700 text-xs px-3 py-1.5 rounded-md font-semibold hover:bg-cyan-50"
            >
              ✓ Quick-approve
            </button>
            <button
              onClick={onDecline}
              className="border border-ink/20 text-xs px-3 py-1.5 rounded-md hover:bg-ink/5"
            >
              Decline
            </button>
          </>
        )}
        {order.status === "draft-awaiting-release" && (
          <button
            onClick={onRelease}
            className="bg-purple-700 text-white text-xs px-3 py-1.5 rounded-md font-semibold"
          >
            🚀 Release to {ok.label.toLowerCase()} client
          </button>
        )}
        <Link
          href={order.caseFileHref}
          className="text-xs text-cyan-700 hover:underline self-center"
        >
          Open in case →
        </Link>
      </div>
    </li>
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

function Stat({
  label,
  value,
  alert,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div
      className={`saas-card ${alert && value > 0 ? "border-rose-300 bg-rose-50/40" : ""}`}
    >
      <div className="text-[10px] uppercase tracking-wider text-ink/55">
        {label}
      </div>
      <div
        className={`text-2xl font-bold mt-1 ${alert && value > 0 ? "text-rose-700" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}

function Tile({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div
      className={`border rounded p-2 ${alert ? "border-rose-300 bg-rose-50/40" : "border-ink/10 bg-white"}`}
    >
      <div className="text-[10px] uppercase tracking-wider text-ink/55">
        {label}
      </div>
      <div
        className={`text-xs font-semibold mt-0.5 ${alert ? "text-rose-700" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}

function Pill({
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
      aria-pressed={active}
      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
        active
          ? "grad-tealblue text-white"
          : "border border-ink/15 text-ink/70 hover:border-cyan-500"
      }`}
    >
      {children}
    </button>
  );
}

function daysUntil(iso: string): number {
  return Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000),
  );
}

function dueLabel(iso: string): string {
  const d = daysUntil(iso);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  return `${shortDate(iso)} · ${d}d`;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
