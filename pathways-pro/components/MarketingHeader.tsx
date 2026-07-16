"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/features", label: "Solutions" },
  { href: "/about", label: "Features" },
  { href: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-ink/10 bg-cream/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl tracking-tight font-semibold text-ink flex-shrink-0"
        >
          Pathways Pro
        </Link>

        {/* Center nav — desktop */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Marketing">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-ink/70 hover:text-accent transition font-medium"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA — desktop */}
        <Link
          href="/login"
          className="hidden md:inline-flex bg-accent text-cream font-semibold text-sm px-5 py-2.5 rounded-md hover:bg-accent/90 transition"
        >
          Log In / Request Access
        </Link>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-ink/70 hover:text-ink"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-ink/10 bg-cream px-6 py-4 space-y-3">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-ink/70 hover:text-accent py-1"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="block bg-accent text-cream font-semibold text-sm px-5 py-2.5 rounded-md text-center hover:bg-accent/90 transition mt-2"
          >
            Log In / Request Access
          </Link>
        </div>
      )}
    </header>
  );
}
