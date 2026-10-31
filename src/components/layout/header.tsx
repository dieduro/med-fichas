"use client";

import type {User} from "@supabase/supabase-js";

import {useEffect, useState} from "react";

import {createClient} from "@/lib/supabase/client";
import {LogoutButton} from "@/components/auth/logout-button";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Button} from "@/components/ui/button";
import {ThemeToggle} from "@/components/theme/theme-toggle";

// Helper to get initials from email
function getInitials(email: string): string {
  if (!email) return "?";
  const parts = email.split("@")[0].split(/[.\-_]/);

  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const {
      data: {subscription},
    } = createClient().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const avatarUrl = user?.user_metadata?.avatar_url;
  const userEmail = user?.email ?? "";
  const fallbackInitials = getInitials(userEmail);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          {/* TODO: Replace with actual Logo component */}
          <a className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold">MedFichas</span>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <>
                <span className="hidden text-sm text-gray-600 sm:inline">{userEmail}</span>
                <LogoutButton />
                <Avatar className="h-8 w-8">
                  <AvatarImage alt={userEmail} src={avatarUrl} />
                  <AvatarFallback>{fallbackInitials}</AvatarFallback>
                </Avatar>
              </>
            ) : (
              <Button asChild size="sm" variant="outline">
                <a href="/login">Login</a>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
