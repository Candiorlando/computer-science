"use client";

// Printable single-document viewer. Any deliverable in a case file's
// Documents tab opens here as a clean, print-ready page (black-on-white
// via the global @media print rules) with a Print / Save-as-PDF button.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { renderDocument, type RenderedDocument } from "@/lib/case-documents";
import { printRenderedDocument } from "@/lib/print-document";

export default function CaseDocumentViewer() {
  const router = useRouter();
  const params = useParams();
  const caseId = String(params.caseId);
  const docId = String(params.docId);
  const [user, setUser] = useState<CounselorUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/signin");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const doc: RenderedDocument | null = useMemo(
    () => (user ? renderDocument(caseId, docId) : null),
    [user, caseId, docId],
  );

  if (!user) return null;

  if (!doc) {
    return (
      <div className="space-y-3">
        <Link
          href={`/case/${caseId}?tab=documents`}
          className="text-xs text-emerald-700 hover:underline"
        >
          ← Documents
        </Link>
        <h1 className="text-2xl">Document not available</h1>
        <p className="text-ink/65 text-sm">
          This document doesn&apos;t exist or can&apos;t be rendered.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="print:hidden flex items-center justify-between gap-3 flex-wrap">
        <Link
          href={`/case/${caseId}?tab=documents`}
          className="text-xs text-emerald-700 hover:underline"
        >
          ← Documents
        </Link>
        <button
          onClick={() =>
            printRenderedDocument(
              doc,
              `Generated via Pathways Pro · Case ${caseId} · Printed ${new Date().toLocaleDateString()}`,
            )
          }
          className="grad-tealblue text-white text-sm font-semibold px-4 py-2.5 min-h-[44px] rounded-md"
        >
          🖨️ Print / Save as PDF
        </button>
      </header>

      <article
        className="deliverable-page bg-white border border-ink/15 rounded p-8 leading-relaxed text-sm max-w-3xl mx-auto"
        aria-label={doc.title}
      >
        <header className="border-b border-ink/15 pb-4 mb-5">
          <p className="text-[10px] uppercase tracking-widest text-ink/55">
            {doc.subtitle}
          </p>
          <h1 className="text-2xl font-semibold mt-1">{doc.title}</h1>
          <dl className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
            {doc.meta.map((m) => (
              <div key={m.label} className="flex gap-1">
                <dt className="text-ink/55">{m.label}:</dt>
                <dd className="font-semibold">{m.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        {doc.sections.map((s, i) => (
          <section key={i} className="mb-5">
            {s.heading && (
              <h2 className="text-sm font-semibold uppercase tracking-wider text-ink/70 mb-1.5">
                {s.heading}
              </h2>
            )}
            {s.body.split("\n").map((line, j) =>
              line.trim() ? (
                <p key={j} className="mb-2 whitespace-pre-wrap">
                  {line}
                </p>
              ) : (
                <div key={j} className="h-2" />
              ),
            )}
          </section>
        ))}

        <footer className="border-t border-ink/15 mt-6 pt-4 text-xs text-ink/55 italic">
          Generated via Pathways Pro · Case {caseId} · Printed{" "}
          {new Date().toLocaleDateString()}
        </footer>
      </article>

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
            max-width: none;
            box-shadow: none;
            border: none;
            font-family: Georgia, "Times New Roman", Times, serif;
          }
        }
      `}</style>
    </div>
  );
}
