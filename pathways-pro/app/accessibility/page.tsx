import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Commitment — Pathways Pro",
  description: "Our commitment to an accessible, inclusive platform for every user.",
};

// Placeholder page — full content coming soon.
export default function Page() {
  return (
    <div className="max-w-3xl space-y-5 py-8">
      <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
        Pathways Pro
      </p>
      <h1 className="text-4xl tracking-tight">Accessibility Commitment</h1>
      <p className="text-lg text-ink/70">Our commitment to an accessible, inclusive platform for every user.</p>
      <p className="text-ink/55">
        This page is being prepared. In the meantime, reach us at{" "}
        <a href="mailto:guidance@pathwayspro.app" className="text-accent underline">
          guidance@pathwayspro.app
        </a>
        .
      </p>
    </div>
  );
}
