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

type TenantType = "State Client" | "City Client" | "Agency Client" | "Individual Counselor";

type ProvisionedTenant = {
  name: string;
  type: TenantType;
  adminName: string;
  adminEmail: string;
  contractCounselors: number;
  contractCases: number;
  activeCounselors: number;
  activeCases: number;
};

const seedTenants: ProvisionedTenant[] = [
  {
    name: "Illinois Statewide VR Pilot",
    type: "State Client",
    adminName: "Dana Wright",
    adminEmail: "dana.wright@state.example",
    contractCounselors: 200,
    contractCases: 12000,
    activeCounselors: 147,
    activeCases: 8420,
  },
  {
    name: "Chicago Workforce Accessibility Office",
    type: "City Client",
    adminName: "Miguel Alvarez",
    adminEmail: "malvarez@city.example",
    contractCounselors: 45,
    contractCases: 2100,
    activeCounselors: 39,
    activeCases: 1730,
  },
  {
    name: "BridgeWorks Community Rehabilitation",
    type: "Agency Client",
    adminName: "Aisha Johnson",
    adminEmail: "aisha@bridgeworks.example",
    contractCounselors: 18,
    contractCases: 650,
    activeCounselors: 12,
    activeCases: 418,
  },
  {
    name: "Robin Khatri Solo Practice",
    type: "Individual Counselor",
    adminName: "Robin Khatri",
    adminEmail: "robin@solo.example",
    contractCounselors: 1,
    contractCases: 80,
    activeCounselors: 1,
    activeCases: 31,
  },
];

const tenantTypes: TenantType[] = [
  "State Client",
  "City Client",
  "Agency Client",
  "Individual Counselor",
];

function iconFor(type: TenantType) {
  if (type === "State Client") return Landmark;
  if (type === "City Client") return MapPinned;
  if (type === "Individual Counselor") return UserCog;
  return Building2;
}

export default function MasterAdminPage() {
  const [tenants, setTenants] = useState(seedTenants);
  const [name, setName] = useState("New State VR Contract");
  const [type, setType] = useState<TenantType>("State Client");
  const [adminName, setAdminName] = useState("Assigned Tenant Administrator");
  const [adminEmail, setAdminEmail] = useState("admin@example.org");
  const [contractCounselors, setContractCounselors] = useState(200);
  const [contractCases, setContractCases] = useState(10000);

  const totals = useMemo(
    () => ({
      counselors: tenants.reduce((sum, t) => sum + t.contractCounselors, 0),
      cases: tenants.reduce((sum, t) => sum + t.contractCases, 0),
      activeCounselors: tenants.reduce((sum, t) => sum + t.activeCounselors, 0),
      activeCases: tenants.reduce((sum, t) => sum + t.activeCases, 0),
    }),
    [tenants],
  );

  function addTenant() {
    setTenants((prev) => [
      {
        name,
        type,
        adminName,
        adminEmail,
        contractCounselors,
        contractCases,
        activeCounselors: 0,
        activeCases: 0,
      },
      ...prev,
    ]);
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-accent font-bold flex items-center gap-2">
          <LockKeyhole className="w-4 h-4" />
          Corporate Master Admin
        </p>
        <div className="max-w-4xl space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Tenant Provisioning & Contract Authority
          </h1>
          <p className="text-sm text-ink/60 leading-relaxed">
            Create state, city, agency, and individual counselor tenants; assign the tenant administrator; and set the contracted counselor and active case capacity that governs delegated administration.
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
                {tenantTypes.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Tenant Admin Name">
                <input value={adminName} onChange={(e) => setAdminName(e.target.value)} className="form-field" />
              </Field>
              <Field label="Tenant Admin Email">
                <input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="form-field" />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Contracted Counselors">
                <input type="number" min={1} value={contractCounselors} onChange={(e) => setContractCounselors(Math.max(1, Number(e.target.value) || 1))} className="form-field" />
              </Field>
              <Field label="Contracted Active Cases">
                <input type="number" min={1} value={contractCases} onChange={(e) => setContractCases(Math.max(1, Number(e.target.value) || 1))} className="form-field" />
              </Field>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-ink/70">
              Tenant admins may add/delete counselors and manage users only inside this tenant and only up to the agreed contracted capacity. Client profiles outside their tenant or outside assigned counselor authority remain inaccessible.
            </div>
            <button onClick={addTenant} className="w-full inline-flex items-center justify-center gap-2 bg-accent text-white px-4 py-3 rounded-lg text-sm font-semibold hover:bg-accent-light transition">
              <CheckCircle2 className="w-4 h-4" /> Provision Tenant Authority
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {tenants.map((tenant) => (
            <TenantCard key={`${tenant.name}-${tenant.adminEmail}`} tenant={tenant} />
          ))}
        </div>
      </section>
    </div>
  );
}

function TenantCard({ tenant }: { tenant: ProvisionedTenant }) {
  const Icon = iconFor(tenant.type);
  const counselorPct = Math.round((tenant.activeCounselors / tenant.contractCounselors) * 100);
  const casePct = Math.round((tenant.activeCases / tenant.contractCases) * 100);

  return (
    <article className="bg-white border border-ink/10 rounded-2xl p-5 space-y-4 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-accent/10 text-accent grid place-items-center flex-shrink-0"><Icon className="w-5 h-5" /></div>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-[0.14em] text-ink/45 font-bold">{tenant.type}</p>
          <h3 className="font-bold text-ink">{tenant.name}</h3>
          <p className="text-sm text-ink/55 mt-1">Tenant Admin: {tenant.adminName} · {tenant.adminEmail}</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <Capacity label="Counselor Capacity" active={tenant.activeCounselors} max={tenant.contractCounselors} pct={counselorPct} />
        <Capacity label="Active Case Capacity" active={tenant.activeCases} max={tenant.contractCases} pct={casePct} />
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <Badge>Can invite counselors</Badge>
        <Badge>Can remove users</Badge>
        <Badge>Cannot exceed contract limits</Badge>
        <Badge>Tenant-scoped client access only</Badge>
      </div>
    </article>
  );
}

function Capacity({ label, active, max, pct }: { label: string; active: number; max: number; pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1"><span className="font-semibold text-ink">{label}</span><span className="text-ink/55">{active} / {max}</span></div>
      <div className="h-2 bg-ink/10 rounded-full overflow-hidden"><div className="h-full bg-fresh rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="space-y-1.5 block"><span className="text-xs font-bold uppercase tracking-wider text-ink/50">{label}</span>{children}</label>;
}

function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return <div className="bg-white border border-ink/10 rounded-xl p-4 space-y-2"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">{icon}{label}</div><div className="text-2xl font-bold text-ink">{value}</div></div>;
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full bg-accent/10 text-accent font-semibold px-2 py-1">{children}</span>;
}
