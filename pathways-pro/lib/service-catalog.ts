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
  | "one-time"
  | "client-services"
  | "partner-coordination"
  | "youth-services";

export type PriceUnit =
  | "flat"
  | "hourly"
  | "monthly"
  | "quarterly"
  | "annual";

// Adds "client" so counselors can assign client-facing ancillary
// services directly to vocational clients (Category A in the
// expanded catalog).
export type ExternalAudience = "business" | "partner" | "vendor" | "client";

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

  // ─── CATEGORY A · CLIENT-FACING ANCILLARY SERVICES ─────────────────
  // Assigned BY counselors TO vocational clients. The counselor uses
  // the "Assign service" UI on the client case file; the client sees
  // the active assignment on their portal home.
  {
    id: "benefits-counseling",
    title: "Benefits Counseling & Work Incentives Planning",
    category: "client-services",
    description:
      "WIPA-aligned benefits planning — SSI / SSDI work incentives, Ticket to Work, PASS plans, IRWE / SEIE deductions.",
    defaultPriceCents: F(45_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "7 business days",
    aiTemplate:
      "Draft a benefits-counseling brief tailored to the client's current SSA status. Model how the proposed wages affect each benefit; identify applicable work incentives; recommend reporting cadence; cite the SSA POMS sections relied on.",
  },
  {
    id: "assistive-tech-screening",
    title: "Assistive Technology (AT) Screening & Device Training",
    category: "client-services",
    description:
      "AT functional needs assessment, device trial, training plan, and JAN-backed AT recommendations.",
    defaultPriceCents: F(95_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "10 business days",
    aiTemplate:
      "Draft an AT screening report covering current functional barriers, AT recommendations with cost bands from JAN, a training plan (hours and milestones), and a vendor short-list.",
  },
  {
    id: "travel-training",
    title: "Travel Training & Mobility Instruction",
    category: "client-services",
    description:
      "Route planning, fixed-route + paratransit orientation, safety drills, and independent travel certification.",
    defaultPriceCents: F(60_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "Scheduled cohort (3-6 weeks)",
    aiTemplate:
      "Draft a travel-training plan: identify the home-to-worksite route, transit options, safety scenarios to drill, instructor session count, success criteria, and a fallback plan if transit changes.",
  },
  {
    id: "self-advocacy-coaching",
    title: "Self-Advocacy & Disclosure Coaching",
    category: "client-services",
    description:
      "1-on-1 coaching on ADA disclosure, accommodation requests, and rights-based self-advocacy at work.",
    defaultPriceCents: F(55_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "6 weekly sessions",
    aiTemplate:
      "Draft a self-advocacy coaching plan: target situations (interview, onboarding, accommodation request, supervisor conflict), the script template for each, and rehearsal milestones.",
  },
  {
    id: "soft-skills-bootcamp",
    title: "Soft Skills & Work Readiness Bootcamp",
    category: "client-services",
    description:
      "Cohort-based bootcamp on workplace communication, time management, conflict resolution, and feedback skills.",
    defaultPriceCents: F(85_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "4-week cohort",
    aiTemplate:
      "Draft a soft-skills bootcamp syllabus: weekly objectives, daily exercises, role-play scenarios, assessment rubric, and a portfolio piece each participant builds.",
  },
  {
    id: "financial-literacy",
    title: "Financial Literacy & Asset Development",
    category: "client-services",
    description:
      "Budgeting, banking, ABLE / IDA account setup, credit-building, and asset-development counseling.",
    defaultPriceCents: F(50_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "6 weekly sessions",
    aiTemplate:
      "Draft a financial-literacy curriculum: client's current cash flow, budget recommendations, ABLE/IDA eligibility, credit-building actions, and three asset-development goals tied to the IPE.",
  },
  {
    id: "post-employment-retention",
    title: "Post-Employment Stabilization & Retention Check-ins",
    category: "client-services",
    description:
      "90-day post-placement retention coaching — check-ins, accommodation refinement, supervisor mediation when needed.",
    defaultPriceCents: F(110_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "90-day engagement",
    aiTemplate:
      "Draft a post-employment retention plan: check-in cadence (30/60/90 day), red-flag indicators, accommodation tune-up triggers, supervisor relationship temperature checks, and the closeout criteria for moving to status maintenance.",
  },

  // ─── CATEGORY B · BUSINESS & EMPLOYER-FACING SERVICES ──────────────
  // Requested BY businesses through their portal. Counselor approves
  // and drafts the deliverable. (Augments the existing workforce
  // consulting + ADA categories — these are the named instruments.)
  {
    id: "ada-title-i-audit",
    title: "ADA Title I Compliance Audit",
    category: "ada-compliance",
    description:
      "Comprehensive ADA Title I audit — job descriptions, hiring practices, accommodation workflow, and reasonable-accommodation log review.",
    defaultPriceCents: F(450_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "30-day engagement",
    aiTemplate:
      "Draft an ADA Title I Compliance Audit report: findings by control area (recruitment, hiring, accommodation process, training, retaliation safeguards), risk ratings, regulatory citations (29 CFR Part 1630), and a 90-day corrective action plan.",
  },
  {
    id: "digital-a11y-review-services",
    title: "Digital Accessibility (A11y) Review",
    category: "ada-compliance",
    description:
      "WCAG 2.2 AA audit of public-facing and employee-facing digital products with remediation roadmap.",
    defaultPriceCents: F(380_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "21 business days",
    aiTemplate:
      "Draft a digital accessibility review: WCAG 2.2 AA scan results by success criterion, severity ranking, code-level remediation guidance, and a sequenced backlog for the engineering team.",
  },
  {
    id: "workplace-ergonomic-accommodation",
    title: "Workplace Ergonomic & Accommodation Assessment",
    category: "ada-compliance",
    description:
      "On-site ergonomic evaluation paired with accommodation recommendations and JAN-backed cost data.",
    defaultPriceCents: F(220_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "10 business days",
    aiTemplate:
      "Draft a workplace ergonomic assessment: physical-demand observations, ANSI/HFES violations, recommended equipment changes with cost bands, and a JAN-backed accommodation memo per affected employee.",
  },
  {
    id: "neurodiversity-inclusion-training",
    title: "Neurodiversity & Disability Inclusion Training",
    category: "training",
    description:
      "Manager + team training on neurodiversity hiring, accommodation, and inclusive team practices.",
    defaultPriceCents: F(150_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "Scheduled session",
    aiTemplate:
      "Draft a neurodiversity & disability inclusion training agenda: research framing, case studies, role-plays, manager toolkit, and a 30-day post-training application plan.",
  },
  {
    id: "tax-credit-optimization",
    title: "Tax Credit & Financial Incentive Optimization",
    category: "business-engagement",
    description:
      "WOTC, Disabled Access Credit (§44), and Architectural Barrier Removal Deduction (§190) optimization.",
    defaultPriceCents: F(180_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "15 business days",
    aiTemplate:
      "Draft a tax-credit optimization memo: WOTC eligibility flagging across hires this period, §44 expense classification, §190 deductible items, projected federal credit/deduction value, and the documentation packet HR needs to claim each.",
  },
  {
    id: "stay-at-work-intervention",
    title: "Stay-at-Work (SAW) Early Intervention",
    category: "workforce-consulting",
    description:
      "Early-intervention SAW protocol for employees with new-onset conditions — accommodation triage before disability leave starts.",
    defaultPriceCents: F(140_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "5 business days",
    aiTemplate:
      "Draft a SAW intervention plan: functional assessment, modified-duty options, schedule-flex options, AT recommendations, supervisor coaching, and a return-to-baseline timeline with check-in milestones.",
  },
  {
    id: "customized-job-carving",
    title: "Customized Job Carving & Restructuring",
    category: "workforce-consulting",
    description:
      "Discovery-based job carving — restructure existing duties or create a custom role from unmet employer needs.",
    defaultPriceCents: F(195_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "30-day engagement",
    aiTemplate:
      "Draft a customized job carving proposal: Discovery profile inputs, unmet employer needs identified, the carved task list with productivity assumptions, supervisor + co-worker impact analysis, and a 60-day stabilization plan.",
  },

  // ─── CATEGORY C · EMPLOYMENT & PLACEMENT PARTNER SERVICES ──────────
  // Shared between Employment Partners and Counselors. Partners can
  // request, counselors can co-request, both share the deliverable.
  {
    id: "labor-market-detail-sourcing",
    title: "Labor Market Detail & Targeted Sourcing",
    category: "partner-coordination",
    description:
      "Hyper-local labor market sweep with named-employer targeting and warm-intro queue building.",
    defaultPriceCents: F(160_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "10 business days",
    aiTemplate:
      "Draft a labor-market-detail report: target SOC codes, employer short-list with hiring signals, contact strategy per employer, openings density forecast, and a 30-day warm-intro queue with assigned owners.",
  },
  {
    id: "co-case-management",
    title: "Co-Case Management & Tripartite Service Coordination",
    category: "partner-coordination",
    description:
      "Three-way case coordination between counselor, partner, and client — shared milestones, decision log, weekly cadence.",
    defaultPriceCents: F(125_000),
    priceUnit: "monthly",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "Continuous",
    aiTemplate:
      "Draft a tripartite case-coordination charter: roles and responsibilities, shared milestones with owners, decision-rights matrix, weekly meeting cadence, escalation path, and the criteria for closing the co-managed engagement.",
  },
  {
    id: "onsite-job-coaching-coordination",
    title: "On-Site Job Coaching Coordination",
    category: "partner-coordination",
    description:
      "Coordination of on-site job coaching across multiple placements — schedule, fade-out plan, natural-supports build-up.",
    defaultPriceCents: F(180_000),
    priceUnit: "monthly",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: true,
    turnaround: "Continuous",
    aiTemplate:
      "Draft an on-site job-coaching coordination plan: coaching hours per placement, fade-out schedule, natural-supports development targets, supervisor handoff criteria, and weekly metrics tracked.",
  },
  {
    id: "subcontractor-compliance-tracking",
    title: "Subcontractor Compliance Tracking",
    category: "partner-coordination",
    description:
      "Tracking of subcontractor / partner agency deliverable compliance against scope, timeline, and outcome measures.",
    defaultPriceCents: F(140_000),
    priceUnit: "quarterly",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "Quarterly",
    aiTemplate:
      "Draft a subcontractor compliance report: scope-vs-delivery variance per subcontractor, on-time rate, outcome quality sampling, corrective-action items, and a recommendation on renewal vs replacement for next period.",
  },
  {
    id: "customized-recruitment-framework",
    title: "Customized Recruitment Framework",
    category: "partner-coordination",
    description:
      "Inclusive recruitment framework for a partner employer — sourcing channels, application accommodations, structured interview design.",
    defaultPriceCents: F(165_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor"],
    visibleToClient: false,
    turnaround: "21 business days",
    aiTemplate:
      "Draft a customized recruitment framework: inclusive sourcing channel list (DOBE registries, RSA-211 EN list, community colleges), application accommodations, structured interview rubric, hiring committee composition, and a 90-day rollout plan with metrics.",
  },

  // ─── SPECIALIZED YOUTH / EVALUATION / CLIENT SERVICES BATCH ────────
  // WIOA § 113 Pre-ETS, comprehensive evaluation instruments, and the
  // client-facing modification/AAC/reentry navigation services.

  {
    id: "pre-ets-cohort-training",
    title: "Pre-ETS Cohort Training",
    category: "youth-services",
    description:
      "Delivers the 5 required WIOA Pre-ETS components: job exploration, work-based learning, post-secondary counseling, workplace readiness, and self-advocacy — as a structured cohort.",
    defaultPriceCents: F(180_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "6-week cohort",
    aiTemplate:
      "Draft a Pre-ETS cohort curriculum covering all five WIOA § 113 required components (job exploration, work-based learning, post-secondary counseling, workplace readiness, self-advocacy). Include weekly session objectives, work-based learning placements, RSA-911 data-capture points, and a graduation portfolio each youth builds.",
  },
  {
    id: "post-secondary-education-planning",
    title: "Post-Secondary Education Planning",
    category: "youth-services",
    description:
      "Assists transitioning youth with college selection, disability services office (DSO) registration, and academic accommodation planning.",
    defaultPriceCents: F(95_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "10 business days",
    aiTemplate:
      "Draft a post-secondary education plan: candidate schools matched to interests/aptitudes, DSO registration checklist per school, documentation each DSO requires (IEP, 504, psycho-ed evaluation), an academic accommodation menu with citation to Section 504 of the Rehabilitation Act, and a financial-aid + PASS-plan strategy.",
  },
  {
    id: "comprehensive-vocational-evaluation",
    title: "Comprehensive Vocational Evaluation (CVE)",
    category: "data-evaluation",
    description:
      "A battery of psychometric, aptitude, and interest assessments to determine baseline vocational functioning and goal feasibility.",
    defaultPriceCents: F(325_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "15-20 business days",
    aiTemplate:
      "Draft a Comprehensive Vocational Evaluation report: cognitive index (WAIS-IV), academic achievement (WRAT), aptitudes (DAT), interests (SII/SDS/CareerScope), functional capacity (FCE-lite), and situational observations. Synthesize into a summary of vocational strengths, limitations, recommended SOC families, and IPE-ready goal statements.",
  },
  {
    id: "situational-community-based-assessment",
    title: "Situational Assessment / Community-Based Assessment (CBA)",
    category: "data-evaluation",
    description:
      "Observational assessment of a client performing work duties in a competitive environment to measure soft skills and stamina.",
    defaultPriceCents: F(155_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "5-7 business days (per placement)",
    aiTemplate:
      "Draft a Situational / Community-Based Assessment report: worksite context, observed tasks and productivity ratings against competitive pace, soft-skills observations (communication, feedback response, teamwork), stamina profile across the shift, supervisor debrief input, and recommendations for job-match parameters and natural supports.",
  },
  {
    id: "fce-coordination-review",
    title: "Functional Capacity Evaluation (FCE) Coordination & Review",
    category: "data-evaluation",
    description:
      "Coordination with physical therapists to execute an FCE, followed by a VR translation of physical limits into DOT job categories.",
    defaultPriceCents: F(210_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "10 business days after FCE completion",
    aiTemplate:
      "Draft an FCE Coordination & Review memo: PT/OT selection rationale, referral packet contents, FCE findings translated into DOT strength category (sedentary/light/medium/heavy), positional restrictions, cognitive demand implications, matched SOC families, and JAN-backed accommodations that expand the residual occupational set.",
  },
  {
    id: "self-employment-feasibility-study",
    title: "Self-Employment / Micro-Enterprise Feasibility Study",
    category: "workforce-consulting",
    description:
      "Evaluates a client's business concept and market viability, resulting in a formal VR-fundable business plan.",
    defaultPriceCents: F(285_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "20 business days",
    aiTemplate:
      "Draft a Self-Employment / Micro-Enterprise Feasibility Study: business-concept fit against client's RIASEC + skills + accommodation profile, local market analysis, revenue model, three-year projections, startup cost breakdown (with AT line-items), risk register with red flags, and a VR-ready business plan meeting state-agency self-employment plan requirements.",
  },
  {
    id: "home-vehicle-modification-coordination",
    title: "Home & Vehicle Modification Coordination",
    category: "ada-compliance",
    description:
      "Site surveys and vendor coordination for structural home modifications or adaptive driving equipment.",
    defaultPriceCents: F(225_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "21 business days",
    aiTemplate:
      "Draft a Home & Vehicle Modification Coordination plan: site survey findings, required modifications with itemized scope and cost estimates, adaptive-driving evaluator referral (or hand controls / left-foot accelerator / joystick recommendations), 2-3 vendor bids per line item, permit/insurance considerations, and a payment schedule the VR agency can authorize.",
  },
  {
    id: "aac-evaluation",
    title: "Augmentative and Alternative Communication (AAC) Evaluation",
    category: "client-services",
    description:
      "Assessment to identify and implement speech-generating devices and communication supports for clients with expressive-communication needs.",
    defaultPriceCents: F(165_000),
    priceUnit: "flat",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "10 business days",
    aiTemplate:
      "Draft an AAC Evaluation report: communication profile (receptive/expressive), device trial results across candidates (dedicated SGD vs iPad + Proloquo2Go vs low-tech PECS), operational and linguistic competencies, vocabulary customization plan, training hours needed, funding pathway (VR + insurance + Medicaid), and a fidelity check-in cadence.",
  },
  {
    id: "justice-involved-reentry-navigation",
    title: "Justice-Involved Reentry Navigation",
    category: "client-services",
    description:
      "Vocational counseling addressing the intersection of disability barriers and criminal-record barriers — record clearing, disclosure coaching, Ban-the-Box strategy.",
    defaultPriceCents: F(135_000),
    priceUnit: "monthly",
    availableTo: ["business", "partner", "vendor", "client"],
    visibleToClient: true,
    turnaround: "Continuous (6-12 mo engagement)",
    aiTemplate:
      "Draft a Justice-Involved Reentry Navigation plan: criminal-history landscape (state expungement/sealing options), Ban-the-Box + Fair Chance jurisdiction map, disclosure script tuned to the target industry, WOTC + Federal Bonding Program eligibility, disability-related accommodations that intersect with parole conditions, and a 90-day placement + retention plan with community-based supports.",
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
  "client-services": "🤝 Client-Facing Ancillary Services",
  "partner-coordination": "🔗 Employment Partner Coordination",
  "youth-services": "🎓 Youth & Transition Services (Pre-ETS)",
};
