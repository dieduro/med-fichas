import type {Metadata} from "next";

import Link from "next/link";
import {Inter} from "next/font/google";

import "./globals.css";
import "./styles.css";
import PWAInitializer from "@/components/providers/PWAInitializer";
import OfflineProvider from "@/components/providers/OfflineProvider";
import OfflineIndicator from "@/components/ui/OfflineIndicator";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Med-Fichas",
  description: "Medical Patient Management System",
  manifest: "/manifest.json",
  themeColor: "#4f46e5",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Med-Fichas",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link href="/icons/icon-192x192.png" rel="apple-touch-icon" />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
      </head>
      <body className="container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] bg-background px-4 font-sans antialiased">
        <PWAInitializer>
          <OfflineProvider>
            <header className="max-w-3xl text-xl font-bold leading-[4rem]">
              <Link href="/">Med-Fichas</Link>
            </header>
            <main className="py-8">{children}</main>
            <footer className="text-center leading-[4rem] opacity-70">
              © {new Date().getFullYear()} DiegoDuro
            </footer>
            <OfflineIndicator />
          </OfflineProvider>
        </PWAInitializer>
      </body>
    </html>
  );
}
