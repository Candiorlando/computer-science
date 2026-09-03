"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { CLIENTS, getAllBusinessUsers, getAllVendorUsers } from "@/lib/users";
import { loadCaseNotes } from "@/lib/case-notes";
import { loadServiceRequests } from "@/lib/service-requests";
import {
  loadOpportunities,
  loadPartnerOrgs,
  loadCEEngagements,
  loadPartnerPlacements,
} from "@/lib/employment-partners";
import { arSummary, formatMoney } from "@/lib/financials";

export default function ReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const reports = useMemo(() => {
    if (!user) return null;
    const clients = user.clientKeys.map((k) => CLIENTS[k]).filter(Boolean);
    const notes = loadCaseNotes();
    const myCaseNotes = notes.filter(
      (n) => n.clientCaseId && clients.some((c) => c.caseId === n.clientCaseId),
    );
    const requests = loadServiceRequests();
    const businesses = Object.values(getAllBusinessUsers());
    const vendors = Object.values(getAllVendorUsers());
    const partnerOrgs = Object.values(loadPartnerOrgs());
    const opps = loadOpportunities();
    const ce = loadCEEngagements();
    const places = loadPartnerPlacements();
    const ar = arSummary(user.email);
    return {
      clients,
      myCaseNotes,
      requests,
      businesses,
      vendors,
      partnerOrgs,
      opps,
      ce,
      places,
      ar,
    };
  }, [user]);

  if (!user || !reports) return null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          Reports
        </p>
        <h1 className="text-3xl font-semibold">Caseload, services, outcomes</h1>
      </header>

      <ReportBlock title="📋 Caseload Report">
        <Row label="Active clients" value={reports.clients.filter((c) => c.status !== "Job Placement").length} />
        <Row label="Job placement (closed-successful)" value={reports.clients.filter((c) => c.status === "Job Placement").length} />
        <Row label="In assessment" value={reports.clients.filter((c) => c.status === "Assessment Phase").length} />
        <Row label="In training" value={reports.clients.filter((c) => c.status === "In Training").length} />
        <Row label="Intake" value={reports.clients.filter((c) => c.status === "Intake").length} />
      </ReportBlock>

      <ReportBlock title="📈 Client Progress Report (aggregate)">
        <Row
          label="Goals identified (IPE signed)"
          value={reports.myCaseNotes.filter((n) => n.eventKind === "ipe-signed").length}
        />
        <Row
          label="Self-advocacy actions"
          value={
            reports.myCaseNotes.filter(
              (n) =>
                n.eventKind === "accommodation-letter-generated" ||
                n.eventKind === "problem-analysis-generated" ||
                n.eventKind === "eeoc-charge-generated" ||
                n.eventKind === "ocr-doj-complaint-generated",
            ).length
          }
        />
        <Row
          label="Resume + cover-letter packets"
          value={reports.myCaseNotes.filter((n) => n.eventKind === "resume-generated").length}
        />
        <Row
          label="Assessments completed (Interest Profiler / TSA)"
          value={
            reports.myCaseNotes.filter(
              (n) =>
                n.eventKind === "interest-profiler-completed" ||
                n.eventKind === "tsa-completed",
            ).length
          }
        />
        <Row
          label="Employment milestones (placements offered / accepted)"
          value={
            reports.myCaseNotes.filter(
              (n) =>
                n.eventKind === "partner-placement-offered" ||
                n.eventKind === "partner-placement-accepted",
            ).length
          }
        />
      </ReportBlock>

      <ReportBlock title="🛠️ Vendor Performance Report">
        <Row label="Vendors on file" value={reports.vendors.length} />
        <Row
          label="Service deliverables completed (delivered)"
          value={reports.requests.filter((r) => r.status === "delivered").length}
        />
        <Row
          label="Service deliverables declined"
          value={reports.requests.filter((r) => r.status === "declined").length}
        />
        <Row
          label="Average days from request → delivery"
          value={averageDeliveryDays(reports.requests).toFixed(1)}
        />
      </ReportBlock>

      <ReportBlock title="🏢 Business Client Report">
        <Row label="Active business accounts" value={reports.businesses.length} />
        <Row
          label="Services requested"
          value={reports.requests.filter((r) => reports.businesses.some((b) => b.orgId === r.requesterOrgId)).length}
        />
        <Row
          label="Awaiting counselor approval"
          value={reports.requests.filter((r) => r.status === "pending-counselor-review").length}
        />
        <Row
          label="Delivered this quarter"
          value={
            reports.requests.filter(
              (r) =>
                r.status === "delivered" &&
                r.releasedAt &&
                Date.parse(r.releasedAt) >= startOfQuarter(),
            ).length
          }
        />
      </ReportBlock>

      <ReportBlock title="🤝 Employment Partner Report">
        <Row label="Active partners" value={reports.partnerOrgs.length} />
        <Row label="Opportunities posted (lifetime)" value={reports.opps.length} />
        <Row
          label="Open opportunities"
          value={reports.opps.filter((o) => o.status === "open").length}
        />
        <Row
          label="Customized Employment engagements"
          value={reports.ce.length}
        />
        <Row
          label="CE engagements at stabilization or beyond"
          value={
            reports.ce.filter((e) =>
              ["stabilization", "long-term-support"].includes(e.currentStage),
            ).length
          }
        />
        <Row label="Active placements" value={reports.places.length} />
      </ReportBlock>

      <ReportBlock title="💰 Financial Summary">
        <Row label="AR outstanding" value={formatMoney(reports.ar.outstandingCents)} />
        <Row label="AR overdue" value={formatMoney(reports.ar.overdueCents)} />
        <Row label="Collected this quarter" value={formatMoney(reports.ar.collectedThisQuarterCents)} />
      </ReportBlock>
    </div>
  );
}

function averageDeliveryDays(
  requests: ReturnType<typeof loadServiceRequests>,
): number {
  const completed = requests.filter(
    (r) => r.status === "delivered" && r.releasedAt,
  );
  if (completed.length === 0) return 0;
  const totalDays = completed.reduce((s, r) => {
    const days =
      (Date.parse(r.releasedAt!) - Date.parse(r.requestedAt)) /
      (24 * 60 * 60 * 1000);
    return s + days;
  }, 0);
  return totalDays / completed.length;
}

function startOfQuarter(): number {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3);
  return new Date(now.getFullYear(), q * 3, 1).getTime();
}

function ReportBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="saas-card">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <div className="space-y-1.5">{children}</div>
    </section>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-baseline justify-between text-sm border-b border-ink/10 pb-1.5 last:border-0">
      <span className="text-ink/75">{label}</span>
      <span className="font-semibold text-ink tabular-nums">{value}</span>
    </div>
  );
}
