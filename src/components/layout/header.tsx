import Link from "next/link";

import {createClient} from "@/lib/supabase/server";
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

export async function Header() {
  const supabase = createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  const avatarUrl = user?.user_metadata?.avatar_url;
  const userEmail = user?.email ?? "";
  const fallbackInitials = getInitials(userEmail);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          {/* TODO: Replace with actual Logo component */}
          <Link className="mr-6 flex items-center space-x-2" href="/">
            <span className="font-bold">MedFichas</span>
          </Link>
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
                <Link href="/login">Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
