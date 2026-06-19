"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { EmploymentPartnerUser } from "@/lib/users";
import { ExternalServiceCatalog } from "@/components/ExternalServiceCatalog";
import { seedPartnerDemo } from "@/lib/partner-seed";

export default function PartnerServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmploymentPartnerUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "partner") return router.replace("/portal");
    seedPartnerDemo();
    setUser(s);
  }, [router]);

  if (!user) return null;

  return (
    <ExternalServiceCatalog
      requester={{
        email: user.email,
        name: user.name,
        orgId: user.partnerOrgId,
        orgName: user.partnerOrgName,
        audience: "partner",
        effectiveCounselorEmail: "candace.metcalf@idhs.illinois.gov",
        scopeRole: user.title,
      }}
      introNote="Every request routes to your assigned VR counselor for review. Customized Employment Consulting requests are visible automatically in your CE workspace once approved."
    />
  );
}
