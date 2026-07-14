"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error boundary:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
      <p className="text-xs uppercase tracking-widest text-accent">
        Something went wrong
      </p>
      <h1 className="text-4xl tracking-tight">
        We hit an unexpected error.
      </h1>
      <p className="text-ink/70 max-w-md mx-auto">
        This has been logged. You can try again, or head back to the
        home page.
      </p>
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <button
          onClick={reset}
          className="bg-accent text-cream font-semibold px-6 py-3 min-h-[44px] rounded-md hover:bg-accent/90 transition"
        >
          Try again
        </button>
        <a
          href="/"
          className="border border-accent text-accent font-semibold px-6 py-3 min-h-[44px] rounded-md hover:bg-accent/5 transition"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}
