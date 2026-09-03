import { z } from "zod";
import { INDUSTRY_SECTORS } from "./onboarding-constants";

const sectorValues = INDUSTRY_SECTORS.map((s) => s.value);
const roleValues = ["COUNSELOR", "BUSINESS", "VENDOR", "PARTNER", "CLIENT"] as const;

export const onboardingSchema = z.object({
  role: z.enum(roleValues),
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  sector: z.enum(sectorValues as unknown as [string, ...string[]]).optional(),
  jobTitle: z.string().optional(),
  organizationName: z.string().optional(),
  entityType: z.string().min(1, "Select an entity type"),
  rehabilitationTitle: z.string().optional(),
  industry: z.string().optional(),
  services: z.array(z.string()).default([]),
  businessServiceInterests: z.array(z.string()).default([]),
  employmentPartnerOptIn: z.boolean().default(false),
  organizationSize: z.string().optional(),
  partnershipPrograms: z.array(z.string()).default([]),
  placementOpportunities: z.number().int().min(1).max(20).optional(),
  accommodationCapabilities: z.array(z.string()).default([]),
  partnerDetails: z.string().max(2000).optional(),
  supportNeeds: z.string().max(2000).optional(),
  publicDirectoryOptIn: z.boolean().default(false),
  termsAccepted: z.literal(true, { errorMap: () => ({ message: "You must accept the Terms of Service" }) }),
}).superRefine((data, ctx) => {
  if (data.role !== "CLIENT" && !data.sector) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["sector"], message: "Select an industry sector" });
  if (data.role !== "CLIENT" && !data.jobTitle) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["jobTitle"], message: "A specialized title is required" });
  if (data.role === "VENDOR" && data.services.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["services"], message: "Select at least one service" });
  if (data.employmentPartnerOptIn) {
    if (!data.organizationSize) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["organizationSize"], message: "Select organization size" });
    if (data.partnershipPrograms.length === 0) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["partnershipPrograms"], message: "Select at least one partnership program" });
    if (!data.placementOpportunities) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["placementOpportunities"], message: "Select placement capacity" });
  }
});

export type OnboardingData = z.infer<typeof onboardingSchema>;
