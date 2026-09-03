// Mock user database for Pathways Pro.
// In production this would be a real auth backend (Auth0, Supabase, etc.).
// Source: pathways-pro-v3.jsx (Google Drive — Pathways Pro project folder).

export type Role = "counselor" | "client" | "business" | "vendor" | "partner";

export interface CounselorUser {
  email: string;
  password: string;
  name: string;
  credentials: string;
  office: string;
  agency: string;
  employeeId: string;
  role: "counselor";
  clientKeys: string[];
  // Platform-level administrator flag — grants access to master-admin-only
  // tools (tenant provisioning, pricing engine). Distinct from ordinary
  // counselor/agency-admin duties: a platform Super Admin manages the
  // business/contract layer and must NOT read client or provider PHI
  // (case notes, assessments, IPEs) unless separately granted a normal
  // counselor account for that purpose. See lib/rbac.ts isMasterAdmin().
  platformAccess?: "SUPER_ADMIN";
  // Multi-tenant scoping — which agency/tenant this counselor belongs to,
  // and their role within it. Absent tenantId = legacy/ungrouped demo
  // counselor (pre-dates the multi-tenant model). See lib/tenants.ts.
  tenantId?: string;
  tenantRole?: "TENANT_ADMIN" | "TENANT_USER";
}

export interface ClientUser {
  email: string;
  password: string;
  name: string;
  dob: string;
  caseId: string;
  counselorEmail: string;
  counselorName: string;
  goal: string;
  status: "Intake" | "Assessment Phase" | "In Training" | "Job Placement";
  progress: number;
  role: "client";
  nextAppt: string;
}

export type BusinessScopeRole = "hr_director" | "risk_manager" | "adjuster" | "attorney";

export interface BusinessUser {
  email: string;
  password: string;
  name: string;
  title: string;
  scopeRole: BusinessScopeRole;
  orgId: string;
  orgName: string;
  role: "business";
  // Which agency/tenant manages this business client relationship.
  // Absent = legacy/ungrouped (pre-dates the multi-tenant model).
  tenantId?: string;
}

export type VendorType =
  | "crp"
  | "forensic"
  | "ergonomic"
  | "legal-consult"
  | "training";

export interface VendorUser {
  email: string;
  password: string;
  name: string;
  credentials: string;
  vendorOrgId: string;
  vendorOrgName: string;
  vendorType: VendorType;
  role: "vendor";
}

export type PartnerOrgType =
  | "small-employer"
  | "corporate-hr"
  | "nonprofit"
  | "community-org"
  | "school-district"
  | "government"
  | "social-enterprise";

export interface EmploymentPartnerUser {
  email: string;
  password: string;
  name: string;
  title: string;
  partnerOrgId: string;
  partnerOrgName: string;
  partnerOrgType: PartnerOrgType;
  // Whether this partner participates in Customized Employment. Set at
  // signup or toggled from the partner's settings; drives whether the
  // Customized Employment workspace appears in their nav and counselor
  // view.
  participatesInCustomizedEmployment: boolean;
  role: "partner";
}

export type AnyUser =
  | CounselorUser
  | ClientUser
  | BusinessUser
  | VendorUser
  | EmploymentPartnerUser;

