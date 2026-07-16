"use client";

// Real page-level access guard for master-admin-only tools (tenant
// provisioning, pricing engine). Hiding the nav link isn't enough — a
// counselor could still navigate to the URL directly — so every
// master-admin-only page must wrap its content in this guard.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import { isMasterAdmin } from "@/lib/rbac";

type Status = "checking" | "denied" | "ok";

export default function MasterAdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("checking");

  useEffect(() => {
    const s = loadSession();
    if (!s) return void router.replace("/signin");
    if (s.role !== "counselor") return void router.replace("/portal");
    if (!isMasterAdmin(s)) return void setStatus("denied");
    setStatus("ok");
  }, [router]);

  if (status === "checking") return null;

  if (status === "denied") {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-3">
        <div className="text-4xl" aria-hidden>
          🔒
        </div>
        <h1 className="text-2xl font-semibold">Master Administrator access required</h1>
        <p className="text-ink/65 text-sm">
          This tool is restricted to the platform Master Administrator and is
          not part of a standard counselor or tenant-admin account. If you
          believe you should have access, contact your system administrator.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
