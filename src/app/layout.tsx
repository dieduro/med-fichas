import type {Metadata} from "next";

import Link from "next/link";
import {Inter} from "next/font/google";
import "./globals.css";
import "./styles.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TonyFichas",
  description: "Fichas médicas",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="container m-auto grid min-h-screen grid-rows-[auto,1fr,auto] bg-background px-4 font-sans antialiased">
        <header className="text-xl font-bold leading-[4rem]">
          <Link href="/">TonyFichas</Link>
        </header>
        <main className="py-8">{children}</main>
        <footer className="text-center leading-[4rem] opacity-70">
          © {new Date().getFullYear()} DiegoDuro
        </footer>
      </body>
    </html>
  );
}
