import { Injectable } from '@angular/core';

/** Simulated `shell/session` for the preview; nothing is stored. */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private token: string | null = null;

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  signIn(token: string, _refreshToken?: string): void {
    this.token = token;
    console.info('[preview] session opened');
  }
}
