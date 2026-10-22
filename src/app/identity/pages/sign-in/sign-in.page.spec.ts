import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { SessionService } from 'shell/session';
import { IdentityApiService, SignInResult } from '../../data/identity-api.service';
import { PageNavigation } from '../../data/page-navigation';
import { SignInPage } from './sign-in.page';

const RESULT = { accessToken: 'header.payload.signature', refreshToken: 'refresh-token' } as SignInResult;

describe('SignInPage', () => {
  function render(options: { signIn?: ReturnType<typeof vi.fn>; returnUrl?: string } = {}) {
    const signIn = options.signIn ?? vi.fn().mockReturnValue(of(RESULT));
    const navigate = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: PageNavigation, useValue: { open: navigate } },
        { provide: IdentityApiService, useValue: { signIn } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap(options.returnUrl ? { returnUrl: options.returnUrl } : {}),
            },
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(SignInPage);
    fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;

    const type = (label: string, value: string) => {
      const input = page.querySelector<HTMLInputElement>(`#${label}`)!;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    };
    const submit = () => {
      page.querySelector('form')!.dispatchEvent(new Event('submit'));
      fixture.detectChanges();
    };

    return { fixture, page, signIn, navigate, type, submit };
  }

  it('labels both fields and suggests the right autocomplete', () => {
    const { page } = render();

    expect(page.querySelector('label[for="email"]')?.textContent).toContain('Correo electrónico');
    expect(page.querySelector('label[for="password"]')?.textContent).toContain('Contraseña');
    expect(page.querySelector('#email')?.getAttribute('autocomplete')).toBe('email');
    expect(page.querySelector('#password')?.getAttribute('autocomplete')).toBe('current-password');
  });

  it('marks empty fields and does not call the API', () => {
    const { page, signIn, submit } = render();

    submit();

    expect(signIn).not.toHaveBeenCalled();
    expect(page.querySelector('#email-error')?.textContent).toContain('Escribe tu correo electrónico.');
    expect(page.querySelector('#password-error')?.textContent).toContain('Escribe tu contraseña.');
    expect(page.querySelector('#email')?.getAttribute('aria-invalid')).toBe('true');
  });

  it('shows and hides the password on request', () => {
    const { fixture, page } = render();
    const toggle = page.querySelector<HTMLButtonElement>('button.reveal')!;

    toggle.click();
    fixture.detectChanges();

    expect(page.querySelector('#password')?.getAttribute('type')).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('opens the session and reloads the shell on the requested page', () => {
    const { signIn, navigate, type, submit } = render({ returnUrl: '/appointment' });
    const session = TestBed.inject(SessionService) as SessionService & {
      getToken(): string | null;
      getRefreshToken(): string | null;
    };

    type('email', ' patient@example.com ');
    type('password', 'Secret123!');
    submit();

    expect(signIn).toHaveBeenCalledWith({ email: 'patient@example.com', password: 'Secret123!' });
    expect(session.getToken()).toBe('header.payload.signature');
    // Handed to the shell so sign-out can revoke it in identity-api.
    expect(session.getRefreshToken()).toBe('refresh-token');
    expect(navigate).toHaveBeenCalledWith('/appointment');
  });

  it('ignores a returnUrl that leaves the application', () => {
    const { navigate, type, submit } = render({ returnUrl: 'https://evil.example' });

    type('email', 'patient@example.com');
    type('password', 'Secret123!');
    submit();

    expect(navigate).toHaveBeenCalledWith('/');
  });

  it('blocks a second submit while signing in', () => {
    const pending = new Subject<SignInResult>();
    const { page, signIn, type, submit } = render({ signIn: vi.fn().mockReturnValue(pending) });

    type('email', 'patient@example.com');
    type('password', 'Secret123!');
    submit();
    submit();

    expect(signIn).toHaveBeenCalledTimes(1);
    expect(page.querySelector('button[type="submit"]')?.textContent).toContain('Ingresando…');
  });

  it('explains wrong credentials and keeps the email', () => {
    const error = { status: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid credentials.' };
    const { fixture, page, type, submit } = render({ signIn: vi.fn().mockReturnValue(throwError(() => error)) });

    type('email', 'patient@example.com');
    type('password', 'wrong-password');
    submit();
    fixture.detectChanges();

    expect(page.querySelector('[role="alert"]')?.textContent).toContain('El correo o la contraseña no coinciden.');
    expect(page.querySelector<HTMLInputElement>('#email')?.value).toBe('patient@example.com');
    expect(page.querySelector<HTMLInputElement>('#password')?.value).toBe('');
  });
});
