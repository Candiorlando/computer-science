import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { BLUEPRINT_PAGES } from "@/lib/blueprint";

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
    link: { href: "/careers", label: "See roles across every field →" },
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

const VIDEOS: { title: string; description: string; src: string }[] = [
  {
    title: "The Hidden World of Rehabilitation Counseling",
    description:
      "An inside look at what rehabilitation counselors do day to day and the people they help.",
    src: "/videos/hidden-world-of-rehabilitation-counseling.mp4",
  },
  {
    title: "Decoding Rehab Counseling Credentials",
    description:
      "The certifications that define the field — CRC and beyond — and what each one means for your career.",
    src: "/videos/decoding-rehab-counseling-credentials.mp4",
  },
  {
    title: "The Architecture of Modern US Workforce Training",
    description:
      "How today’s U.S. workforce training and vocational rehabilitation systems fit together.",
    src: "/videos/architecture-of-modern-us-workforce-training.mp4",
  },
  {
    title: "Why Therapists Redrew the Ethical Boundary",
    description:
      "The story behind the profession’s shifting ethical boundaries and what it means for practice today.",
    src: "/videos/why-therapists-redrew-the-ethical-boundary.mp4",
  },
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
          <h2 className="text-3xl tracking-tight">Take the assessments</h2>
          <p className="text-ink/70">
            These activities come to life with real instruments. Take the
            Interest Profiler and Personality Inventory and get your results
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
        <div className="saas-card flex flex-col sm:flex-row sm:items-center gap-4 !bg-accent/5 border-accent/30">
          <div className="flex-1 space-y-1">
            <h3 className="text-lg font-semibold text-ink">
              Free career assessments · no sign-up
            </h3>
            <p className="text-sm text-ink/70">
              The Interest Profiler (RIASEC), the Big Five Personality
              Inventory, and a work-environment check — 44 items, about 6
              minutes, instant best-fit career matches.
            </p>
          </div>
          <Link
            href="/training/assessments"
            className="flex-none bg-gold text-ink font-semibold px-6 py-3 rounded-md hover:bg-gold-soft transition text-center"
          >
            Take the assessments →
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2 max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-accent">
            Watch &amp; learn
          </p>
          <h2 className="text-3xl tracking-tight">Short explainers</h2>
          <p className="text-ink/70">
            Quick videos on the profession — what the work involves, the
            credentials, and the systems behind it.
          </p>
        </header>
        <div className="videogrid">
          {VIDEOS.map((v) => (
            <figure key={v.src} className="space-y-2 m-0">
              <video controls preload="none" playsInline>
                <source src={v.src} type="video/mp4" />
                Your browser can’t play this video.{" "}
                <a href={v.src} className="text-accent underline">
                  Download it
                </a>
                .
              </video>
              <figcaption className="space-y-0.5">
                <span className="block font-semibold text-ink">{v.title}</span>
                <span className="block text-sm text-ink/60">
                  {v.description}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2 max-w-2xl">
          <p className="text-xs uppercase tracking-widest text-accent">
            Course resources
          </p>
          <h2 className="text-3xl tracking-tight">Go deeper</h2>
          <p className="text-ink/70">
            The Rehabilitation Systems Blueprint — a 13-part visual reference
            on how rehabilitation systems are structured, from the legislation
            and the VR lifecycle to credentials, life care planning, and where
            technology is taking the field. Browse it here or download the
            original.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 gap-4">
          {BLUEPRINT_PAGES.map((p) => (
            <figure className="infographic !my-0" key={p.n}>
              <Image
                src={p.src}
                alt={p.alt}
                width={1600}
                height={894}
                sizes="(max-width: 640px) 100vw, 512px"
                style={{ width: "100%", height: "auto" }}
              />
              <figcaption>
                <span className="tabular-nums text-ink/40">
                  {String(p.n).padStart(2, "0")}
                </span>{" "}
                · {p.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="saas-card flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 space-y-1">
            <h3 className="text-lg font-semibold text-ink">
              The Rehabilitation Systems Blueprint
            </h3>
            <p className="text-sm text-ink/70">
              Prefer it as a document? Download the original deck.
            </p>
            <p className="text-xs text-ink/50">PDF · 13 pages · 15 MB</p>
          </div>
          <a
            href="/resources/rehabilitation-systems-blueprint.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex-none bg-gold text-ink font-semibold px-6 py-3 rounded-md hover:bg-gold-soft transition text-center"
          >
            Download PDF ↓
          </a>
        </div>
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
