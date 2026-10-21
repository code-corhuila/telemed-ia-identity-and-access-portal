import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserMessage, errorMessage } from '../../data/error-message';
import { IdentityApiService } from '../../data/identity-api.service';
import { AuthLayoutComponent } from '../../ui/auth-layout.component';

@Component({
  selector: 'app-forgot-password-page',
  imports: [AuthLayoutComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.page.html',
  styleUrl: '../../ui/form-controls.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPage {
  private readonly identity = inject(IdentityApiService);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
  });

  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly failure = signal<UserMessage | null>(null);
  protected readonly sentTo = signal<string | null>(null);

  protected showError(): boolean {
    return this.submitted() && this.form.controls.email.invalid;
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

    this.identity.requestPasswordRecovery(email.value).subscribe({
      next: () => {
        this.submitting.set(false);
        this.sentTo.set(email.value);
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.failure.set(errorMessage(error));
      },
    });
  }

  protected askAgain(): void {
    this.sentTo.set(null);
    this.submitted.set(false);
  }
}
