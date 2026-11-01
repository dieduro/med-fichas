const messages = {
  session: "Iniciá sesión nuevamente para sincronizar tus cambios.",
  read: "No se pudieron cargar los pacientes. Revisá tu conexión e intentá sincronizar nuevamente.",
  format:
    "No se pudieron cargar los pacientes porque algunos datos tienen un formato incompatible.",
  save: "No se pudieron enviar los cambios. Quedaron guardados en este dispositivo para reintentar.",
  remove: "No se pudo sincronizar la eliminación. Se reintentará cuando vuelvas a sincronizar.",
  local: "No se pudieron leer los pacientes guardados en este dispositivo.",
  browser: "Tu navegador no permite sincronizar de forma segura entre pestañas.",
};

export class PatientSyncError extends Error {
  constructor(kind: keyof typeof messages, cause?: unknown) {
    super(messages[kind], {cause});
    this.name = "PatientSyncError";
  }
}

export function syncErrorMessage(error: unknown): string {
  return error instanceof PatientSyncError
    ? error.message
    : "No se pudo sincronizar. Revisá tu conexión e intentá nuevamente.";
}
