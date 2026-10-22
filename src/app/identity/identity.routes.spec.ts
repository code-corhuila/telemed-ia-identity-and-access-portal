import { Route } from '@angular/router';
import { routes } from './identity.routes';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password.page';
import { RegisterPage } from './pages/register/register.page';

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
});
