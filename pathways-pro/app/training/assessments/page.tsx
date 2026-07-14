import type { Metadata } from "next";
import Link from "next/link";
import { CareerAssessmentDemo } from "@/components/CareerAssessmentDemo";

export const metadata: Metadata = {
  title: "Free Career Assessments — Pathways Pro",
  description:
    "Take the Interest Profiler (RIASEC), the Big Five Personality Inventory, and a work-environment check — free, no sign-up, instant results with best-fit careers.",
};

export default function AssessmentsPage() {
  return (
    <div className="space-y-10 pb-8">
      <header className="space-y-4 max-w-3xl">
        <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
          Free Pathways Pro experience · No sign-up
        </p>
        <h1 className="text-4xl tracking-tight leading-[1.08]">
          Take the <em className="italic text-accent">assessments</em>.
        </h1>
        <p className="text-lg text-ink/80 prose-narrow">
          The same instruments Pathways Pro uses with clients — the Interest
          Profiler (RIASEC), the Personality Inventory (Big Five / Mini-IPIP),
          and a quick work-environment check — with instant results and the
          careers that best match you.
        </p>
        <p className="text-sm text-ink/60">
          Part of{" "}
          <Link href="/training" className="text-accent underline">
            Course 1 — Rehabilitation Counselor Services &amp; Careers
          </Link>
          .
        </p>
      </header>

      <CareerAssessmentDemo />
    </div>
  );
}