export const COUNSELORS: Record<string, CounselorUser> = {
  "master.admin@pathwayspro.app": {
    email: "master.admin@pathwayspro.app",
    password: "MasterAdmin1!",
    name: "Platform Master Admin",
    credentials: "Platform Administrator",
    office: "Corporate HQ",
    agency: "Pathways Pro (Platform)",
    employeeId: "#001",
    role: "counselor",
    clientKeys: [],
    platformAccess: "SUPER_ADMIN",
  },
  "tenantadmin.chicagometro@pathwayspro.app": {
    email: "tenantadmin.chicagometro@pathwayspro.app",
    password: "TenantAdmin1!",
    name: "Renee Okafor",
    credentials: "CRC · Tenant Administrator",
    office: "Chicago Metro HQ",
    agency: "Chicago Metro Rehabilitation Agency",
    employeeId: "#CM-001",
    role: "counselor",
    clientKeys: [],
    tenantId: "tenant-chicago-metro",
    tenantRole: "TENANT_ADMIN",
  },
  "counselor.chicagometro@pathwayspro.app": {
    email: "counselor.chicagometro@pathwayspro.app",
    password: "TenantUser1!",
    name: "Marcus Delgado",
    credentials: "CRC",
    office: "Chicago Metro — South Loop",
    agency: "Chicago Metro Rehabilitation Agency",
    employeeId: "#CM-014",
    role: "counselor",
    clientKeys: ["client.chicagometro@pathwayspro.app"],
    tenantId: "tenant-chicago-metro",
    tenantRole: "TENANT_USER",
  },
  "tenantadmin.lakeshore@pathwayspro.app": {
    email: "tenantadmin.lakeshore@pathwayspro.app",
    password: "TenantAdmin1!",
    name: "Priya Nandakumar",
    credentials: "CRC · Tenant Administrator",
    office: "Lakeshore HQ",
    agency: "Lakeshore Vocational Services",
    employeeId: "#LS-001",
    role: "counselor",
    clientKeys: ["client.lakeshore@pathwayspro.app"],
    tenantId: "tenant-lakeshore",
    tenantRole: "TENANT_ADMIN",
  },
  "candace.metcalf@pathwayspro.app": {
    email: "candace.metcalf@pathwayspro.app",
    password: "CRC2026!",
    name: "Candace Metcalf",
    credentials: "CRC · LPC",
    office: "Chicago Office",
    agency: "Pathways Pro",
    employeeId: "#452",
    role: "counselor",
    clientKeys: [
      "jordan.hayes@vr.client",
      "priya.sharma@vr.client",
      "marcus.thomas@vr.client",
      "diana.reyes@vr.client",
      "leon.washington@vr.client",
    ],
  },
  "demo.counselor@pathwayspro.app": {
    email: "demo.counselor@pathwayspro.app",
    password: "demo1234",
    name: "Demo Counselor",
    credentials: "CRC · CVE",
    office: "Demo Office",
    agency: "State VR Agency",
    employeeId: "#000",
    role: "counselor",
    clientKeys: [
      "demo.client@pathwayspro.app",
      "demo.student@pathwayspro.app",
      "demo.entrepreneur@pathwayspro.app",
    ],
  },
  "demo.vrspecialist@pathwayspro.app": {
    email: "demo.vrspecialist@pathwayspro.app",
    password: "demo1234",
    name: "Sam Rivera",
    credentials: "VR Specialist · CCWS",
    office: "Demo Office — South Loop",
    agency: "State VR Agency",
    employeeId: "#001",
    role: "counselor",
    clientKeys: [
      "demo.student@pathwayspro.app",
      "demo.entrepreneur@pathwayspro.app",
    ],
  },
  // Neutral pathwayspro.app demo counselors per spec
  "counselor.demo1@pathwayspro.app": {
    email: "counselor.demo1@pathwayspro.app",
    password: "DemoCounselor1!",
    name: "Alex Morgan",
    credentials: "VR Counselor I",
    office: "Pathways Pro Demo",
    agency: "Pathways Pro",
    employeeId: "#D-001",
    role: "counselor",
    clientKeys: [
      "client.jobseeker@pathwayspro.app",
      "client.student@pathwayspro.app",
      "client.entrepreneur@pathwayspro.app",
    ],
  },
  "counselor.demo2@pathwayspro.app": {
    email: "counselor.demo2@pathwayspro.app",
    password: "DemoCounselor2!",
    name: "Drew Hayes",
    credentials: "VR Counselor II",
    office: "Pathways Pro Demo",
    agency: "Pathways Pro",
    employeeId: "#D-002",
    role: "counselor",
    clientKeys: [
      "client.jobseeker@pathwayspro.app",
      "client.entrepreneur@pathwayspro.app",
    ],
  },
  "crc.counselor@pathwayspro.app": {
    email: "crc.counselor@pathwayspro.app",
    password: "CRCdemo2026!",
    name: "Robin Khatri",
    credentials: "CRC · LPC",
    office: "Pathways Pro Demo",
    agency: "Pathways Pro",
    employeeId: "#D-CRC",
    role: "counselor",
    clientKeys: [
      "client.jobseeker@pathwayspro.app",
      "client.student@pathwayspro.app",
      "client.entrepreneur@pathwayspro.app",
    ],
  },
};

