import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { PasswordStrength, passwordStrength } from '../forms/password-policy';

const LABELS: Readonly<Record<PasswordStrength, string>> = {
  empty: '',
  weak: 'Débil',
  fair: 'Aceptable',
  strong: 'Fuerte',
};

/** Three bars and a word rating the password; guidance only, the policy validator decides. */
@Component({
  selector: 'app-password-meter',
  template: `
    <span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>
    @if (label()) {
      <span>Seguridad: {{ label() }}</span>
    }
  `,
  styleUrl: './password-meter.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-live': 'polite', '[attr.data-strength]': 'strength()' },
})
export class PasswordMeterComponent {
  readonly password = input.required<string>();

  protected readonly strength = computed(() => passwordStrength(this.password()));
  protected readonly label = computed(() => LABELS[this.strength()]);
}
