import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { UserMessage, errorMessage } from '../../../identity/data/error-message';
import { Account, AdminAccountsService } from '../../data/admin-accounts.service';
import { DATE_TIME, ROLE_LABELS } from '../accounts/accounts.page';

type ViewState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'missing' }
  | { readonly kind: 'error'; readonly message: UserMessage }
  | { readonly kind: 'ready'; readonly account: Account };

/** FR-012: the administrator blocks or restores the access of one account. */
@Component({
  selector: 'app-account-detail-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './account-detail.page.html',
  styleUrls: ['../../ui/admin.css', './account-detail.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountDetailPage {
  private readonly accounts = inject(AdminAccountsService);
  // The shell's router does not bind route parameters to inputs.
  private readonly id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  readonly roleLabels = ROLE_LABELS;
  readonly state = signal<ViewState>({ kind: 'loading' });
  readonly confirming = signal(false);
  readonly saving = signal(false);
  readonly done = signal<string | null>(null);
  readonly failure = signal<UserMessage | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.state.set({ kind: 'loading' });
    this.accounts.get(this.id).subscribe({
      next: (account) => this.state.set({ kind: 'ready', account }),
      error: (error: { status?: number }) =>
        this.state.set(error?.status === 404 ? { kind: 'missing' } : { kind: 'error', message: errorMessage(error) }),
    });
  }

  askToBlock(): void {
    this.done.set(null);
    this.failure.set(null);
    this.confirming.set(true);
  }

  setActive(active: boolean): void {
    this.confirming.set(false);
    this.saving.set(true);
    this.done.set(null);
    this.failure.set(null);
    this.accounts.changeStatus(this.id, active).subscribe({
      next: (account) => {
        this.saving.set(false);
        this.state.set({ kind: 'ready', account });
        this.done.set(active ? 'Acceso restaurado. Ya puede iniciar sesión de nuevo.' : 'Acceso bloqueado.');
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.failure.set(errorMessage(error));
      },
    });
  }

  format(value: string | null): string {
    return value ? DATE_TIME.format(new Date(value)) : 'Nunca';
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  }
}
