import type { Metadata } from "next";
import { DemoRequestForm } from "@/components/DemoRequestForm";

export const metadata: Metadata = {
  title: "Request a Demo | Pathways Pro",
  description:
    "See Pathways Pro in action. Book a 30-minute walkthrough with the founder and see how the platform connects to your workflow.",
};

export default function RequestDemoPage() {
  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start py-6">
      <div className="space-y-5 pt-2">
        <p className="text-xs uppercase tracking-widest text-accent">
          See it in action
        </p>
        <h1 className="text-4xl tracking-tight">
          Request a demo of Pathways Pro.
        </h1>
        <p className="text-ink/75">
          A 30-minute walkthrough with the founder, tailored to your
          workflow — whether you are a state VR agency, a community
          rehab provider, an employment partner, or a business seeking
          inclusive hiring solutions.
        </p>

        <div className="border border-ink/15 bg-cream rounded-lg p-5 space-y-3">
          <h2 className="text-sm font-semibold text-ink">
            What you will see
          </h2>
          <ul className="space-y-2 text-sm text-ink/75">
            <li className="flex gap-2">
              <span className="text-accent font-bold flex-none">&#10003;</span>
              <span>Live IPE drafting against real client data</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold flex-none">&#10003;</span>
              <span>Dual counselor + client interface in real time</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold flex-none">&#10003;</span>
              <span>BLS and O*NET labor market data wired into the case</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold flex-none">&#10003;</span>
              <span>Business-facing tools: job task analysis, ADA consulting</span>
            </li>
            <li className="flex gap-2">
              <span className="text-accent font-bold flex-none">&#10003;</span>
              <span>HIPAA and Section 508 compliance documentation</span>
            </li>
          </ul>
        </div>

        <p className="text-sm text-ink/60">
          Prefer email?{" "}
          <a
            href="mailto:candace@pathwayspro.app?subject=Demo%20request"
            className="text-accent underline"
          >
            candace@pathwayspro.app
          </a>
        </p>
      </div>

      <DemoRequestForm />
    </div>
  );
}
