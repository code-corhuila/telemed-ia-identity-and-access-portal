import { Route } from '@angular/router';
import { routes } from './app.routes';
import { routes as identityRoutes } from './identity/identity.routes';

describe('standalone routes', () => {
  it('mounts the exposed identity routes under /auth, as the shell does', async () => {
    const auth = routes.find((route) => route.path === 'auth') as Route;

    const children = await (auth.loadChildren as () => Promise<unknown>)();

    expect(children).toBe(identityRoutes);
  });

  it('opens sign-in by default', () => {
    expect(routes.find((route) => route.path === '')?.redirectTo).toBe('auth/sign-in');
    expect(identityRoutes.find((route) => route.path === '')?.redirectTo).toBe('sign-in');
  });
});
