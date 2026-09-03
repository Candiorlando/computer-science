import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | Pathways Pro",
};

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
      <p className="text-xs uppercase tracking-widest text-accent">
        404 · Page not found
      </p>
      <h1 className="text-5xl tracking-tight">
        This path doesn&apos;t lead anywhere.
      </h1>
      <p className="text-ink/70 max-w-md mx-auto">
        The page you&apos;re looking for may have moved, or the link you
        followed is out of date. Let&apos;s get you back on a real pathway.
      </p>
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Link
          href="/"
          className="bg-accent text-cream font-semibold px-6 py-3 min-h-[44px] rounded-md hover:bg-accent/90 transition"
        >
          ← Back to home
        </Link>
        <Link
          href="/signin"
          className="border border-accent text-accent font-semibold px-6 py-3 min-h-[44px] rounded-md hover:bg-accent/5 transition"
        >
          Sign in to your workspace
        </Link>
      </div>
      <p className="text-xs text-ink/50 pt-4">
        Employer or vendor?{" "}
        <Link href="/business" className="text-accent underline">
          Business portal →
        </Link>
      </p>
    </div>
  );
}
