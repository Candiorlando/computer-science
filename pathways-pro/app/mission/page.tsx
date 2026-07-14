import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Our Mission: A Covenant of Vocation — Pathways Pro",
  description:
    "Pathways Pro exists to redefine vocational rehabilitation — technology that amplifies, never replaces, human connection, with the client as the moral center of their own career trajectory.",
};

export default function MissionPage() {
  return (
    <div className="space-y-16 pb-8">
      <header className="space-y-5 max-w-3xl">
        <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
          Our Mission
        </p>
        <h1 className="text-4xl md:text-5xl tracking-tight leading-[1.08]">
          A Covenant of <em className="italic text-accent">Vocation</em>.
        </h1>
        <p className="text-lg text-ink/85 prose-narrow font-medium">
          Work is more than a mere transaction; it is a fundamental way we
          participate in our shared community, realize our own dignity, and
          find meaning. Yet, for too long, the systems designed to assist
          individuals with disabilities have functioned more like rigid
          machinery than instruments of human flourishing.
        </p>
      </header>

      <section className="max-w-3xl space-y-5">
        <p className="text-ink/80 prose-narrow leading-relaxed">
          Our mission is to redefine vocational rehabilitation by ensuring that
          technology always amplifies—never replaces—our profound human
          connection. Pathways Pro is built upon a strict human-in-the-loop
          philosophy, a commitment that places the client not just as a
          recipient of services, but as the absolute moral center of their own
          career trajectory. We seek to empower individuals by transforming
          systemic barriers into pathways of mutual responsibility, honoring
          the vital clinical judgment of counselors, and forging unified
          partnerships with businesses to cultivate sustainable, competitive
          integrated employment.
        </p>
      </section>

      <section className="space-y-6">
        <p className="text-xs uppercase tracking-widest text-accent">
          Founder&rsquo;s Vision
        </p>
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <figure className="m-0 space-y-3">
            <div className="overflow-hidden rounded-2xl border border-ink/10 shadow-sm">
              <Image
                src="/founder/candace-metcalf.jpg"
                alt="Portrait of Candace Metcalf, CRC, LPC — founder of Pathways Pro"
                width={864}
                height={1184}
                sizes="(max-width: 768px) 100vw, 320px"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
            <figcaption className="text-sm text-ink/60">
              Candace Metcalf, CRC, LPC — Founder, Pathways Pro
            </figcaption>
          </figure>

          <blockquote className="md:col-span-2 space-y-4 border-l-2 border-gold pl-6 m-0">
            <p className="text-ink/85 prose-narrow leading-relaxed italic">
              &ldquo;This platform is born not merely from technical ambition,
              but from lived experience and a deep-seated conviction about the
              values that must guide our field. As a person with disabilities,
              I have navigated the very systems we are now working to elevate.
              I founded Pathways Pro drawing on my own resilience and an
              enduring, passionate drive to see rehabilitation counseling
              fulfill its true promise.
            </p>
            <p className="text-ink/85 prose-narrow leading-relaxed italic">
              For too long, the focus has been on what the system expects,
              rather than what the individual envisions for their own life. I
              built this ecosystem to shift that paradigm—making counseling
              more highly effective by driving toward the stronger, meaningful
              outcomes that clients actually want. True rehabilitation is a
              collaborative act of empowerment. It requires tools that honor
              the individual&rsquo;s voice, equipping them to pursue their
              unique vocation and take their rightful, valued place within the
              workforce and the wider community.&rdquo;
            </p>
            <footer className="text-sm text-ink/60 not-italic">
              — Candace Metcalf, CRC, LPC · Founder, Pathways Pro
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="saas-card !bg-accent/5 border-accent/30 space-y-3">
        <h2 className="text-2xl tracking-tight">See the mission in practice</h2>
        <p className="text-ink/75 prose-narrow">
          From the careers the profession opens to the course that teaches it,
          Pathways Pro puts these values to work every day.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/about"
            className="bg-accent text-cream font-semibold px-6 py-3 rounded-md hover:bg-accent/90 transition"
          >
            About Pathways Pro →
          </Link>
          <Link
            href="/careers"
            className="border border-accent text-accent font-semibold px-6 py-3 rounded-md hover:bg-accent/5 transition"
          >
            Careers in Vocational Rehabilitation
          </Link>
        </div>
      </section>
    </div>
  );
}
