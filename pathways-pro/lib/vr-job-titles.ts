// Shared job-title list for provider marketplace profiles — the same
// role taxonomy used on the public /careers page (Course 1 ·
// Rehabilitation Counselor Services & Careers), reused here so a
// counselor's public profile picks a title from the same authoritative
// list rather than free-typing something inconsistent.

export const VR_JOB_TITLE_SECTORS: { sector: string; roles: string[] }[] = [
  {
    sector: "Public sector",
    roles: [
      "State Vocational Rehabilitation Counselor",
      "Rehabilitation Counselor",
      "Rehabilitation Counselor Senior",
      "Rehabilitation Supervisor",
      "Regional Administrator",
      "Program Manager",
      "Quality Assurance Specialist",
      "Policy Analyst",
      "Workforce Development Specialist",
      "Disability Determination Counselor",
    ],
  },
  {
    sector: "Federal government",
    roles: [
      "Veterans Affairs Rehabilitation Counselor",
      "Department of Labor Specialist",
      "Social Security Vocational Expert",
      "Federal Disability Program Manager",
      "Department of Education Rehabilitation Specialist",
    ],
  },
  {
    sector: "Healthcare",
    roles: [
      "Medical Rehabilitation Counselor",
      "Hospital Rehabilitation Counselor",
      "Oncology Rehabilitation Specialist",
      "Brain Injury Specialist",
      "Spinal Cord Rehabilitation Counselor",
      "Behavioral Health Rehabilitation Counselor",
    ],
  },
  {
    sector: "Mental health",
    roles: [
      "Psychiatric Rehabilitation Specialist",
      "Supported Employment Specialist",
      "Clubhouse Coordinator",
      "ACT Team Vocational Specialist",
      "IPS Employment Specialist",
    ],
  },
  {
    sector: "Education",
    roles: [
      "College Disability Services Counselor",
      "Transition Specialist",
      "School Transition Coordinator",
      "Postsecondary Disability Coordinator",
    ],
  },
  {
    sector: "Insurance",
    roles: [
      "Disability Case Manager",
      "Return-to-Work Specialist",
      "Workers' Compensation Rehabilitation Counselor",
      "Vocational Evaluator",
      "Disability Consultant",
    ],
  },
  {
    sector: "Private practice",
    roles: [
      "Vocational Expert",
      "Independent Rehabilitation Consultant",
      "Forensic Rehabilitation Consultant",
      "Life Care Planner",
      "Expert Witness",
    ],
  },
  {
    sector: "Corporate",
    roles: [
      "ADA Coordinator",
      "Disability Inclusion Manager",
      "Accessibility Consultant",
      "Employee Accommodation Specialist",
    ],
  },
  {
    sector: "Nonprofit",
    roles: [
      "Employment Specialist",
      "Supported Employment Coordinator",
      "Independent Living Specialist",
      "Community Rehabilitation Provider",
    ],
  },
];

export const VR_JOB_TITLES: string[] = VR_JOB_TITLE_SECTORS.flatMap((s) => s.roles);
