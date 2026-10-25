import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ApiClientService } from 'shell/apiClient';
import { Account, AccountPage, AdminAccountsService } from './admin-accounts.service';

describe('AdminAccountsService', () => {
  const account: Account = {
    id: '33333333-3333-4333-8333-333333333333',
    fullName: 'Ana María Rojas',
    email: 'ana@example.com',
    identityDocument: '1075234567',
    role: 'PATIENT',
    active: true,
    registrationDate: '2026-10-20T14:00:00Z',
    lastAccess: null,
  };

  const page: AccountPage = {
    data: [account],
    meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
  };

  function setUp() {
    const getWithParams = vi.fn().mockReturnValue(of(page));
    const get = vi.fn().mockReturnValue(of(account));
    const put = vi.fn().mockReturnValue(of({ ...account, active: false }));
    TestBed.configureTestingModule({
      providers: [{ provide: ApiClientService, useValue: { getWithParams, get, put } }],
    });
    return { service: TestBed.inject(AdminAccountsService), getWithParams, get, put };
  }

  it('lists the accounts with only the filters the administrator chose', async () => {
    const { service, getWithParams } = setUp();

    const result = await firstValueFrom(
      service.list({ text: '  ana ', role: 'PATIENT', active: null, page: 2, limit: 20 }),
    );

    expect(result).toEqual(page);
    expect(getWithParams).toHaveBeenCalledWith('/auth/admin/accounts', {
      q: 'ana',
      role: 'PATIENT',
      page: 2,
      limit: 20,
    });
  });

  it('sends the status filter as true or false', async () => {
    const { service, getWithParams } = setUp();

    await firstValueFrom(service.list({ text: '', role: null, active: false, page: 1, limit: 20 }));

    expect(getWithParams).toHaveBeenCalledWith('/auth/admin/accounts', {
      active: 'false',
      page: 1,
      limit: 20,
    });
  });

  it('reads one account', async () => {
    const { service, get } = setUp();

    expect(await firstValueFrom(service.get(account.id))).toEqual(account);
    expect(get).toHaveBeenCalledWith(`/auth/admin/accounts/${account.id}`);
  });

  it('blocks or restores an account with the identity-api contract', async () => {
    const { service, put } = setUp();

    const updated = await firstValueFrom(service.changeStatus(account.id, false));

    expect(updated.active).toBe(false);
    expect(put).toHaveBeenCalledWith(`/auth/admin/accounts/${account.id}/status`, { active: false });
  });

  it('never builds a path from an id that is not a UUID', () => {
    const { service, get, put } = setUp();

    expect(() => service.get('../session')).toThrow();
    expect(() => service.changeStatus('x/../../', true)).toThrow();
    expect(get).not.toHaveBeenCalled();
    expect(put).not.toHaveBeenCalled();
  });
});
