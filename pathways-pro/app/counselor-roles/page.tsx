"use client";

// Standalone page for the top-30 roles explorer. The same content is
// embedded on the public homepage; this route keeps a direct,
// shareable URL.

import Link from "next/link";
import { CounselorRolesExplorer } from "@/components/CounselorRolesExplorer";

export default function CounselorRolesPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs uppercase tracking-widest text-accent mb-2">
          Who the platform serves
        </p>
        <h1 className="text-4xl tracking-tight">
          Top 30 Vocational Rehabilitation Counseling Roles
        </h1>
        <p className="text-ink/75 mt-3 max-w-3xl">
          A curated ranking of the vocational rehabilitation counseling roles
          and job titles Pathways Pro is built for — strictly focused on
          career, employment, and workplace-reintegration specialties. View
          the ranking by market tier, sort by estimated salary, or group by
          required certification.
        </p>
      </header>

      <CounselorRolesExplorer />

      <section className="text-center py-6">
        <Link
          href="/"
          className="inline-block grad-tealblue text-white font-semibold px-6 py-3 rounded-md"
        >
          ← Back to Pathways Pro home
        </Link>
      </section>
    </div>
  );
}
