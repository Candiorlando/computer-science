"use client";

// Counselor's own public marketplace profile — visible on the public
// /directory once published. Deliberately has no pricing fields: fees are
// never public, only a description of services and a way to request a
// quote. Available to every counselor (agency-affiliated or solopreneur).

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ExternalLink } from "lucide-react";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { VR_JOB_TITLE_SECTORS } from "@/lib/vr-job-titles";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/service-catalog";
import {
  loadProviderProfile,
  saveProviderProfile,
  quoteRequestsFor,
  updateQuoteStatus,
  type ProviderProfile,
  type QuoteRequest,
} from "@/lib/provider-directory";
import { AddEntityModal } from "@/components/AddEntityModal";

function emptyProfile(counselor: CounselorUser): ProviderProfile {
  return {
    counselorEmail: counselor.email,
    visible: false,
    jobTitle: "Rehabilitation Counselor",
    bio: "",
    licenses: counselor.credentials ? counselor.credentials.split("·").map((s) => s.trim()) : [],
    specializedTraining: [],
    serviceCategories: [],
    publicEmail: counselor.email,
    publicPhone: "",
    location: counselor.office ?? "",
    updatedAt: new Date().toISOString(),
  };
}

export default function ProviderProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [trainingInput, setTrainingInput] = useState("");
  const [saved, setSaved] = useState(false);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [claimQuote, setClaimQuote] = useState<QuoteRequest | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return void router.replace("/signin");
    if (s.role !== "counselor") return void router.replace("/portal");
    setUser(s);
    setProfile(loadProviderProfile(s.email) ?? emptyProfile(s));
    setQuotes(quoteRequestsFor("provider", s.email));
  }, [router]);

  if (!user || !profile) return null;

  function update<K extends keyof ProviderProfile>(key: K, value: ProviderProfile[K]) {
    setProfile((p) => (p ? { ...p, [key]: value } : p));
    setSaved(false);
  }

  function toggleCategory(cat: ServiceCategory) {
    if (!profile) return;
    const has = profile.serviceCategories.includes(cat);
    update(
      "serviceCategories",
      has ? profile.serviceCategories.filter((c) => c !== cat) : [...profile.serviceCategories, cat],
    );
  }

  function addTraining() {
    const v = trainingInput.trim();
    if (!v || !profile) return;
    update("specializedTraining", [...profile.specializedTraining, v]);
    setTrainingInput("");
  }

  function save() {
    if (!profile) return;
    saveProviderProfile(profile);
    setSaved(true);
  }

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Marketplace Profile</p>
        <h1 className="text-3xl tracking-tight">Your public provider profile</h1>
        <p className="text-ink/65 text-sm">
          Corporate and vocational clients browsing the public directory see this —
          your title, credentials, specializations, and the services you offer.{" "}
          <strong>Never your pricing.</strong> Interested visitors request a quote and
          you set your own fees directly.
        </p>
        {profile.visible && (
          <Link
            href={`/directory/provider/${encodeURIComponent(user.email)}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
          >
            View your live public profile <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        )}
      </header>

      <section className="saas-card flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-sm flex items-center gap-2">
            {profile.visible ? <Eye className="w-4 h-4 text-accent" /> : <EyeOff className="w-4 h-4 text-ink/40" />}
            {profile.visible ? "Published to the public directory" : "Not published"}
          </p>
          <p className="text-xs text-ink/55 mt-0.5">
            Toggle on when you&rsquo;re ready to appear in the public marketplace.
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
          <label htmlFor="jobTitle" className="text-sm font-semibold block mb-1.5">
            Job title
          </label>
          <select
            id="jobTitle"
            value={profile.jobTitle}
            onChange={(e) => update("jobTitle", e.target.value)}
            className="w-full border border-ink/20 rounded-md px-3 py-2.5 min-h-[44px] text-sm"
          >
            {VR_JOB_TITLE_SECTORS.map((sec) => (
              <optgroup key={sec.sector} label={sec.sector}>
                {sec.roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="bio" className="text-sm font-semibold block mb-1.5">
            Brief overview
          </label>
          <textarea
            id="bio"
            value={profile.bio}
            onChange={(e) => update("bio", e.target.value)}
            rows={4}
            placeholder="A short description of your practice and approach — no pricing."
            className="w-full border border-ink/20 rounded-md px-3 py-2.5 text-sm"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="licenses" className="text-sm font-semibold block mb-1.5">
              Licenses &amp; certifications
            </label>
            <input
              id="licenses"
              value={profile.licenses.join(", ")}
              onChange={(e) => update("licenses", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
              placeholder="CRC, LPC, LCSW"
              className="w-full border border-ink/20 rounded-md px-3 py-2.5 min-h-[44px] text-sm"
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
              placeholder="Chicago, IL or Virtual"
              className="w-full border border-ink/20 rounded-md px-3 py-2.5 min-h-[44px] text-sm"
            />
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold block mb-1.5">
            Specialized training &amp; CE certifications
          </span>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.specializedTraining.map((t, i) => (
              <span key={i} className="inline-flex items-center gap-1 text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full">
                {t}
                <button
                  onClick={() => update("specializedTraining", profile.specializedTraining.filter((_, j) => j !== i))}
                  aria-label={`Remove ${t}`}
                  className="hover:text-red-600"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={trainingInput}
              onChange={(e) => setTrainingInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTraining())}
              placeholder="e.g. Trauma-Informed Care Certificate"
              className="flex-1 border border-ink/20 rounded-md px-3 py-2.5 min-h-[44px] text-sm"
            />
            <button onClick={addTraining} className="min-h-[44px] px-4 rounded-md border border-ink/20 hover:bg-ink/5 text-sm">
              Add
            </button>
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold block mb-1.5">Services offered (description only)</span>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(CATEGORY_LABELS) as [ServiceCategory, string][]).map(([cat, label]) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                aria-pressed={profile.serviceCategories.includes(cat)}
                className={[
                  "text-xs px-3 py-2 min-h-[40px] rounded-full border transition-colors",
                  profile.serviceCategories.includes(cat)
                    ? "bg-accent text-cream border-accent font-medium"
                    : "border-ink/20 hover:border-accent",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
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
                        setQuotes(quoteRequestsFor("provider", user.email));
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
            setQuotes(quoteRequestsFor("provider", user.email));
          }}
        />
      )}
    </div>
  );
}
