"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { EmploymentPartnerUser } from "@/lib/users";
import { OrdersIndex } from "@/components/OrdersIndex";

export default function PartnerServiceOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<EmploymentPartnerUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "partner") return router.replace("/portal");
    setUser(s);
  }, [router]);

  if (!user) return null;
  return (
    <OrdersIndex
      orgId={user.partnerOrgId}
      basePath="/partner-portal/orders"
      catalogPath="/partner-portal/services"
    />
  );
}
