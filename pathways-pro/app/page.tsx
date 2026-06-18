"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate, registerClient, type Role } from "@/lib/users";
import { loadSession, saveMode, saveSession } from "@/lib/session";

type Tab = "signin" | "signup";

export default function HomePage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("signin");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = loadSession();
    if (u) {
      router.replace(u.role === "counselor" ? "/dashboard" : "/portal");
    }
  }, [router]);

  if (!mounted) return null;

  return (
    <div className="grid md:grid-cols-2 gap-12 items-start">
      <section className="space-y-5 pt-4">
        <h1 className="text-5xl tracking-tight">
          Vocational Rehabilitation,{" "}
          <em className="italic text-accent">unified</em>.
        </h1>
        <p className="text-lg text-ink/80 prose-narrow">
          Pathways Pro brings the full ecosystem of federally recognized VR
          tools, career data, accommodation resources, and benefits counseling
          into one platform — with distinct interfaces for counselors and the
          clients they serve.
        </p>

        <div className="grid grid-cols-2 gap-3 max-w-md pt-2">
          <Stat label="Counselor tools" value="36" sub="across 7 categories" />
          <Stat label="Client tools" value="22" sub="across 6 categories" />
          <Stat label="O*NET occupations" value="60+" sub="matched by RIASEC fit" />
          <Stat label="Assessment items" value="44" sub="Big Five + RIASEC" />
        </div>

        <ul className="text-sm text-ink/70 space-y-1 list-disc pl-5 mt-4">
          <li>WIOA Title IV-aligned · HIPAA-compliant footer & data provenance</li>
          <li>Validated, public-domain assessments (Mini-IPIP + O*NET IP)</li>
          <li>AI career coach grounded in your profile (Claude Opus 4.7)</li>
          <li>Real labor-market data from BLS OOH 2024–34 and O*NET 28.3</li>
        </ul>
      </section>

      <section>
        <div className="bg-cream border border-ink/15 rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b border-ink/10">
            <TabButton active={tab === "signin"} onClick={() => setTab("signin")}>
              Sign in
            </TabButton>
            <TabButton active={tab === "signup"} onClick={() => setTab("signup")}>
              New client? Sign up
            </TabButton>
          </div>

          {tab === "signin" ? <SignInPanel /> : <SignUpPanel onDone={() => setTab("signin")} />}
        </div>
      </section>
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
      className={`flex-1 px-4 py-3 text-sm font-semibold transition ${
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
    saveMode(u.role);
    router.push(u.role === "counselor" ? "/dashboard" : "/portal");
  }

  function demoLogin() {
    const demoEmail =
      role === "counselor"
        ? "demo.counselor@pathwayspro.app"
        : "demo.client@pathwayspro.app";
    const u = authenticate(demoEmail, "demo1234", role);
    if (u) {
      saveSession(u);
      saveMode(u.role);
      router.push(u.role === "counselor" ? "/dashboard" : "/portal");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-7 space-y-5">
      <div className="flex bg-ink/5 rounded-md p-1">
        <button
          type="button"
          onClick={() => setRole("counselor")}
          className={`flex-1 px-3 py-2 text-sm rounded transition ${
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
          className={`flex-1 px-3 py-2 text-sm rounded transition ${
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

      <div className="space-y-3">
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
      </div>

      <button
        type="submit"
        className="w-full bg-accent text-cream font-semibold py-2.5 rounded hover:bg-accent/90 transition"
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
          className="text-accent hover:underline mt-1"
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
        <h2 className="text-xl mb-1">Create your client account</h2>
        <p className="text-xs text-ink/60">
          We&apos;ll assign you a case number and place you on the next available
          counselor&apos;s caseload. You&apos;ll be able to take assessments,
          build a resume, and chat with the AI coach right away.
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
        className="w-full bg-accent text-cream font-semibold py-2.5 rounded hover:bg-accent/90 transition"
      >
        Create account & assign case number →
      </button>

      <p className="text-xs text-ink/60 text-center">
        Already have an account?{" "}
        <button
          type="button"
          onClick={onDone}
          className="text-accent underline"
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

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-ink/15 rounded p-3">
      <div className="text-xs uppercase tracking-wider text-ink/50">{label}</div>
      <div className="text-2xl text-accent">{value}</div>
      <div className="text-xs text-ink/60">{sub}</div>
    </div>
  );
}

function Styles() {
  return (
    <style jsx>{`
      :global(.input) {
        width: 100%;
        background: white;
        border: 1px solid rgba(31, 29, 26, 0.2);
        border-radius: 6px;
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
      }
      :global(.input:focus) {
        outline: none;
        border-color: #b95c3c;
      }
    `}</style>
  );
}
