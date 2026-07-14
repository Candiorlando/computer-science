"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { VendorUser } from "@/lib/users";
import { ExternalServiceCatalog } from "@/components/ExternalServiceCatalog";

export default function VendorServicesPage() {
  const router = useRouter();
  const [user, setUser] = useState<VendorUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "vendor") return router.replace("/portal");
    setUser(s);
  }, [router]);

  if (!user) return null;

  return (
    <ExternalServiceCatalog
      requester={{
        email: user.email,
        name: user.name,
        orgId: user.vendorOrgId,
        orgName: user.vendorOrgName,
        audience: "vendor",
        effectiveCounselorEmail: "candace.metcalf@pathwayspro.app",
        scopeRole: user.vendorType,
      }}
      introNote="Vendor service requests route to the assigned VR counselor for review. Forensic and data-evaluation services follow Daubert-defensible deliverable standards."
    />
  );
}
