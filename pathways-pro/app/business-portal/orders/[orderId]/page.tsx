"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadSession } from "@/lib/session";
import type { BusinessUser } from "@/lib/users";
import { OrderDeliverableViewer } from "@/components/OrderDeliverableViewer";

export default function BusinessOrderViewer() {
  const router = useRouter();
  const params = useParams();
  const orderId = String(params.orderId);
  const [user, setUser] = useState<BusinessUser | null>(null);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/business");
    if (s.role !== "business") return router.replace("/portal");
    setUser(s);
  }, [router]);

  if (!user) return null;
  return (
    <OrderDeliverableViewer
      orderId={orderId}
      orgId={user.orgId}
      catalogPath="/business-portal/services"
    />
  );
}
