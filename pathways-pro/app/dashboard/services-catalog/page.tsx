"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import {
  CATEGORY_LABELS,
  canEditPricing,
  effectiveEnabled,
  effectivePrice,
  formatPrice,
  loadCounselorPricing,
  SERVICE_CATALOG,
  setPriceOverride,
  setServiceEnabled,
  type CatalogService,
  type ServiceCategory,
} from "@/lib/service-catalog";
import { isMasterAdmin, isTenantAdmin } from "@/lib/rbac";

export default function ServicesCatalogPage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [bump, setBump] = useState(0);
  const [category, setCategory] = useState<ServiceCategory | "all">("all");

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const profile = useMemo(
    () => (user ? loadCounselorPricing(user.email) : null),
    [user, bump],
  );

  const services = useMemo(() => {
    if (category === "all") return SERVICE_CATALOG;
    return SERVICE_CATALOG.filter((s) => s.category === category);
  }, [category]);

  if (!user || !profile) return null;

  const editable = canEditPricing(user.email);
  const tenantScoped = isTenantAdmin(user);
  const masterAdmin = isMasterAdmin(user);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          Service Management
        </p>
        <h1 className="text-3xl font-semibold">
          Service catalog &amp; pricing
        </h1>
        <p className="text-ink/65 text-sm mt-1 prose-narrow">
          {SERVICE_CATALOG.length} services with pre-populated industry rates.{" "}
          {masterAdmin
            ? "Platform-wide view — pricing shown belongs to individual tenants/solopreneurs and is not editable here."
            : editable
              ? tenantScoped
                ? "Select which services your agency offers and set your agency's rates — every counselor in your tenant inherits these. Every change is logged below for audit."
                : "Select which services you offer and set your own rates. Every change is logged below for audit."
              : "Informational — showing your agency's current services and rates. Only your Tenant Administrator can change what's offered or its pricing."}
        </p>
      </header>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs uppercase tracking-wider text-ink/55 mr-2">
          Filter:
        </span>
        <CategoryPill
          active={category === "all"}
          onClick={() => setCategory("all")}
          label={`All (${SERVICE_CATALOG.length})`}
        />
        {(Object.entries(CATEGORY_LABELS) as [ServiceCategory, string][]).map(
          ([k, label]) => {
            const count = SERVICE_CATALOG.filter((s) => s.category === k).length;
            if (count === 0) return null;
            return (
              <CategoryPill
                key={k}
                active={category === k}
                onClick={() => setCategory(k)}
                label={`${label} (${count})`}
              />
            );
          },
        )}
      </div>

      <ul role="list" className="space-y-3">
        {services.map((s) => (
          <ServiceRow
            key={s.id}
            service={s}
            counselorEmail={user.email}
            editable={editable}
            onChange={() => setBump((n) => n + 1)}
          />
        ))}
      </ul>

      {profile.changeLog.length > 0 && (
        <section className="saas-card">
          <h2 className="text-lg font-semibold mb-3">
            Pricing change audit log
          </h2>
          <ol className="space-y-2 text-xs" role="list">
            {profile.changeLog.slice(0, 20).map((c, i) => (
              <li
                key={i}
                className="flex items-baseline justify-between gap-3 border-b border-ink/10 pb-2 last:border-0"
              >
                <span>
                  <strong>
                    {SERVICE_CATALOG.find((s) => s.id === c.serviceId)?.title ??
                      c.serviceId}
                  </strong>{" "}
                  · {c.field === "priceCents" ? "price" : "enabled"} changed
                  from{" "}
                  <code>
                    {c.field === "priceCents"
                      ? `$${(Number(c.oldValue) / 100).toLocaleString()}`
                      : String(c.oldValue)}
                  </code>{" "}
                  to{" "}
                  <code>
                    {c.field === "priceCents"
                      ? `$${(Number(c.newValue) / 100).toLocaleString()}`
                      : String(c.newValue)}
                  </code>
                </span>
                <time className="text-ink/55" dateTime={c.changedAt}>
                  {new Date(c.changedAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function CategoryPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
        active
          ? "grad-tealblue text-white"
          : "border border-ink/15 text-ink/70 hover:border-emerald-500"
      }`}
    >
      {label}
    </button>
  );
}

function ServiceRow({
  service,
  counselorEmail,
  editable,
  onChange,
}: {
  service: CatalogService;
  counselorEmail: string;
  editable: boolean;
  onChange: () => void;
}) {
  const currentPrice = effectivePrice(service.id, counselorEmail);
  const enabled = effectiveEnabled(service.id, counselorEmail);
  const overridden = currentPrice !== service.defaultPriceCents;

  const [editing, setEditing] = useState(false);
  const [dollars, setDollars] = useState(String(currentPrice / 100));

  function save() {
    const cents = Math.round(parseFloat(dollars || "0") * 100);
    if (!Number.isFinite(cents) || cents < 0) return;
    setPriceOverride(counselorEmail, service.id, cents);
    setEditing(false);
    onChange();
  }

  function resetToDefault() {
    setPriceOverride(counselorEmail, service.id, service.defaultPriceCents);
    setDollars(String(service.defaultPriceCents / 100));
    onChange();
  }

  function toggleEnabled() {
    setServiceEnabled(counselorEmail, service.id, !enabled);
    onChange();
  }

  return (
    <li className={`saas-card ${enabled ? "" : "opacity-60"}`}>
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h3 className="text-lg font-semibold">{service.title}</h3>
            <span className="text-[10px] uppercase tracking-wider bg-ink/5 text-ink/65 px-2 py-0.5 rounded-full">
              {service.category.replaceAll("-", " ")}
            </span>
            {overridden && (
              <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full font-semibold">
                Price overridden
              </span>
            )}
          </div>
          <p className="text-sm text-ink/70 mt-1">{service.description}</p>
        </div>
        {editable ? (
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={enabled}
              onChange={toggleEnabled}
              className="accent-emerald-500 w-4 h-4"
            />
            <span>{enabled ? "Enabled" : "Disabled"}</span>
          </label>
        ) : (
          <span
            className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded-full font-semibold ${
              enabled ? "bg-emerald-100 text-emerald-900" : "bg-ink/10 text-ink/50"
            }`}
          >
            {enabled ? "Offered" : "Not offered"}
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-4 gap-3 mt-3 text-xs">
        <div className="border border-ink/10 rounded p-2 bg-white">
          <div className="text-[10px] uppercase tracking-wider text-ink/55">
            Industry default
          </div>
          <div className="text-sm font-semibold">
            {formatPrice(service.defaultPriceCents, service.priceUnit)}
          </div>
        </div>
        <div className="border border-emerald-200 rounded p-2 bg-emerald-50/50">
          <div className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold">
            {editable ? "Your price" : "Agency price"}
          </div>
          {editable && editing ? (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-sm">$</span>
              <input
                type="number"
                step={1}
                min={0}
                className="w-24 bg-white border border-ink/15 rounded px-2 py-1 text-sm"
                value={dollars}
                onChange={(e) => setDollars(e.target.value)}
                autoFocus
              />
              <button
                onClick={save}
                className="text-xs bg-emerald-600 text-white px-2 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditing(false)}
                className="text-xs text-ink/55"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-semibold">
                {formatPrice(currentPrice, service.priceUnit)}
              </div>
              {editable && (
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-emerald-700 hover:underline"
                >
                  Edit
                </button>
              )}
            </div>
          )}
          {editable && overridden && (
            <button
              onClick={resetToDefault}
              className="text-[10px] text-ink/55 hover:text-emerald-700 mt-1"
            >
              Reset to default
            </button>
          )}
        </div>
        <div className="border border-ink/10 rounded p-2 bg-white">
          <div className="text-[10px] uppercase tracking-wider text-ink/55">
            Turnaround
          </div>
          <div className="text-sm font-semibold">{service.turnaround}</div>
        </div>
        <div className="border border-ink/10 rounded p-2 bg-white">
          <div className="text-[10px] uppercase tracking-wider text-ink/55">
            Available to
          </div>
          <div className="text-sm font-semibold">
            {service.availableTo
              .map((a) => a[0].toUpperCase() + a.slice(1))
              .join(" · ")}
            {service.visibleToClient && (
              <span className="ml-1 text-emerald-700">· Client</span>
            )}
          </div>
        </div>
      </div>

      <details className="mt-3 text-xs">
        <summary className="cursor-pointer text-ink/65 hover:text-emerald-700">
          AI generation template
        </summary>
        <p className="mt-2 text-ink/75 italic border-l-2 border-emerald-300 pl-3">
          {service.aiTemplate}
        </p>
      </details>
    </li>
  );
}
