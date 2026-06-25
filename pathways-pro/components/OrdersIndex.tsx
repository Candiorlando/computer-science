"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  loadServiceRequests,
  type ServiceRequest,
  type ServiceRequestStatus,
} from "@/lib/service-requests";
import { CATEGORY_LABELS, getService } from "@/lib/service-catalog";

type Tab = "all" | "in-progress" | "delivered";

interface Props {
  orgId: string;
  // Where service-order detail pages live for this portal —
  // e.g. /business-portal/orders. The order id is appended.
  basePath: string;
  // Where the catalog lives, for the empty-state link.
  catalogPath: string;
}

export function OrdersIndex({ orgId, basePath, catalogPath }: Props) {
  const [tab, setTab] = useState<Tab>("all");

  const orders = useMemo(
    () =>
      loadServiceRequests()
        .filter((r) => r.requesterOrgId === orgId)
        .sort((a, b) => {
          if (a.status === "delivered" && b.status !== "delivered") return -1;
          if (b.status === "delivered" && a.status !== "delivered") return 1;
          return (
            new Date(b.requestedAt).getTime() -
            new Date(a.requestedAt).getTime()
          );
        }),
    [orgId],
  );

  const counts = {
    all: orders.length,
    "in-progress": orders.filter(
      (o) => o.status !== "delivered" && o.status !== "declined",
    ).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const filtered = useMemo(() => {
    if (tab === "all") return orders;
    if (tab === "delivered")
      return orders.filter((o) => o.status === "delivered");
    return orders.filter(
      (o) => o.status !== "delivered" && o.status !== "declined",
    );
  }, [orders, tab]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Service Orders</h1>
        <p className="text-ink/65 text-sm mt-1">
          Every service your team has requested, including the finished
          counselor-prepared deliverables. Click a delivered order to view
          or download the document.
        </p>
      </header>

      <div className="grid sm:grid-cols-3 gap-3">
        <Stat label="Total orders" value={counts.all} tone="grad-tealblue-soft" />
        <Stat
          label="In progress"
          value={counts["in-progress"]}
          tone="bg-amber-50 border-amber-200"
        />
        <Stat
          label="Delivered"
          value={counts.delivered}
          tone="bg-emerald-50 border-emerald-200"
        />
      </div>

      <div
        role="tablist"
        aria-label="Filter service orders by status"
        className="flex gap-2 flex-wrap"
      >
        <TabBtn current={tab} target="all" onClick={setTab}>
          All ({counts.all})
        </TabBtn>
        <TabBtn current={tab} target="in-progress" onClick={setTab}>
          In progress ({counts["in-progress"]})
        </TabBtn>
        <TabBtn current={tab} target="delivered" onClick={setTab}>
          Delivered ({counts.delivered})
        </TabBtn>
      </div>

      {filtered.length === 0 ? (
        <section className="saas-card text-center py-12">
          <p className="text-ink/65">
            {tab === "delivered"
              ? "No delivered orders yet. They appear here once your counselor releases the finished document."
              : tab === "in-progress"
                ? "No active service orders right now."
                : "You haven't requested any services yet."}
          </p>
          <Link
            href={catalogPath}
            className="inline-block mt-4 text-sm text-cyan-700 hover:underline"
          >
            Browse the Service Catalog →
          </Link>
        </section>
      ) : (
        <ul role="list" className="space-y-3">
          {filtered.map((order) => (
            <OrderRow key={order.id} order={order} basePath={basePath} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderRow({
  order,
  basePath,
}: {
  order: ServiceRequest;
  basePath: string;
}) {
  const service = getService(order.serviceId);
  const isDelivered = order.status === "delivered";
  const dueDays = order.dueDate ? daysUntil(order.dueDate) : null;
  return (
    <li>
      <Link
        href={`${basePath}/${order.id}`}
        className={`block saas-card hover:shadow-md transition ${
          isDelivered
            ? "border-emerald-300 bg-emerald-50/30"
            : order.status === "declined"
              ? "border-rose-300 bg-rose-50/30"
              : ""
        }`}
      >
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="text-lg font-semibold">{order.serviceTitle}</h2>
            <StatusChip status={order.status} />
          </div>
          <p className="text-xs text-ink/55">
            Requested{" "}
            {new Date(order.requestedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>

        <p className="text-xs text-ink/65 mt-1">
          {service && (
            <span className="capitalize">
              {CATEGORY_LABELS[service.category]}
            </span>
          )}
          {order.matterCaption && <span> · Matter: {order.matterCaption}</span>}
          {order.subjectClientName && (
            <span> · Subject: {order.subjectClientName}</span>
          )}
        </p>

        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink/65">
          <span>
            <strong>Requester:</strong> {order.requesterName}
          </span>
          {order.dueDate && !isDelivered && (
            <span>
              <strong>Due:</strong>{" "}
              {new Date(order.dueDate).toLocaleDateString()}{" "}
              {dueDays !== null && dueDays >= 0 && (
                <span className="text-ink/55">
                  ({dueDays} day{dueDays === 1 ? "" : "s"})
                </span>
              )}
              {dueDays !== null && dueDays < 0 && (
                <span className="text-rose-700 font-semibold">
                  ({Math.abs(dueDays)} day{Math.abs(dueDays) === 1 ? "" : "s"}{" "}
                  overdue)
                </span>
              )}
            </span>
          )}
          {isDelivered && order.sentToClientAt && (
            <span>
              <strong>Delivered:</strong>{" "}
              {new Date(order.sentToClientAt).toLocaleDateString()}
            </span>
          )}
          <span>
            <strong>Urgency:</strong>{" "}
            <span className="capitalize">
              {order.urgency.replaceAll("-", " ")}
            </span>
          </span>
        </div>

        <div className="mt-3 text-sm font-semibold text-cyan-700">
          {isDelivered
            ? "📄 View / print delivered document →"
            : order.status === "declined"
              ? "View decline reason →"
              : "Track progress →"}
        </div>
      </Link>
    </li>
  );
}

function StatusChip({ status }: { status: ServiceRequestStatus }) {
  const styles: Record<ServiceRequestStatus, string> = {
    "pending-counselor-review": "bg-amber-100 text-amber-900",
    "approved-in-progress": "bg-blue-100 text-blue-900",
    "draft-awaiting-release": "bg-purple-100 text-purple-900",
    delivered: "bg-emerald-100 text-emerald-900",
    declined: "bg-rose-100 text-rose-900",
  };
  const labels: Record<ServiceRequestStatus, string> = {
    "pending-counselor-review": "Awaiting counselor review",
    "approved-in-progress": "Counselor working",
    "draft-awaiting-release": "Final review",
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

function TabBtn({
  current,
  target,
  onClick,
  children,
}: {
  current: Tab;
  target: Tab;
  onClick: (t: Tab) => void;
  children: React.ReactNode;
}) {
  const active = current === target;
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => onClick(target)}
      className={`text-sm px-3 py-1.5 rounded-full font-semibold transition ${
        active
          ? "grad-tealblue text-white"
          : "bg-white border border-ink/15 hover:bg-ink/5"
      }`}
    >
      {children}
    </button>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className={`saas-card ${tone}`}>
      <div className="text-xs uppercase tracking-wider font-semibold text-ink/65">
        {label}
      </div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}

function daysUntil(iso: string): number {
  const due = new Date(iso);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}
