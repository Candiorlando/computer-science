"use client";

import { useId, useState } from "react";
import Link from "next/link";

// Elegant collapsible drawer for the About page: closed by default, expands
// smoothly (grid-rows transition) to reveal the platform's ethical and
// legal framework.

const FRAMEWORK: { title: string; body: string }[] = [
  {
    title: "The Integration Mandate (Olmstead v. L.C., 1999)",
    body:
      "Honoring the landmark Supreme Court decree that unjustified segregation is a profound denial of civil rights. We design our ecosystem to champion the right of every individual to live, work, and flourish in the most integrated community setting possible.",
  },
  {
    title:
      "The Americans with Disabilities Act (ADA Title I) & The Rehabilitation Act (Sections 504 & 501)",
    body:
      "The bedrock of our equitable public square. These vital civil rights laws guide our tools to dismantle systemic barriers, ensuring equal opportunity and accessible, inclusive environments for all.",
  },
  {
    title: "The Workforce Innovation and Opportunity Act (WIOA Title IV)",
    body:
      "A national commitment to human potential. We align our platform to drive sustainable pathways away from sheltered isolation and directly toward Competitive Integrated Employment (CIE), ensuring our technology serves the highest public good.",
  },
  {
    title: "HIPAA & The HITECH Act",
    body:
      "Safeguarding the sanctity of the individual narrative. We hold our digital architecture to the highest federal security standards, ensuring that protected health information and personal vocational data are treated with the utmost reverence and strict privacy.",
  },
  {
    title: "Title VII of the Civil Rights Act & EEO Mandates",
    body:
      "Upholding the inherent dignity of the worker by providing business-facing solutions that foster workplaces free from discrimination, where talent is recognized and cultivated equitably.",
  },
  {
    title: "CRCC Code of Ethics",
    body:
      "The moral compass of our practice. We uphold the professional virtues, clinical boundaries, and strict human-in-the-loop standards that honor the sacred trust between rehabilitation professional and client.",
  },
];

export function EthicalFrameworkAccordion() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <section className="border border-ink/15 rounded-2xl bg-white/60 overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-accent/5 transition"
      >
        <span className="text-lg md:text-xl tracking-tight text-ink">
          Explore Our Ethical &amp; Legal Framework
        </span>
        <span
          aria-hidden="true"
          className={`flex-none w-8 h-8 grid place-items-center rounded-full border border-accent/40 text-accent text-xl leading-none transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-7 pt-1 space-y-6 border-t border-ink/10">
            <header className="space-y-3 pt-5">
              <h2 className="text-2xl tracking-tight">
                A Covenant of Trust and Ethical Practice
              </h2>
              <p className="text-ink/75 prose-narrow leading-relaxed">
                In our shared pursuit of meaningful vocation, the structures
                that govern our work are anchored not merely in federal
                mandate, but in a profound moral commitment to human dignity.
                Pathways Pro operates upon a foundation of mutual trust,
                professional rigor, and shared civic values. The legislation
                and judicial decrees below are not simply regulatory hurdles;
                they are the ethical virtues that ensure our technology
                remains an instrument for true human empowerment and systemic
                justice.
              </p>
            </header>

            <ul className="space-y-4">
              {FRAMEWORK.map((f) => (
                <li key={f.title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="flex-none mt-2 w-1.5 h-1.5 rounded-full bg-gold"
                  />
                  <p className="text-sm text-ink/75 leading-relaxed">
                    <strong className="text-ink">{f.title}:</strong> {f.body}
                  </p>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1 text-sm">
              <Link href="/terms" className="text-accent underline">
                Read our complete Terms of Service
              </Link>
              <Link href="/privacy" className="text-accent underline">
                Read our complete Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
