"use client";

// Seeds a handful of published provider/agency marketplace profiles so
// the public /directory isn't empty on first visit. Idempotent — bails
// if the seed flag is already set, so it never overwrites a real edit
// made from /provider-profile or /admin/agency-profile.

import { saveProviderProfile, saveAgencyProfile, loadProviderProfile, loadAgencyProfile } from "./provider-directory";

const SEED_FLAG = "pathways-pro:provider-directory-seeded-v1";

export function seedProviderDirectory() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEED_FLAG) === "1") return;

  if (!loadProviderProfile("tenantadmin.chicagometro@pathwayspro.app")) {
    saveProviderProfile({
      counselorEmail: "tenantadmin.chicagometro@pathwayspro.app",
      visible: true,
      jobTitle: "Certified Rehabilitation Counselor (CRC)",
      bio: "Leads Chicago Metro Rehabilitation Agency's counseling team. Sixteen years in vocational rehabilitation, focused on return-to-work planning for injured and disabled workers across manufacturing, logistics, and healthcare employers.",
      licenses: ["CRC", "Tenant Administrator"],
      specializedTraining: ["Trauma-Informed Care Certificate", "WIOA Compliance"],
      serviceCategories: ["counseling-services", "forensic", "data-evaluation"],
      publicEmail: "tenantadmin.chicagometro@pathwayspro.app",
      publicPhone: "(312) 555-0148",
      location: "Chicago, IL",
      updatedAt: new Date(0).toISOString(),
    });
  }

  if (!loadProviderProfile("counselor.chicagometro@pathwayspro.app")) {
    saveProviderProfile({
      counselorEmail: "counselor.chicagometro@pathwayspro.app",
      visible: true,
      jobTitle: "Rehabilitation Counselor",
      bio: "Works with clients navigating administrative, warehousing, and skilled-trade placements across the South Loop and near-south suburbs. Bilingual (English/Spanish) case management.",
      licenses: ["CRC"],
      specializedTraining: ["Motivational Interviewing"],
      serviceCategories: ["counseling-services", "client-services"],
      publicEmail: "counselor.chicagometro@pathwayspro.app",
      publicPhone: "(312) 555-0161",
      location: "Chicago, IL — South Loop",
      updatedAt: new Date(0).toISOString(),
    });
  }

  if (!loadProviderProfile("tenantadmin.lakeshore@pathwayspro.app")) {
    saveProviderProfile({
      counselorEmail: "tenantadmin.lakeshore@pathwayspro.app",
      visible: true,
      jobTitle: "Certified Rehabilitation Counselor (CRC)",
      bio: "Directs Lakeshore Vocational Services. Specializes in transferable skills analysis and labor market research for workers' compensation and litigation matters, alongside a general VR caseload.",
      licenses: ["CRC", "CVE", "Tenant Administrator"],
      specializedTraining: ["ABVE Forensic Practice Standards"],
      serviceCategories: ["forensic", "data-evaluation"],
      publicEmail: "tenantadmin.lakeshore@pathwayspro.app",
      publicPhone: "(847) 555-0122",
      location: "Evanston, IL",
      updatedAt: new Date(0).toISOString(),
    });
  }

  if (!loadProviderProfile("demo.counselor@pathwayspro.app")) {
    saveProviderProfile({
      counselorEmail: "demo.counselor@pathwayspro.app",
      visible: true,
      jobTitle: "Certified Vocational Evaluator (CVE)",
      bio: "Independent vocational rehabilitation practitioner. State VR referrals alongside a private caseload — career counseling, job placement support, and vocational evaluation for adults with disabilities.",
      licenses: ["CRC", "CVE"],
      specializedTraining: ["Assistive Technology Assessment"],
      serviceCategories: ["counseling-services", "client-services", "data-evaluation"],
      publicEmail: "demo.counselor@pathwayspro.app",
      publicPhone: "",
      location: "Springfield, IL — Virtual available",
      updatedAt: new Date(0).toISOString(),
    });
  }

  if (!loadAgencyProfile("tenant-chicago-metro")) {
    saveAgencyProfile({
      tenantId: "tenant-chicago-metro",
      visible: true,
      description: "Chicago Metro Rehabilitation Agency provides vocational rehabilitation, forensic vocational evaluation, and return-to-work services across the greater Chicago area. Our counselors hold CRC and CVE credentials and work with state VR referrals, workers' compensation carriers, and corporate employers directly.",
      publicEmail: "intake@chicagometrorehab.example",
      publicPhone: "(312) 555-0100",
      website: "",
      location: "Chicago, IL",
      updatedAt: new Date(0).toISOString(),
    });
  }

  if (!loadAgencyProfile("tenant-lakeshore")) {
    saveAgencyProfile({
      tenantId: "tenant-lakeshore",
      visible: true,
      description: "Lakeshore Vocational Services is a boutique agency focused on forensic vocational evaluation, labor market research, and expert testimony, alongside general vocational rehabilitation counseling for the North Shore region.",
      publicEmail: "intake@lakeshorevoc.example",
      publicPhone: "(847) 555-0100",
      website: "",
      location: "Evanston, IL",
      updatedAt: new Date(0).toISOString(),
    });
  }

  window.localStorage.setItem(SEED_FLAG, "1");
}
