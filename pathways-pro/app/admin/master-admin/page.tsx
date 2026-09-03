"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle2,
  MapPinned,
  FileText,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import MasterAdminGuard from "@/components/MasterAdminGuard";
import {
  loadTenants,
  provisionTenant,
  getTenantCapacity,
  counselorsInTenant,
  type Tenant,
  type TenantType,
} from "@/lib/tenants";
import { COUNSELORS, type CounselorUser } from "@/lib/users";
import { isMasterAdmin } from "@/lib/rbac";

const TENANT_TYPE_LABELS: Record<TenantType, string> = {
  state: "State Client",
  city: "City Client",
  agency: "Agency Client",
  individual: "Individual Counselor",
};
const tenantTypes: TenantType[] = ["state", "city", "agency", "individual"];

function iconFor(type: TenantType) {
  if (type === "state") return Landmark;
  if (type === "city") return MapPinned;
  if (type === "individual") return UserCog;
  return Building2;
}

/** Every counselor the Master Admin oversees at the business/technology
 *  layer: tenant admins (one per agency) and solopreneurs (no agency).
 *  This list is who the platform manages — never their client caseloads. */
function solopreneurs(): CounselorUser[] {
  return Object.values(COUNSELORS).filter((c) => !c.tenantId && !isMasterAdmin(c));
}

