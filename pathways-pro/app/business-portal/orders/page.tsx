"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { BusinessUser } from "@/lib/users";
import { OrdersIndex } from "@/components/OrdersIndex";

export default function BusinessServiceOrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<BusinessUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "business") return router.replace("/portal");
    setUser(s);
  }, [router]);

  if (!user) return null;
  return (
    <OrdersIndex
      orgId={user.orgId}
      basePath="/business-portal/orders"
      catalogPath="/business-portal/services"
    />
  );
}
