import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserMessage, errorMessage } from '../../data/error-message';
import { IdentityApiService } from '../../data/identity-api.service';
import { passwordPolicy } from '../../forms/password-policy';
import { AuthLayoutComponent } from '../../ui/auth-layout.component';
import { PasswordMeterComponent } from '../../ui/password-meter.component';

type Field = 'fullName' | 'email' | 'identityDocument' | 'password';

@Component({
  selector: 'app-register-page',
  imports: [AuthLayoutComponent, PasswordMeterComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './register.page.html',
  styleUrl: '../../ui/form-controls.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly identity = inject(IdentityApiService);

  // Limits from RegisterPatientRequest in identity-api.
  protected readonly form = inject(FormBuilder).nonNullable.group({
    fullName: ['', [Validators.required, Validators.maxLength(150)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
    identityDocument: ['', [Validators.required, Validators.maxLength(50)]],
    password: ['', [Validators.required, passwordPolicy]],
  });

  protected readonly password = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });

  protected readonly submitted = signal(false);
  protected readonly submitting = signal(false);
  protected readonly passwordVisible = signal(false);
  protected readonly failure = signal<UserMessage | null>(null);
  protected readonly registeredEmail = signal<string | null>(null);

  protected showError(field: Field): boolean {
    return this.submitted() && this.form.controls[field].invalid;
  }

  protected submit(): void {
    if (this.submitting()) {
      return;
    }

    for (const field of ['fullName', 'email', 'identityDocument'] as const) {
      const control = this.form.controls[field];
      control.setValue(control.value.trim());
    }
    this.submitted.set(true);
    if (this.form.invalid) {
      return;
    }

    this.submitting.set(true);
    this.failure.set(null);

    const registration = this.form.getRawValue();
    this.identity.register(registration).subscribe({
      next: () => this.registeredEmail.set(registration.email),
      error: (error: unknown) => {
        this.submitting.set(false);
        this.failure.set(errorMessage(error));
        this.form.controls.password.reset();
        this.submitted.set(false);
      },
    });
  }
}
