"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Mail, Phone, ArrowLeft } from "lucide-react";
import { getPublicProviderListing, type PublicProviderListing } from "@/lib/provider-directory";
import { seedProviderDirectory } from "@/lib/provider-directory-seed";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/service-catalog";
import { QuoteRequestForm } from "@/components/QuoteRequestForm";

export default function PublicProviderPage() {
  const params = useParams();
  const email = decodeURIComponent(String(params.email));
  const [listing, setListing] = useState<PublicProviderListing | null | undefined>(undefined);

  useEffect(() => {
    seedProviderDirectory();
    setListing(getPublicProviderListing(email));
  }, [email]);

  if (listing === undefined) return null;

  if (listing === null) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-3">
        <h1 className="text-2xl font-semibold">Profile not found</h1>
        <p className="text-ink/60">
          This provider hasn&rsquo;t published a public profile, or the link is
          incorrect.
        </p>
        <Link href="/directory" className="text-accent hover:underline text-sm inline-block mt-2">
          ← Back to the directory
        </Link>
      </div>
    );
  }

  const { profile, counselor, agency } = listing;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/directory" className="text-sm text-ink/55 hover:text-accent inline-flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to directory
      </Link>

      <header className="border border-ink/15 rounded-xl p-6 bg-white space-y-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-accent">{profile.jobTitle}</p>
          <h1 className="text-3xl font-bold tracking-tight">{counselor.name}</h1>
          {agency && (
            <Link href={`/directory/agency/${encodeURIComponent(agency.id)}`} className="text-sm text-ink/60 hover:text-accent">
              {agency.name}
            </Link>
          )}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-ink/65">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {profile.location}
            </span>
          )}
          {profile.publicEmail && (
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {profile.publicEmail}
            </span>
          )}
          {profile.publicPhone && (
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> {profile.publicPhone}
            </span>
          )}
        </div>
        {profile.licenses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {profile.licenses.map((l) => (
              <span key={l} className="text-xs bg-accent/10 text-accent px-2.5 py-1 rounded-full font-medium">
                {l}
              </span>
            ))}
          </div>
        )}
      </header>

      {profile.bio && (
        <section className="border border-ink/15 rounded-xl p-6 bg-white">
          <h2 className="font-semibold mb-2">About</h2>
          <p className="text-sm text-ink/75 leading-relaxed">{profile.bio}</p>
        </section>
      )}

      {profile.specializedTraining.length > 0 && (
        <section className="border border-ink/15 rounded-xl p-6 bg-white">
          <h2 className="font-semibold mb-2">Specialized training &amp; CE certifications</h2>
          <div className="flex flex-wrap gap-2">
            {profile.specializedTraining.map((t) => (
              <span key={t} className="text-xs border border-ink/15 px-2.5 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {profile.serviceCategories.length > 0 && (
        <section className="border border-ink/15 rounded-xl p-6 bg-white">
          <h2 className="font-semibold mb-2">Services offered</h2>
          <p className="text-xs text-ink/55 mb-3">
            Descriptions only — pricing is set independently and shared after you request a quote.
          </p>
          <div className="flex flex-wrap gap-2">
            {profile.serviceCategories.map((c: ServiceCategory) => (
              <span key={c} className="text-xs bg-ink/5 text-ink/70 px-2.5 py-1 rounded-full">
                {CATEGORY_LABELS[c]}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="border border-ink/15 rounded-xl p-6 bg-white">
        <h2 className="font-semibold mb-3">Request a quote</h2>
        <QuoteRequestForm toType="provider" toId={counselor.email} toLabel={counselor.name} />
      </section>
    </div>
  );
}
