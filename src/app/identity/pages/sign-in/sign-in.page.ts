import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SessionService } from 'shell/session';
import { UserMessage, errorMessage } from '../../data/error-message';
import { IdentityApiService } from '../../data/identity-api.service';
import { PageNavigation } from '../../data/page-navigation';
import { safeReturnUrl } from '../../data/safe-return-url';
import { AuthLayoutComponent } from '../../ui/auth-layout.component';
import { RevealToggleComponent } from '../../ui/reveal-toggle.component';

@Component({
  selector: 'app-sign-in-page',
  imports: [AuthLayoutComponent, ReactiveFormsModule, RevealToggleComponent, RouterLink],
  templateUrl: './sign-in.page.html',
  styleUrl: '../../ui/form-controls.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInPage {
  private readonly identity = inject(IdentityApiService);
  private readonly session = inject(SessionService);
  private readonly navigation = inject(PageNavigation);
  private readonly route = inject(ActivatedRoute);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly passwordVisible = signal(false);
  protected readonly failure = signal<UserMessage | null>(null);

  protected showError(field: 'email' | 'password'): boolean {
    return this.submitted() && this.form.controls[field].invalid;
  }

  protected submit(): void {
    if (this.submitting()) {
      return;
    }

    const email = this.form.controls.email;
    email.setValue(email.value.trim());
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    this.failure.set(null);

    this.identity.signIn(this.form.getRawValue()).subscribe({
      next: (result) => {
        // The shell keeps the refresh token only to revoke it on sign-out.
        this.session.signIn(result.accessToken, result.refreshToken);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.navigation.open(safeReturnUrl(returnUrl));
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.failure.set(errorMessage(error));
        this.form.controls.password.reset();
        this.submitted.set(false);
      },
    });
  }
}
