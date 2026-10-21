import { Injectable } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

/** Preview credentials: anything else is rejected like the real API does. */
export const PREVIEW_EMAIL = 'paciente@telemed.co';
export const PREVIEW_PASSWORD = 'Clave-segura1';

const LATENCY_MS = 700;

/**
 * Simulated `shell/apiClient` for `npm run start:preview`: lets designers
 * and reviewers walk through the pages without the shell, gateway or API.
 */
@Injectable({ providedIn: 'root' })
export class ApiClientService {
  get<T>(path: string): Observable<T> {
    return this.fail(404, 'NOT_FOUND', `Preview has no GET ${path}`);
  }

  post<T>(path: string, body: unknown, _idempotencyKey: string): Observable<T> {
    if (path === '/auth/login') {
      const { email, password } = body as { email: string; password: string };
      return email === PREVIEW_EMAIL && password === PREVIEW_PASSWORD
        ? of({ accessToken: 'preview.token.signature' } as T).pipe(delay(LATENCY_MS))
        : this.fail(401, 'INVALID_CREDENTIALS', 'Invalid credentials.');
    }
    return this.fail(404, 'NOT_FOUND', `Preview has no POST ${path}`);
  }

  private fail<T>(status: number, code: string, message: string): Observable<T> {
    return throwError(() => ({ status, code, message, traceId: 'preview' })).pipe(delay(LATENCY_MS));
  }
}
