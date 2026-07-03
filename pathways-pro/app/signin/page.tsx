import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/AuthPanels";

export const metadata: Metadata = {
  title: "Sign in | Pathways Pro",
  description:
    "Access your Pathways Pro workspace. Counselors and clients sign in here; employers, vendors, and employment partners use the business portal entrance.",
};

export default function SignInPage() {
  return (
    <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start py-6">
      <div className="space-y-5 pt-2">
        <p className="text-xs uppercase tracking-widest text-accent">
          Welcome back
        </p>
        <h1 className="text-4xl tracking-tight">Sign in to Pathways Pro</h1>
        <p className="text-ink/75">
          Counselors land on their Case Search; clients land on their portal
          with assessments, documents, and their IPE.
        </p>
        <div className="border border-ink/15 bg-cream rounded-lg p-4 text-sm text-ink/75">
          <strong className="text-ink">Employer, vendor, or employment
          partner?</strong>{" "}
          Your sign-in lives on the business portal.
          <div className="mt-2">
            <Link
              href="/business#signin"
              className="inline-block border border-accent text-accent font-semibold px-4 py-2.5 min-h-[44px] rounded-md hover:bg-accent/5 transition"
            >
              Go to business sign-in →
            </Link>
          </div>
        </div>
        <p className="text-sm text-ink/60">
          New to the platform?{" "}
          <Link href="/request-demo" className="text-accent underline">
            Request a demo
          </Link>{" "}
          and we&apos;ll set your team up.
        </p>
      </div>

      <AuthCard />
    </div>
  );
}