export const CLIENTS: Record<string, ClientUser> = {
  "client.chicagometro@pathwayspro.app": {
    email: "client.chicagometro@pathwayspro.app",
    password: "TenantClient1!",
    name: "Aisha Bell",
    dob: "1998-04-12",
    caseId: "CM-2026-0007",
    counselorEmail: "counselor.chicagometro@pathwayspro.app",
    counselorName: "Marcus Delgado, CRC",
    goal: "Administrative Support",
    status: "In Training",
    progress: 55,
    role: "client",
    nextAppt: "July 22, 2026",
  },
  "client.lakeshore@pathwayspro.app": {
    email: "client.lakeshore@pathwayspro.app",
    password: "TenantClient1!",
    name: "Devon Marsh",
    dob: "1990-09-03",
    caseId: "LS-2026-0003",
    counselorEmail: "tenantadmin.lakeshore@pathwayspro.app",
    counselorName: "Priya Nandakumar, CRC",
    goal: "Skilled Trades",
    status: "Intake",
    progress: 10,
    role: "client",
    nextAppt: "July 18, 2026",
  },
  "jordan.hayes@vr.client": {
    email: "jordan.hayes@vr.client",
    password: "client1234",
    name: "Jordan Hayes",
    dob: "1991-03-14",
    caseId: "VR-2026-0041",
    counselorEmail: "candace.metcalf@pathwayspro.app",
    counselorName: "Candace Metcalf, CRC",
    goal: "Medical Office Administration",
    status: "In Training",
    progress: 68,
    role: "client",
    nextAppt: "June 16, 2026",
  },
  "priya.sharma@vr.client": {
    email: "priya.sharma@vr.client",
    password: "client1234",
    name: "Priya Sharma",
    dob: "1998-07-22",
    caseId: "VR-2026-0038",
    counselorEmail: "candace.metcalf@pathwayspro.app",
    counselorName: "Candace Metcalf, CRC",
    goal: "Early Childhood Education",
    status: "Job Placement",
    progress: 94,
    role: "client",
    nextAppt: "June 13, 2026",
  },
  "marcus.thomas@vr.client": {
    email: "marcus.thomas@vr.client",
    password: "client1234",
    name: "Marcus Thomas",
    dob: "1985-11-02",
    caseId: "VR-2026-0029",
    counselorEmail: "candace.metcalf@pathwayspro.app",
    counselorName: "Candace Metcalf, CRC",
    goal: "Welding Technology",
    status: "Assessment Phase",
    progress: 22,
    role: "client",
    nextAppt: "June 18, 2026",
  },
  "diana.reyes@vr.client": {
    email: "diana.reyes@vr.client",
    password: "client1234",
    name: "Diana Reyes",
    dob: "1979-04-18",
    caseId: "VR-2026-0014",
    counselorEmail: "candace.metcalf@pathwayspro.app",
    counselorName: "Candace Metcalf, CRC",
    goal: "Bookkeeping & Accounting",
    status: "In Training",
    progress: 45,
    role: "client",
    nextAppt: "June 17, 2026",
  },
  "leon.washington@vr.client": {
    email: "leon.washington@vr.client",
    password: "client1234",
    name: "Leon Washington",
    dob: "2002-09-30",
    caseId: "VR-2026-0052",
    counselorEmail: "candace.metcalf@pathwayspro.app",
    counselorName: "Candace Metcalf, CRC",
    goal: "IT Support (Pre-ETS)",
    status: "Intake",
    progress: 8,
    role: "client",
    nextAppt: "June 15, 2026",
  },
  "demo.client@pathwayspro.app": {
    email: "demo.client@pathwayspro.app",
    password: "demo1234",
    name: "Demo Client",
    dob: "1995-01-01",
    caseId: "VR-DEMO-0001",
    counselorEmail: "demo.counselor@pathwayspro.app",
    counselorName: "Demo Counselor, CRC",
    goal: "Information Technology",
    status: "Assessment Phase",
    progress: 30,
    role: "client",
    nextAppt: "June 20, 2026",
  },
  "demo.student@pathwayspro.app": {
    email: "demo.student@pathwayspro.app",
    password: "demo1234",
    name: "Avery Chen",
    dob: "2006-09-12",
    caseId: "VR-DEMO-0002",
    counselorEmail: "demo.counselor@pathwayspro.app",
    counselorName: "Demo Counselor, CRC",
    goal: "Pre-ETS · College of Engineering admission",
    status: "Intake",
    progress: 15,
    role: "client",
    nextAppt: "June 21, 2026",
  },
  "demo.entrepreneur@pathwayspro.app": {
    email: "demo.entrepreneur@pathwayspro.app",
    password: "demo1234",
    name: "Casey Morgan",
    dob: "1988-04-03",
    caseId: "VR-DEMO-0003",
    counselorEmail: "demo.counselor@pathwayspro.app",
    counselorName: "Demo Counselor, CRC",
    goal: "Self-employment · Mobile notary service",
    status: "Assessment Phase",
    progress: 55,
    role: "client",
    nextAppt: "June 22, 2026",
  },
  // Neutral pathwayspro.app demo clients per spec — Job seeker,
  // Student with disability, and Entrepreneurship-track client.
  "client.jobseeker@pathwayspro.app": {
    email: "client.jobseeker@pathwayspro.app",
    password: "ClientA2026!",
    name: "Riley Anderson",
    dob: "1996-02-18",
    caseId: "VR-DEMO-A001",
    counselorEmail: "counselor.demo1@pathwayspro.app",
    counselorName: "Alex Morgan, VR Counselor",
    goal: "Customer service / administrative roles",
    status: "Job Placement",
    progress: 72,
    role: "client",
    nextAppt: "Next Wednesday",
  },
  "client.student@pathwayspro.app": {
    email: "client.student@pathwayspro.app",
    password: "ClientB2026!",
    name: "Taylor Brooks",
    dob: "2007-09-04",
    caseId: "VR-DEMO-B002",
    counselorEmail: "counselor.demo1@pathwayspro.app",
    counselorName: "Alex Morgan, VR Counselor",
    goal: "Pre-ETS · Engineering / IT pathway",
    status: "Intake",
    progress: 18,
    role: "client",
    nextAppt: "Next Tuesday",
  },
  "client.entrepreneur@pathwayspro.app": {
    email: "client.entrepreneur@pathwayspro.app",
    password: "ClientC2026!",
    name: "Jordan Stevens",
    dob: "1989-11-23",
    caseId: "VR-DEMO-C003",
    counselorEmail: "counselor.demo1@pathwayspro.app",
    counselorName: "Alex Morgan, VR Counselor",
    goal: "Self-employment · Mobile photography services",
    status: "Assessment Phase",
    progress: 48,
    role: "client",
    nextAppt: "Next Thursday",
  },
};

