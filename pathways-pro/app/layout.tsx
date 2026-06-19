import "./globals.css";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Pathways Pro — AI-Powered Vocational Rehabilitation & Compliance Platform",
  description:
    "Pathways Pro is an AI-powered vocational rehabilitation and compliance platform that increases competitive integrated employment for disabled individuals by automating ADA/504/EEO documentation, case strategy, evidence organization, remote work safety, and entrepreneurship support.",
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
