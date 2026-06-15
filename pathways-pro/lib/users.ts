// Mock user database for Pathways Pro.
// In production this would be a real auth backend (Auth0, Supabase, etc.).
// Source: pathways-pro-v3.jsx (Google Drive — Pathways Pro project folder).

export type Role = "counselor" | "client";

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

export type AnyUser = CounselorUser | ClientUser;

export const COUNSELORS: Record<string, CounselorUser> = {
  "candace.metcalf@idhs.illinois.gov": {
    email: "candace.metcalf@idhs.illinois.gov",
    password: "CRC2026!",
    name: "Candace Metcalf",
    credentials: "CRC · LPC",
    office: "Ford City Office — Chicago, IL",
    agency: "IDHS-DRS",
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
    clientKeys: ["demo.client@pathwayspro.app"],
  },
};

export const CLIENTS: Record<string, ClientUser> = {
  "jordan.hayes@vr.client": {
    email: "jordan.hayes@vr.client",
    password: "client1234",
    name: "Jordan Hayes",
    dob: "1991-03-14",
    caseId: "VR-2026-0041",
    counselorEmail: "candace.metcalf@idhs.illinois.gov",
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
    counselorEmail: "candace.metcalf@idhs.illinois.gov",
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
    counselorEmail: "candace.metcalf@idhs.illinois.gov",
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
    counselorEmail: "candace.metcalf@idhs.illinois.gov",
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
    counselorEmail: "candace.metcalf@idhs.illinois.gov",
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
};

export function authenticate(
  email: string,
  password: string,
  role: Role,
): AnyUser | null {
  const db = role === "counselor" ? COUNSELORS : CLIENTS;
  const record = db[email.toLowerCase().trim()];
  if (record && record.password === password) return record;
  return null;
}
