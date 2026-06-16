"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";

interface Resource {
  name: string;
  url: string;
  type?: string; // e.g. "Framework", "Template", "Journal", "Federal regulation"
  description: string;
  populationOrUse?: string;
}

interface ResourceGroup {
  groupName: string;
  resources: Resource[];
}

interface HubSection {
  id: string;
  title: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  groups: ResourceGroup[];
}

const SECTIONS: HubSection[] = [
  // ─── 1. Evidence & Strategy Hub ──────────────────────────────────
  {
    id: "evidence-strategy",
    title: "The Evidence & Strategy Hub",
    tagline: "Action-oriented frameworks for modern VR practice",
    description:
      "Contemporary, evidence-supported strategies you can put into a case plan this week. Each entry is a doing-something framework, not just background reading.",
    icon: "⚡",
    accent: "emerald",
    groups: [
      {
        groupName: "Engagement & Conversation Strategy",
        resources: [
          {
            name: "Motivational Interviewing (Miller & Rollnick)",
            url: "https://motivationalinterviewing.org/",
            type: "Evidence-based framework",
            description:
              "Strategy for resolving ambivalence and eliciting change talk. Proven in VR, addictions, and chronic disease.",
            populationOrUse: "Use during IPE goal-setting and when clients waver on training enrollment.",
          },
          {
            name: "Solution-Focused Brief Therapy (de Shazer & Berg)",
            url: "https://www.sfbta.org/",
            type: "Brief intervention model",
            description:
              "Future-focused, strengths-based questioning that builds on client successes rather than dwelling on problems.",
            populationOrUse: "Time-limited cases, transition-age youth, and clients in adjustment phase.",
          },
          {
            name: "Trauma-Informed Care Principles (SAMHSA)",
            url: "https://store.samhsa.gov/product/SAMHSA-s-Concept-of-Trauma-and-Guidance-for-a-Trauma-Informed-Approach/SMA14-4884",
            type: "Federal framework",
            description:
              "Six principles (safety, trustworthiness, peer support, collaboration, empowerment, cultural humility) for redesigning service delivery.",
            populationOrUse: "Veterans, formerly incarcerated, survivors of intimate partner violence.",
          },
        ],
      },
      {
        groupName: "Outcome-Focused Strategic Models",
        resources: [
          {
            name: "Customized Employment (ODEP)",
            url: "https://www.dol.gov/agencies/odep/program-areas/employment-supports/customized-employment",
            type: "Service approach",
            description:
              "Negotiated job descriptions matched to a specific client's strengths, interests, and conditions for success.",
            populationOrUse: "Significant disability, complex accommodation needs, supported-employment pipeline.",
          },
          {
            name: "Discovery Process (Marc Gold & Associates)",
            url: "https://www.marcgold.com/discovery.html",
            type: "Assessment-to-job-development model",
            description:
              "Person-centered discovery in lieu of standardized vocational evaluation. Strong fit with I/DD populations.",
            populationOrUse: "Customized employment pipeline; replaces traditional vocational evaluation for some clients.",
          },
          {
            name: "Progressive Employment (VR-RRTC)",
            url: "https://vr-rrtc.org/research/progressive-employment/",
            type: "Engagement model",
            description:
              "Continuous engagement model removing the 'work-ready' gatekeeping step. Increases earlier placement and employer engagement.",
            populationOrUse: "State VR programs working on RSA-911 placement metrics.",
          },
          {
            name: "Active Support (Mansell & Beadle-Brown)",
            url: "https://www.tizard.org.uk/research/active-support",
            type: "Evidence-based practice",
            description:
              "Structured assistance method for people with intellectual disability to participate in valued activities.",
            populationOrUse: "Group settings, supported-living and supported-employment contexts.",
          },
        ],
      },
      {
        groupName: "Performance Strategy under WIOA",
        resources: [
          {
            name: "WIOA Common Performance Measures (RSA)",
            url: "https://rsa.ed.gov/about/programs/state-vocational-rehabilitation-services-program/performance-management",
            type: "Performance framework",
            description:
              "The six WIOA primary indicators of performance. Drives state VR funding and accountability.",
            populationOrUse: "Quarterly RSA-911 strategy, agency planning.",
          },
          {
            name: "Employment First Policy Framework (ODEP)",
            url: "https://www.dol.gov/agencies/odep/initiatives/employment-first",
            type: "Federal policy",
            description:
              "Integrated competitive employment as the first option for individuals with significant disabilities.",
            populationOrUse: "Statewide policy alignment, I/DD employment planning.",
          },
        ],
      },
    ],
  },

  // ─── 2. Practitioner's Toolkit ───────────────────────────────────
  {
    id: "practitioner-toolkit",
    title: "The Practitioner's Toolkit",
    tagline: "Templates, scripts, and forms for your daily workflow",
    description:
      "Drop-in resources for the work itself — case notes, intake checklists, conversation scripts, IPE structure, supervision tools. Battle-tested formats from working CRCs.",
    icon: "🧰",
    accent: "accent",
    groups: [
      {
        groupName: "Documentation Templates",
        resources: [
          {
            name: "SOAP Note Format (Cameron & Turtle-Song, 2002)",
            url: "https://onlinelibrary.wiley.com/doi/10.1002/j.1556-6678.2002.tb00193.x",
            type: "Template",
            description:
              "Subjective / Objective / Assessment / Plan structure. CRCC-recommended baseline for clinical documentation.",
            populationOrUse: "Every contact note. Required by most state VR audit standards.",
          },
          {
            name: "DAP Note Format",
            url: "https://www.therapybypro.com/dap-notes/",
            type: "Template",
            description:
              "Data / Assessment / Plan. Brief alternative to SOAP when you don't have a subjective/objective split.",
            populationOrUse: "Quick contact notes, phone follow-ups.",
          },
          {
            name: "BIRP Note Format",
            url: "https://www.icanotes.com/2019/02/19/how-to-write-birp-notes-with-examples/",
            type: "Template",
            description:
              "Behavior / Intervention / Response / Plan. Common in behavioral health and substance use treatment.",
            populationOrUse: "Co-occurring mental health cases, addictions counseling.",
          },
        ],
      },
      {
        groupName: "Intake & Case Planning",
        resources: [
          {
            name: "RSA Functional Capacity Categories",
            url: "https://rsa.ed.gov/sites/default/files/subregulatory/RSA-PM-21-04.pdf",
            type: "Federal worksheet",
            description:
              "The seven functional categories used to document significant disability for VR eligibility (mobility, communication, self-care, etc.).",
            populationOrUse: "Eligibility determination, IPE accommodation planning.",
          },
          {
            name: "Person-Centered Planning Templates (NTACT:C)",
            url: "https://transitionta.org/topics/personcenteredplanning/",
            type: "Template",
            description:
              "PATH, MAPS, and Essential Lifestyle Planning templates aligned with transition planning.",
            populationOrUse: "Transition-age youth, I/DD, complex cases.",
          },
          {
            name: "Pre-ETS Service Tracking Worksheet",
            url: "https://transitionta.org/wp-content/uploads/2022/06/Pre-ETS-Tracker.pdf",
            type: "Tracker",
            description:
              "Tracks delivery of the five Pre-ETS required activities by quarter — for RSA-911 reporting compliance.",
            populationOrUse: "Pre-ETS clients ages 14–21.",
          },
        ],
      },
      {
        groupName: "Conversation Scripts",
        resources: [
          {
            name: "OARS Toolkit (Motivational Interviewing)",
            url: "https://www.theiacp.com/assets/Conf_Materials/2017MFTPC/Bonus_Material_OARS.pdf",
            type: "Script library",
            description:
              "Open-ended questions, Affirmations, Reflections, and Summaries — the four core MI micro-skills with example phrasings.",
            populationOrUse: "Engagement difficulty, ambivalence, change planning.",
          },
          {
            name: "DESC Script (Difficult Conversations)",
            url: "https://www.physicianleaders.org/articles/the-desc-script-for-difficult-conversations",
            type: "Script",
            description:
              "Describe / Express / Specify / Consequence. Structured script for confronting attendance, behavior, or boundary issues.",
            populationOrUse: "Tough employer feedback, job-coaching boundary conversations.",
          },
          {
            name: "Crisis De-escalation Phrasing (CPI)",
            url: "https://www.crisisprevention.com/blog/general/de-escalation-tips/",
            type: "Script",
            description:
              "Verbal de-escalation phrasing for agitated clients — from the Crisis Prevention Institute's framework.",
            populationOrUse: "Crisis moments, severe mental illness, frustrated long-term clients.",
          },
        ],
      },
      {
        groupName: "Self-Care for Counselors",
        resources: [
          {
            name: "ProQOL — Professional Quality of Life Scale",
            url: "https://proqol.org/proqol-measure",
            type: "Self-assessment",
            description:
              "30-item public-domain measure of compassion satisfaction, burnout, and secondary traumatic stress.",
            populationOrUse: "Quarterly counselor self-check; supervision.",
          },
          {
            name: "ACA Vicarious Trauma Guide",
            url: "https://www.counseling.org/docs/default-source/vistas/vicarious-trauma.pdf",
            type: "Practice guide",
            description:
              "American Counseling Association overview of identifying, preventing, and responding to vicarious trauma.",
            populationOrUse: "Trauma-heavy caseloads, supervisor support of new counselors.",
          },
        ],
      },
    ],
  },

  // ─── 3. Clinical Research & Action Library ───────────────────────
  {
    id: "research-library",
    title: "Clinical Research & Action Library",
    tagline: "Peer-reviewed evidence base for VR practice",
    description:
      "The empirical floor. Journals, systematic reviews, and clearinghouses for grounding case decisions and IPE rationales in published evidence.",
    icon: "📊",
    accent: "blue",
    groups: [
      {
        groupName: "Core Peer-Reviewed Journals",
        resources: [
          {
            name: "Rehabilitation Counseling Bulletin",
            url: "https://journals.sagepub.com/home/rcb",
            type: "Journal (NCRE-affiliated)",
            description:
              "Primary academic journal for rehabilitation counseling research. CRCC-recognized.",
          },
          {
            name: "Journal of Applied Rehabilitation Counseling (JARC)",
            url: "https://www.nrca-net.org/journal-of-applied-rehabilitation-counseling",
            type: "Journal (NRCA)",
            description:
              "National Rehabilitation Counseling Association's flagship publication. Strong on practitioner-facing research.",
          },
          {
            name: "Rehabilitation Psychology",
            url: "https://www.apa.org/pubs/journals/rep",
            type: "Journal (APA)",
            description:
              "APA Division 22 journal. Covers psychological aspects of disability and rehabilitation.",
          },
          {
            name: "Disability and Rehabilitation",
            url: "https://www.tandfonline.com/journals/idre20",
            type: "Journal (international)",
            description:
              "International peer-reviewed journal for multidisciplinary rehabilitation research.",
          },
        ],
      },
      {
        groupName: "Research Centers & Clearinghouses",
        resources: [
          {
            name: "Rehabilitation Research and Training Centers (RRTC)",
            url: "https://www.naric.com/?q=en/rrtcs",
            type: "Federal research center network",
            description:
              "NIDILRR-funded RRTCs across disability-employment topics: I/DD, mental illness, TBI, SCI, deaf/HOH, etc.",
          },
          {
            name: "VR-ROI (Return on Investment) Project",
            url: "https://vr-roi.org/",
            type: "VR outcomes research",
            description:
              "Aggregated state VR program outcomes data — useful for justifying programmatic decisions.",
          },
          {
            name: "NARIC — National Rehabilitation Information Center",
            url: "https://www.naric.com/",
            type: "Bibliographic database",
            description:
              "Searchable database of 75,000+ disability-and-rehabilitation research documents.",
          },
          {
            name: "Campbell Collaboration — Disability Coordinating Group",
            url: "https://www.campbellcollaboration.org/",
            type: "Systematic-review library",
            description:
              "High-quality systematic reviews of disability-employment interventions.",
          },
          {
            name: "Cochrane Library — Rehabilitation Field",
            url: "https://rehabilitation.cochrane.org/",
            type: "Systematic-review library",
            description:
              "Cochrane systematic reviews on rehabilitation interventions, including physical and vocational rehab.",
          },
        ],
      },
      {
        groupName: "Implementation Science",
        resources: [
          {
            name: "VR Practices Guide (IPS Employment Center)",
            url: "https://ipsworks.org/",
            type: "Evidence-based practice",
            description:
              "Individual Placement and Support model for supported employment. Strong evidence base for people with serious mental illness.",
            populationOrUse: "Serious mental illness pipeline; replicable across state VR.",
          },
          {
            name: "Project SEARCH (Cincinnati Children's)",
            url: "https://www.projectsearch.us/",
            type: "Employment model",
            description:
              "School-to-work program for students with significant disabilities. Replicated across 600+ sites in 48 states + 9 countries.",
            populationOrUse: "Transition from school to competitive integrated employment.",
          },
        ],
      },
    ],
  },

  // ─── 4. Applied Rehabilitation Repository ────────────────────────
  {
    id: "rehab-repository",
    title: "The Applied Rehabilitation Repository",
    tagline: "Foundational texts, theory, and federal authority",
    description:
      "The disciplinary backbone of rehabilitation counseling — classic theory, foundational texts, federal regulations, the CRCC Code, and the institutions that train and credential us.",
    icon: "📚",
    accent: "ink",
    groups: [
      {
        groupName: "Federal Authority",
        resources: [
          {
            name: "Rehabilitation Act of 1973 (as amended by WIOA)",
            url: "https://www.ada.gov/cguide.htm#anchor65610",
            type: "Federal statute",
            description:
              "The founding civil-rights statute for people with disabilities in federally-funded programs. Includes Sections 501, 503, 504, and 508.",
          },
          {
            name: "Workforce Innovation and Opportunity Act (WIOA)",
            url: "https://www.dol.gov/agencies/eta/wioa",
            type: "Federal statute",
            description:
              "Title IV is the modern statutory authority for state VR programs and Pre-ETS services.",
          },
          {
            name: "Americans with Disabilities Act (ADA)",
            url: "https://www.ada.gov/",
            type: "Federal statute",
            description:
              "Title I (employment), Title II (public services), and Title III (public accommodations).",
          },
          {
            name: "RSA Policy Guidance (PDs and TACs)",
            url: "https://rsa.ed.gov/about/policy-letters",
            type: "Federal policy directives",
            description:
              "Current Policy Directives and Technical Assistance Circulars from the Rehabilitation Services Administration.",
          },
        ],
      },
      {
        groupName: "Ethics & Credentialing",
        resources: [
          {
            name: "CRCC Code of Professional Ethics",
            url: "https://crccertification.com/code-of-ethics/",
            type: "Ethics code",
            description:
              "Binding ethical standards for CRCs. 11 sections including counseling relationship, confidentiality, advocacy, assessment, supervision, research.",
          },
          {
            name: "CRC Certification Maintenance Standards",
            url: "https://crccertification.com/maintain-your-certification/",
            type: "Credentialing rules",
            description:
              "Continuing education requirements (100 hours / 5 years, with 10 in ethics).",
          },
          {
            name: "Council on Rehabilitation Education (CORE) → CACREP Standards",
            url: "https://www.cacrep.org/",
            type: "Program accreditation",
            description:
              "Accreditation standards for rehabilitation counseling master's programs.",
          },
        ],
      },
      {
        groupName: "Foundational Theory",
        resources: [
          {
            name: "Holland's Theory of Vocational Choice (RIASEC)",
            url: "https://www.onetcenter.org/dl_files/RIASEC.pdf",
            type: "Theory",
            description:
              "John Holland's six-factor model of occupational interests. Foundation of O*NET Interest Profiler and most modern career counseling.",
          },
          {
            name: "Super's Life-Span Life-Space Career Theory",
            url: "https://www.jstor.org/stable/45050253",
            type: "Theory",
            description:
              "Donald Super's developmental career model: growth, exploration, establishment, maintenance, disengagement.",
          },
          {
            name: "Krumboltz Social Learning Theory of Career Decision-Making",
            url: "https://www.tandfonline.com/doi/abs/10.1080/13594320500430268",
            type: "Theory",
            description:
              "Career as a sequence of learning experiences. Drives the Happenstance Learning Theory.",
          },
          {
            name: "Wright's Physical Disability — A Psychosocial Approach",
            url: "https://psycnet.apa.org/record/1983-97525-000",
            type: "Foundational text",
            description:
              "Beatrice Wright's 1983 work on disability identity, value changes, and the insider/outsider distinction. Foundation of the Acceptance of Disability Scale.",
          },
          {
            name: "Livneh's Stage Model of Adjustment to Disability",
            url: "https://journals.sagepub.com/doi/10.1177/003435520104500107",
            type: "Theory",
            description:
              "Livneh & Antonak's psychosocial adaptation model. Underlies the RIDI inventory.",
          },
        ],
      },
      {
        groupName: "Professional Associations",
        resources: [
          {
            name: "National Rehabilitation Counseling Association (NRCA)",
            url: "https://www.nrca-net.org/",
            type: "Professional association",
            description:
              "The professional home for CRCs. Conferences, advocacy, publishes JARC.",
          },
          {
            name: "American Rehabilitation Counseling Association (ARCA)",
            url: "https://arcaweb.org/",
            type: "ACA division",
            description:
              "Rehabilitation counseling division of the American Counseling Association.",
          },
          {
            name: "International Association of Rehabilitation Professionals (IARP)",
            url: "https://www.rehabpro.org/",
            type: "Professional association",
            description:
              "Vocational evaluation, life-care planning, and forensic rehabilitation.",
          },
          {
            name: "Council of State Administrators of Vocational Rehabilitation (CSAVR)",
            url: "https://www.csavr.org/",
            type: "Policy organization",
            description:
              "Represents state VR agencies. Useful for federal policy tracking.",
          },
          {
            name: "National Council on Rehabilitation Education (NCRE)",
            url: "https://ncre.org/",
            type: "Academic association",
            description:
              "Educators in rehabilitation counseling and related programs.",
          },
        ],
      },
    ],
  },
];

