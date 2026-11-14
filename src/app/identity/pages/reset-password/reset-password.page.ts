import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { UserMessage, errorMessage } from '../../data/error-message';
import { IdentityApiService } from '../../data/identity-api.service';
import { resetTokenFrom } from '../../data/reset-token';
import { passwordPolicy } from '../../forms/password-policy';
import { AuthLayoutComponent } from '../../ui/auth-layout.component';
import { PasswordMeterComponent } from '../../ui/password-meter.component';
import { RevealToggleComponent } from '../../ui/reveal-toggle.component';

type Step = 'form' | 'done' | 'invalidLink';

@Component({
  selector: 'app-reset-password-page',
  imports: [AuthLayoutComponent, PasswordMeterComponent, ReactiveFormsModule, RevealToggleComponent, RouterLink],
  templateUrl: './reset-password.page.html',
  styleUrl: '../../ui/form-controls.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPage {
  private readonly identity = inject(IdentityApiService);
  private readonly token = resetTokenFrom(inject(ActivatedRoute).snapshot.fragment);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    password: ['', [Validators.required, passwordPolicy]],
  });

  protected readonly password = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });

  protected readonly step = signal<Step>(this.token ? 'form' : 'invalidLink');
  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly passwordVisible = signal(false);
  protected readonly failure = signal<UserMessage | null>(null);

  constructor() {
    // Keep the token out of history, bookmarks and screen shares.
    const location = inject(Location);
    location.replaceState(location.path(false));
  }

  protected showError(): boolean {
    return this.submitted() && this.form.controls.password.invalid;
  }

  protected submit(): void {
    if (this.submitting() || !this.token) {
      return;
    }

    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    this.failure.set(null);

    this.identity.resetPassword(this.token, this.form.controls.password.value).subscribe({
      next: () => this.step.set('done'),
      error: (error: unknown) => {
        this.submitting.set(false);
        if ((error as { code?: string } | null)?.code === 'INVALID_RESET_TOKEN') {
          this.step.set('invalidLink');
          return;
        }
        this.failure.set(errorMessage(error));
        this.form.controls.password.reset();
        this.submitted.set(false);
      },
    });
  }
}
