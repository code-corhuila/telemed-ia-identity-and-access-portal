import { Routes } from '@angular/router';

/**
 * Exposed as `identity/admin`. The shell mounts them under /accounts inside
 * its authGuard; identity-api answers 403 to anyone but an ADMIN.
 */
export const routes: Routes = [
  {
    path: '',
    title: 'Cuentas · TeleMed IA',
    loadComponent: () => import('./pages/accounts/accounts.page').then((module) => module.AccountsPage),
  },
];
