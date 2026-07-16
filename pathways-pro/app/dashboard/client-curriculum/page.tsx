"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Users,
  ChevronDown,
  Plus,
  X,
  CheckCircle2,
  ToggleLeft,
  ToggleRight,
  Search,
  GraduationCap,
  PlayCircle,
  Lock,
} from "lucide-react";
import { loadSession } from "@/lib/session";
import type { AnyUser, CounselorUser, ClientUser } from "@/lib/users";
import { CLIENTS, COUNSELORS } from "@/lib/users";
import {
  MASTER_CATALOG,
  COURSE_MAP,
  CLIENT_TYPOLOGIES,
  ensureClientAssignments,
  getClientAssignments,
  getClientTypology,
  setClientTypology,
  assignCourse,
  unassignCourse,
  type AssignedCourse,
  type ClientTypology,
  type CurriculumCourse,
} from "@/lib/curriculum";

export default function ClientCurriculumPage() {
  const router = useRouter();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [clients, setClients] = useState<ClientUser[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string>("");
  const [assignments, setAssignments] = useState<AssignedCourse[]>([]);
  const [typology, setTypology] = useState<ClientTypology | null>(null);
  const [autoAssign, setAutoAssign] = useState(true);
  const [showCatalog, setShowCatalog] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const s = loadSession();
    if (!s || s.role !== "counselor") return void router.replace("/login");
    setUser(s);

    // Get this counselor's clients
    const counselor = s as CounselorUser;
    const clientList = counselor.clientKeys
      .map((key) => CLIENTS[key])
      .filter(Boolean);
    setClients(clientList);
    if (clientList.length > 0) {
      setSelectedEmail(clientList[0].email);
    }
  }, [router]);

  // Load assignments when client changes
  useEffect(() => {
    if (!selectedEmail) return;
    ensureClientAssignments(selectedEmail, "new_disability");
    setAssignments(getClientAssignments(selectedEmail));
    setTypology(getClientTypology(selectedEmail));
  }, [selectedEmail, refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleTypologyChange(newTypology: ClientTypology) {
    setTypology(newTypology);
    setClientTypology(selectedEmail, newTypology, autoAssign);
    refresh();
  }

  function handleToggleAutoAssign() {
    const next = !autoAssign;
    setAutoAssign(next);
    if (typology) {
      setClientTypology(selectedEmail, typology, next);
      refresh();
    }
  }

  function handleAssign(courseId: string) {
    assignCourse(selectedEmail, courseId);
    refresh();
  }

  function handleUnassign(courseId: string) {
    unassignCourse(selectedEmail, courseId);
    refresh();
  }

  const assignedIds = new Set(assignments.map((a) => a.courseId));
  const selectedClient = clients.find((c) => c.email === selectedEmail);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.15em] text-accent font-bold flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Client Curriculum
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-ink">
          Manage Course Assignments
        </h1>
        <p className="text-ink/60 text-sm max-w-2xl">
          Assign vocational training modules to your clients based on
          their rehabilitation profile, or manually curate their
          curriculum.
        </p>
      </header>

      {/* Client selector */}
      <div className="bg-white border border-ink/10 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-accent" />
          <h2 className="font-bold text-sm text-ink">Select Client</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="client-select"
              className="text-xs font-semibold text-ink/60 uppercase tracking-wider"
            >
              Client
            </label>
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40 pointer-events-none" />
              <select
                id="client-select"
                value={selectedEmail}
                onChange={(e) => setSelectedEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent appearance-none"
              >
                {clients.map((c) => (
                  <option key={c.email} value={c.email}>
                    {c.name} — {c.caseId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="typology-select"
              className="text-xs font-semibold text-ink/60 uppercase tracking-wider"
            >
              Vocational Client Category
            </label>
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40 pointer-events-none" />
              <select
                id="typology-select"
                value={typology ?? ""}
                onChange={(e) =>
                  handleTypologyChange(e.target.value as ClientTypology)
                }
                className="w-full px-4 py-2.5 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent appearance-none"
              >
                <option value="" disabled>
                  Select category...
                </option>
                {CLIENT_TYPOLOGIES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Auto-assign toggle */}
        <div className="flex items-center justify-between bg-cream rounded-lg px-4 py-3 border border-ink/5">
          <div>
            <p className="text-sm font-semibold text-ink">
              Auto-Assign Standard Curriculum
            </p>
            <p className="text-xs text-ink/50">
              Automatically assign courses based on the selected category
            </p>
          </div>
          <button
            onClick={handleToggleAutoAssign}
            className="flex-shrink-0"
            aria-label={
              autoAssign ? "Disable auto-assign" : "Enable auto-assign"
            }
          >
            {autoAssign ? (
              <ToggleRight className="w-8 h-8 text-fresh" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-ink/30" />
            )}
          </button>
        </div>

        {selectedClient && (
          <div className="text-xs text-ink/50 border-t border-ink/5 pt-3">
            <span className="font-semibold text-ink/70">
              {selectedClient.name}
            </span>{" "}
            — Goal: {selectedClient.goal} — Status: {selectedClient.status} —{" "}
            {assignments.length} course{assignments.length !== 1 ? "s" : ""}{" "}
            assigned
          </div>
        )}
      </div>

      {/* Currently assigned courses */}
      <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-ink/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            <h2 className="font-bold text-sm text-ink">
              Assigned Courses ({assignments.length})
            </h2>
          </div>
          <button
            onClick={() => setShowCatalog(!showCatalog)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-light transition"
          >
            {showCatalog ? (
              <>
                <X className="w-4 h-4" /> Close Catalog
              </>
            ) : (
              <>
                <Search className="w-4 h-4" /> Browse Master Catalog
              </>
            )}
          </button>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-12 text-ink/50 text-sm">
            No courses assigned. Select a category above or browse the
            master catalog to add courses.
          </div>
        ) : (
          <div className="divide-y divide-ink/5">
            {assignments.map((a) => {
              const course = COURSE_MAP[a.courseId];
              if (!course) return null;
              return (
                <div
                  key={a.courseId}
                  className="px-5 py-3.5 flex items-center gap-4 hover:bg-ink/[0.02] transition"
                >
                  <span className="flex-none text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded w-8 text-center">
                    {course.id}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-ink/50 truncate">
                      {course.focus} — {course.durationMin} min,{" "}
                      {course.lessonCount} lessons
                    </p>
                  </div>
                  <MiniProgress progress={a.progress} pct={a.progressPct} />
                  <button
                    onClick={() => handleUnassign(a.courseId)}
                    className="flex-none p-1.5 text-ink/30 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                    title="Remove course"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Master catalog browser */}
      {showCatalog && (
        <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-ink/10 flex items-center gap-2">
            <Search className="w-4 h-4 text-accent" />
            <h2 className="font-bold text-sm text-ink">
              Master Course Catalog
            </h2>
            <span className="text-xs text-ink/50 ml-auto">
              Click + to assign a course
            </span>
          </div>

          <div className="divide-y divide-ink/10">
            {MASTER_CATALOG.map((mod) => (
              <div key={mod.id}>
                <div className="px-5 py-2.5 bg-ink/[0.02]">
                  <p className="text-xs font-bold text-accent uppercase tracking-wider">
                    Module {mod.id}: {mod.title}
                  </p>
                </div>
                <div className="divide-y divide-ink/5">
                  {mod.courses.map((course) => {
                    const isAssigned = assignedIds.has(course.id);
                    return (
                      <div
                        key={course.id}
                        className={`px-5 py-3 flex items-center gap-4 ${
                          isAssigned ? "bg-fresh/5" : "hover:bg-ink/[0.02]"
                        } transition`}
                      >
                        <span className="flex-none text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded w-8 text-center">
                          {course.id}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink">
                            {course.title}
                          </p>
                          <p className="text-xs text-ink/50">
                            {course.focus} — {course.durationMin} min
                          </p>
                        </div>
                        {isAssigned ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-fresh">
                            <CheckCircle2 className="w-4 h-4" />
                            Assigned
                          </span>
                        ) : (
                          <button
                            onClick={() => handleAssign(course.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-accent border border-accent/30 px-3 py-1.5 rounded-md hover:bg-accent hover:text-white transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MiniProgress({
  progress,
  pct,
}: {
  progress: AssignedCourse["progress"];
  pct: number;
}) {
  if (progress === "completed") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Done
      </span>
    );
  }
  if (progress === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700">
        <PlayCircle className="w-3.5 h-3.5" />
        {pct}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-ink/40">
      <Lock className="w-3.5 h-3.5" />
      New
    </span>
  );
}
