"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, loadSession } from "@/lib/session";
import type { AnyUser } from "@/lib/users";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<AnyUser | null>(null);
  const [textSize, setTextSize] = useState<"100" | "125" | "150" | "200">("100");
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyCaseNotes, setNotifyCaseNotes] = useState(true);

  useEffect(() => {
    const s = loadSession();
    if (!s) return router.replace("/");
    setUser(s);
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("pathways-pro:settings-v1");
      if (stored) {
        try {
          const cfg = JSON.parse(stored);
          if (cfg.textSize) setTextSize(cfg.textSize);
          if (typeof cfg.highContrast === "boolean") setHighContrast(cfg.highContrast);
          if (typeof cfg.reduceMotion === "boolean") setReduceMotion(cfg.reduceMotion);
          if (typeof cfg.notifyMessages === "boolean") setNotifyMessages(cfg.notifyMessages);
          if (typeof cfg.notifyCaseNotes === "boolean") setNotifyCaseNotes(cfg.notifyCaseNotes);
        } catch {}
      }
    }
  }, [router]);

  function save() {
    window.localStorage.setItem(
      "pathways-pro:settings-v1",
      JSON.stringify({
        textSize,
        highContrast,
        reduceMotion,
        notifyMessages,
        notifyCaseNotes,
      }),
    );
    document.documentElement.style.setProperty("font-size", `${textSize}%`);
  }

  function signOutEverywhere() {
    if (!window.confirm("Sign out of this device?")) return;
    clearSession();
    router.push("/");
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-widest text-ink/55 mb-1">
          Settings
        </p>
        <h1 className="text-3xl font-semibold">Account &amp; preferences</h1>
      </header>

      <section className="saas-card space-y-3">
        <h2 className="text-lg font-semibold">Account</h2>
        <Row label="Name" value={user.name} />
        <Row label="Email" value={user.email} />
        <Row label="Role" value={user.role} capitalize />
      </section>

      <section className="saas-card space-y-3">
        <h2 className="text-lg font-semibold">Accessibility</h2>
        <Field label="Text size">
          <select
            value={textSize}
            onChange={(e) => setTextSize(e.target.value as typeof textSize)}
            className="input max-w-xs"
          >
            <option value="100">100% (default)</option>
            <option value="125">125%</option>
            <option value="150">150%</option>
            <option value="200">200% (AAA scaling)</option>
          </select>
        </Field>
        <Toggle
          label="Force high contrast (overrides OS)"
          checked={highContrast}
          onChange={setHighContrast}
        />
        <Toggle
          label="Force reduced motion (overrides OS)"
          checked={reduceMotion}
          onChange={setReduceMotion}
        />
      </section>

      <section className="saas-card space-y-3">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <Toggle
          label="New messages"
          checked={notifyMessages}
          onChange={setNotifyMessages}
        />
        <Toggle
          label="New case notes on cases I supervise"
          checked={notifyCaseNotes}
          onChange={setNotifyCaseNotes}
        />
      </section>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={save}
          className="grad-tealblue text-white font-semibold px-4 py-2 rounded-md text-sm"
        >
          Save preferences
        </button>
        <button
          onClick={signOutEverywhere}
          className="border border-ink/15 text-ink/75 hover:bg-ink/5 px-4 py-2 rounded-md text-sm"
        >
          Sign out
        </button>
      </div>

      <style jsx>{`
        :global(.input) {
          background: white;
          border: 1px solid rgba(31, 29, 26, 0.15);
          border-radius: 8px;
          padding: 0.5rem 0.75rem;
          font-size: 0.9rem;
        }
        :global(.input:focus-visible) {
          outline: 2px solid #06b6d4;
          outline-offset: -1px;
        }
      `}</style>
    </div>
  );
}

function Row({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm border-b border-ink/10 pb-2 last:border-0">
      <span className="text-ink/60">{label}</span>
      <span className={capitalize ? "font-semibold capitalize" : "font-semibold"}>
        {value}
      </span>
    </div>
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

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-cyan-500 w-4 h-4"
      />
      <span>{label}</span>
    </label>
  );
}
