import { NextResponse } from "next/server";

// NOTE: Replace with real Prisma queries after migration. This stub
// returns the seed data so the /employment-partners page can demonstrate
// the network directory pattern before the database is live.
//
// Real query shape (uncomment after migration):
//
// import { prisma } from "@/lib/prisma";
//
// const members = await prisma.networkMembership.findMany({
//   where: { orgId, status: "VERIFIED" },
//   include: {
//     employmentPartner: true,
//     vendorProfile: { include: { services: true } },
//     businessProfile: true,
//   },
//   orderBy: { joinedAt: "desc" },
// });

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  // Seed data matching the demo users in lib/users.ts
  const partners = [
    {
      id: "partner-northbranch",
      name: "North Branch Cafe",
      type: "small-employer",
      location: "Chicago, IL",
      status: "verified",
      capabilities: ["customized-employment"],
    },
    {
      id: "partner-cpl-outreach",
      name: "Chicago Public Libraries — Workforce Programs",
      type: "government",
      location: "Chicago, IL",
      status: "verified",
      capabilities: ["customized-employment", "internships"],
    },
    {
      id: "partner-communityco",
      name: "Community Connections Co-op",
      type: "small-employer",
      location: "Chicago, IL",
      status: "verified",
      capabilities: ["customized-employment"],
    },
    {
      id: "partner-brightside",
      name: "Brightside Supported Employment",
      type: "nonprofit",
      location: "Chicago, IL",
      status: "verified",
      capabilities: ["supported-employment", "customized-employment"],
    },
    {
      id: "partner-launchnetwork",
      name: "Launch Internship Network",
      type: "community-org",
      location: "Chicago, IL",
      status: "verified",
      capabilities: ["internships", "apprenticeships"],
    },
  ];

  const vendors = [
    {
      id: "vendor-vocconn",
      name: "Vocational Connections, Inc.",
      type: "crp",
      specialty: "Supported Employment",
      status: "verified",
    },
    {
      id: "vendor-piedmont",
      name: "Piedmont Forensic Vocational",
      type: "forensic",
      specialty: "Forensic Assessment",
      status: "verified",
    },
    {
      id: "vendor-abilitybridge",
      name: "AbilityBridge AT Solutions",
      type: "ergonomic",
      specialty: "Assistive Technology",
      status: "verified",
    },
    {
      id: "vendor-cornerstone",
      name: "Cornerstone Workforce Training",
      type: "training",
      specialty: "ETPL Provider",
      status: "verified",
    },
  ];

  return NextResponse.json({ partners, vendors });
}
