import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { IdentityApiService, RegistrationResult } from '../../data/identity-api.service';
import { RegisterPage } from './register.page';

const CREATED: RegistrationResult = { userId: '22222222-2222-4222-8222-222222222222', role: 'PATIENT' };

describe('RegisterPage', () => {
  function render(register = vi.fn().mockReturnValue(of(CREATED))) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: IdentityApiService, useValue: { register } }],
    });
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;

    const type = (id: string, value: string) => {
      const input = page.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };
    const fill = () => {
      type('fullName', '  Ana María Rojas ');
      type('email', ' ana@example.com ');
      type('identityDocument', ' 1075234567 ');
      type('password', 'Consulta-2026');
    };
    const submit = () => {
      page.querySelector('form')!.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
    };
    const text = (selector: string) => page.querySelector(selector)?.textContent ?? '';

    return { page, register, type, fill, submit, text };
  }

  it('asks only for what identity-api stores, with the right autocomplete', () => {
    const { page } = render();

    expect([...page.querySelectorAll('input')].map((input) => input.id)).toEqual([
      'fullName',
      'email',
      'identityDocument',
      'password',
    ]);
    expect(page.querySelector('#fullName')?.getAttribute('autocomplete')).toBe('name');
    expect(page.querySelector('#password')?.getAttribute('autocomplete')).toBe('new-password');
  });

  it('marks every empty field and does not call the API', () => {
    const { register, submit, text } = render();

    submit();

    expect(register).not.toHaveBeenCalled();
    expect(text('#fullName-error')).toContain('Escribe tu nombre completo.');
    expect(text('#email-error')).toContain('Escribe tu correo electrónico.');
    expect(text('#identityDocument-error')).toContain('Escribe tu número de documento.');
    expect(text('#password-error')).toContain('Crea una contraseña.');
  });

  it('explains the password rules identity-api enforces', () => {
    const { type, fill, submit, text, register } = render();
    fill();
    type('password', 'Abc12');

    submit();

    expect(register).not.toHaveBeenCalled();
    expect(text('#password-error')).toContain('Usa al menos 8 caracteres.');
  });

  it('rates the password while the patient types', () => {
    const { type, text } = render();

    type('password', 'abcdefgh');
    expect(text('.meter')).toContain('Débil');

    type('password', 'Consulta-2026');
    expect(text('.meter')).toContain('Fuerte');
  });

  it('sends the trimmed data and confirms the account', () => {
    const { page, register, fill, submit, text } = render();
    fill();

    submit();

    expect(register).toHaveBeenCalledWith({
      fullName: 'Ana María Rojas',
      email: 'ana@example.com',
      identityDocument: '1075234567',
      password: 'Consulta-2026',
    });
    expect(text('h2')).toContain('Tu cuenta está lista');
    expect(text('.done')).toContain('ana@example.com');
    expect(page.querySelector('.done a')?.getAttribute('href')).toBe('/sign-in');
    expect(page.querySelector('form')).toBeNull();
  });

  it('shows progress and ignores a second submit while creating the account', () => {
    const { register, fill, submit, text } = render(vi.fn().mockReturnValue(new Subject<RegistrationResult>()));
    fill();

    submit();
    submit();

    expect(register).toHaveBeenCalledTimes(1);
    expect(text('button[type="submit"]')).toContain('Creando cuenta…');
  });

  it('explains an existing account, keeps the data and clears the password', () => {
    const conflict = { status: 409, code: 'REGISTRATION_CONFLICT', message: 'Conflict.' };
    const { page, fill, submit, text } = render(vi.fn().mockReturnValue(throwError(() => conflict)));
    fill();

    submit();

    expect(text('[role="alert"]')).toContain('Ya existe una cuenta con ese correo o documento.');
    expect(page.querySelector<HTMLInputElement>('#email')?.value).toBe('ana@example.com');
    expect(page.querySelector<HTMLInputElement>('#password')?.value).toBe('');
  });
});
