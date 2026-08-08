"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { BusinessUser } from "@/lib/users";
import {
  acknowledgeRoute,
  contractDocsForOrg,
  caseDocsForOrg,
  docKindLabel,
  getCurrentBusinessOrg,
  type DocumentForRecipient,
} from "@/lib/business-portal";
import { seedBusinessPortal } from "@/lib/business-portal-seed";
import {
  apSummaryForOrg,
  formatMoney,
  seedDemoInvoicesIfEmpty,
} from "@/lib/financials";

export default function BusinessDocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<BusinessUser | null>(null);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "business") return router.replace("/portal");
    seedBusinessPortal();
    seedDemoInvoicesIfEmpty();
    setUser(s);
  }, [router]);

  const data = useMemo(() => {
    if (!user) return null;
    return {
      org: getCurrentBusinessOrg(user),
      contracts: contractDocsForOrg(user.orgId),
      caseDocs: caseDocsForOrg(user.orgId),
      ap: apSummaryForOrg(user.orgId),
    };
  }, [user, bump]);

  if (!user || !data) return null;

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          {data.org?.legalName ?? user.orgName}
        </p>
        <h1 className="text-3xl font-semibold">Documents</h1>
        <p className="text-ink/65 text-sm mt-1 max-w-2xl">
          Your organization&rsquo;s contracts and agreements, the case and
          service deliverables routed to you (FCE/RTW reports, wage-earning
          capacity assessments, job description analyses, accommodation
          letters), and a snapshot of what you owe. Clinical case records
          stay with the client &mdash; only deliverables explicitly routed
          to your organization appear here.
        </p>
      </header>

      <ContractsSection docs={data.contracts} onAck={() => setBump((n) => n + 1)} />
      <CaseDocsSection docs={data.caseDocs} onAck={() => setBump((n) => n + 1)} />
      <APSection orgId={user.orgId} ap={data.ap} />
    </div>
  );
}

