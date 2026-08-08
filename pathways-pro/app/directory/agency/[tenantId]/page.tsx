"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MapPin, Mail, Phone, Globe, ArrowLeft, UserRound } from "lucide-react";
import {
  getPublicAgencyListing,
  listPublicProviders,
  type PublicAgencyListing,
  type PublicProviderListing,
} from "@/lib/provider-directory";
import { seedProviderDirectory } from "@/lib/provider-directory-seed";
import { QuoteRequestForm } from "@/components/QuoteRequestForm";

export default function PublicAgencyPage() {
  const params = useParams();
  const tenantId = decodeURIComponent(String(params.tenantId));
  const [listing, setListing] = useState<PublicAgencyListing | null | undefined>(undefined);
  const [providers, setProviders] = useState<PublicProviderListing[]>([]);

  useEffect(() => {
    seedProviderDirectory();
    setListing(getPublicAgencyListing(tenantId));
    setProviders(listPublicProviders().filter((p) => p.agency?.id === tenantId));
  }, [tenantId]);

  if (listing === undefined) return null;

  if (listing === null) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-3">
        <h1 className="text-2xl font-semibold">Agency profile not found</h1>
        <p className="text-ink/60">
          This agency hasn&rsquo;t published a public profile, or the link is
          incorrect.
        </p>
        <Link href="/directory" className="text-accent hover:underline text-sm inline-block mt-2">
          ← Back to the directory
        </Link>
      </div>
    );
  }

  const { profile, tenant } = listing;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/directory" className="text-sm text-ink/55 hover:text-accent inline-flex items-center gap-1">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to directory
      </Link>

      <header className="border border-ink/15 rounded-xl p-6 bg-white space-y-3">
        <h1 className="text-3xl font-bold tracking-tight">{tenant.name}</h1>
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
          {profile.website && (
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> {profile.website}
            </span>
          )}
        </div>
      </header>

      {profile.description && (
        <section className="border border-ink/15 rounded-xl p-6 bg-white">
          <h2 className="font-semibold mb-2">About</h2>
          <p className="text-sm text-ink/75 leading-relaxed">{profile.description}</p>
        </section>
      )}

      <section className="border border-ink/15 rounded-xl p-6 bg-white">
        <h2 className="font-semibold mb-3">
          Providers at {tenant.name} ({providers.length})
        </h2>
        {providers.length === 0 ? (
          <p className="text-sm text-ink/55 italic">
            No individually published provider profiles yet.
          </p>
        ) : (
          <ul role="list" className="space-y-2">
            {providers.map((p) => (
              <li key={p.counselor.email}>
                <Link
                  href={`/directory/provider/${encodeURIComponent(p.counselor.email)}`}
                  className="flex items-center gap-3 border border-ink/10 rounded-lg p-3 hover:border-accent/40 hover:shadow-sm transition"
                >
                  <div className="w-9 h-9 rounded-full bg-accent/10 text-accent grid place-items-center flex-shrink-0">
                    <UserRound className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{p.counselor.name}</p>
                    <p className="text-xs text-ink/55">{p.profile.jobTitle}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border border-ink/15 rounded-xl p-6 bg-white">
        <h2 className="font-semibold mb-3">Request a quote</h2>
        <QuoteRequestForm toType="agency" toId={tenant.id} toLabel={tenant.name} />
      </section>
    </div>
  );
}
