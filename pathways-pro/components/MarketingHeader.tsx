"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/services", label: "Solutions" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function MarketingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-accent text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl tracking-tight font-bold flex-shrink-0"
        >
          Pathways Pro
        </Link>

        {/* Center nav — desktop */}
        <nav
          className="hidden md:flex items-center gap-8"
          aria-label="Marketing"
        >
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-white/80 hover:text-white transition font-medium"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* CTA — desktop */}
        <Link
          href="/login"
          className="hidden md:inline-flex bg-white text-accent font-semibold text-sm px-5 py-2 rounded-md hover:bg-white/90 transition"
        >
          Pathways Login
        </Link>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-white/80 hover:text-white"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/20 bg-accent px-6 py-4 space-y-3">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="block text-sm text-white/80 hover:text-white py-1"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="block bg-white text-accent font-semibold text-sm px-5 py-2.5 rounded-md text-center hover:bg-white/90 transition mt-2"
          >
            Pathways Login
          </Link>
        </div>
      )}
    </header>
  );
}
