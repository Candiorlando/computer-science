import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AppShell } from "@/components/AppShell";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Pathways Pro — Rehabilitation, Unified",
  description:
    "Pathways Pro is a digital ecosystem that brings together counselors, clients, businesses, and partners into a single rehabilitation platform — driving competitive integrated employment, inclusive hiring, and ADA compliance.",
  openGraph: {
    title: "Pathways Pro — Rehabilitation, Unified",
    description:
      "A digital ecosystem unifying counselors, clients, businesses, and partners for competitive integrated employment.",
    url: "https://www.pathwayspro.app",
    siteName: "Pathways Pro",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pathways Pro — Rehabilitation, Unified",
    description:
      "A digital ecosystem unifying counselors, clients, businesses, and partners for competitive integrated employment.",
  },
  metadataBase: new URL("https://www.pathwayspro.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen font-sans">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
