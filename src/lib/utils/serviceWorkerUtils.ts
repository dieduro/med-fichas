type RegistrationResult = {success: true} | {success: false; error: string};
let registrationTask: Promise<RegistrationResult> | null = null;

export function registerServiceWorker(): Promise<RegistrationResult> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve({success: false, error: "Service workers are not supported"});
  }
  if (registrationTask) return registrationTask;
  registrationTask = register();

  return registrationTask;
}

async function register(): Promise<RegistrationResult> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    await Promise.race([
      navigator.serviceWorker.register("/sw.js").then(() => navigator.serviceWorker.ready),
      new Promise<never>((_resolve, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Service worker registration timed out")),
          10000,
        );
      }),
    ]);

    return {success: true};
  } catch (error) {
    registrationTask = null;

    return {success: false, error: error instanceof Error ? error.message : "Registration failed"};
  } finally {
    clearTimeout(timeout);
  }
}
