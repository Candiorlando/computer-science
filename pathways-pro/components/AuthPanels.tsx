"use client";

// Counselor / client authentication card — extracted from the old
// homepage so it can live at /signin (and anywhere else that needs
// an auth entry point). Business & vendor sign-in stays on /business.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate, registerClient, type Role } from "@/lib/users";
import { saveMode, saveSession } from "@/lib/session";

type Tab = "signin" | "signup";

export function AuthCard() {
  const [tab, setTab] = useState<Tab>("signin");
  return (
    <div className="bg-cream border border-ink/15 rounded-lg shadow-sm overflow-hidden">
      <div className="flex border-b border-ink/10">
        <TabButton active={tab === "signin"} onClick={() => setTab("signin")}>
          Sign in
        </TabButton>
        <TabButton active={tab === "signup"} onClick={() => setTab("signup")}>
          New client? Sign up
        </TabButton>
      </div>
      {tab === "signin" ? (
        <SignInPanel />
      ) : (
        <SignUpPanel onDone={() => setTab("signin")} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-4 py-3 min-h-[44px] text-sm font-semibold transition ${
        active
          ? "bg-cream text-accent border-b-2 border-accent"
          : "bg-ink/5 text-ink/60 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function SignInPanel() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("counselor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const u = authenticate(email, password, role);
    if (!u) {
      setError("Invalid credentials. Try the demo account below.");
      return;
    }
    saveSession(u);
    if (u.role === "counselor" || u.role === "client") saveMode(u.role);
    router.push(u.role === "counselor" ? "/case-search" : "/portal");
  }

  function demoLogin() {
    const demoEmail =
      role === "counselor"
        ? "demo.counselor@pathwayspro.app"
        : "demo.client@pathwayspro.app";
    const u = authenticate(demoEmail, "demo1234", role);
    if (u) {
      saveSession(u);
      if (u.role === "counselor" || u.role === "client") saveMode(u.role);
      router.push(u.role === "counselor" ? "/case-search" : "/portal");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-7 space-y-5">
      <div className="flex bg-ink/5 rounded-md p-1">
        <button
          type="button"
          onClick={() => setRole("counselor")}
          className={`flex-1 px-3 py-2.5 min-h-[44px] text-sm rounded transition ${
            role === "counselor"
              ? "bg-cream shadow-sm text-accent font-semibold"
              : "text-ink/60"
          }`}
        >
          Counselor
        </button>
        <button
          type="button"
          onClick={() => setRole("client")}
          className={`flex-1 px-3 py-2.5 min-h-[44px] text-sm rounded transition ${
            role === "client"
              ? "bg-cream shadow-sm text-accent font-semibold"
              : "text-ink/60"
          }`}
        >
          Client
        </button>
      </div>

      {error && (
        <div className="bg-accent/10 border border-accent/30 text-accent text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={
            role === "counselor" ? "counselor@agency.gov" : "you@example.com"
          }
          className="input"
          autoComplete="username"
        />
      </Field>
      <Field label="Password">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input"
          autoComplete="current-password"
        />
      </Field>

      <button
        type="submit"
        className="w-full bg-accent text-cream font-semibold py-3 min-h-[44px] rounded hover:bg-accent/90 transition"
      >
        Sign in as {role === "counselor" ? "Counselor" : "Client"}
      </button>

      <div className="border-t border-ink/10 pt-4 text-xs text-ink/60 space-y-1">
        <div>
          <strong className="text-ink/80">Demo account:</strong>
        </div>
        <div>
          Email:{" "}
          <code className="bg-ink/5 px-1 rounded">
            {role === "counselor"
              ? "demo.counselor@pathwayspro.app"
              : "demo.client@pathwayspro.app"}
          </code>
        </div>
        <div>
          Password: <code className="bg-ink/5 px-1 rounded">demo1234</code>
        </div>
        <button
          type="button"
          onClick={demoLogin}
          className="text-accent hover:underline mt-1 py-2 min-h-[44px]"
        >
          → One-click demo login
        </button>
      </div>

      <Styles />
    </form>
  );
}

function SignUpPanel({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dob, setDob] = useState("");
  const [goal, setGoal] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const result = registerClient({
      firstName,
      lastName,
      email,
      password,
      dob,
      goal,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    saveSession(result.user);
    saveMode("client");
    router.push("/portal");
  }

  return (
    <form onSubmit={handleSubmit} className="p-7 space-y-5">
      <div>
        <h3 className="text-xl mb-1">Create your client account</h3>
        <p className="text-xs text-ink/60">
          We&apos;ll assign you a case number and place you on the next
          available counselor&apos;s caseload.
        </p>
      </div>

      {error && (
        <div className="bg-accent/10 border border-accent/30 text-accent text-sm px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="First name">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirst(e.target.value)}
            placeholder="Jordan"
            className="input"
            autoComplete="given-name"
          />
        </Field>
        <Field label="Last name">
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLast(e.target.value)}
            placeholder="Hayes"
            className="input"
            autoComplete="family-name"
          />
        </Field>
      </div>

      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input"
          autoComplete="email"
        />
      </Field>

      <Field label="Password (6+ characters)">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input"
          autoComplete="new-password"
        />
      </Field>

      <Field label="Date of birth">
        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="input"
          autoComplete="bday"
        />
      </Field>

      <Field label="What are you hoping to do? (optional)">
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Find a job in office administration"
          className="input"
        />
      </Field>

      <button
        type="submit"
        className="w-full bg-accent text-cream font-semibold py-3 min-h-[44px] rounded hover:bg-accent/90 transition"
      >
        Create account &amp; assign case number →
      </button>

      <p className="text-xs text-ink/60 text-center">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onDone}
          className="text-accent underline py-2"
        >
          Sign in
        </button>
      </p>

      <Styles />
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

function Styles() {
  return (
    <style jsx>{`
      :global(.input) {
        width: 100%;
        background: #1E293B;
        border: 1px solid rgba(230, 234, 242, 0.2);
        border-radius: 6px;
        padding: 0.65rem 0.75rem;
        font-size: 0.9rem;
        min-height: 44px;
      }
      :global(.input:focus) {
        outline: none;
        border-color: #6366F1;
      }
    `}</style>
  );
}
