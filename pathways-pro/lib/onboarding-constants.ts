export const ROLES = ["COUNSELOR", "BUSINESS", "VENDOR"] as const;
export type OnboardingRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<OnboardingRole, string> = {
  COUNSELOR: "Rehabilitation Counselor",
  BUSINESS: "Business Client",
  VENDOR: "Vendor / Service Provider",
};

export const INDUSTRY_SECTORS = [
  { value: "STATE_VR_AGENCY", label: "State VR Agency" },
  { value: "CRP", label: "Community Rehabilitation Provider (CRP)" },
  { value: "PRIVATE_FORENSIC", label: "Private Practice / Forensic Rehabilitation" },
  { value: "K12_TRANSITION", label: "K-12 Transition Services" },
  { value: "HIGHER_ED_DISABILITY", label: "Higher Education / Disability Support" },
  { value: "CORPORATE_ACCOMMODATION", label: "Corporate / Enterprise Workplace Accommodation" },
  { value: "VETERANS_MILITARY", label: "Veterans Affairs / Military Transition" },
  { value: "NONPROFIT_ADVOCACY", label: "Non-Profit / Advocacy Organization" },
  { value: "INDEPENDENT_CONSULTANT", label: "Independent Contractor / Consultant" },
] as const;

export const VENDOR_SERVICES = [
  "Vocational Evaluation",
  "Job Placement",
  "Supported Employment",
  "Customized Employment",
  "Job Coaching",
  "Assistive Technology Assessment",
  "Ergonomic / Worksite Assessment",
  "Forensic Vocational Assessment",
  "Transferable Skills Analysis",
  "Labor Market Survey",
  "Career Counseling",
  "Benefits Planning",
  "ADA / Section 504 Consulting",
  "Training / ETPL Provider",
  "Psychological / Neuropsych Testing",
] as const;
