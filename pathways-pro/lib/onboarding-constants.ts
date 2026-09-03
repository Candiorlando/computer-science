export const ROLES = ["COUNSELOR", "BUSINESS", "VENDOR", "PARTNER", "CLIENT"] as const;
export type OnboardingRole = (typeof ROLES)[number];

export const ROLE_LABELS: Record<OnboardingRole, string> = {
  COUNSELOR: "Rehabilitation Provider",
  BUSINESS: "Business / Corporate Partner",
  VENDOR: "Vendor / Service Provider",
  PARTNER: "Employment Partner",
  CLIENT: "Vocational Client",
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
  "Vocational Evaluation", "Job Placement", "Supported Employment", "Customized Employment", "Job Coaching",
  "Assistive Technology Assessment", "Ergonomic / Worksite Assessment", "Forensic Vocational Assessment",
  "Transferable Skills Analysis", "Labor Market Survey", "Career Counseling", "Benefits Planning",
  "ADA / Section 504 Consulting", "Training / ETPL Provider", "Psychological / Neuropsych Testing",
] as const;

export const REHABILITATION_TITLES = [
  "Vocational Rehabilitation Counselor", "State Agency Case Oversight Specialist", "Transition / Pre-ETS Specialist",
  "Supported Employment Specialist", "Customized Employment Specialist", "Workers' Compensation Vocational Expert",
  "Forensic Vocational Evaluator", "Benefits Planner", "Assistive Technology Specialist", "Rehabilitation Program Administrator",
] as const;

export const BUSINESS_INDUSTRIES = [
  "Healthcare", "Manufacturing", "Logistics / Transportation", "Retail / Hospitality", "Education", "Government",
  "Technology", "Finance / Professional Services", "Construction / Skilled Trades", "Nonprofit / Social Enterprise", "Other",
] as const;

export const BUSINESS_SERVICE_INTERESTS = [
  "Workplace accommodation consulting", "Workers' compensation return-to-work support", "Inclusive hiring and workforce development",
  "Forensic / vocational expert services", "Employee adjustment and retention support", "EAP / behavioral health referral coordination",
] as const;

export const PARTNERSHIP_PROGRAMS = [
  "Student disability internship programming", "Short-term work experience placements", "First-time employment exposure",
  "Supported employment placements", "Customized employment placements", "Veteran disability employment pathway",
  "Workplace disability adjustment for incumbent staff", "Policy, accessibility, and values adoption",
] as const;

export const ACCOMMODATION_CAPABILITIES = [
  "Developmental / cognitive / intellectual disabilities", "Veterans with disabilities", "Newly acquired disabilities and adjustment needs",
  "Physical disabilities and mobility access", "Wheelchair users", "Limited hand use / cerebral palsy",
  "Brain injury / cognitive rehabilitation needs", "Sensory, neurodivergent, or mental health accommodations",
] as const;
