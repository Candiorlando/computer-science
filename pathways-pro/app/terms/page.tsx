import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Pathways Pro",
  description:
    "The terms that govern your use of Pathways Pro — a case-management and career-development tool for vocational rehabilitation professionals and the people and organizations they work with.",
};

const EFFECTIVE = "July 14, 2026";

type Block = { p: string } | { list: string[] } | { lead: string };

type Section = {
  id: string;
  heading: string;
  blocks: Block[];
  highlight?: boolean;
};

const SECTIONS: Section[] = [
  {
    id: "acceptance",
    heading: "1. Agreement to these terms",
    blocks: [
      {
        p: "These Terms of Service (the “Terms”) govern your access to and use of Pathways Pro (the “Service”). By creating an account or using the Service, you agree to these Terms and to our Privacy Policy. If you are using the Service on behalf of an agency, employer, or other organization, you represent that you have authority to bind that organization to these Terms.",
      },
      { p: "If you do not agree, do not use the Service." },
    ],
  },
  {
    id: "what",
    heading: "2. What Pathways Pro is — and is not",
    highlight: true,
    blocks: [
      {
        p: "Pathways Pro is a software tool that helps vocational rehabilitation (VR) counselors, the people they serve, and supporting employers, vendors, and community partners organize case work, run and interpret assessments, generate draft documents, and coordinate services toward competitive integrated employment.",
      },
      {
        lead: "Pathways Pro is a professional tool. It is not:",
      },
      {
        list: [
          "a licensed counselor, psychologist, physician, attorney, or benefits authority, and it does not provide counseling, clinical, medical, or legal advice;",
          "a substitute for the independent professional judgment of a qualified counselor or clinician;",
          "a decision-maker for eligibility, benefits, diagnosis, or accommodations; and",
          "an emergency service. If you or someone else is in crisis or danger, contact 988 (Suicide & Crisis Lifeline) or your local emergency number.",
        ],
      },
      {
        p: "Content generated in the Service — including AI drafts — is informational and must be reviewed, corrected as needed, and approved by a qualified professional before it is relied on or shared. Using the Service does not create a counselor–client, therapist–patient, or attorney–client relationship with Pathways Pro.",
      },
    ],
  },
  {
    id: "eligibility",
    heading: "3. Eligibility and accounts",
    blocks: [
      {
        p: "You must be able to form a binding contract to use the Service, and you must provide accurate account information and keep it current. Professional users are responsible for the accuracy of the credentials they represent.",
      },
      {
        p: "You are responsible for keeping your login credentials confidential and for all activity under your account. Notify us promptly of any unauthorized use. We may suspend or terminate accounts that appear to be compromised, inaccurate, or used in violation of these Terms.",
      },
    ],
  },
  {
    id: "roles",
    heading: "4. Roles and authorized use",
    blocks: [
      {
        p: "The Service provides different workspaces for counselors, the people they serve, employers, vendors, and employment partners. You may access only the information and features appropriate to your role, and only for legitimate purposes connected to VR services. You may not attempt to access records, cases, or workspaces that are not shared with you.",
      },
    ],
  },
  {
    id: "responsibilities",
    heading: "5. Your professional and legal responsibilities",
    blocks: [
      {
        p: "The Service supports your work; it does not assume your obligations. If you are a licensed or certified professional, you remain solely responsible for complying with your licensing board and certifying body (including the APA and CRCC ethics codes, as applicable), with HIPAA and other health-information laws, with the confidentiality requirements of the Rehabilitation Act / WIOA Title IV, FERPA, and the ADA, and with your employer's and funding agency's policies.",
      },
      {
        lead: "In particular, you agree that you are responsible for:",
      },
      {
        list: [
          "obtaining any informed consent and authorizations required before entering, using, or sharing another person's information;",
          "discussing the limits of confidentiality and the limits of technology with the people you serve, as your ethics code requires;",
          "reviewing and approving any AI-generated or system-generated content before it is finalized, signed, or released; and",
          "the accuracy and appropriateness of any decision you make, which remains a professional judgment — not the software's.",
        ],
      },
    ],
  },
  {
    id: "acceptable",
    heading: "6. Acceptable use",
    blocks: [
      { lead: "You agree not to:" },
      {
        list: [
          "use the Service in violation of any law or professional-ethics obligation;",
          "upload another person's personal or health information without authority or a lawful basis to do so;",
          "attempt to gain unauthorized access to any account, case, system, or data;",
          "scrape, reverse-engineer, disrupt, overload, or probe the Service or its security;",
          "misrepresent your identity, role, or credentials; or",
          "use the Service to harass, discriminate against, or harm any person.",
        ],
      },
    ],
  },
  {
    id: "ai",
    heading: "7. AI-generated content",
    highlight: true,
    blocks: [
      {
        p: "Some features use artificial intelligence to produce drafts (for example plans, assessment interpretations, letters, and service deliverables). AI output can be incomplete, inaccurate, or unsuitable for a particular person or situation.",
      },
      {
        p: "AI output is a starting point, not a professional recommendation. You are responsible for independently reviewing, editing, and approving any AI-assisted content, and a qualified professional must sign off before it is relied on or shared. Pathways Pro is not responsible for decisions made on unreviewed AI output.",
      },
    ],
  },
  {
    id: "privacy",
    heading: "8. Privacy, confidentiality, and data protection",
    blocks: [
      {
        p: "Our handling of information is described in the Privacy Policy, which is incorporated into these Terms. Where we process protected health information on behalf of a covered entity, that processing is governed by an appropriate agreement (such as a HIPAA Business Associate Agreement). No online service can guarantee absolute security; you acknowledge the limits of technology described in the Privacy Policy.",
      },
    ],
  },
  {
    id: "ip",
    heading: "9. Intellectual property and your data",
    blocks: [
      {
        p: "The Service — including its software, design, and content we provide — belongs to Pathways Pro and its licensors and is protected by law. We grant you a limited, non-exclusive, non-transferable right to use the Service for its intended purpose while these Terms are in effect.",
      },
      {
        p: "You retain your rights in the information you enter (“Your Data”). You grant us the limited license needed to host, process, and display Your Data to operate the Service and provide it to the parties you authorize. You are responsible for having the rights and authorizations necessary to submit Your Data.",
      },
    ],
  },
  {
    id: "thirdparty",
    heading: "10. Third-party services",
    blocks: [
      {
        p: "The Service integrates with third-party providers (for example, hosting/infrastructure, an AI provider, and public labor-market and apprenticeship resources). Those services are governed by their own terms and privacy practices, and their availability and results are not guaranteed. We are not responsible for third-party services or content.",
      },
    ],
  },
  {
    id: "warranties",
    heading: "11. Disclaimer of warranties",
    highlight: true,
    blocks: [
      {
        p: "The Service is provided “as is” and “as available,” without warranties of any kind, whether express or implied, including implied warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, or that the Service will be uninterrupted, error-free, or secure. You use the Service, and rely on any content it produces, at your own professional discretion and risk.",
      },
    ],
  },
  {
    id: "liability",
    heading: "12. Limitation of liability",
    highlight: true,
    blocks: [
      {
        p: "To the fullest extent permitted by law, Pathways Pro and its owners, employees, and providers will not be liable for any indirect, incidental, special, consequential, or punitive damages, or for lost profits, lost data, or professional or business losses, arising out of or relating to your use of (or inability to use) the Service — even if advised of the possibility. Nothing in these Terms limits liability that cannot be limited under applicable law.",
      },
    ],
  },
  {
    id: "indemnity",
    heading: "13. Indemnification",
    blocks: [
      {
        p: "You agree to indemnify and hold harmless Pathways Pro and its owners, employees, and providers from claims, losses, and expenses (including reasonable attorneys' fees) arising from your use of the Service, your content, or your violation of these Terms, of law, or of the rights of another — including any failure to obtain a required consent or authorization.",
      },
    ],
  },
  {
    id: "termination",
    heading: "14. Suspension and termination",
    blocks: [
      {
        p: "You may stop using the Service at any time. We may suspend or terminate access if you violate these Terms, if required by law, or to protect the Service or its users. On termination, your right to use the Service ends; provisions that by their nature should survive (including data protection, intellectual property, disclaimers, limitation of liability, and indemnification) will survive. Required records may be retained and disposed of as described in the Privacy Policy.",
      },
    ],
  },
  {
    id: "law",
    heading: "15. Governing law and disputes",
    blocks: [
      {
        p: "These Terms are governed by the laws of the state in which Pathways Pro is established, without regard to conflict-of-laws rules, and subject to any mandatory consumer or professional protections that apply to you. The parties will attempt to resolve disputes informally first; unresolved disputes will be handled by the courts located in that jurisdiction, unless applicable law provides otherwise.",
      },
    ],
  },
  {
    id: "changes",
    heading: "16. Changes to these terms",
    blocks: [
      {
        p: "We may update these Terms as the Service and the law evolve. Material changes will be reflected in the effective date above and, where appropriate, communicated to account holders. Continued use after an update means you accept the revised Terms.",
      },
    ],
  },
  {
    id: "contact",
    heading: "17. Contact us",
    blocks: [
      {
        p: "Questions about these Terms can be sent to guidance@pathwayspro.app. Privacy questions and data requests can be sent to privacy@pathwayspro.app.",
      },
    ],
  },
];

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if ("lead" in b) {
          return (
            <p key={i} className="text-ink font-medium leading-relaxed text-sm">
              {b.lead}
            </p>
          );
        }
        if ("list" in b) {
          return (
            <ul key={i} className="list-disc pl-5 space-y-1.5 text-ink/80 text-sm leading-relaxed">
              {b.list.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-ink/80 leading-relaxed text-sm">
            {b.p}
          </p>
        );
      })}
    </>
  );
}

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-accent">Legal</p>
        <h1 className="text-4xl tracking-tight">Terms of Service</h1>
        <p className="text-ink/60 text-sm">
          Effective {EFFECTIVE}. These Terms govern your use of Pathways Pro.
        </p>
        <p className="text-ink/50 text-xs">
          This is a working agreement for the pilot program, provided for
          transparency and not as legal advice; it will be finalized with
          counsel before general availability. An agency or employer using
          Pathways Pro may have its own agreements that also apply.
        </p>
      </header>

      <nav className="saas-card" aria-label="Contents">
        <p className="text-xs uppercase tracking-wider text-ink/55 mb-2">
          On this page
        </p>
        <ol className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-accent hover:underline">
                {s.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {SECTIONS.map((s) =>
        s.highlight ? (
          <section
            key={s.id}
            id={s.id}
            className="saas-card border-l-4 border-l-accent space-y-3 scroll-mt-24"
          >
            <h2 className="text-xl font-semibold">{s.heading}</h2>
            <Blocks blocks={s.blocks} />
          </section>
        ) : (
          <section key={s.id} id={s.id} className="space-y-3 scroll-mt-24">
            <h2 className="text-xl font-semibold">{s.heading}</h2>
            <Blocks blocks={s.blocks} />
          </section>
        ),
      )}

      <footer className="border-t border-ink/10 pt-5 flex items-center justify-between flex-wrap gap-3">
        <Link href="/" className="text-accent underline text-sm">
          ← Back to home
        </Link>
        <Link href="/privacy" className="text-accent underline text-sm">
          Privacy Policy →
        </Link>
      </footer>
    </div>
  );
}
