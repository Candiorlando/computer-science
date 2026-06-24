"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { CounselorUser } from "@/lib/users";
import { CLIENTS } from "@/lib/users";
import { getAssessmentTool } from "@/lib/assessment-tools";
import { AssessmentRunner } from "@/components/AssessmentRunner";

export default function CaseAssessmentPage() {
  const router = useRouter();
  const params = useParams();
  const caseId = String(params.caseId);
  const toolId = String(params.toolId);
  const [user, setUser] = useState<CounselorUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    if (s.role !== "counselor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  const client = useMemo(
    () => Object.values(CLIENTS).find((c) => c.caseId === caseId),
    [caseId],
  );
  const tool = useMemo(() => getAssessmentTool(toolId), [toolId]);

  if (!user) return null;
  if (!client || !tool) {
    return (
      <div className="space-y-3">
        <Link href={`/case/${caseId}`} className="text-xs text-cyan-700 hover:underline">
          ← Back to case
        </Link>
        <h1 className="text-2xl">Not found</h1>
        <p className="text-ink/65 text-sm">
          The case ID or assessment tool wasn&apos;t found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <Link
          href={`/case/${caseId}`}
          className="text-xs text-cyan-700 hover:underline mb-1 inline-block"
        >
          ← Back to {client.name}&apos;s case
        </Link>
        <p className="text-xs uppercase tracking-widest text-ink/55 mt-1">
          Administering · {tool.title}
        </p>
        <h1 className="text-2xl font-semibold mt-1">
          {tool.title} — {client.name}
        </h1>
      </header>

      <AssessmentRunner
        tool={tool}
        scopeKind="client-case"
        scopeId={caseId}
        administeredByEmail={user.email}
        administeredByName={user.name}
        onComplete={() => {
          setTimeout(() => router.push(`/case/${caseId}`), 1200);
        }}
      />
    </div>
  );
}
