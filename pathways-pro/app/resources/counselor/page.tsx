"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import { COUNSELOR_RESOURCES, totalCounselorTools } from "@/lib/pathways-resources";

export default function CounselorResourcesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const s = loadSession();
    if (!s) {
      router.replace("/");
      return;
    }
    setAuthorized(true);
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNSELOR_RESOURCES;
    return COUNSELOR_RESOURCES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.source.toLowerCase().includes(q) ||
          i.desc.toLowerCase().includes(q),
      ),
    })).filter((c) => c.items.length > 0);
  }, [query]);

  if (!authorized) return null;

  const matchCount = filtered.reduce((s, c) => s + c.items.length, 0);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Counselor Resource Library
        </p>
        <h1 className="text-4xl mb-2">
          {totalCounselorTools} verified tools across {COUNSELOR_RESOURCES.length} categories
        </h1>
        <p className="text-ink/70 prose-narrow">
          All resources audited against publicly published official sources. URLs verified June 8, 2026.
        </p>
      </header>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search tools, sources, or descriptions…"
        className="w-full bg-cream border border-ink/15 rounded-lg px-4 py-3 focus:outline-none focus:border-accent"
      />

      {query && (
        <p className="text-xs text-ink/60">
          {matchCount} match{matchCount === 1 ? "" : "es"} for &ldquo;{query}&rdquo;
        </p>
      )}

      <div className="space-y-10">
        {filtered.map((cat) => (
          <section key={cat.category}>
            <div className="flex items-baseline justify-between mb-4 pb-2 border-b border-ink/10">
              <h2 className="text-xl text-accent">
                {cat.icon} {cat.category}
              </h2>
              <span className="text-xs uppercase tracking-wider text-ink/40">
                {cat.items.length} tool{cat.items.length === 1 ? "" : "s"}
              </span>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {cat.items.map((r) => (
                <a
                  key={r.name}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border border-ink/10 rounded-lg p-4 bg-cream hover:border-accent transition flex flex-col gap-1"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-[10px] uppercase tracking-wider text-accent">
                      {r.source}
                    </span>
                  </div>
                  <p className="text-sm text-ink/70">{r.desc}</p>
                  <span className="text-xs text-ink/40 mt-1 truncate">{r.url}</span>
                </a>
              ))}
            </div>
          </section>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-ink/50 py-12">No tools match your search.</p>
        )}
      </div>
    </div>
  );
}
