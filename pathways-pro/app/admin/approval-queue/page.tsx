"use client";

import { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Mail,
  Building,
  User,
} from "lucide-react";
import {
  MOCK_ACCESS_REQUESTS,
  ROLE_LABELS,
  type AccessRequest,
  type RequestStatus,
} from "@/lib/rbac";

export default function ApprovalQueuePage() {
  const [requests, setRequests] = useState<AccessRequest[]>(
    MOCK_ACCESS_REQUESTS,
  );
  const [filter, setFilter] = useState<RequestStatus | "all">("pending");

  function updateStatus(id: string, status: RequestStatus) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r)),
    );
  }

  const filtered =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);
  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-accent" />
            Approval Queue
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            Review and approve pending access requests.
            {pendingCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1 bg-ink/5 rounded-lg p-1">
          {(["all", "pending", "approved", "denied"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition capitalize ${
                filter === f
                  ? "bg-white shadow-sm text-accent"
                  : "text-ink/55 hover:text-ink"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Request cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-ink/50 text-sm">
          No {filter === "all" ? "" : filter} requests to display.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onApprove={() => updateStatus(req.id, "approved")}
              onDeny={() => updateStatus(req.id, "denied")}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Individual request card ─────────────────────────────────────── */

function RequestCard({
  request,
  onApprove,
  onDeny,
}: {
  request: AccessRequest;
  onApprove: () => void;
  onDeny: () => void;
}) {
  const isPending = request.status === "pending";
  const isApproved = request.status === "approved";

  return (
    <div
      className={`bg-white border rounded-xl p-5 transition ${
        isPending
          ? "border-amber-200 shadow-sm"
          : isApproved
            ? "border-emerald-200"
            : "border-ink/10 opacity-70"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* User info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-accent/10 grid place-items-center flex-shrink-0">
              <User className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{request.name}</h3>
              <div className="flex items-center gap-3 text-xs text-ink/55">
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {request.email}
                </span>
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3" />
                  {request.organization}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="bg-accent/10 text-accent px-2 py-0.5 rounded-full font-semibold">
              {ROLE_LABELS[request.requestedRole]}
            </span>
            <span className="text-ink/45">
              Submitted{" "}
              {new Date(request.submittedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Action buttons */}
        {isPending && (
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={onApprove}
              className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-semibold text-sm px-4 py-2 rounded-md hover:bg-emerald-700 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={onDeny}
              className="inline-flex items-center gap-1.5 border border-red-300 text-red-600 font-semibold text-sm px-4 py-2 rounded-md hover:bg-red-50 transition"
            >
              <XCircle className="w-4 h-4" />
              Deny
            </button>
          </div>
        )}

        {isApproved && (
          <div className="flex items-center gap-2 text-emerald-600 text-sm font-semibold flex-shrink-0">
            <Mail className="w-4 h-4" />
            Invite sent
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: RequestStatus }) {
  const styles = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-emerald-100 text-emerald-800",
    denied: "bg-red-100 text-red-800",
  };
  const icons = {
    pending: Clock,
    approved: CheckCircle2,
    denied: XCircle,
  };
  const Icon = icons[status];

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${styles[status]}`}
    >
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
}
