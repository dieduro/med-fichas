"use client";

import {useEffect, useState} from "react";
import {Download, CheckCircle2, AlertCircle} from "lucide-react";

import {registerServiceWorker} from "@/lib/utils/serviceWorkerUtils";

interface PWAInitializerProps {
  children: React.ReactNode;
}

export const PWAInitializer: React.FC<PWAInitializerProps> = ({children}) => {
  const [registrationStatus, setRegistrationStatus] = useState<{
    initialized: boolean;
    success?: boolean;
    error?: string;
  }>({
    initialized: false,
  });
  const [showIndicator, setShowIndicator] = useState(true);

  useEffect(() => {
    // Initialize PWA in the background without blocking the UI
    const initializePWA = async () => {
      try {
        // Register service worker with a timeout
        const result = await registerServiceWorker();

        setRegistrationStatus({
          initialized: true,
          success: result.success,
          error: result.error,
        });

        if (!result.success && result.error) {
          console.warn("Service worker registration issue:", result.error);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);

        console.error("Failed to initialize PWA:", errorMessage);

        setRegistrationStatus({
          initialized: true,
          success: false,
          error: errorMessage,
        });
      }
    };

    // Start initialization in the background
    initializePWA();

    // Auto-hide the indicator after 5 seconds
    const hideTimeout = setTimeout(() => {
      setShowIndicator(false);
    }, 5000);

    return () => clearTimeout(hideTimeout);
  }, []);

  // Hide the indicator if clicked
  const handleDismiss = () => {
    setShowIndicator(false);
  };

  return (
    <>
      {children}

      {/* Non-intrusive PWA status indicator */}
      {showIndicator && registrationStatus.initialized ? (
        <div
          className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-md bg-background/80 px-3 py-2 text-xs font-medium shadow-md backdrop-blur-sm transition-all duration-300"
          onClick={handleDismiss}
        >
          {registrationStatus.success ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Offline support ready</span>
            </>
          ) : registrationStatus.error ? (
            <>
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>Limited offline support</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4 animate-pulse text-primary" />
              <span>Preparing offline support...</span>
            </>
          )}
        </div>
      ) : null}
    </>
  );
};

export default PWAInitializer;
