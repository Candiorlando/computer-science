import { z } from "zod";
import { INDUSTRY_SECTORS, VENDOR_SERVICES } from "./onboarding-constants";

const sectorValues = INDUSTRY_SECTORS.map((s) => s.value);

const baseFields = {
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  sector: z.enum(sectorValues as unknown as [string, ...string[]], {
    errorMap: () => ({ message: "Select an industry sector" }),
  }),
  jobTitle: z.string().min(1, "Job title is required"),
};

export const counselorSchema = z.object({
  ...baseFields,
  role: z.literal("COUNSELOR"),
});

export const businessSchema = z.object({
  ...baseFields,
  role: z.literal("BUSINESS"),
  department: z.string().optional(),
});

export const vendorSchema = z.object({
  ...baseFields,
  role: z.literal("VENDOR"),
  services: z
    .array(z.enum(VENDOR_SERVICES as unknown as [string, ...string[]]))
    .min(1, "Select at least one service"),
});

export const onboardingSchema = z.discriminatedUnion("role", [
  counselorSchema,
  businessSchema,
  vendorSchema,
]);

export type OnboardingData = z.infer<typeof onboardingSchema>;