function ContractsSection({
  docs,
  onAck,
}: {
  docs: DocumentForRecipient[];
  onAck: () => void;
}) {
  return (
    <section>
      <h2 className="text-2xl mb-1">Contracts &amp; agreements</h2>
      <p className="text-sm text-ink/60 mb-3">
        Your Master Service Agreement, certificates of insurance, and other
        governing paperwork with your Pathways Pro agency.
      </p>
      {docs.length === 0 ? (
        <Empty>No contracts on file yet.</Empty>
      ) : (
        <div className="space-y-3">
          {docs.map(({ doc, route }) => (
            <article
              key={route.id}
              className={`border rounded-lg p-4 ${
                route.acknowledgedAt
                  ? "border-ink/15 bg-cream"
                  : "border-amber-300 bg-amber-50/40"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                <h3 className="font-semibold">{doc.title}</h3>
                <span className="text-xs uppercase tracking-wider text-ink/55">
                  {docKindLabel(doc.kind)}
                </span>
              </div>
              <div className="text-sm text-ink/70">
                Uploaded by {doc.uploadedByName} ·{" "}
                {new Date(doc.uploadedAt).toLocaleDateString()} ·{" "}
                {Math.round(doc.sizeBytes / 1024)} KB
              </div>
              <div className="flex items-center justify-between gap-2 mt-3 text-xs">
                {route.acknowledgedAt ? (
                  <span className="text-emerald-700 font-semibold">
                    ✓ {route.accessKind === "sign" ? "Signed" : "Acknowledged"}{" "}
                    {new Date(route.acknowledgedAt).toLocaleDateString()}
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      acknowledgeRoute(route.id);
                      onAck();
                    }}
                    className="bg-accent text-cream px-3 py-1.5 rounded font-semibold"
                  >
                    {route.accessKind === "sign" ? "Review & sign" : "Acknowledge"}
                  </button>
                )}
                <span className="text-ink/55">Access: {route.accessKind}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function CaseDocsSection({
  docs,
  onAck,
}: {
  docs: DocumentForRecipient[];
  onAck: () => void;
}) {
  return (
    <section>
      <h2 className="text-2xl mb-1">Case &amp; service documents</h2>
      <p className="text-sm text-ink/60 mb-3">
        Deliverables your counselor or a retained expert has routed to your
        organization — never the underlying clinical case file.
      </p>
      {docs.length === 0 ? (
        <Empty>No case or service documents routed to you yet.</Empty>
      ) : (
        <div className="space-y-3">
          {docs.map(({ doc, route }) => (
            <article
              key={route.id}
              className={`border rounded-lg p-4 ${
                route.acknowledgedAt
                  ? "border-ink/15 bg-cream"
                  : "border-amber-300 bg-amber-50/40"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                <h3 className="font-semibold">{doc.title}</h3>
                <span className="text-xs uppercase tracking-wider text-ink/55">
                  {docKindLabel(doc.kind)}
                </span>
              </div>
              <div className="text-sm text-ink/70">
                Uploaded by {doc.uploadedByName} ·{" "}
                {new Date(doc.uploadedAt).toLocaleDateString()} ·{" "}
                {Math.round(doc.sizeBytes / 1024)} KB
              </div>
              <div className="flex items-center justify-between gap-2 mt-3 text-xs">
                {route.acknowledgedAt ? (
                  <span className="text-emerald-700 font-semibold">
                    ✓ Acknowledged{" "}
                    {new Date(route.acknowledgedAt).toLocaleDateString()}
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      acknowledgeRoute(route.id);
                      onAck();
                    }}
                    className="bg-accent text-cream px-3 py-1.5 rounded font-semibold"
                  >
                    Acknowledge
                  </button>
                )}
                <span className="text-ink/55">Access: {route.accessKind}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function APSection({
  orgId,
  ap,
}: {
  orgId: string;
  ap: ReturnType<typeof apSummaryForOrg>;
}) {
  const outstanding = ap.invoices
    .filter((i) => i.status === "issued" || i.status === "overdue")
    .slice(0, 3);
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 mb-1">
        <h2 className="text-2xl">Accounts payable &amp; invoices</h2>
        <Link
          href="/business-portal/accounts-payable"
          className="text-sm text-accent hover:underline whitespace-nowrap"
        >
          Full accounts payable →
        </Link>
      </div>
      <p className="text-sm text-ink/60 mb-3">
        What your organization owes for services received, net 30 terms.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <Stat label="Total billed" value={formatMoney(ap.totalCents)} />
        <Stat label="Outstanding" value={formatMoney(ap.outstandingCents)} />
        <Stat
          label="Overdue"
          value={formatMoney(ap.overdueCents)}
          warn={ap.overdueCents > 0}
        />
        <Stat
          label="Paid this quarter"
          value={formatMoney(ap.paidThisQuarterCents)}
        />
      </div>
      {outstanding.length === 0 ? (
        <Empty>No outstanding invoices — you&rsquo;re all caught up.</Empty>
      ) : (
        <ul role="list" className="space-y-2">
          {outstanding.map((inv) => (
            <li
              key={inv.id}
              className="border border-ink/15 rounded-lg p-3 bg-cream flex items-center justify-between gap-3 flex-wrap text-sm"
            >
              <div>
                <div className="font-semibold">{inv.serviceTitle}</div>
                <div className="text-xs text-ink/55">
                  {inv.id} · due {new Date(inv.dueAt).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">
                  {formatMoney(inv.amountCents)}
                </span>
                <Link
                  href="/business-portal/accounts-payable"
                  className="text-xs text-accent hover:underline"
                >
                  Pay →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Stat({
  label,
  value,
  warn,
}: {
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <div
      className={`saas-card ${warn ? "bg-rose-50 border-rose-300" : ""}`}
    >
      <div className="text-xs uppercase tracking-wider font-semibold text-ink/65">
        {label}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-ink/20 rounded-lg p-6 text-center text-ink/55">
      {children}
    </div>
  );
}
