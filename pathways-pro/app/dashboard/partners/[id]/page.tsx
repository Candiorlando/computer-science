"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import {
  ceForPartner,
  inquiriesForPartner,
  loadPartnerOrgs,
  opportunitiesForPartner,
  placementsForPartner,
} from "@/lib/employment-partners";
import { notesForPartnerOrg } from "@/lib/case-notes";
import { CaseNotesPanel } from "@/components/CaseNotesPanel";
import { seedPartnerDemo } from "@/lib/partner-seed";
import { recordCaseOpen } from "@/lib/recent-cases";

export default function CounselorPartnerCaseFile() {
  const router = useRouter();
  const params = useParams();
  const partnerId = String(params.id);
  const [user, setUser] = useState<CounselorUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    seedPartnerDemo();
    setUser(s);
    recordCaseOpen(s.email, partnerId);
  }, [router, partnerId]);

  const data = useMemo(() => {
    const org = loadPartnerOrgs()[partnerId];
    if (!org) return null;
    return {
      org,
      opps: opportunitiesForPartner(partnerId),
      places: placementsForPartner(partnerId),
      ce: ceForPartner(partnerId),
      inquiries: inquiriesForPartner(partnerId),
      notes: notesForPartnerOrg(partnerId),
    };
  }, [partnerId, user]);

  if (!user) return null;
  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl">Partner not found</h1>
        <Link
          href="/dashboard/partners"
          className="text-cyan-700 hover:underline"
        >
          ← Back to Employment Partners
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/dashboard/partners"
          className="text-xs text-cyan-700 hover:underline mb-1 inline-block"
        >
          ← All Employment Partners
        </Link>
        <h1 className="text-3xl font-semibold">{data.org.legalName}</h1>
        <p className="text-ink/65 text-sm mt-1">
          {data.org.industry} · {data.org.hqCity}, {data.org.hqState}{" "}
          {data.org.hqZip} · {data.org.primaryContact}
        </p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {data.org.participatesInCustomizedEmployment && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-cyan-100 text-cyan-900">
              🎯 Customized Employment
            </span>
          )}
          {data.org.participatesInSupportedEmployment && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
              🤝 Supported Employment
            </span>
          )}
        </div>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Opportunities" value={data.opps.length} />
        <Stat label="Placements" value={data.places.length} />
        <Stat label="CE engagements" value={data.ce.length} />
        <Stat
          label="Open inquiries"
          value={data.inquiries.filter((i) => i.status === "pending").length}
        />
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Opportunities</h2>
        {data.opps.length === 0 ? (
          <Empty text="No opportunities posted." />
        ) : (
          <ul role="list" className="space-y-2">
            {data.opps.map((o) => (
              <li key={o.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold">{o.title}</h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
                    {o.kind.replaceAll("-", " ")}
                  </span>
                </div>
                <p className="text-sm text-ink/75 mt-1">{o.description}</p>
                <p className="text-xs text-ink/55 mt-2">
                  {o.hoursPerWeek} hrs/wk · {o.wage ?? "—"} · {o.location} ·{" "}
                  {o.status}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {data.org.participatesInCustomizedEmployment && (
        <section>
          <h2 className="text-xl font-semibold mb-3">
            🎯 Customized Employment engagements
          </h2>
          {data.ce.length === 0 ? (
            <Empty text="No Customized Employment engagements yet." />
          ) : (
            <ul role="list" className="space-y-2">
              {data.ce.map((e) => (
                <li key={e.id} className="saas-card">
                  <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                    <h3 className="font-semibold">
                      {e.clientName ?? "Unassigned"}
                      {e.proposedTitle && (
                        <span className="text-ink/55 font-normal">
                          {" · "}
                          {e.proposedTitle}
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-cyan-100 text-cyan-900">
                      {e.currentStage.replaceAll("-", " ")}
                    </span>
                  </div>
                  <p className="text-xs text-ink/65">
                    {e.caseId ? `Case ${e.caseId} · ` : ""}Updated{" "}
                    {new Date(e.updatedAt).toLocaleDateString()}
                  </p>
                  {e.carvedTasks.length > 0 && (
                    <p className="text-sm text-ink/75 mt-2">
                      <strong>Carved tasks:</strong>{" "}
                      {e.carvedTasks.join(" · ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-3">Placements</h2>
        {data.places.length === 0 ? (
          <Empty text="No placements yet." />
        ) : (
          <ul role="list" className="space-y-2">
            {data.places.map((p) => (
              <li key={p.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold">
                    {p.clientName}
                    <span className="text-ink/55 font-normal text-sm">
                      {" "}
                      · {p.opportunityTitle}
                    </span>
                  </h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
                    {p.status}
                  </span>
                </div>
                <p className="text-xs text-ink/65 mt-1">
                  Case {p.caseId} · {p.hoursPerWeek} hrs/wk · started{" "}
                  {p.hireDate}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Accommodation inquiries</h2>
        {data.inquiries.length === 0 ? (
          <Empty text="No inquiries yet." />
        ) : (
          <ul role="list" className="space-y-2">
            {data.inquiries.map((i) => (
              <li key={i.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                  <h3 className="font-semibold">{i.jobTitle}</h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-900">
                    {i.status}
                  </span>
                </div>
                <p className="text-sm text-ink/75 italic">
                  &ldquo;{i.question}&rdquo;
                </p>
                <p className="text-xs text-ink/55 mt-1">
                  Submitted {new Date(i.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CaseNotesPanel
        notes={data.notes}
        title="Case notes (auto-generated DAP)"
        emptyLabel="No auto-generated case notes yet for this partner."
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
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
