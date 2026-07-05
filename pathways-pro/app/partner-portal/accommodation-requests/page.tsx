"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { EmploymentPartnerUser } from "@/lib/users";
import {
  appendAccommodationInquiry,
  inquiriesForPartner,
  newPartnerId,
  type AccommodationInquiry,
} from "@/lib/employment-partners";
import { recordCaseNoteEvent } from "@/lib/case-notes";
import { seedPartnerDemo } from "@/lib/partner-seed";

export default function AccommodationRequestsPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmploymentPartnerUser | null>(null);
  const [bump, setBump] = useState(0);
  const [jobTitle, setJobTitle] = useState("");
  const [question, setQuestion] = useState("");

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "partner") return router.replace("/portal");
    seedPartnerDemo();
    setUser(s);
  }, [router, bump]);

  const inquiries = useMemo(
    () => (user ? inquiriesForPartner(user.partnerOrgId) : []),
    [user, bump],
  );

  if (!user) return null;

  function submit() {
    if (!jobTitle.trim() || question.length < 20) return;
    const i: AccommodationInquiry = {
      id: newPartnerId("inq"),
      partnerOrgId: user!.partnerOrgId,
      partnerOrgName: user!.partnerOrgName,
      fromEmail: user!.email,
      fromName: user!.name,
      jobTitle,
      question,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    appendAccommodationInquiry(i);
    recordCaseNoteEvent({
      kind: "partner-accommodation-inquiry",
      participantType: "employment-partner",
      partnerOrgId: user!.partnerOrgId,
      partnerOrgName: user!.partnerOrgName,
      actorName: user!.name,
      sourceArtifactId: i.id,
      jobTitle,
      question,
    });
    setJobTitle("");
    setQuestion("");
    setBump((n) => n + 1);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          Accommodation Requests
        </p>
        <h1 className="text-3xl font-semibold">
          Submit an accommodation inquiry
        </h1>
        <p className="text-ink/65 text-sm mt-1 prose-narrow">
          Send a question about a specific role or candidate to your assigned
          counselor. Inquiries route through the platform and become part of
          the partner case file for audit.
        </p>
      </header>

      <section className="saas-card space-y-3">
        <h2 className="text-lg font-semibold">New inquiry</h2>
        <Field label="Position / role this is about">
          <input
            className="input"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Morning Prep Assistant"
          />
        </Field>
        <Field label="What do you need to know?">
          <textarea
            className="input min-h-[120px]"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., We have a candidate who uses a screen reader. Our POS system is web-based — what accessibility testing should we do before they start?"
          />
        </Field>
        <button
          onClick={submit}
          className="grad-tealblue text-white font-semibold px-4 py-2 rounded-md text-sm"
        >
          Submit inquiry →
        </button>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Your inquiries</h2>
        {inquiries.length === 0 ? (
          <div className="saas-card text-center text-ink/55 italic">
            No accommodation inquiries yet.
          </div>
        ) : (
          <ul role="list" className="space-y-3">
            {inquiries.map((i) => (
              <li key={i.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                  <h3 className="font-semibold">{i.jobTitle}</h3>
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold ${
                      i.status === "pending"
                        ? "bg-amber-100 text-amber-900"
                        : i.status === "responded"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-ink/10 text-ink/55"
                    }`}
                  >
                    {i.status}
                  </span>
                </div>
                <p className="text-sm text-ink/75 italic">
                  &ldquo;{i.question}&rdquo;
                </p>
                {i.responseBody && (
                  <div className="mt-3 border-l-2 border-cyan-300 pl-3">
                    <div className="text-xs uppercase tracking-wider text-cyan-700 font-semibold">
                      Counselor response
                    </div>
                    <p className="text-sm text-ink/85 mt-1">{i.responseBody}</p>
                  </div>
                )}
                <p className="text-xs text-ink/55 mt-2">
                  Submitted {new Date(i.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: #1E293B;
          border: 1px solid rgba(230, 234, 242, 0.15);
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
