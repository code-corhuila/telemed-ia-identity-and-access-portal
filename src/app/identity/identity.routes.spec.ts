import { Route } from '@angular/router';
import { routes } from './identity.routes';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password.page';
import { RegisterPage } from './pages/register/register.page';
import { ResetPasswordPage } from './pages/reset-password/reset-password.page';

describe('identity routes', () => {
  it('serves the registration page at /auth/register', async () => {
    const register = routes.find((route) => route.path === 'register') as Route;

    expect(register.title).toBe('Crear cuenta · TeleMed IA');
    expect(await (register.loadComponent as () => Promise<unknown>)()).toBe(RegisterPage);
  });

  it('serves the recovery request page at /auth/forgot-password', async () => {
    const forgot = routes.find((route) => route.path === 'forgot-password') as Route;

    expect(forgot.title).toBe('Recuperar contraseña · TeleMed IA');
    expect(await (forgot.loadComponent as () => Promise<unknown>)()).toBe(ForgotPasswordPage);
  });

  it('serves the new password page at /auth/reset-password, the link identity-api emails', async () => {
    const reset = routes.find((route) => route.path === 'reset-password') as Route;

    expect(reset.title).toBe('Nueva contraseña · TeleMed IA');
    expect(await (reset.loadComponent as () => Promise<unknown>)()).toBe(ResetPasswordPage);
  });
});
