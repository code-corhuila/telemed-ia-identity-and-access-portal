import { Route } from '@angular/router';
import { routes } from './admin.routes';
import { AccountsPage } from './pages/accounts/accounts.page';

describe('admin routes', () => {
  it('serves the account list at the root the shell mounts', async () => {
    const accounts = routes.find((route) => route.path === '') as Route;

    expect(accounts.title).toBe('Cuentas · TeleMed IA');
    expect(await (accounts.loadComponent as () => Promise<unknown>)()).toBe(AccountsPage);
  });
});
