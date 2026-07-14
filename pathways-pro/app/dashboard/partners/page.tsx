"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import {
  ceForPartner,
  loadPartnerOrgs,
  opportunitiesForPartner,
  placementsForPartner,
} from "@/lib/employment-partners";
import { seedPartnerDemo } from "@/lib/partner-seed";

export default function CounselorPartnersIndex() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    seedPartnerDemo();
    setUser(s);
  }, [router]);

  const orgs = useMemo(() => Object.values(loadPartnerOrgs()), [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          Employment Partners
        </p>
        <h1 className="text-3xl font-semibold">
          Local businesses, nonprofits, and community partners
        </h1>
        <p className="text-ink/65 text-sm mt-1 prose-narrow">
          Each partner has its own case file with opportunities, Customized
          Employment engagements, placements, accommodation inquiries, and
          documents.
        </p>
      </header>

      <ul role="list" className="space-y-3">
        {orgs.map((o) => {
          const opps = opportunitiesForPartner(o.id);
          const places = placementsForPartner(o.id);
          const ce = ceForPartner(o.id);
          return (
            <li key={o.id}>
              <Link
                href={`/dashboard/partners/${o.id}`}
                className="saas-card block hover:no-underline"
              >
                <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                  <h2 className="text-lg font-semibold">{o.legalName}</h2>
                  <div className="flex gap-1.5 flex-wrap">
                    {o.participatesInCustomizedEmployment && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
                        🎯 CE
                      </span>
                    )}
                    {o.participatesInSupportedEmployment && (
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-900">
                        🤝 SE
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-ink/65">
                  {o.industry} · {o.hqCity}, {o.hqState}{" "}
                  {o.partnerOrgType.replaceAll("-", " ")} · {o.primaryContact}
                </p>
                <div className="grid grid-cols-3 gap-3 mt-3 text-xs">
                  <Mini label="Open opps" value={opps.filter((x) => x.status === "open").length} />
                  <Mini label="Placements" value={places.length} />
                  <Mini label="CE engagements" value={ce.length} />
                </div>
              </Link>
            </li>
          );
        })}
        {orgs.length === 0 && (
          <li className="saas-card text-center text-ink/55 italic">
            No employment partners on file yet.
          </li>
        )}
      </ul>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-ink/10 rounded p-2 bg-white">
      <div className="text-[10px] uppercase tracking-wider text-ink/55">
        {label}
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
