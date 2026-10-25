import { ApiError } from 'shell/apiError';

export interface UserMessage {
  readonly text: string;
  /** traceId the user can quote to support; only for unexpected failures. */
  readonly supportCode?: string;
}

const GENERIC = 'No pudimos completar la solicitud. Inténtalo de nuevo en unos minutos.';

// Codes from the identity-api error envelope and the shell interceptor.
const MESSAGES: Readonly<Record<string, string>> = {
  INVALID_CREDENTIALS: 'El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.',
  VALIDATION_ERROR: 'Revisa los datos del formulario e inténtalo de nuevo.',
  INVALID_REGISTRATION: 'Revisa los datos del formulario e inténtalo de nuevo.',
  INVALID_RESET_TOKEN: 'El enlace para restablecer tu contraseña no es válido o ya venció. Solicita uno nuevo.',
  INVALID_NEW_PASSWORD: 'La nueva contraseña no cumple los requisitos. Usa al menos 8 caracteres.',
  FORBIDDEN: 'Solo los administradores pueden gestionar las cuentas.',
  REGISTRATION_CONFLICT: 'Ya existe una cuenta con ese correo o documento. Inicia sesión o recupera tu contraseña.',
  NETWORK_ERROR: 'No pudimos conectarnos. Revisa tu conexión a internet e inténtalo de nuevo.',
  TIMEOUT: 'El servicio tardó demasiado en responder. Inténtalo de nuevo en un momento.',
};

/** Spanish message for the user; server messages are English and technical. */
export function errorMessage(error: unknown): UserMessage {
  if (!isApiError(error)) {
    return { text: GENERIC };
  }

  const known = MESSAGES[error.code];
  return known ? { text: known } : { text: GENERIC, supportCode: error.traceId };
}

function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'status' in error && 'code' in error;
}
