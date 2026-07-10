"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { getAllVendorUsers } from "@/lib/users";
import {
  authorizationsByVendor,
  loadCoachingLogs,
  loadVendorOrgs,
  placementsByVendor,
} from "@/lib/business-portal";
import { loadServiceRequests } from "@/lib/service-requests";
import { notesForBusinessOrg } from "@/lib/case-notes";
import { CaseNotesPanel } from "@/components/CaseNotesPanel";
import { CaseAssessmentsPanel } from "@/components/CaseAssessmentsPanel";
import { recordCaseOpen } from "@/lib/recent-cases";

export default function CounselorVendorCaseFile() {
  const router = useRouter();
  const params = useParams();
  const vendorId = String(params.id);
  const [user, setUser] = useState<CounselorUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
    recordCaseOpen(s.email, vendorId);
  }, [router, vendorId]);

  const data = useMemo(() => {
    const org = loadVendorOrgs()[vendorId];
    if (!org) return null;
    const primary = Object.values(getAllVendorUsers()).find(
      (u) => u.vendorOrgId === vendorId,
    );
    const auths = authorizationsByVendor(vendorId);
    const placements = placementsByVendor(vendorId);
    const logs = loadCoachingLogs().filter((l) => l.vendorOrgId === vendorId);
    const requests = loadServiceRequests().filter(
      (r) => r.requesterOrgId === vendorId,
    );
    const notes = notesForBusinessOrg(vendorId);
    return { org, primary, auths, placements, logs, requests, notes };
  }, [vendorId, user]);

  if (!user) return null;
  if (!data) {
    return (
      <div className="space-y-3">
        <Link
          href="/dashboard/vendors"
          className="text-xs text-emerald-700 hover:underline"
        >
          ← Vendors
        </Link>
        <h1 className="text-2xl">Vendor not found</h1>
      </div>
    );
  }

  const responseRate = computeResponseRate(data.requests);

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/dashboard/vendors"
          className="text-xs text-emerald-700 hover:underline mb-1 inline-block"
        >
          ← All vendors
        </Link>
        <h1 className="text-3xl font-semibold">{data.org.legalName}</h1>
        <p className="text-ink/65 text-sm mt-1">
          {data.primary?.name} · {data.primary?.credentials}{" "}
          {data.org.stateVendorId && (
            <span className="text-ink/55">· State ID {data.org.stateVendorId}</span>
          )}
        </p>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Authorizations" value={data.auths.length} />
        <Stat label="Placements" value={data.placements.length} />
        <Stat label="Coaching logs" value={data.logs.length} />
        <Stat
          label="Response rate"
          value={`${(responseRate * 100).toFixed(0)}%`}
        />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Active authorizations</h2>
        {data.auths.length === 0 ? (
          <Empty text="No service authorizations on file." />
        ) : (
          <ul role="list" className="space-y-2">
            {data.auths.map((a) => (
              <li key={a.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold">{a.serviceLabel}</h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
                    {a.status}
                  </span>
                </div>
                <p className="text-xs text-ink/65 mt-1">
                  Case {a.caseId} · {a.unitsUsed} / {a.unitsAuthorized} units used
                  · ${a.rate.toFixed(2)}/unit
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Service deliverables</h2>
        {data.requests.length === 0 ? (
          <Empty text="No service requests from this vendor." />
        ) : (
          <ul role="list" className="space-y-2">
            {data.requests.map((r) => (
              <li key={r.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold">{r.serviceTitle}</h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
                    {r.status.replaceAll("-", " ")}
                  </span>
                </div>
                <p className="text-xs text-ink/65 mt-1">
                  Requested {new Date(r.requestedAt).toLocaleDateString()}
                  {r.releasedAt &&
                    ` · Released ${new Date(r.releasedAt).toLocaleDateString()}`}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CaseNotesPanel
        notes={data.notes}
        title="Case notes (auto-generated DAP)"
        emptyLabel="No case notes for this vendor yet."
      />

      <section>
        <h2 className="text-xl font-semibold mb-3">Assessments</h2>
        <CaseAssessmentsPanel
          scopeKind="vendor-org"
          scopeId={vendorId}
          audience="counselor"
          counselorEmail={user.email}
          launchRoute={(toolId) => `/dashboard/vendors/${vendorId}/assessment/${toolId}`}
        />
      </section>
    </div>
  );
}

function computeResponseRate(
  requests: ReturnType<typeof loadServiceRequests>,
): number {
  if (requests.length === 0) return 1;
  const responded = requests.filter(
    (r) => r.status === "delivered" || r.status === "declined",
  ).length;
  return responded / requests.length;
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="saas-card">
      <div className="text-[10px] uppercase tracking-wider text-ink/55">
        {label}
      </div>
      <div className="text-2xl font-bold mt-1 text-ink">{value}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-ink/20 rounded-lg p-6 text-center text-ink/55 text-sm">
      {text}
    </div>
  );
}
