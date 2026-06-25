"use client";

import Link from "next/link";
import {
  loadServiceRequests,
  type ServiceRequest,
} from "@/lib/service-requests";
import { getService } from "@/lib/service-catalog";
import { SignatureBlock } from "@/components/SignaturePad";

interface Props {
  orderId: string;
  // The viewer's org id — used to enforce that callers can only view
  // their own org's orders.
  orgId: string;
  // Where the catalog lives for this portal — used on the back-link.
  catalogPath: string;
}

export function OrderDeliverableViewer({ orderId, orgId, catalogPath }: Props) {
  const order = loadServiceRequests().find(
    (r) => r.id === orderId && r.requesterOrgId === orgId,
  );

  if (!order) {
    return (
      <div className="space-y-3">
        <Link
          href={catalogPath}
          className="text-xs text-cyan-700 hover:underline"
        >
          ← Service Catalog
        </Link>
        <h1 className="text-2xl">Order not found</h1>
        <p className="text-ink/65 text-sm">
          The order doesn&apos;t belong to your organization, or it hasn&apos;t
          been released yet.
        </p>
      </div>
    );
  }

  const service = getService(order.serviceId);
  const isDelivered = order.status === "delivered" && order.deliverableFinal;

  return (
    <div className="space-y-6">
      <header className="print:hidden">
        <Link
          href={catalogPath}
          className="text-xs text-cyan-700 hover:underline mb-1 inline-block"
        >
          ← Service Catalog
        </Link>
        <h1 className="text-3xl font-semibold">{order.serviceTitle}</h1>
        <p className="text-ink/65 text-sm mt-1">
          {service?.category.replaceAll("-", " ")} ·{" "}
          {isDelivered
            ? `Delivered ${new Date(order.sentToClientAt!).toLocaleDateString()}`
            : `Status: ${order.status.replaceAll("-", " ")}`}
        </p>
      </header>

      {!isDelivered ? (
        <section className="saas-card text-center py-10">
          <p className="text-ink/70">
            This service is still in progress. You&apos;ll receive the
            deliverable here once your assigned counselor releases it.
          </p>
          <p className="text-xs text-ink/55 mt-2">
            Current status:{" "}
            <strong>{order.status.replaceAll("-", " ")}</strong>
          </p>
        </section>
      ) : (
        <>
          <div className="flex justify-end gap-2 print:hidden">
            <button
              onClick={() => window.print()}
              className="grad-tealblue text-white text-sm px-4 py-2 rounded-md font-semibold"
            >
              🖨️ Print / Save as PDF
            </button>
            <button
              onClick={() => downloadAsText(order)}
              className="border border-ink/15 text-sm px-4 py-2 rounded-md hover:bg-ink/5"
            >
              📄 Download .txt
            </button>
          </div>

          <article
            className="deliverable-page bg-white border border-ink/15 rounded p-8 leading-relaxed text-sm"
            aria-label="Service deliverable"
          >
            <header className="border-b border-ink/15 pb-4 mb-4">
              <h1 className="text-2xl font-semibold">{order.serviceTitle}</h1>
              <p className="text-xs text-ink/65 mt-2">
                Prepared for <strong>{order.requesterOrgName}</strong> ·{" "}
                {order.requesterName}
                {order.matterCaption && (
                  <span> · Matter: {order.matterCaption}</span>
                )}
              </p>
              <p className="text-xs text-ink/55 mt-0.5">
                Released to your portal:{" "}
                {new Date(order.sentToClientAt!).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </header>
            <MarkdownBody text={order.deliverableFinal ?? ""} />
            {order.signedAt && (
              <SignatureBlock
                dataUrl={order.counselorSignatureDataUrl}
                text={order.counselorSignatureText}
                printedName={order.counselorSignatureName ?? "Counselor of record"}
                credentials={order.counselorSignatureCredentials}
                signedAt={order.signedAt}
              />
            )}
            <footer className="border-t border-ink/15 mt-6 pt-4 text-xs text-ink/55 italic">
              Prepared via Pathways Pro · Reviewed and approved by the
              counselor of record. Released to {order.requesterOrgName} on{" "}
              {new Date(order.sentToClientAt!).toLocaleString()}.
            </footer>
          </article>
        </>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .deliverable-page,
          .deliverable-page * {
            visibility: visible;
          }
          .deliverable-page {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
            border: none;
            font-family: Georgia, "Times New Roman", Times, serif;
          }
        }
      `}</style>
    </div>
  );
}

function downloadAsText(order: ServiceRequest) {
  const sigLine = order.signedAt
    ? [
        "",
        "---",
        "",
        "Signed by:",
        `  ${order.counselorSignatureName ?? "Counselor of record"}`,
        order.counselorSignatureCredentials
          ? `  ${order.counselorSignatureCredentials}`
          : "",
        `  Signed ${new Date(order.signedAt).toLocaleString()}`,
      ]
        .filter(Boolean)
        .join("\n")
    : "";
  const body = [
    order.serviceTitle,
    `Prepared for ${order.requesterOrgName} · ${order.requesterName}`,
    order.matterCaption ? `Matter: ${order.matterCaption}` : "",
    `Released: ${new Date(order.sentToClientAt!).toISOString()}`,
    "",
    "---",
    "",
    order.deliverableFinal ?? "",
    sigLine,
  ]
    .filter(Boolean)
    .join("\n");
  const blob = new Blob([body], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${order.serviceTitle
    .replaceAll(/\s+/g, "-")
    .toLowerCase()}-${order.id}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function MarkdownBody({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  let listBuf: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function flushList() {
    if (listType === "ul") {
      out.push(
        <ul
          key={out.length}
          className="list-disc pl-6 my-2 space-y-1"
          role="list"
        >
          {listBuf.map((li, i) => (
            <li key={i}>{renderInline(li)}</li>
          ))}
        </ul>,
      );
    } else if (listType === "ol") {
      out.push(
        <ol
          key={out.length}
          className="list-decimal pl-6 my-2 space-y-1"
          role="list"
        >
          {listBuf.map((li, i) => (
            <li key={i}>{renderInline(li)}</li>
          ))}
        </ol>,
      );
    }
    listBuf = [];
    listType = null;
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      continue;
    }
    const h3 = line.match(/^###\s+(.*)$/);
    const h2 = line.match(/^##\s+(.*)$/);
    const h1 = line.match(/^#\s+(.*)$/);
    const ulItem = line.match(/^[-*]\s+(.*)$/);
    const olItem = line.match(/^\d+\.\s+(.*)$/);
    if (h1) {
      flushList();
      out.push(
        <h2 key={out.length} className="text-lg font-semibold mt-4 mb-2">
          {renderInline(h1[1])}
        </h2>,
      );
    } else if (h2) {
      flushList();
      out.push(
        <h3 key={out.length} className="text-base font-semibold mt-4 mb-1">
          {renderInline(h2[1])}
        </h3>,
      );
    } else if (h3) {
      flushList();
      out.push(
        <h4
          key={out.length}
          className="text-sm font-semibold mt-3 mb-1 uppercase tracking-wider text-ink/65"
        >
          {renderInline(h3[1])}
        </h4>,
      );
    } else if (ulItem) {
      if (listType !== "ul") flushList();
      listType = "ul";
      listBuf.push(ulItem[1]);
    } else if (olItem) {
      if (listType !== "ol") flushList();
      listType = "ol";
      listBuf.push(olItem[1]);
    } else {
      flushList();
      out.push(
        <p key={out.length} className="my-2">
          {renderInline(line)}
        </p>,
      );
    }
  }
  flushList();
  return <>{out}</>;
}

function renderInline(s: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let rest = s;
  let key = 0;
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/;
  while (rest.length) {
    const m = re.exec(rest);
    if (!m) {
      parts.push(<span key={key++}>{rest}</span>);
      break;
    }
    if (m.index > 0)
      parts.push(<span key={key++}>{rest.slice(0, m.index)}</span>);
    const token = m[0];
    if (token.startsWith("**")) {
      parts.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else {
      parts.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    rest = rest.slice(m.index + token.length);
  }
  return parts;
}
