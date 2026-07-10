import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "About Pathways Pro & Founder Candace Metcalf",
  description:
    "Pathways Pro was founded by Candace Metcalf, CRC, LPC, to bring the values of rehabilitation counseling — dignified, self-directed work for people with disabilities — into a unified platform.",
};

export default function AboutPage() {
  return (
    <div className="space-y-16 pb-8">
      <header className="space-y-5 max-w-3xl">
        <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
          About Pathways Pro
        </p>
        <h1 className="text-4xl md:text-5xl tracking-tight leading-[1.08]">
          Work that restores{" "}
          <em className="italic text-accent">dignity</em>.
        </h1>
        <p className="text-lg text-ink/85 prose-narrow font-medium">
          Pathways Pro grew out of a belief at the heart of rehabilitation
          counseling: everyone deserves the chance to do meaningful work and be
          supported fairly in reaching it. The platform brings that value into a
          single, WIOA-compliant tool where clients, counselors, businesses, and
          vendors collaborate to improve employment outcomes and accessibility.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-6 items-start">
        <div className="md:col-span-2 space-y-4">
          <p className="text-xs uppercase tracking-widest text-accent">
            The founder
          </p>
          <h2 className="text-3xl tracking-tight">Candace Metcalf, CRC, LPC</h2>
          <p className="text-ink/80 prose-narrow">
            Pathways Pro was founded by <strong>Candace Metcalf</strong>, a
            Certified Rehabilitation Counselor and Licensed Professional
            Counselor based in Chicago. She has served as a Senior Rehabilitation
            Counselor with the State of Illinois Department of Rehabilitation
            Services since 2020 — delivering home-services counseling to people
            with disabilities, building individualized rehabilitation plans, and
            coordinating the case management, assessments, and community
            resources that help clients reach self-sufficiency.
          </p>
          <p className="text-ink/80 prose-narrow">
            Her work centers on the same goal that drives the platform:{" "}
            <em>
              empowering people with disabilities through personalized employment
              plans and effective job placement
            </em>
            , contributing to community inclusion and real workforce development.
            Every day she sees how much a fair, accessible chance at work can
            change a person&apos;s life — and how often small barriers stand in
            the way. Candace built Pathways Pro to remove those barriers with a
            tool that is simple to use, honest, and protective of everyone it
            serves.
          </p>
          <p className="text-ink/80 prose-narrow">
            She brings a rare mix of clinical and analytical depth to that
            mission. Candace holds a <strong>M.S. in Clinical Psychology,
            Rehabilitation and Mental Health Counseling</strong> from the
            Illinois Institute of Technology, a <strong>M.A. in Applied
            Sociology</strong> from Sam Houston State University, and a{" "}
            <strong>B.A. in Sociology</strong> from Fort Hays State University.
            Her earlier work in research, monitoring and evaluation, and data
            analysis — with organizations including NORC at the University of
            Chicago, USAID food-and-water programs, and AmeriCorps VISTA —
            grounds Pathways Pro in evidence and outcomes, not just good
            intentions.
          </p>
          <p className="text-ink/80 prose-narrow">
            Through her advocacy at <strong>Rehab &amp; Reform</strong>{" "}
            (RehabilitationReform.com), Candace pushes for a rehabilitation
            system that genuinely serves the people it&apos;s meant to help.
            Pathways Pro is that vision put into practice.
          </p>
        </div>

        <aside className="saas-card space-y-4">
          <figure className="m-0 -mx-1 -mt-1">
            <div className="overflow-hidden rounded-xl border border-ink/10">
              <Image
                src="/founder/candace-metcalf.jpg"
                alt="Portrait of Candace Metcalf, CRC, LPC — founder of Pathways Pro"
                width={864}
                height={1184}
                sizes="(max-width: 768px) 100vw, 300px"
                style={{ width: "100%", height: "auto" }}
                priority
              />
            </div>
          </figure>
          <div>
            <div className="text-xs uppercase tracking-wider text-ink/50 mb-1">
              Credentials
            </div>
            <ul className="text-sm text-ink/80 space-y-1">
              <li>Certified Rehabilitation Counselor (CRC)</li>
              <li>Licensed Professional Counselor (LPC)</li>
            </ul>
          </div>
          <div className="border-t border-ink/10 pt-4">
            <div className="text-xs uppercase tracking-wider text-ink/50 mb-1">
              Role
            </div>
            <p className="text-sm text-ink/80">
              Senior Rehabilitation Counselor, State of Illinois Department of
              Rehabilitation Services (2020–present)
            </p>
          </div>
          <div className="border-t border-ink/10 pt-4">
            <div className="text-xs uppercase tracking-wider text-ink/50 mb-1">
              Advocacy
            </div>
            <p className="text-sm text-ink/80">Founder, Rehab &amp; Reform</p>
          </div>
          <div className="border-t border-ink/10 pt-4">
            <div className="text-xs uppercase tracking-wider text-ink/50 mb-1">
              Contact
            </div>
            <a
              href="mailto:candace@pathwayspro.app"
              className="text-sm text-accent underline break-all"
            >
              candace@pathwayspro.app
            </a>
          </div>
        </aside>
      </section>

      <section className="space-y-4">
        <p className="text-xs uppercase tracking-widest text-accent">
          Why it connects
        </p>
        <h2 className="text-3xl tracking-tight">
          Rehabilitation counseling, put into practice
        </h2>
        <p className="text-ink/75 prose-narrow">
          Rehabilitation counseling is about opening a path to dignified,
          self-directed work. Pathways Pro carries that idea into every part of
          the workflow — intake, assessment, IPE drafting, services, and
          reporting — so counselors spend less time on paperwork and more time
          helping people build independence. Learn more about the profession and
          the careers it opens.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/careers"
            className="bg-accent text-cream font-semibold px-6 py-3 rounded-md hover:bg-accent/90 transition"
          >
            Careers in Vocational Rehabilitation →
          </Link>
          <Link
            href="/training"
            className="border border-accent text-accent font-semibold px-6 py-3 rounded-md hover:bg-accent/5 transition"
          >
            Course 1 outline
          </Link>
        </div>
      </section>
    </div>
  );
}
