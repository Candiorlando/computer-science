import { useMemo } from "react";
import { useDebounce } from "./use-debounce";

// Role-adaptive search hook — structures the fuzzy query based on the
// active user role. Debounces at 200ms to prevent layout lag.
//
// Each role searches across different entity fields:
//   Counselor: client name, case ID, phone
//   Vendor:    client name, authorization ID, service code
//   Business:  candidate name, placement/req ID, phone

export type DashboardRole = "COUNSELOR" | "VENDOR" | "BUSINESS";

export interface EcosystemRecord {
  id: string;
  primaryName: string;
  secondaryId: string;
  phone?: string;
  serviceCode?: string;
  // Metadata varies by role
  [key: string]: unknown;
}

export function useRoleSearch<T extends EcosystemRecord>(
  records: T[],
  query: string,
  role: DashboardRole,
): T[] {
  const debouncedQuery = useDebounce(query, 200);

  return useMemo(() => {
    if (!debouncedQuery) return records;
    const q = debouncedQuery.toLowerCase();
    const digits = q.replace(/[\s\-\(\)\.]/g, "");

    return records.filter((r) => {
      // Primary name match (all roles)
      if (r.primaryName.toLowerCase().includes(q)) return true;

      // Secondary ID match (case ID / auth ID / req ID)
      if (r.secondaryId.toLowerCase().includes(q)) return true;

      // Role-specific additional fields
      switch (role) {
        case "COUNSELOR":
        case "BUSINESS":
          // Phone number match (strip formatting)
          if (digits.length >= 3 && r.phone) {
            if (r.phone.replace(/\D/g, "").includes(digits)) return true;
          }
          break;
        case "VENDOR":
          // Service code / service type match
          if (r.serviceCode?.toLowerCase().includes(q)) return true;
          break;
      }

      return false;
    });
  }, [records, debouncedQuery, role]);
}

// Prisma query shape for production (role-conditional OR):
//
// function buildSearchWhere(role: DashboardRole, query: string, orgId: string) {
//   const digits = query.replace(/[\s\-\(\)\.]/g, "");
//   const base = { contains: query, mode: "insensitive" as const };
//
//   switch (role) {
//     case "COUNSELOR":
//       return {
//         orgId,
//         OR: [
//           { clientName: base },
//           { caseNumber: base },
//           ...(digits.length >= 3 ? [{ client: { phone: { contains: digits } } }] : []),
//         ],
//       };
//     case "VENDOR":
//       return {
//         vendorOrgId: orgId,
//         OR: [
//           { clientName: base },
//           { id: base },
//           { serviceCode: base },
//           { serviceLabel: base },
//         ],
//       };
//     case "BUSINESS":
//       return {
//         employerOrgId: orgId,
//         OR: [
//           { clientName: base },
//           { id: base },
//           { socCode: base },
//           ...(digits.length >= 3 ? [{ client: { phone: { contains: digits } } }] : []),
//         ],
//       };
//   }
// }
