"use client";

// Embedded assessment tools — one catalog mapping every Service Catalog
// item to a set of assessment tools. Each tool ships with a 5-7 item
// instrument and an AI-interpretation prompt the counselor uses to
// draft recommendations. Items are validated, scorable, and exportable.
//
// Storage of completed assessments is strictly case-isolated — see
// lib/case-assessments.ts. No global assessment list exists.

export type Audience = "counselor" | "client" | "business" | "vendor" | "partner";

// Specialized counselor archetypes the platform supports. Tools can be
// tagged with one or more so the launcher can group by counselor role
// without changing serviceIds (which already drives embedded-by-service
// discovery on the existing UI).
export type CounselorRole =
  | "career"
  | "return-to-work"
  | "forensic"
  | "job-development"
  | "mental-health"
  | "cve";

export const COUNSELOR_ROLE_LABELS: Record<CounselorRole, string> = {
  career: "Career Counselors",
  "return-to-work": "Return-to-Work Coordinators",
  forensic: "Forensic Rehabilitation Specialists",
  "job-development": "Job Development & Placement Specialists",
  "mental-health": "Mental Health & Psychiatric Rehabilitation Counselors",
  cve: "Certified Vocational Evaluation Specialists (CVE)",
};

export type ItemKind = "likert5" | "yesno" | "multiselect" | "text" | "scale10";

export interface AssessmentItem {
  id: string;
  prompt: string;
  kind: ItemKind;
  options?: string[]; // for multiselect
}

export interface AssessmentTool {
  id: string;                // stable slug
  title: string;
  description: string;
  serviceIds: string[];      // catalog services this tool is embedded in
  audiences: Audience[];     // who can complete it
  // Optional — specialized counselor archetype(s) this tool belongs to.
  // A single tool can serve multiple roles (e.g., TSA is used by both
  // Return-to-Work and Forensic counselors).
  counselorRoles?: CounselorRole[];
  items: AssessmentItem[];
  aiInterpretationTemplate: string;
}

// ─── Reusable item templates ──────────────────────────────────────────

const LIKERT_5 = [
  "Strongly disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly agree",
];

function readinessItems(prefix: string): AssessmentItem[] {
  return [
    { id: `${prefix}-1`, prompt: "The person/team understands their role and expectations.", kind: "likert5" },
    { id: `${prefix}-2`, prompt: "Resources and supports needed for success are available.", kind: "likert5" },
    { id: `${prefix}-3`, prompt: "Clear written documentation guides the activity.", kind: "likert5" },
    { id: `${prefix}-4`, prompt: "There is leadership/supervisor buy-in.", kind: "likert5" },
    { id: `${prefix}-5`, prompt: "Progress is measurable and tracked.", kind: "likert5" },
  ];
}

function knowledgeItems(prefix: string, topic: string): AssessmentItem[] {
  return [
    { id: `${prefix}-1`, prompt: `I understand the core requirements of ${topic}.`, kind: "likert5" },
    { id: `${prefix}-2`, prompt: `I can identify scenarios where ${topic} applies.`, kind: "likert5" },
    { id: `${prefix}-3`, prompt: `I know who to escalate questions about ${topic} to.`, kind: "likert5" },
    { id: `${prefix}-4`, prompt: `I can document ${topic}-related decisions properly.`, kind: "likert5" },
    { id: `${prefix}-5`, prompt: `I would feel confident applying ${topic} guidance tomorrow.`, kind: "likert5" },
  ];
}

function functionalChecklist(prefix: string): AssessmentItem[] {
  return [
    { id: `${prefix}-1`, prompt: "Can lift and carry 10 pounds.", kind: "yesno" },
    { id: `${prefix}-2`, prompt: "Can stand for 30 continuous minutes.", kind: "yesno" },
    { id: `${prefix}-3`, prompt: "Can sustain visual focus for 30 minutes.", kind: "yesno" },
    { id: `${prefix}-4`, prompt: "Can hold a back-and-forth conversation with a stranger.", kind: "yesno" },
    { id: `${prefix}-5`, prompt: "Can manage own transportation to the worksite.", kind: "yesno" },
    { id: `${prefix}-6`, prompt: "Can read at 8th-grade level for instructions.", kind: "yesno" },
    { id: `${prefix}-7`, prompt: "Can manage a 5-step task sequence without reminders.", kind: "yesno" },
  ];
}

function discoveryNarrative(prefix: string): AssessmentItem[] {
  return [
    { id: `${prefix}-1`, prompt: "What three activities does the person lose track of time doing?", kind: "text" },
    { id: `${prefix}-2`, prompt: "When have they solved a problem that no one else could solve?", kind: "text" },
    { id: `${prefix}-3`, prompt: "Where do they go when they want to feel competent?", kind: "text" },
    { id: `${prefix}-4`, prompt: "What environments drain them quickly?", kind: "text" },
    { id: `${prefix}-5`, prompt: "Who in their life sees them at their best — and why?", kind: "text" },
  ];
}

function climateItems(prefix: string): AssessmentItem[] {
  return [
    { id: `${prefix}-1`, prompt: "Leadership consistently models inclusive behavior.", kind: "likert5" },
    { id: `${prefix}-2`, prompt: "Employees with disabilities feel they can disclose without retaliation.", kind: "likert5" },
    { id: `${prefix}-3`, prompt: "Accommodations are seen as routine, not special treatment.", kind: "likert5" },
    { id: `${prefix}-4`, prompt: "Promotion criteria are transparent and accessible.", kind: "likert5" },
    { id: `${prefix}-5`, prompt: "Concerns about discrimination are taken seriously and investigated.", kind: "likert5" },
  ];
}

function ergonomicsChecklist(prefix: string): AssessmentItem[] {
  return [
    { id: `${prefix}-1`, prompt: "Monitor top is at or below eye level.", kind: "yesno" },
    { id: `${prefix}-2`, prompt: "Keyboard and mouse are at elbow height.", kind: "yesno" },
    { id: `${prefix}-3`, prompt: "Chair supports the lumbar spine.", kind: "yesno" },
    { id: `${prefix}-4`, prompt: "Feet rest flat on the floor (or footrest).", kind: "yesno" },
    { id: `${prefix}-5`, prompt: "Workstation has appropriate task lighting.", kind: "yesno" },
    { id: `${prefix}-6`, prompt: "Cable management eliminates trip hazards.", kind: "yesno" },
  ];
}

function complianceItems(prefix: string, area: string): AssessmentItem[] {
  return [
    { id: `${prefix}-1`, prompt: `Written ${area} policy exists and is current.`, kind: "yesno" },
    { id: `${prefix}-2`, prompt: `All staff have been trained on ${area} within the last 12 months.`, kind: "yesno" },
    { id: `${prefix}-3`, prompt: `Decisions related to ${area} are documented in the case file.`, kind: "yesno" },
    { id: `${prefix}-4`, prompt: `${area} workflow has measurable SLAs.`, kind: "yesno" },
    { id: `${prefix}-5`, prompt: `Complaints related to ${area} are tracked to closure.`, kind: "yesno" },
  ];
}

function jobMatchItems(prefix: string): AssessmentItem[] {
  return [
    { id: `${prefix}-1`, prompt: "Candidate's RIASEC profile aligns with the job.", kind: "likert5" },
    { id: `${prefix}-2`, prompt: "Transferable skills cover essential functions.", kind: "likert5" },
    { id: `${prefix}-3`, prompt: "Physical demands are within candidate's capacity.", kind: "likert5" },
    { id: `${prefix}-4`, prompt: "Schedule and commute work for the candidate.", kind: "likert5" },
    { id: `${prefix}-5`, prompt: "Required accommodations are reasonable and ready.", kind: "likert5" },
  ];
}

function softSkillsItems(prefix: string): AssessmentItem[] {
  return [
    { id: `${prefix}-1`, prompt: "Communicates clearly with supervisors.", kind: "likert5" },
    { id: `${prefix}-2`, prompt: "Manages time and prioritizes tasks.", kind: "likert5" },
    { id: `${prefix}-3`, prompt: "Adapts to changes in routine.", kind: "likert5" },
    { id: `${prefix}-4`, prompt: "Resolves conflict professionally.", kind: "likert5" },
    { id: `${prefix}-5`, prompt: "Receives and acts on feedback.", kind: "likert5" },
  ];
}

// ─── Catalog ──────────────────────────────────────────────────────────

