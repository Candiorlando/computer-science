"use client";

// Unified service catalog — all paid services that Business, Employment
// Partner, and Vendor portals can request, and that Counselors fulfill.
//
// Pricing here is the platform-wide INDUSTRY DEFAULT. Counselors can
// override per service for their own caseload via the Service
// Management page; overrides are stored separately and audited.

export type ServiceCategory =
  | "workforce-consulting"
  | "ada-compliance"
  | "data-evaluation"
  | "business-engagement"
  | "training"
  | "documentation-policy"
  | "recurring"
  | "one-time";

export type PriceUnit =
  | "flat"
  | "hourly"
  | "monthly"
  | "quarterly"
  | "annual";

export type ExternalAudience = "business" | "partner" | "vendor";

export interface CatalogService {
  id: string;
  title: string;
  category: ServiceCategory;
  description: string;
  // Industry-standard default; counselors can override.
  defaultPriceCents: number;
  priceUnit: PriceUnit;
  // Which external portals can request this service.
  availableTo: ExternalAudience[];
  // Whether the deliverable, once approved by the counselor, is also
  // visible (read-only) to the affected client.
  visibleToClient: boolean;
  // Typical turnaround once approved.
  turnaround: string;
  // System-prompt seed used by /api/generate-service-deliverable to
  // draft the AI deliverable on counselor approval.
  aiTemplate: string;
}

const F = (cents: number) => cents; // readability shorthand

