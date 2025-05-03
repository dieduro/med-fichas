"use client";

import {useState} from "react";

import {createClient} from "@/lib/supabase/client";
import {Button} from "@/components/ui/button";
import {Icons} from "@/components/icons"; // Assuming you have an Icons component for SVGs

export function GoogleSignInButton() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignIn() {
    setIsLoading(true);
    try {
      const {error} = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback`, // Redirect back to the app after Google auth
        },
      });

      if (error) {
        console.error("Error signing in with Google:", error.message);
        // TODO: Add user-facing error handling (e.g., toast notification)
        setIsLoading(false);
      }
      // No need to setIsLoading(false) on success, as the page will redirect
    } catch (error) {
      console.error("Unexpected error during Google sign-in:", error);
      // TODO: Add user-facing error handling
      setIsLoading(false);
    }
  }

  return (
    <Button
      className="w-full"
      disabled={isLoading}
      type="button"
      variant="outline"
      onClick={handleSignIn}
    >
      {isLoading ? (
        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Icons.google className="mr-2 h-4 w-4" /> // Assuming Icons.google exists
      )}
      Sign in with Google
    </Button>
  );
}

// Helper: Define a simple spinner and Google icon if you don't have an Icons component
// You should replace this with your actual Icons component or SVGs
// Ensure you have `lucide-react` installed or use your own SVGs
/*
import { Loader2, Chrome } from 'lucide-react';

const Icons = {
  spinner: Loader2,
  google: Chrome,
};
*/
