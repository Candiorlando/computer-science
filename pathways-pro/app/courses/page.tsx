"use client";

// Client portal "Courses & Training" center. Renders inside the existing
// global sidebar (AppShell/LeftNav) as the main content area — this file is
// only the content column. Toggles between the catalog grid and the lesson
// viewer; the metric bar stays pinned on top.

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { AnyUser } from "@/lib/users";
import { coursesData, summarize } from "@/lib/courses-data";
import CourseProgressSummary from "@/components/courses/CourseProgressSummary";
import ModuleGrid from "@/components/courses/ModuleGrid";
import LessonViewer from "@/components/courses/LessonViewer";

export default function CoursesPage() {
  const router = useRouter();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return void router.replace("/signin");
    setUser(s);
  }, [router]);

  const summary = useMemo(() => summarize(coursesData), []);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-widest text-accent">Courses &amp; Training</p>
        <h1 className="text-3xl tracking-tight text-ink">Your learning center</h1>
        <p className="text-ink/65 text-sm max-w-2xl">
          Self-paced training to support your career transition. Pick up where you
          left off, or browse the full catalog below.
        </p>
      </header>

      <CourseProgressSummary summary={summary} onResume={(id) => setOpenModuleId(id)} />

      {openModuleId ? (
        <section aria-label="Lesson viewer">
          <LessonViewer
            modules={coursesData}
            initialModuleId={openModuleId}
            onBack={() => setOpenModuleId(null)}
          />
        </section>
      ) : (
        <section aria-label="Course catalog" className="space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold text-ink">Training catalog</h2>
            <span className="text-sm text-ink/55">{coursesData.length} modules</span>
          </div>
          <ModuleGrid modules={coursesData} onOpen={(id) => setOpenModuleId(id)} />
        </section>
      )}
    </div>
  );
}
