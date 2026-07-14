import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Pathways Pro",
  description:
    "How Pathways Pro collects, uses, protects, and retains information across counselor, client, employer, vendor, and partner workspaces — with confidentiality practices aligned to the APA and CRCC ethics codes and to HIPAA, WIOA, FERPA, and ADA confidentiality requirements.",
};

const EFFECTIVE = "July 14, 2026";

type Block =
  | { p: string }
  | { list: string[] }
  | { lead: string };

type Section = {
  id: string;
  heading: string;
  blocks: Block[];
  highlight?: boolean;
};

const SECTIONS: Section[] = [
  {
    id: "commitment",
    heading: "1. Our privacy commitment",
    blocks: [
      {
        p: "Pathways Pro is a case-management and career-development platform used by vocational rehabilitation (VR) counselors, the people they serve, and the employers, vendors, and community partners who support competitive integrated employment. Much of what moves through this platform is sensitive: disability information, health history, assessment results, and case notes.",
      },
      {
        p: "We treat that information according to the same confidentiality principles that govern the professionals who use Pathways Pro. Our practices are designed to be consistent with the American Psychological Association (APA) Ethical Principles of Psychologists and Code of Conduct, the Commission on Rehabilitation Counselor Certification (CRCC) Code of Professional Ethics for Rehabilitation Counselors, and applicable health-information and rehabilitation laws including HIPAA, the confidentiality provisions of the Rehabilitation Act / WIOA Title IV, FERPA (for student services), and the confidentiality requirements of the Americans with Disabilities Act (ADA).",
      },
      {
        p: "Pathways Pro is a tool that supports licensed and certified professionals; it does not replace their independent judgment or their own obligations under their licensing boards, certifying bodies, funding agencies, and law.",
      },
    ],
  },
  {
    id: "collect",
    heading: "2. Information we collect",
    blocks: [
      { lead: "We collect only what is needed to provide the service:" },
      {
        list: [
          "Account information you provide — name, work email, organization, professional role, and credentials.",
          "Case and service information entered by counselors and the people they serve in the course of VR services — intake details, goals, work history, assessment and screener responses, case notes, and documents.",
          "Disability- and health-related information a user chooses to record in a case file to support eligibility, planning, and accommodations.",
          "Service-request and fulfillment details submitted by employers, vendors, and employment partners.",
          "Technical and usage logs (device, browser, IP, timestamps, and actions taken) needed to operate, secure, and troubleshoot the platform.",
        ],
      },
      {
        p: "Some information is stored only in your browser (for example, in-progress intake and assessment answers held in local storage on your own device) and is never transmitted to us unless you submit it.",
      },
    ],
  },
  {
    id: "use",
    heading: "3. How we use information — the minimum necessary",
    blocks: [
      {
        p: "Consistent with the HIPAA “minimum necessary” standard and with APA Standard 4.04 (minimizing intrusions on privacy), we use and disclose the least information needed for a given purpose. We use information to:",
      },
      {
        list: [
          "Deliver case-management, assessment, planning, and document-generation features.",
          "Route deliverables only between the parties a counselor explicitly authorizes.",
          "Support documentation required by funding agencies and WIOA Title IV.",
          "Maintain the security, integrity, and reliability of the platform.",
        ],
      },
      {
        p: "We do not sell personal information, and we do not use case content for advertising.",
      },
    ],
  },
  {
    id: "framework",
    heading: "4. The ethical and legal framework we follow",
    blocks: [
      {
        lead:
          "Our handling of confidential information is built to align with the following standards:",
      },
      {
        list: [
          "APA Ethics Code, Standard 4 (Privacy and Confidentiality) — including 4.01 (maintaining confidentiality), 4.02 (discussing the limits of confidentiality at the outset), 4.04 (minimizing intrusions on privacy), and 4.05 (limits on disclosures to those authorized or required by law).",
          "APA Ethics Code, Standard 6 (Record Keeping) — including 6.01 (creating and maintaining records) and 6.02 (protecting confidential records, including the security of electronically entered and stored data).",
          "CRCC Code of Professional Ethics, Section B (Confidentiality, Privileged Communication, and Privacy) — the client's right to privacy and the counselor's duty to protect it.",
          "CRCC Code of Professional Ethics, Section J (Technology, Social Media, and Distance Counseling) — including informing clients of the benefits and limitations of technology, the security of electronic records, and the reality that electronic transmission cannot be guaranteed confidential.",
          "HIPAA Privacy, Security, and Breach Notification Rules — permitted uses and disclosures, administrative/physical/technical safeguards for electronic protected health information, and breach notification.",
          "Rehabilitation Act / WIOA Title IV confidentiality (34 CFR § 361.38) — safeguarding personal information in the state VR program and using it only for purposes directly connected to VR administration.",
          "FERPA — where services involve students with disabilities and education records (for example, Pre-Employment Transition Services).",
          "ADA — disability-related and medical information is kept confidential and separate from general records.",
        ],
      },
      {
        p: "Where these standards differ, we apply the most protective requirement that applies to the information at issue.",
      },
    ],
  },
  {
    id: "phi",
    heading: "5. Health, disability, and role-based access",
    blocks: [
      {
        p: "Pathways Pro is built on a HIPAA-aligned, role-based architecture. Clinical and disability-related information entered into a case file is visible only to the person the case concerns and the counselor of record.",
      },
      {
        p: "Business, vendor, and employment-partner users receive only the specific deliverables a counselor explicitly releases to them — never raw case notes, screener responses, or health history. Access is scoped to role, and actions on records are logged.",
      },
    ],
  },
  {
    id: "limits",
    heading: "6. Limits of confidentiality",
    highlight: true,
    blocks: [
      {
        p: "Consistent with APA Standard 4.02 and the CRCC Code, confidentiality has limits. Information may be used or disclosed without separate authorization where permitted or required by law or professional duty, including:",
      },
      {
        list: [
          "To prevent serious, foreseeable, and imminent harm to a client or an identifiable other person (duty to protect / warn).",
          "Suspected abuse or neglect of a child, older adult, or person with a disability, where mandatory reporting applies.",
          "In response to a valid court order, subpoena, or other lawful legal process.",
          "For audit, monitoring, and program-integrity requirements of a funding or oversight agency under WIOA Title IV.",
          "As otherwise required by law.",
        ],
      },
      {
        p: "Counselors are responsible for discussing these limits with the people they serve at the outset of services, as their ethics codes require.",
      },
    ],
  },
  {
    id: "technology",
    heading: "7. Security — and the limits of technology",
    highlight: true,
    blocks: [
      {
        lead:
          "Important: no technology is perfectly secure, and using any online service carries risk.",
      },
      {
        p: "We use reasonable administrative, physical, and technical safeguards — encryption in transit, access controls, role-based permissions, and activity logging — to protect the information in Pathways Pro. But no method of transmitting information over the Internet, and no method of electronic storage, is 100% secure. We cannot and do not guarantee absolute security, and confidentiality cannot be guaranteed for anything transmitted or stored electronically.",
      },
      {
        p: "Real risks exist and are outside any single provider's complete control: interception on a network, unauthorized access, data breaches, malware, phishing, a lost or shared device, weak or reused passwords, and the practices of the third-party services that help operate the platform. This is the same limitation the CRCC Code (Section J) and APA guidance require professionals to disclose when they use technology or distance services.",
      },
      {
        lead: "To protect yourself and the people you serve, we ask that you:",
      },
      {
        list: [
          "Enter only the information that is genuinely necessary for the task at hand.",
          "Use a private, trusted network and device — not shared or public computers — and keep them updated.",
          "Use a strong, unique password, keep your credentials confidential, and sign out on shared machines.",
          "Understand that ordinary email and text message are not secure channels and should not be used to send sensitive case or health information.",
          "Report any suspected unauthorized access to your account or a case promptly.",
        ],
      },
      {
        p: "By using Pathways Pro you acknowledge these inherent limits of technology and that you use the service with them in mind.",
      },
    ],
  },
  {
    id: "ai",
    heading: "8. Artificial-intelligence features",
    blocks: [
      {
        p: "Drafting features (for example IPEs, assessment interpretations, service deliverables, and letters) send the minimum necessary case context to our AI provider to generate a draft for a qualified professional to review.",
      },
      {
        p: "AI output is a draft, not a decision. It is never released to another party without counselor review, editing where needed, approval, and signature. AI is not used to make eligibility, benefit, clinical, or legal determinations on its own.",
      },
    ],
  },
  {
    id: "subprocessors",
    heading: "9. Service providers and sub-processors",
    blocks: [
      {
        p: "We rely on a limited set of vetted providers to host the platform, process AI drafts, and connect to public labor-market resources (for example, hosting/infrastructure, our AI provider, and public job- and apprenticeship-search services). These providers may process information only to perform services for us and under obligations of confidentiality and security. Where a provider handles protected health information on our behalf, that relationship is governed by an appropriate agreement (such as a HIPAA Business Associate Agreement).",
      },
    ],
  },
  {
    id: "retention",
    heading: "10. Retention and deletion",
    blocks: [
      {
        p: "Case and service records are retained for the period required by the applicable funding agency, records-retention schedule, and law, and are then securely disposed of — consistent with APA Standard 6.02 and the CRCC Code's record-keeping provisions. You may request export or deletion of your account data as described below; some records must be retained for a required period even after an account closes.",
      },
    ],
  },
  {
    id: "rights",
    heading: "11. Your rights and choices",
    blocks: [
      {
        lead: "Depending on your role and the law that applies, you may:",
      },
      {
        list: [
          "Request access to, or a copy of, information about you.",
          "Request correction or amendment of inaccurate information.",
          "Request deletion of your account data, subject to required retention periods.",
          "Ask questions about how information about you is used or disclosed.",
        ],
      },
      {
        p: "Where information is held by a counselor or agency as part of a VR case record, some requests are directed to that counselor or agency as the record's custodian; we will help route your request appropriately.",
      },
    ],
  },
  {
    id: "breach",
    heading: "12. If a breach occurs",
    blocks: [
      {
        p: "If a breach of unsecured personal or protected health information occurs, we will act consistent with the HIPAA Breach Notification Rule and applicable state breach-notification laws — investigating, mitigating, and notifying affected parties and any required agencies without unreasonable delay.",
      },
    ],
  },
  {
    id: "minors",
    heading: "13. Students and minors",
    blocks: [
      {
        p: "Some services support students with disabilities, including minors (for example, Pre-Employment Transition Services). Where education records are involved, we handle them consistent with FERPA and with the consent requirements that apply to minors, and we look to the counselor, school, or agency of record for the appropriate authorizations.",
      },
    ],
  },
  {
    id: "changes",
    heading: "14. Changes to this policy",
    blocks: [
      {
        p: "We may update this policy as the platform, our providers, or the law evolves. Material changes will be reflected in the effective date above and, where appropriate, communicated to account holders.",
      },
    ],
  },
  {
    id: "contact",
    heading: "15. Contact us",
    blocks: [
      {
        p: "Questions about this policy, or a privacy or data request, can be sent to privacy@pathwayspro.app. Questions about a specific VR case record may also be directed to the counselor or agency of record.",
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

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 space-y-8">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-widest text-accent">Legal</p>
        <h1 className="text-4xl tracking-tight">Privacy Policy</h1>
        <p className="text-ink/60 text-sm">
          Effective {EFFECTIVE}. This policy explains how Pathways Pro handles
          information, with confidentiality practices aligned to the APA and
          CRCC ethics codes and to HIPAA, WIOA Title IV, FERPA, and ADA
          confidentiality requirements.
        </p>
        <p className="text-ink/50 text-xs">
          This is a working policy for the pilot program and is provided for
          transparency, not as legal advice; it will be finalized with counsel
          before general availability. Where an agency or employer using
          Pathways Pro has its own privacy notice, that notice also applies to
          its records.
        </p>
      </header>

      {/* Quick contents */}
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
        <Link href="/terms" className="text-accent underline text-sm">
          Terms of Service →
        </Link>
      </footer>
    </div>
  );
}
