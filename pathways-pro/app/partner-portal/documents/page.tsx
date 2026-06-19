"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { EmploymentPartnerUser } from "@/lib/users";
import { recordCaseNoteEvent } from "@/lib/case-notes";
import { seedPartnerDemo } from "@/lib/partner-seed";

interface DemoDoc {
  id: string;
  partnerOrgId: string;
  title: string;
  kind: string;
  uploadedAt: string;
  uploadedByName: string;
}

const KEY = "pathways-pro:partner-docs-v1";

function loadDocs(): DemoDoc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveDocs(d: DemoDoc[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(d));
}

export default function PartnerDocumentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmploymentPartnerUser | null>(null);
  const [docs, setDocs] = useState<DemoDoc[]>([]);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("job-description");

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "partner") return router.replace("/portal");
    seedPartnerDemo();
    setUser(s);
    setDocs(loadDocs().filter((d) => d.partnerOrgId === s.partnerOrgId));
  }, [router]);

  function upload() {
    if (!user || !title.trim()) return;
    const doc: DemoDoc = {
      id: "doc-" + Math.random().toString(36).slice(2, 10),
      partnerOrgId: user.partnerOrgId,
      title,
      kind,
      uploadedAt: new Date().toISOString(),
      uploadedByName: user.name,
    };
    const next = [doc, ...loadDocs()];
    saveDocs(next);
    setDocs(next.filter((d) => d.partnerOrgId === user.partnerOrgId));
    recordCaseNoteEvent({
      kind: "partner-document-uploaded",
      participantType: "employment-partner",
      partnerOrgId: user.partnerOrgId,
      partnerOrgName: user.partnerOrgName,
      actorName: user.name,
      sourceArtifactId: doc.id,
      documentTitle: title,
      documentKind: kind,
    });
    setTitle("");
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          Documents
        </p>
        <h1 className="text-3xl font-semibold">
          Upload job descriptions, policies, FCEs, accommodation letters
        </h1>
      </header>

      <section className="saas-card space-y-3">
        <h2 className="text-lg font-semibold">Upload a document</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Title">
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Prep Assistant — JD v2"
            />
          </Field>
          <Field label="Document kind">
            <select
              className="input"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
            >
              <option value="job-description">Job description</option>
              <option value="policy">Workplace policy</option>
              <option value="accommodation-letter">Accommodation letter</option>
              <option value="fce">Functional capacity evaluation</option>
              <option value="msa">Master service agreement</option>
              <option value="other">Other</option>
            </select>
          </Field>
        </div>
        <p className="text-xs text-ink/55 italic">
          Demo storage — file name only is recorded. A real upload widget
          slots in here for production.
        </p>
        <button
          onClick={upload}
          className="grad-tealblue text-white font-semibold px-4 py-2 rounded-md text-sm"
        >
          📤 Record upload
        </button>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Your documents</h2>
        {docs.length === 0 ? (
          <div className="saas-card text-center text-ink/55 italic">
            No documents uploaded yet.
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {docs.map((d) => (
              <li
                key={d.id}
                className="saas-card flex items-center justify-between gap-3 flex-wrap"
              >
                <div>
                  <div className="font-semibold">{d.title}</div>
                  <div className="text-xs text-ink/60">
                    {d.kind} · uploaded by {d.uploadedByName} on{" "}
                    {new Date(d.uploadedAt).toLocaleString()}
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-wider bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded-full font-semibold">
                  Logged
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: white;
          border: 1px solid rgba(31, 29, 26, 0.15);
          border-radius: 8px;
          padding: 0.55rem 0.75rem;
        }
        :global(.input:focus-visible) {
          outline: 2px solid #06b6d4;
          outline-offset: -1px;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
