import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Pathways Pro",
  description: "The terms that govern your use of Pathways Pro.",
};

// Placeholder page — full content coming soon.
export default function Page() {
  return (
    <div className="max-w-3xl space-y-5 py-8">
      <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
        Pathways Pro
      </p>
      <h1 className="text-4xl tracking-tight">Terms of Service</h1>
      <p className="text-lg text-ink/70">The terms that govern your use of Pathways Pro.</p>
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
