import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";

export default function Home() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-5xl tracking-tight mb-4">
          Find the work that fits <em className="italic text-accent">who you are</em>.
        </h1>
        <p className="text-lg text-ink/80 prose-narrow">
          Career Compass walks you through validated personality and interest assessments,
          matches you to occupations that suit your traits, surfaces real openings and
          training paths near you, and gives you an AI coach to talk through next steps —
          whether you have a degree or are starting fresh.
        </p>
      </section>

      <Disclaimer />

      <section className="grid md:grid-cols-2 gap-6">
        <Card
          n="1"
          title="Tell us about yourself"
          body="A short chat to gather your education, work history, location, constraints, and goals. Stays on your device unless you choose to share it with the coach."
          href="/intake"
        />
        <Card
          n="2"
          title="Take the assessments"
          body="Big Five personality (IPIP — public domain) and Holland RIASEC interests. Both are well-established, peer-reviewed instruments used by O*NET."
          href="/assessment"
        />
        <Card
          n="3"
          title="See your matches"
          body="Occupations ranked by fit, with median pay, typical education, apprenticeship paths, and a link to find openings near you."
          href="/results"
        />
        <Card
          n="4"
          title="Talk to a coach"
          body="Chat with an AI career coach about applications, follow-ups, training, accommodations, and trajectory — grounded in your profile."
          href="/coach"
        />
      </section>

      <section className="text-sm text-ink/60 prose-narrow">
        <h2 className="text-lg text-ink mb-2">What this is, and isn't</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Built on public-domain instruments (IPIP-NEO short, RIASEC) and free U.S. government data (O*NET, CareerOneStop, Apprenticeship.gov).</li>
          <li>The AI coach is an informational guide, not a licensed counselor. It will tell you when to seek human help.</li>
          <li>We don't claim to replace your state's vocational rehabilitation (VR) services. We can help you find them.</li>
          <li>Your assessment data is stored locally in your browser. Sending it to the coach is your choice.</li>
        </ul>
      </section>
    </div>
  );
}

function Card({ n, title, body, href }: { n: string; title: string; body: string; href: string }) {
  return (
    <Link href={href} className="block border border-ink/15 rounded-lg p-6 hover:border-accent transition-colors">
      <div className="text-accent text-sm mb-2">Step {n}</div>
      <h3 className="text-xl mb-2">{title}</h3>
      <p className="text-ink/70 text-sm">{body}</p>
    </Link>
  );
}
