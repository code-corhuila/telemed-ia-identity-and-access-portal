import { Routes } from '@angular/router';

/**
 * Exposed as `identity/routes`. The shell mounts them under /auth without
 * its authGuard: every page here is used before having a session.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'sign-in' },
];
