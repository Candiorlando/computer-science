"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadSession } from "@/lib/session";
import type { ClientUser } from "@/lib/users";
import {
  loadAssignments,
  markComplete,
  type Assignment,
} from "@/lib/assignments";

export default function MyAssessmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<ClientUser | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "client") return router.replace("/dashboard");
    setUser(s);
    setAssignments(loadAssignments(s.caseId));
  }, [router, bump]);

  if (!user) return null;

  function complete(name: string) {
    markComplete(user!.caseId, name);
    setBump((n) => n + 1);
  }

  const pending = assignments.filter((a) => !a.isComplete);
  const completed = assignments.filter((a) => a.isComplete);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/50 mb-1">
          My Assessments
        </p>
        <h1 className="text-4xl mb-2">Assessments your counselor assigned</h1>
        <p className="text-ink/70 prose-narrow">
          These are picked specifically for you by{" "}
          <strong>{user.counselorName}</strong>. Some you can take right here
          on Pathways Pro. Others link out to the official site — bring the
          results back to your next session.
        </p>
      </header>

      {assignments.length === 0 && (
        <section className="border border-dashed border-ink/20 rounded-lg p-8 text-center text-ink/60">
          <p>
            Nothing assigned yet. {user.counselorName} hasn&apos;t added any
            assessments for you to take. Your next appointment is{" "}
            <strong>{user.nextAppt}</strong> — bring it up then.
          </p>
        </section>
      )}

      {pending.length > 0 && (
        <section>
          <h2 className="text-2xl mb-3">To do ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map((a) => (
              <AssignmentCard
                key={a.assessmentName}
                assignment={a}
                onComplete={() => complete(a.assessmentName)}
              />
            ))}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h2 className="text-2xl mb-3">Completed ({completed.length})</h2>
          <div className="space-y-3">
            {completed.map((a) => (
              <AssignmentCard
                key={a.assessmentName}
                assignment={a}
                completed
                onComplete={() => {}}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function AssignmentCard({
  assignment: a,
  completed,
  onComplete,
}: {
  assignment: Assignment;
  completed?: boolean;
  onComplete: () => void;
}) {
  return (
    <article
      className={`border rounded-lg p-5 ${
        completed
          ? "border-green-200 bg-green-50/50"
          : "border-ink/15 bg-cream"
      }`}
    >
      <div className="flex items-baseline justify-between gap-3 flex-wrap mb-2">
        <h3 className="text-lg font-semibold">
          {a.assessmentName}
          {a.acronym && (
            <span className="text-ink/50 font-normal ml-2">({a.acronym})</span>
          )}
        </h3>
        {completed ? (
          <span className="text-xs uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-green-100 text-green-800">
            ✓ Completed
          </span>
        ) : a.inAppPath ? (
          <span className="text-xs uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
            Take on Pathways Pro
          </span>
        ) : (
          <span className="text-xs uppercase tracking-wider font-semibold px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            External
          </span>
        )}
      </div>

      <div className="text-sm text-ink/70 mb-3">
        {a.domain} · {a.time}
      </div>

      {a.cost !== "free" && a.priceTag && (
        <p className="text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded px-2 py-1 mb-3">
          💰 <strong>Cost:</strong> {a.priceTag}. Talk to your counselor — your
          state VR program may cover this.
        </p>
      )}

      {a.note && (
        <p className="text-sm italic text-ink/80 mb-3 border-l-2 border-accent/40 pl-3">
          &ldquo;{a.note}&rdquo; — {a.assignedBy}
        </p>
      )}

      {!completed && (
        <div className="flex flex-wrap gap-2 items-center">
          {a.inAppPath ? (
            <Link
              href={a.inAppPath}
              className="bg-accent text-cream px-4 py-2 rounded font-semibold text-sm"
            >
              Take it now →
            </Link>
          ) : (
            <a
              href={a.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="border border-accent text-accent px-4 py-2 rounded font-semibold text-sm hover:bg-accent/5"
            >
              Open the site ↗
            </a>
          )}
          <button
            onClick={onComplete}
            className="text-sm text-ink/60 hover:text-accent underline"
          >
            Mark as done
          </button>
        </div>
      )}

      <p className="text-xs text-ink/50 mt-3">
        Assigned by {a.assignedBy} on{" "}
        {new Date(a.assignedAt).toLocaleDateString()}
        {completed &&
          a.completedAt &&
          ` · Completed ${new Date(a.completedAt).toLocaleDateString()}`}
      </p>
    </article>
  );
}
