"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { BusinessUser } from "@/lib/users";
import {
  apSummaryForOrg,
  formatMoney,
  markInvoicePaid,
  seedDemoInvoicesIfEmpty,
  type Invoice,
  type InvoiceStatus,
} from "@/lib/financials";

type Tab = "all" | "outstanding" | "overdue" | "paid";

export default function BusinessAccountsPayablePage() {
  const router = useRouter();
  const [user, setUser] = useState<BusinessUser | null>(null);
  const [tab, setTab] = useState<Tab>("outstanding");
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "business") return router.replace("/portal");
    seedDemoInvoicesIfEmpty();
    setUser(s);
  }, [router]);

  const data = useMemo(() => {
    if (!user) return null;
    return apSummaryForOrg(user.orgId);
  }, [user, bump]);

  if (!user || !data) return null;

  const filtered = filterInvoices(data.invoices, tab);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Accounts Payable</h1>
        <p className="text-ink/65 text-sm mt-1">
          Invoices for services your team received from Pathways Pro
          counselors. Each invoice is automatically generated when a
          deliverable is released into your portal. Net 30 terms.
        </p>
      </header>

      <section
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
        aria-label="Accounts payable summary"
      >
        <Stat
          label="Total billed"
          value={formatMoney(data.totalCents)}
          tone="grad-tealblue-soft"
        />
        <Stat
          label="Outstanding"
          value={formatMoney(data.outstandingCents)}
          tone="bg-amber-50 border-amber-200"
        />
        <Stat
          label="Overdue"
          value={formatMoney(data.overdueCents)}
          tone={
            data.overdueCents > 0
              ? "bg-rose-50 border-rose-300"
              : "bg-white border-ink/15"
          }
        />
        <Stat
          label="Paid this quarter"
          value={formatMoney(data.paidThisQuarterCents)}
          tone="bg-emerald-50 border-emerald-200"
        />
      </section>

      <div
        role="tablist"
        aria-label="Filter invoices"
        className="flex gap-2 flex-wrap"
      >
        <TabBtn current={tab} target="outstanding" onClick={setTab}>
          Outstanding
        </TabBtn>
        <TabBtn current={tab} target="overdue" onClick={setTab}>
          Overdue
        </TabBtn>
        <TabBtn current={tab} target="paid" onClick={setTab}>
          Paid
        </TabBtn>
        <TabBtn current={tab} target="all" onClick={setTab}>
          All
        </TabBtn>
      </div>

      {filtered.length === 0 ? (
        <section className="saas-card text-center py-12">
          <p className="text-ink/65">
            {tab === "outstanding"
              ? "No outstanding invoices — you're all caught up."
              : tab === "overdue"
                ? "No overdue invoices."
                : tab === "paid"
                  ? "No paid invoices recorded yet."
                  : "No invoices have been generated yet. They appear here when your counselor releases a delivered service."}
          </p>
          <Link
            href="/business-portal/services"
            className="inline-block mt-4 text-sm text-emerald-700 hover:underline"
          >
            Browse the Service Catalog →
          </Link>
        </section>
      ) : (
        <ul role="list" className="space-y-3">
          {filtered.map((inv) => (
            <InvoiceRow
              key={inv.id}
              invoice={inv}
              onPaid={() => {
                markInvoicePaid(inv.id);
                setBump((n) => n + 1);
              }}
            />
          ))}
        </ul>
      )}

      <p className="text-xs text-ink/55 italic">
        Net 30 terms unless otherwise noted on a specific invoice. Marking
        an invoice paid here records your remittance — your counselor will
        reconcile against the actual deposit in their financials ledger.
      </p>
    </div>
  );
}

function filterInvoices(invoices: Invoice[], tab: Tab): Invoice[] {
  if (tab === "all") return invoices;
  if (tab === "outstanding")
    return invoices.filter(
      (i) => i.status === "issued" || i.status === "overdue",
    );
  if (tab === "overdue") return invoices.filter((i) => i.status === "overdue");
  return invoices.filter((i) => i.status === "paid");
}

