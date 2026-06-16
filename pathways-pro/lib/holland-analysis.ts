// Holland Code → narrative personality analysis + job category synthesis.
// Built from Holland's Theory of Vocational Choice and O*NET Interest
// Profiler interpretive materials. Used in the comprehensive signed-IPE
// report to give clients plain-language insight into why their matches
// fit them, not just what the matches are.

export type RiasecLetter = "R" | "I" | "A" | "S" | "E" | "C";

export interface RiasecProfile {
  name: string;
  shortName: string;
  description: string;
  workStyle: string;
  preferredEnvironments: string[];
  strengthsAtWork: string[];
  watchOuts: string[];
  jobCategories: string[];
}

export const RIASEC_PROFILES: Record<RiasecLetter, RiasecProfile> = {
  R: {
    name: "Realistic",
    shortName: "Doer",
    description:
      "Practical, hands-on, results-oriented. Realistic types think with their hands and feel most engaged when they can see and touch the result of their work.",
    workStyle:
      "Concrete, action-first, pragmatic. Prefers tools, machines, equipment, and the outdoors over abstract discussion or office politics.",
    preferredEnvironments: [
      "Shops, garages, job sites, fields, plants — places where the work is visible",
      "Clear physical safety rules and well-maintained tools",
      "Teams of skilled tradespeople where craft is respected",
    ],
    strengthsAtWork: [
      "Mechanical and spatial reasoning",
      "Physical coordination and dexterity",
      "Practical problem-solving under time pressure",
      "Reliability with routines and procedures",
    ],
    watchOuts: [
      "May undervalue jobs that require lengthy meetings or paperwork",
      "Can prefer working alone over collaborating, even when teamwork would help",
    ],
    jobCategories: [
      "Construction and skilled trades (electrician, plumber, HVAC, welder)",
      "Transportation and material moving (truck driver, equipment operator)",
      "Installation, maintenance, and repair",
      "Manufacturing and production",
      "Agriculture, forestry, and outdoor work",
      "Protective services (firefighter, police officer)",
    ],
  },
  I: {
    name: "Investigative",
    shortName: "Thinker",
    description:
      "Analytical, curious, methodical. Investigative types are pulled toward problems that take time to understand and reward careful thinking.",
    workStyle:
      "Independent and intellectual. Likes to figure things out from first principles. Prefers depth over breadth and ideas over performance.",
    preferredEnvironments: [
      "Quiet workspaces with access to data, tools, and reference material",
      "Cultures where evidence and reasoning are valued over politics",
      "Time and space to think carefully before acting",
    ],
    strengthsAtWork: [
      "Pattern recognition and abstract reasoning",
      "Persistence on hard problems",
      "Precision and attention to detail",
      "Rigorous documentation and clear communication of findings",
    ],
    watchOuts: [
      "May get pulled into research rabbit-holes when a 'good enough' answer was needed",
      "Sales, networking, and self-promotion may feel awkward",
    ],
    jobCategories: [
      "Computer and information technology (software developer, IT support, security analyst)",
      "Healthcare practitioners and technicians (nurse, lab tech, pharmacist)",
      "Life, physical, and social sciences (chemist, lab technician)",
      "Engineering and mathematics",
      "Architecture and design (with strong analytical bent)",
      "Healthcare diagnostics (physician, psychologist)",
    ],
  },
  A: {
    name: "Artistic",
    shortName: "Creator",
    description:
      "Original, expressive, sensitive to aesthetic detail. Artistic types want their work to carry a point of view.",
    workStyle:
      "Self-directed and intuitive. Resists rigid structure but commits hard to projects that match their voice. Strong response to beauty, story, and craft.",
    preferredEnvironments: [
      "Unstructured workspaces with creative latitude",
      "Studios, newsrooms, design firms, classrooms, kitchens",
      "Mentors who critique the work but respect the artist's vision",
    ],
    strengthsAtWork: [
      "Originality and aesthetic judgment",
      "Storytelling and metaphor",
      "Bold pattern-breaking when conventions stop working",
      "Strong empathy for audience or end user",
    ],
    watchOuts: [
      "Highly structured corporate environments can feel suffocating",
      "Quality standards may be higher than collaborators are used to",
    ],
    jobCategories: [
      "Arts, design, entertainment, sports, and media",
      "Writers, editors, and content producers",
      "Graphic designers, illustrators, multimedia artists",
      "Musicians, performers, and producers",
      "Culinary arts (chef, baker, food stylist)",
      "Cosmetology and personal-style work",
    ],
  },
  S: {
    name: "Social",
    shortName: "Helper",
    description:
      "Warm, attentive, oriented toward the well-being of others. Social types treat work as a relationship, not a transaction.",
    workStyle:
      "Collaborative and emotionally attuned. Listens carefully, follows up, holds space for others' experience. Most energized when people grow under their care.",
    preferredEnvironments: [
      "Schools, clinics, community organizations, places of worship",
      "Teams where psychological safety and warmth are explicit values",
      "Roles with regular client or student contact",
    ],
    strengthsAtWork: [
      "Active listening and emotional regulation",
      "Patience with people who are struggling",
      "Coaching, teaching, explaining complex ideas in plain language",
      "Conflict de-escalation",
    ],
    watchOuts: [
      "Boundary-setting and saying no can be hard — risk of burnout",
      "May avoid roles that require detached, evaluative judgment of others",
    ],
    jobCategories: [
      "Healthcare support (CNA, medical assistant, EMT)",
      "Community and social services (rehabilitation counselor, social worker)",
      "Education, training, and library (teacher, instructional aide)",
      "Mental health (counselor, therapist, behavioral technician)",
      "Personal care and service (childcare, elder care, fitness)",
      "Religious and ministry roles",
    ],
  },
  E: {
    name: "Enterprising",
    shortName: "Persuader",
    description:
      "Ambitious, energetic, persuasive. Enterprising types want to make things happen — usually by getting other people moving in a shared direction.",
    workStyle:
      "Decisive and outcome-focused. Comfortable taking risks, leading meetings, closing deals. Energized by goals, deadlines, and visible progress.",
    preferredEnvironments: [
      "Sales floors, startups, political offices, dealerships",
      "Cultures where ambition and initiative are recognized fast",
      "Roles with measurable targets and clear advancement paths",
    ],
    strengthsAtWork: [
      "Persuasion, negotiation, and storytelling",
      "Comfortable making decisions under uncertainty",
      "Networking and reading rooms",
      "Bouncing back from rejection",
    ],
    watchOuts: [
      "Slow-moving bureaucracies can feel frustrating",
      "May rush decisions that needed more analysis",
    ],
    jobCategories: [
      "Sales (retail, real estate, wholesale, business-to-business)",
      "Management (food service, retail, financial)",
      "Business and financial operations",
      "Law, public safety, and corrections",
      "Marketing and public relations",
      "Entrepreneurship and small business ownership",
    ],
  },
  C: {
    name: "Conventional",
    shortName: "Organizer",
    description:
      "Reliable, orderly, detail-oriented. Conventional types create systems that other people can rely on — and they take pride in doing it accurately.",
    workStyle:
      "Methodical and procedure-following. Comfortable with rules, forms, schedules, and quality checks. Trustworthy with sensitive information.",
    preferredEnvironments: [
      "Offices, banks, accounting firms, government agencies",
      "Clear job descriptions, written procedures, and predictable hours",
      "Supervisors who give explicit instructions and feedback",
    ],
    strengthsAtWork: [
      "Accuracy and precision over speed",
      "Records management and compliance",
      "Pattern detection in numerical or categorical data",
      "Quiet persistence on long, detailed tasks",
    ],
    watchOuts: [
      "Highly ambiguous startup environments can feel chaotic",
      "May default to 'follow the rule' when a judgment call was needed",
    ],
    jobCategories: [
      "Office and administrative support",
      "Business and financial operations (bookkeeping, accounting, tax prep)",
      "Information clerks and records management",
      "Banking and credit",
      "Production, planning, and inventory clerks",
      "Government and regulatory roles",
    ],
  },
};

