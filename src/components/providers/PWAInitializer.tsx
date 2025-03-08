"use client";

import {useEffect, useState} from "react";

import {registerServiceWorker} from "@/lib/utils/serviceWorkerUtils";

interface PWAInitializerProps {
  children: React.ReactNode;
}

export const PWAInitializer: React.FC<PWAInitializerProps> = ({children}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePWA = async () => {
      try {
        // Register service worker
        const result = await registerServiceWorker();

        if (!result.success && result.error) {
          console.warn("Service worker registration failed:", result.error);
          setError(result.error);
        }

        setIsInitialized(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        console.error("Failed to initialize PWA:", errorMessage);
        setError(errorMessage);
        setIsInitialized(true); // Still mark as initialized to show the app
      }
    };

    initializePWA();
  }, []);

  // Show a loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p>Initializing application...</p>
        </div>
      </div>
    );
  }

  // Show error if initialization failed
  if (error) {
    console.warn("PWA initialization warning:", error);
    // We still render the app even if service worker registration fails
  }

  return <>{children}</>;
};

export default PWAInitializer;
