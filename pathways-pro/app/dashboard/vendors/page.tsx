"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { getAllVendorUsers } from "@/lib/users";
import { loadVendorOrgs, loadCoachingLogs } from "@/lib/business-portal";
import { authorizationsByVendor } from "@/lib/business-portal";
import { loadServiceRequests } from "@/lib/service-requests";

export default function CounselorVendorsIndex() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const vendors = useMemo(() => {
    const orgs = loadVendorOrgs();
    const users = getAllVendorUsers();
    return Object.values(orgs).map((o) => {
      const primary = Object.values(users).find((u) => u.vendorOrgId === o.id);
      const auths = authorizationsByVendor(o.id);
      const logs = loadCoachingLogs().filter((l) => l.vendorOrgId === o.id);
      const unsignedLogs = logs.filter((l) => !l.signedByCounselor).length;
      const pendingRequests = loadServiceRequests().filter(
        (r) =>
          r.requesterOrgId === o.id && r.status === "pending-counselor-review",
      );
      return { org: o, primary, auths, unsignedLogs, pending: pendingRequests.length };
    });
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          Vendors
        </p>
        <h1 className="text-3xl font-semibold">Vendor management</h1>
        <p className="text-ink/65 text-sm mt-1 prose-narrow">
          CRPs, forensic consultants, AT providers, and training partners
          delivering services on the case file. Each vendor has its own
          profile, message thread, and performance indicators.
        </p>
      </header>

      <ul role="list" className="space-y-3">
        {vendors.map(({ org, primary, auths, unsignedLogs, pending }) => (
          <li key={org.id}>
            <Link
              href={`/dashboard/vendors/${org.id}`}
              className="saas-card block hover:no-underline"
            >
              <div className="flex items-baseline justify-between gap-3 flex-wrap mb-1">
                <h2 className="text-lg font-semibold">{org.legalName}</h2>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-900">
                  {org.vendorType}
                </span>
              </div>
              <p className="text-xs text-ink/65">
                {primary?.name} · {primary?.credentials} · {org.hqCity}, {org.hqState}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                <Mini label="Active auths" value={auths.filter((a) => a.status === "active").length} />
                <Mini label="Pending auths" value={auths.filter((a) => a.status === "requested").length} />
                <Mini label="Unsigned logs" value={unsignedLogs} alert={unsignedLogs > 0} />
                <Mini label="Pending requests" value={pending} alert={pending > 0} />
              </div>
            </Link>
          </li>
        ))}
        {vendors.length === 0 && (
          <li className="saas-card text-center text-ink/55 italic">
            No vendors on file yet.
          </li>
        )}
      </ul>
    </div>
  );
}

function Mini({
  label,
  value,
  alert,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div
      className={`border rounded p-2 ${alert && value > 0 ? "border-amber-300 bg-amber-50/40" : "border-ink/10 bg-white"}`}
    >
      <div className="text-[10px] uppercase tracking-wider text-ink/55">
        {label}
      </div>
      <div
        className={`text-sm font-semibold ${alert && value > 0 ? "text-amber-700" : "text-ink"}`}
      >
        {value}
      </div>
    </div>
  );
}
