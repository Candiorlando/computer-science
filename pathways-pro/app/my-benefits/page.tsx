"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { AnyUser, ClientUser } from "@/lib/users";

const earningsExamples = [
  { label: "Exploring", hours: "8 hrs/week at $15", monthly: 520 },
  { label: "Part-time", hours: "15 hrs/week at $17", monthly: 1105 },
  { label: "Steady part-time", hours: "25 hrs/week at $18", monthly: 1950 },
  { label: "Full-time entry", hours: "35 hrs/week at $20", monthly: 3033 },
  { label: "Career pathway", hours: "40 hrs/week at $24", monthly: 4160 },
];

const maxMonthly = Math.max(...earningsExamples.map((e) => e.monthly));
const weeksPerMonth = 52 / 12;

type BenefitType = "ssi" | "ssdi" | "both" | "not-sure";
type HealthCoverage = "medicaid" | "medicare" | "both" | "private" | "not-sure";
type WorkGoal = "try-work" | "increase-hours" | "full-time" | "career-growth";

export default function MyBenefitsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AnyUser | null>(null);

  useEffect(() => {
    const session = loadSession();
    if (!session) return router.replace("/");
    if (session.role !== "client") return router.replace("/dashboard");
    setUser(session);
  }, [router]);

  const client = useMemo(
    () => (user?.role === "client" ? (user as ClientUser) : null),
    [user],
  );

  if (!client) return null;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-ink/55">
          My benefits
        </p>
        <h1 className="text-3xl font-semibold">
          Working, benefits, and your path to employment
        </h1>
        <p className="text-ink/70 max-w-3xl">
          A plain-language guide to Ticket to Work, benefits counseling,
          SSI/SSDI work rules, and the responsibilities that help protect your
          benefits while you move toward a job.
        </p>
      </header>

      <section className="saas-card grad-tealblue-soft">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-center">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              Work can add income and choices
            </h2>
            <p className="text-sm text-ink/70 mb-4">
              These examples show gross wages only. Your exact SSI, SSDI,
              Medicaid, Medicare, SNAP, housing, or other benefit impact depends
              on your program, state, household, expenses, and SSA work
              incentives. Review a real plan with a certified benefits
              counselor before changing hours.
            </p>
            <div className="space-y-3">
              {earningsExamples.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between gap-3 text-xs mb-1">
                    <span className="font-semibold text-ink">{item.label}</span>
                    <span className="text-ink/65">
                      ${item.monthly.toLocaleString()}/mo
                    </span>
                  </div>
                  <div className="h-5 bg-white/80 rounded-full overflow-hidden border border-ink/10">
                    <div
                      className="h-full grad-tealblue rounded-full"
                      style={{ width: `${(item.monthly / maxMonthly) * 100}%` }}
                      aria-label={`${item.label}: ${item.hours}, about $${item.monthly.toLocaleString()} per month before taxes`}
                    />
                  </div>
                  <p className="text-[11px] text-ink/55 mt-1">{item.hours}</p>
                </div>
              ))}
            </div>
          </div>
          <BenefitsPlanBuilder />
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-4">
        <InfoCard title="Ticket to Work" eyebrow="Free and voluntary">
          <p>
            Ticket to Work is an SSA program for people ages 18 through 64 who
            receive SSI or SSDI because of disability and want help preparing
            for, finding, or keeping work.
          </p>
          <ul>
            <li>You can work with your state VR agency or an Employment Network.</li>
            <li>The goal is progress toward employment and greater independence.</li>
            <li>
              While your Ticket is assigned and you make timely progress, SSA
              generally will not start a medical Continuing Disability Review
              just because of the Ticket.
            </li>
          </ul>
        </InfoCard>

        <InfoCard title="Benefits counseling" eyebrow="Ask before changing hours">
          <p>
            A benefits counselor, often called a CWIC through a WIPA project,
            helps you compare work options before you make decisions.
          </p>
          <ul>
            <li>Estimate how wages may affect SSI, SSDI, Medicaid, and Medicare.</li>
            <li>Identify work incentives like IRWE, PASS, 1619(b), or Trial Work Period.</li>
            <li>Create a wage-reporting and recordkeeping plan.</li>
          </ul>
        </InfoCard>
      </section>

      <section className="saas-card">
        <h2 className="text-xl font-semibold mb-4">SSI and SSDI basics</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-ink/10 p-4 bg-cream/40">
            <h3 className="font-semibold mb-2">SSI</h3>
            <p className="text-sm text-ink/70 mb-3">
              SSI is needs-based. Wages usually reduce the cash payment, but SSA
              does not count all wages. Common exclusions mean many people keep
              part of SSI while working, and 1619(b) may protect Medicaid after
              cash SSI stops due to earnings.
            </p>
            <p className="text-xs text-ink/55">
              Ask about: earned income exclusions, Student Earned Income
              Exclusion, Plan to Achieve Self-Support, Impairment-Related Work
              Expenses, Blind Work Expenses, and 1619(b).
            </p>
          </div>
          <div className="rounded-xl border border-ink/10 p-4 bg-cream/40">
            <h3 className="font-semibold mb-2">SSDI</h3>
            <p className="text-sm text-ink/70 mb-3">
              SSDI is based on your work record or a family work record. It has
              work incentives that let you test work, including a Trial Work
              Period and Extended Period of Eligibility. SSA also looks at
              Substantial Gainful Activity after work incentives apply.
            </p>
            <p className="text-xs text-ink/55">
              Ask about: Trial Work Period, Extended Period of Eligibility,
              Substantial Gainful Activity, subsidies, special conditions,
              IRWE, Medicare continuation, and Expedited Reinstatement.
            </p>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        <ChecklistCard
          title="Your rights"
          items={[
            "Choose whether to use Ticket to Work and which provider to work with.",
            "Request reasonable accommodations in employment or training.",
            "Ask SSA for written notices and appeal deadlines if benefits change.",
            "Get benefits counseling before making work decisions.",
          ]}
        />
        <ChecklistCard
          title="Your responsibilities"
          items={[
            "Report wages and work changes to SSA on time.",
            "Keep pay stubs, employer letters, and benefit notices.",
            "Tell your counselor about schedule, wage, health, or accommodation changes.",
            "Open and read SSA mail quickly because appeal windows are short.",
          ]}
        />
        <ChecklistCard
          title="Before starting work"
          items={[
            "Confirm whether you receive SSI, SSDI, or both.",
            "Meet with a benefits counselor for a written estimate.",
            "Plan transportation, accommodations, and assistive technology.",
            "Set reminders for wage reporting and progress check-ins.",
          ]}
        />
      </section>

      <section className="saas-card border-emerald-200 bg-emerald-50/60">
        <h2 className="text-lg font-semibold mb-2">Resource added</h2>
        <p className="text-sm text-ink/70 mb-3">
          The shared NotebookLM artifact is linked here as a supplemental
          benefits-planning resource.
        </p>
        <Link
          className="btn-secondary inline-flex"
          href="https://notebooklm.google.com/notebook/390cfc52-9643-498b-8f99-e36086eb132f/artifact/d6771fb8-2465-4067-afbd-50a57d5adc4e?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open benefits planning artifact
        </Link>
      </section>

      <section className="saas-card bg-amber-50 border-amber-200">
        <h2 className="text-lg font-semibold mb-2">Important note</h2>
        <p className="text-sm text-ink/70">
          This page is educational and is not legal, financial, or SSA benefits
          advice. Benefits rules change and individual situations vary. Work
          with your VR counselor, SSA, and a certified benefits counselor before
          relying on any estimate.
        </p>
      </section>
    </div>
  );
}

