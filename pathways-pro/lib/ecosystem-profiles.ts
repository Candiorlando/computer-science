// Ecosystem profile taxonomy and role-aware feature recommendations.
// This is the client-side onboarding foundation; production persistence belongs
// in the tenant/profile models once the Prisma migration is applied.

export const ENTITY_TYPES = [
  { value: "rehabilitation_provider", label: "Rehabilitation Provider" },
  { value: "state_or_city_agency", label: "State or City Agency" },
  { value: "community_provider", label: "Community Rehabilitation Provider" },
  { value: "business_partner", label: "Business / Corporate Partner" },
  { value: "vendor", label: "Vendor / Specialized Service Provider" },
  { value: "employment_partner", label: "Employment Partner" },
  { value: "vocational_client", label: "Vocational Client" },
] as const;

export const REHABILITATION_SPECIALTIES = [
  "State vocational rehabilitation case oversight",
  "High school transition / Pre-ETS",
  "Supported employment",
  "Customized employment",
  "Workers' compensation vocational services",
  "Disability adjustment counseling",
  "Forensic vocational evaluation",
  "Benefits planning",
  "Assistive technology and accommodations",
  "Veterans transition services",
] as const;

export const BUSINESS_INDUSTRIES = [
  "Healthcare", "Manufacturing", "Logistics / Transportation", "Retail / Hospitality",
  "Education", "Government", "Technology", "Finance / Professional Services",
  "Construction / Skilled Trades", "Nonprofit / Social Enterprise", "Other",
] as const;

export const BUSINESS_SERVICE_INTERESTS = [
  "Workplace accommodation consulting", "Workers' compensation return-to-work support",
  "Inclusive hiring and workforce development", "Forensic / vocational expert services",
  "Employee adjustment and retention support", "EAP / behavioral health referral coordination",
] as const;

export const PARTNERSHIP_PROGRAMS = [
  "Student disability internship programming", "Short-term work experience placements",
  "First-time employment exposure", "Supported employment placements",
  "Customized employment placements", "Veteran disability employment pathway",
  "Workplace disability adjustment for incumbent staff", "Policy, accessibility, and values adoption",
] as const;

export const ACCOMMODATION_CAPABILITIES = [
  "Developmental / cognitive / intellectual disabilities", "Veterans with disabilities",
  "Newly acquired disabilities and adjustment needs", "Physical disabilities and mobility access",
  "Wheelchair users", "Limited hand use / cerebral palsy", "Brain injury / cognitive rehabilitation needs",
  "Sensory, neurodivergent, or mental health accommodations",
] as const;

export type ProfileFeature = { title: string; route: string; reason: string };

export function recommendedFeatures(input: {
  entityType: string;
  specialty?: string;
  businessServices?: string[];
  employmentPartnerOptIn?: boolean;
}): ProfileFeature[] {
  const common: ProfileFeature[] = [{ title: "Secure Messages", route: "/messages", reason: "Coordinate only with approved participants." }];

  if (input.entityType === "vocational_client") {
    return [
      { title: "My Vocational Journey", route: "/portal", reason: "View progress and shared next steps." },
      { title: "Appointments", route: "/appointments", reason: "Manage approved meetings." },
      { title: "Self Advocacy", route: "/self-advocacy", reason: "Understand rights and available supports." },
      { title: "My Courses", route: "/my-courses", reason: "Complete assigned learning only." },
      ...common,
    ];
  }

  if (input.entityType === "business_partner") {
    return [
      { title: "Business Portal", route: "/business-portal", reason: "Review approved relationship activity." },
      { title: "Service Orders", route: "/business-portal/orders", reason: "Coordinate authorized services only." },
      { title: "Documents", route: "/business-portal/documents", reason: "Access documents explicitly shared with your organization." },
      ...common,
    ];
  }

  if (input.entityType === "vendor") {
    return [
      { title: "Vendor Portal", route: "/vendor-portal", reason: "Manage assigned service requests." },
      { title: "Service Orders", route: "/vendor-portal/orders", reason: "Deliver only authorized referrals." },
      ...common,
    ];
  }

  if (input.entityType === "employment_partner") {
    return [
      { title: "Employment Partner Portal", route: "/partner-portal", reason: "Coordinate approved opportunity and placement activity." },
      { title: "Opportunities", route: "/partner-portal/opportunities", reason: "Publish the placement programs you elect to offer." },
      { title: "Supported Employment", route: "/partner-portal/supported-employment", reason: "Coordinate shared support with approved providers." },
      ...common,
    ];
  }

  const providerFeatures: ProfileFeature[] = [
    { title: "Case Search & Caseload", route: "/case-search", reason: "Manage only authorized, tenant-scoped cases." },
    { title: "IPE & Assessments", route: "/ipe", reason: "Support vocational planning and evidence-informed decisions." },
    { title: "Scheduling", route: "/schedule", reason: "Coordinate client-facing activities." },
    { title: "Documentation Tools", route: "/accommodation-letter", reason: "Create drafts for qualified professional review." },
    { title: "Partner Coordination", route: "/dashboard/partners", reason: "Coordinate approved employment and provider relationships." },
  ];

  if (input.specialty?.includes("State vocational")) {
    providerFeatures.push({ title: "WIOA Compliance", route: "/dashboard/wioa-compliance-suite", reason: "Support oversight, documentation, and reviewer-ready reporting." });
  }
  return [...providerFeatures, ...common];
}
