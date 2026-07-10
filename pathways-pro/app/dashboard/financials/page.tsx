"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import {
  apSummary,
  arSummary,
  formatMoney,
  markAPItemPaid,
  markInvoicePaid,
  seedAPDemoIfEmpty,
  voidInvoice,
  type Invoice,
} from "@/lib/financials";

export default function FinancialsPage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [bump, setBump] = useState(0);
  const [tab, setTab] = useState<"ar" | "ap">("ar");

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    seedAPDemoIfEmpty();
    setUser(s);
  }, [router]);

  const ar = useMemo(() => (user ? arSummary(user.email) : null), [user, bump]);
  const ap = useMemo(() => apSummary(), [bump]);

  if (!user || !ar) return null;

  function exportCsv() {
    const headers = ["id", "invoiceFor", "amount", "issued", "due", "status"];
    const rows = ar!.invoices.map((i) => [
      i.id,
      i.orgName,
      (i.amountCents / 100).toFixed(2),
      i.issuedAt,
      i.dueAt,
      i.status,
    ]);
    const csv =
      [headers, ...rows]
        .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pathways-pro-financials-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
            Financials
          </p>
          <h1 className="text-3xl font-semibold">Accounts Receivable &amp; Payable</h1>
          <p className="text-ink/65 text-sm mt-1">
            Every delivered service generates a billable item. Edit pricing in
            the Service Catalog; this page reflects effective rates.
          </p>
        </div>
        <button
          onClick={exportCsv}
          className="border border-ink/15 px-4 py-2 rounded-md text-sm hover:bg-ink/5"
        >
          📄 Export CSV
        </button>
      </header>

      <section className="grid md:grid-cols-4 gap-3">
        <Stat label="AR outstanding" value={formatMoney(ar.outstandingCents)} highlight />
        <Stat label="AR overdue" value={formatMoney(ar.overdueCents)} alert={ar.overdueCents > 0} />
        <Stat label="Collected this quarter" value={formatMoney(ar.collectedThisQuarterCents)} />
        <Stat label="AP outstanding" value={formatMoney(ap.totalCents)} alert={ap.overdueCents > 0} />
      </section>

      <div className="flex gap-2">
        <TabPill active={tab === "ar"} onClick={() => setTab("ar")}>
          Receivables · {ar.invoices.length}
        </TabPill>
        <TabPill active={tab === "ap"} onClick={() => setTab("ap")}>
          Payables · {ap.items.length}
        </TabPill>
      </div>

      {tab === "ar" ? (
        <ARTable
          invoices={ar.invoices}
          onChange={() => setBump((n) => n + 1)}
        />
      ) : (
        <APTable items={ap.items} onChange={() => setBump((n) => n + 1)} />
      )}
    </div>
  );
}

function ARTable({
  invoices,
  onChange,
}: {
  invoices: Invoice[];
  onChange: () => void;
}) {
  if (invoices.length === 0) {
    return (
      <div className="saas-card text-center text-ink/55 italic">
        No invoices yet — invoices are generated automatically when you release
        a service deliverable.
      </div>
    );
  }
  return (
    <section className="saas-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-ink/55 border-b border-ink/10">
            <th className="py-2 pr-3">Invoice</th>
            <th className="py-2 pr-3">Billed to</th>
            <th className="py-2 pr-3">Issued</th>
            <th className="py-2 pr-3">Due</th>
            <th className="py-2 pr-3 text-right">Amount</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((i) => (
            <tr key={i.id} className="border-b border-ink/10 align-top">
              <td className="py-2 pr-3 font-mono text-xs">{i.id}</td>
              <td className="py-2 pr-3">
                <div className="font-semibold">{i.orgName}</div>
                <div className="text-xs text-ink/55">{i.serviceTitle}</div>
              </td>
              <td className="py-2 pr-3 text-xs">{shortDate(i.issuedAt)}</td>
              <td className="py-2 pr-3 text-xs">{shortDate(i.dueAt)}</td>
              <td className="py-2 pr-3 text-right tabular-nums font-semibold">
                {formatMoney(i.amountCents)}
              </td>
              <td className="py-2 pr-3">
                <StatusChip status={i.status} />
              </td>
              <td className="py-2 text-right whitespace-nowrap">
                {i.status !== "paid" && i.status !== "void" && (
                  <>
                    <button
                      onClick={() => {
                        markInvoicePaid(i.id);
                        onChange();
                      }}
                      className="text-xs text-emerald-700 hover:underline mr-2"
                    >
                      Mark paid
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Void this invoice?")) {
                          voidInvoice(i.id);
                          onChange();
                        }
                      }}
                      className="text-xs text-amber-700 hover:underline"
                    >
                      Void
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function APTable({
  items,
  onChange,
}: {
  items: import("@/lib/financials").APItem[];
  onChange: () => void;
}) {
  if (items.length === 0) {
    return (
      <div className="saas-card text-center text-ink/55 italic">
        No vendor payables.
      </div>
    );
  }
  return (
    <section className="saas-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wider text-ink/55 border-b border-ink/10">
            <th className="py-2 pr-3">Vendor</th>
            <th className="py-2 pr-3">Description</th>
            <th className="py-2 pr-3">Due</th>
            <th className="py-2 pr-3 text-right">Amount</th>
            <th className="py-2 pr-3">Status</th>
            <th className="py-2"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-b border-ink/10">
              <td className="py-2 pr-3 font-semibold">{i.vendorOrgName}</td>
              <td className="py-2 pr-3 text-ink/75">{i.description}</td>
              <td className="py-2 pr-3 text-xs">{shortDate(i.dueAt)}</td>
              <td className="py-2 pr-3 text-right tabular-nums font-semibold">
                {formatMoney(i.amountCents)}
              </td>
              <td className="py-2 pr-3">
                <StatusChip status={i.status} />
              </td>
              <td className="py-2 text-right">
                {i.status !== "paid" && (
                  <button
                    onClick={() => {
                      markAPItemPaid(i.id);
                      onChange();
                    }}
                    className="text-xs text-emerald-700 hover:underline"
                  >
                    Mark paid
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Stat({
  label,
  value,
  highlight,
  alert,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  alert?: boolean;
}) {
  const cls = alert
    ? "border-amber-300 bg-amber-50/40"
    : highlight
      ? "grad-tealblue-soft"
      : "";
  return (
    <div className={`saas-card ${cls}`}>
      <div className="text-xs uppercase tracking-wider text-ink/55">
        {label}
      </div>
      <div className="text-2xl font-bold mt-1 text-ink">{value}</div>
    </div>
  );
}

function TabPill({
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
      className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
        active
          ? "grad-tealblue text-white"
          : "border border-ink/15 text-ink/70 hover:border-emerald-500"
      }`}
    >
      {children}
    </button>
  );
}

function StatusChip({ status }: { status: string }) {
  const styles: Record<string, string> = {
    issued: "bg-emerald-100 text-emerald-900",
    paid: "bg-emerald-100 text-emerald-900",
    overdue: "bg-amber-100 text-amber-900",
    void: "bg-ink/10 text-ink/55",
    owed: "bg-amber-100 text-amber-900",
    scheduled: "bg-emerald-100 text-emerald-900",
  };
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${styles[status] ?? "bg-ink/10 text-ink/55"}`}
    >
      {status}
    </span>
  );
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
