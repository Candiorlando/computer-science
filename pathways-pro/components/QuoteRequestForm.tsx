"use client";

// Public, unauthenticated "request a quote" form shown on individual
// provider and agency public profile pages. Fees are never public — this
// is the only way a prospect reaches out for pricing (see
// lib/provider-directory.ts submitQuoteRequest()).

import { useState } from "react";
import { submitQuoteRequest, type QuoteRequest } from "@/lib/provider-directory";

export function QuoteRequestForm({
  toType,
  toId,
  toLabel,
}: {
  toType: QuoteRequest["toType"];
  toId: string;
  toLabel: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Name, email, and a short message are required.");
      return;
    }
    submitQuoteRequest({
      toType,
      toId,
      fromName: name.trim(),
      fromEmail: email.trim(),
      fromOrganization: organization.trim(),
      message: message.trim(),
    });
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-emerald-300 bg-emerald-50 text-emerald-900 rounded-lg p-5 text-sm">
        <p className="font-semibold">Request sent.</p>
        <p className="mt-1">
          {toLabel} will reach out directly with pricing and next steps.
          Fees are set independently by each provider and agency, so
          you&rsquo;ll hear back with a quote tailored to your needs.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-sm text-ink/60">
        Fees aren&rsquo;t listed publicly — request a quote and {toLabel}{" "}
        will contact you directly.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Your name">
          <input
            className="qr-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>
        <Field label="Your email">
          <input
            type="email"
            className="qr-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
      </div>
      <Field label="Organization (optional)">
        <input
          className="qr-input"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          placeholder="Company, agency, or leave blank if individual"
        />
      </Field>
      <Field label="What do you need?">
        <textarea
          className="qr-input min-h-[90px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Briefly describe the services you're looking for."
          required
        />
      </Field>
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        className="grad-tealblue text-white font-semibold px-5 py-2.5 rounded-md text-sm"
      >
        Request a quote →
      </button>
      <style jsx>{`
        :global(.qr-input) {
          width: 100%;
          background: white;
          border: 1px solid rgba(31, 29, 26, 0.2);
          border-radius: 6px;
          padding: 0.55rem 0.75rem;
          font-size: 0.875rem;
        }
        :global(.qr-input:focus) {
          outline: none;
          border-color: #0f6b54;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