export function authenticate(
  email: string,
  password: string,
  role: Role,
): AnyUser | null {
  const key = email.toLowerCase().trim();
  if (role === "counselor") {
    const record = COUNSELORS[key];
    if (record && record.password === password) return record;
    return null;
  }
  if (role === "business") {
    const record = getAllBusinessUsers()[key];
    if (record && record.password === password) return record;
    return null;
  }
  if (role === "vendor") {
    const record = getAllVendorUsers()[key];
    if (record && record.password === password) return record;
    return null;
  }
  if (role === "partner") {
    const record = getAllPartnerUsers()[key];
    if (record && record.password === password) return record;
    return null;
  }
  const all = getAllClients();
  const record = all[key];
  if (record && record.password === password) return record;
  return null;
}

// ── Business & vendor signups ───────────────────────────────────────────
// Seeded with two demo accounts each so a fresh browser can land on
// /business and sign in immediately. New signups via /business persist
// to localStorage and merge on top of the seed.

export const BUSINESS_USERS_SEED: Record<string, BusinessUser> = {
  "hr.metrofoods@pathwayspro.app": {
    email: "hr.metrofoods@pathwayspro.app",
    password: "TenantBiz1!",
    name: "Nora Fitzgerald",
    title: "Director of HR",
    scopeRole: "hr_director",
    orgId: "org-metro-foods",
    orgName: "Metro Foods Distribution",
    role: "business",
    tenantId: "tenant-chicago-metro",
  },
  "aisha.hassan@acmelogistics.com": {
    email: "aisha.hassan@acmelogistics.com",
    password: "demo1234",
    name: "Aisha Hassan",
    title: "Director of HR",
    scopeRole: "hr_director",
    orgId: "org-acme",
    orgName: "Acme Logistics",
    role: "business",
  },
  "j.fontaine@meridianclaims.com": {
    email: "j.fontaine@meridianclaims.com",
    password: "demo1234",
    name: "Jules Fontaine",
    title: "Senior Workers' Comp Adjuster",
    scopeRole: "adjuster",
    orgId: "org-meridian",
    orgName: "Meridian Claims",
    role: "business",
  },
  // Neutral pathwayspro.app demo business clients per spec
  "business.smallco@pathwayspro.app": {
    email: "business.smallco@pathwayspro.app",
    password: "BizDemo1!",
    name: "Sam Cooper",
    title: "Owner / HR Lead",
    scopeRole: "hr_director",
    orgId: "org-smallco",
    orgName: "Smallco Inc.",
    role: "business",
  },
  "business.corporate@pathwayspro.app": {
    email: "business.corporate@pathwayspro.app",
    password: "BizDemo2!",
    name: "Morgan Patel",
    title: "VP of People",
    scopeRole: "hr_director",
    orgId: "org-corporate",
    orgName: "Corporate Industries",
    role: "business",
  },
  "business.nonprofit@pathwayspro.app": {
    email: "business.nonprofit@pathwayspro.app",
    password: "BizDemo3!",
    name: "Avery Singh",
    title: "Director of Operations",
    scopeRole: "hr_director",
    orgId: "org-nonprofit",
    orgName: "Helping Hands Foundation",
    role: "business",
  },
};

