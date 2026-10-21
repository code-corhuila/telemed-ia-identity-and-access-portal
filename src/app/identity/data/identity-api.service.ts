import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from 'shell/apiClient';

export interface SignInCredentials {
  readonly email: string;
  readonly password: string;
}

/** LoginResponse of telemed-ia-identity-and-access-api. */
export interface SignInResult {
  readonly userId: string;
  readonly role: 'PATIENT' | 'PROFESSIONAL' | 'ADMIN';
  readonly accessToken: string;
  readonly tokenType: 'Bearer';
  readonly expiresAt: string;
  readonly refreshToken: string;
  readonly refreshExpiresAt: string;
}

/** RegisterPatientRequest of telemed-ia-identity-and-access-api. */
export interface Registration {
  readonly fullName: string;
  readonly email: string;
  readonly identityDocument: string;
  readonly password: string;
}

/** RegisterPatientResponse: the account exists but no session is opened. */
export interface RegistrationResult {
  readonly userId: string;
  readonly role: 'PATIENT';
}

/**
 * Calls identity-and-access-api through the shell's single HTTP client
 * (NORMA 5.4.1), which adds /api/v1, the correlation id and the error
 * envelope normalisation.
 */
@Injectable({ providedIn: 'root' })
export class IdentityApiService {
  private readonly api = inject(ApiClientService);

  signIn(credentials: SignInCredentials): Observable<SignInResult> {
    return this.api.post<SignInResult>('/auth/login', credentials, crypto.randomUUID());
  }

  register(registration: Registration): Observable<RegistrationResult> {
    return this.api.post<RegistrationResult>('/auth/register', registration, crypto.randomUUID());
  }

  /** identity-api answers 202 whether or not the email exists, so there is nothing to read. */
  requestPasswordRecovery(email: string): Observable<unknown> {
    return this.api.post('/auth/password-recovery', { email }, crypto.randomUUID());
  }

  resetPassword(token: string, newPassword: string): Observable<unknown> {
    return this.api.post('/auth/password-reset', { token, newPassword }, crypto.randomUUID());
  }
}
