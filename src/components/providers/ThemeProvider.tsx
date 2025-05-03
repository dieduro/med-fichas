"use client";

import React, {useEffect, useState} from "react";
import {ThemeProvider as NextThemesProvider} from "next-themes";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
  forcedTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  themes?: string[];
}

export function ThemeProvider({children, ...props}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Use Effect for dark mode initialization
  useEffect(() => {
    // Get stored theme or default to system
    const storedTheme = localStorage.getItem("medifichas-theme") || "system";

    // Get system preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Initial application of theme
    if (storedTheme === "dark" || (storedTheme === "system" && prefersDark)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a skeleton without theme provider during SSR
    return <>{children}</>;
  }

  return (
    <NextThemesProvider
      disableTransitionOnChange
      enableSystem
      attribute="class"
      defaultTheme="system"
      storageKey="medifichas-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
