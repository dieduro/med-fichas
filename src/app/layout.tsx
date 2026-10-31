import type {Metadata, Viewport} from "next";

import {Inter} from "next/font/google";

import "./globals.css";
import "./styles.css";
import PWAInitializer from "@/components/providers/PWAInitializer";
import PatientsProvider from "@/components/providers/PatientsProvider";
import {Toaster} from "@/components/ui/sonner";
import {Header} from "@/components/layout/header";
import {ThemeProvider} from "@/components/providers/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "MediFichas",
  description: "Medical Patient Management System",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MediFichas",
  },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head>
        <link href="/icons/icon-192x192.png" rel="apple-touch-icon" />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="default" name="apple-mobile-web-app-status-bar-style" />
      </head>
      <body className={`${inter.variable} min-h-screen bg-background font-sans antialiased`}>
        <ThemeProvider>
          <PWAInitializer>
            <PatientsProvider>
              <div className="relative flex min-h-screen flex-col bg-background">
                <Header />
                <main className="container flex-1 py-8">{children}</main>
                <footer className="py-6 md:px-8 md:py-0">
                  <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
                    <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
                      © {new Date().getFullYear()} DiegoDuro
                    </p>
                  </div>
                </footer>
              </div>
              <Toaster />
            </PatientsProvider>
          </PWAInitializer>
        </ThemeProvider>
      </body>
    </html>
  );
}
