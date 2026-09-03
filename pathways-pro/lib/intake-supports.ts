// Shared list of VR support services the client can request on intake.
// Used by:
//   - app/intake/page.tsx     (checklist UI)
//   - app/report/page.tsx     (counselor-facing label lookup)

export interface SupportOption {
  value: string;
  label: string;
  sub: string;
}

export const supportOptions: SupportOption[] = [
  {
    value: "supported-employment",
    label: "Supported employment",
    sub: "A job coach on-site to help me succeed at work",
  },
  {
    value: "job-coaching",
    label: "Job coaching after I'm hired",
    sub: "Help during the first 30 / 60 / 90 days on the job",
  },
  {
    value: "resume",
    label: "Resume + cover letter help",
    sub: "Build a tailored application for a specific job",
  },
  {
    value: "interview-prep",
    label: "Interview prep",
    sub: "Practice questions, what to wear, how to disclose (or not)",
  },
  {
    value: "career-counseling",
    label: "Career counseling",
    sub: "One-on-one help figuring out what to aim for",
  },
  {
    value: "vocational-training",
    label: "Vocational training / school",
    sub: "Certificate or short program in a specific trade",
  },
  {
    value: "ojt",
    label: "On-the-job training (OJT)",
    sub: "Learn while you earn at a real employer",
  },
  {
    value: "apprenticeship",
    label: "Apprenticeship placement",
    sub: "Formal registered apprenticeship in a trade",
  },
  {
    value: "assistive-tech",
    label: "Assistive technology",
    sub: "Equipment or software that helps me do the work",
  },
  {
    value: "accommodations",
    label: "Workplace accommodations",
    sub: "Changes to the job or environment so I can do it",
  },
  {
    value: "transportation",
    label: "Transportation support",
    sub: "Bus pass, gas vouchers, paratransit setup",
  },
  {
    value: "benefits-counseling",
    label: "Benefits counseling (SSI / SSDI / Ticket to Work)",
    sub: "Understand how working affects my benefits",
  },
  {
    value: "mental-health",
    label: "Mental health counseling referral",
    sub: "Therapy or psychiatric support alongside VR services",
  },
  {
    value: "pre-ets",
    label: "Pre-Employment Transition Services (Pre-ETS)",
    sub: "For students 14–22: career exploration, work-based learning",
  },
];

const SUPPORT_LABELS: Record<string, string> = supportOptions.reduce(
  (acc, opt) => {
    acc[opt.value] = opt.label;
    return acc;
  },
  {} as Record<string, string>,
);

export function supportLabel(value: string): string {
  return SUPPORT_LABELS[value] ?? value;
}
