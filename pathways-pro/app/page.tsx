"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate, type Role } from "@/lib/users";
import { loadSession, saveMode, saveSession } from "@/lib/session";

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("counselor");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const u = loadSession();
    if (u) {
      router.replace(u.role === "counselor" ? "/dashboard" : "/portal");
    }
  }, [router]);

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

  if (!mounted) return null;

  return (
    <div className="grid md:grid-cols-2 gap-12 items-center">
      <section className="space-y-5">
        <h1 className="text-5xl tracking-tight">
          Vocational Rehabilitation, <em className="italic text-accent">unified</em>.
        </h1>
        <p className="text-lg text-ink/80 prose-narrow">
          Pathways Pro brings the full ecosystem of federally recognized VR tools,
          career data, accommodation resources, and benefits counseling into one
          platform — with distinct interfaces for counselors and the clients they serve.
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
        <form
          onSubmit={handleSubmit}
          className="bg-cream border border-ink/15 rounded-lg p-8 shadow-sm space-y-5"
        >
          <div>
            <h2 className="text-2xl mb-1">Sign in</h2>
            <p className="text-sm text-ink/60">
              Choose your role to access the right interface.
            </p>
          </div>

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
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  role === "counselor"
                    ? "counselor@agency.gov"
                    : "you@example.com"
                }
                className="w-full bg-white border border-ink/20 rounded px-3 py-2 focus:outline-none focus:border-accent"
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-ink/60 mb-1">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white border border-ink/20 rounded px-3 py-2 focus:outline-none focus:border-accent"
                autoComplete="current-password"
              />
            </label>
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
        </form>
      </section>
    </div>
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
