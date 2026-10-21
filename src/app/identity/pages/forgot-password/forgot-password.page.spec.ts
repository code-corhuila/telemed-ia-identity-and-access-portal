import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { IdentityApiService } from '../../data/identity-api.service';
import { ForgotPasswordPage } from './forgot-password.page';

describe('ForgotPasswordPage', () => {
  function render(requestPasswordRecovery = vi.fn().mockReturnValue(of(null))) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: IdentityApiService, useValue: { requestPasswordRecovery } }],
    });
    const fixture = TestBed.createComponent(ForgotPasswordPage);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;

    const type = (value: string) => {
      const input = page.querySelector<HTMLInputElement>('#email')!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    const submit = () => {
      page.querySelector('form')!.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
    };
    const text = (selector: string) => page.querySelector(selector)?.textContent ?? '';

    return { fixture, page, requestPasswordRecovery, type, submit, text };
  }

  it('asks for the email of the account', () => {
    const { page } = render();

    expect(page.querySelector('label[for="email"]')?.textContent).toContain('Correo electrónico');
    expect(page.querySelector('#email')?.getAttribute('autocomplete')).toBe('email');
  });

  it('checks the email before calling the API', () => {
    const { requestPasswordRecovery, type, submit, text } = render();

    submit();
    expect(text('#email-error')).toContain('Escribe tu correo electrónico.');

    type('ana@');
    submit();
    expect(text('#email-error')).toContain('Escribe un correo válido');
    expect(requestPasswordRecovery).not.toHaveBeenCalled();
  });

  it('gives the same answer whether or not the account exists', () => {
    const { page, requestPasswordRecovery, type, submit, text } = render();
    type(' ana@example.com ');

    submit();

    expect(requestPasswordRecovery).toHaveBeenCalledWith('ana@example.com');
    expect(text('h2')).toContain('Revisa tu correo');
    expect(text('.done')).toContain('Si ana@example.com tiene una cuenta');
    expect(page.querySelector('.done a')?.getAttribute('href')).toBe('/sign-in');
  });

  it('lets the patient ask again with another email', () => {
    const { fixture, page, submit, type } = render();
    type('ana@example.com');
    submit();

    page.querySelector<HTMLButtonElement>('.done button')!.click();
    fixture.detectChanges();

    expect(page.querySelector<HTMLInputElement>('#email')?.value).toBe('ana@example.com');
  });

  it('shows progress and ignores a second submit while sending', () => {
    const { requestPasswordRecovery, type, submit, text } = render(vi.fn().mockReturnValue(new Subject()));
    type('ana@example.com');

    submit();
    submit();

    expect(requestPasswordRecovery).toHaveBeenCalledTimes(1);
    expect(text('button[type="submit"]')).toContain('Enviando…');
  });

  it('explains a connection problem and keeps the email', () => {
    const offline = { status: 0, code: 'NETWORK_ERROR', message: 'Cannot reach the server.' };
    const { page, type, submit, text } = render(vi.fn().mockReturnValue(throwError(() => offline)));
    type('ana@example.com');

    submit();

    expect(text('[role="alert"]')).toContain('No pudimos conectarnos.');
    expect(page.querySelector<HTMLInputElement>('#email')?.value).toBe('ana@example.com');
  });
});
