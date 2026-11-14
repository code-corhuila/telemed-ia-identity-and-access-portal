import { Routes } from '@angular/router';

/** Standalone routes mirror the path the shell uses for this remote. */
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./identity/identity.routes').then((module) => module.routes),
  },
  {
    path: 'accounts',
    loadChildren: () => import('./admin/admin.routes').then((module) => module.routes),
  },
  { path: '', pathMatch: 'full', redirectTo: 'auth/sign-in' },
  { path: '**', redirectTo: 'auth/sign-in' },
];
