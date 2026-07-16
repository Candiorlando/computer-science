"use client";

// Generic page-level access guard. Hiding a nav link is never enough on
// its own — a user could still navigate to the URL directly — so every
// role-restricted page wraps its content in this guard, which actually
// checks the session before anything sensitive renders.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { AnyUser } from "@/lib/users";

type Status = "checking" | "denied" | "ok";

export default function AccessGuard({
  check,
  title = "Access restricted",
  message = "You don't have permission to view this page.",
  children,
}: {
  /** Return true to allow access. Runs against the loaded session user. */
  check: (user: AnyUser) => boolean;
  title?: string;
  message?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const s = loadSession();
    if (!s) return void router.replace("/signin");
    if (!check(s)) return void setStatus("denied");
    setStatus("ok");
    // Intentionally omit `check` from deps — callers pass a fresh
    // function each render; re-running on session/route change only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  if (status === "checking") return null;

  if (status === "denied") {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-3">
        <div className="text-4xl" aria-hidden>
          🔒
        </div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-ink/65 text-sm">{message}</p>
      </div>
    );
  }

  return <>{children}</>;
}