export const VENDOR_USERS_SEED: Record<string, VendorUser> = {
  "damon.r@vocconnections.org": {
    email: "damon.r@vocconnections.org",
    password: "demo1234",
    name: "Damon Reyes",
    credentials: "CESP",
    vendorOrgId: "vendor-vocconn",
    vendorOrgName: "Vocational Connections, Inc.",
    vendorType: "crp",
    role: "vendor",
  },
  "p.osei@piedmontforensic.com": {
    email: "p.osei@piedmontforensic.com",
    password: "demo1234",
    name: "Priya Osei",
    credentials: "CRC · CVE · ABVE/D",
    vendorOrgId: "vendor-piedmont",
    vendorOrgName: "Piedmont Forensic Vocational",
    vendorType: "forensic",
    role: "vendor",
  },
  "intake@abilitybridge-at.com": {
    email: "intake@abilitybridge-at.com",
    password: "demo1234",
    name: "Riley Park",
    credentials: "ATP · RESNA-credentialed",
    vendorOrgId: "vendor-abilitybridge",
    vendorOrgName: "AbilityBridge AT Solutions",
    vendorType: "ergonomic",
    role: "vendor",
  },
  "training@cornerstoneworkforce.org": {
    email: "training@cornerstoneworkforce.org",
    password: "demo1234",
    name: "Morgan Diaz",
    credentials: "ETPL-listed · M.Ed.",
    vendorOrgId: "vendor-cornerstone",
    vendorOrgName: "Cornerstone Workforce Training",
    vendorType: "training",
    role: "vendor",
  },
  // Neutral pathwayspro.app demo vendors per spec
  "vendor.atprovider@pathwayspro.app": {
    email: "vendor.atprovider@pathwayspro.app",
    password: "VendorDemo1!",
    name: "Quinn Chen",
    credentials: "ATP · RESNA-credentialed",
    vendorOrgId: "vendor-pathwayat",
    vendorOrgName: "Pathway AT Provider",
    vendorType: "ergonomic",
    role: "vendor",
  },
  "vendor.training@pathwayspro.app": {
    email: "vendor.training@pathwayspro.app",
    password: "VendorDemo2!",
    name: "Devon Williams",
    credentials: "ETPL · M.Ed.",
    vendorOrgId: "vendor-futureskills",
    vendorOrgName: "FutureSkills Training Co.",
    vendorType: "training",
    role: "vendor",
  },
  "vendor.accessibility@pathwayspro.app": {
    email: "vendor.accessibility@pathwayspro.app",
    password: "VendorDemo3!",
    name: "Skyler Ortiz",
    credentials: "CPACC · IAAP",
    vendorOrgId: "vendor-inclusiveaccess",
    vendorOrgName: "Inclusive Access Consulting",
    vendorType: "ergonomic",
    role: "vendor",
  },
};

