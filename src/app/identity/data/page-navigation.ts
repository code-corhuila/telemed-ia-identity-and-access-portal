import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

/**
 * Full page load instead of a router navigation.
 *
 * The portal receives its own instance of `shell/session`; the shell's
 * authGuard and interceptor only see a session opened here after the page
 * loads again and reads sessionStorage. Remove once the shell shares a
 * single SessionService instance with its portals.
 */
@Injectable({ providedIn: 'root' })
export class PageNavigation {
  private readonly document = inject(DOCUMENT);

  open(url: string): void {
    this.document.location.assign(url);
  }
}