export default function MasterAdminPage() {
  const [tenants, setTenants] = useState<Tenant[]>(() => loadTenants());
  const [name, setName] = useState("New State VR Contract");
  const [type, setType] = useState<TenantType>("state");
  const [contractCounselors, setContractCounselors] = useState(200);
  const [contractCases, setContractCases] = useState(10000);

  const solos = useMemo(() => solopreneurs(), [tenants]);

  const totals = useMemo(() => {
    let counselors = 0, cases = 0, activeCounselors = 0, activeCases = 0;
    for (const t of tenants) {
      counselors += t.contractMaxCounselors;
      cases += t.contractMaxActiveCases;
      const cap = getTenantCapacity(t.id);
      if (cap) {
        activeCounselors += cap.activeCounselorCount;
        activeCases += cap.activeCaseCount;
      }
    }
    return { counselors, cases, activeCounselors, activeCases };
  }, [tenants]);

  function addTenant() {
    provisionTenant({ name, type, contractMaxCounselors: contractCounselors, contractMaxActiveCases: contractCases });
    setTenants(loadTenants());
  }

  return (
    <MasterAdminGuard>
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-accent font-bold flex items-center gap-2">
          <LockKeyhole className="w-4 h-4" />
          Corporate Master Admin
        </p>
        <div className="max-w-4xl space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Tenant Provisioning &amp; Contract Authority
          </h1>
          <p className="text-sm text-ink/60 leading-relaxed">
            Every agency tenant, its tenant administrator, and every independent
            solopreneur on the platform — the full set of accounts the Master Admin
            manages at the business/technology layer. This page never shows
            individual client cases: those belong solely to each tenant&rsquo;s own
            authority.
          </p>
        </div>
      </header>

      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Contracted Counselors" value={String(totals.counselors)} icon={<Users className="w-4 h-4" />} />
        <Metric label="Active Counselors" value={String(totals.activeCounselors)} icon={<UserCog className="w-4 h-4" />} />
        <Metric label="Contracted Cases" value={String(totals.cases)} icon={<FileText className="w-4 h-4" />} />
        <Metric label="Active Cases" value={String(totals.activeCases)} icon={<ShieldCheck className="w-4 h-4" />} />
      </section>

      <section className="grid lg:grid-cols-[0.95fr_1.3fr] gap-5 items-start">
        <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-ink/10 bg-ink/[0.015]">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45 font-bold">
              Corporate Setup
            </p>
            <h2 className="font-bold text-ink">Add Tenant / Client Contract</h2>
          </div>
          <div className="p-5 space-y-4">
            <Field label="Tenant / Client Name">
              <input value={name} onChange={(e) => setName(e.target.value)} className="form-field" />
            </Field>
            <Field label="Tenant Type">
              <select value={type} onChange={(e) => setType(e.target.value as TenantType)} className="form-field">
                {tenantTypes.map((t) => (
                  <option key={t} value={t}>
                    {TENANT_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Contracted Counselors">
                <input type="number" min={1} value={contractCounselors} onChange={(e) => setContractCounselors(Math.max(1, Number(e.target.value) || 1))} className="form-field" />
              </Field>
              <Field label="Contracted Active Cases">
                <input type="number" min={1} value={contractCases} onChange={(e) => setContractCases(Math.max(1, Number(e.target.value) || 1))} className="form-field" />
              </Field>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-ink/70">
              Once a tenant is provisioned, assign its Tenant Administrator from User
              Management. Tenant admins may add/remove counselors and clients only
              inside their own tenant and only up to the contracted capacity above.
              Client profiles and case content remain outside Master Admin access at
              all times.
            </div>
            <button onClick={addTenant} className="w-full inline-flex items-center justify-center gap-2 bg-accent text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-accent-light transition">
              <CheckCircle2 className="w-4 h-4" /> Provision Tenant Authority
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {tenants.map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}

          <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-ink/10 bg-ink/[0.015] flex items-center gap-2">
              <UserCog className="w-4 h-4 text-accent" />
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45 font-bold">
                  Independent Practitioners
                </p>
                <h2 className="font-bold text-ink text-sm">
                  Solopreneurs ({solos.length})
                </h2>
              </div>
            </div>
            <ul className="divide-y divide-ink/10">
              {solos.length === 0 && (
                <li className="p-5 text-sm text-ink/55">No solopreneur accounts yet.</li>
              )}
              {solos.map((s) => (
                <li key={s.email} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm text-ink">{s.name}</p>
                    <p className="text-xs text-ink/55">
                      {s.credentials} · {s.email}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">
                    Self-billed
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
    </MasterAdminGuard>
  );
}

function TenantCard({ tenant }: { tenant: Tenant }) {
  const Icon = iconFor(tenant.type);
  const cap = getTenantCapacity(tenant.id);
  const admin = counselorsInTenant(tenant.id).find((c) => c.tenantRole === "TENANT_ADMIN");
  const counselorPct = cap ? Math.round((cap.activeCounselorCount / tenant.contractMaxCounselors) * 100) : 0;
  const casePct = cap ? Math.round((cap.activeCaseCount / tenant.contractMaxActiveCases) * 100) : 0;

  return (
    <article className="bg-white border border-ink/10 rounded-2xl p-5 space-y-4 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent grid place-items-center flex-shrink-0"><Icon className="w-5 h-5" /></div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.14em] text-ink/45 font-bold">{TENANT_TYPE_LABELS[tenant.type]}</p>
          <h3 className="font-bold text-ink">{tenant.name}</h3>
          <p className="text-sm text-ink/55 mt-1">
            {admin ? `Tenant Admin: ${admin.name} · ${admin.email}` : "No tenant administrator assigned yet"}
          </p>
        </div>
        <Badge>{tenant.status}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <div className="flex justify-between text-xs text-ink/55 mb-1">
            <span>Counselors</span>
            <span>{cap?.activeCounselorCount ?? 0} / {tenant.contractMaxCounselors}</span>
          </div>
          <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${Math.min(100, counselorPct)}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-ink/55 mb-1">
            <span>Active cases</span>
            <span>{cap?.activeCaseCount ?? 0} / {tenant.contractMaxActiveCases}</span>
          </div>
          <div className="h-1.5 rounded-full bg-ink/10 overflow-hidden">
            <div className="h-full bg-accent" style={{ width: `${Math.min(100, casePct)}%` }} />
          </div>
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white border border-ink/10 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent grid place-items-center flex-shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-ink/55">{label}</p>
        <p className="text-xl font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-xs font-bold uppercase tracking-wider text-ink/50">{label}</span>
      {children}
    </label>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-accent/10 text-accent font-semibold px-2 py-1 text-xs">{children}</span>;
}