const BUSINESS_SIGNUP_KEY = "pathways-pro:business-signups-v1";
const VENDOR_SIGNUP_KEY = "pathways-pro:vendor-signups-v1";

function loadBusinessSignups(): Record<string, BusinessUser> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(BUSINESS_SIGNUP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, BusinessUser>) : {};
  } catch {
    return {};
  }
}

function loadVendorSignups(): Record<string, VendorUser> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(VENDOR_SIGNUP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, VendorUser>) : {};
  } catch {
    return {};
  }
}

export function getAllBusinessUsers(): Record<string, BusinessUser> {
  return { ...BUSINESS_USERS_SEED, ...loadBusinessSignups() };
}

export function getAllVendorUsers(): Record<string, VendorUser> {
  return { ...VENDOR_USERS_SEED, ...loadVendorSignups() };
}

export interface BusinessSignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  title: string;
  scopeRole: BusinessScopeRole;
  orgName: string;
}

export function registerBusinessUser(
  input: BusinessSignupInput,
):
  | { ok: true; user: BusinessUser }
  | { ok: false; error: string } {
  const email = input.email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Enter a valid work email." };
  if (input.password.length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };
  if (!input.orgName.trim())
    return { ok: false, error: "Organization name is required." };
  if (getAllBusinessUsers()[email])
    return { ok: false, error: "An account with this email already exists." };

  const user: BusinessUser = {
    email,
    password: input.password,
    name: `${input.firstName.trim()} ${input.lastName.trim()}`,
    title: input.title.trim() || "—",
    scopeRole: input.scopeRole,
    orgId: "org-" + slugify(input.orgName),
    orgName: input.orgName.trim(),
    role: "business",
  };
  const all = loadBusinessSignups();
  all[email] = user;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(BUSINESS_SIGNUP_KEY, JSON.stringify(all));
  }
  return { ok: true, user };
}

export interface VendorSignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  credentials: string;
  vendorOrgName: string;
  vendorType: VendorType;
}

export function registerVendorUser(
  input: VendorSignupInput,
):
  | { ok: true; user: VendorUser }
  | { ok: false; error: string } {
  const email = input.email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Enter a valid work email." };
  if (input.password.length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };
  if (!input.vendorOrgName.trim())
    return { ok: false, error: "Vendor organization name is required." };
  if (getAllVendorUsers()[email])
    return { ok: false, error: "An account with this email already exists." };

  const user: VendorUser = {
    email,
    password: input.password,
    name: `${input.firstName.trim()} ${input.lastName.trim()}`,
    credentials: input.credentials.trim() || "—",
    vendorOrgId: "vendor-" + slugify(input.vendorOrgName),
    vendorOrgName: input.vendorOrgName.trim(),
    vendorType: input.vendorType,
    role: "vendor",
  };
  const all = loadVendorSignups();
  all[email] = user;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(VENDOR_SIGNUP_KEY, JSON.stringify(all));
  }
  return { ok: true, user };
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}

// ── Self-service client signups ─────────────────────────────────────────
// Clients who sign up through the landing page are persisted to
// localStorage. In production this would be a real auth backend; the
// in-memory CLIENTS table is the static demo seed.

const SIGNUP_KEY = "pathways-pro:client-signups-v1";

