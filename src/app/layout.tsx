import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import Overlays from "@/components/Overlays";
import { Suspense } from "react";
import RouteProgress from "@/components/RouteProgress";
import DemoBanner from "@/components/DemoBanner";
import { DEMO, ENV_LABEL } from "@/lib/demo";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"], weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "KT Academy · Katalon Learning Portal",
  description: "Hands-on Katalon guides, certification paths and reviewed practice work for manual testers moving into automation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-demo={DEMO || ENV_LABEL ? "1" : undefined} className={`${inter.variable} ${sora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col" suppressHydrationWarning><Suspense fallback={null}><RouteProgress /></Suspense><DemoBanner />{children}<Overlays /></body>
    </html>
  );
}
