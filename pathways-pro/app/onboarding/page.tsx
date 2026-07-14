"use client";

import { useState } from "react";
import { onboardingSchema } from "@/lib/onboarding-schema";
import {
  ROLES,
  ROLE_LABELS,
  INDUSTRY_SECTORS,
  VENDOR_SERVICES,
  type OnboardingRole,
} from "@/lib/onboarding-constants";

export default function OnboardingPage() {
  const [role, setRole] = useState<OnboardingRole>("COUNSELOR");
  const [sector, setSector] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function toggleService(svc: string) {
    setServices((prev) =>
      prev.includes(svc) ? prev.filter((s) => s !== svc) : [...prev, svc],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const payload: Record<string, unknown> = {
      role,
      name,
      email,
      password,
      sector,
      jobTitle,
    };
    if (role === "BUSINESS") payload.department = department;
    if (role === "VENDOR") payload.services = services;

    const result = onboardingSchema.safeParse(payload);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!res.ok) {
        const data = await res.json();
        setErrors({ form: data.error ?? "Something went wrong." });
        return;
      }
      window.location.href = "/dashboard";
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6">
      <header className="space-y-3 mb-10">
        <p className="text-xs uppercase tracking-widest text-accent">
          Account setup
        </p>
        <h1 className="text-4xl tracking-tight">Join the ecosystem.</h1>
        <p className="text-ink/70">
          Tell us your role and we&apos;ll tailor your workspace.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Role selector */}
        <fieldset className="space-y-2">
          <legend className="text-xs uppercase tracking-widest text-ink/60 mb-2">
            I am a...
          </legend>
          <div className="flex bg-ink/5 rounded-md p-1">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setRole(r);
                  setServices([]);
                  setErrors({});
                }}
                className={`flex-1 px-3 py-2.5 text-sm rounded transition ${
                  role === r
                    ? "bg-cream shadow-sm text-accent font-semibold"
                    : "text-ink/60 hover:text-ink"
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Identity */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Full name" error={errors.name}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Candace Metcalf"
              className="onb-input"
            />
          </Field>
          <Field label="Work email" error={errors.email}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@agency.gov"
              className="onb-input"
            />
          </Field>
        </div>

        <Field label="Password (8+ characters)" error={errors.password}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="onb-input"
          />
        </Field>

        {/* Sector + title (all roles) */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Industry sector" error={errors.sector}>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="onb-input"
            >
              <option value="">Select sector...</option>
              {INDUSTRY_SECTORS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label={role === "BUSINESS" ? "Job title / Department" : "Job title"}
            error={errors.jobTitle}
          >
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder={
                role === "COUNSELOR"
                  ? "VR Counselor II"
                  : role === "BUSINESS"
                    ? "Director of HR"
                    : "Vocational Evaluator"
              }
              className="onb-input"
            />
          </Field>
        </div>

        {/* Vendor-only: services provided */}
        {role === "VENDOR" && (
          <fieldset className="space-y-3 border border-ink/15 bg-cream rounded-lg p-5">
            <legend className="text-xs uppercase tracking-widest text-accent font-semibold px-1">
              Services you provide to the network
            </legend>
            {errors.services && (
              <p className="text-sm text-red-600">{errors.services}</p>
            )}
            <div className="grid sm:grid-cols-2 gap-2">
              {VENDOR_SERVICES.map((svc) => {
                const checked = services.includes(svc);
                return (
                  <label
                    key={svc}
                    className={`flex items-center gap-2.5 text-sm px-3 py-2 rounded-md cursor-pointer transition ${
                      checked
                        ? "bg-accent/10 text-accent font-medium"
                        : "text-ink/75 hover:bg-ink/5"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleService(svc)}
                      className="accent-accent w-4 h-4"
                    />
                    {svc}
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-ink/50">
              {services.length} service{services.length !== 1 ? "s" : ""}{" "}
              selected
            </p>
          </fieldset>
        )}

        {/* Submit */}
        {errors.form && (
          <div className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-md">
            {errors.form}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-accent text-cream font-semibold py-3 rounded-md hover:bg-accent/90 transition disabled:opacity-50"
        >
          {submitting
            ? "Creating workspace..."
            : `Create ${ROLE_LABELS[role]} account`}
        </button>
      </form>

      <style jsx>{`
        :global(.onb-input) {
          width: 100%;
          background: white;
          border: 1px solid rgba(31, 29, 26, 0.2);
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          font-size: 0.9rem;
        }
        :global(.onb-input:focus) {
          outline: none;
          border-color: #0f6b54;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
        {label}
      </span>
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </label>
  );
}
