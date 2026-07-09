import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Careers in Vocational Rehabilitation — Pathways Pro",
  description:
    "Explore the many career pathways in rehabilitation counseling across the public, federal, healthcare, mental health, education, insurance, private practice, corporate, and nonprofit sectors.",
};

const SECTORS: { name: string; roles: string[] }[] = [
  {
    name: "Public sector",
    roles: [
      "State Vocational Rehabilitation Counselor",
      "Rehabilitation Counselor",
      "Rehabilitation Counselor Senior",
      "Rehabilitation Supervisor",
      "Regional Administrator",
      "Program Manager",
      "Quality Assurance Specialist",
      "Policy Analyst",
      "Workforce Development Specialist",
      "Disability Determination Counselor",
    ],
  },
  {
    name: "Federal government",
    roles: [
      "Veterans Affairs Rehabilitation Counselor",
      "Department of Labor Specialist",
      "Social Security Vocational Expert",
      "Federal Disability Program Manager",
      "Department of Education Rehabilitation Specialist",
    ],
  },
  {
    name: "Healthcare",
    roles: [
      "Medical Rehabilitation Counselor",
      "Hospital Rehabilitation Counselor",
      "Oncology Rehabilitation Specialist",
      "Brain Injury Specialist",
      "Spinal Cord Rehabilitation Counselor",
      "Behavioral Health Rehabilitation Counselor",
    ],
  },
  {
    name: "Mental health",
    roles: [
      "Psychiatric Rehabilitation Specialist",
      "Supported Employment Specialist",
      "Clubhouse Coordinator",
      "ACT Team Vocational Specialist",
      "IPS Employment Specialist",
    ],
  },
  {
    name: "Education",
    roles: [
      "College Disability Services Counselor",
      "Transition Specialist",
      "School Transition Coordinator",
      "Postsecondary Disability Coordinator",
    ],
  },
  {
    name: "Insurance",
    roles: [
      "Disability Case Manager",
      "Return-to-Work Specialist",
      "Workers' Compensation Rehabilitation Counselor",
      "Vocational Evaluator",
      "Disability Consultant",
    ],
  },
  {
    name: "Private practice",
    roles: [
      "Vocational Expert",
      "Independent Rehabilitation Consultant",
      "Forensic Rehabilitation Consultant",
      "Life Care Planner",
      "Expert Witness",
    ],
  },
  {
    name: "Corporate",
    roles: [
      "ADA Coordinator",
      "Disability Inclusion Manager",
      "Accessibility Consultant",
      "Employee Accommodation Specialist",
      "DEI Accessibility Consultant",
    ],
  },
  {
    name: "Nonprofit",
    roles: [
      "Employment Specialist",
      "Supported Employment Coordinator",
      "Independent Living Specialist",
      "Community Rehabilitation Provider",
    ],
  },
];

const SERVICES = [
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
];

const CREDENTIALS = [
  "Master's Degree in Rehabilitation Counseling",
  "CACREP Accreditation",
  "Certified Rehabilitation Counselor (CRC)",
  "Licensed Professional Counselor (LPC)",
  "Licensed Clinical Professional Counselor (LCPC)",
  "Certified Vocational Evaluator (CVE)",
  "Certified Disability Management Specialist (CDMS)",
];

// Practice areas within vocational counseling, each with example job titles.
const FIELDS: { name: string; examples: string[] }[] = [
  {
    name: "Vocational Evaluation & Assessment",
    examples: [
      "Vocational Evaluator",
      "Certified Vocational Evaluator (CVE)",
      "Work Adjustment Specialist",
      "Assessment Specialist",
    ],
  },
  {
    name: "Job Placement & Supported Employment",
    examples: [
      "Supported Employment Specialist",
      "Job Placement Specialist",
      "Employment Specialist",
      "IPS Employment Specialist",
      "Job Coach",
    ],
  },
  {
    name: "Clinical & Mental Health Rehabilitation",
    examples: [
      "Psychiatric Rehabilitation Specialist",
      "Behavioral Health Rehabilitation Counselor",
      "Licensed Professional Counselor (LPC)",
      "ACT Team Vocational Specialist",
    ],
  },
  {
    name: "Disability Management & Return-to-Work",
    examples: [
      "Disability Case Manager",
      "Return-to-Work Specialist",
      "Workers' Compensation Rehabilitation Counselor",
      "Certified Disability Management Specialist (CDMS)",
    ],
  },
  {
    name: "Forensic & Vocational Expert",
    examples: [
      "Vocational Expert",
      "Forensic Rehabilitation Consultant",
      "Life Care Planner",
      "Expert Witness",
    ],
  },
  {
    name: "Transition & Youth Services",
    examples: [
      "Transition Specialist",
      "School Transition Coordinator",
      "Pre-ETS Counselor",
      "Postsecondary Disability Coordinator",
    ],
  },
  {
    name: "Independent Living & Benefits",
    examples: [
      "Independent Living Specialist",
      "Community Rehabilitation Provider",
      "Benefits Counselor (WIPA / CWIC)",
      "Peer Support Specialist",
    ],
  },
  {
    name: "Assistive Technology & Accessibility",
    examples: [
      "Assistive Technology Specialist",
      "Rehabilitation Technologist",
      "Accessibility Consultant",
      "Digital Accessibility Specialist",
    ],
  },
  {
    name: "Business & Employer Services",
    examples: [
      "ADA Coordinator",
      "Disability Inclusion Manager",
      "Employer Consultant",
      "DEI Accessibility Consultant",
    ],
  },
  {
    name: "Administration, Policy & Leadership",
    examples: [
      "Rehabilitation Supervisor",
      "Regional Administrator",
      "Program Manager",
      "Bureau Chief",
      "Policy Analyst / Director",
    ],
  },
  {
    name: "Research & Education",
    examples: [
      "Rehabilitation Counselor Educator",
      "Professor",
      "Researcher",
      "Quality Assurance Specialist",
    ],
  },
];