export interface HollandAnalysis {
  code: string;
  primary: RiasecProfile;
  secondary: RiasecProfile;
  tertiary: RiasecProfile;
  combinedSummary: string;
  topJobCategories: string[];
  workStyleNarrative: string;
}

export function analyzeHollandCode(code: string): HollandAnalysis | null {
  if (!code || code.length < 3) return null;
  const letters = code.slice(0, 3).split("") as RiasecLetter[];
  if (letters.some((l) => !RIASEC_PROFILES[l])) return null;

  const [p, s, t] = letters;
  const primary = RIASEC_PROFILES[p];
  const secondary = RIASEC_PROFILES[s];
  const tertiary = RIASEC_PROFILES[t];

  const combinedSummary = combineSummary(primary, secondary, tertiary);
  const workStyleNarrative = combineWorkStyle(primary, secondary);

  // Merge job categories — primary contributes the most, secondary fills in,
  // tertiary catches roles the first two missed.
  const merged: string[] = [];
  const seen = new Set<string>();
  const round = (items: string[]) => {
    for (const item of items) {
      if (!seen.has(item)) {
        merged.push(item);
        seen.add(item);
      }
    }
  };
  round(primary.jobCategories.slice(0, 4));
  round(secondary.jobCategories.slice(0, 3));
  round(tertiary.jobCategories.slice(0, 2));

  return {
    code: letters.join(""),
    primary,
    secondary,
    tertiary,
    combinedSummary,
    topJobCategories: merged,
    workStyleNarrative,
  };
}

function combineSummary(
  primary: RiasecProfile,
  secondary: RiasecProfile,
  tertiary: RiasecProfile,
): string {
  return (
    `You score highest on the ${primary.name} (${primary.shortName}) dimension. ` +
    `That means ${primary.description.charAt(0).toLowerCase()}${primary.description.slice(1)} ` +
    `Your secondary lean toward the ${secondary.name} (${secondary.shortName}) dimension adds a ` +
    `${secondaryFlavorPhrase(primary, secondary)} The ${tertiary.name} (${tertiary.shortName}) ` +
    `dimension finishes the picture — when the first two need backup, you draw on ${tertiary.shortName.toLowerCase()} instincts.`
  );
}

function secondaryFlavorPhrase(
  primary: RiasecProfile,
  secondary: RiasecProfile,
): string {
  // Shape the phrase based on what the secondary type brings in
  const map: Record<string, string> = {
    R: "preference for tangible work that actually gets built.",
    I: "tendency to want to understand the underlying mechanics before acting.",
    A: "pull toward originality and the well-crafted final product.",
    S: "warmth toward the people the work serves.",
    E: "willingness to lead, sell the idea, and push for measurable progress.",
    C: "discipline for getting the details right and keeping good records.",
  };
  return map[secondary.shortName === primary.shortName ? "C" : secondary.name[0]] || "complementary balance.";
}

function combineWorkStyle(p: RiasecProfile, s: RiasecProfile): string {
  return (
    `Your day-to-day work style is ${p.workStyle.toLowerCase()} ` +
    `When the situation calls for it, your ${s.shortName.toLowerCase()} side takes over — ${s.workStyle.toLowerCase()}`
  );
}