export const SERVICE_CATALOG: CatalogService[] = [
  // ── 1. EMPLOYMENT & WORKFORCE CONSULTING ──────────────────────────
  {
    id: "job-development-consulting",
    title: "Job Development Consulting",
    category: "workforce-consulting",
    description:
      "Helps employers identify suitable roles, build disability-inclusive pipelines, and match candidates to essential job functions.",
    defaultPriceCents: F(120_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "10–15 business days",
    aiTemplate:
      "Draft a Job Development Consulting report with: (1) inclusive-pipeline pipeline map, (2) essential-function matrix for the candidate role, (3) recommended outreach channels (DOBE registries, RSA-211 EN list, local CRPs), (4) candidate-screening criteria emphasizing inclusion, (5) 90-day pipeline-build playbook.",
  },
  {
    id: "supported-employment-planning",
    title: "Supported Employment Planning",
    category: "workforce-consulting",
    description:
      "Designs long-term support models including natural supports and job stabilization plans.",
    defaultPriceCents: F(150_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "10 business days",
    aiTemplate:
      "Draft a Supported Employment Plan with: (1) initial support intensity schedule (hours/week tapering by month), (2) natural-support inventory (mentors, peers, supervisors), (3) stabilization milestones, (4) fading plan with success criteria, (5) WIOA § 7(38) competitive integrated employment alignment.",
  },
  {
    id: "job-coaching-services",
    title: "Job Coaching Services",
    category: "workforce-consulting",
    description:
      "On-the-job training, workplace integration, and skill-building delivered by an authorized coach.",
    defaultPriceCents: F(9_500),
    priceUnit: "hourly",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "Ongoing",
    aiTemplate:
      "Draft a Job Coaching authorization summary with: scope of coaching, weekly hour cap, intervention taxonomy (task-coaching, social skills, accommodations, crisis), fading plan, sign-off cadence.",
  },
  {
    id: "job-restructuring-consulting",
    title: "Job Restructuring Consulting",
    category: "workforce-consulting",
    description:
      "Analyzes job tasks and restructures duties to improve retention and reduce barriers.",
    defaultPriceCents: F(100_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "7 business days",
    aiTemplate:
      "Draft a Job Restructuring report with: (1) current task inventory, (2) essential-vs-marginal classification, (3) proposed restructure (carve, reassign, batch), (4) retention impact projection, (5) supervisor implementation guide.",
  },
  {
    id: "workplace-readiness-training",
    title: "Workplace Readiness Training",
    category: "workforce-consulting",
    description:
      "Teaches communication, professionalism, time management, and workplace expectations.",
    defaultPriceCents: F(75_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "Scheduled cohort",
    aiTemplate:
      "Draft a Workplace Readiness curriculum (4 modules × 90 min) with learning objectives, scenarios, role-plays, assessment rubric.",
  },
  {
    id: "customized-employment-consulting",
    title: "Customized Employment Consulting",
    category: "workforce-consulting",
    description:
      "Designs individualized roles based on Discovery, strengths, and job carving for workers with significant disabilities.",
    defaultPriceCents: F(150_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "30-day Discovery",
    aiTemplate:
      "Draft a Customized Employment plan with: (1) Discovery summary, (2) strengths-based job design proposal, (3) carved-task list, (4) employer negotiation talking points, (5) worksite customization recommendations, (6) stabilization milestones with WIOA § 7(38) alignment.",
  },

  // ── 2. ADA / 504 / EEO COMPLIANCE & ACCOMMODATION ─────────────────
  {
    id: "accommodation-inquiry-consulting",
    title: "Accommodation Inquiry & Response Consulting",
    category: "ada-compliance",
    description:
      "Guides employers through responding to accommodation requests and documenting the interactive process.",
    defaultPriceCents: F(85_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "5 business days",
    aiTemplate:
      "Draft an Interactive Process response packet with: written request acknowledgment, accommodation options analysis, undue-hardship analysis if applicable, decision letter template, documentation log.",
  },
  {
    id: "job-task-analysis",
    title: "Job Task Analysis",
    category: "ada-compliance",
    description:
      "Breaks down essential job functions for compliance and accommodation planning.",
    defaultPriceCents: F(85_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "5 business days",
    aiTemplate:
      "Draft a Job Task Analysis with O*NET-mapped physical and cognitive demands, essential-vs-marginal function classification, ADA risk flags, and JAN accommodation suggestions per demand.",
  },
  {
    id: "reasonable-accommodation-plan",
    title: "Reasonable Accommodation Planning",
    category: "ada-compliance",
    description:
      "Creates individualized accommodation plans with recommended tools and supports.",
    defaultPriceCents: F(120_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "7 business days",
    aiTemplate:
      "Draft a Reasonable Accommodation Plan with limitations, accommodations grouped by category (workplace/scheduling/equipment/AT), cost estimates, JAN references, implementation timeline.",
  },
  {
    id: "return-to-work-planning",
    title: "Return-to-Work Planning",
    category: "ada-compliance",
    description:
      "Designs phased return schedules and modified duty plans.",
    defaultPriceCents: F(100_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "7 business days",
    aiTemplate:
      "Draft a Return-to-Work plan with phased hour ramp, modified-duty list, accommodation list, supervisor check-in schedule, success criteria, escalation path.",
  },
  {
    id: "remote-work-safety",
    title: "Remote Work Safety & Compliance",
    category: "ada-compliance",
    description:
      "Evaluates home offices for ergonomic, safety, and ADA compliance.",
    defaultPriceCents: F(125_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "5–7 business days",
    aiTemplate:
      "Draft a Remote Work Safety & Compliance evaluation with home-office checklist results, ergonomic risk score, safety findings, ADA compliance gaps, recommended equipment list with cost estimates.",
  },
  {
    id: "accessibility-workflow-audit",
    title: "Accessibility Workflow Audits",
    category: "ada-compliance",
    description:
      "Reviews HR, onboarding, and training workflows for accessibility gaps.",
    defaultPriceCents: F(220_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "15 business days",
    aiTemplate:
      "Draft an Accessibility Workflow Audit report covering HR intake, onboarding, training, and offboarding processes — with WCAG 2.1 AA gap analysis, remediation roadmap, prioritization matrix.",
  },

  // ── 3. WORKFORCE DATA, EVALUATION & FORENSIC ──────────────────────
  {
    id: "labor-market-analysis",
    title: "Labor Market Analysis",
    category: "data-evaluation",
    description:
      "Identifies viable occupations, wage expectations, and hiring trends.",
    defaultPriceCents: F(100_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "7–10 business days",
    aiTemplate:
      "Draft a Labor Market Analysis with target SOCs, geographic openings, wage range, projected growth, sourcing methodology notes for Daubert defensibility.",
  },
  {
    id: "transferable-skills-analysis",
    title: "Transferable Skills Analysis",
    category: "data-evaluation",
    description:
      "Maps existing skills to new job opportunities.",
    defaultPriceCents: F(75_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "5–7 business days",
    aiTemplate:
      "Draft a Transferable Skills Analysis with source occupation SOC, residual capacity analysis, target SOC matches ranked by transferability, retraining gap notes.",
  },
  {
    id: "forensic-vocational-evaluation",
    title: "Forensic Vocational Evaluation",
    category: "data-evaluation",
    description:
      "Expert analysis for legal cases, disability claims, and litigation.",
    defaultPriceCents: F(250_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "14–21 business days",
    aiTemplate:
      "Draft a Forensic Vocational Evaluation report with methodology section, work history, education, RFC analysis, transferable skills, target occupations, wage-earning capacity opinion, Daubert-defensible appendix.",
  },
  {
    id: "earning-capacity-assessment",
    title: "Earning Capacity Assessments",
    category: "data-evaluation",
    description:
      "Determines employability and wage potential.",
    defaultPriceCents: F(180_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "10–14 business days",
    aiTemplate:
      "Draft an Earning Capacity Assessment with pre-injury wage baseline, post-injury capacity, diminution percentage, methodology rationale, target occupation list.",
  },
  {
    id: "workforce-outcomes-reporting",
    title: "Workforce Outcomes Reporting",
    category: "data-evaluation",
    description:
      "Quarterly or annual reporting for agencies and employers.",
    defaultPriceCents: F(180_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "5 business days after period close",
    aiTemplate:
      "Draft a Workforce Outcomes Report aligned with WIOA § 116 common performance indicators — employment rate (Q2, Q4), median earnings, credential attainment, measurable skill gains.",
  },

  // ── 4. BUSINESS ENGAGEMENT & EMPLOYER PARTNERSHIP ─────────────────
  {
    id: "inclusive-hiring-strategy",
    title: "Inclusive Hiring Strategy Consulting",
    category: "business-engagement",
    description:
      "Builds disability-inclusive hiring pipelines.",
    defaultPriceCents: F(100_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "10 business days",
    aiTemplate:
      "Draft an Inclusive Hiring Strategy with sourcing partner list, posting language audit, screen-fairness review, manager-bias guardrails, accommodation-on-hire readiness checklist.",
  },
  {
    id: "retention-risk-assessment",
    title: "Retention Risk Assessments",
    category: "business-engagement",
    description:
      "Identifies risks to employee retention and provides corrective recommendations.",
    defaultPriceCents: F(120_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "10 business days",
    aiTemplate:
      "Draft a Retention Risk Assessment with risk-factor heatmap (workload, accommodation gaps, supervisor support, peer connections, schedule fit), per-employee mitigation plan, 30/60/90-day touchpoint cadence.",
  },
  {
    id: "workplace-culture-inclusion",
    title: "Workplace Culture & Inclusion Consulting",
    category: "business-engagement",
    description:
      "Improves disability inclusion across teams and leadership.",
    defaultPriceCents: F(150_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "21 business days",
    aiTemplate:
      "Draft a Workplace Culture & Inclusion consulting plan with current-state baseline (climate survey design), leadership-coaching plan, employee-resource-group setup, 12-month roadmap.",
  },
  {
    id: "employer-partnership-development",
    title: "Employer Partnership Development",
    category: "business-engagement",
    description:
      "Establishes long-term VR–employer partnerships.",
    defaultPriceCents: F(100_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "30-day engagement",
    aiTemplate:
      "Draft a VR–employer partnership MOU framework with pipeline commitments, accommodation readiness expectations, reporting cadence, escalation contacts, success metrics.",
  },

  // ── 5. TRAINING & PROFESSIONAL DEVELOPMENT ────────────────────────
  {
    id: "disability-awareness-training",
    title: "Disability Awareness Training",
    category: "training",
    description:
      "Educates teams on disability etiquette and inclusion.",
    defaultPriceCents: F(120_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "Scheduled session",
    aiTemplate:
      "Draft a Disability Awareness Training agenda (90 min) with learning objectives, identity-first vs person-first language guidance, scenarios, Q&A frame.",
  },
  {
    id: "ada-eeo-compliance-training",
    title: "ADA / 504 / EEO Compliance Training",
    category: "training",
    description:
      "Provides legal and procedural training for HR and supervisors.",
    defaultPriceCents: F(150_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "Scheduled session",
    aiTemplate:
      "Draft an ADA / 504 / EEO Compliance Training curriculum (2 hours) with statutory overview, interactive process walkthrough, decision-points exercises, documentation requirements.",
  },
  {
    id: "supervisor-accommodation-training",
    title: "Supervisor Accommodation Training",
    category: "training",
    description:
      "Teaches supervisors how to manage accommodations.",
    defaultPriceCents: F(120_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "Scheduled session",
    aiTemplate:
      "Draft a Supervisor Accommodation Training (90 min) with interactive process walkthrough, common scenarios, conversation scripts, escalation paths, documentation tips.",
  },
  {
    id: "assistive-technology-training",
    title: "Assistive Technology Training",
    category: "training",
    description:
      "Demonstrates AT tools and trains staff on implementation.",
    defaultPriceCents: F(100_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "Scheduled session",
    aiTemplate:
      "Draft an Assistive Technology Training session with hands-on demos of screen readers, magnification, captioning, ergonomic AT, with implementation checklist.",
  },
  {
    id: "trauma-informed-workplace-training",
    title: "Trauma-Informed Workplace Training",
    category: "training",
    description:
      "Supports employees with trauma histories or mental health conditions.",
    defaultPriceCents: F(120_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "Scheduled session",
    aiTemplate:
      "Draft a Trauma-Informed Workplace Training (2 hours) with neuroscience primer, six-principles overview (safety, trustworthiness, peer support, collaboration, empowerment, cultural humility), policy-implications worksheet.",
  },
  {
    id: "annual-accessibility-training",
    title: "Annual Accessibility Training Package",
    category: "training",
    description:
      "Recurring annual training package for compliance and culture.",
    defaultPriceCents: F(150_000),
    priceUnit: "annual",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "Quarterly sessions",
    aiTemplate:
      "Draft a 12-month Annual Accessibility Training calendar with quarterly modules, attendance tracking, completion certificate template, year-end summary report.",
  },

  // ── 6. DOCUMENTATION, POLICY & SYSTEMS ────────────────────────────
  {
    id: "policy-drafting-revision",
    title: "Policy Drafting & Revision",
    category: "documentation-policy",
    description:
      "Creates or updates HR, accessibility, and accommodation policies.",
    defaultPriceCents: F(15_000),
    priceUnit: "hourly",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "Scoped per project",
    aiTemplate:
      "Draft policy revisions with redlines, statutory citations (ADA, 504, EEO), effective-date guidance, training rollout plan.",
  },
  {
    id: "accessibility-policy-development",
    title: "Accessibility Policy Development",
    category: "documentation-policy",
    description:
      "Builds comprehensive accessibility and inclusion policies.",
    defaultPriceCents: F(150_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "15 business days",
    aiTemplate:
      "Draft a comprehensive Accessibility Policy covering: scope, definitions, accommodation request process, digital accessibility, physical accessibility, training requirements, audit cadence, complaint process.",
  },
  {
    id: "accommodation-workflow-design",
    title: "Accommodation Workflow Design",
    category: "documentation-policy",
    description:
      "Designs end-to-end accommodation request workflows.",
    defaultPriceCents: F(200_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "15 business days",
    aiTemplate:
      "Draft an end-to-end accommodation request workflow with intake form, decision tree, IT/HR/manager handoffs, SLA targets, audit trail design, documentation templates.",
  },
  {
    id: "digital-accessibility-review",
    title: "Digital Accessibility Review",
    category: "documentation-policy",
    description:
      "Reviews websites and digital tools for accessibility compliance.",
    defaultPriceCents: F(180_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "15 business days",
    aiTemplate:
      "Draft a Digital Accessibility Review report covering WCAG 2.1 AA conformance, automated + manual test findings, prioritized remediation backlog, retest plan.",
  },
  {
    id: "annual-compliance-review",
    title: "Annual Compliance Review",
    category: "documentation-policy",
    description:
      "Annual audit of policies, workflows, and documentation.",
    defaultPriceCents: F(300_000),
    priceUnit: "annual",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "30-day engagement",
    aiTemplate:
      "Draft an Annual Compliance Review with audit scope, finding summary by domain (policy, workflow, documentation, training), severity ratings, corrective action plan, board-level summary.",
  },
  {
    id: "quarterly-case-audit",
    title: "Quarterly Case Audit Consulting",
    category: "documentation-policy",
    description:
      "Reviews case files for compliance and documentation quality.",
    defaultPriceCents: F(120_000),
    priceUnit: "quarterly",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "5 business days after quarter close",
    aiTemplate:
      "Draft a Quarterly Case Audit summary with file-completeness scorecards, RSA-911 alignment, accommodation-decision documentation review, recommended remediation per case.",
  },

  // ── 7. RECURRING / ANNUAL ─────────────────────────────────────────
  {
    id: "annual-ada-eeo-audit",
    title: "Annual ADA / EEO Compliance Audit",
    category: "recurring",
    description:
      "Comprehensive annual audit of ADA Title I employment compliance and EEO posture.",
    defaultPriceCents: F(350_000),
    priceUnit: "annual",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "45-day engagement",
    aiTemplate:
      "Draft an Annual ADA / EEO Audit report with statutory checklist, gap analysis, prioritized findings, corrective plan, board summary.",
  },
  {
    id: "quarterly-workforce-outcomes-review",
    title: "Quarterly Workforce Outcomes Review",
    category: "recurring",
    description:
      "Quarterly outcomes dashboard for hiring, retention, accommodation requests, and inclusion metrics.",
    defaultPriceCents: F(150_000),
    priceUnit: "quarterly",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "5 business days after quarter close",
    aiTemplate:
      "Draft a Quarterly Workforce Outcomes Review with hire/retention by demographic, accommodation-request volume/outcome, inclusion-survey trend, recommended priorities.",
  },
  {
    id: "vendor-coordination-oversight",
    title: "Vendor Coordination & Oversight",
    category: "recurring",
    description:
      "Monthly oversight of vendor invoicing, deliverables, and engagement quality.",
    defaultPriceCents: F(120_000),
    priceUnit: "monthly",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "Continuous",
    aiTemplate:
      "Draft a monthly Vendor Coordination summary with invoice reconciliation, deliverable QA, engagement-quality flags, recommended actions.",
  },
  {
    id: "annual-job-task-analysis-update",
    title: "Annual Job Task Analysis Updates",
    category: "recurring",
    description:
      "Annual refresh of JTA documents to track changing essential functions.",
    defaultPriceCents: F(100_000),
    priceUnit: "annual",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "10 business days per role",
    aiTemplate:
      "Draft an Annual JTA update with year-over-year delta, new physical/cognitive demands, accommodation suggestions for new demands, sign-off requirements.",
  },
  {
    id: "annual-accommodation-workflow-review",
    title: "Annual Accommodation Workflow Review",
    category: "recurring",
    description:
      "Annual audit of the accommodation workflow performance and SLA compliance.",
    defaultPriceCents: F(220_000),
    priceUnit: "annual",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "21-day engagement",
    aiTemplate:
      "Draft an Annual Accommodation Workflow Review with SLA performance, decision-quality sampling, employee-experience feedback, recommended workflow improvements.",
  },
];

// ── Counselor pricing overrides ────────────────────────────────────────

export interface PriceOverride {
  priceCents: number;
  enabledOverride?: boolean;
  updatedAt: string;
}

export interface PriceChange {
  serviceId: string;
  field: "priceCents" | "enabled";
  oldValue: number | boolean;
  newValue: number | boolean;
  changedAt: string;
}

export interface CounselorPricingProfile {
  counselorEmail: string;
  overrides: Record<string, PriceOverride>;
  changeLog: PriceChange[];
}

const PRICING_KEY = "pathways-pro:counselor-pricing-v1";

function readAll(): Record<string, CounselorPricingProfile> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PRICING_KEY);
    return raw
      ? (JSON.parse(raw) as Record<string, CounselorPricingProfile>)
      : {};
  } catch {
    return {};
  }
}

function writeAll(map: Record<string, CounselorPricingProfile>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PRICING_KEY, JSON.stringify(map));
}

export function loadCounselorPricing(
  counselorEmail: string,
): CounselorPricingProfile {
  return (
    readAll()[counselorEmail] ?? {
      counselorEmail,
      overrides: {},
      changeLog: [],
    }
  );
}

export function setPriceOverride(
  counselorEmail: string,
  serviceId: string,
  priceCents: number,
): CounselorPricingProfile {
  const map = readAll();
  const profile: CounselorPricingProfile =
    map[counselorEmail] ?? {
      counselorEmail,
      overrides: {},
      changeLog: [],
    };
  const prev = profile.overrides[serviceId]?.priceCents;
  profile.overrides[serviceId] = {
    ...profile.overrides[serviceId],
    priceCents,
    updatedAt: new Date().toISOString(),
  };
  profile.changeLog = [
    {
      serviceId,
      field: "priceCents" as const,
      oldValue: prev ?? defaultPrice(serviceId),
      newValue: priceCents,
      changedAt: new Date().toISOString(),
    },
    ...profile.changeLog,
  ].slice(0, 100);
  map[counselorEmail] = profile;
  writeAll(map);
  return profile;
}

export function setServiceEnabled(
  counselorEmail: string,
  serviceId: string,
  enabled: boolean,
): CounselorPricingProfile {
  const map = readAll();
  const profile: CounselorPricingProfile =
    map[counselorEmail] ?? {
      counselorEmail,
      overrides: {},
      changeLog: [],
    };
  const prev = profile.overrides[serviceId]?.enabledOverride ?? true;
  profile.overrides[serviceId] = {
    priceCents:
      profile.overrides[serviceId]?.priceCents ?? defaultPrice(serviceId),
    enabledOverride: enabled,
    updatedAt: new Date().toISOString(),
  };
  profile.changeLog = [
    {
      serviceId,
      field: "enabled" as const,
      oldValue: prev,
      newValue: enabled,
      changedAt: new Date().toISOString(),
    },
    ...profile.changeLog,
  ].slice(0, 100);
  map[counselorEmail] = profile;
  writeAll(map);
  return profile;
}

export function effectivePrice(
  serviceId: string,
  counselorEmail?: string,
): number {
  const base = defaultPrice(serviceId);
  if (!counselorEmail) return base;
  const profile = readAll()[counselorEmail];
  const override = profile?.overrides[serviceId]?.priceCents;
  return override ?? base;
}

export function effectiveEnabled(
  serviceId: string,
  counselorEmail?: string,
): boolean {
  if (!counselorEmail) return true;
  const profile = readAll()[counselorEmail];
  return profile?.overrides[serviceId]?.enabledOverride ?? true;
}

function defaultPrice(serviceId: string): number {
  return (
    SERVICE_CATALOG.find((s) => s.id === serviceId)?.defaultPriceCents ?? 0
  );
}

export function getService(id: string): CatalogService | null {
  return SERVICE_CATALOG.find((s) => s.id === id) ?? null;
}

export function servicesForAudience(
  audience: ExternalAudience,
): CatalogService[] {
  return SERVICE_CATALOG.filter((s) => s.availableTo.includes(audience));
}

export function formatPrice(
  priceCents: number,
  unit: PriceUnit,
): string {
  const dollars = (priceCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  const suffix = {
    flat: " flat",
    hourly: "/hr",
    monthly: "/mo",
    quarterly: "/quarter",
    annual: "/yr",
  }[unit];
  return dollars + suffix;
}

export const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  "workforce-consulting": "🧭 Employment & Workforce Consulting",
  "ada-compliance": "🏢 ADA / 504 / EEO Compliance & Accommodation",
  "data-evaluation": "📊 Workforce Data, Evaluation & Forensic",
  "business-engagement": "🧩 Business Engagement & Employer Partnership",
  training: "🧠 Training & Professional Development",
  "documentation-policy": "🗂️ Documentation, Policy & Systems",
  recurring: "🔁 Recurring & Annual Services",
  "one-time": "⭐ One-Time / Project-Based",
};