function BenefitsPlanBuilder() {
  const [benefitType, setBenefitType] = useState<BenefitType>("not-sure");
  const [healthCoverage, setHealthCoverage] = useState<HealthCoverage>("not-sure");
  const [workGoal, setWorkGoal] = useState<WorkGoal>("increase-hours");
  const [hourlyWage, setHourlyWage] = useState(18);
  const [hoursPerWeek, setHoursPerWeek] = useState(20);
  const [benefitAmount, setBenefitAmount] = useState(900);
  const [monthlyExpenses, setMonthlyExpenses] = useState(1200);

  const plan = useMemo(() => {
    const grossMonthly = Math.round(hourlyWage * hoursPerWeek * weeksPerMonth);
    const grossAnnual = Math.round(grossMonthly * 12);
    const totalBeforeTaxes = grossMonthly + benefitAmount;
    const cushion = totalBeforeTaxes - monthlyExpenses;
    const moreHoursMonthly = Math.round(hourlyWage * Math.min(hoursPerWeek + 5, 40) * weeksPerMonth);
    const higherWageMonthly = Math.round((hourlyWage + 3) * hoursPerWeek * weeksPerMonth);
    const fullTimeMonthly = Math.round(Math.max(hourlyWage, 20) * 40 * weeksPerMonth);

    return {
      grossMonthly,
      grossAnnual,
      totalBeforeTaxes,
      cushion,
      options: [
        {
          label: "+5 hours/week",
          value: moreHoursMonthly,
          note: "Good next step if stamina, transportation, and schedule are stable.",
        },
        {
          label: "+$3/hour",
          value: higherWageMonthly,
          note: "Ask about training, certifications, accommodations, or job carving.",
        },
        {
          label: "Full-time pathway",
          value: fullTimeMonthly,
          note: "Plan health coverage and SSA reporting before making this jump.",
        },
      ],
    };
  }, [benefitAmount, hourlyWage, hoursPerWeek, monthlyExpenses]);

  const recommendedIncentives = useMemo(
    () => benefitGuidance(benefitType, healthCoverage, workGoal, plan.grossMonthly),
    [benefitType, healthCoverage, workGoal, plan.grossMonthly],
  );

  return (
    <div className="rounded-2xl bg-white border border-ink/10 p-5 shadow-sm space-y-5">
      <div>
        <p className="text-xs uppercase tracking-widest text-emerald-700 font-semibold mb-2">
          Key idea · interactive
        </p>
        <h2 className="text-3xl font-bold text-grad-tealblue mb-2">
          Build your work plan
        </h2>
        <p className="text-sm text-ink/70">
          Try your own wage, hours, benefits, and health coverage situation to
          see what to ask a benefits counselor before you earn more.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <SelectField
          label="Benefits I receive"
          value={benefitType}
          onChange={(value) => setBenefitType(value as BenefitType)}
          options={[
            ["ssi", "SSI"],
            ["ssdi", "SSDI"],
            ["both", "SSI + SSDI"],
            ["not-sure", "Not sure yet"],
          ]}
        />
        <SelectField
          label="Health coverage"
          value={healthCoverage}
          onChange={(value) => setHealthCoverage(value as HealthCoverage)}
          options={[
            ["medicaid", "Medicaid"],
            ["medicare", "Medicare"],
            ["both", "Medicaid + Medicare"],
            ["private", "Employer/private plan"],
            ["not-sure", "Not sure yet"],
          ]}
        />
        <SelectField
          label="My work goal"
          value={workGoal}
          onChange={(value) => setWorkGoal(value as WorkGoal)}
          options={[
            ["try-work", "Try work safely"],
            ["increase-hours", "Increase hours"],
            ["full-time", "Move toward full-time"],
            ["career-growth", "Earn more through advancement"],
          ]}
        />
        <NumberField
          label="Monthly benefit amount"
          value={benefitAmount}
          min={0}
          max={4000}
          prefix="$"
          onChange={setBenefitAmount}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <RangeField
          label="Hourly wage"
          value={hourlyWage}
          min={10}
          max={45}
          prefix="$"
          onChange={setHourlyWage}
        />
        <RangeField
          label="Hours per week"
          value={hoursPerWeek}
          min={1}
          max={40}
          suffix=" hrs"
          onChange={setHoursPerWeek}
        />
      </div>

      <NumberField
        label="Estimated monthly living expenses"
        value={monthlyExpenses}
        min={0}
        max={8000}
        prefix="$"
        onChange={setMonthlyExpenses}
      />

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4" aria-live="polite">
        <p className="text-xs uppercase tracking-widest text-emerald-800 font-semibold mb-1">
          Your draft earning picture
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Metric label="Gross wages/month" value={`$${plan.grossMonthly.toLocaleString()}`} />
          <Metric label="Gross wages/year" value={`$${plan.grossAnnual.toLocaleString()}`} />
          <Metric label="Benefits + wages/month" value={`$${plan.totalBeforeTaxes.toLocaleString()}`} />
          <Metric
            label="After expenses estimate"
            value={`${plan.cushion < 0 ? "-" : ""}$${Math.abs(plan.cushion).toLocaleString()}`}
          />
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Ways to make more from work</h3>
        <div className="space-y-2">
          {plan.options.map((option) => (
            <div key={option.label} className="rounded-lg border border-ink/10 p-3">
              <div className="flex justify-between gap-2 text-sm font-semibold">
                <span>{option.label}</span>
                <span>${option.value.toLocaleString()}/mo gross</span>
              </div>
              <div className="h-2 bg-ink/10 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full grad-tealblue"
                  style={{ width: `${Math.min((option.value / 4500) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-ink/60 mt-2">{option.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <PlanList title="Ask about these work incentives" items={recommendedIncentives.incentives} />
        <PlanList title="Your next 3 steps" items={recommendedIncentives.steps} />
      </div>
    </div>
  );
}

function benefitGuidance(
  benefitType: BenefitType,
  healthCoverage: HealthCoverage,
  workGoal: WorkGoal,
  grossMonthly: number,
) {
  const incentives = new Set<string>();
  const steps = new Set<string>();

  if (benefitType === "ssi" || benefitType === "both" || benefitType === "not-sure") {
    incentives.add("SSI earned-income exclusions and how your countable income is estimated");
    incentives.add("1619(b) Medicaid continuation if cash SSI reduces or stops from earnings");
    incentives.add("IRWE or PASS if work expenses or a work goal plan applies");
  }

  if (benefitType === "ssdi" || benefitType === "both" || benefitType === "not-sure") {
    incentives.add("Trial Work Period months and Extended Period of Eligibility");
    incentives.add("Substantial Gainful Activity rules, subsidies, and special conditions");
    incentives.add("Expedited Reinstatement if benefits stop after sustained work");
  }

  if (healthCoverage === "medicaid" || healthCoverage === "both" || healthCoverage === "not-sure") {
    incentives.add("How to keep Medicaid while working, including state buy-in or 1619(b) options");
  }

  if (healthCoverage === "medicare" || healthCoverage === "both") {
    incentives.add("Medicare continuation timelines and premium help options");
  }

  steps.add("Bring this estimate, your latest SSA notice, and recent pay stubs to a benefits counselor.");
  steps.add("Set a wage-reporting reminder before your first paycheck or schedule change.");
  steps.add("Ask your VR counselor whether accommodations, transportation, or training can support more earnings.");

  if (workGoal === "increase-hours") {
    steps.add("Try one small hour increase first, then compare stamina, transportation, and benefit impact.");
  }
  if (workGoal === "full-time") {
    steps.add("Map the full-time offer against health coverage, SGA, and backup supports before accepting.");
  }
  if (workGoal === "career-growth") {
    steps.add("Choose one skill, certificate, or employer conversation that can raise your hourly wage.");
  }
  if (grossMonthly > 1500) {
    steps.add("Ask for a written benefits analysis before increasing wages further.");
  }

  return { incentives: Array.from(incentives), steps: Array.from(steps).slice(0, 5) };
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-ink">{label}</span>
      <select
        className="input mt-1 w-full"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  prefix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  prefix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-ink">{label}</span>
      <div className="mt-1 flex items-center gap-2">
        {prefix && <span className="text-ink/55">{prefix}</span>}
        <input
          className="input w-full"
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(clampNumber(event.target.value, min, max))}
        />
      </div>
    </label>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  prefix = "",
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  prefix?: string;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-ink">{label}</span>
      <span className="ml-2 text-ink/60">
        {prefix}{value}{suffix}
      </span>
      <input
        className="mt-2 w-full accent-emerald-700"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(clampNumber(event.target.value, min, max))}
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-ink/55">{label}</p>
      <p className="text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

function PlanList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-ink/10 p-4 bg-cream/40">
      <h3 className="font-semibold mb-2">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-xs text-ink/70">
            <span aria-hidden className="text-emerald-700 font-bold">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function InfoCard({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <article className="saas-card">
      <p className="text-xs uppercase tracking-widest text-emerald-700 font-semibold mb-1">
        {eyebrow}
      </p>
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="text-sm text-ink/70 space-y-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:grid [&_ul]:gap-1">
        {children}
      </div>
    </article>
  );
}

function ChecklistCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="saas-card">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm text-ink/70">
            <span
              aria-hidden
              className="mt-0.5 h-5 w-5 rounded-full bg-emerald-100 text-emerald-800 grid place-items-center text-xs font-bold flex-shrink-0"
            >
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function clampNumber(value: string, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(Math.max(Math.round(parsed), min), max);
}
