import "./globals.css";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Pathways Pro — Vocational Rehabilitation Platform",
  description:
    "Dual-mode platform for VR counselors and clients. WIOA Title IV aligned. Built on O*NET, BLS OOH, and CRCC standards.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-serif">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
