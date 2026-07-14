import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get("id") ?? "";
  const serviceName = searchParams.get("service") ?? "Service";
  const amount = searchParams.get("amount") ?? "$0.00";
  const orgName = searchParams.get("org") ?? "Client";
  const counselor = searchParams.get("counselor") ?? "Counselor";
  const issued = searchParams.get("issued") ?? new Date().toISOString();
  const due = searchParams.get("due") ?? new Date().toISOString();
  const status = searchParams.get("status") ?? "issued";

  const issuedFmt = new Date(issued).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const dueFmt = new Date(due).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><title>Invoice ${invoiceId}</title><style>body{font-family:'Helvetica Neue',Arial,sans-serif;max-width:700px;margin:40px auto;padding:20px;color:#1c211e}.hdr{display:flex;justify-content:space-between;border-bottom:3px solid #0F6B54;padding-bottom:20px;margin-bottom:30px}.brand{font-size:24px;font-weight:700;color:#0F6B54}.sub{font-size:12px;color:#666;margin-top:4px}.inv-id{font-family:monospace;font-size:14px;color:#666;text-align:right}.badge{display:inline-block;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-weight:700;padding:4px 12px;border-radius:12px}.b-issued{background:#FEF3C7;color:#92400E}.b-overdue{background:#FEE2E2;color:#991B1B}.b-paid{background:#D1FAE5;color:#065F46}.g{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:20px 0}.lbl{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:4px}.val{font-size:14px;font-weight:600}.amt{font-size:36px;font-weight:800;color:#0F6B54;margin:20px 0}table{width:100%;border-collapse:collapse;margin:20px 0}th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#999;border-bottom:1px solid #ddd;padding:8px 0}td{padding:12px 0;border-bottom:1px solid #eee;font-size:14px}.ft{margin-top:40px;padding-top:20px;border-top:1px solid #ddd;font-size:12px;color:#999;text-align:center}@media print{body{margin:0}}</style></head><body><div class="hdr"><div><div class="brand">Pathways Pro</div><div class="sub">Rehabilitation, unified.</div></div><div><div class="inv-id">${invoiceId}</div><div style="margin-top:8px"><span class="badge b-${status}">${status}</span></div></div></div><div class="g"><div><div class="lbl">Billed to</div><div class="val">${orgName}</div></div><div><div class="lbl">Counselor of record</div><div class="val">${counselor}</div></div><div><div class="lbl">Issued</div><div class="val">${issuedFmt}</div></div><div><div class="lbl">${status === "paid" ? "Paid" : "Due"}</div><div class="val">${dueFmt}</div></div></div><table><thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead><tbody><tr><td>${serviceName}</td><td style="text-align:right;font-weight:700">${amount}</td></tr></tbody></table><div class="amt">Total: ${amount}</div><div class="ft"><p>Pathways Pro &middot; pathwayspro.app &middot; guidance@pathwayspro.app</p><p>Net 30 terms. HIPAA Compliant &middot; ADA Title I &amp; WIOA Aligned</p></div></body></html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Content-Disposition": `inline; filename="invoice-${invoiceId}.html"` },
  });
}
