import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Subscription Active | Pathways Pro",
};

export default function CheckoutSuccessPage() {
  return (
    <div className="max-w-lg mx-auto py-20 text-center space-y-6">
      <div className="w-16 h-16 bg-accent text-cream rounded-full grid place-items-center text-3xl mx-auto">
        &#10003;
      </div>
      <h1 className="text-4xl tracking-tight">
        Welcome to Pathways Pro.
      </h1>
      <p className="text-ink/70 text-lg">
        Your subscription is active. Your workspace is ready — sign in
        to start building your caseload.
      </p>
      <div className="flex flex-wrap gap-3 justify-center pt-3">
        <Link
          href="/signin"
          className="bg-accent text-cream font-semibold px-6 py-3 rounded-md hover:bg-accent/90 transition"
        >
          Sign in to your workspace
        </Link>
        <Link
          href="/dashboard/payments"
          className="border border-accent text-accent font-semibold px-6 py-3 rounded-md hover:bg-accent/5 transition"
        >
          View subscription
        </Link>
      </div>
      <p className="text-xs text-ink/50 pt-4">
        Pathways Pro. Rehabilitation, unified.
      </p>
    </div>
  );
}