export default function PractitionerHubPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | "all">("all");

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setAuthorized(true);
  }, [router]);

  if (!authorized) return null;

  const visibleSections = SECTIONS.filter(
    (sec) => activeSection === "all" || sec.id === activeSection,
  ).map((sec) => {
    const q = query.trim().toLowerCase();
    if (!q) return sec;
    return {
      ...sec,
      groups: sec.groups
        .map((g) => ({
          ...g,
          resources: g.resources.filter((r) =>
            `${r.name} ${r.description} ${r.type ?? ""} ${r.populationOrUse ?? ""}`
              .toLowerCase()
              .includes(q),
          ),
        }))
        .filter((g) => g.resources.length > 0),
    };
  }).filter((sec) => sec.groups.length > 0);

  const totalCount = visibleSections.reduce(
    (s, sec) => s + sec.groups.reduce((s2, g) => s2 + g.resources.length, 0),
    0,
  );

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Counselor Practitioner Hub
        </p>
        <h1 className="text-4xl mb-2">
          The four-lens rehabilitation reference
        </h1>
        <p className="text-ink/70 prose-narrow">
          Curated for Certified Rehabilitation Counselors. Four sections,
          four angles on the same field: contemporary strategy, daily-workflow
          templates, peer-reviewed evidence, and foundational theory and
          policy authority.
        </p>
      </header>

      <nav className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
        {SECTIONS.map((sec) => (
          <button
            key={sec.id}
            onClick={() =>
              setActiveSection(activeSection === sec.id ? "all" : sec.id)
            }
            className={`text-left border rounded-lg p-4 transition ${
              activeSection === sec.id
                ? "border-accent bg-accent/5"
                : "border-ink/15 bg-cream hover:border-accent"
            }`}
          >
            <div className="text-2xl mb-1">{sec.icon}</div>
            <div className="font-semibold text-sm leading-tight">
              {sec.title}
            </div>
            <div className="text-xs text-ink/60 mt-1">{sec.tagline}</div>
          </button>
        ))}
      </nav>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search across all four sections — by name, framework, or use case…"
        className="w-full bg-cream border border-ink/15 rounded-lg px-4 py-3 focus:outline-none focus:border-accent"
      />

      {query && (
        <p className="text-xs text-ink/60">
          {totalCount} result{totalCount === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
          {activeSection !== "all" && (
            <>
              {" "}within{" "}
              <strong>{SECTIONS.find((s) => s.id === activeSection)?.title}</strong>
            </>
          )}
        </p>
      )}

      {visibleSections.map((sec) => (
        <section
          key={sec.id}
          id={sec.id}
          className="border border-ink/10 rounded-lg overflow-hidden"
        >
          <div className="bg-cream border-b border-ink/10 px-5 py-4">
            <h2 className="text-2xl">
              {sec.icon} {sec.title}
            </h2>
            <p className="text-sm text-ink/60 mt-1">{sec.tagline}</p>
            <p className="text-sm text-ink/80 mt-2 max-w-3xl">
              {sec.description}
            </p>
          </div>

          <div className="p-5 space-y-6">
            {sec.groups.map((g) => (
              <div key={g.groupName}>
                <h3 className="text-sm uppercase tracking-wider text-accent font-semibold mb-3 border-b border-ink/10 pb-1">
                  {g.groupName}
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {g.resources.map((r) => (
                    <a
                      key={r.url}
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-ink/10 rounded-lg p-4 bg-white/60 hover:border-accent hover:bg-accent/5 transition flex flex-col gap-2"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-sm">{r.name}</span>
                        {r.type && (
                          <span className="text-[10px] uppercase tracking-wider text-accent whitespace-nowrap">
                            {r.type}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-ink/75">{r.description}</p>
                      {r.populationOrUse && (
                        <p className="text-xs text-ink/60 italic border-t border-ink/10 pt-2">
                          💡 {r.populationOrUse}
                        </p>
                      )}
                      <p className="text-xs text-ink/40 truncate">{r.url}</p>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {visibleSections.length === 0 && (
        <p className="text-center text-ink/50 py-12">
          No matches across the four sections.
        </p>
      )}

      <footer className="border-t border-ink/10 pt-4 text-xs text-ink/50">
        <p>
          The Practitioner Hub is curated reference, not a substitute for
          supervision, your state agency&apos;s policy manual, or the CRCC Code
          of Professional Ethics. Verify currency of regulations before citing
          on the IPE.
        </p>
      </footer>
    </div>
  );
}
