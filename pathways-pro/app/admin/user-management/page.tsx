"use client";

import { useState } from "react";
import {
  UserPlus,
  Send,
  CheckCircle2,
  Mail,
  User,
  Building,
  ChevronDown,
  Users,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { ROLE_LABELS, type AccessRequest } from "@/lib/rbac";
import type { Role } from "@/lib/users";

/* ── Mock recently-invited users ─────────────────────────────────── */

interface InvitedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  invitedAt: string;
  status: "pending" | "claimed";
}

const MOCK_INVITED: InvitedUser[] = [
  {
    id: "inv-1",
    name: "Dr. Sarah Mitchell",
    email: "s.mitchell@summit-crp.org",
    role: "vendor",
    invitedAt: "2026-07-10",
    status: "claimed",
  },
  {
    id: "inv-2",
    name: "Linda Torres",
    email: "ltorres@gmail.com",
    role: "client",
    invitedAt: "2026-07-12",
    status: "pending",
  },
  {
    id: "inv-3",
    name: "James Okoro",
    email: "jokoro@vocsolutions.com",
    role: "vendor",
    invitedAt: "2026-07-13",
    status: "claimed",
  },
];

/* ── All roles available for admin to invite ─────────────────────── */

const ALL_ROLES: Role[] = [
  "counselor",
  "client",
  "business",
  "vendor",
  "partner",
];

export default function UserManagementPage() {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
          <UserPlus className="w-6 h-6 text-accent" />
          User Management
        </h1>
        <p className="text-sm text-ink/60 mt-1">
          Invite new users to the platform and track invitation status.
        </p>
      </div>

      {/* Invite form */}
      <InviteForm />

      {/* Recent invitations */}
      <RecentInvitations />
    </div>
  );
}

/* ── Invite form ─────────────────────────────────────────────────── */

function InviteForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState<Role>("client");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // In production: POST to API to create invitation + send email.
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setName("");
      setEmail("");
      setOrganization("");
      setRole("client");
    }, 3000);
  }

  return (
    <div className="bg-white border border-ink/10 rounded-xl p-6">
      <h2 className="font-semibold text-sm flex items-center gap-2 mb-4">
        <Send className="w-4 h-4 text-accent" />
        Invite a New User
      </h2>

      {sent ? (
        <div className="flex items-center gap-3 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-md px-4 py-3 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p>
            Invitation sent to <strong>{email}</strong>. They will receive an
            email with a link to claim their account.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid sm:grid-cols-2 gap-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink/70">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full pl-10 pr-4 py-2.5 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink/70">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@organization.com"
                className="w-full pl-10 pr-4 py-2.5 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink/70">
              Organization
            </label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
              <input
                type="text"
                required
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Agency or company"
                className="w-full pl-10 pr-4 py-2.5 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-ink/70">Role</label>
            <div className="relative">
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40 pointer-events-none" />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-4 py-2.5 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent appearance-none"
              >
                {ALL_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 bg-accent text-cream font-semibold text-sm px-6 py-2.5 rounded-md hover:bg-accent/90 transition"
            >
              <Send className="w-4 h-4" />
              Send Invitation
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ── Recent invitations table ────────────────────────────────────── */

function RecentInvitations() {
  return (
    <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-ink/10 flex items-center gap-2">
        <Users className="w-4 h-4 text-accent" />
        <h2 className="font-semibold text-sm">Recent Invitations</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 bg-ink/[0.02]">
              <th className="text-left px-5 py-3 font-semibold text-ink/70">
                Name
              </th>
              <th className="text-left px-5 py-3 font-semibold text-ink/70 hidden sm:table-cell">
                Email
              </th>
              <th className="text-left px-5 py-3 font-semibold text-ink/70">
                Role
              </th>
              <th className="text-left px-5 py-3 font-semibold text-ink/70 hidden md:table-cell">
                Invited
              </th>
              <th className="text-left px-5 py-3 font-semibold text-ink/70">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_INVITED.map((u) => (
              <tr
                key={u.id}
                className="border-b border-ink/5 hover:bg-ink/[0.02] transition"
              >
                <td className="px-5 py-3 font-medium">{u.name}</td>
                <td className="px-5 py-3 text-ink/60 hidden sm:table-cell">
                  {u.email}
                </td>
                <td className="px-5 py-3">
                  <span className="bg-accent/10 text-accent text-xs font-semibold px-2 py-0.5 rounded-full">
                    {ROLE_LABELS[u.role]}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink/55 hidden md:table-cell">
                  {u.invitedAt}
                </td>
                <td className="px-5 py-3">
                  {u.status === "claimed" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Claimed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 text-xs font-semibold">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
