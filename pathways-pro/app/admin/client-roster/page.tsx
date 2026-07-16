"use client";

import { useState } from "react";
import {
  Users,
  Search,
  ChevronRight,
  CircleDot,
} from "lucide-react";

interface MockClient {
  id: string;
  name: string;
  caseId: string;
  status: "Intake" | "Assessment Phase" | "In Training" | "Job Placement";
  counselor: string;
  goal: string;
  progress: number;
}

const MOCK_CLIENTS: MockClient[] = [
  {
    id: "c1",
    name: "Jordan Rivera",
    caseId: "PP-2026-0451",
    status: "In Training",
    counselor: "Candace Metcalf, CRC",
    goal: "Medical Office Administrator",
    progress: 68,
  },
  {
    id: "c2",
    name: "Aisha Thompson",
    caseId: "PP-2026-0387",
    status: "Assessment Phase",
    counselor: "Candace Metcalf, CRC",
    goal: "IT Support Specialist",
    progress: 35,
  },
  {
    id: "c3",
    name: "Marcus Lee",
    caseId: "PP-2026-0512",
    status: "Intake",
    counselor: "Demo Counselor",
    goal: "Pending assessment",
    progress: 10,
  },
  {
    id: "c4",
    name: "Elena Vasquez",
    caseId: "PP-2026-0299",
    status: "Job Placement",
    counselor: "Candace Metcalf, CRC",
    goal: "Dental Hygienist",
    progress: 92,
  },
  {
    id: "c5",
    name: "Tyrone Washington",
    caseId: "PP-2025-1104",
    status: "In Training",
    counselor: "Demo Counselor",
    goal: "Warehouse Logistics Coordinator",
    progress: 55,
  },
];

const STATUS_COLORS: Record<MockClient["status"], string> = {
  Intake: "text-blue-600",
  "Assessment Phase": "text-amber-600",
  "In Training": "text-accent",
  "Job Placement": "text-emerald-600",
};

export default function ClientRosterPage() {
  const [query, setQuery] = useState("");

  const filtered = MOCK_CLIENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.caseId.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
            <Users className="w-6 h-6 text-accent" />
            Client Roster
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            {MOCK_CLIENTS.length} active clients across all counselors.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <input
            type="text"
            placeholder="Search by name or case ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 bg-ink/[0.02]">
                <th className="text-left px-5 py-3 font-semibold text-ink/70">
                  Client
                </th>
                <th className="text-left px-5 py-3 font-semibold text-ink/70 hidden sm:table-cell">
                  Case ID
                </th>
                <th className="text-left px-5 py-3 font-semibold text-ink/70 hidden md:table-cell">
                  Status
                </th>
                <th className="text-left px-5 py-3 font-semibold text-ink/70 hidden lg:table-cell">
                  Counselor
                </th>
                <th className="text-left px-5 py-3 font-semibold text-ink/70 hidden md:table-cell">
                  Goal
                </th>
                <th className="text-right px-5 py-3 font-semibold text-ink/70">
                  Progress
                </th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-ink/5 hover:bg-ink/[0.02] transition"
                >
                  <td className="px-5 py-3 font-medium">{c.name}</td>
                  <td className="px-5 py-3 text-ink/60 hidden sm:table-cell font-mono text-xs">
                    {c.caseId}
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell">
                    <span
                      className={`flex items-center gap-1.5 text-xs font-semibold ${STATUS_COLORS[c.status]}`}
                    >
                      <CircleDot className="w-3 h-3" />
                      {c.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ink/60 hidden lg:table-cell">
                    {c.counselor}
                  </td>
                  <td className="px-5 py-3 text-ink/60 hidden md:table-cell">
                    {c.goal}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-ink/55 w-8 text-right">
                        {c.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <button className="p-1 text-ink/30 hover:text-accent transition">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-ink/50 text-sm">
            No clients match your search.
          </div>
        )}
      </div>
    </div>
  );
}
