import { Injectable } from '@angular/core';

/** Test double of `shell/session`, kept in memory. */
@Injectable({ providedIn: 'root' })
export class SessionService {
  private token: string | null = null;

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  signIn(token: string): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }
}
