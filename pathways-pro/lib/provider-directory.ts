"use client";

// Public provider marketplace — agency and individual counselor profiles
// that corporate and vocational clients can browse without an account,
// similar to a healthcare provider directory. Deliberately PRICE-FREE:
// public profiles list what a provider does, never what it costs. Fees
// are negotiated directly once a prospect is added to Pathways Pro as a
// business client (see requestQuote() below + the existing
// AddEntityModal/claim-account invite flow).

import type { ServiceCategory } from "./service-catalog";
import { COUNSELORS, type CounselorUser } from "./users";
import { TENANTS, getTenant, type Tenant } from "./tenants";

export interface ProviderProfile {
  counselorEmail: string;
  visible: boolean;
  jobTitle: string;
  bio: string;
  licenses: string[]; // e.g. ["CRC", "LPC"]
  specializedTraining: string[]; // CE certifications / specialty training
  serviceCategories: ServiceCategory[]; // description-only, never priced
  publicEmail: string;
  publicPhone: string;
  location: string;
  updatedAt: string;
}

export interface AgencyProfile {
  tenantId: string;
  visible: boolean;
  description: string;
  publicEmail: string;
  publicPhone: string;
  website: string;
  location: string;
  updatedAt: string;
}

export interface QuoteRequest {
  id: string;
  toType: "provider" | "agency";
  toId: string; // counselorEmail or tenantId
  fromName: string;
  fromEmail: string;
  fromOrganization: string;
  message: string;
  status: "new" | "contacted" | "converted" | "dismissed";
  createdAt: string;
}

// ── persistence ──────────────────────────────────────────────────────
const PROVIDER_KEY = "pathways-pro:provider-profiles-v1";
const AGENCY_KEY = "pathways-pro:agency-profiles-v1";
const QUOTES_KEY = "pathways-pro:quote-requests-v1";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadProviderProfile(email: string): ProviderProfile | null {
  return read<Record<string, ProviderProfile>>(PROVIDER_KEY, {})[email] ?? null;
}

export function saveProviderProfile(profile: ProviderProfile) {
  const all = read<Record<string, ProviderProfile>>(PROVIDER_KEY, {});
  all[profile.counselorEmail] = { ...profile, updatedAt: new Date().toISOString() };
  write(PROVIDER_KEY, all);
}

export function loadAgencyProfile(tenantId: string): AgencyProfile | null {
  return read<Record<string, AgencyProfile>>(AGENCY_KEY, {})[tenantId] ?? null;
}

export function saveAgencyProfile(profile: AgencyProfile) {
  const all = read<Record<string, AgencyProfile>>(AGENCY_KEY, {});
  all[profile.tenantId] = { ...profile, updatedAt: new Date().toISOString() };
  write(AGENCY_KEY, all);
}

// ── public directory listings (visible = true only) ────────────────────
export interface PublicProviderListing {
  profile: ProviderProfile;
  counselor: CounselorUser;
  agency: Tenant | null;
}

export function listPublicProviders(): PublicProviderListing[] {
  const all = read<Record<string, ProviderProfile>>(PROVIDER_KEY, {});
  return Object.values(all)
    .filter((p) => p.visible)
    .map((profile) => {
      const counselor = COUNSELORS[profile.counselorEmail];
      return counselor
        ? { profile, counselor, agency: getTenant(counselor.tenantId) }
        : null;
    })
    .filter((x): x is PublicProviderListing => x !== null);
}

export interface PublicAgencyListing {
  profile: AgencyProfile;
  tenant: Tenant;
  providerCount: number;
}

export function listPublicAgencies(): PublicAgencyListing[] {
  const all = read<Record<string, AgencyProfile>>(AGENCY_KEY, {});
  const providers = listPublicProviders();
  return Object.values(all)
    .filter((p) => p.visible)
    .map((profile) => {
      const tenant = TENANTS[profile.tenantId] ?? getTenant(profile.tenantId);
      if (!tenant) return null;
      const providerCount = providers.filter((p) => p.agency?.id === tenant.id).length;
      return { profile, tenant, providerCount };
    })
    .filter((x): x is PublicAgencyListing => x !== null);
}

export function searchPublicProviders(
  query: string,
  category?: ServiceCategory,
): PublicProviderListing[] {
  const q = query.trim().toLowerCase();
  return listPublicProviders().filter((l) => {
    if (category && !l.profile.serviceCategories.includes(category)) return false;
    if (!q) return true;
    const haystack = [
      l.counselor.name,
      l.profile.jobTitle,
      l.profile.bio,
      l.profile.location,
      l.agency?.name ?? "",
      ...l.profile.licenses,
      ...l.profile.specializedTraining,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

// ── request a quote (public, no auth) ───────────────────────────────────
export function submitQuoteRequest(
  input: Omit<QuoteRequest, "id" | "status" | "createdAt">,
): QuoteRequest {
  const req: QuoteRequest = {
    ...input,
    id: `quote-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
    status: "new",
    createdAt: new Date().toISOString(),
  };
  const all = read<QuoteRequest[]>(QUOTES_KEY, []);
  all.push(req);
  write(QUOTES_KEY, all);
  return req;
}

export function quoteRequestsFor(toType: "provider" | "agency", toId: string): QuoteRequest[] {
  return read<QuoteRequest[]>(QUOTES_KEY, [])
    .filter((q) => q.toType === toType && q.toId === toId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateQuoteStatus(id: string, status: QuoteRequest["status"]) {
  const all = read<QuoteRequest[]>(QUOTES_KEY, []);
  const q = all.find((x) => x.id === id);
  if (q) {
    q.status = status;
    write(QUOTES_KEY, all);
  }
}
