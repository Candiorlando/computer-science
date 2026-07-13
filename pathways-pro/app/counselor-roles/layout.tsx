import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Top 30 VR Counseling Roles — Tiers, Salaries, Certifications | Pathways Pro",
  description:
    "Explore the vocational rehabilitation job titles the platform supports, ranked by market density, sortable by pay band, and grouped by CRC, CVE, CDMS, and other credentials.",
};

export default function CounselorRolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
