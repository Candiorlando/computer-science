"use client";

// Public provider marketplace — no account required. Corporate and
// vocational clients browse agencies and individual counselors, see
// credentials/specialties/services (never pricing), and request a quote.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Building2, UserRound, Search } from "lucide-react";
import {
  listPublicAgencies,
  searchPublicProviders,
  type PublicAgencyListing,
  type PublicProviderListing,
} from "@/lib/provider-directory";
import { seedProviderDirectory } from "@/lib/provider-directory-seed";
import { CATEGORY_LABELS, type ServiceCategory } from "@/lib/service-catalog";

export default function DirectoryPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ServiceCategory | "all">("all");
  const [tab, setTab] = useState<"all" | "agencies" | "providers">("all");
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    seedProviderDirectory();
    setSeeded(true);
  }, []);

  const providers = useMemo(
    () => searchPublicProviders(query, category === "all" ? undefined : category),
    [query, category, seeded],
  );
  const agencies = useMemo(() => {
    const all = listPublicAgencies();
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((a) =>
      [a.tenant.name, a.profile.description, a.profile.location]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query, seeded]);

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-xs uppercase tracking-widest text-accent mb-1">
          Provider Marketplace
        </p>
        <h1 className="text-4xl font-bold tracking-tight">
          Find a rehabilitation counselor or agency
        </h1>
        <p className="text-ink/65 mt-2">
          Browse agency and individual provider profiles across the
          Pathways Pro continuum of vocational rehabilitation services —
          credentials, specialties, and services offered. Fees aren&rsquo;t
          listed publicly; request a quote directly from any profile and
          the provider or agency will follow up with pricing.
        </p>
      </header>

      <div className="space-y-3">
        <div className="relative max-w-lg">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, credential, specialty, or location…"
            className="w-full border border-ink/20 rounded-md pl-9 pr-3 py-2.5 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <TabBtn active={tab === "all"} onClick={() => setTab("all")}>
            All ({agencies.length + providers.length})
          </TabBtn>
          <TabBtn active={tab === "agencies"} onClick={() => setTab("agencies")}>
            Agencies ({agencies.length})
          </TabBtn>
          <TabBtn active={tab === "providers"} onClick={() => setTab("providers")}>
            Individual Providers ({providers.length})
          </TabBtn>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs uppercase tracking-wider text-ink/50 mr-1">
            Service:
          </span>
          <CategoryPill
            active={category === "all"}
            onClick={() => setCategory("all")}
            label="All services"
          />
          {(Object.entries(CATEGORY_LABELS) as [ServiceCategory, string][]).map(
            ([k, label]) => (
              <CategoryPill
                key={k}
                active={category === k}
                onClick={() => setCategory(k)}
                label={label.replace(/^[^a-zA-Z]+/, "")}
              />
            ),
          )}
        </div>
      </div>

      {(tab === "all" || tab === "agencies") && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Agencies</h2>
          {agencies.length === 0 ? (
            <Empty>No agencies match your search yet.</Empty>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {agencies.map((a) => (
                <AgencyCard key={a.tenant.id} listing={a} />
              ))}
            </div>
          )}
        </section>
      )}

      {(tab === "all" || tab === "providers") && (
        <section>
          <h2 className="text-xl font-semibold mb-3">Individual providers</h2>
          {providers.length === 0 ? (
            <Empty>No providers match your search yet.</Empty>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {providers.map((p) => (
                <ProviderCard key={p.counselor.email} listing={p} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function AgencyCard({ listing }: { listing: PublicAgencyListing }) {
  return (
    <Link
      href={`/directory/agency/${encodeURIComponent(listing.tenant.id)}`}
      className="border border-ink/15 rounded-xl p-5 bg-white hover:shadow-md hover:border-accent/40 transition block"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent grid place-items-center flex-shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-ink">{listing.tenant.name}</h3>
          {listing.profile.location && (
            <p className="text-xs text-ink/55 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" /> {listing.profile.location}
            </p>
          )}
        </div>
      </div>
      <p className="text-sm text-ink/70 mt-3 line-clamp-3">
        {listing.profile.description}
      </p>
      <p className="text-xs text-accent font-semibold mt-3">
        {listing.providerCount} provider{listing.providerCount === 1 ? "" : "s"} listed →
      </p>
    </Link>
  );
}

function ProviderCard({ listing }: { listing: PublicProviderListing }) {
  return (
    <Link
      href={`/directory/provider/${encodeURIComponent(listing.counselor.email)}`}
      className="border border-ink/15 rounded-xl p-5 bg-white hover:shadow-md hover:border-accent/40 transition block"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent grid place-items-center flex-shrink-0">
          <UserRound className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-ink">{listing.counselor.name}</h3>
          <p className="text-xs text-ink/55">{listing.profile.jobTitle}</p>
          {listing.agency && (
            <p className="text-xs text-ink/50 mt-0.5">{listing.agency.name}</p>
          )}
        </div>
      </div>
      {listing.profile.location && (
        <p className="text-xs text-ink/55 flex items-center gap-1 mt-2">
          <MapPin className="w-3 h-3" /> {listing.profile.location}
        </p>
      )}
      <p className="text-sm text-ink/70 mt-2 line-clamp-2">{listing.profile.bio}</p>
      {listing.profile.licenses.length > 0 && (
        <p className="text-xs text-ink/60 mt-2">
          {listing.profile.licenses.join(" · ")}
        </p>
      )}
    </Link>
  );
}

function CategoryPill({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`text-xs px-3 py-1.5 rounded-full font-semibold transition ${
        active
          ? "grad-tealblue text-white"
          : "border border-ink/15 text-ink/70 hover:border-emerald-500"
      }`}
    >
      {label}
    </button>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`text-sm px-3 py-1.5 rounded-full font-semibold transition ${
        active
          ? "bg-accent text-white"
          : "bg-white border border-ink/15 hover:bg-ink/5"
      }`}
    >
      {children}
    </button>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-dashed border-ink/20 rounded-lg p-6 text-center text-ink/55">
      {children}
    </div>
  );
}