function loadSignups(): Record<string, ClientUser> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SIGNUP_KEY);
    return raw ? (JSON.parse(raw) as Record<string, ClientUser>) : {};
  } catch {
    return {};
  }
}

function saveSignups(signups: Record<string, ClientUser>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SIGNUP_KEY, JSON.stringify(signups));
}

export function getAllClients(): Record<string, ClientUser> {
  return { ...CLIENTS, ...loadSignups() };
}

// Computes the next sequential case ID in the form VR-YYYY-NNNN by
// scanning every existing case (static + registered) and incrementing
// past the highest number found. Pads to 4 digits.
export function nextCaseId(): string {
  const all = Object.values(getAllClients());
  const year = new Date().getFullYear();
  let max = 0;
  for (const c of all) {
    const m = c.caseId.match(/^VR-\d{4}-(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return `VR-${year}-${String(max + 1).padStart(4, "0")}`;
}

export interface SignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dob: string;
  goal?: string;
}

export type SignupResult =
  | { ok: true; user: ClientUser }
  | { ok: false; error: string };

// Creates a new client, assigns the next sequential case ID, and stores
// them in the localStorage signup roster. Returns the new user on
// success or a validation error message.
export function registerClient(input: SignupInput): SignupResult {
  const email = input.email.toLowerCase().trim();
  const first = input.firstName.trim();
  const last = input.lastName.trim();
  if (!first || !last) return { ok: false, error: "First and last name are required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Enter a valid email address." };
  if (input.password.length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dob))
    return { ok: false, error: "Enter date of birth as YYYY-MM-DD." };
  if (getAllClients()[email])
    return { ok: false, error: "An account with this email already exists." };

  const newClient: ClientUser = {
    email,
    password: input.password,
    name: `${first} ${last}`,
    dob: input.dob,
    caseId: nextCaseId(),
    // New signups default to Candace's caseload in the demo. In
    // production a counselor would claim or be auto-assigned.
    counselorEmail: "candace.metcalf@pathwayspro.app",
    counselorName: "Candace Metcalf, CRC",
    goal: input.goal?.trim() || "To be determined with counselor",
    status: "Intake",
    progress: 0,
    role: "client",
    nextAppt: "TBD — schedule with counselor",
  };

  const signups = loadSignups();
  signups[email] = newClient;
  saveSignups(signups);
  return { ok: true, user: newClient };
}

// Returns the full live caseload for a counselor — static demo clients
// plus any self-service signups assigned to them. Sorted by case ID,
// then last name, then first name.
export function getCounselorClients(counselor: CounselorUser): ClientUser[] {
  const all = getAllClients();
  const seen = new Set<string>();
  const out: ClientUser[] = [];
  for (const k of counselor.clientKeys) {
    const c = all[k];
    if (c) {
      out.push(c);
      seen.add(c.email);
    }
  }
  for (const c of Object.values(all)) {
    if (c.counselorEmail === counselor.email && !seen.has(c.email)) {
      out.push(c);
      seen.add(c.email);
    }
  }
  return sortCaseload(out);
}

// Sort order: case ID (numeric tail) ascending, then last name, then
// first name. Used everywhere a caseload is listed so the counselor
// sees a stable, predictable order.
export function sortCaseload(clients: ClientUser[]): ClientUser[] {
  return [...clients].sort((a, b) => {
    const an = caseIdNumber(a.caseId);
    const bn = caseIdNumber(b.caseId);
    if (an !== bn) return an - bn;
    const al = lastName(a.name).toLowerCase();
    const bl = lastName(b.name).toLowerCase();
    if (al !== bl) return al < bl ? -1 : 1;
    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1;
  });
}

function caseIdNumber(caseId: string): number {
  const m = caseId.match(/(\d+)$/);
  return m ? parseInt(m[1], 10) : Number.MAX_SAFE_INTEGER;
}

function lastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1] : fullName;
}

// ── Employment Partners ───────────────────────────────────────────────
// Local businesses, nonprofits, community organizations, and employers
// who participate in supported employment, internships, apprenticeships,
// volunteer placements, and competitive integrated employment.

