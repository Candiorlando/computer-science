"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  Lock,
  ChevronRight,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { loadSession } from "@/lib/session";
import type { AnyUser } from "@/lib/users";
import {
  MASTER_CATALOG,
  COURSE_MAP,
  ensureClientAssignments,
  getClientAssignments,
  type AssignedCourse,
  type CurriculumCourse,
  type CurriculumModule,
} from "@/lib/curriculum";

export default function MyCoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [assignments, setAssignments] = useState<AssignedCourse[]>([]);

  useEffect(() => {
    const s = loadSession();
    if (!s) return void router.replace("/login");
    setUser(s);
    // Seed demo assignments for demo clients
    const typology =
      s.role === "client" ? "new_disability" : undefined;
    ensureClientAssignments(s.email, typology as any);
    setAssignments(getClientAssignments(s.email));
  }, [router]);

  const assignedIds = useMemo(
    () => new Set(assignments.map((a) => a.courseId)),
    [assignments],
  );

  const assignmentMap = useMemo(() => {
    const m: Record<string, AssignedCourse> = {};
    for (const a of assignments) m[a.courseId] = a;
    return m;
  }, [assignments]);

  // Group assigned courses by module
  const moduleGroups = useMemo(() => {
    const groups: {
      module: CurriculumModule;
      courses: { course: CurriculumCourse; assignment: AssignedCourse }[];
    }[] = [];

    for (const mod of MASTER_CATALOG) {
      const courses = mod.courses
        .filter((c) => assignedIds.has(c.id))
        .map((c) => ({ course: c, assignment: assignmentMap[c.id] }));
      if (courses.length > 0) groups.push({ module: mod, courses });
    }
    return groups;
  }, [assignedIds, assignmentMap]);

  // Summary stats
  const stats = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter(
      (a) => a.progress === "completed",
    ).length;
    const inProgress = assignments.filter(
      (a) => a.progress === "in_progress",
    ).length;
    const avgProgress = total
      ? Math.round(
          assignments.reduce((s, a) => s + a.progressPct, 0) / total,
        )
      : 0;
    return { total, completed, inProgress, avgProgress };
  }, [assignments]);

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.15em] text-accent font-bold flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          My Courses
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-ink">
          Your Learning Center
        </h1>
        <p className="text-ink/60 text-sm max-w-2xl">
          Self-paced vocational training assigned to your rehabilitation
          plan. Complete courses at your own pace — your counselor can add
          or adjust your curriculum at any time.
        </p>
      </header>

      {/* Progress summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Assigned"
          value={String(stats.total)}
          icon={<BookOpen className="w-4 h-4" />}
          color="text-accent"
        />
        <StatCard
          label="In Progress"
          value={String(stats.inProgress)}
          icon={<PlayCircle className="w-4 h-4" />}
          color="text-amber-600"
        />
        <StatCard
          label="Completed"
          value={String(stats.completed)}
          icon={<CheckCircle2 className="w-4 h-4" />}
          color="text-emerald-600"
        />
        <StatCard
          label="Overall Progress"
          value={`${stats.avgProgress}%`}
          icon={<TrendingUp className="w-4 h-4" />}
          color="text-accent"
        />
      </div>

      {/* Course modules */}
      {moduleGroups.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <BookOpen className="w-10 h-10 text-ink/20 mx-auto" />
          <p className="text-ink/50 text-sm">
            No courses have been assigned yet. Your counselor will add
            courses based on your rehabilitation plan.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {moduleGroups.map(({ module: mod, courses }) => (
            <section key={mod.id} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex-none w-8 h-8 rounded-lg bg-accent/10 grid place-items-center text-xs font-bold text-accent">
                  {mod.id}
                </span>
                <div>
                  <h2 className="font-bold text-sm text-ink">{mod.title}</h2>
                  <p className="text-xs text-ink/50">
                    {courses.length} course
                    {courses.length !== 1 ? "s" : ""} assigned
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {courses.map(({ course, assignment }) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    assignment={assignment}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Stat card ────────────────────────────────────────────────────── */

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white border border-ink/10 rounded-xl px-4 py-4 space-y-1">
      <div className={`flex items-center gap-2 text-xs font-semibold ${color}`}>
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold text-ink">{value}</div>
    </div>
  );
}

/* ── Course card ──────────────────────────────────────────────────── */

function CourseCard({
  course,
  assignment,
}: {
  course: CurriculumCourse;
  assignment: AssignedCourse;
}) {
  const isCompleted = assignment.progress === "completed";
  const isInProgress = assignment.progress === "in_progress";

  return (
    <div
      className={`bg-white border rounded-xl p-5 space-y-3 transition hover:shadow-sm ${
        isCompleted
          ? "border-emerald-200"
          : isInProgress
            ? "border-amber-200"
            : "border-ink/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-accent bg-accent/10 px-1.5 py-0.5 rounded">
              {course.id}
            </span>
            <StatusBadge progress={assignment.progress} />
          </div>
          <h3 className="font-semibold text-sm text-ink leading-snug">
            {course.title}
          </h3>
        </div>
      </div>

      {/* Focus line */}
      <p className="text-xs text-ink/55 italic">{course.focus}</p>

      {/* Description */}
      <p className="text-sm text-ink/70 leading-relaxed">
        {course.description}
      </p>

      {/* Meta + progress */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-ink/50">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.durationMin} min
          </span>
          <span>
            {course.lessonCount} lesson{course.lessonCount !== 1 ? "s" : ""}
          </span>
          <span>{assignment.progressPct}% complete</span>
        </div>
        <div className="h-1.5 bg-ink/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? "bg-emerald-500" : "bg-accent"
            }`}
            style={{ width: `${assignment.progressPct}%` }}
          />
        </div>
      </div>

      {/* Action */}
      <button
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition ${
          isCompleted
            ? "border border-ink/15 text-ink/70 hover:bg-ink/5"
            : isInProgress
              ? "bg-accent text-white hover:bg-accent-light"
              : "border border-accent text-accent hover:bg-accent hover:text-white"
        }`}
      >
        {isCompleted ? (
          <>
            Review Materials <ChevronRight className="w-4 h-4" />
          </>
        ) : isInProgress ? (
          <>
            <PlayCircle className="w-4 h-4" /> Continue Lesson
          </>
        ) : (
          <>
            Start Course <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}

function StatusBadge({ progress }: { progress: AssignedCourse["progress"] }) {
  if (progress === "completed") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" /> Completed
      </span>
    );
  }
  if (progress === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
        <PlayCircle className="w-3 h-3" /> In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink/50 bg-ink/5 px-1.5 py-0.5 rounded-full">
      <Lock className="w-3 h-3" /> Not Started
    </span>
  );
}
