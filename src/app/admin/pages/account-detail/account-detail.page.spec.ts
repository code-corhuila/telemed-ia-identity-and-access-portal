import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Account, AdminAccountsService } from '../../data/admin-accounts.service';
import { AccountDetailPage } from './account-detail.page';

const doctor: Account = {
  id: '44444444-4444-4444-8444-444444444444',
  fullName: 'Bruno Díaz',
  email: 'bruno@example.com',
  identityDocument: '80123456',
  role: 'PROFESSIONAL',
  active: true,
  registrationDate: '2026-10-20T14:00:00Z',
  lastAccess: '2026-10-24T18:30:00Z',
};

// The shell's router does not bind route parameters to inputs, so the page reads the route.
function openedAt(id: string) {
  return { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id }) } } };
}

describe('AccountDetailPage', () => {
  function render(account: Account = doctor, changeStatus = vi.fn()) {
    const get = vi.fn().mockReturnValue(of(account));
    TestBed.configureTestingModule({
      imports: [AccountDetailPage],
      providers: [provideRouter([]), openedAt(account.id), { provide: AdminAccountsService, useValue: { get, changeStatus } }],
    });
    const fixture = TestBed.createComponent(AccountDetailPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const button = (testId: string) => element.querySelector(`[data-testid="${testId}"]`) as HTMLButtonElement;
    return { fixture, element, get, changeStatus, button };
  }

  it('shows the account the administrator opened', () => {
    const { element, get } = render();

    expect(get).toHaveBeenCalledWith(doctor.id);
    expect(element.querySelector('h1')?.textContent).toContain('Bruno Díaz');
    expect(element.textContent).toContain('bruno@example.com');
    expect(element.textContent).toContain('80123456');
    expect(element.textContent).toContain('Profesional');
    expect(element.textContent).toContain('Activa');
  });

  it('asks before blocking and explains what it does to a professional', () => {
    const { fixture, element, changeStatus, button } = render();

    button('block').click();
    fixture.detectChanges();

    expect(changeStatus).not.toHaveBeenCalled();
    expect(element.textContent).toContain('No podrá iniciar sesión');
    expect(element.textContent).toContain('no cambia su perfil profesional');
  });

  it('blocks the access once confirmed and shows the new status', () => {
    const changeStatus = vi.fn().mockReturnValue(of({ ...doctor, active: false }));
    const { fixture, element, button } = render(doctor, changeStatus);

    button('block').click();
    fixture.detectChanges();
    button('confirm-block').click();
    fixture.detectChanges();

    expect(changeStatus).toHaveBeenCalledWith(doctor.id, false);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Acceso bloqueado');
    expect(element.textContent).toContain('Bloqueada');
    expect(button('restore')).not.toBeNull();
  });

  it('restores a blocked account without asking', () => {
    const changeStatus = vi.fn().mockReturnValue(of(doctor));
    const { fixture, element, button } = render({ ...doctor, active: false }, changeStatus);

    button('restore').click();
    fixture.detectChanges();

    expect(changeStatus).toHaveBeenCalledWith(doctor.id, true);
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Acceso restaurado');
  });

  it('explains why the change was refused', () => {
    const changeStatus = vi.fn().mockReturnValue(
      throwError(() => ({ status: 409, code: 'ACCOUNT_STATUS_CONFLICT', message: 'x' })),
    );
    const { fixture, element, button } = render(doctor, changeStatus);

    button('block').click();
    fixture.detectChanges();
    button('confirm-block').click();
    fixture.detectChanges();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain(
      'No puedes bloquear tu propia cuenta ni al último administrador activo.',
    );
    expect(element.textContent).toContain('Activa');
  });

  it('says when the account does not exist', () => {
    TestBed.configureTestingModule({
      imports: [AccountDetailPage],
      providers: [
        provideRouter([]),
        openedAt(doctor.id),
        {
          provide: AdminAccountsService,
          useValue: { get: () => throwError(() => ({ status: 404, code: 'NOT_FOUND', message: 'x' })) },
        },
      ],
    });
    const fixture = TestBed.createComponent(AccountDetailPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No encontramos esta cuenta.');
  });
});