export const ASSESSMENT_TOOLS: AssessmentTool[] = [
  // 🧭 EMPLOYMENT & WORKFORCE CONSULTING ────────────────────────────
  {
    id: "job-match-assessment",
    title: "Job Match Assessment",
    description: "Five-factor match score across interest, skills, capacity, schedule, and accommodation readiness.",
    serviceIds: ["job-development-consulting"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: jobMatchItems("jma"),
    aiInterpretationTemplate: "Score the match across five dimensions. Identify the lowest-rated factor and propose one mitigation. Conclude with a recommendation: proceed, modify, or pause.",
  },
  {
    id: "essential-functions-alignment",
    title: "Essential Functions Alignment Tool",
    description: "Maps the role's essential functions to candidate capacity.",
    serviceIds: ["job-development-consulting"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "efa-1", prompt: "All essential functions are documented.", kind: "yesno" },
      { id: "efa-2", prompt: "Candidate can perform each essential function with reasonable accommodation.", kind: "yesno" },
      { id: "efa-3", prompt: "Marginal functions have been separated out.", kind: "yesno" },
      { id: "efa-4", prompt: "Production standards are met.", kind: "yesno" },
      { id: "efa-5", prompt: "Safety requirements are met.", kind: "yesno" },
    ],
    aiInterpretationTemplate: "Identify any essential function the candidate cannot meet with reasonable accommodation. Recommend job restructuring or alternative placement if applicable.",
  },
  {
    id: "workplace-capacity",
    title: "Workplace Capacity Assessment",
    description: "Functional capacity checklist (lift, stand, focus, social, transit).",
    serviceIds: ["job-development-consulting"],
    audiences: ["counselor", "client"],
    items: functionalChecklist("wca"),
    aiInterpretationTemplate: "Summarize the candidate's functional capacity profile. Highlight any limitations that affect the job under consideration and propose accommodations from JAN.",
  },
  {
    id: "discovery-assessment",
    title: "Discovery Assessment",
    description: "Strengths-based Discovery interview prompts.",
    serviceIds: ["supported-employment-planning", "customized-employment-consulting"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: discoveryNarrative("discovery"),
    aiInterpretationTemplate: "Synthesize a Discovery summary identifying the person's strongest contribution conditions, energy patterns, and the carved-task hypotheses worth testing in employer negotiation.",
  },
  {
    id: "natural-supports-mapping",
    title: "Natural Supports Mapping",
    description: "Inventory of natural workplace supports.",
    serviceIds: ["supported-employment-planning"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "nsm-1", prompt: "Identify a peer mentor candidate at the worksite.", kind: "text" },
      { id: "nsm-2", prompt: "Identify a supervisor willing to coach.", kind: "text" },
      { id: "nsm-3", prompt: "Identify a family/friend who supports work life.", kind: "text" },
      { id: "nsm-4", prompt: "Identify a community resource (transit, food, childcare).", kind: "text" },
      { id: "nsm-5", prompt: "Note where natural supports are missing.", kind: "text" },
    ],
    aiInterpretationTemplate: "Map the natural support network in two paragraphs. Identify gaps where paid supports are still required, and a fading plan toward natural-only supports over 6 months.",
  },
  {
    id: "stabilization-readiness",
    title: "Stabilization Readiness Checklist",
    description: "30/60/90-day stabilization indicators.",
    serviceIds: ["supported-employment-planning"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("sr"),
    aiInterpretationTemplate: "Determine whether the placement is ready for stabilization closure. Cite the weakest readiness factor and the action needed before tapering coach hours.",
  },
  {
    id: "task-competency",
    title: "Task Competency Assessment",
    description: "Task-by-task competency rating.",
    serviceIds: ["job-coaching-services"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "tc-1", prompt: "Performs task independently (no prompts).", kind: "likert5" },
      { id: "tc-2", prompt: "Meets quality standard on first attempt.", kind: "likert5" },
      { id: "tc-3", prompt: "Maintains pace expected for the role.", kind: "likert5" },
      { id: "tc-4", prompt: "Recovers from errors without coach intervention.", kind: "likert5" },
      { id: "tc-5", prompt: "Transfers skill across shifts and supervisors.", kind: "likert5" },
    ],
    aiInterpretationTemplate: "Identify the lowest-rated competency and propose a coaching intervention. Estimate hours needed to bring it to independent performance.",
  },
  {
    id: "work-behavior-observation",
    title: "Work Behavior Observation Tool",
    description: "Structured observation of work behaviors.",
    serviceIds: ["job-coaching-services"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: softSkillsItems("wbo"),
    aiInterpretationTemplate: "Summarize work behaviors observed. Flag any behavior that puts the placement at retention risk and suggest coaching focus.",
  },
  {
    id: "skill-acquisition-tracking",
    title: "Skill Acquisition Tracking",
    description: "Tracks acquisition rate over time.",
    serviceIds: ["job-coaching-services"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "sat-1", prompt: "Number of trials to mastery on the target skill.", kind: "scale10" },
      { id: "sat-2", prompt: "Independence at week 2.", kind: "likert5" },
      { id: "sat-3", prompt: "Independence at week 4.", kind: "likert5" },
      { id: "sat-4", prompt: "Generalization across days/contexts.", kind: "likert5" },
      { id: "sat-5", prompt: "Maintained performance after fading prompts.", kind: "likert5" },
    ],
    aiInterpretationTemplate: "Plot acquisition trajectory in narrative form. Identify when fading is appropriate. Flag stalled skills needing technique change.",
  },
  {
    id: "task-analysis-assessment",
    title: "Task Analysis Assessment",
    description: "Sequential task analysis with frequency/intensity rating.",
    serviceIds: ["job-restructuring-consulting", "job-task-analysis"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "taa-1", prompt: "Most-frequent task in this role.", kind: "text" },
      { id: "taa-2", prompt: "Highest-skill task in this role.", kind: "text" },
      { id: "taa-3", prompt: "Highest-physical-demand task.", kind: "text" },
      { id: "taa-4", prompt: "Task that requires the most cognitive load.", kind: "text" },
      { id: "taa-5", prompt: "Task that adds least value (carving candidate).", kind: "text" },
    ],
    aiInterpretationTemplate: "Identify which tasks should remain core to the role, which should be carved out, and which should be restructured. Recommend a carved-role hypothesis with one paragraph of rationale.",
  },
  {
    id: "barrier-identification",
    title: "Barrier Identification Tool",
    description: "Enumerates workplace barriers blocking retention.",
    serviceIds: ["job-restructuring-consulting"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "bi-1", prompt: "Physical environment poses a barrier (noise, layout, light).", kind: "likert5" },
      { id: "bi-2", prompt: "Communication style creates barriers.", kind: "likert5" },
      { id: "bi-3", prompt: "Schedule does not fit the employee's life constraints.", kind: "likert5" },
      { id: "bi-4", prompt: "Pace/quota demand exceeds sustainable capacity.", kind: "likert5" },
      { id: "bi-5", prompt: "Required tools or AT are not in place.", kind: "likert5" },
    ],
    aiInterpretationTemplate: "Rank barriers from highest to lowest impact. Propose two specific interventions per high-impact barrier, scored by likelihood of acceptance by the employer.",
  },
  {
    id: "modification-feasibility",
    title: "Job Modification Feasibility Review",
    description: "Reviews proposed modifications for feasibility.",
    serviceIds: ["job-restructuring-consulting"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("mf"),
    aiInterpretationTemplate: "Score each proposed modification on cost, operational fit, and disruption. Recommend the modification set with best expected outcome.",
  },
  {
    id: "soft-skills-assessment",
    title: "Soft Skills Assessment",
    description: "Pre-employment soft skill inventory.",
    serviceIds: ["workplace-readiness-training"],
    audiences: ["counselor", "client"],
    items: softSkillsItems("ssa"),
    aiInterpretationTemplate: "Score the candidate on each soft-skill dimension. Recommend training modules for the lowest-rated areas.",
  },
  {
    id: "work-habits-inventory",
    title: "Work Habits Inventory",
    description: "Inventory of work habits and routines.",
    serviceIds: ["workplace-readiness-training"],
    audiences: ["counselor", "client"],
    items: [
      { id: "whi-1", prompt: "Arrives on time consistently.", kind: "likert5" },
      { id: "whi-2", prompt: "Maintains personal hygiene and dress appropriate to setting.", kind: "likert5" },
      { id: "whi-3", prompt: "Plans tasks before starting work.", kind: "likert5" },
      { id: "whi-4", prompt: "Completes tasks before moving on.", kind: "likert5" },
      { id: "whi-5", prompt: "Asks for help appropriately.", kind: "likert5" },
    ],
    aiInterpretationTemplate: "Highlight the strongest habit (anchor for confidence-building) and the weakest (target for skill-building). Suggest workplace-readiness modules.",
  },
  {
    id: "pre-employment-readiness",
    title: "Pre-Employment Readiness Scale",
    description: "Overall readiness score.",
    serviceIds: ["workplace-readiness-training"],
    audiences: ["counselor", "client"],
    items: readinessItems("per"),
    aiInterpretationTemplate: "Provide a composite readiness score (0-100). Recommend whether the client is ready to interview, ready with supports, or needs additional training.",
  },
  {
    id: "discovery-profile",
    title: "Discovery Profile Assessment",
    description: "Personal interest, energy, and pattern profile.",
    serviceIds: ["customized-employment-consulting"],
    audiences: ["counselor", "client", "partner"],
    items: discoveryNarrative("dp"),
    aiInterpretationTemplate: "Synthesize a Discovery profile in three paragraphs covering interest, energy management, and ideal environment. End with three carved-role hypotheses.",
  },
  {
    id: "vocational-themes",
    title: "Vocational Themes Identification",
    description: "Identifies vocational themes from Discovery data.",
    serviceIds: ["customized-employment-consulting"],
    audiences: ["counselor"],
    items: [
      { id: "vt-1", prompt: "Theme #1 (what the person is repeatedly drawn to).", kind: "text" },
      { id: "vt-2", prompt: "Theme #2.", kind: "text" },
      { id: "vt-3", prompt: "Theme #3.", kind: "text" },
      { id: "vt-4", prompt: "Settings where the themes are most observable.", kind: "text" },
      { id: "vt-5", prompt: "Tasks that map to each theme.", kind: "text" },
    ],
    aiInterpretationTemplate: "Map each theme to a list of employer types and roles where that theme is a key contribution. Recommend employer-negotiation opening offers.",
  },
  {
    id: "job-carving-assessment",
    title: "Strengths-Based Job Carving Assessment",
    description: "Identifies tasks to carve into a new role.",
    serviceIds: ["customized-employment-consulting"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "jc-1", prompt: "Recurring task at the employer with no owner.", kind: "text" },
      { id: "jc-2", prompt: "Task that other workers dislike but candidate could excel at.", kind: "text" },
      { id: "jc-3", prompt: "Task currently squeezed in around higher-paid work.", kind: "text" },
      { id: "jc-4", prompt: "Task candidate already does informally.", kind: "text" },
      { id: "jc-5", prompt: "Hours per week the carved role can realistically fill.", kind: "scale10" },
    ],
    aiInterpretationTemplate: "Propose a carved role with title, task list, hours, and reporting line. Estimate value the employer captures (hours freed up for top performers, error reduction, revenue captured).",
  },
  {
    id: "environmental-fit",
    title: "Environmental Fit Assessment",
    description: "Sensory, social, and physical fit of the worksite.",
    serviceIds: ["customized-employment-consulting"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "ef-1", prompt: "Noise level is tolerable for the candidate.", kind: "likert5" },
      { id: "ef-2", prompt: "Lighting and visual environment work.", kind: "likert5" },
      { id: "ef-3", prompt: "Social demands fit the candidate's preferences.", kind: "likert5" },
      { id: "ef-4", prompt: "Physical space accommodates assistive technology.", kind: "likert5" },
      { id: "ef-5", prompt: "Break and quiet spaces are accessible.", kind: "likert5" },
    ],
    aiInterpretationTemplate: "Flag any environment factor that scored ≤2 and propose a worksite customization. Note any factor that scored 4-5 as a confidence-building anchor.",
  },

  // 🏢 ADA / 504 / EEO COMPLIANCE & ACCOMMODATION ──────────────────
  {
    id: "accommodation-needs",
    title: "Accommodation Needs Assessment",
    description: "Identifies needed accommodations.",
    serviceIds: ["accommodation-inquiry-consulting", "reasonable-accommodation-plan"],
    audiences: ["counselor", "client"],
    items: [
      { id: "an-1", prompt: "Describe the workplace problem in your own words.", kind: "text" },
      { id: "an-2", prompt: "How long has the problem been occurring?", kind: "text" },
      { id: "an-3", prompt: "What helps you on better days?", kind: "text" },
      { id: "an-4", prompt: "What have you already tried?", kind: "text" },
      { id: "an-5", prompt: "What outcome would feel like success?", kind: "text" },
    ],
    aiInterpretationTemplate: "Translate the worker's description into ADA-grade accommodation request language. Propose zero-cost and paid options with JAN references.",
  },
  {
    id: "functional-limitations-questionnaire",
    title: "Functional Limitations Questionnaire",
    description: "Functional limitations across major life activities.",
    serviceIds: ["accommodation-inquiry-consulting"],
    audiences: ["counselor", "client"],
    items: functionalChecklist("flq"),
    aiInterpretationTemplate: "Translate functional limitations into specific workplace accommodations citing JAN limitation→accommodation pairings.",
  },
  {
    id: "interactive-process-documentation",
    title: "Interactive Process Documentation Tool",
    description: "Step-by-step interactive process log.",
    serviceIds: ["accommodation-inquiry-consulting"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("ipd", "the interactive process"),
    aiInterpretationTemplate: "Identify any step the employer skipped. Recommend documentation language to close gaps before the request closes.",
  },
  {
    id: "essential-functions-assessment",
    title: "Essential Functions Assessment",
    description: "Distinguishes essential from marginal functions.",
    serviceIds: ["job-task-analysis"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "efa2-1", prompt: "Function is performed by the position regularly.", kind: "yesno" },
      { id: "efa2-2", prompt: "Position exists specifically to perform this function.", kind: "yesno" },
      { id: "efa2-3", prompt: "Function requires specialized expertise.", kind: "yesno" },
      { id: "efa2-4", prompt: "Function cannot be reassigned without affecting team output.", kind: "yesno" },
      { id: "efa2-5", prompt: "Function is documented in the written job description.", kind: "yesno" },
    ],
    aiInterpretationTemplate: "Classify each function as essential or marginal. Flag any marginal function currently treated as essential.",
  },
  {
    id: "physical-demands-checklist",
    title: "Physical Demands Checklist",
    description: "O*NET-mapped physical demand inventory.",
    serviceIds: ["job-task-analysis"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "pdc-1", prompt: "Lifting > 25 lbs is required.", kind: "yesno" },
      { id: "pdc-2", prompt: "Standing > 4 hours per shift is required.", kind: "yesno" },
      { id: "pdc-3", prompt: "Reaching overhead is required.", kind: "yesno" },
      { id: "pdc-4", prompt: "Fine motor work (typing, assembly) is required.", kind: "yesno" },
      { id: "pdc-5", prompt: "Climbing or balancing is required.", kind: "yesno" },
    ],
    aiInterpretationTemplate: "Summarize the physical demand profile against O*NET 4.A.3. Flag any demand that may unnecessarily exclude candidates.",
  },
  {
    id: "cognitive-demands-checklist",
    title: "Cognitive Demands Checklist",
    description: "Cognitive demand inventory.",
    serviceIds: ["job-task-analysis"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "cdc-1", prompt: "Sustained attention > 30 minutes required.", kind: "yesno" },
      { id: "cdc-2", prompt: "Multi-step instructions held in memory.", kind: "yesno" },
      { id: "cdc-3", prompt: "Rapid task-switching required.", kind: "yesno" },
      { id: "cdc-4", prompt: "Complex written comprehension required.", kind: "yesno" },
      { id: "cdc-5", prompt: "Mathematical reasoning beyond basic arithmetic.", kind: "yesno" },
    ],
    aiInterpretationTemplate: "Summarize cognitive demands. Flag combinations likely to exclude workers with cognitive differences without justification.",
  },
  {
    id: "accommodation-options-matrix",
    title: "Accommodation Options Matrix",
    description: "Compares accommodation options on cost, fit, time.",
    serviceIds: ["reasonable-accommodation-plan"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "aom-1", prompt: "Option scores low on cost and high on fit.", kind: "yesno" },
      { id: "aom-2", prompt: "Option requires manager sign-off only.", kind: "yesno" },
      { id: "aom-3", prompt: "Option resolves the workplace problem within 2 weeks.", kind: "yesno" },
      { id: "aom-4", prompt: "Option preserves all essential functions.", kind: "yesno" },
      { id: "aom-5", prompt: "Option works in remote and in-office contexts.", kind: "yesno" },
    ],
    aiInterpretationTemplate: "Recommend the accommodation option with best total score. Note risks of the runners-up.",
  },
  {
    id: "at-needs",
    title: "Assistive Technology Needs Assessment",
    description: "Identifies AT needs for the work tasks.",
    serviceIds: ["reasonable-accommodation-plan"],
    audiences: ["counselor", "client", "vendor"],
    items: [
      { id: "atn-1", prompt: "Vision/screen-reader AT needed.", kind: "yesno" },
      { id: "atn-2", prompt: "Hearing/captioning AT needed.", kind: "yesno" },
      { id: "atn-3", prompt: "Motor/dictation AT needed.", kind: "yesno" },
      { id: "atn-4", prompt: "Cognitive/reminders AT needed.", kind: "yesno" },
      { id: "atn-5", prompt: "Communication-board / AAC needed.", kind: "yesno" },
    ],
    aiInterpretationTemplate: "Recommend specific AT products by name with current pricing band and JAN reference. Note vendor lead time.",
  },
  {
    id: "workflow-impact",
    title: "Workflow Impact Assessment",
    description: "Impact of accommodations on the team workflow.",
    serviceIds: ["reasonable-accommodation-plan"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("wi"),
    aiInterpretationTemplate: "Score net workflow impact. Identify mitigations to minimize disruption during the accommodation roll-in.",
  },
  {
    id: "modified-duty",
    title: "Modified Duty Assessment",
    description: "Defines modified duty options for return to work.",
    serviceIds: ["return-to-work-planning"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "md-1", prompt: "Identify a task within the role that is light duty.", kind: "text" },
      { id: "md-2", prompt: "Identify a task that can be temporarily reassigned.", kind: "text" },
      { id: "md-3", prompt: "Identify a task that should be removed until clearance.", kind: "text" },
      { id: "md-4", prompt: "Maximum daily hours during ramp-up.", kind: "scale10" },
      { id: "md-5", prompt: "Anticipated weeks to full duty.", kind: "scale10" },
    ],
    aiInterpretationTemplate: "Draft a modified-duty plan with phased hours, modified task list, and weekly check-in cadence.",
  },
  {
    id: "medical-to-work-transition",
    title: "Medical-to-Work Transition Tool",
    description: "Coordinates clinical, employer, and employee.",
    serviceIds: ["return-to-work-planning"],
    audiences: ["counselor"],
    items: readinessItems("mwt"),
    aiInterpretationTemplate: "Identify any party not yet aligned. Recommend a coordination meeting agenda.",
  },
  {
    id: "work-capacity-evaluation",
    title: "Work Capacity Evaluation",
    description: "Estimates current work capacity by domain.",
    serviceIds: ["return-to-work-planning"],
    audiences: ["counselor", "client", "vendor"],
    items: functionalChecklist("wce"),
    aiInterpretationTemplate: "Summarize the worker's current capacity envelope. Match it to a target SOC code if available.",
  },
  {
    id: "home-office-ergonomics",
    title: "Home Office Ergonomics Assessment",
    description: "Home-office ergonomic safety review.",
    serviceIds: ["remote-work-safety"],
    audiences: ["counselor", "client", "business", "partner", "vendor"],
    items: ergonomicsChecklist("hoe"),
    counselorRoles: ["return-to-work"],
    aiInterpretationTemplate: "Identify ergonomic violations. Recommend equipment changes with cost estimates.",
  },
  {
    id: "remote-ada-compliance",
    title: "Remote Work ADA Compliance Checklist",
    description: "Validates remote-work setup against ADA standards.",
    serviceIds: ["remote-work-safety"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("rac", "remote-work ADA"),
    aiInterpretationTemplate: "Summarize compliance posture. Recommend three immediate fixes for non-compliant items.",
  },
  {
    id: "environmental-safety-review",
    title: "Environmental Safety Review",
    description: "Worksite safety inventory.",
    serviceIds: ["remote-work-safety"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: ergonomicsChecklist("esr"),
    aiInterpretationTemplate: "Flag any safety issue with potential to cause injury within 30 days. Prioritize fixes by severity.",
  },
  {
    id: "hr-accessibility-audit",
    title: "HR Accessibility Audit Tool",
    description: "Audits HR workflows for accessibility.",
    serviceIds: ["accessibility-workflow-audit"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("hra", "HR accessibility"),
    aiInterpretationTemplate: "Report compliance gaps in the HR workflow. Provide a prioritized remediation backlog.",
  },
  {
    id: "onboarding-accessibility",
    title: "Onboarding Accessibility Assessment",
    description: "Reviews onboarding for accessibility.",
    serviceIds: ["accessibility-workflow-audit"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("oa", "onboarding accessibility"),
    aiInterpretationTemplate: "Identify barriers in onboarding. Recommend remediation steps in priority order.",
  },
  {
    id: "training-accessibility-review",
    title: "Training Accessibility Review",
    description: "Reviews training delivery for accessibility.",
    serviceIds: ["accessibility-workflow-audit"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("tar", "training accessibility"),
    aiInterpretationTemplate: "List inaccessible training components and propose remediation (captions, alt text, alternate formats).",
  },

  // 📊 WORKFORCE DATA, EVALUATION & FORENSIC ─────────────────────
  {
    id: "occupational-match",
    title: "Occupational Match Assessment",
    description: "Holland code / RIASEC alignment with target SOC.",
    serviceIds: ["labor-market-analysis"],
    audiences: ["counselor", "client"],
    items: jobMatchItems("om"),
    aiInterpretationTemplate: "Score the candidate-occupation match and recommend the three top SOCs by total fit.",
  },
  {
    id: "wage-comparison",
    title: "Wage Comparison Tool",
    description: "Compares candidate wage expectations to local market.",
    serviceIds: ["labor-market-analysis"],
    audiences: ["counselor"],
    items: [
      { id: "wc-1", prompt: "Candidate's minimum acceptable hourly wage.", kind: "scale10" },
      { id: "wc-2", prompt: "Local 25th-percentile wage for target SOC.", kind: "scale10" },
      { id: "wc-3", prompt: "Local median wage for target SOC.", kind: "scale10" },
      { id: "wc-4", prompt: "Local 75th-percentile wage for target SOC.", kind: "scale10" },
      { id: "wc-5", prompt: "Wage trajectory at this employer (year 1 → year 3).", kind: "text" },
    ],
    aiInterpretationTemplate: "Recommend a wage target consistent with local market and candidate's needs. Flag wage gap risks.",
  },
  {
    id: "local-market-viability",
    title: "Local Market Viability Score",
    description: "Estimates viable opening density.",
    serviceIds: ["labor-market-analysis"],
    audiences: ["counselor"],
    items: readinessItems("lmv"),
    aiInterpretationTemplate: "Score the local market for the target SOC. Recommend whether to broaden SOC search or geographic radius.",
  },
  {
    id: "skills-inventory",
    title: "Skills Inventory Assessment",
    description: "Catalogs skills from work, school, life experience.",
    serviceIds: ["transferable-skills-analysis"],
    audiences: ["counselor", "client"],
    items: [
      { id: "si-1", prompt: "Three skills the person demonstrably has.", kind: "text" },
      { id: "si-2", prompt: "Three skills the person is partway to mastering.", kind: "text" },
      { id: "si-3", prompt: "Three skills demonstrated outside paid work.", kind: "text" },
      { id: "si-4", prompt: "Three skills the person wants to develop.", kind: "text" },
      { id: "si-5", prompt: "Skill the person would teach others.", kind: "text" },
    ],
    aiInterpretationTemplate: "Map skills to O*NET skill IDs where possible. Note transferability across SOCs.",
  },
  {
    id: "transferability-matrix",
    title: "Transferability Matrix",
    description: "Skill-to-SOC transferability scoring.",
    serviceIds: ["transferable-skills-analysis"],
    audiences: ["counselor"],
    items: [
      { id: "tm-1", prompt: "Three target SOCs.", kind: "text" },
      { id: "tm-2", prompt: "For each, transferability score (1-10).", kind: "scale10" },
      { id: "tm-3", prompt: "Gap-bridging training required.", kind: "text" },
      { id: "tm-4", prompt: "Estimated time-to-employability.", kind: "text" },
      { id: "tm-5", prompt: "Wage outcome at each target.", kind: "text" },
    ],
    aiInterpretationTemplate: "Recommend the target with best balance of fit, training cost, and wage outcome.",
  },
  {
    id: "occupational-fit-score",
    title: "Occupational Fit Score",
    description: "Composite fit score.",
    serviceIds: ["transferable-skills-analysis"],
    audiences: ["counselor"],
    items: readinessItems("ofs"),
    aiInterpretationTemplate: "Provide a composite fit score and recommend an ordered list of target SOCs.",
  },
  {
    id: "employability-assessment",
    title: "Employability Assessment",
    description: "Forensic employability across functional domains.",
    serviceIds: ["forensic-vocational-evaluation"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("ea"),
    aiInterpretationTemplate: "Provide an employability opinion grounded in functional capacity, transferable skills, and labor market — Daubert-defensible.",
  },
  {
    id: "loss-of-earning-capacity",
    title: "Loss of Earning Capacity Tool",
    description: "Pre-injury vs residual earning capacity.",
    serviceIds: ["forensic-vocational-evaluation", "earning-capacity-assessment"],
    audiences: ["counselor", "business", "partner", "vendor"],
    counselorRoles: ["forensic"],
    items: [
      { id: "lec-1", prompt: "Pre-injury average weekly wage.", kind: "scale10" },
      { id: "lec-2", prompt: "Residual weekly capacity (estimate).", kind: "scale10" },
      { id: "lec-3", prompt: "Diminution percentage.", kind: "scale10" },
      { id: "lec-4", prompt: "Methodology used (RFC + LMA, jurisdiction schedule, Stewart).", kind: "text" },
      { id: "lec-5", prompt: "Confidence level (low/medium/high).", kind: "text" },
    ],
    aiInterpretationTemplate: "Write a Daubert-defensible earning capacity opinion. Cite methodology and confidence level.",
  },
  {
    id: "forensic-labor-market-review",
    title: "Forensic Labor Market Review",
    description: "Labor market review for litigation context.",
    serviceIds: ["forensic-vocational-evaluation", "labor-market-analysis"],
    audiences: ["counselor", "business", "partner", "vendor"],
    counselorRoles: ["forensic", "job-development"],
    items: readinessItems("flmr"),
    aiInterpretationTemplate: "Provide an LMA narrative grounded in BLS data with methodology notes. Make findings Rule 26 disclosure-ready.",
  },
  {
    id: "wage-projection",
    title: "Wage Projection Calculator",
    description: "Projects post-injury wage trajectory.",
    serviceIds: ["earning-capacity-assessment"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: [
      { id: "wp-1", prompt: "Starting wage (year 1).", kind: "scale10" },
      { id: "wp-2", prompt: "Expected raise % per year.", kind: "scale10" },
      { id: "wp-3", prompt: "Years of expected work life.", kind: "scale10" },
      { id: "wp-4", prompt: "Industry growth modifier.", kind: "text" },
      { id: "wp-5", prompt: "Confidence interval.", kind: "text" },
    ],
    aiInterpretationTemplate: "Produce a projected lifetime earnings figure with methodology and confidence interval.",
  },
  {
    id: "residual-employability",
    title: "Residual Employability Assessment",
    description: "Estimates residual employability post-injury.",
    serviceIds: ["earning-capacity-assessment"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("re"),
    aiInterpretationTemplate: "Score residual employability with target occupations and wage band.",
  },
  {
    id: "functional-capacity-impact",
    title: "Functional Capacity Impact Tool",
    description: "Translates FCE findings into job impact.",
    serviceIds: ["earning-capacity-assessment", "return-to-work-planning"],
    audiences: ["counselor", "business", "partner", "vendor"],
    counselorRoles: ["return-to-work", "forensic"],
    items: functionalChecklist("fci"),
    aiInterpretationTemplate: "Translate FCE limitations into specific job-level impacts and accommodations.",
  },
  {
    id: "quarterly-outcomes",
    title: "Quarterly Outcomes Assessment",
    description: "Quarter-over-quarter outcomes review.",
    serviceIds: ["workforce-outcomes-reporting"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("qo"),
    aiInterpretationTemplate: "Summarize quarter-over-quarter trends. Flag declining indicators with recommended actions.",
  },
  {
    id: "retention-metrics",
    title: "Retention Metrics Review",
    description: "30/60/90 retention indicators.",
    serviceIds: ["workforce-outcomes-reporting"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("rm"),
    aiInterpretationTemplate: "Score retention against benchmarks. Highlight any cohort at risk of attrition.",
  },
  {
    id: "accommodation-utilization",
    title: "Accommodation Utilization Analysis",
    description: "Analyzes accommodation usage and outcomes.",
    serviceIds: ["workforce-outcomes-reporting"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("au"),
    aiInterpretationTemplate: "Identify under-used or over-used accommodations and recommend reallocation.",
  },

  // 🧩 BUSINESS ENGAGEMENT & EMPLOYER PARTNERSHIP ─────────────────
  {
    id: "inclusion-maturity",
    title: "Inclusion Maturity Assessment",
    description: "Inclusion maturity scoring across five domains.",
    serviceIds: ["inclusive-hiring-strategy"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: climateItems("im"),
    aiInterpretationTemplate: "Score the organization on a 5-stage inclusion maturity model. Recommend next-stage actions.",
  },
  {
    id: "hiring-pipeline-accessibility",
    title: "Hiring Pipeline Accessibility Review",
    description: "Reviews the recruiting pipeline for accessibility.",
    serviceIds: ["inclusive-hiring-strategy"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("hpa", "hiring-pipeline accessibility"),
    aiInterpretationTemplate: "Identify points in the pipeline where candidates with disabilities drop off. Recommend fixes.",
  },
  {
    id: "recruitment-barriers",
    title: "Recruitment Barriers Assessment",
    description: "Identifies barriers in recruitment messaging and channels.",
    serviceIds: ["inclusive-hiring-strategy"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("rb"),
    aiInterpretationTemplate: "Identify language, channel, or screening barriers in recruitment. Propose specific fixes.",
  },
  {
    id: "retention-risk-index",
    title: "Retention Risk Index",
    description: "Per-employee retention risk score.",
    serviceIds: ["retention-risk-assessment"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("rri"),
    aiInterpretationTemplate: "Score retention risk per employee. Flag high-risk cases with mitigation plan.",
  },
  {
    id: "workplace-climate",
    title: "Workplace Climate Assessment",
    description: "Climate survey for inclusion.",
    serviceIds: ["retention-risk-assessment", "workplace-culture-inclusion"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: climateItems("wpc"),
    aiInterpretationTemplate: "Summarize climate findings. Highlight lowest-rated dimension as primary intervention target.",
  },
  {
    id: "accommodation-utilization-review",
    title: "Accommodation Utilization Review",
    description: "Reviews accommodation patterns vs need.",
    serviceIds: ["retention-risk-assessment"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("aur"),
    aiInterpretationTemplate: "Identify under-served disability categories. Recommend outreach and onboarding adjustments.",
  },
  {
    id: "inclusion-climate-survey",
    title: "Inclusion Climate Survey",
    description: "Anonymous inclusion climate survey.",
    serviceIds: ["workplace-culture-inclusion"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: climateItems("ics"),
    aiInterpretationTemplate: "Summarize the inclusion climate. Recommend specific interventions for the weakest dimensions.",
  },
  {
    id: "leadership-accessibility",
    title: "Leadership Accessibility Assessment",
    description: "Leadership behavior on accessibility.",
    serviceIds: ["workplace-culture-inclusion"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: climateItems("la"),
    aiInterpretationTemplate: "Score leadership signal-sending on accessibility. Recommend coaching topics.",
  },
  {
    id: "team-culture-diagnostic",
    title: "Team Culture Diagnostic",
    description: "Team-level culture diagnostic.",
    serviceIds: ["workplace-culture-inclusion"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: climateItems("tcd"),
    aiInterpretationTemplate: "Identify which team-level behaviors most impact inclusion. Recommend a manager-skill-build plan.",
  },
  {
    id: "employer-readiness",
    title: "Employer Readiness Assessment",
    description: "Readiness for VR partnership.",
    serviceIds: ["employer-partnership-development"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("er"),
    aiInterpretationTemplate: "Score the employer's readiness for VR partnership. Recommend the right entry-level engagement.",
  },
  {
    id: "partnership-capacity",
    title: "Partnership Capacity Review",
    description: "Capacity to absorb VR-referred candidates.",
    serviceIds: ["employer-partnership-development"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("pc"),
    aiInterpretationTemplate: "Estimate pipeline absorption capacity per quarter. Recommend partnership tier.",
  },
  {
    id: "supported-employment-fit",
    title: "Supported Employment Fit Assessment",
    description: "Fit for supported employment placements.",
    serviceIds: ["employer-partnership-development"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("sef"),
    aiInterpretationTemplate: "Determine whether the employer is a fit for supported employment. Note required staff training before referrals.",
  },

  // 🧠 TRAINING & PROFESSIONAL DEVELOPMENT ─────────────────────────
  {
    id: "disability-awareness-pre",
    title: "Disability Awareness Pre-Training Knowledge",
    description: "Pre-training baseline.",
    serviceIds: ["disability-awareness-training"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: knowledgeItems("dap", "disability awareness"),
    aiInterpretationTemplate: "Score baseline knowledge. Identify modules to emphasize during training.",
  },
  {
    id: "disability-awareness-post",
    title: "Disability Awareness Post-Training Competency",
    description: "Post-training competency check.",
    serviceIds: ["disability-awareness-training"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: knowledgeItems("dapt", "disability awareness"),
    aiInterpretationTemplate: "Compare to pre-training baseline. Identify gaps requiring follow-up.",
  },
  {
    id: "compliance-knowledge",
    title: "Compliance Knowledge Assessment",
    description: "ADA / 504 / EEO knowledge baseline.",
    serviceIds: ["ada-eeo-compliance-training"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: knowledgeItems("ck", "ADA / 504 / EEO"),
    aiInterpretationTemplate: "Score compliance knowledge. Flag gaps that pose litigation risk.",
  },
  {
    id: "policy-understanding-quiz",
    title: "Policy Understanding Quiz",
    description: "Tests understanding of org policy.",
    serviceIds: ["ada-eeo-compliance-training"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: knowledgeItems("pu", "the organization's accommodation policy"),
    aiInterpretationTemplate: "Identify which policy provisions are weakly understood. Recommend reinforcement training.",
  },
  {
    id: "supervisor-readiness",
    title: "Supervisor Readiness Assessment",
    description: "Supervisor readiness for accommodations work.",
    serviceIds: ["supervisor-accommodation-training"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("sup"),
    aiInterpretationTemplate: "Score supervisor readiness. Identify coaching topics that need 1:1 follow-up.",
  },
  {
    id: "accommodation-decision-making",
    title: "Accommodation Decision-Making Tool",
    description: "Tests scenarios in accommodation decisions.",
    serviceIds: ["supervisor-accommodation-training"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: knowledgeItems("adm", "accommodation decision-making"),
    aiInterpretationTemplate: "Identify scenarios the supervisor mis-handled and recommend remediation.",
  },
  {
    id: "at-familiarity",
    title: "AT Familiarity Assessment",
    description: "Baseline assistive-technology familiarity.",
    serviceIds: ["assistive-technology-training"],
    audiences: ["counselor", "client", "business", "partner", "vendor"],
    items: knowledgeItems("atf", "assistive technology"),
    aiInterpretationTemplate: "Score AT familiarity. Recommend hands-on demo focus areas.",
  },
  {
    id: "at-implementation-readiness",
    title: "AT Implementation Readiness Checklist",
    description: "Worksite readiness for AT rollout.",
    serviceIds: ["assistive-technology-training"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("atir"),
    aiInterpretationTemplate: "Identify worksite readiness gaps before AT roll-in. Recommend pre-rollout actions.",
  },
  {
    id: "trauma-informed-readiness",
    title: "Trauma-Informed Readiness Assessment",
    description: "Org readiness for trauma-informed practice.",
    serviceIds: ["trauma-informed-workplace-training"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("tir"),
    aiInterpretationTemplate: "Score trauma-informed readiness across the six principles (safety, trustworthiness, peer support, collaboration, empowerment, cultural humility). Recommend gaps.",
  },
  {
    id: "psychological-safety-climate",
    title: "Psychological Safety Climate Survey",
    description: "Psychological safety climate.",
    serviceIds: ["trauma-informed-workplace-training"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: climateItems("psc"),
    aiInterpretationTemplate: "Score psychological safety. Recommend leadership behaviors to strengthen.",
  },
  {
    id: "annual-accessibility-knowledge",
    title: "Annual Accessibility Knowledge Review",
    description: "Annual accessibility knowledge review.",
    serviceIds: ["annual-accessibility-training"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: knowledgeItems("aak", "accessibility"),
    aiInterpretationTemplate: "Compare year over year. Flag declining knowledge areas requiring refresher modules.",
  },
  {
    id: "accessibility-practice-audit",
    title: "Accessibility Practice Audit",
    description: "Audits observable accessibility practice.",
    serviceIds: ["annual-accessibility-training"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("apa", "accessibility practice"),
    aiInterpretationTemplate: "Identify gaps between policy and observed practice. Recommend corrective training.",
  },

  // 🗂️ DOCUMENTATION, POLICY & SYSTEMS ─────────────────────────────
  {
    id: "policy-gap",
    title: "Policy Gap Assessment",
    description: "Identifies policy gaps against statute and best practice.",
    serviceIds: ["policy-drafting-revision", "accessibility-policy-development"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("pg", "policy alignment"),
    aiInterpretationTemplate: "List policy provisions missing or outdated. Provide drafting language for each.",
  },
  {
    id: "compliance-alignment-review",
    title: "Compliance Alignment Review",
    description: "Reviews policy alignment with current law.",
    serviceIds: ["policy-drafting-revision"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("car", "compliance alignment"),
    aiInterpretationTemplate: "Identify outdated provisions. Prioritize by legal risk and recommend revision timeline.",
  },
  {
    id: "accessibility-policy-needs",
    title: "Accessibility Policy Needs Assessment",
    description: "Needs assessment for new accessibility policy.",
    serviceIds: ["accessibility-policy-development"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("apn"),
    aiInterpretationTemplate: "Identify the most-needed policy provisions. Provide draft outline.",
  },
  {
    id: "org-accessibility-score",
    title: "Organizational Accessibility Score",
    description: "Composite accessibility score across functions.",
    serviceIds: ["accessibility-policy-development", "annual-compliance-review"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("oas", "organizational accessibility"),
    aiInterpretationTemplate: "Provide a composite 0-100 accessibility score with subscores. Recommend top-three priorities.",
  },
  {
    id: "workflow-efficiency",
    title: "Workflow Efficiency Assessment",
    description: "Assesses accommodation workflow efficiency.",
    serviceIds: ["accommodation-workflow-design", "annual-accommodation-workflow-review"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("we"),
    aiInterpretationTemplate: "Score workflow efficiency and recommend specific re-routing or automation steps.",
  },
  {
    id: "sla-compliance-review",
    title: "SLA Compliance Review",
    description: "Reviews accommodation SLA performance.",
    serviceIds: ["accommodation-workflow-design", "annual-accommodation-workflow-review"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("slc", "SLA compliance"),
    aiInterpretationTemplate: "Identify SLA misses and root causes. Recommend process changes to hit SLA next quarter.",
  },
  {
    id: "wcag-compliance",
    title: "WCAG Compliance Assessment",
    description: "Audits web content for WCAG 2.1 AA conformance.",
    serviceIds: ["digital-accessibility-review"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("wcag", "WCAG 2.1 AA"),
    aiInterpretationTemplate: "Provide WCAG findings categorized by perceivable / operable / understandable / robust. Recommend remediation backlog.",
  },
  {
    id: "digital-accessibility-scorecard",
    title: "Digital Accessibility Scorecard",
    description: "Composite digital accessibility score.",
    serviceIds: ["digital-accessibility-review"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("das", "digital accessibility"),
    aiInterpretationTemplate: "Provide a scorecard with severity-weighted findings. Recommend top three immediate fixes.",
  },
  {
    id: "annual-policy-compliance",
    title: "Annual Policy Compliance Assessment",
    description: "Annual review of policy compliance.",
    serviceIds: ["annual-compliance-review"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("apc", "annual policy compliance"),
    aiInterpretationTemplate: "Annual compliance posture summary. Provide board-ready findings.",
  },
  {
    id: "organizational-accessibility-audit",
    title: "Organizational Accessibility Audit",
    description: "Org-wide accessibility audit.",
    serviceIds: ["annual-compliance-review"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("oaa", "organizational accessibility"),
    aiInterpretationTemplate: "Identify the three areas of greatest org risk. Recommend remediation timeline.",
  },
  {
    id: "case-doc-quality",
    title: "Case Documentation Quality Assessment",
    description: "Assesses VR case file documentation quality.",
    serviceIds: ["quarterly-case-audit"],
    audiences: ["counselor"],
    items: complianceItems("cdq", "case documentation"),
    aiInterpretationTemplate: "Score sampled cases. Highlight documentation gaps creating audit risk.",
  },
  {
    id: "compliance-risk-review",
    title: "Compliance Risk Review",
    description: "Reviews cases for compliance risk.",
    serviceIds: ["quarterly-case-audit"],
    audiences: ["counselor"],
    items: complianceItems("crr", "case compliance"),
    aiInterpretationTemplate: "Flag cases at compliance risk. Recommend corrective action per case.",
  },

  // 🔁 RECURRING / ANNUAL ─────────────────────────────────────────
  {
    id: "annual-ada-compliance",
    title: "Annual ADA Compliance Assessment",
    description: "Annual ADA Title I compliance.",
    serviceIds: ["annual-ada-eeo-audit"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("aac", "annual ADA Title I"),
    aiInterpretationTemplate: "Annual ADA Title I compliance posture. Identify top three remediation priorities.",
  },
  {
    id: "eeo-risk-review",
    title: "EEO Risk Review",
    description: "EEO risk inventory.",
    serviceIds: ["annual-ada-eeo-audit"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: complianceItems("err", "EEO posture"),
    aiInterpretationTemplate: "Identify the top EEO risks. Recommend mitigation plans with target dates.",
  },
  {
    id: "quarterly-inclusion-metrics",
    title: "Quarterly Inclusion Metrics Assessment",
    description: "Quarterly inclusion KPI review.",
    serviceIds: ["quarterly-workforce-outcomes-review"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("qim"),
    aiInterpretationTemplate: "Summarize the quarter's inclusion metrics with quarter-over-quarter delta. Recommend interventions.",
  },
  {
    id: "workforce-trend-analysis",
    title: "Workforce Trend Analysis",
    description: "Trend analysis on workforce KPIs.",
    serviceIds: ["quarterly-workforce-outcomes-review"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("wta"),
    aiInterpretationTemplate: "Identify the three most-actionable workforce trends. Recommend quarterly priorities.",
  },
  {
    id: "vendor-performance",
    title: "Vendor Performance Assessment",
    description: "Vendor performance scorecard.",
    serviceIds: ["vendor-coordination-oversight"],
    audiences: ["counselor"],
    items: readinessItems("vp"),
    aiInterpretationTemplate: "Score vendor performance across quality, timeliness, communication, and compliance. Recommend continuation, watch, or sunset.",
  },
  {
    id: "deliverable-quality-review",
    title: "Deliverable Quality Review",
    description: "Sampled review of vendor deliverables.",
    serviceIds: ["vendor-coordination-oversight"],
    audiences: ["counselor"],
    items: readinessItems("dqr"),
    aiInterpretationTemplate: "Identify quality gaps in vendor deliverables. Recommend rework or retraining.",
  },
  {
    id: "annual-jta-update",
    title: "Annual JTA Update Assessment",
    description: "Year-over-year JTA update.",
    serviceIds: ["annual-job-task-analysis-update"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("ajta"),
    aiInterpretationTemplate: "Identify any change in essential functions year-over-year. Recommend accommodations review where demands changed.",
  },
  {
    id: "essential-functions-change",
    title: "Essential Functions Change Review",
    description: "Reviews changes to essential functions.",
    serviceIds: ["annual-job-task-analysis-update"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("efc"),
    aiInterpretationTemplate: "Flag functions newly classified as essential. Recommend re-screening or re-accommodation reviews.",
  },
  {
    id: "annual-workflow-performance",
    title: "Annual Workflow Performance Assessment",
    description: "Annual workflow performance.",
    serviceIds: ["annual-accommodation-workflow-review"],
    audiences: ["counselor", "business", "partner", "vendor"],
    items: readinessItems("awp"),
    aiInterpretationTemplate: "Annual workflow performance review. Recommend process improvements for next year.",
  },

  // ── Specialized standardized instruments mapped to CRC archetypes ──
  // These follow the same shape as the other tools — short likert /
  // yes-no proxy item sets for the demo platform, with the AI prompt
  // referencing the actual standardized scoring methodology so the
  // counselor's interpretation cites the real instrument's norms.

  // 1. Career Counselors ───────────────────────────────────────────────
  {
    id: "strong-interest-inventory",
    title: "Strong Interest Inventory (SII)",
    description:
      "RIASEC-based vocational interest profiler grounded in the Strong SII methodology.",
    serviceIds: ["job-development-consulting", "supported-employment-planning"],
    audiences: ["counselor", "client"],
    counselorRoles: ["career"],
    items: [
      { id: "sii-1", prompt: "I enjoy hands-on, mechanical, or outdoor work.", kind: "likert5" },
      { id: "sii-2", prompt: "I'm drawn to investigating problems and analyzing data.", kind: "likert5" },
      { id: "sii-3", prompt: "I express myself through art, writing, music, or design.", kind: "likert5" },
      { id: "sii-4", prompt: "I find meaning in helping, teaching, or counseling others.", kind: "likert5" },
      { id: "sii-5", prompt: "I'm energized by leading, persuading, or selling.", kind: "likert5" },
      { id: "sii-6", prompt: "I prefer structured, detail-oriented, organized tasks.", kind: "likert5" },
    ],
    aiInterpretationTemplate:
      "Score the client across the six RIASEC themes per Strong SII conventions. Report the 3-letter Holland code and propose 3-5 target O*NET occupations matching that code.",
  },
  {
    id: "self-directed-search",
    title: "Self-Directed Search (SDS)",
    description:
      "Holland's self-administered RIASEC inventory — activities, competencies, occupations, self-estimates.",
    serviceIds: ["job-development-consulting"],
    audiences: ["counselor", "client"],
    counselorRoles: ["career"],
    items: [
      { id: "sds-1", prompt: "I'd enjoy: repairing engines, building furniture, working outdoors.", kind: "likert5" },
      { id: "sds-2", prompt: "I'd enjoy: research, lab work, complex problem solving.", kind: "likert5" },
      { id: "sds-3", prompt: "I'd enjoy: design, performing, creative writing.", kind: "likert5" },
      { id: "sds-4", prompt: "I'd enjoy: teaching, counseling, community work.", kind: "likert5" },
      { id: "sds-5", prompt: "I'd enjoy: managing a team, sales, public speaking.", kind: "likert5" },
      { id: "sds-6", prompt: "I'd enjoy: bookkeeping, data entry, records management.", kind: "likert5" },
    ],
    aiInterpretationTemplate:
      "Tabulate the SDS summary code per Holland's methodology. Cross-reference the Occupations Finder for matches at each Job Zone the client qualifies for.",
  },
  {
    id: "career-scope",
    title: "CareerScope Interest & Aptitude",
    description:
      "Computer-delivered interest + aptitude profile common in state VR (CareerScope methodology).",
    serviceIds: ["job-development-consulting", "supported-employment-planning"],
    audiences: ["counselor", "client"],
    counselorRoles: ["career"],
    items: [
      { id: "cs-1", prompt: "I can follow multi-step verbal instructions.", kind: "likert5" },
      { id: "cs-2", prompt: "I notice visual-detail differences quickly.", kind: "likert5" },
      { id: "cs-3", prompt: "I can do mental arithmetic without paper.", kind: "likert5" },
      { id: "cs-4", prompt: "I read for understanding at adult level.", kind: "likert5" },
      { id: "cs-5", prompt: "I prefer working with people over working alone.", kind: "likert5" },
      { id: "cs-6", prompt: "I'm comfortable making decisions under deadline pressure.", kind: "likert5" },
    ],
    aiInterpretationTemplate:
      "Produce a CareerScope-style profile combining interest themes and aptitude domains. Recommend GOE work-group codes for further exploration.",
  },
  {
    id: "differential-aptitude-tests",
    title: "Differential Aptitude Tests (DAT)",
    description:
      "Eight-aptitude DAT proxy — verbal reasoning, numerical, abstract, mechanical, clerical, spatial, spelling, grammar.",
    serviceIds: ["transferable-skills-analysis", "job-development-consulting"],
    audiences: ["counselor", "client"],
    counselorRoles: ["career", "cve"],
    items: [
      { id: "dat-1", prompt: "Verbal reasoning — comfortable with analogies, vocabulary.", kind: "likert5" },
      { id: "dat-2", prompt: "Numerical reasoning — comfortable with applied math.", kind: "likert5" },
      { id: "dat-3", prompt: "Abstract reasoning — pattern recognition, sequencing.", kind: "likert5" },
      { id: "dat-4", prompt: "Mechanical reasoning — understands how things work.", kind: "likert5" },
      { id: "dat-5", prompt: "Clerical speed/accuracy — fast, precise on detail tasks.", kind: "likert5" },
      { id: "dat-6", prompt: "Spatial relations — comfortable with 3-D visualization.", kind: "likert5" },
    ],
    aiInterpretationTemplate:
      "Report a DAT-style aptitude profile (high / average / low across the 8 domains). Recommend training tracks that match the client's strongest domains.",
  },

  // 2. Return-to-Work Coordinators ─────────────────────────────────────
  {
    id: "transferable-skills-analysis-tsa",
    title: "Transferable Skills Analysis (TSA)",
    description:
      "Identifies portable skills from prior work and maps them to residual-capacity-compatible occupations.",
    serviceIds: ["transferable-skills-analysis", "return-to-work-planning"],
    audiences: ["counselor", "business", "vendor"],
    counselorRoles: ["return-to-work", "forensic", "cve"],
    items: [
      { id: "tsa-1", prompt: "List the three most recent occupations held.", kind: "text" },
      { id: "tsa-2", prompt: "For each, top 3 skills used (SkillTRAN / WORKER trait style).", kind: "text" },
      { id: "tsa-3", prompt: "Current physical demand tolerance (sedentary / light / medium / heavy).", kind: "text" },
      { id: "tsa-4", prompt: "Education + training completed.", kind: "text" },
      { id: "tsa-5", prompt: "Geographic search radius (miles).", kind: "scale10" },
    ],
    aiInterpretationTemplate:
      "Apply a TSA methodology (worker trait / SkillTRAN). Output 5-10 target SOC codes within residual capacity with transferability rationale and wage band per BLS.",
  },
  {
    id: "functional-capacity-evaluation",
    title: "Functional Capacity Evaluation (FCE)",
    description:
      "Standardized physical capacity screen — lift, carry, sit, stand, walk, sustained activity tolerances.",
    serviceIds: ["return-to-work-planning", "earning-capacity-assessment"],
    audiences: ["counselor", "client", "vendor"],
    counselorRoles: ["return-to-work", "forensic"],
    items: functionalChecklist("fce"),
    aiInterpretationTemplate:
      "Report FCE findings in DOT physical-demand strength categories (sedentary/light/medium/heavy). Identify positional restrictions and recommend JAN accommodations to reach competitive employment.",
  },
  {
    id: "job-analysis",
    title: "Job Analysis (JA)",
    description:
      "Essential-function decomposition of a specific role using O*NET task and worker-requirement framework.",
    serviceIds: ["job-task-analysis", "reasonable-accommodation-plan"],
    audiences: ["counselor", "business", "vendor"],
    counselorRoles: ["return-to-work"],
    items: [
      { id: "ja-1", prompt: "Position title + O*NET SOC code.", kind: "text" },
      { id: "ja-2", prompt: "Essential functions (list).", kind: "text" },
      { id: "ja-3", prompt: "Physical demands (DOT codes).", kind: "text" },
      { id: "ja-4", prompt: "Cognitive demands (sustained focus, multitasking, decisions).", kind: "text" },
      { id: "ja-5", prompt: "Environmental conditions (noise, temperature, hazards).", kind: "text" },
      { id: "ja-6", prompt: "Tools / equipment required.", kind: "text" },
    ],
    aiInterpretationTemplate:
      "Output a job-analysis report distinguishing essential vs marginal functions, mapped to O*NET worker requirements. Flag any function that creates likely ADA concerns.",
  },
  {
    id: "ergonomic-assessment-standardized",
    title: "Ergonomic Assessment",
    description:
      "Onsite/remote ergonomic risk screen — postural, repetitive-motion, environmental factors.",
    serviceIds: ["return-to-work-planning", "remote-work-safety"],
    audiences: ["counselor", "business", "vendor"],
    counselorRoles: ["return-to-work"],
    items: ergonomicsChecklist("erg"),
    aiInterpretationTemplate:
      "Score the workstation against ANSI/HFES 100 and OSHA computer-workstation guidelines. Recommend equipment changes with JAN cost bands.",
  },

  // 3. Forensic Rehabilitation Specialists ─────────────────────────────
  {
    id: "earning-capacity-assessment",
    title: "Earning Capacity Assessment",
    description:
      "Pre-injury vs residual earning capacity for litigation, workers' comp, and SSA proceedings.",
    serviceIds: ["earning-capacity-assessment", "forensic-vocational-evaluation"],
    audiences: ["counselor", "business", "vendor"],
    counselorRoles: ["forensic"],
    items: [
      { id: "eca-1", prompt: "Pre-injury annual earnings (W-2 / 1099 documented).", kind: "text" },
      { id: "eca-2", prompt: "Residual occupations within current capacity.", kind: "text" },
      { id: "eca-3", prompt: "BLS wage band for residual occupations.", kind: "text" },
      { id: "eca-4", prompt: "Worklife expectancy adjustment.", kind: "text" },
      { id: "eca-5", prompt: "Future medical / training cost offsets.", kind: "text" },
    ],
    aiInterpretationTemplate:
      "Produce an earning-capacity opinion grounded in BLS OEWS data with methodology citations. Report present value across worklife expectancy using Daubert-compatible methodology.",
  },
  {
    id: "wide-range-achievement-test",
    title: "Wide Range Achievement Test (WRAT)",
    description:
      "Standardized academic-skills screen — word reading, sentence comprehension, spelling, math computation.",
    serviceIds: ["forensic-vocational-evaluation", "transferable-skills-analysis"],
    audiences: ["counselor", "client"],
    counselorRoles: ["forensic", "cve"],
    items: [
      { id: "wrat-1", prompt: "Reads aloud at grade-level fluency.", kind: "likert5" },
      { id: "wrat-2", prompt: "Comprehends written instructions.", kind: "likert5" },
      { id: "wrat-3", prompt: "Spells common workplace vocabulary.", kind: "likert5" },
      { id: "wrat-4", prompt: "Performs basic computation (add/sub/mult/div).", kind: "likert5" },
      { id: "wrat-5", prompt: "Reads at adult work level (12th grade+).", kind: "likert5" },
    ],
    aiInterpretationTemplate:
      "Report estimated grade-equivalent scores per WRAT-5 norms across the four subtests. Flag training pathways that require remediation first.",
  },
  {
    id: "labor-market-survey",
    title: "Labor Market Survey (LMS)",
    description:
      "Local labor-market scan with sourcing notes per finding — employer calls, postings, openings density.",
    serviceIds: ["labor-market-analysis", "forensic-vocational-evaluation"],
    audiences: ["counselor", "business", "vendor"],
    counselorRoles: ["forensic", "job-development"],
    items: [
      { id: "lms-1", prompt: "Target SOC codes surveyed.", kind: "text" },
      { id: "lms-2", prompt: "Geographic search radius (miles).", kind: "scale10" },
      { id: "lms-3", prompt: "Employers contacted / postings sourced.", kind: "scale10" },
      { id: "lms-4", prompt: "Openings confirmed available.", kind: "scale10" },
      { id: "lms-5", prompt: "Wage range observed (low / median / high).", kind: "text" },
    ],
    aiInterpretationTemplate:
      "Produce an LMS narrative grounded in BLS QCEW + sourced employer contacts. Report findings as Rule 26 disclosure-ready with methodology and source list.",
  },

  // 4. Job Development & Placement Specialists ─────────────────────────
  {
    id: "situational-assessment",
    title: "Situational Assessment (Community-Based)",
    description:
      "Real-work observation in a community setting — productivity, behavior, supervision needs.",
    serviceIds: ["supported-employment-planning", "workplace-readiness-training"],
    audiences: ["counselor", "client", "vendor"],
    counselorRoles: ["job-development"],
    items: [
      { id: "sa-1", prompt: "Task completion rate at observed pace (% of standard).", kind: "scale10" },
      { id: "sa-2", prompt: "Independence with multi-step tasks.", kind: "likert5" },
      { id: "sa-3", prompt: "Response to supervisor feedback.", kind: "likert5" },
      { id: "sa-4", prompt: "Interaction with co-workers.", kind: "likert5" },
      { id: "sa-5", prompt: "Stamina across the observed shift.", kind: "likert5" },
    ],
    aiInterpretationTemplate:
      "Summarize observed work behaviors in the situational setting. Recommend job-match parameters (pace, supervision ratio, social load) and any natural-supports strategies.",
  },
  {
    id: "work-readiness-assessment",
    title: "Work Readiness Assessment",
    description:
      "Soft-skill + workplace-behavior readiness profile across the major employer-rated dimensions.",
    serviceIds: ["workplace-readiness-training", "supported-employment-planning"],
    audiences: ["counselor", "client", "vendor"],
    counselorRoles: ["job-development"],
    items: softSkillsItems("wra"),
    aiInterpretationTemplate:
      "Score the client across the National Work Readiness employer competencies. Recommend targeted soft-skill curricula for the lowest-rated dimensions.",
  },

  // 5. Mental Health & Psychiatric Rehabilitation Counselors ───────────
  {
    id: "mmpi-3-screen",
    title: "Minnesota Multiphasic Personality Inventory (MMPI-3)",
    description:
      "Brief MMPI-3-styled personality and psychopathology screen used in vocational planning.",
    serviceIds: ["return-to-work-planning", "trauma-informed-workplace-training"],
    audiences: ["counselor"],
    counselorRoles: ["mental-health"],
    items: [
      { id: "mmpi-1", prompt: "Demonstrates emotional regulation under workplace stress.", kind: "likert5" },
      { id: "mmpi-2", prompt: "Maintains effective interpersonal boundaries.", kind: "likert5" },
      { id: "mmpi-3", prompt: "Reports somatic complaints that interfere with work.", kind: "likert5" },
      { id: "mmpi-4", prompt: "Shows behavioral activation across daily life.", kind: "likert5" },
      { id: "mmpi-5", prompt: "Reports thought-content disturbances impacting safety.", kind: "yesno" },
    ],
    aiInterpretationTemplate:
      "Apply MMPI-3 framework (RC scales + validity scales) to draft a vocational-implication summary. Refer for full MMPI-3 administration when clinical indicators warrant.",
  },
  {
    id: "beck-depression-anxiety",
    title: "Beck Depression / Anxiety Inventory (BDI / BAI)",
    description:
      "BDI-II + BAI-style symptom severity screen used at intake and across the rehabilitation course.",
    serviceIds: ["return-to-work-planning", "trauma-informed-workplace-training"],
    audiences: ["counselor", "client"],
    counselorRoles: ["mental-health"],
    items: [
      { id: "bdi-1", prompt: "Persistent sadness or loss of interest most days.", kind: "likert5" },
      { id: "bdi-2", prompt: "Worthlessness, hopelessness, or guilt.", kind: "likert5" },
      { id: "bdi-3", prompt: "Sleep disturbance (initiation / maintenance / early waking).", kind: "likert5" },
      { id: "bai-1", prompt: "Racing heart, sweating, or trembling in workplace situations.", kind: "likert5" },
      { id: "bai-2", prompt: "Fear of losing control or feeling unreal.", kind: "likert5" },
      { id: "bai-3", prompt: "Avoidance of work demands due to anxious anticipation.", kind: "likert5" },
    ],
    aiInterpretationTemplate:
      "Apply BDI-II + BAI severity bands (minimal / mild / moderate / severe). Recommend a vocational support tier appropriate to each scale and flag safety items requiring same-day follow-up.",
  },
  {
    id: "whodas-2",
    title: "WHO Disability Assessment Schedule (WHODAS 2.0)",
    description:
      "WHO's six-domain disability impact measure (cognition, mobility, self-care, getting along, life activities, participation).",
    serviceIds: ["return-to-work-planning", "reasonable-accommodation-plan"],
    audiences: ["counselor", "client"],
    counselorRoles: ["mental-health", "return-to-work"],
    items: [
      { id: "whodas-1", prompt: "Cognition — concentration, decision-making.", kind: "likert5" },
      { id: "whodas-2", prompt: "Mobility — moving around, transportation.", kind: "likert5" },
      { id: "whodas-3", prompt: "Self-care — daily hygiene, dressing, medications.", kind: "likert5" },
      { id: "whodas-4", prompt: "Getting along — interactions with people, conflict.", kind: "likert5" },
      { id: "whodas-5", prompt: "Life activities — household tasks, work tasks.", kind: "likert5" },
      { id: "whodas-6", prompt: "Participation — joining in community life.", kind: "likert5" },
    ],
    aiInterpretationTemplate:
      "Report WHODAS 2.0 domain scores and a total disability score on the WHO scale. Translate findings into specific workplace accommodations per ICF framework.",
  },
  {
    id: "coping-skills-assessment",
    title: "Coping Skills Assessment",
    description:
      "Inventory of coping strategies — problem-focused, emotion-focused, social-support, avoidant.",
    serviceIds: ["return-to-work-planning", "workplace-readiness-training"],
    audiences: ["counselor", "client"],
    counselorRoles: ["mental-health"],
    items: [
      { id: "cope-1", prompt: "I take direct action to solve problems at work.", kind: "likert5" },
      { id: "cope-2", prompt: "I reframe difficult situations to find meaning.", kind: "likert5" },
      { id: "cope-3", prompt: "I reach out to my support network when overwhelmed.", kind: "likert5" },
      { id: "cope-4", prompt: "I use mindfulness or grounding techniques.", kind: "likert5" },
      { id: "cope-5", prompt: "I avoid or withdraw when stress is high.", kind: "likert5" },
      { id: "cope-6", prompt: "I use substances to manage difficult emotions.", kind: "likert5" },
    ],
    aiInterpretationTemplate:
      "Profile the client's coping repertoire (adaptive vs maladaptive emphasis). Recommend specific coping-skill curricula (DBT distress tolerance, ACT defusion, CBT problem-solving) matched to gaps.",
  },

  // 6. Certified Vocational Evaluation Specialists (CVE) ───────────────
  {
    id: "wais-iv-screen",
    title: "Wechsler Adult Intelligence Scale (WAIS-IV)",
    description:
      "Brief intelligence proxy across the WAIS-IV four index areas — VCI, PRI, WMI, PSI.",
    serviceIds: ["transferable-skills-analysis", "forensic-vocational-evaluation"],
    audiences: ["counselor"],
    counselorRoles: ["cve"],
    items: [
      { id: "wais-1", prompt: "Verbal Comprehension (VCI) — vocabulary, similarities.", kind: "likert5" },
      { id: "wais-2", prompt: "Perceptual Reasoning (PRI) — block design, matrix reasoning.", kind: "likert5" },
      { id: "wais-3", prompt: "Working Memory (WMI) — digit span, arithmetic.", kind: "likert5" },
      { id: "wais-4", prompt: "Processing Speed (PSI) — symbol search, coding.", kind: "likert5" },
      { id: "wais-5", prompt: "Adaptive functioning observed in interview.", kind: "likert5" },
    ],
    aiInterpretationTemplate:
      "Estimate index scores across VCI, PRI, WMI, PSI per WAIS-IV norms. Recommend training pathways suited to the strongest index. Refer for full WAIS-IV when high-stakes decisions require it.",
  },
  {
    id: "work-sample-system",
    title: "Work Sample System (Valpar / McCarron-Dial)",
    description:
      "Hands-on standardized work samples — fine motor, tool use, multi-step task sequencing, sustained attention.",
    serviceIds: ["transferable-skills-analysis", "supported-employment-planning"],
    audiences: ["counselor", "vendor"],
    counselorRoles: ["cve"],
    items: [
      { id: "ws-1", prompt: "Fine-motor accuracy on small-parts assembly.", kind: "likert5" },
      { id: "ws-2", prompt: "Tool-use proficiency (hand and power tools).", kind: "likert5" },
      { id: "ws-3", prompt: "Multi-step task sequencing without re-instruction.", kind: "likert5" },
      { id: "ws-4", prompt: "Sustained attention across the work sample period.", kind: "likert5" },
      { id: "ws-5", prompt: "Productivity at observed pace vs. competitive standard.", kind: "scale10" },
    ],
    aiInterpretationTemplate:
      "Score the work-sample performance per Valpar (or McCarron-Dial) norms. Translate findings into recommended SOC families and physical-demand strength category.",
  },
  {
    id: "kbit-screen",
    title: "Kaufman Brief Intelligence Test (KBIT)",
    description:
      "Brief verbal + nonverbal intelligence screen — quicker alternative to WAIS for vocational triage.",
    serviceIds: ["transferable-skills-analysis"],
    audiences: ["counselor"],
    counselorRoles: ["cve"],
    items: [
      { id: "kbit-1", prompt: "Verbal — vocabulary, expressive language.", kind: "likert5" },
      { id: "kbit-2", prompt: "Riddles — verbal reasoning under context.", kind: "likert5" },
      { id: "kbit-3", prompt: "Matrices — nonverbal abstract reasoning.", kind: "likert5" },
      { id: "kbit-4", prompt: "Speed of response across items.", kind: "likert5" },
      { id: "kbit-5", prompt: "Observed test-taking behavior (attention, motivation).", kind: "likert5" },
    ],
    aiInterpretationTemplate:
      "Estimate KBIT-2 IQ composite and verbal/nonverbal split. Use as a triage screen; recommend full WAIS-IV when decisions require comprehensive cognitive profile.",
  },
  {
    id: "purdue-pegboard",
    title: "Dexterity Test (Purdue Pegboard)",
    description:
      "Standardized fine- and gross-motor dexterity assessment for jobs requiring manual precision.",
    serviceIds: ["transferable-skills-analysis", "return-to-work-planning"],
    audiences: ["counselor", "vendor"],
    counselorRoles: ["cve", "return-to-work"],
    items: [
      { id: "pp-1", prompt: "Right-hand pegs placed in 30 seconds (count).", kind: "scale10" },
      { id: "pp-2", prompt: "Left-hand pegs placed in 30 seconds (count).", kind: "scale10" },
      { id: "pp-3", prompt: "Both-hands pegs placed in 30 seconds.", kind: "scale10" },
      { id: "pp-4", prompt: "Assembly task pegs + collars in 60 seconds.", kind: "scale10" },
      { id: "pp-5", prompt: "Observed signs of fatigue or pain during trials.", kind: "yesno" },
    ],
    aiInterpretationTemplate:
      "Compare scores to Purdue Pegboard norms by age + sex. Identify occupations with dexterity demands the client meets or fails. Recommend AT or task redesign where indicated.",
  },
];

// ─── Lookups ──────────────────────────────────────────────────────────

export function getAssessmentTool(id: string): AssessmentTool | null {
  return ASSESSMENT_TOOLS.find((a) => a.id === id) ?? null;
}

export function toolsForService(serviceId: string): AssessmentTool[] {
  return ASSESSMENT_TOOLS.filter((a) => a.serviceIds.includes(serviceId));
}

export function toolsForAudience(audience: Audience): AssessmentTool[] {
  return ASSESSMENT_TOOLS.filter((a) => a.audiences.includes(audience));
}

export function toolsForCounselorRole(role: CounselorRole): AssessmentTool[] {
  return ASSESSMENT_TOOLS.filter((a) => a.counselorRoles?.includes(role));
}
