"use client";

import { useState } from "react";
import {
  ListChecks,
  Search,
  ChevronRight,
  MapPin,
  Star,
  Briefcase,
} from "lucide-react";

interface MockVendor {
  id: string;
  name: string;
  organization: string;
  type: string;
  location: string;
  activeOrders: number;
  rating: number;
}

const MOCK_VENDORS: MockVendor[] = [
  {
    id: "v1",
    name: "Dr. Sarah Mitchell",
    organization: "Summit Community Rehabilitation",
    type: "CRP",
    location: "Chicago, IL",
    activeOrders: 4,
    rating: 4.8,
  },
  {
    id: "v2",
    name: "James Okoro, CVE",
    organization: "Vocational Solutions Group",
    type: "Forensic",
    location: "Atlanta, GA",
    activeOrders: 2,
    rating: 4.6,
  },
  {
    id: "v3",
    name: "Patricia Lane, OTR/L",
    organization: "ErgoWorks Consulting",
    type: "Ergonomic",
    location: "Denver, CO",
    activeOrders: 1,
    rating: 4.9,
  },
  {
    id: "v4",
    name: "Michael Foster, JD",
    organization: "Foster & Associates",
    type: "Legal Consult",
    location: "Houston, TX",
    activeOrders: 0,
    rating: 4.4,
  },
  {
    id: "v5",
    name: "Rebecca Stein, M.Ed.",
    organization: "CareerBridge Training",
    type: "Training",
    location: "Phoenix, AZ",
    activeOrders: 3,
    rating: 4.7,
  },
];

const TYPE_COLORS: Record<string, string> = {
  CRP: "bg-emerald-100 text-emerald-800",
  Forensic: "bg-purple-100 text-purple-800",
  Ergonomic: "bg-blue-100 text-blue-800",
  "Legal Consult": "bg-amber-100 text-amber-800",
  Training: "bg-accent/10 text-accent",
};

export default function VendorDirectoryPage() {
  const [query, setQuery] = useState("");

  const filtered = MOCK_VENDORS.filter(
    (v) =>
      v.name.toLowerCase().includes(query.toLowerCase()) ||
      v.organization.toLowerCase().includes(query.toLowerCase()) ||
      v.type.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
            <ListChecks className="w-6 h-6 text-accent" />
            Vendor Directory
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            {MOCK_VENDORS.length} registered service providers.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((v) => (
          <div
            key={v.id}
            className="bg-white border border-ink/10 rounded-xl p-5 hover:border-gold/50 hover:shadow-sm transition space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-sm">{v.name}</h3>
                <p className="text-xs text-ink/55">{v.organization}</p>
              </div>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${TYPE_COLORS[v.type] || "bg-ink/10 text-ink/60"}`}
              >
                {v.type}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-ink/55">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {v.location}
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-gold" />
                {v.rating}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-ink/5">
              <span className="flex items-center gap-1.5 text-xs text-ink/55">
                <Briefcase className="w-3 h-3" />
                {v.activeOrders} active order{v.activeOrders !== 1 ? "s" : ""}
              </span>
              <button className="text-accent hover:text-accent/80 transition">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-ink/50 text-sm">
          No vendors match your search.
        </div>
      )}
    </div>
  );
}
