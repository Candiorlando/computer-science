"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { ClientUser } from "@/lib/users";
import { loadProfile } from "@/lib/storage";
import { loadTSA } from "@/lib/tsa-storage";
import {
  loadBusinessPlans,
  saveBusinessPlan,
  deleteBusinessPlan,
  newEntrepreneurshipId,
  type BusinessPlan,
} from "@/lib/entrepreneurship";
import { LEGAL_DISCLAIMER } from "@/lib/self-advocacy";
import { recordCaseNoteEvent } from "@/lib/case-notes";

type ApiResponse = Omit<
  BusinessPlan,
  | "id"
  | "caseId"
  | "clientName"
  | "businessName"
  | "conceptSummary"
  | "targetCustomer"
  | "geographicMarket"
  | "startingBudget"
  | "createdAt"
  | "generatedByModel"
>;

export default function BusinessPlanPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [client, setClient] = useState<ClientUser | null>(null);
  const [clientName, setClientName] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [conceptSummary, setConceptSummary] = useState("");
  const [targetCustomer, setTargetCustomer] = useState("");
  const [geographicMarket, setGeographicMarket] = useState("");
  const [startingBudget, setStartingBudget] = useState(8000);
  const [natureOfCondition, setNatureOfCondition] = useState("");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setAuthorized(true);
    setClientName(s.name);
    if (s.role === "client") setClient(s);
    const list = loadBusinessPlans();
    setPlans(list);
    if (list.length > 0) setActiveId(list[0].id);
  }, [router]);

  const profile = useMemo(() => (authorized ? loadProfile() : null), [authorized]);
  const tsa = useMemo(() => (authorized ? loadTSA() : null), [authorized]);
  const active = useMemo(
    () => plans.find((p) => p.id === activeId) ?? null,
    [plans, activeId],
  );

  async function generate() {
    if (!businessName.trim() || !conceptSummary.trim() || !targetCustomer.trim()) {
      setError("Business name, concept summary, and target customer are all required.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const resp = await fetch("/api/generate-business-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          businessName,
          conceptSummary,
          targetCustomer,
          geographicMarket: geographicMarket || profile?.intake?.zipCode || "Local market",
          startingBudget,
          natureOfCondition: natureOfCondition || undefined,
          accommodationContext: profile?.intake?.constraints,
          transferableSkills: tsa?.coreSkills.map((s) => s.skill),
        }),
      });
      if (!resp.ok) {
        const body = await resp.json().catch(() => ({ error: "Request failed" }));
        setError(body.error ?? "Generation failed.");
        setGenerating(false);
        return;
      }
      const data = (await resp.json()) as ApiResponse;
      const plan: BusinessPlan = {
        id: newEntrepreneurshipId("plan"),
        caseId: client?.caseId,
        clientName,
        businessName,
        conceptSummary,
        targetCustomer,
        geographicMarket,
        startingBudget,
        ...data,
        createdAt: new Date().toISOString(),
        generatedByModel: "claude-opus-4-8",
      };
      saveBusinessPlan(plan);
      setPlans(loadBusinessPlans());
      setActiveId(plan.id);
      const atTotal = (plan.assistiveTechBudget ?? []).reduce(
        (s, a) => s + (a.estimatedCost ?? 0),
        0,
      );
      recordCaseNoteEvent({
        kind: "business-plan-generated",
        participantType: "individual-client",
        caseId: client?.caseId,
        clientName,
        sourceArtifactId: plan.id,
        businessName: plan.businessName,
        startingBudget: plan.startingBudget,
        breakEvenMonth: plan.financialProjections.breakEvenMonth,
        atBudgetTotal: atTotal,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setGenerating(false);
    }
  }

  function remove(id: string) {
    if (!window.confirm("Delete this plan?")) return;
    deleteBusinessPlan(id);
    const next = loadBusinessPlans();
    setPlans(next);
    if (activeId === id) setActiveId(next[0]?.id ?? null);
  }

  if (!authorized) return null;

  return (
    <div className="space-y-6">
      <header className="print:hidden">
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Self-Employment · Step 2
        </p>
        <h1 className="text-4xl mb-2">
          Business <em className="italic text-accent">Plan</em> Generator
        </h1>
        <p className="text-ink/70 prose-narrow">
          A complete VR-fundable plan: executive summary, target market,
          operations with accommodations built in, financial projections,
          a dedicated AT line-item budget, risks &amp; funding pathways.
        </p>
      </header>

      <section className="border border-ink/15 rounded-lg p-5 bg-cream space-y-4 print:hidden">
        <h2 className="text-xl">Tell us about the business</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Business name" required>
            <input
              className="input"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Hayes Mobile Notary"
              required
            />
          </Field>
          <Field label="Starting budget (USD)">
            <input
              type="number"
              className="input"
              value={startingBudget}
              min={500}
              max={250_000}
              onChange={(e) => setStartingBudget(Number(e.target.value))}
            />
          </Field>
        </div>
        <Field label="One-sentence concept summary" required>
          <textarea
            className="input min-h-[70px]"
            value={conceptSummary}
            onChange={(e) => setConceptSummary(e.target.value)}
            placeholder="A mobile notary service serving real estate closings in the south Chicago suburbs."
            required
          />
        </Field>
        <Field label="Target customer (one specific persona)" required>
          <input
            className="input"
            value={targetCustomer}
            onChange={(e) => setTargetCustomer(e.target.value)}
            placeholder="e.g., Solo real estate agents who close 2-4 deals a month and need flexible after-hours signings"
            required
          />
        </Field>
        <Field label="Geographic market">
          <input
            className="input"
            value={geographicMarket}
            onChange={(e) => setGeographicMarket(e.target.value)}
            placeholder="e.g., South Chicago suburbs · ZIPs 60617, 60629, 60652"
          />
        </Field>
        <Field label="Disability context for the plan (optional)">
          <textarea
            className="input min-h-[60px]"
            value={natureOfCondition}
            onChange={(e) => setNatureOfCondition(e.target.value)}
            placeholder="e.g., chronic fatigue limits 4-5 productive hours/day · prefer batched task design"
          />
        </Field>
      </section>

      <div className="print:hidden">
        <button
          onClick={generate}
          disabled={generating}
          className="px-5 py-2.5 bg-accent text-cream rounded font-semibold disabled:opacity-50"
        >
          {generating
            ? "Drafting the full plan with Claude Opus 4.8…"
            : plans.length > 0
              ? "Draft another business plan ✨"
              : "Generate full business plan ✨"}
        </button>
        {error && (
          <div
            role="alert"
            aria-live="polite"
            className="mt-3 text-sm border border-accent/40 bg-accent/10 text-accent p-3 rounded"
          >
            {error}
          </div>
        )}
      </div>

      {plans.length > 0 && (
        <section
          aria-label="Saved business plans"
          className="border border-accent/30 bg-accent/5 rounded-lg p-4 print:hidden"
        >
          <h2 className="text-sm font-semibold mb-2">
            Saved plans ({plans.length})
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => setActiveId(p.id)}
                aria-pressed={activeId === p.id}
                className={`text-left text-xs border rounded p-2 ${
                  activeId === p.id
                    ? "border-accent bg-cream"
                    : "border-ink/15 bg-white hover:border-accent"
                }`}
              >
                <div className="font-semibold">{p.businessName}</div>
                <div className="text-ink/55">
                  {new Date(p.createdAt).toLocaleString()}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(p.id);
                  }}
                  className="text-ink/40 hover:text-accent mt-1"
                >
                  Delete
                </button>
              </button>
            ))}
          </div>
        </section>
      )}

      {active && <PlanPreview plan={active} />}

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: #1E293B;
          border: 1px solid rgba(230, 234, 242, 0.2);
          border-radius: 6px;
          padding: 0.55rem 0.75rem;
          font-family: inherit;
        }
        :global(.input:focus-visible) {
          outline: 2px solid #6366F1;
          outline-offset: -1px;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block mb-1 text-sm text-ink/80">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      {children}
    </label>
  );
}

