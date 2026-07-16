"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Building2,
  Calculator,
  CheckCircle2,
  Database,
  DollarSign,
  FileText,
  Landmark,
  ShieldCheck,
  Users,
} from "lucide-react";
import MasterAdminGuard from "@/components/MasterAdminGuard";

type EntityType = "Individual" | "Private Agency" | "Government/Enterprise";

const entityTypes: EntityType[] = [
  "Individual",
  "Private Agency",
  "Government/Enterprise",
];

function seatRate(seats: number): number {
  if (seats <= 10) return 50;
  if (seats <= 50) return 40;
  return 30;
}

function isolationPremium(type: EntityType): number {
  if (type === "Private Agency") return 150;
  if (type === "Government/Enterprise") return 1500;
  return 0;
}

function profitabilityFloor(type: EntityType): number {
  if (type === "Private Agency") return 250;
  if (type === "Government/Enterprise") return 2500;
  return 0;
}

function currency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export default function PricingEnginePage() {
  const [entityType, setEntityType] = useState<EntityType>("Government/Enterprise");
  const [seats, setSeats] = useState(35);
  const [cases, setCases] = useState(1200);

  const quote = useMemo(() => {
    const rate = seatRate(seats);
    const seatsCost = seats * rate;
    const caseCost = cases * 0.5;
    const premium = isolationPremium(entityType);
    const subtotal = seatsCost + caseCost + premium;
    const floor = profitabilityFloor(entityType);
    const floorTriggered = subtotal < floor;
    const monthlyTotal = floorTriggered ? floor : subtotal;
    return {
      rate,
      seatsCost,
      caseCost,
      premium,
      subtotal,
      floor,
      floorTriggered,
      monthlyTotal,
      annualTotal: monthlyTotal * 12,
    };
  }, [entityType, seats, cases]);

  return (
    <MasterAdminGuard>
    <div className="space-y-6">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-accent font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Corporate Administrator · Confidential Pricing
        </p>
        <div className="max-w-4xl space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-ink">
            Enterprise Pricing Proposal Engine
          </h1>
          <p className="text-sm text-ink/60 leading-relaxed">
            Generate internal B2B/B2G contract pricing proposals that account for seat scale, active case volume, isolated infrastructure overhead, and minimum profitability floors.
          </p>
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        <Metric label="Monthly Quote" value={currency(quote.monthlyTotal)} icon={<DollarSign className="w-4 h-4" />} strong />
        <Metric label="Annual Contract Value" value={currency(quote.annualTotal)} icon={<FileText className="w-4 h-4" />} />
        <Metric label="Seat Rate Applied" value={`${currency(quote.rate)} / seat`} icon={<Users className="w-4 h-4" />} />
      </section>

      <section className="grid lg:grid-cols-[0.95fr_1.25fr] gap-5 items-start">
        <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-ink/10 bg-ink/[0.015] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent grid place-items-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45 font-bold">
                Proposal Inputs
              </p>
              <h2 className="font-bold text-ink">Client Metrics</h2>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <Field label="Entity Type">
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value as EntityType)}
                className="form-field"
              >
                {entityTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </Field>

            <Field label="User Seats (U)">
              <input
                type="number"
                min={1}
                value={seats}
                onChange={(e) => setSeats(Math.max(1, Number(e.target.value) || 1))}
                className="form-field"
              />
            </Field>

            <Field label="Active Client Capacity (C)">
              <input
                type="number"
                min={0}
                value={cases}
                onChange={(e) => setCases(Math.max(0, Number(e.target.value) || 0))}
                className="form-field"
              />
            </Field>

            <div className="rounded-xl border border-ink/10 bg-cream/60 p-4 space-y-2 text-sm text-ink/65">
              <p className="font-semibold text-ink">Internal pricing rule</p>
              <p>
                Seat rate uses degressive tiers: 1–10 seats at $50, 11–50 at $40, 51+ at $30. Active client capacity adds $0.50 per case per month.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-ink/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-ink/10 bg-ink/[0.015] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fresh/10 text-fresh grid place-items-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-ink/45 font-bold">
                Transparent Breakdown
              </p>
              <h2 className="font-bold text-ink">Proposal Output</h2>
            </div>
          </div>

          <div className="p-5 space-y-5">
            <BreakdownRow label={`Seats Cost (${seats} × ${currency(quote.rate)})`} value={quote.seatsCost} icon={<Users className="w-4 h-4" />} />
            <BreakdownRow label={`Case Cost (${cases} × $0.50)`} value={quote.caseCost} icon={<Database className="w-4 h-4" />} />
            <BreakdownRow label="Infrastructure Isolation Premium" value={quote.premium} icon={entityType === "Government/Enterprise" ? <Landmark className="w-4 h-4" /> : <Building2 className="w-4 h-4" />} />
            <div className="border-t border-ink/10 pt-4">
              <BreakdownRow label="Calculated Subtotal" value={quote.subtotal} icon={<Calculator className="w-4 h-4" />} muted />
            </div>

            {quote.floor > 0 && (
              <div className={`rounded-xl border p-4 ${quote.floorTriggered ? "border-amber-200 bg-amber-50" : "border-emerald-200 bg-emerald-50"}`}>
                <div className="flex items-start gap-3">
                  {quote.floorTriggered ? (
                    <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className={`font-bold text-sm ${quote.floorTriggered ? "text-amber-800" : "text-emerald-800"}`}>
                      {quote.floorTriggered ? "Profitability Floor Triggered" : "Profitability Floor Not Triggered"}
                    </p>
                    <p className="text-sm text-ink/65 mt-1">
                      {entityType} floor: {currency(quote.floor)} / month. {quote.floorTriggered ? "The quote has been raised to protect platform margins." : "The calculated subtotal exceeds the required minimum."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-2xl bg-accent text-white p-6 space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-white/65 font-bold">
                Final Monthly Contract Value
              </p>
              <p className="text-4xl font-bold tracking-tight">{currency(quote.monthlyTotal)}</p>
              <p className="text-sm text-white/70">
                Annualized value: {currency(quote.annualTotal)}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-ink/15 px-4 py-3 text-sm font-semibold text-ink/70 hover:bg-ink/5 transition">
                <FileText className="w-4 h-4" /> Draft Proposal
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg bg-fresh px-4 py-3 text-sm font-semibold text-white hover:bg-fresh-dark transition">
                <DollarSign className="w-4 h-4" /> Approve Quote
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
    </MasterAdminGuard>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="space-y-1.5 block">
      <span className="text-xs font-bold uppercase tracking-wider text-ink/50">
        {label}
      </span>
      {children}
    </label>
  );
}

function Metric({ label, value, icon, strong = false }: { label: string; value: string; icon: React.ReactNode; strong?: boolean }) {
  return (
    <div className={`${strong ? "bg-accent text-white" : "bg-white text-ink"} border border-ink/10 rounded-xl p-4 space-y-2`}>
      <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${strong ? "text-white/70" : "text-accent"}`}>
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function BreakdownRow({ label, value, icon, muted = false }: { label: string; value: number; icon: React.ReactNode; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className={`flex items-center gap-2 text-sm ${muted ? "text-ink/50" : "text-ink/70"}`}>
        <span className="text-accent">{icon}</span>
        {label}
      </div>
      <div className={`font-bold ${muted ? "text-ink/60" : "text-ink"}`}>{currency(value)}</div>
    </div>
  );
}
