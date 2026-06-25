"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { VendorUser } from "@/lib/users";
import { OrdersIndex } from "@/components/OrdersIndex";

export default function VendorServiceOrdersPage() {
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
    <OrdersIndex
      orgId={user.vendorOrgId}
      basePath="/vendor-portal/orders"
      catalogPath="/vendor-portal/services"
    />
  );
}
