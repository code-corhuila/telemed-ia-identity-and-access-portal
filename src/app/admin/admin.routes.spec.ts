import { Route } from '@angular/router';
import { routes } from './admin.routes';
import { AccountDetailPage } from './pages/account-detail/account-detail.page';
import { AccountsPage } from './pages/accounts/accounts.page';

describe('admin routes', () => {
  it('serves the account list at the root the shell mounts', async () => {
    const accounts = routes.find((route) => route.path === '') as Route;

    expect(accounts.title).toBe('Cuentas · TeleMed IA');
    expect(await (accounts.loadComponent as () => Promise<unknown>)()).toBe(AccountsPage);
  });

  it('opens one account at /accounts/:id', async () => {
    const detail = routes.find((route) => route.path === ':id') as Route;

    expect(detail.title).toBe('Cuenta · TeleMed IA');
    expect(await (detail.loadComponent as () => Promise<unknown>)()).toBe(AccountDetailPage);
  });
});
