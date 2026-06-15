"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Disclaimer } from "@/components/Disclaimer";
import { loadProfile, patchProfile, type UserProfile } from "@/lib/storage";
import { loadSession } from "@/lib/session";
import { patchClientReport } from "@/lib/client-report";

const educationLevels = [
  "Still in high school",
  "Some high school",
  "High school diploma / GED",
  "Some college",
  "Associate degree / vocational certificate",
  "Bachelor's degree",
  "Graduate / professional degree",
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

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Tell us about yourself</h1>
      <p className="text-ink/70 prose-narrow">
        A few questions to ground the matches and coaching in your actual situation.
        Everything stays in your browser unless you choose to send it to the coach.
      </p>

      <Disclaimer />

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <Field label="Age range (optional)">
          <input
            className="input"
            value={intake.age ?? ""}
            onChange={(e) => update("age", e.target.value)}
            placeholder="e.g., 24 or 'mid-thirties'"
          />
        </Field>

        <Field label="Where do you live? (city + state, or ZIP)" required>
          <input
            className="input"
            required
            value={intake.location ?? ""}
            onChange={(e) => update("location", e.target.value)}
            placeholder="e.g., Akron, OH"
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
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
        </Field>

        <Field label="Work history so far (jobs, volunteering, caretaking, anything)">
          <textarea
            className="input min-h-[120px]"
            value={intake.workHistory ?? ""}
            onChange={(e) => update("workHistory", e.target.value)}
            placeholder="e.g., 3 years at a warehouse, 1 year as a CNA, took 2 years off to care for a parent."
          />
        </Field>

        <Field label="Constraints or considerations to factor in">
          <textarea
            className="input min-h-[120px]"
            value={intake.constraints ?? ""}
            onChange={(e) => update("constraints", e.target.value)}
            placeholder="e.g., chronic back issue (no heavy lifting), no car (need transit access), childcare 9–3, prefer not to work nights."
          />
          <p className="text-xs text-ink/50 mt-1">
            You decide what to share. If you have a disability and want help locating
            your state's Vocational Rehabilitation agency, mention it here or ask the coach later.
          </p>
        </Field>

        <Field label="What do you want from your next job or career?">
          <textarea
            className="input min-h-[100px]"
            value={intake.goals ?? ""}
            onChange={(e) => update("goals", e.target.value)}
            placeholder="e.g., steady paycheck, learn a trade, work outdoors, eventually start a business…"
          />
        </Field>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={intake.openToApprenticeship ?? false}
            onChange={(e) => update("openToApprenticeship", e.target.checked)}
          />
          <span>I'm open to apprenticeships or on-the-job training (no degree required).</span>
        </label>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary">Continue to assessment →</button>
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block mb-1 text-sm text-ink/80">
        {label} {required && <span className="text-accent">*</span>}
      </span>
      {children}
    </label>
  );
}
