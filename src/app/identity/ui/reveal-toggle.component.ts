import { ChangeDetectionStrategy, Component, model } from '@angular/core';

/** Show/hide button placed inside `.secret`, next to a password input. */
@Component({
  selector: 'button[appRevealToggle]',
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
      @if (visible()) {
        <path d="M3 3l18 18M10.6 5.1A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.3 2.4-2.6 3.7M6.6 6.6C4.4 8 2.9 10 2 12c1 2.5 5 7 10 7 1.8 0 3.4-.6 4.8-1.4M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      } @else {
        <path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      }
    </svg>
  `,
  styles: `
    svg {
      width: 20px;
      height: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'reveal',
    type: 'button',
    'aria-label': 'Mostrar contraseña',
    '[attr.aria-pressed]': 'visible()',
    '(click)': 'visible.set(!visible())',
  },
})
export class RevealToggleComponent {
  readonly visible = model(false);
}
