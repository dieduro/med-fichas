import {Workbox} from "workbox-window";

// Check if service workers are supported
export const isServiceWorkerSupported = (): boolean => {
  return typeof window !== "undefined" && "serviceWorker" in navigator;
};

// Register the service worker
export const registerServiceWorker = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  // Early return if not in browser environment
  if (typeof window === "undefined") {
    return {
      success: false,
      error: "Not in browser environment",
    };
  }

  // Check if service workers are supported
  if (!isServiceWorkerSupported()) {
    return {
      success: false,
      error: "Service workers are not supported in this browser",
    };
  }

  // Check if we're in an incognito/private browsing mode
  // In some browsers, service workers don't work properly in private browsing
  try {
    if ("storage" in navigator) {
      const testValue = "test";

      localStorage.setItem(testValue, testValue);
      localStorage.removeItem(testValue);
    }
  } catch (e) {
    return {
      success: false,
      error: "Service worker may not work in private browsing mode",
    };
  }

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<{success: false; error: string}>((resolve) => {
      setTimeout(() => {
        resolve({
          success: false,
          error: "Service worker registration timed out",
        });
      }, 3000); // 3 second timeout
    });

    // Check if service worker is already registered
    const registrationResult = await Promise.race([
      navigator.serviceWorker.getRegistration(),
      timeoutPromise,
    ]);

    // If we got a timeout or no existing registration
    if (!registrationResult) {
      console.log("No existing service worker found, registering new one");
    } else if ("error" in registrationResult) {
      console.warn("Service worker check timed out, proceeding with registration");
    } else {
      console.log("Service worker already registered:", registrationResult);

      return {success: true};
    }

    // Create a new Workbox instance with optimized options
    const wb = new Workbox("/sw.js", {
      // Increase the registration timeout
      registerOptions: {
        timeout: 2000, // 2 seconds
      },
    });

    // Add event listeners for service worker lifecycle events
    wb.addEventListener("installed", (event) => {
      console.log("Service worker installed:", event.type, event.isUpdate ? "(update)" : "(new)");
      if (event.isUpdate) {
        // For updates, we'll use a less intrusive notification in the future
        console.log("Service worker updated");
      }
    });

    // Register the service worker with a timeout
    const registrationPromise = wb.register();
    const registration = (await Promise.race([registrationPromise, timeoutPromise])) as
      | ServiceWorkerRegistration
      | {success: false; error: string};

    if (registration && "error" in registration) {
      console.warn(registration.error);

      return {
        success: false,
        error: registration.error,
      };
    }

    if (!registration || "error" in registration) {
      return {
        success: false,
        error: "Service worker registration returned undefined or failed",
      };
    }

    console.log("Service worker registered successfully");

    return {success: true};
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    console.error("Service worker registration error:", errorMessage);

    return {
      success: false,
      error: `Failed to register service worker: ${errorMessage}`,
    };
  }
};

// Check if the app is installed (in standalone mode)
export const isAppInstalled = (): boolean => {
  return (
    typeof window !== "undefined" &&
    (window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches ||
      // @ts-expect-error - This is a non-standard property
      window.navigator.standalone === true)
  );
};

// Check if the app can be installed
export const canInstallApp = (): boolean => {
  return typeof window !== "undefined" && !isAppInstalled();
};