export const PARTNER_USERS_SEED: Record<string, EmploymentPartnerUser> = {
  "jana.weber@northbranchcafe.com": {
    email: "jana.weber@northbranchcafe.com",
    password: "demo1234",
    name: "Jana Weber",
    title: "Owner / Hiring Manager",
    partnerOrgId: "partner-northbranch",
    partnerOrgName: "North Branch Cafe",
    partnerOrgType: "small-employer",
    participatesInCustomizedEmployment: true,
    role: "partner",
  },
  "outreach@chicagolibraries.org": {
    email: "outreach@chicagolibraries.org",
    password: "demo1234",
    name: "Reggie Park",
    title: "Workforce Development Coordinator",
    partnerOrgId: "partner-cpl-outreach",
    partnerOrgName: "Chicago Public Libraries — Workforce Programs",
    partnerOrgType: "government",
    participatesInCustomizedEmployment: true,
    role: "partner",
  },
  // Neutral pathwayspro.app demo employment partners per spec
  "partner.community@pathwayspro.app": {
    email: "partner.community@pathwayspro.app",
    password: "PartnerDemo1!",
    name: "Casey Lin",
    title: "Owner / Hiring Manager",
    partnerOrgId: "partner-communityco",
    partnerOrgName: "Community Connections Co-op",
    partnerOrgType: "small-employer",
    participatesInCustomizedEmployment: true,
    role: "partner",
  },
  "partner.supported@pathwayspro.app": {
    email: "partner.supported@pathwayspro.app",
    password: "PartnerDemo2!",
    name: "Reese Patel",
    title: "Supported Employment Director",
    partnerOrgId: "partner-brightside",
    partnerOrgName: "Brightside Supported Employment",
    partnerOrgType: "nonprofit",
    participatesInCustomizedEmployment: true,
    role: "partner",
  },
  "partner.internships@pathwayspro.app": {
    email: "partner.internships@pathwayspro.app",
    password: "PartnerDemo3!",
    name: "Jordan Reyes",
    title: "Internship Programs Lead",
    partnerOrgId: "partner-launchnetwork",
    partnerOrgName: "Launch Internship Network",
    partnerOrgType: "community-org",
    participatesInCustomizedEmployment: false,
    role: "partner",
  },
};

const PARTNER_SIGNUP_KEY = "pathways-pro:partner-signups-v1";

function loadPartnerSignups(): Record<string, EmploymentPartnerUser> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PARTNER_SIGNUP_KEY);
    return raw
      ? (JSON.parse(raw) as Record<string, EmploymentPartnerUser>)
      : {};
  } catch {
    return {};
  }
}

export function getAllPartnerUsers(): Record<string, EmploymentPartnerUser> {
  return { ...PARTNER_USERS_SEED, ...loadPartnerSignups() };
}

export interface PartnerSignupInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  title: string;
  partnerOrgName: string;
  partnerOrgType: PartnerOrgType;
  participatesInCustomizedEmployment: boolean;
}

export function registerPartnerUser(
  input: PartnerSignupInput,
):
  | { ok: true; user: EmploymentPartnerUser }
  | { ok: false; error: string } {
  const email = input.email.toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "Enter a valid work email." };
  if (input.password.length < 6)
    return { ok: false, error: "Password must be at least 6 characters." };
  if (!input.partnerOrgName.trim())
    return { ok: false, error: "Organization name is required." };
  if (getAllPartnerUsers()[email])
    return {
      ok: false,
      error: "An account with this email already exists.",
    };
  const user: EmploymentPartnerUser = {
    email,
    password: input.password,
    name: `${input.firstName.trim()} ${input.lastName.trim()}`,
    title: input.title.trim() || "—",
    partnerOrgId: "partner-" + slugify(input.partnerOrgName),
    partnerOrgName: input.partnerOrgName.trim(),
    partnerOrgType: input.partnerOrgType,
    participatesInCustomizedEmployment:
      input.participatesInCustomizedEmployment,
    role: "partner",
  };
  const all = loadPartnerSignups();
  all[email] = user;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(PARTNER_SIGNUP_KEY, JSON.stringify(all));
  }
  return { ok: true, user };
}