const EMERGING = [
  "Artificial Intelligence in Rehabilitation",
  "Digital Accessibility",
  "Virtual Reality Rehabilitation",
  "Remote Counseling",
  "Telehealth",
  "Assistive Technology Innovation",
  "Workforce Analytics",
  "Rehabilitation Technology Consulting",
  "Human-Centered Design",
  "Rehabilitation Entrepreneurship",
];

export default function CareersPage() {
  return (
    <div className="space-y-16 pb-8">
      <header className="space-y-5 max-w-3xl">
        <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
          Course 1 · Rehabilitation Counselor Services &amp; Careers
        </p>
        <h1 className="text-4xl md:text-5xl tracking-tight leading-[1.08]">
          Careers in Vocational{" "}
          <em className="italic text-accent">Rehabilitation</em>.
        </h1>
        <p className="text-lg text-ink/85 prose-narrow font-medium">
          Vocational rehabilitation is one of the most diverse and rewarding
          professions in human services. Rehabilitation counselors help people
          with disabilities, injuries, mental health conditions, and other
          barriers to employment achieve meaningful careers, independent living,
          and a better quality of life.
        </p>
        <p className="text-base text-ink/70 prose-narrow">
          This overview is drawn from{" "}
          <Link href="/training" className="text-accent underline">
            Course 1 — Rehabilitation Counselor Services &amp; Careers
          </Link>
          . See the full module-by-module outline there.
        </p>
      </header>

      <section className="space-y-5">
        <h2 className="text-2xl tracking-tight">What rehabilitation counselors do</h2>
        <p className="text-ink/70 prose-narrow">
          Across every setting, the work centers on helping people find and keep
          meaningful employment. Core services include:
        </p>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <span
              key={s}
              className="text-sm border border-ink/15 bg-cream rounded-full px-3 py-1 text-ink/80"
            >
              {s}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2 max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-accent">
            Nine sectors
          </p>
          <h2 className="text-3xl tracking-tight">Career opportunities by sector</h2>
          <p className="text-ink/70">
            From state agencies and the VA to hospitals, schools, insurance,
            private practice, and corporate accessibility teams.
          </p>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SECTORS.map((sector) => (
            <div key={sector.name} className="saas-card">
              <h3 className="text-lg font-semibold text-ink mb-3">
                {sector.name}
              </h3>
              <ul className="space-y-1.5">
                {sector.roles.map((role) => (
                  <li
                    key={role}
                    className="text-sm text-ink/70 border-b border-ink/5 pb-1.5 last:border-0"
                  >
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-3xl tracking-tight">Credentials that open doors</h2>
        <p className="text-ink/70 prose-narrow">
          Most positions build on a master&apos;s degree in rehabilitation
          counseling, often from a CACREP-accredited program, plus certification
          and licensure that match your specialty.
        </p>
        <div className="flex flex-wrap gap-2">
          {CREDENTIALS.map((c) => (
            <span
              key={c}
              className="text-sm border border-accent/40 bg-accent/5 text-accent rounded-full px-3 py-1"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2 max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-accent">
            Specialties
          </p>
          <h2 className="text-3xl tracking-tight">
            Fields of vocational counseling
          </h2>
          <p className="text-ink/70">
            Beyond the employer setting, counselors specialize by the kind of
            work they do. Here are example job titles and positions across the
            profession&apos;s major practice areas.
          </p>
        </header>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FIELDS.map((field) => (
            <div key={field.name} className="saas-card">
              <h3 className="text-lg font-semibold text-ink mb-3">
                {field.name}
              </h3>
              <ul className="space-y-1.5">
                {field.examples.map((role) => (
                  <li
                    key={role}
                    className="text-sm text-ink/70 border-b border-ink/5 pb-1.5 last:border-0"
                  >
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-3xl tracking-tight">Emerging fields</h2>
        <p className="text-ink/70 prose-narrow">
          Technology and workforce change are opening new specialties in
          rehabilitation.
        </p>
        <div className="flex flex-wrap gap-2">
          {EMERGING.map((e) => (
            <span
              key={e}
              className="text-sm border border-ink/15 bg-cream rounded-full px-3 py-1 text-ink/80"
            >
              {e}
            </span>
          ))}
        </div>
      </section>

      <section className="saas-card !bg-accent/5 border-accent/30 space-y-4">
        <h2 className="text-2xl tracking-tight">Explore it in Pathways Pro</h2>
        <p className="text-ink/75 prose-narrow">
          Pathways Pro helps rehabilitation professionals explore these career
          specialties, compare job titles and responsibilities, identify the
          education and certifications each path requires, and build an
          individualized professional development plan. Want to see where{" "}
          <em>you</em> fit? Take the free Interest Profiler and Personality
          Inventory in the course — no sign-up, instant results.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/training#assessment-top"
            className="bg-accent text-cream font-semibold px-6 py-3 rounded-md hover:bg-accent/90 transition"
          >
            Take the free assessment →
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
