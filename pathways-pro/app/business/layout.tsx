import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Employer & Vendor Solutions — ADA Compliance, Job Analysis | Pathways Pro",
  description:
    "Order compliance audits, ergonomic assessments, and forensic vocational opinions from credentialed rehabilitation counselors — with every deliverable reviewed, signed, and routed to your team.",
};

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
