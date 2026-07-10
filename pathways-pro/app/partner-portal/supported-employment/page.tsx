"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { EmploymentPartnerUser } from "@/lib/users";
import {
  opportunitiesForPartner,
  placementsForPartner,
} from "@/lib/employment-partners";
import { seedPartnerDemo } from "@/lib/partner-seed";

export default function SupportedEmploymentPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmploymentPartnerUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "partner") return router.replace("/portal");
    seedPartnerDemo();
    setUser(s);
  }, [router]);

  const data = useMemo(() => {
    if (!user) return null;
    const seOpps = opportunitiesForPartner(user.partnerOrgId).filter(
      (o) => o.kind === "supported-employment",
    );
    const placements = placementsForPartner(user.partnerOrgId);
    return { seOpps, placements };
  }, [user]);

  if (!user || !data) return null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          🤝 Supported Employment
        </p>
        <h1 className="text-3xl font-semibold">
          Job-coached placements at {user.partnerOrgName}
        </h1>
        <p className="text-ink/65 text-sm mt-1 prose-narrow">
          Supported employment pairs each placement with a job coach who
          works alongside the new hire on site during onboarding and
          retention. The counselor and job coach collaborate on your case
          file in real time.
        </p>
      </header>

      <section>
        <h2 className="text-xl font-semibold mb-3">SE opportunities you posted</h2>
        {data.seOpps.length === 0 ? (
          <div className="saas-card text-center text-ink/55 italic">
            No supported employment opportunities posted yet.{" "}
            <Link
              href="/partner-portal/opportunities"
              className="text-emerald-700 hover:underline"
            >
              Post one →
            </Link>
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {data.seOpps.map((o) => (
              <li key={o.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                  <h3 className="font-semibold">{o.title}</h3>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
                    {o.status}
                  </span>
                </div>
                <p className="text-sm text-ink/75">{o.description}</p>
                <p className="text-xs text-ink/55 mt-2">
                  {o.hoursPerWeek} hrs/wk · {o.wage ?? "—"} · {o.location}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Active SE placements</h2>
        {data.placements.length === 0 ? (
          <div className="saas-card text-center text-ink/55 italic">
            No active placements yet.
          </div>
        ) : (
          <ul role="list" className="space-y-2">
            {data.placements.map((p) => (
              <li key={p.id} className="saas-card">
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
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
                <p className="text-xs text-ink/65">
                  {p.hoursPerWeek} hrs/wk · started {p.hireDate}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
