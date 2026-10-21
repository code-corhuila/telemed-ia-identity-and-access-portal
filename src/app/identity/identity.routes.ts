import { Routes } from '@angular/router';

/**
 * Exposed as `identity/routes`. The shell mounts them under /auth without
 * its authGuard: every page here is used before having a session.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'sign-in' },
  {
    path: 'sign-in',
    title: 'Iniciar sesión · TeleMed IA',
    loadComponent: () => import('./pages/sign-in/sign-in.page').then((module) => module.SignInPage),
  },
  {
    path: 'register',
    title: 'Crear cuenta · TeleMed IA',
    loadComponent: () => import('./pages/register/register.page').then((module) => module.RegisterPage),
  },
  {
    path: 'forgot-password',
    title: 'Recuperar contraseña · TeleMed IA',
    loadComponent: () =>
      import('./pages/forgot-password/forgot-password.page').then((module) => module.ForgotPasswordPage),
  },
];
