"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Lock, CheckCircle2, ShieldCheck } from "lucide-react";

/**
 * Claim Account / Accept Invitation — UI mockup.
 *
 * In production this page receives a signed token via the URL
 * (e.g. /claim-account?token=xxx) that identifies the invited user.
 * Here we show the UI shell so the visual flow is complete.
 */
export default function ClaimAccountPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Mock invitation context — in production, decoded from the token
  const invitation = {
    name: "Maria Gonzalez",
    email: "maria.gonzalez@summit-crp.org",
    role: "Vendor",
    organization: "Summit Community Rehabilitation",
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    // In production: POST to API to finalize account creation.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 grid place-items-center mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Account Created
          </h1>
          <p className="text-ink/65 text-sm max-w-sm mx-auto">
            Your account has been set up successfully. You can now sign in
            with your email and the password you just created.
          </p>
          <Link
            href="/login"
            className="inline-flex bg-accent text-cream font-semibold px-6 py-3 rounded-md hover:bg-accent/90 transition text-sm"
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-full bg-accent/10 grid place-items-center mx-auto">
            <KeyRound className="w-7 h-7 text-accent" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Accept Invitation
          </h1>
          <p className="text-sm text-ink/60">
            Set your password to activate your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-ink/15 rounded-xl shadow-sm p-6 space-y-6">
          {/* Invitation context */}
          <div className="bg-cream border border-ink/10 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-accent font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Invitation Details
            </div>
            <dl className="grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-ink/50">Name</dt>
              <dd className="font-medium">{invitation.name}</dd>
              <dt className="text-ink/50">Email</dt>
              <dd className="font-medium">{invitation.email}</dd>
              <dt className="text-ink/50">Role</dt>
              <dd className="font-medium">{invitation.role}</dd>
              <dt className="text-ink/50">Organization</dt>
              <dd className="font-medium">{invitation.organization}</dd>
            </dl>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="text-sm font-medium text-ink/80"
              >
                Create Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                <input
                  id="new-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="text-sm font-medium text-ink/80"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/40" />
                <input
                  id="confirm-password"
                  type="password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repeat your password"
                  className="w-full pl-10 pr-4 py-2.5 border border-ink/15 rounded-md text-sm bg-cream/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-accent text-cream font-semibold py-3 rounded-md hover:bg-accent/90 transition text-sm"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-xs text-ink/50">
            By creating your account you agree to the{" "}
            <Link href="/terms" className="text-accent hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
