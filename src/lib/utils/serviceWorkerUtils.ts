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
  if (!isServiceWorkerSupported()) {
    return {
      success: false,
      error: "Service workers are not supported in this browser",
    };
  }

  try {
    const wb = new Workbox("/sw.js");

    // Add event listeners for service worker updates
    wb.addEventListener("installed", (event) => {
      if (event.isUpdate) {
        // If it's an update, show a notification to the user
        if (
          window.confirm("New version available! Click OK to refresh and use the latest version.")
        ) {
          window.location.reload();
        }
      }
    });

    // Register the service worker
    await wb.register();

    return {success: true};
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

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
