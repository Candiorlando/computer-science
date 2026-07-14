import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Let's Connect | Pathways Pro",
  description:
    "Get in touch with the Pathways Pro team for demos, partnerships, and support.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-10">
      <header className="space-y-4">
        <p className="inline-block text-xs uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">
          Connect
        </p>
        <h1 className="text-4xl tracking-tight">
          Let&apos;s connect.
        </h1>
        <p className="text-lg text-ink/70">
          Whether you are exploring the platform, ready to partner, or
          need support — we are here.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-6">
        <ContactCard
          title="Demos & partnerships"
          description="Book a 30-minute walkthrough or discuss an employment partnership with the founder."
          email="candace@pathwayspro.app"
          subject="Partnership inquiry"
        />
        <ContactCard
          title="Platform support"
          description="Questions about your account, case data, or platform features."
          email="guidance@pathwayspro.app"
          subject="Support request"
        />
        <ContactCard
          title="Collaboration & referrals"
          description="Interested in the partner network, vendor onboarding, or service catalog."
          email="collaborate@pathwayspro.app"
          subject="Collaboration inquiry"
        />
        <ContactCard
          title="Media & speaking"
          description="Press inquiries, conference invitations, and thought-leadership collaboration."
          email="candace@pathwayspro.app"
          subject="Media inquiry"
        />
      </div>
    </div>
  );
}

function ContactCard({
  title,
  description,
  email,
  subject,
}: {
  title: string;
  description: string;
  email: string;
  subject: string;
}) {
  return (
    <div className="border border-ink/15 bg-cream rounded-lg p-6 space-y-3">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="text-sm text-ink/70 leading-relaxed">{description}</p>
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}
        className="inline-block text-sm text-accent hover:underline"
      >
        {email}
      </a>
    </div>
  );
}
