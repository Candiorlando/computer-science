"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { AnyUser, ClientUser } from "@/lib/users";

const earningsExamples = [
  { label: "Explore work", hours: "8 hrs/week at $15", monthly: 520 },
  { label: "Part-time", hours: "15 hrs/week at $17", monthly: 1105 },
  { label: "Steady part-time", hours: "25 hrs/week at $18", monthly: 1950 },
  { label: "Full-time entry", hours: "35 hrs/week at $20", monthly: 3033 },
  { label: "Career pathway", hours: "40 hrs/week at $24", monthly: 4160 },
];

const quickActions = [
  "Confirm which benefits you receive",
  "Estimate wages before changing hours",
  "Make a wage-reporting plan",
  "Bring questions to a benefits counselor",
];

const resourceLinks = [
  {
    label: "Find WIPA benefits counseling",
    href: "https://choosework.ssa.gov/findhelp/",
    desc: "Free benefits planning for many SSI/SSDI beneficiaries.",
  },
  {
    label: "SSA Ticket to Work",
    href: "https://choosework.ssa.gov/",
    desc: "Learn how the voluntary employment-support program works.",
  },
  {
    label: "SSA Red Book",
    href: "https://www.ssa.gov/redbook/",
    desc: "Official guide to employment supports and work incentives.",
  },
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
    <div className="space-y-8 pb-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-ink/10 bg-white shadow-sm">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(46,158,126,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(184,137,43,0.16),transparent_35%)]" />
        <div className="relative grid gap-8 p-6 md:p-8 xl:grid-cols-[1.15fr_0.85fr] xl:items-center">
          <div className="max-w-3xl space-y-5">
            <span className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-accent">
              My benefits
            </span>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-ink md:text-5xl">
                Plan work with confidence, {firstName(client.name)}.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-ink/70 md:text-lg">
                Use this page to understand Ticket to Work, SSI/SSDI work rules,
                health coverage questions, and the steps that help protect your
                benefits while you move toward employment.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#work-plan"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-accent/90"
              >
                Build my work plan
              </a>
              <a
                href="#resources"
                className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-ink/15 bg-white/70 px-5 py-2.5 text-sm font-bold text-ink transition hover:border-accent hover:text-accent"
              >
                View trusted resources
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink/50">
              Start here
            </p>
            <div className="mt-4 grid gap-3">
              {quickActions.map((action, index) => (
                <div key={action} className="flex gap-3 rounded-2xl border border-ink/10 bg-cream/60 p-3">
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-accent text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="self-center text-sm font-semibold text-ink/80">{action}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <SpotlightCard
          eyebrow="Free and voluntary"
          title="Ticket to Work"
          description="SSA's employment-support program for many people ages 18 through 64 who receive SSI or SSDI because of disability."
          bullets={[
            "Choose a state VR agency or Employment Network.",
            "Work toward employment and greater independence.",
            "Timely progress can protect against some medical CDR triggers tied to Ticket use.",
          ]}
        />
        <SpotlightCard
          eyebrow="Ask first"
          title="Benefits counseling"
          description="A CWIC or WIPA benefits counselor helps compare work options before you change hours, wages, or coverage."
          bullets={[
            "Estimate SSI, SSDI, Medicaid, and Medicare impact.",
            "Identify work incentives like IRWE, PASS, 1619(b), and Trial Work Period.",
            "Create a wage-reporting and recordkeeping plan.",
          ]}
        />
        <SpotlightCard
          eyebrow="Protect yourself"
          title="Your action plan"
          description="The safest path is to test work in small steps, keep records, and ask for written estimates before major changes."
          bullets={[
            "Keep pay stubs and benefit notices.",
            "Report wages and work changes on time.",
            "Plan transportation, accommodations, and health coverage before increasing hours.",
          ]}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr] xl:items-start" id="work-plan">
        <div className="saas-card space-y-5 xl:sticky xl:top-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
              Income scenarios
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">
              See how work income grows
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              These examples show gross wages only. Your actual benefit impact
              depends on your program, state, household, expenses, and SSA work
              incentives.
            </p>
          </div>
          <div className="space-y-4">
            {earningsExamples.map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-ink">{item.label}</p>
                    <p className="text-xs text-ink/55">{item.hours}</p>
                  </div>
                  <p className="text-sm font-bold text-accent">
                    ${item.monthly.toLocaleString()}/mo
                  </p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full grad-tealblue"
                    style={{ width: `${(item.monthly / maxMonthly) * 100}%` }}
                    aria-label={`${item.label}: ${item.hours}, about $${item.monthly.toLocaleString()} per month before taxes`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950/80">
            Review a real plan with a certified benefits counselor before
            changing hours, wages, or health coverage.
          </div>
        </div>

        <BenefitsPlanBuilder />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ProgramCard
          title="SSI basics"
          summary="SSI is needs-based. Wages usually reduce the cash payment, but SSA does not count all wages. Many people keep part of SSI while working, and 1619(b) may protect Medicaid after cash SSI stops due to earnings."
          askAbout="Earned-income exclusions, Student Earned Income Exclusion, PASS, IRWE, Blind Work Expenses, and 1619(b)."
        />
        <ProgramCard
          title="SSDI basics"
          summary="SSDI is based on your work record or a family work record. It includes work incentives that let you test work, including a Trial Work Period and Extended Period of Eligibility."
          askAbout="Trial Work Period, Extended Period of Eligibility, SGA, subsidies, special conditions, IRWE, Medicare continuation, and Expedited Reinstatement."
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
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

      <section id="resources" className="saas-card space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
              Trusted resources
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">
              Save these links for your planning meeting
            </h2>
          </div>
          <Link
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-accent/30 px-4 py-2 text-sm font-bold text-accent transition hover:bg-accent hover:text-white"
            href="https://notebooklm.google.com/notebook/390cfc52-9643-498b-8f99-e36086eb132f/artifact/d6771fb8-2465-4067-afbd-50a57d5adc4e?utm_source=nlm_web_share&utm_medium=google_oo&utm_campaign=art_share_1&utm_content=&utm_smc=nlm_web_share_google_oo_art_share_1_"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open planning artifact
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {resourceLinks.map((resource) => (
            <Link
              key={resource.href}
              href={resource.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-2xl border border-ink/10 bg-cream/50 p-4 transition hover:border-accent hover:bg-white hover:shadow-sm"
            >
              <h3 className="font-bold text-ink">{resource.label}</h3>
              <p className="mt-2 text-sm leading-6 text-ink/65">{resource.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="text-lg font-bold text-amber-950">Important note</h2>
        <p className="mt-2 text-sm leading-6 text-amber-950/75">
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
    <div className="overflow-hidden rounded-[1.75rem] border border-ink/10 bg-white shadow-sm">
      <div className="grad-tealblue p-5 text-white md:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">
          Interactive planner
        </p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">Build your work plan</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
          Enter your wage, hours, benefits, and coverage. The planner turns your
          numbers into questions to bring to a benefits counselor.
        </p>
      </div>

      <div className="space-y-6 p-5 md:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
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

        <div className="grid gap-4 rounded-2xl border border-ink/10 bg-cream/50 p-4 sm:grid-cols-2">
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
          <div className="sm:col-span-2">
            <NumberField
              label="Estimated monthly living expenses"
              value={monthlyExpenses}
              min={0}
              max={8000}
              prefix="$"
              onChange={setMonthlyExpenses}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
          <Metric label="Gross wages/month" value={`$${plan.grossMonthly.toLocaleString()}`} />
          <Metric label="Gross wages/year" value={`$${plan.grossAnnual.toLocaleString()}`} />
          <Metric label="Benefits + wages/month" value={`$${plan.totalBeforeTaxes.toLocaleString()}`} />
          <Metric
            label="After expenses estimate"
            value={`${plan.cushion < 0 ? "-" : ""}$${Math.abs(plan.cushion).toLocaleString()}`}
            tone={plan.cushion < 0 ? "warning" : "positive"}
          />
        </div>

        <div>
          <h3 className="text-lg font-bold text-ink">Ways to make more from work</h3>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {plan.options.map((option) => (
              <div key={option.label} className="rounded-2xl border border-ink/10 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold text-ink">{option.label}</span>
                  <span className="text-sm font-bold text-accent">${option.value.toLocaleString()}/mo</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full grad-tealblue"
                    style={{ width: `${Math.min((option.value / 4500) * 100, 100)}%` }}
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-ink/60">{option.note}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <PlanList title="Ask about these work incentives" items={recommendedIncentives.incentives} />
          <PlanList title="Your next steps" items={recommendedIncentives.steps} />
        </div>
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
      <span className="font-bold text-ink">{label}</span>
      <select
        className="mt-1 min-h-[44px] w-full rounded-xl border border-ink/15 bg-white px-3 py-2 text-sm text-ink shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
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
      <span className="font-bold text-ink">{label}</span>
      <div className="mt-1 flex min-h-[44px] items-center gap-2 rounded-xl border border-ink/15 bg-white px-3 py-2 shadow-sm transition focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20">
        {prefix && <span className="text-ink/55">{prefix}</span>}
        <input
          className="w-full bg-transparent text-sm text-ink outline-none"
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
      <span className="flex items-center justify-between gap-3">
        <span className="font-bold text-ink">{label}</span>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-accent shadow-sm">
          {prefix}{value}{suffix}
        </span>
      </span>
      <input
        className="mt-3 w-full accent-accent"
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(clampNumber(event.target.value, min, max))}
      />
    </label>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "positive" | "warning" }) {
  const toneClass =
    tone === "positive"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-950"
        : "border-ink/10 bg-cream/50 text-ink";

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider opacity-60">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function PlanList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-cream/40 p-4">
      <h3 className="font-bold text-ink">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-5 text-ink/70">
            <span aria-hidden className="mt-1.5 h-1.5 w-1.5 flex-none rounded-full bg-accent" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SpotlightCard({
  eyebrow,
  title,
  description,
  bullets,
}: {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
}) {
  return (
    <article className="saas-card flex h-full flex-col gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-ink/70">{description}</p>
      </div>
      <ul className="mt-auto space-y-2">
        {bullets.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-5 text-ink/70">
            <span aria-hidden className="grid h-5 w-5 flex-none place-items-center rounded-full bg-accent/10 text-xs font-bold text-accent">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function ProgramCard({ title, summary, askAbout }: { title: string; summary: string; askAbout: string }) {
  return (
    <article className="rounded-3xl border border-ink/10 bg-white p-5 shadow-sm">
      <h2 className="text-2xl font-bold text-ink">{title}</h2>
      <p className="mt-3 text-sm leading-6 text-ink/70">{summary}</p>
      <div className="mt-4 rounded-2xl border border-accent/15 bg-accent/5 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Ask about</p>
        <p className="mt-2 text-sm leading-6 text-ink/75">{askAbout}</p>
      </div>
    </article>
  );
}

function ChecklistCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="saas-card h-full">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-sm leading-6 text-ink/70">
            <span
              aria-hidden
              className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-accent/10 text-xs font-bold text-accent"
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

function firstName(name: string) {
  return name.split(" ")[0] || "there";
}

function clampNumber(value: string, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return min;
  return Math.min(Math.max(Math.round(parsed), min), max);
}
