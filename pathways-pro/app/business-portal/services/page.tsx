"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { BusinessUser } from "@/lib/users";
import { ExternalServiceCatalog } from "@/components/ExternalServiceCatalog";

export default function BusinessServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<BusinessUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "business") {
      const dest =
        s.role === "vendor"
          ? "/vendor-portal"
          : s.role === "partner"
            ? "/partner-portal"
            : s.role === "counselor"
              ? "/dashboard/business"
              : "/portal";
      return router.replace(dest);
    }
    setUser(s);
  }, [router]);

  if (!user) return null;

  return (
    <ExternalServiceCatalog
      requester={{
        email: user.email,
        name: user.name,
        orgId: user.orgId,
        orgName: user.orgName,
        audience: "business",
        effectiveCounselorEmail: "candace.metcalf@idhs.illinois.gov",
        scopeRole: user.scopeRole,
      }}
      introNote="Every service request routes through your assigned VR counselor for review and document preparation. Counselor-reviewed deliverables appear in your portal once approved."
    />
  );
}
