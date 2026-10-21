import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject, of, throwError } from 'rxjs';
import { IdentityApiService } from '../../data/identity-api.service';
import { ResetPasswordPage } from './reset-password.page';

describe('ResetPasswordPage', () => {
  async function render(options: { fragment?: string; resetPassword?: ReturnType<typeof vi.fn> } = {}) {
    const resetPassword = options.resetPassword ?? vi.fn().mockReturnValue(of(null));
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'reset-password', component: ResetPasswordPage }]),
        { provide: IdentityApiService, useValue: { resetPassword } },
      ],
    });
    const replaceState = vi.spyOn(TestBed.inject(Location), 'replaceState');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/reset-password${options.fragment ?? '#token=reset-token'}`);
    const page = harness.routeNativeElement as HTMLElement;

    const type = (value: string) => {
      const input = page.querySelector<HTMLInputElement>('#password')!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      harness.detectChanges();
    };
    const submit = () => {
      page.querySelector('form')!.dispatchEvent(new Event('submit'));
      harness.detectChanges();
    };
    const text = (selector: string) => page.querySelector(selector)?.textContent ?? '';

    return { page, resetPassword, replaceState, type, submit, text };
  }

  it('removes the token from the address bar once it is read', async () => {
    const { replaceState } = await render();

    expect(replaceState).toHaveBeenLastCalledWith('/reset-password');
  });

  it('sends a link without token back to ask for a new one', async () => {
    const { page, text } = await render({ fragment: '' });

    expect(page.querySelector('form')).toBeNull();
    expect(text('h2')).toContain('Este enlace no es válido');
    expect(page.querySelector('.done a')?.getAttribute('href')).toBe('/forgot-password');
  });

  it('applies the identity-api password policy and rates the password', async () => {
    const { resetPassword, type, submit, text } = await render();

    submit();
    expect(text('#password-error')).toContain('Crea una contraseña.');

    type('Abc12');
    submit();
    expect(text('#password-error')).toContain('Usa al menos 8 caracteres.');
    expect(resetPassword).not.toHaveBeenCalled();

    type('Consulta-2026');
    expect(text('.meter')).toContain('Fuerte');
  });

  it('saves the new password with the token and confirms it', async () => {
    const { page, resetPassword, type, submit, text } = await render();
    type('Consulta-2026');

    submit();

    expect(resetPassword).toHaveBeenCalledWith('reset-token', 'Consulta-2026');
    expect(text('h2')).toContain('Tu contraseña está lista');
    expect(page.querySelector('.done a')?.getAttribute('href')).toBe('/sign-in');
  });

  it('shows progress and ignores a second submit while saving', async () => {
    const { resetPassword, type, submit, text } = await render({ resetPassword: vi.fn().mockReturnValue(new Subject()) });
    type('Consulta-2026');

    submit();
    submit();

    expect(resetPassword).toHaveBeenCalledTimes(1);
    expect(text('button[type="submit"]')).toContain('Guardando…');
  });

  it('offers a new link when the API rejects the token', async () => {
    const expired = { status: 401, code: 'INVALID_RESET_TOKEN', message: 'Invalid token.' };
    const { page, type, submit, text } = await render({
      resetPassword: vi.fn().mockReturnValue(throwError(() => expired)),
    });
    type('Consulta-2026');

    submit();

    expect(page.querySelector('form')).toBeNull();
    expect(text('.done')).toContain('no es válido o ya venció');
    expect(page.querySelector('.done a')?.getAttribute('href')).toBe('/forgot-password');
  });

  it('explains other failures and clears the password', async () => {
    const offline = { status: 0, code: 'NETWORK_ERROR', message: 'Cannot reach the server.' };
    const { page, type, submit, text } = await render({
      resetPassword: vi.fn().mockReturnValue(throwError(() => offline)),
    });
    type('Consulta-2026');

    submit();

    expect(text('[role="alert"]')).toContain('No pudimos conectarnos.');
    expect(page.querySelector<HTMLInputElement>('#password')?.value).toBe('');
  });
});
