"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ASSESSMENT_TOOLS,
  type AssessmentTool,
} from "@/lib/assessment-tools";
import {
  SERVICE_CATALOG,
  type CatalogService,
} from "@/lib/service-catalog";

type Picked =
  | { kind: "assessment"; tool: AssessmentTool }
  | { kind: "service"; service: CatalogService };

interface Props {
  onSelect?: (picked: Picked) => void;
  label?: string;
}

// A grouped popover dropdown used to attach an assessment or service
// to a Service Order. Three groups: vocational assessments,
// client-facing services, employer-facing services. The trigger is
// styled to match other primary action buttons; click outside or
// pressing Esc closes the popover.
export function AddServiceAssessmentDropdown({
  onSelect,
  label = "+ Add Service / Assessment",
}: Props) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const groups = useMemo(() => {
    // Vocational assessments — prefer standardized instruments (tools
    // that carry a counselorRoles tag) so the list is digestible.
    const standardized = ASSESSMENT_TOOLS.filter((t) => t.counselorRoles);
    const vocAssessments = standardized.length > 0 ? standardized : ASSESSMENT_TOOLS;

    const clientServices = SERVICE_CATALOG.filter(
      (s) => s.category === "client-services",
    );
    const employerServices = SERVICE_CATALOG.filter((s) =>
      ["ada-compliance", "business-engagement", "workforce-consulting"].includes(
        s.category,
      ),
    );

    const needle = q.trim().toLowerCase();
    const match = (text: string) =>
      !needle || text.toLowerCase().includes(needle);

    return {
      vocAssessments: vocAssessments.filter(
        (t) => match(t.title) || match(t.description),
      ),
      clientServices: clientServices.filter(
        (s) => match(s.title) || match(s.description),
      ),
      employerServices: employerServices.filter(
        (s) => match(s.title) || match(s.description),
      ),
    };
  }, [q]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();

    function onDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(picked: Picked) {
    const title =
      picked.kind === "assessment" ? picked.tool.title : picked.service.title;
    // eslint-disable-next-line no-console
    console.log(
      `[AddServiceAssessment] picked ${picked.kind}: ${title}`,
      picked,
    );
    onSelect?.(picked);
    setToast(`Added "${title}" — backend hookup pending.`);
    setOpen(false);
    setQ("");
    window.setTimeout(() => setToast(null), 3500);
  }

  const totalShown =
    groups.vocAssessments.length +
    groups.clientServices.length +
    groups.employerServices.length;

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="text-xs grad-tealblue text-white font-semibold px-3 py-1.5 rounded-md shadow-sm hover:shadow"
      >
        {label}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Add service or assessment"
          className="absolute right-0 mt-2 w-[min(420px,92vw)] max-h-[70vh] overflow-auto bg-white border border-ink/15 rounded-lg shadow-xl z-30"
        >
          <div className="sticky top-0 bg-white border-b border-ink/10 p-2">
            <input
              ref={searchRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search assessments and services…"
              aria-label="Search"
              className="w-full text-sm bg-cream/40 border border-ink/15 rounded px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            />
            {q && (
              <div className="text-[10px] text-ink/55 mt-1 px-1">
                {totalShown} match{totalShown === 1 ? "" : "es"}
              </div>
            )}
          </div>

          <Group title="Vocational Assessments" items={groups.vocAssessments}>
            {(t) => (
              <DropdownItem
                key={`a-${t.id}`}
                title={t.title}
                hint={t.description}
                onClick={() => pick({ kind: "assessment", tool: t })}
              />
            )}
          </Group>

          <Group title="Client-Facing Services" items={groups.clientServices}>
            {(s) => (
              <DropdownItem
                key={`c-${s.id}`}
                title={s.title}
                hint={s.description}
                onClick={() => pick({ kind: "service", service: s })}
              />
            )}
          </Group>

          <Group
            title="Employer-Facing Services"
            items={groups.employerServices}
          >
            {(s) => (
              <DropdownItem
                key={`e-${s.id}`}
                title={s.title}
                hint={s.description}
                onClick={() => pick({ kind: "service", service: s })}
              />
            )}
          </Group>

          {totalShown === 0 && (
            <div className="px-4 py-6 text-center text-xs text-ink/55 italic">
              No matches.
            </div>
          )}
        </div>
      )}

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 bg-ink text-cream px-4 py-2.5 rounded-md shadow-lg text-sm max-w-sm"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function Group<T>({
  title,
  items,
  children,
}: {
  title: string;
  items: T[];
  children: (item: T) => React.ReactNode;
}) {
  if (items.length === 0) return null;
  return (
    <section className="py-1">
      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-ink/55 bg-cream/40 border-b border-ink/5">
        {title}{" "}
        <span className="text-ink/45 font-normal">({items.length})</span>
      </div>
      <ul role="none" className="py-1">
        {items.map((it) => children(it))}
      </ul>
    </section>
  );
}

function DropdownItem({
  title,
  hint,
  onClick,
}: {
  title: string;
  hint?: string;
  onClick: () => void;
}) {
  return (
    <li role="none">
      <button
        type="button"
        role="menuitem"
        onClick={onClick}
        className="w-full text-left px-3 py-2 hover:bg-emerald-50 focus:outline-none focus:bg-emerald-50"
      >
        <div className="font-semibold text-sm">{title}</div>
        {hint && (
          <div className="text-xs text-ink/65 mt-0.5 line-clamp-2">{hint}</div>
        )}
      </button>
    </li>
  );
}
