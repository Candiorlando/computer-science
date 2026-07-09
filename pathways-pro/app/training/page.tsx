import type { Metadata } from "next";
import Link from "next/link";
import { CareerAssessmentDemo } from "@/components/CareerAssessmentDemo";

export const metadata: Metadata = {
  title: "Course 1 — Rehabilitation Counselor Services & Careers | Pathways Pro",
  description:
    "The full module-by-module outline of Course 1: history and law (ADA, WIOA, the Rehabilitation Act), the profession, career opportunities, credentials, career growth, emerging fields, and using Pathways Pro.",
};

type Module = {
  n: number;
  title: string;
  blurb: string;
  topics: string[];
  link?: { href: string; label: string };
};

const MODULES: Module[] = [
  {
    n: 1,
    title: "What Is Rehabilitation Counseling?",
    blurb:
      "The mission, philosophy, and legal foundations of the profession in the United States.",
    topics: [
      "History of vocational rehabilitation",
      "The Rehabilitation Act",
      "Americans with Disabilities Act (ADA)",
      "Workforce Innovation and Opportunity Act (WIOA)",
      "Independent living philosophy",
      "Employment First initiatives",
      "Person-centered practice",
    ],
  },
  {
    n: 2,
    title: "The Rehabilitation Counseling Profession",
    blurb: "What rehabilitation counselors actually do, day to day.",
    topics: [
      "Career counseling",
      "Vocational assessments",
      "Career planning",
      "Job placement",
      "Benefits counseling",
      "Assistive technology coordination",
      "Case management",
      "Employer consultation",
      "Disability education",
      "Accommodation planning",
    ],
  },
  {
    n: 3,
    title: "Career Opportunities",
    blurb:
      "The many career paths across nine sectors — public, federal, healthcare, mental health, education, insurance, private practice, corporate, and nonprofit.",
    topics: [
      "Public sector & federal government roles",
      "Healthcare & mental health specialties",
      "Education, insurance & private practice",
      "Corporate accessibility & nonprofit roles",
    ],
    link: { href: "/careers", label: "See all roles by sector →" },
  },
  {
    n: 4,
    title: "Credentials",
    blurb: "The education, accreditation, and certifications that qualify you.",
    topics: [
      "Master's Degree in Rehabilitation Counseling",
      "CACREP Accreditation",
      "Certified Rehabilitation Counselor (CRC)",
      "Licensed Professional Counselor (LPC)",
      "Licensed Clinical Professional Counselor (LCPC)",
      "Certified Vocational Evaluator (CVE)",
      "Certified Disability Management Specialist (CDMS)",
    ],
  },
  {
    n: 5,
    title: "Career Growth",
    blurb:
      "A typical advancement ladder — with branches into leadership, policy, consulting, and academia.",
    topics: [
      "Rehabilitation Counselor I → II → Senior",
      "Supervisor → Regional Manager → Bureau Chief",
      "Policy Director → Executive Leadership",
      "Private Consultant, Professor, Researcher",
    ],
    link: { href: "/careers", label: "See the full career ladder →" },
  },
  {
    n: 6,
    title: "Emerging Fields",
    blurb: "Where technology and workforce change are opening new specialties.",
    topics: [
      "Artificial Intelligence in Rehabilitation",
      "Digital Accessibility & Human-Centered Design",
      "Virtual Reality Rehabilitation",
      "Remote Counseling & Telehealth",
      "Assistive Technology Innovation",
      "Workforce Analytics",
      "Rehabilitation Technology Consulting",
      "Rehabilitation Entrepreneurship",
    ],
  },
  {
    n: 7,
    title: "Using Pathways Pro",
    blurb: "Turning the course into an everyday professional-practice tool.",
    topics: [
      "Explore rehabilitation career specialties",
      "Compare job titles and responsibilities",
      "Identify required education and certifications",
      "Access career pathways and advancement maps",
      "Build individualized professional development plans",
      "Discover continuing education opportunities",
      "Track certifications and licensure",
      "Connect with professional organizations",
      "Locate evidence-based resources and practice tools",
    ],
  },
];

const ACTIVITIES = [
  "Match job titles to employment settings",
  "Build your rehabilitation career roadmap",
  "Case study: Which rehabilitation professional is the best fit?",
  "Explore specialty pathways using Pathways Pro",
  "Career advancement planning exercise",
];

export default function TrainingPage() {
  return (
    <div className="space-y-16 pb-8">
      <header className="space-y-5 max-w-3xl">
        <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
          Course 1 · Full outline
        </p>
        <h1 className="text-4xl md:text-5xl tracking-tight leading-[1.08]">
          Rehabilitation Counselor{" "}
          <em className="italic text-accent">Services &amp; Careers</em>.
        </h1>
        <p className="text-lg text-ink/85 prose-narrow font-medium">
          An introductory course covering the rehabilitation counseling
          profession, the wide variety of employment settings, and the growing
          career opportunities across every sector. Below is the complete
          module-by-module outline, plus the course activities and outcome.
        </p>
      </header>

      <section className="space-y-6">
        <h2 className="text-3xl tracking-tight">Course modules</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {MODULES.map((m) => (
            <div key={m.n} className="saas-card">
              <div className="flex items-center gap-3 mb-2">
                <span className="flex-none w-8 h-8 grid place-items-center rounded-md bg-accent text-cream text-sm font-bold tabular-nums">
                  {m.n}
                </span>
                <h3 className="text-lg font-semibold text-ink">{m.title}</h3>
              </div>
              <p className="text-sm text-ink/60 mb-3">{m.blurb}</p>
              <ul className="space-y-1">
                {m.topics.map((t) => (
                  <li key={t} className="text-sm text-ink/75 flex gap-2">
                    <span className="text-accent">·</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              {m.link && (
                <p className="mt-3">
                  <Link href={m.link.href} className="text-sm text-accent underline">
                    {m.link.label}
                  </Link>
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2 max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-accent">
            Interactive activities
          </p>
          <h2 className="text-3xl tracking-tight">Do it here — take the assessments</h2>
          <p className="text-ink/70">
            These activities come to life with real instruments. Take the Interest
            Profiler and Personality Inventory below and get your results
            instantly — a free taste of the Pathways Pro experience.
          </p>
        </header>
        <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          {ACTIVITIES.map((a, i) => (
            <li key={a} className="flex items-center gap-3">
              <span className="flex-none w-7 h-7 grid place-items-center rounded-md bg-ink/10 text-ink text-xs font-bold tabular-nums">
                {i + 1}
              </span>
              <span className="text-ink/85 text-sm">{a}</span>
            </li>
          ))}
        </ol>
        <CareerAssessmentDemo />
      </section>

      <section className="saas-card !bg-accent/5 border-accent/30 space-y-3">
        <h2 className="text-2xl tracking-tight">Course outcome</h2>
        <p className="text-ink/75 prose-narrow">
          Upon successful completion, participants will understand the breadth of
          the rehabilitation counseling profession, recognize the many career
          opportunities available across sectors, and be prepared to use Pathways
          Pro as a practical career development and professional-practice resource
          throughout their careers.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/careers"
            className="bg-accent text-cream font-semibold px-6 py-3 rounded-md hover:bg-accent/90 transition"
          >
            Explore careers by sector →
          </Link>
          <Link
            href="/about"
            className="border border-accent text-accent font-semibold px-6 py-3 rounded-md hover:bg-accent/5 transition"
          >
            About Pathways Pro
          </Link>
        </div>
      </section>
    </div>
  );
}
