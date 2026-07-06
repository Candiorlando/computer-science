"use client";

// Client-facing runner for a counselor-assigned assessment. The
// completed instrument lands in the same case-isolated store the
// counselor reviews from (their case file → Assessments tab), and the
// assignment flips to completed so it leaves the client's to-do list.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { ClientUser } from "@/lib/users";
import { getAssessmentTool } from "@/lib/assessment-tools";
import {
  completeAssignment,
  getAssignment,
  type AssessmentAssignment,
} from "@/lib/assessment-assignments";
import { AssessmentRunner } from "@/components/AssessmentRunner";

export default function AssignedAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const assignmentId = String(params.assignmentId);
  const [user, setUser] = useState<ClientUser | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/signin");
    if (s.role !== "client") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const assignment: AssessmentAssignment | null = useMemo(
    () => (user ? getAssignment(assignmentId) : null),
    [assignmentId, user],
  );

  if (!user) return null;

  if (
    !assignment ||
    assignment.caseId !== user.caseId ||
    (assignment.status !== "assigned" && !done)
  ) {
    return (
      <div className="space-y-3">
        <Link
          href="/my-assessments"
          className="text-xs text-cyan-400 hover:underline"
        >
          ← My Assessments
        </Link>
        <h1 className="text-2xl">Assessment not available</h1>
        <p className="text-ink/65 text-sm">
          This assignment doesn&apos;t exist, was cancelled, or has already
          been completed.
        </p>
      </div>
    );
  }

  const tool = getAssessmentTool(assignment.toolId);
  if (!tool) {
    return (
      <div className="space-y-3">
        <Link
          href="/my-assessments"
          className="text-xs text-cyan-400 hover:underline"
        >
          ← My Assessments
        </Link>
        <h1 className="text-2xl">Assessment tool not found</h1>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-xl mx-auto text-center space-y-4 py-16">
        <div className="text-4xl" aria-hidden>
          ✓
        </div>
        <h1 className="text-3xl">Nice work — it&apos;s in.</h1>
        <p className="text-ink/70">
          Your answers to <strong>{assignment.toolTitle}</strong> went
          straight to your case file. {assignment.assignedByName} will review
          them and go over the results with you.
        </p>
        <Link
          href="/my-assessments"
          className="inline-block grad-tealblue text-white font-semibold px-6 py-3 min-h-[44px] rounded-md"
        >
          Back to My Assessments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href="/my-assessments"
          className="text-xs text-cyan-400 hover:underline mb-1 inline-block"
        >
          ← My Assessments
        </Link>
        <h1 className="text-3xl font-semibold">{assignment.toolTitle}</h1>
        <p className="text-ink/65 text-sm mt-1">
          Assigned by {assignment.assignedByName} ·{" "}
          {new Date(assignment.assignedAt).toLocaleDateString()} ·{" "}
          {tool.items.length} questions. Answer honestly — there are no wrong
          answers, and your counselor reviews everything with you.
        </p>
      </header>

      <AssessmentRunner
        tool={tool}
        scopeKind="client-case"
        scopeId={user.caseId}
        administeredByEmail={user.email}
        administeredByName={user.name}
        onComplete={(a) => {
          completeAssignment(assignment.id, a.id);
          setDone(true);
        }}
      />
    </div>
  );
}
