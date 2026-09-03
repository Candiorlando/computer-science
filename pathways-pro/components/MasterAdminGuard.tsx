"use client";

// Thin wrapper over AccessGuard for master-admin-only tools (tenant
// provisioning, pricing engine).

import AccessGuard from "./AccessGuard";
import { isMasterAdmin } from "@/lib/rbac";

export default function MasterAdminGuard({ children }: { children: React.ReactNode }) {
  return (
    <AccessGuard
      check={isMasterAdmin}
      title="Master Administrator access required"
      message="This tool is restricted to the platform Master Administrator and is not part of a standard counselor or tenant-admin account. If you believe you should have access, contact your system administrator."
    >
      {children}
    </AccessGuard>
  );
}
