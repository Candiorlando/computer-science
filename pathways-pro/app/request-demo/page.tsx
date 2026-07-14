import type { Metadata } from "next";
import { DemoRequestForm } from "@/components/DemoRequestForm";

export const metadata: Metadata = {
  title: "Request a Demo | Pathways Pro",
  description:
    "Book a 30-minute Pathways Pro walkthrough for your VR agency, community rehab provider, or HR team — no procurement paperwork required to start.",
};

export default function RequestDemoPage() {
  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start py-6">
      <div className="space-y-5 pt-2">
        <p className="text-xs uppercase tracking-widest text-accent">
          Request a demo
        </p>
        <h1 className="text-4xl tracking-tight">
          See Pathways Pro on your own workflow.
        </h1>
        <p className="text-ink/75">
          Thirty minutes, live, against the questions you actually have —
          whether that&apos;s drafting an IPE from a real referral or running
          an ADA compliance audit for a worksite.
        </p>
        <ul className="space-y-2 text-sm text-ink/80 pt-1">
          <li className="flex gap-2">
            <span className="text-accent font-bold" aria-hidden>
              ✓
            </span>
            <span>Live demo against your real workflow questions</span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent font-bold" aria-hidden>
              ✓
            </span>
            <span>
              Compliance documentation (HIPAA-aligned architecture, § 508) on
              request
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-accent font-bold" aria-hidden>
              ✓
            </span>
            <span>90-day pilot option — up to 25 active cases</span>
          </li>
        </ul>
      </div>

      <DemoRequestForm />
    </div>
  );
}
