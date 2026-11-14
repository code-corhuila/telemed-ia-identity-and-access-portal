import { Injectable } from '@angular/core';

/** Test double of `shell/session`, kept in memory. */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private token: string | null = null;
  private refreshToken: string | null = null;

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  signIn(token: string, refreshToken?: string): void {
    this.token = token;
    this.refreshToken = refreshToken ?? null;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  getToken(): string | null {
    return this.token;
  }
}
