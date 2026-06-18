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
  if (role === "counselor") {
    const record = COUNSELORS[email.toLowerCase().trim()];
    if (record && record.password === password) return record;
    return null;
  }
  const all = getAllClients();
  const record = all[email.toLowerCase().trim()];
  if (record && record.password === password) return record;
  return null;
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
    counselorEmail: "candace.metcalf@idhs.illinois.gov",
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
