import "./globals.css";
import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Pathways Pro — AI-Powered Vocational Rehabilitation & Compliance Platform",
  description:
    "Pathways Pro is an AI-powered vocational rehabilitation and compliance platform that increases competitive integrated employment for disabled individuals. It also provides business-facing solutions — including inclusive hiring assessments, job task analysis, retention risk reporting, and ADA / Section 504 / EEO compliance consulting — creating a unified ecosystem where clients, counselors, businesses, and vendors collaborate to improve employment outcomes and accessibility.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
