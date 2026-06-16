"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import {
  ASSESSMENT_CATEGORIES,
  type AdministrationLevel,
  type Assessment,
  type AssessmentCost,
} from "@/lib/clinical-assessments";
import {
  CLIENTS,
  type ClientUser,
  type CounselorUser,
} from "@/lib/users";
import {
  addAssignment,
  isAssigned,
  loadAssignments,
  removeAssignment,
  type Assignment,
} from "@/lib/assignments";

export default function ClinicalAssessmentsPage() {
  return (
    <Suspense fallback={<p className="text-ink/50">Loading…</p>}>
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const router = useRouter();
  const search = useSearchParams();
  const [user, setUser] = useState<CounselorUser | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(
    search.get("case"),
  );
  const [assignmentsBump, setAssignmentsBump] = useState(0);
  const [query, setQuery] = useState("");
  const [costFilter, setCostFilter] = useState<AssessmentCost | "all">("all");
  const [adminFilter, setAdminFilter] = useState<AdministrationLevel | "all">(
    "all",
  );
  const [hostingFilter, setHostingFilter] = useState<"all" | "in-app" | "external">(
    "all",
  );

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const clients = useMemo(
    () =>
      user
        ? user.clientKeys
            .map((k) => CLIENTS[k])
            .filter((c): c is ClientUser => Boolean(c))
        : [],
    [user],
  );

  const selectedClient = useMemo(
    () => clients.find((c) => c.caseId === selectedCaseId) ?? null,
    [clients, selectedCaseId],
  );

  const assignedNames = useMemo(() => {
    if (!selectedCaseId) return new Set<string>();
    return new Set(
      loadAssignments(selectedCaseId).map((a) => a.assessmentName),
    );
    // bump dep
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCaseId, assignmentsBump]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ASSESSMENT_CATEGORIES.map((cat) => ({
      ...cat,
      assessments: cat.assessments.filter((a) => {
        if (costFilter !== "all" && a.cost !== costFilter) return false;
        if (adminFilter !== "all" && a.administration !== adminFilter)
          return false;
        if (hostingFilter === "in-app" && !a.inAppPath) return false;
        if (hostingFilter === "external" && a.inAppPath) return false;
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
  }, [query, costFilter, adminFilter, hostingFilter]);

  const totalCount = filtered.reduce((s, c) => s + c.assessments.length, 0);

  if (!user) return null;

  function assign(a: Assignment["assessmentName"], asmt: Assessment) {
    if (!selectedCaseId) return;
    addAssignment(selectedCaseId, {
      assessmentName: asmt.name,
      acronym: asmt.acronym,
      inAppPath: asmt.inAppPath,
      externalUrl: asmt.url,
      cost: asmt.cost,
      priceTag: asmt.priceTag,
      domain: asmt.domain,
      time: asmt.time,
      assignedBy: `${user!.name}, ${user!.credentials}`,
      assignedAt: new Date().toISOString(),
      isComplete: false,
    });
    setAssignmentsBump((n) => n + 1);
  }

  function unassign(name: string) {
    if (!selectedCaseId) return;
    removeAssignment(selectedCaseId, name);
    setAssignmentsBump((n) => n + 1);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          Clinical Assessment Library
        </p>
        <h1 className="text-4xl mb-2">VR Assessments by Purpose</h1>
        <p className="text-ink/70 prose-narrow">
          Instruments used by Certified Rehabilitation Counselors. Free
          instruments built directly into Pathways Pro are marked{" "}
          <span className="text-green-700 font-semibold">In-app</span>;
          proprietary instruments show publisher pricing. Pick a client below
          to assign assessments to their case — only what you assign will show
          up on their portal.
        </p>
      </header>

      <ClientPicker
        clients={clients}
        selected={selectedClient}
        onSelect={(id) => {
          setSelectedCaseId(id);
          router.replace(id ? `/clinical-assessments?case=${id}` : "/clinical-assessments");
        }}
      />

      <section className="border border-ink/15 rounded-lg p-4 bg-cream space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, population, domain, or 'best for'…"
          className="w-full bg-white border border-ink/15 rounded px-3 py-2 focus:outline-none focus:border-accent text-sm"
        />
        <div className="flex flex-wrap gap-3 text-sm">
          <FilterGroup label="Hosting">
            <FilterChip
              active={hostingFilter === "all"}
              onClick={() => setHostingFilter("all")}
            >
              All
            </FilterChip>
            <FilterChip
              active={hostingFilter === "in-app"}
              onClick={() => setHostingFilter("in-app")}
            >
              In-app only
            </FilterChip>
            <FilterChip
              active={hostingFilter === "external"}
              onClick={() => setHostingFilter("external")}
            >
              External
            </FilterChip>
          </FilterGroup>
          <FilterGroup label="Cost">
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
          </FilterGroup>
          <FilterGroup label="Administered by">
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
              Counselor
            </FilterChip>
            <FilterChip
              active={adminFilter === "licensed-professional"}
              onClick={() => setAdminFilter("licensed-professional")}
            >
              Licensed prof.
            </FilterChip>
          </FilterGroup>
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
              <AssessmentCard
                key={a.name}
                assessment={a}
                selectedClient={selectedClient}
                isAssigned={assignedNames.has(a.name)}
                onAssign={() => assign(a.name, a)}
                onUnassign={() => unassign(a.name)}
              />
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

function ClientPicker({
  clients,
  selected,
  onSelect,
}: {
  clients: ClientUser[];
  selected: ClientUser | null;
  onSelect: (caseId: string | null) => void;
}) {
  return (
    <section className="border border-accent/30 bg-accent/5 rounded-lg p-4">
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-xs uppercase tracking-wider text-ink/60">
          Assigning for client:
        </span>
        <select
          value={selected?.caseId ?? ""}
          onChange={(e) => onSelect(e.target.value || null)}
          className="bg-white border border-ink/20 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-accent"
        >
          <option value="">— Pick a client to enable assigning —</option>
          {clients.map((c) => (
            <option key={c.caseId} value={c.caseId}>
              {c.name} ({c.caseId})
            </option>
          ))}
        </select>
        {selected && (
          <span className="text-xs text-ink/60">
            {loadAssignments(selected.caseId).length} currently assigned
          </span>
        )}
      </div>
      <p className="text-xs text-ink/60 mt-2">
        The client will see these on their portal under{" "}
        <strong>My Assessments</strong>. Free in-app assessments they can take
        right there; external/paid ones link out with your instructions.
      </p>
    </section>
  );
}

function FilterGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <span className="text-xs uppercase tracking-wider text-ink/60 mr-2">
        {label}
      </span>
      {children}
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

function AssessmentCard({
  assessment: a,
  selectedClient,
  isAssigned,
  onAssign,
  onUnassign,
}: {
  assessment: Assessment;
  selectedClient: ClientUser | null;
  isAssigned: boolean;
  onAssign: () => void;
  onUnassign: () => void;
}) {
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
    <article
      className={`border rounded-lg p-4 flex flex-col gap-2 ${
        isAssigned
          ? "border-accent/50 bg-accent/5"
          : "border-ink/15 bg-cream"
      }`}
    >
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
        <div className="flex flex-col gap-1 items-end">
          {a.inAppPath && (
            <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 whitespace-nowrap">
              ✓ In-app
            </span>
          )}
          <span
            className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full ${costStyles[a.cost]} whitespace-nowrap`}
          >
            {a.cost === "free" ? "Free" : a.cost === "proprietary" ? "Paid" : "Varies"}
          </span>
        </div>
      </div>

      {a.cost !== "free" && a.priceTag && (
        <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded px-2 py-1">
          💰 <strong>Cost:</strong> {a.priceTag}
        </p>
      )}

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

      <div className="mt-auto pt-2 flex flex-wrap gap-2">
        {a.inAppPath ? (
          <Link
            href={a.inAppPath}
            className="bg-emerald-700 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-emerald-800"
          >
            Preview in app →
          </Link>
        ) : (
          <a
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="border border-ink/20 px-3 py-1.5 rounded text-sm hover:border-accent hover:bg-accent/5"
          >
            Open publisher ↗
          </a>
        )}

        {selectedClient &&
          (isAssigned ? (
            <button
              onClick={onUnassign}
              className="border border-accent/50 text-accent bg-white px-3 py-1.5 rounded text-sm font-semibold"
            >
              ✓ Assigned to {selectedClient.name.split(" ")[0]} (click to unassign)
            </button>
          ) : (
            <button
              onClick={onAssign}
              className="bg-accent text-cream px-3 py-1.5 rounded text-sm font-semibold hover:bg-accent/90"
            >
              + Assign to {selectedClient.name.split(" ")[0]}
            </button>
          ))}
        {!selectedClient && (
          <span className="text-xs text-ink/50 self-center">
            Pick a client above to assign
          </span>
        )}
      </div>
    </article>
  );
}