function InvoiceRow({
  invoice,
  onPaid,
}: {
  invoice: Invoice;
  onPaid: () => void;
}) {
  const isPaid = invoice.status === "paid";
  const isOverdue = invoice.status === "overdue";
  return (
    <li>
      <article
        className={`saas-card ${
          isOverdue
            ? "border-rose-300 bg-rose-50/30"
            : isPaid
              ? "border-emerald-300 bg-emerald-50/30"
              : ""
        }`}
      >
        <div className="flex items-baseline justify-between gap-3 flex-wrap">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="text-lg font-semibold">{invoice.serviceTitle}</h2>
            <StatusChip status={invoice.status} />
          </div>
          <span className="font-mono text-sm text-ink/70">{invoice.id}</span>
        </div>

        <div className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink/55">
              Amount
            </div>
            <div className="text-xl font-bold mt-0.5">
              {formatMoney(invoice.amountCents)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink/55">
              Issued
            </div>
            <div className="font-semibold mt-0.5">
              {new Date(invoice.issuedAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink/55">
              {isPaid ? "Paid" : "Due"}
            </div>
            <div
              className={`font-semibold mt-0.5 ${
                isOverdue ? "text-rose-700" : ""
              }`}
            >
              {isPaid && invoice.paidAt
                ? new Date(invoice.paidAt).toLocaleDateString()
                : new Date(invoice.dueAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        <p className="text-xs text-ink/55 mt-3">
          Counselor of record:{" "}
          <strong className="text-ink/75">{invoice.counselorEmail}</strong> ·
          Linked to service order{" "}
          <Link
            href={`/business-portal/orders/${invoice.serviceRequestId}`}
            className="text-emerald-700 hover:underline font-mono"
          >
            {invoice.serviceRequestId}
          </Link>
        </p>

        {!isPaid && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={async () => {
                try {
                  const res = await fetch("/api/invoices/pay", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      invoiceId: invoice.id,
                      amountCents: invoice.amountCents,
                      description: `${invoice.serviceTitle} — Invoice ${invoice.id}`,
                      destinationAccountId: "acct_placeholder",
                      platformFeePercent: 5,
                    }),
                  });
                  const data = await res.json();
                  if (data.url) {
                    window.open(data.url, "_blank");
                  } else {
                    if (window.confirm(`Pay ${formatMoney(invoice.amountCents)} for invoice ${invoice.id}?`)) {
                      onPaid();
                      fetch("/api/invoices/payment-confirmation", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ invoiceId: invoice.id, amount: formatMoney(invoice.amountCents), serviceName: invoice.serviceTitle, businessEmail: invoice.orgName, businessName: invoice.orgName, counselorEmail: invoice.counselorEmail, counselorName: invoice.counselorEmail }),
                      }).catch(() => {});
                    }
                  }
                } catch {
                  if (window.confirm(`Mark invoice ${invoice.id} (${formatMoney(invoice.amountCents)}) as paid?`)) {
                    onPaid();
                  }
                }
              }}
              className="bg-accent text-cream text-sm font-semibold px-5 py-2 rounded-md hover:bg-accent/90 transition"
            >
              Pay now
            </button>
            <button
              onClick={() => {
                if (window.confirm(`Mark invoice ${invoice.id} (${formatMoney(invoice.amountCents)}) as paid offline?`)) {
                  onPaid();
                  fetch("/api/invoices/payment-confirmation", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ invoiceId: invoice.id, amount: formatMoney(invoice.amountCents), serviceName: invoice.serviceTitle, businessEmail: invoice.orgName, businessName: invoice.orgName, counselorEmail: invoice.counselorEmail, counselorName: invoice.counselorEmail }),
                  }).catch(() => {});
                }
              }}
              className="grad-tealblue text-white text-sm font-semibold px-4 py-2 rounded-md"
            >
              Mark paid (offline)
            </button>
            <a
              href={`/api/invoices/pdf?id=${encodeURIComponent(invoice.id)}&service=${encodeURIComponent(invoice.serviceTitle)}&amount=${encodeURIComponent(formatMoney(invoice.amountCents))}&org=${encodeURIComponent(invoice.orgName)}&counselor=${encodeURIComponent(invoice.counselorEmail)}&issued=${encodeURIComponent(invoice.issuedAt)}&due=${encodeURIComponent(invoice.dueAt)}&status=${encodeURIComponent(invoice.status)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm border border-ink/15 px-4 py-2 rounded-md hover:bg-ink/5"
            >
              Download invoice
            </a>
            <Link
              href={`/business-portal/orders/${invoice.serviceRequestId}`}
              className="text-sm border border-ink/15 px-4 py-2 rounded-md hover:bg-ink/5"
            >
              View deliverable
            </Link>
          </div>
        )}
        {isPaid && (
          <div className="mt-3">
            <a
              href={`/api/invoices/pdf?id=${encodeURIComponent(invoice.id)}&service=${encodeURIComponent(invoice.serviceTitle)}&amount=${encodeURIComponent(formatMoney(invoice.amountCents))}&org=${encodeURIComponent(invoice.orgName)}&counselor=${encodeURIComponent(invoice.counselorEmail)}&issued=${encodeURIComponent(invoice.issuedAt)}&due=${encodeURIComponent(invoice.paidAt ?? invoice.dueAt)}&status=paid`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm border border-ink/15 px-4 py-2 rounded-md hover:bg-ink/5 inline-block"
            >
              Download receipt
            </a>
          </div>
        )}
      </article>
    </li>
  );
}

function StatusChip({ status }: { status: InvoiceStatus }) {
  const styles: Record<InvoiceStatus, string> = {
    issued: "bg-amber-100 text-amber-900",
    overdue: "bg-rose-100 text-rose-900",
    paid: "bg-emerald-100 text-emerald-900",
    void: "bg-ink/10 text-ink/55",
  };
  const labels: Record<InvoiceStatus, string> = {
    issued: "Issued",
    overdue: "Overdue",
    paid: "Paid",
    void: "Void",
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
  value: string;
  tone: string;
}) {
  return (
    <div className={`saas-card ${tone}`}>
      <div className="text-xs uppercase tracking-wider font-semibold text-ink/65">
        {label}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