function PlanPreview({ plan }: { plan: BusinessPlan }) {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-3 print:hidden">
        <h2 className="text-2xl">{plan.businessName} — Business Plan</h2>
        <button
          onClick={() => window.print()}
          className="text-sm bg-accent text-cream px-4 py-2 rounded font-semibold"
        >
          🖨️ Print / Save as PDF
        </button>
      </div>

      <article className="plan-page bg-white shadow-sm border border-ink/15 rounded-sm p-8 space-y-6">
        <header className="text-center border-b border-ink/15 pb-4">
          <h1 className="text-3xl font-semibold">{plan.businessName}</h1>
          <p className="text-sm text-ink/65">
            Business Plan · Drafted {new Date(plan.createdAt).toLocaleDateString()}
          </p>
          <p className="text-xs text-ink/55 mt-1">
            Owner: {plan.clientName}
          </p>
        </header>

        <Section title="Executive Summary">
          <p className="text-sm leading-relaxed">{plan.executiveSummary}</p>
        </Section>

        <Section title="Product / Service">
          <p className="text-sm">{plan.productService}</p>
        </Section>

        <Section title="Problem Solved">
          <p className="text-sm">{plan.problemSolved}</p>
        </Section>

        <Section title="Unique Value Proposition">
          <p className="text-sm italic">&ldquo;{plan.uniqueValueProposition}&rdquo;</p>
        </Section>

        <Section title="Target Market">
          <p className="text-sm mb-2">
            <strong>Customer persona:</strong> {plan.targetMarketAnalysis.persona}
          </p>
          <p className="text-sm mb-3">
            <strong>Market size:</strong> {plan.targetMarketAnalysis.marketSize}
          </p>
          <h3 className="text-sm font-semibold mt-3">Competitor landscape</h3>
          <ul className="text-sm list-disc pl-5 mt-1 space-y-1">
            {plan.targetMarketAnalysis.competitors.map((c, i) => (
              <li key={i}>
                <strong>{c.name}:</strong> {c.differentiator}
              </li>
            ))}
          </ul>
          <h3 className="text-sm font-semibold mt-3">Go-to-market channels</h3>
          <ul className="text-sm list-disc pl-5 mt-1 space-y-1">
            {plan.targetMarketAnalysis.gotoMarketChannels.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </Section>

        <Section title="Operations">
          <h3 className="text-sm font-semibold">Workflow</h3>
          <ol className="text-sm list-decimal pl-5 mt-1 space-y-1">
            {plan.operations.workflowSteps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <h3 className="text-sm font-semibold mt-3">30 / 60 / 90-day milestones</h3>
          <ul className="text-sm list-disc pl-5 mt-1 space-y-1">
            {plan.operations.keyMilestones30_60_90.map((m, i) => (
              <li key={i}>
                <strong>Day {m.day}:</strong> {m.goal}
              </li>
            ))}
          </ul>
          <h3 className="text-sm font-semibold mt-3">
            Accommodations built into operations
          </h3>
          <ul className="text-sm list-disc pl-5 mt-1 space-y-1">
            {plan.operations.accommodationsBuiltIn.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </Section>

        <Section title="Financial Projections">
          <h3 className="text-sm font-semibold">Startup costs</h3>
          <table className="text-sm w-full mt-1">
            <tbody>
              {plan.financialProjections.startupCosts.map((s, i) => (
                <tr key={i} className="border-b border-ink/10">
                  <td className="py-1">{s.item}</td>
                  <td className="py-1 text-right tabular-nums">
                    ${s.cost.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-1 font-semibold">Total startup</td>
                <td className="py-1 text-right tabular-nums font-semibold">
                  $
                  {plan.financialProjections.startupCosts
                    .reduce((s, x) => s + x.cost, 0)
                    .toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-sm font-semibold mt-4">Monthly operating expenses</h3>
          <table className="text-sm w-full mt-1">
            <tbody>
              {plan.financialProjections.monthlyExpenses.map((s, i) => (
                <tr key={i} className="border-b border-ink/10">
                  <td className="py-1">{s.item}</td>
                  <td className="py-1 text-right tabular-nums">
                    ${s.cost.toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-1 font-semibold">Total monthly</td>
                <td className="py-1 text-right tabular-nums font-semibold">
                  $
                  {plan.financialProjections.monthlyExpenses
                    .reduce((s, x) => s + x.cost, 0)
                    .toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          <h3 className="text-sm font-semibold mt-4">Revenue projections</h3>
          <table className="text-sm w-full mt-1">
            <thead>
              <tr className="border-b border-ink/15">
                <th className="text-left py-1">Month</th>
                <th className="text-right py-1">Low</th>
                <th className="text-right py-1">High</th>
              </tr>
            </thead>
            <tbody>
              {plan.financialProjections.revenueProjections.map((r) => (
                <tr key={r.month} className="border-b border-ink/10">
                  <td className="py-1">M{r.month}</td>
                  <td className="py-1 text-right tabular-nums">
                    ${r.low.toLocaleString()}
                  </td>
                  <td className="py-1 text-right tabular-nums">
                    ${r.high.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm mt-3">
            <strong>Projected break-even:</strong> Month{" "}
            {plan.financialProjections.breakEvenMonth}
          </p>
        </Section>

        <Section title="Assistive Technology Budget">
          {plan.assistiveTechBudget.length === 0 ? (
            <p className="text-sm italic text-ink/55">
              No specific AT line items required.
            </p>
          ) : (
            <table className="text-sm w-full">
              <tbody>
                {plan.assistiveTechBudget.map((a, i) => (
                  <tr key={i} className="border-b border-ink/10">
                    <td className="py-1">
                      <div className="font-semibold">{a.item}</div>
                      <div className="text-xs text-ink/65">{a.rationale}</div>
                    </td>
                    <td className="py-1 text-right tabular-nums align-top">
                      ${a.estimatedCost.toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td className="py-1 font-semibold">Total AT budget</td>
                  <td className="py-1 text-right tabular-nums font-semibold">
                    $
                    {plan.assistiveTechBudget
                      .reduce((s, x) => s + x.estimatedCost, 0)
                      .toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
          <p className="text-xs text-ink/60 mt-2 italic">
            AT can be authorized by the state VR agency as discrete service
            line items separate from general startup costs.
          </p>
        </Section>

        <Section title="Risks &amp; Mitigations">
          <ul className="text-sm list-disc pl-5 space-y-2">
            {plan.risksAndMitigations.map((r, i) => (
              <li key={i}>
                <strong>{r.risk}.</strong> {r.mitigation}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Funding Pathways">
          <ul className="text-sm list-disc pl-5 space-y-1">
            {plan.fundingPathways.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </Section>

        <footer className="text-xs text-ink/55 italic border-t border-ink/15 pt-4">
          {LEGAL_DISCLAIMER}
        </footer>
      </article>

      <style jsx>{`
        .plan-page {
          font-family: Georgia, "Times New Roman", Times, serif;
          color: #1a1a1a;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .plan-page,
          .plan-page * {
            visibility: visible;
          }
          .plan-page {
            position: absolute;
            left: 0;
            top: 0;
            box-shadow: none;
            border: none;
            padding: 0.6in;
          }
        }
      `}</style>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold uppercase tracking-wider text-ink border-b border-ink/30 pb-1 mb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}
