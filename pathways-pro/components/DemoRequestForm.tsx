"use client";

import { useState } from "react";

type Audience = "counselor-agency" | "employer";

interface StoredRequest {
  name: string;
  email: string;
  organization: string;
  audience: Audience;
  notes?: string;
  submittedAt: string;
}

const STORE_KEY = "pathways-pro:demo-requests-v1";

function storeLocally(r: StoredRequest) {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    const list = raw ? (JSON.parse(raw) as StoredRequest[]) : [];
    window.localStorage.setItem(STORE_KEY, JSON.stringify([r, ...list]));
  } catch {
    // localStorage unavailable — the API log still has the submission.
  }
}

export function DemoRequestForm({
  defaultAudience = "counselor-agency",
}: {
  defaultAudience?: Audience;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [audience, setAudience] = useState<Audience>(defaultAudience);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim() || !organization.trim()) {
      setError("Name, email, and organization are required.");
      return;
    }
    setBusy(true);
    const payload = {
      name: name.trim(),
      email: email.trim(),
      organization: organization.trim(),
      audience,
      notes: notes.trim() || undefined,
    };
    try {
      const resp = await fetch("/api/request-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) {
        const j = (await resp.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error ?? `Request failed (${resp.status})`);
      }
      storeLocally({ ...payload, submittedAt: new Date().toISOString() });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div
        role="status"
        className="bg-cream border border-emerald-300 rounded-lg p-8 text-center space-y-3"
      >
        <div className="text-3xl" aria-hidden>
          ✓
        </div>
        <h2 className="text-2xl">Request received.</h2>
        <p className="text-ink/75 text-sm max-w-md mx-auto">
          Thanks, {name.split(" ")[0] || "there"} — we&apos;ll reach out to{" "}
          <strong>{email}</strong> within one business day to schedule your
          walkthrough.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-cream border border-ink/15 rounded-lg shadow-sm p-7 space-y-5"
    >
      <fieldset>
        <legend className="block text-xs uppercase tracking-wider text-ink/60 mb-2">
          I am a…
        </legend>
        <div className="flex bg-ink/5 rounded-md p-1">
          <button
            type="button"
            onClick={() => setAudience("counselor-agency")}
            aria-pressed={audience === "counselor-agency"}
            className={`flex-1 px-3 py-2.5 min-h-[44px] text-sm rounded transition ${
              audience === "counselor-agency"
                ? "bg-cream shadow-sm text-accent font-semibold"
                : "text-ink/60"
            }`}
          >
            Counselor / Agency
          </button>
          <button
            type="button"
            onClick={() => setAudience("employer")}
            aria-pressed={audience === "employer"}
            className={`flex-1 px-3 py-2.5 min-h-[44px] text-sm rounded transition ${
              audience === "employer"
                ? "bg-cream shadow-sm text-accent font-semibold"
                : "text-ink/60"
            }`}
          >
            Employer
          </button>
        </div>
      </fieldset>

      {error && (
        <div
          role="alert"
          className="bg-accent/10 border border-accent/30 text-accent text-sm px-3 py-2 rounded"
        >
          {error}
        </div>
      )}

      <label className="block">
        <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
          Full name
        </span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jordan Rivera"
          autoComplete="name"
          required
          className="demo-input"
        />
      </label>

      <label className="block">
        <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
          Work email
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={
            audience === "employer"
              ? "you@company.com"
              : "you@agency.gov"
          }
          autoComplete="email"
          required
          className="demo-input"
        />
      </label>

      <label className="block">
        <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
          Organization
        </span>
        <input
          type="text"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder={
            audience === "employer"
              ? "Acme Logistics"
              : "State VR agency or CRP name"
          }
          autoComplete="organization"
          required
          className="demo-input"
        />
      </label>

      <label className="block">
        <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
          What do you want to see? (optional)
        </span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder={
            audience === "employer"
              ? "e.g. ADA compliance audit workflow, retention risk reporting…"
              : "e.g. IPE drafting, caseload migration, RSA-911 reporting…"
          }
          className="demo-input"
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="w-full bg-accent text-cream font-semibold py-3 min-h-[44px] rounded-md hover:bg-accent/90 transition disabled:opacity-50"
      >
        {busy ? "Sending…" : "Request a Demo →"}
      </button>

      <p className="text-xs text-ink/55 text-center">
        No procurement paperwork. One 30-minute walkthrough, tailored to your
        workflow.
      </p>

      <style jsx>{`
        :global(.demo-input) {
          width: 100%;
          background: white;
          border: 1px solid rgba(31, 29, 26, 0.2);
          border-radius: 6px;
          padding: 0.65rem 0.75rem;
          font-size: 0.9rem;
          min-height: 44px;
        }
        :global(.demo-input:focus) {
          outline: none;
          border-color: #b95c3c;
        }
      `}</style>
    </form>
  );
}
