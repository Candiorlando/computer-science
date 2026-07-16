"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User,
  Building,
  ChevronDown,
  Info,
  Play,
  Monitor,
} from "lucide-react";
import { authenticate, type Role } from "@/lib/users";
import { saveMode, saveSession } from "@/lib/session";
import {
  REQUESTABLE_ROLES,
  ROLE_LABELS,
  DEMO_PERSONAS,
  dashboardRoute,
} from "@/lib/rbac";

type View = "login" | "request";

export default function LoginPage() {
  const [view, setView] = useState<View>("login");

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Logo link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-2xl tracking-tight font-bold text-ink"
          >
            Pathways Pro
          </Link>
          <p className="text-sm text-ink/60 mt-1">
            {view === "login"
              ? "Sign in to your account"
              : "Request platform access"}
          </p>
        </div>

        {/* Auth card */}
        <div className="bg-white border border-ink/15 rounded-xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-ink/10">
            <TabButton
              active={view === "login"}
              onClick={() => setView("login")}
              icon={<LogIn className="w-4 h-4" />}
            >
              Log In
            </TabButton>
            <TabButton
              active={view === "request"}
              onClick={() => setView("request")}
              icon={<UserPlus className="w-4 h-4" />}
            >
              Request Access
            </TabButton>
          </div>

          {view === "login" ? <LoginForm /> : <RequestAccessForm />}
        </div>

        {/* Demo mode card */}
        <DemoModeCard />

        <p className="text-center text-xs text-ink/50">
          Received an invitation?{" "}
          <Link href="/claim-account" className="text-accent hover:underline">
            Claim your account
          </Link>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TAB BUTTON
   ═══════════════════════════════════════════════════════════════════ */

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition ${
        active
          ? "bg-white text-accent border-b-2 border-accent"
          : "bg-ink/[0.03] text-ink/55 hover:text-ink"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   LOGIN FORM
   ═══════════════════════════════════════════════════════════════════ */

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Try all roles — the universal gateway doesn't ask for role
    const roles: Role[] = [
      "counselor",
      "client",
      "business",
      "vendor",
      "partner",
    ];
    let foundUser = null;
    for (const role of roles) {
      const u = authenticate(email, password, role);
      if (u) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      setLoading(false);
      setError("Invalid email or password.");
      return;
    }

    saveSession(foundUser);
    if (foundUser.role === "counselor" || foundUser.role === "client") {
      saveMode(foundUser.role);
    }
    router.push(dashboardRoute(foundUser));
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="login-email"
          className="text-sm font-medium text-ink/80"
        >
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <input
            id="login-email"
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
        <label
          htmlFor="login-password"
          className="text-sm font-medium text-ink/80"
        >
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <input
            id="login-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full pl-10 pr-4 py-2.5 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-white font-semibold py-3 rounded-md hover:bg-accent-light transition text-sm disabled:opacity-60"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>

      <p className="text-center text-xs text-ink/50">
        Forgot your password?{" "}
        <button type="button" className="text-accent hover:underline">
          Reset it
        </button>
      </p>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   REQUEST ACCESS FORM
   ═══════════════════════════════════════════════════════════════════ */

function RequestAccessForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [role, setRole] = useState<Role>("client");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-fresh/20 grid place-items-center mx-auto">
          <Info className="w-7 h-7 text-fresh" />
        </div>
        <h3 className="text-lg font-semibold">Request Submitted</h3>
        <p className="text-sm text-ink/65 max-w-xs mx-auto">
          Your request has been submitted for administrator review. You will
          receive an email invitation once your access is approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div className="flex gap-3 bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-md">
        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <p>
          Access must be approved by a platform administrator. You will receive
          an email invitation once approved.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="req-name" className="text-sm font-medium text-ink/80">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <input
            id="req-name"
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
        <label htmlFor="req-email" className="text-sm font-medium text-ink/80">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <input
            id="req-email"
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
        <label htmlFor="req-org" className="text-sm font-medium text-ink/80">
          Organization
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
          <input
            id="req-org"
            type="text"
            required
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            placeholder="Your agency or company"
            className="w-full pl-10 pr-4 py-2.5 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="req-role" className="text-sm font-medium text-ink/80">
          Requested Role
        </label>
        <div className="relative">
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40 pointer-events-none" />
          <select
            id="req-role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="w-full px-4 py-2.5 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent appearance-none"
          >
            {REQUESTABLE_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-accent text-white font-semibold py-3 rounded-md hover:bg-accent-light transition text-sm"
      >
        Submit Request
      </button>
    </form>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DEMO MODE CARD
   ═══════════════════════════════════════════════════════════════════ */

function DemoModeCard() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const persona = DEMO_PERSONAS[selectedIndex];

  function handleLaunch() {
    setError("");
    setLoading(true);

    const user = authenticate(persona.email, persona.password, persona.authRole);
    if (!user) {
      setLoading(false);
      setError("Demo account could not be loaded. Please try again.");
      return;
    }

    saveSession(user);
    if (user.role === "counselor" || user.role === "client") {
      saveMode(user.role);
    }
    router.push(dashboardRoute(user));
  }

  return (
    <div className="bg-white border-2 border-fresh/30 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-fresh/10 px-5 py-3.5 border-b border-fresh/20 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-fresh/20 grid place-items-center">
          <Monitor className="w-4 h-4 text-fresh-dark" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-ink">Try Demo</h3>
          <p className="text-xs text-ink/55">
            Explore the platform as any user type
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {/* Role dropdown */}
        <div className="space-y-1.5">
          <label
            htmlFor="demo-role"
            className="text-xs font-semibold text-ink/70 uppercase tracking-wider"
          >
            Select a Role
          </label>
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40 pointer-events-none" />
            <select
              id="demo-role"
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              className="w-full px-4 py-2.5 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-fresh/30 focus:border-fresh appearance-none font-medium"
            >
              {DEMO_PERSONAS.map((p, i) => (
                <option key={p.label} value={i}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description of selected role */}
        <div className="bg-cream rounded-lg px-4 py-3 border border-ink/5">
          <p className="text-sm text-ink/70">
            <span className="font-semibold text-ink">{persona.label}:</span>{" "}
            {persona.description}
          </p>
        </div>

        {/* Launch button */}
        <button
          onClick={handleLaunch}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-fresh text-white font-semibold py-3 rounded-md hover:bg-fresh-dark transition text-sm disabled:opacity-60 shadow-sm"
        >
          <Play className="w-4 h-4" />
          {loading ? "Loading demo..." : "Launch Demo"}
        </button>

        <p className="text-center text-[11px] text-ink/40">
          No account required. Demo data resets on each session.
        </p>
      </div>
    </div>
  );
}
