"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Disclaimer } from "@/components/Disclaimer";
import { loadProfile, patchProfile, type UserProfile } from "@/lib/storage";
import { loadSession } from "@/lib/session";
import { patchClientReport } from "@/lib/client-report";
import { supportOptions } from "@/lib/intake-supports";

const educationLevels = [
  "Still in high school",
  "Some high school",
  "High school diploma / GED",
  "Some college",
  "Associate degree / vocational certificate",
  "Bachelor's degree",
  "Graduate / professional degree",
];

const schedulePreferences = [
  "Full time",
  "Part time",
  "Either is fine",
  "Days only",
  "Evenings or nights",
  "Weekends only",
  "Remote / work from home",
  "On-site",
  "Hybrid",
];

export default function IntakePage() {
  const router = useRouter();
  const [intake, setIntake] = useState<NonNullable<UserProfile["intake"]>>({});

  useEffect(() => {
    const p = loadProfile();
    if (p.intake) setIntake(p.intake);
  }, []);

  function update<K extends keyof NonNullable<UserProfile["intake"]>>(
    key: K,
    value: NonNullable<UserProfile["intake"]>[K],
  ) {
    setIntake((cur) => ({ ...cur, [key]: value }));
  }

  function toggleSupport(value: string) {
    const cur = intake.supportRequests ?? [];
    const next = cur.includes(value)
      ? cur.filter((v) => v !== value)
      : [...cur, value];
    update("supportRequests", next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    patchProfile({ intake });
    const s = loadSession();
    if (s && s.role === "client") {
      patchClientReport(s.caseId, s.name, {
        clientDob: s.dob,
        counselorName: s.counselorName,
        intake,
      });
    }
    router.push("/assessment");
  }

  const selectedSupports = intake.supportRequests ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Tell us about yourself</h1>
      <p className="text-ink/70 prose-narrow">
        A few questions to ground the matches, the coaching, and the plan
        your counselor builds with you. Everything you share here goes
        straight to your counselor.
      </p>

      <Disclaimer />

      <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
        {/* ───────────── 1. About you ───────────── */}
        <FormSection
          n={1}
          title="About you"
          sub="Basics we need to localize jobs, training, and benefits programs."
        >
          <Field label="Age range (optional)">
            <input
              className="input"
              value={intake.age ?? ""}
              onChange={(e) => update("age", e.target.value)}
              placeholder="e.g., 24 or 'mid-thirties'"
            />
          </Field>

          <Field label="ZIP code" required>
            <input
              className="input"
              required
              value={intake.zipCode ?? ""}
              onChange={(e) =>
                update(
                  "zipCode",
                  e.target.value.replace(/[^\d-]/g, "").slice(0, 10),
                )
              }
              placeholder="e.g., 60652"
              inputMode="numeric"
              pattern="\d{5}(-\d{4})?"
              maxLength={10}
            />
            <p className="text-xs text-ink/50 mt-1">
              We use your ZIP to find jobs, training programs, American Job
              Centers, and funding programs near you. 5 digits.
            </p>
          </Field>

          <Field label="City, state (optional)">
            <input
              className="input"
              value={intake.location ?? ""}
              onChange={(e) => update("location", e.target.value)}
              placeholder="e.g., Chicago, IL"
            />
          </Field>

          <Field label="Highest level of education completed" required>
            <select
              className="input"
              required
              value={intake.educationLevel ?? ""}
              onChange={(e) => update("educationLevel", e.target.value)}
            >
              <option value="">Select…</option>
              {educationLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {lvl}
                </option>
              ))}
            </select>
          </Field>
        </FormSection>

        {/* ───────────── 2. Your work story ───────────── */}
        <FormSection
          n={2}
          title="Your work story"
          sub="Real work, volunteer work, caretaking — it all counts and helps your counselor find good matches."
        >
          <Field label="Jobs I've held (paid work)">
            <textarea
              className="input min-h-[100px]"
              value={intake.pastJobs ?? ""}
              onChange={(e) => update("pastJobs", e.target.value)}
              placeholder="e.g., Warehouse picker (2019–2022), CNA (2022–2023), Cashier (2017)"
            />
          </Field>

          <Field label="Other experience (volunteering, caretaking, hobbies, side hustles)">
            <textarea
              className="input min-h-[100px]"
              value={intake.workHistory ?? ""}
              onChange={(e) => update("workHistory", e.target.value)}
              placeholder="e.g., 2 years caring for my dad after his stroke, youth coach at the YMCA, fix small engines on weekends."
            />
          </Field>

          <Field label="Constraints or considerations to factor in">
            <textarea
              className="input min-h-[100px]"
              value={intake.constraints ?? ""}
              onChange={(e) => update("constraints", e.target.value)}
              placeholder="e.g., chronic back issue (no heavy lifting), no car (need transit access), childcare 9–3, prefer not to work nights."
            />
            <p className="text-xs text-ink/50 mt-1">
              You decide what to share. Anything you put here helps your
              counselor pick services that actually fit your life.
            </p>
          </Field>
        </FormSection>

        {/* ───────────── 3. What you want ───────────── */}
        <FormSection
          n={3}
          title="What you want"
          sub="There's no wrong answer — be honest with the big dream AND the next concrete step."
        >
          <Field label="My dream job (if you could pick anything)">
            <input
              className="input"
              value={intake.dreamJob ?? ""}
              onChange={(e) => update("dreamJob", e.target.value)}
              placeholder="e.g., Run my own bakery · Wildlife photographer · Veterinarian"
            />
            <p className="text-xs text-ink/50 mt-1">
              Aim high. We&apos;ll work backwards from here to find a real
              path.
            </p>
          </Field>

          <Field label="My specific employment goal right now">
            <input
              className="input"
              value={intake.employmentGoal ?? ""}
              onChange={(e) => update("employmentGoal", e.target.value)}
              placeholder="e.g., Get hired as a Medical Assistant in the next 12 months"
            />
            <p className="text-xs text-ink/50 mt-1">
              This becomes the &ldquo;Vocational Goal&rdquo; on your IPE plan
              with your counselor.
            </p>
          </Field>

          <Field label="What I want out of a job (pay, learning, schedule, purpose…)">
            <textarea
              className="input min-h-[80px]"
              value={intake.goals ?? ""}
              onChange={(e) => update("goals", e.target.value)}
              placeholder="e.g., steady paycheck I can plan around, learn a real trade, work outdoors, eventually move up."
            />
          </Field>

          <Field label="Schedule preference">
            <select
              className="input"
              value={intake.schedulePreference ?? ""}
              onChange={(e) => update("schedulePreference", e.target.value)}
            >
              <option value="">No preference</option>
              {schedulePreferences.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </Field>

          <label className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              checked={intake.openToApprenticeship ?? false}
              onChange={(e) =>
                update("openToApprenticeship", e.target.checked)
              }
            />
            <span>
              I&apos;m open to apprenticeships or on-the-job training (no
              degree required).
            </span>
          </label>
        </FormSection>

        {/* ───────────── 4. Support you'd like ───────────── */}
        <FormSection
          n={4}
          title="Support I'd like from my counselor"
          sub={`Check anything that would help. Your counselor will see this list and follow up. (${selectedSupports.length} selected)`}
        >
          <fieldset className="space-y-2">
            <legend className="sr-only">Support requests</legend>
            {supportOptions.map((opt) => {
              const checked = selectedSupports.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 border rounded cursor-pointer transition ${
                    checked
                      ? "border-accent bg-accent/5"
                      : "border-ink/15 bg-white hover:border-accent"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 accent-accent"
                    checked={checked}
                    onChange={() => toggleSupport(opt.value)}
                  />
                  <span>
                    <span className="font-semibold block">{opt.label}</span>
                    <span className="text-xs text-ink/60">{opt.sub}</span>
                  </span>
                </label>
              );
            })}
          </fieldset>

          <Field label="Anything else I'd like help with">
            <textarea
              className="input min-h-[80px]"
              value={intake.supportOther ?? ""}
              onChange={(e) => update("supportOther", e.target.value)}
              placeholder="e.g., help applying for housing while I look for work, want to start a small business, need help with my driver's license."
            />
          </Field>
        </FormSection>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">
            Save & continue to assessment →
          </button>
        </div>
      </form>

      <style jsx>{`
        :global(.input) {
          width: 100%;
          background: white;
          border: 1px solid rgba(31, 29, 26, 0.2);
          border-radius: 6px;
          padding: 0.55rem 0.75rem;
          font-family: inherit;
        }
        :global(.input:focus) {
          outline: 2px solid #b95c3c;
          outline-offset: -1px;
        }
        :global(.btn-primary) {
          background: #b95c3c;
          color: white;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          font-family: inherit;
        }
        :global(.btn-primary:hover) {
          background: #9e4d33;
        }
      `}</style>
    </div>
  );
}

function FormSection({
  n,
  title,
  sub,
  children,
}: {
  n: number;
  title: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-ink/15 rounded-lg p-5 bg-cream space-y-4">
      <header>
        <p className="text-xs uppercase tracking-widest text-accent font-semibold mb-1">
          Section {n}
        </p>
        <h2 className="text-xl">{title}</h2>
        <p className="text-sm text-ink/65 mt-1">{sub}</p>
      </header>
      {children}
    </section>
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
