import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { assetUrl } from './asset-url';
import { ensureBrandFont } from './brand-font';

/**
 * Frame shared by every identity page: the clinic photo with the page's
 * message on one side, the page form on the other.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [RouterLink],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayoutComponent {
  readonly heading = input.required<string>();
  readonly lede = input('');

  protected readonly photoUrl = assetUrl('hero-medical.png');
  protected readonly logoUrl = assetUrl('logo.svg');

  constructor() {
    ensureBrandFont(inject(DOCUMENT));
  }
}
