import { Route } from '@angular/router';
import { routes } from './identity.routes';
import { RegisterPage } from './pages/register/register.page';

describe('identity routes', () => {
  it('serves the registration page at /auth/register', async () => {
    const register = routes.find((route) => route.path === 'register') as Route;

    expect(register.title).toBe('Crear cuenta · TeleMed IA');
    expect(await (register.loadComponent as () => Promise<unknown>)()).toBe(RegisterPage);
  });
});
