"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import {
  ASSESSMENT_CATEGORIES,
  type AdministrationLevel,
  type Assessment,
  type AssessmentCost,
} from "@/lib/clinical-assessments";

export default function ClinicalAssessmentsPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [query, setQuery] = useState("");
  const [costFilter, setCostFilter] = useState<AssessmentCost | "all">("all");
  const [adminFilter, setAdminFilter] = useState<AdministrationLevel | "all">(
    "all",
  );

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setAuthorized(true);
  }, [router]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ASSESSMENT_CATEGORIES.map((cat) => ({
      ...cat,
      assessments: cat.assessments.filter((a) => {
        if (costFilter !== "all" && a.cost !== costFilter) return false;
        if (adminFilter !== "all" && a.administration !== adminFilter)
          return false;
        if (!q) return true;
        const hay = [
          a.name,
          a.acronym,
          a.publisher,
          a.population,
          a.domain,
          a.description,
          ...a.bestFor,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      }),
    })).filter((cat) => cat.assessments.length > 0);
  }, [query, costFilter, adminFilter]);

  const totalCount = filtered.reduce((s, c) => s + c.assessments.length, 0);

  if (!authorized) return null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Clinical Assessment Library
        </p>
        <h1 className="text-4xl mb-2">VR Assessments by Purpose</h1>
        <p className="text-ink/70 prose-narrow">
          Instruments used by Certified Rehabilitation Counselors. Organized
          by domain, with explicit cost and administration-level flags so you
          know whether to administer in-office, refer to a psychologist, or
          send the client to take it themselves.
        </p>
      </header>

      <section className="border border-ink/15 rounded-lg p-4 bg-cream space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, population, domain, or 'best for'…"
          className="w-full bg-white border border-ink/15 rounded px-3 py-2 focus:outline-none focus:border-accent text-sm"
        />
        <div className="flex flex-wrap gap-3 text-sm">
          <div>
            <span className="text-xs uppercase tracking-wider text-ink/60 mr-2">
              Cost
            </span>
            <FilterChip
              active={costFilter === "all"}
              onClick={() => setCostFilter("all")}
            >
              All
            </FilterChip>
            <FilterChip
              active={costFilter === "free"}
              onClick={() => setCostFilter("free")}
            >
              Free
            </FilterChip>
            <FilterChip
              active={costFilter === "proprietary"}
              onClick={() => setCostFilter("proprietary")}
            >
              Proprietary
            </FilterChip>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-ink/60 mr-2">
              Administered by
            </span>
            <FilterChip
              active={adminFilter === "all"}
              onClick={() => setAdminFilter("all")}
            >
              All
            </FilterChip>
            <FilterChip
              active={adminFilter === "self-administered"}
              onClick={() => setAdminFilter("self-administered")}
            >
              Client
            </FilterChip>
            <FilterChip
              active={adminFilter === "counselor-administered"}
              onClick={() => setAdminFilter("counselor-administered")}
            >
              Counselor (you)
            </FilterChip>
            <FilterChip
              active={adminFilter === "licensed-professional"}
              onClick={() => setAdminFilter("licensed-professional")}
            >
              Licensed professional
            </FilterChip>
          </div>
        </div>
        <p className="text-xs text-ink/60">
          {totalCount} assessment{totalCount === 1 ? "" : "s"} match
        </p>
      </section>

      {filtered.map((cat) => (
        <section key={cat.category}>
          <div className="mb-3 pb-2 border-b border-ink/10">
            <h2 className="text-2xl">
              {cat.icon} {cat.category}
            </h2>
            <p className="text-sm text-ink/70 mt-1">{cat.description}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {cat.assessments.map((a) => (
              <AssessmentCard key={a.name} assessment={a} />
            ))}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-ink/50 py-12">
          No assessments match your filters.
        </p>
      )}

      <section className="border border-amber-300 bg-amber-50 rounded-lg p-5 text-sm">
        <h2 className="font-semibold text-amber-900 mb-2">
          ⚠️ Counselor responsibilities
        </h2>
        <ul className="space-y-1 text-amber-900/90 list-disc pl-5">
          <li>
            Only administer or interpret assessments within your scope of
            practice and credential (CRC, LPC, LCPC, licensed psychologist).
          </li>
          <li>
            Proprietary instruments require an active subscription or qualified
            purchaser status with the publisher.
          </li>
          <li>
            Document informed consent before administering any psychological
            assessment.
          </li>
          <li>
            Cite assessment results in the IPE only when they directly inform
            services authorized.
          </li>
        </ul>
      </section>
    </div>
  );
}

function FilterChip({
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
      onClick={onClick}
      className={`text-xs px-3 py-1 rounded-full border mr-1 ${
        active
          ? "bg-accent text-cream border-accent font-semibold"
          : "border-ink/20 hover:border-accent"
      }`}
    >
      {children}
    </button>
  );
}

function AssessmentCard({ assessment: a }: { assessment: Assessment }) {
  const costStyles = {
    free: "bg-green-100 text-green-800",
    proprietary: "bg-amber-100 text-amber-800",
    varies: "bg-blue-100 text-blue-800",
  } as const;
  const adminLabels = {
    "self-administered": "Client",
    "counselor-administered": "Counselor",
    "licensed-professional": "Licensed prof.",
  } as const;

  return (
    <article className="border border-ink/15 rounded-lg p-4 bg-cream flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-base">
            {a.name}{" "}
            {a.acronym && (
              <span className="text-ink/50 font-normal text-sm">
                ({a.acronym})
              </span>
            )}
          </h3>
          <p className="text-xs text-ink/60">{a.publisher}</p>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${costStyles[a.cost]}`}
        >
          {a.cost === "free" ? "Free" : a.cost === "proprietary" ? "Paid" : "Varies"}
        </span>
      </div>

      <p className="text-sm text-ink/80">{a.description}</p>

      <dl className="text-xs grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 mt-1">
        <dt className="text-ink/50 uppercase tracking-wider">Domain</dt>
        <dd className="text-ink/80">{a.domain}</dd>
        <dt className="text-ink/50 uppercase tracking-wider">Population</dt>
        <dd className="text-ink/80">{a.population}</dd>
        <dt className="text-ink/50 uppercase tracking-wider">Time</dt>
        <dd className="text-ink/80">{a.time}</dd>
        <dt className="text-ink/50 uppercase tracking-wider">Admin by</dt>
        <dd className="text-ink/80">{adminLabels[a.administration]}</dd>
      </dl>

      <div className="text-xs">
        <div className="text-ink/50 uppercase tracking-wider mb-1">
          Best for
        </div>
        <ul className="list-disc pl-4 text-ink/80 space-y-0.5">
          {a.bestFor.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>

      {a.notes && (
        <p className="text-xs italic text-ink/60 border-t border-ink/10 pt-2">
          💡 {a.notes}
        </p>
      )}

      <a
        href={a.url}
        target="_blank"
        rel="noreferrer"
        className="mt-auto inline-block border border-ink/20 px-3 py-1.5 rounded hover:border-accent hover:bg-accent/5 text-sm self-start"
      >
        Open {a.acronym || a.name} ↗
      </a>
    </article>
  );
}
