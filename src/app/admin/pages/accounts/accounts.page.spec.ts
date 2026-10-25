import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Account, AccountPage, AdminAccountsService } from '../../data/admin-accounts.service';
import { AccountsPage } from './accounts.page';

const ana: Account = {
  id: '33333333-3333-4333-8333-333333333333',
  fullName: 'Ana María Rojas',
  email: 'ana@example.com',
  identityDocument: '1075234567',
  role: 'PATIENT',
  active: true,
  registrationDate: '2026-10-20T14:00:00Z',
  lastAccess: null,
};

const bruno: Account = {
  ...ana,
  id: '44444444-4444-4444-8444-444444444444',
  fullName: 'Bruno Díaz',
  role: 'PROFESSIONAL',
  active: false,
  lastAccess: '2026-10-24T18:30:00Z',
};

function pageOf(data: Account[], page = 1, totalPages = 1): AccountPage {
  return { data, meta: { page, limit: 20, total: data.length, totalPages } };
}

describe('AccountsPage', () => {
  function render(list = vi.fn().mockReturnValue(of(pageOf([ana, bruno], 1, 2)))) {
    TestBed.configureTestingModule({
      imports: [AccountsPage],
      providers: [provideRouter([]), { provide: AdminAccountsService, useValue: { list } }],
    });
    const fixture = TestBed.createComponent(AccountsPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, element, list };
  }

  function query(page = 1, overrides = {}) {
    return { text: '', role: null, active: null, page, limit: 20, ...overrides };
  }

  it('lists the first page of accounts in plain language', () => {
    const { element, list } = render();

    expect(list).toHaveBeenCalledWith(query());
    const rows = element.querySelectorAll('[data-testid="account-row"]');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('Ana María Rojas');
    expect(rows[0].textContent).toContain('ana@example.com');
    expect(rows[0].textContent).toContain('Paciente');
    expect(rows[0].textContent).toContain('Activa');
    expect(rows[0].textContent).toContain('Nunca');
    expect(rows[1].textContent).toContain('Profesional');
    expect(rows[1].textContent).toContain('Bloqueada');
    expect(element.textContent).toContain('Página 1 de 2');
    expect(rows[0].querySelector('a')?.getAttribute('href')).toBe(`/${ana.id}`);
  });

  it('searches from the first page with the typed text', () => {
    const { fixture, element, list } = render();
    const input = element.querySelector('input[type="search"]') as HTMLInputElement;

    input.value = 'ana';
    element.querySelector('form')!.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(list).toHaveBeenLastCalledWith(query(1, { text: 'ana' }));
  });

  it('filters by role and status', () => {
    const { fixture, element, list } = render();
    const [role, status] = Array.from(element.querySelectorAll('select'));

    role.value = 'ADMIN';
    role.dispatchEvent(new Event('change'));
    status.value = 'false';
    status.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(list).toHaveBeenLastCalledWith(query(1, { role: 'ADMIN', active: false }));
  });

  it('moves between pages and cannot go before the first one', () => {
    const { fixture, element, list } = render();
    const [previous, next] = Array.from(element.querySelectorAll<HTMLButtonElement>('nav button'));

    expect(previous.disabled).toBe(true);
    next.click();
    fixture.detectChanges();

    expect(list).toHaveBeenLastCalledWith(query(2));
  });

  it('says when no account matches and offers to clear the filters', () => {
    const { element } = render(vi.fn().mockReturnValue(of({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } })));

    expect(element.textContent).toContain('Ninguna cuenta coincide con la búsqueda.');
    expect(element.querySelector('[data-testid="clear-filters"]')).not.toBeNull();
  });

  it('explains a failure and loads again on retry', () => {
    const list = vi.fn().mockReturnValueOnce(
      throwError(() => ({ status: 500, code: 'INTERNAL_ERROR', message: 'x', traceId: 'trace-9' })),
    ).mockReturnValue(of(pageOf([ana])));
    const { fixture, element } = render(list);

    expect(element.textContent).toContain('trace-9');
    (element.querySelector('[data-testid="retry"]') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(element.querySelectorAll('[data-testid="account-row"]')).toHaveLength(1);
  });
});
