import { ApiError } from 'shell/apiError';
import { errorMessage } from './error-message';

function apiError(status: number, code: string, traceId?: string): ApiError {
  return { status, code, message: 'server message in English', traceId };
}

describe('errorMessage', () => {
  it('explains wrong credentials without saying which field failed', () => {
    expect(errorMessage(apiError(401, 'INVALID_CREDENTIALS')).text).toBe(
      'El correo o la contraseña no coinciden. Revísalos e inténtalo de nuevo.',
    );
  });

  it('tells the user to check the form on validation errors', () => {
    expect(errorMessage(apiError(400, 'VALIDATION_ERROR')).text).toBe(
      'Revisa los datos del formulario e inténtalo de nuevo.',
    );
  });

  it('separates connection problems from server failures', () => {
    expect(errorMessage(apiError(0, 'NETWORK_ERROR')).text).toBe(
      'No pudimos conectarnos. Revisa tu conexión a internet e inténtalo de nuevo.',
    );
    expect(errorMessage(apiError(0, 'TIMEOUT')).text).toBe(
      'El servicio tardó demasiado en responder. Inténtalo de nuevo en un momento.',
    );
  });

  it('never shows the English server message and offers a support code', () => {
    const message = errorMessage(apiError(500, 'INTERNAL_ERROR', 'trace-123'));

    expect(message.text).toBe('No pudimos completar la solicitud. Inténtalo de nuevo en unos minutos.');
    expect(message.supportCode).toBe('trace-123');
  });

  it('uses the generic message for anything that is not an ApiError', () => {
    expect(errorMessage(new Error('boom')).text).toBe(
      'No pudimos completar la solicitud. Inténtalo de nuevo en unos minutos.',
    );
  });
});
