"use client";
import { useEffect, useRef, useState } from "react";

type Key = "goals" | "tasks" | "assessments" | "advocacy";
const teal = "#0ea5a4",
  ink = "#1f2937",
  line = "#d8d2c4",
  paper = "#fffdf8";

const CARDS: { key: Key; icon: string; label: string }[] = [
  { key: "goals", icon: "🎯", label: "Goals Identified" },
  { key: "tasks", icon: "✓", label: "Tasks Completed" },
  { key: "assessments", icon: "📝", label: "Assessments Completed" },
  { key: "advocacy", icon: "⚖️", label: "Self-Advocacy Actions" },
];

interface SavedGoal {
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timebound: string;
  area?: string;
  createdAt: string;
}

export default function InteractiveProgress() {
  const [open, setOpen] = useState<Key | null>(null);
  const [counts, setCounts] = useState<Record<Key, number>>({
    goals: 0,
    tasks: 0,
    assessments: 0,
    advocacy: 0,
  });

  useEffect(() => {
    const g = JSON.parse(
      localStorage.getItem("pp_goals") || "[]",
    ) as SavedGoal[];
    setCounts((c) => ({ ...c, goals: g.length }));
  }, [open]);

  return (
    <section style={{ fontFamily: "Georgia, serif" }}>
      <h2 style={{ color: ink }}>What you&rsquo;ve done</h2>
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
      >
        {CARDS.map((c) => (
          <button
            key={c.key}
            onClick={() => setOpen(c.key)}
            style={{
              textAlign: "left",
              cursor: "pointer",
              background: paper,
              border: `1px solid ${line}`,
              borderRadius: 12,
              padding: 20,
              transition: "transform .1s, box-shadow .1s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "0 4px 14px rgba(0,0,0,.08)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <div style={{ fontSize: 26 }}>{c.icon}</div>
            <div style={{ color: teal, fontSize: 22, fontWeight: 700 }}>
              {counts[c.key]}
            </div>
            <div
              style={{
                letterSpacing: 1,
                color: "#6b7280",
                textTransform: "uppercase",
                fontSize: 13,
              }}
            >
              {c.label}
            </div>
            <div style={{ color: teal, marginTop: 8, fontSize: 14 }}>
              Open →
            </div>
          </button>
        ))}
      </div>

      {open && (
        <Modal
          title={CARDS.find((c) => c.key === open)!.label}
          onClose={() => setOpen(null)}
        >
          {open === "goals" ? <GoalApparatus /> : <SimpleList kind={open} />}
        </Modal>
      )}
    </section>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Focus management: move focus into the dialog on open, trap Tab
  // inside it, dismiss on Escape, and restore focus to the opener
  // when the dialog closes.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      opener?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.4)",
        display: "grid",
        placeItems: "center",
        zIndex: 50,
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: paper,
          borderRadius: 14,
          padding: 24,
          width: "min(640px,92vw)",
          maxHeight: "88vh",
          overflow: "auto",
          fontFamily: "Georgia, serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3 style={{ margin: 0, color: ink }}>{title}</h3>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label={`Close ${title} dialog`}
            style={{
              border: "none",
              background: "none",
              fontSize: 22,
              cursor: "pointer",
              minWidth: 44,
              minHeight: 44,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ marginTop: 12 }}>{children}</div>
      </div>
    </div>
  );
}

/* ---- Goals: a short assessment, then a SMART goal builder ---- */
const AREAS = [
  "Career direction",
  "Skills & training",
  "Confidence",
  "Support network",
  "Job-search readiness",
];

function GoalApparatus() {
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [goal, setGoal] = useState({
    specific: "",
    measurable: "",
    achievable: "",
    relevant: "",
    timebound: "",
  });
  const [saved, setSaved] = useState<SavedGoal[]>([]);

  useEffect(
    () =>
      setSaved(
        JSON.parse(localStorage.getItem("pp_goals") || "[]") as SavedGoal[],
      ),
    [],
  );
  const focus = AREAS.slice().sort(
    (a, b) => (ratings[a] ?? 3) - (ratings[b] ?? 3),
  )[0];

  function save() {
    if (!goal.specific) return;
    const next: SavedGoal[] = [
      ...saved,
      { ...goal, area: focus, createdAt: new Date().toISOString() },
    ];
    localStorage.setItem("pp_goals", JSON.stringify(next));
    setSaved(next);
    setGoal({
      specific: "",
      measurable: "",
      achievable: "",
      relevant: "",
      timebound: "",
    });
  }

  return (
    <div style={{ color: ink }}>
      <h4>1 · Where are you now?</h4>
      {AREAS.map((a) => (
        <div
          key={a}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            margin: "6px 0",
          }}
        >
          <span>{a}</span>
          <input
            type="range"
            min={1}
            max={5}
            value={ratings[a] ?? 3}
            onChange={(e) =>
              setRatings((r) => ({ ...r, [a]: +e.target.value }))
            }
          />
        </div>
      ))}
      <p style={{ color: teal }}>
        Suggested focus: <strong>{focus}</strong>
      </p>

      <h4>2 · Build a SMART goal</h4>
      {(
        [
          ["specific", "Specific — what exactly do you want to achieve?"],
          ["measurable", "Measurable — how will you know it's done?"],
          ["achievable", "Achievable — what's the first realistic step?"],
          ["relevant", "Relevant — why does this matter to you?"],
          ["timebound", "Time-bound — by when?"],
        ] as const
      ).map(([k, label]) => (
        <label key={k} style={{ display: "block", margin: "8px 0" }}>
          <div style={{ fontSize: 14, color: "#6b7280" }}>{label}</div>
          <input
            value={goal[k]}
            onChange={(e) => setGoal((g) => ({ ...g, [k]: e.target.value }))}
            style={{
              width: "100%",
              padding: 10,
              border: `1px solid ${line}`,
              borderRadius: 8,
            }}
          />
        </label>
      ))}
      <button
        onClick={save}
        style={{
          background: teal,
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 16px",
          cursor: "pointer",
        }}
      >
        Save goal
      </button>

      {saved.length > 0 && (
        <>
          <h4 style={{ marginTop: 20 }}>Your goals</h4>
          {saved.map((g, i) => (
            <div
              key={i}
              style={{
                borderLeft: `3px solid ${teal}`,
                padding: "4px 12px",
                margin: "8px 0",
              }}
            >
              <strong>{g.specific}</strong>
              <div style={{ color: "#6b7280", fontSize: 14 }}>
                {g.area} · by {g.timebound || "—"}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

/* ---- Stubs for the other three (same pattern; flesh out as needed) ---- */
function SimpleList({ kind }: { kind: Key }) {
  const seed: Record<string, string[]> = {
    tasks: [
      "Update intake form",
      "Upload ID document",
      "Confirm next appointment",
    ],
    assessments: [
      "Interest inventory",
      "Skills self-assessment",
      "Work-readiness check",
    ],
    advocacy: [
      "Requested an accommodation",
      "Asked a clarifying question",
      "Spoke up in a meeting",
    ],
  };
  const [items] = useState(seed[kind] ?? []);
  return (
    <ul style={{ color: ink }}>
      {items.map((t) => (
        <li key={t} style={{ margin: "6px 0" }}>
          {t}
        </li>
      ))}
    </ul>
  );
}
