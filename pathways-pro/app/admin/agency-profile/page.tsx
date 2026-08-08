"use client";

// Tenant Admin's editor for their agency's public marketplace profile
// (visible at /directory/agency/[tenantId]). Deliberately has no pricing
// fields — fees stay under the tenant's control, shared only after a
// prospect requests a quote.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { isTenantAdmin } from "@/lib/rbac";
import AccessGuard from "@/components/AccessGuard";
import { getTenant } from "@/lib/tenants";
import {
  loadAgencyProfile,
  saveAgencyProfile,
  quoteRequestsFor,
  updateQuoteStatus,
  type AgencyProfile,
  type QuoteRequest,
} from "@/lib/provider-directory";
import { AddEntityModal } from "@/components/AddEntityModal";

function emptyProfile(tenantId: string): AgencyProfile {
  return {
    tenantId,
    visible: false,
    description: "",
    publicEmail: "",
    publicPhone: "",
    website: "",
    location: "",
    updatedAt: new Date().toISOString(),
  };
}

export default function AgencyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [profile, setProfile] = useState<AgencyProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [claimQuote, setClaimQuote] = useState<QuoteRequest | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return void router.replace("/signin");
    if (s.role !== "counselor") return void router.replace("/portal");
    setUser(s);
    if (s.tenantId) {
      setProfile(loadAgencyProfile(s.tenantId) ?? emptyProfile(s.tenantId));
      setQuotes(quoteRequestsFor("agency", s.tenantId));
    }
  }, [router]);

  if (!user || !profile) return null;

  const tenant = getTenant(user.tenantId);

  function update<K extends keyof AgencyProfile>(key: K, value: AgencyProfile[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
    setSaved(false);
  }

  function save() {
    if (!profile) return;
    saveAgencyProfile(profile);
    setSaved(true);
  }

  return (
    <AccessGuard
      check={isTenantAdmin}
      title="Tenant Administrator access required"
      message="Your agency's public marketplace profile is managed by your Tenant Administrator."
    >
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-widest text-accent">Marketplace Profile</p>
          <h1 className="text-3xl tracking-tight">
            {tenant?.name ?? "Your agency"}&rsquo;s public profile
          </h1>
          <p className="text-ink/65 text-sm">
            Corporate and vocational clients browsing the public directory see
            this — your agency&rsquo;s description, contact information, and
            every counselor who has published their own provider profile.{" "}
            <strong>Never your pricing.</strong> Interested visitors request a
            quote and your team follows up directly.
          </p>
          {profile.visible && (
            <Link
              href={`/directory/agency/${encodeURIComponent(profile.tenantId)}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
            >
              View your live public profile <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </header>

        <section className="saas-card flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-sm">
              {profile.visible ? "Published to the public directory" : "Not published"}
            </p>
            <p className="text-xs text-ink/55 mt-0.5">
              Toggle on when your agency is ready to appear in the public marketplace.
            </p>
          </div>
          <button
            onClick={() => update("visible", !profile.visible)}
            role="switch"
            aria-checked={profile.visible}
            className={[
              "relative w-12 h-7 rounded-full transition-colors shrink-0",
              profile.visible ? "bg-accent" : "bg-ink/20",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform",
                profile.visible ? "translate-x-5" : "",
              ].join(" ")}
            />
          </button>
        </section>

        <section className="saas-card space-y-4">
          <div>
            <label htmlFor="description" className="text-sm font-semibold block mb-1.5">
              About your agency
            </label>
            <textarea
              id="description"
              value={profile.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              placeholder="A short description of your agency's focus and services — no pricing."
              className="w-full border border-ink/20 rounded-md px-3 py-2.5 text-sm"
            />
          </div>
          <div>
            <label htmlFor="location" className="text-sm font-semibold block mb-1.5">
              Location
            </label>
            <input
              id="location"
              value={profile.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Chicago, IL"
              className="w-full border border-ink/20 rounded-md px-3 py-2.5 min-h-[44px] text-sm"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="publicEmail" className="text-sm font-semibold block mb-1.5">
                Public contact email
              </label>
              <input
                id="publicEmail"
                type="email"
                value={profile.publicEmail}
                onChange={(e) => update("publicEmail", e.target.value)}
                className="w-full border border-ink/20 rounded-md px-3 py-2.5 min-h-[44px] text-sm"
              />
            </div>
            <div>
              <label htmlFor="publicPhone" className="text-sm font-semibold block mb-1.5">
                Public phone (optional)
              </label>
              <input
                id="publicPhone"
                value={profile.publicPhone}
                onChange={(e) => update("publicPhone", e.target.value)}
                className="w-full border border-ink/20 rounded-md px-3 py-2.5 min-h-[44px] text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="website" className="text-sm font-semibold block mb-1.5">
              Website (optional)
            </label>
            <input
              id="website"
              value={profile.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://…"
              className="w-full border border-ink/20 rounded-md px-3 py-2.5 min-h-[44px] text-sm"
            />
          </div>
          <p className="text-xs text-ink/55">
            Individual counselors publish their own credentials, specialties,
            and bio from{" "}
            <Link href="/provider-profile" className="text-accent hover:underline">
              their Marketplace Profile
            </Link>{" "}
            — they automatically appear on your agency&rsquo;s public page once
            published.
          </p>
          <div className="flex items-center gap-3">
            <button onClick={save} className="min-h-[44px] px-5 rounded-md grad-tealblue text-white text-sm font-semibold">
              Save profile
            </button>
            {saved && <span className="text-sm text-accent font-medium">✓ Saved</span>}
          </div>
        </section>

        {quotes.length > 0 && (
          <section className="saas-card space-y-3">
            <h2 className="font-semibold text-sm">Quote requests from your public profile</h2>
            <ul className="space-y-2">
              {quotes.map((q) => (
                <li key={q.id} className="border border-ink/10 rounded-md p-3 text-sm space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">
                      {q.fromName} {q.fromOrganization && `· ${q.fromOrganization}`}
                    </span>
                    <span className="text-xs text-ink/50">{new Date(q.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-ink/70">{q.message}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-xs text-ink/55">
                      Reply at{" "}
                      <a href={`mailto:${q.fromEmail}`} className="text-accent hover:underline">
                        {q.fromEmail}
                      </a>
                    </p>
                    <button
                      onClick={() => setClaimQuote(q)}
                      className="text-xs text-accent hover:underline font-medium"
                    >
                      Add as business client →
                    </button>
                    {q.status === "new" && (
                      <button
                        onClick={() => {
                          updateQuoteStatus(q.id, "contacted");
                          setQuotes(quoteRequestsFor("agency", profile.tenantId));
                        }}
                        className="text-xs text-ink/55 hover:underline"
                      >
                        Mark as contacted
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {claimQuote && (
          <AddEntityModal
            counselor={user}
            initial={{
              entityType: "business",
              firstName: claimQuote.fromName.split(" ")[0] ?? "",
              lastName: claimQuote.fromName.split(" ").slice(1).join(" "),
              email: claimQuote.fromEmail,
              orgName: claimQuote.fromOrganization,
            }}
            onClose={() => setClaimQuote(null)}
            onSuccess={() => {
              updateQuoteStatus(claimQuote.id, "converted");
              setQuotes(quoteRequestsFor("agency", profile.tenantId));
            }}
          />
        )}
      </div>
    </AccessGuard>
  );
}
