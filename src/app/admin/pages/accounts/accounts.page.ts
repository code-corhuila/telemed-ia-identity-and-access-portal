import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { UserMessage, errorMessage } from '../../../identity/data/error-message';
import { AccountPage, AccountQuery, AccountRole, AdminAccountsService } from '../../data/admin-accounts.service';

type ViewState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly page: AccountPage }
  | { readonly kind: 'error'; readonly message: UserMessage };

const LIMIT = 20;

export const ROLE_LABELS: Readonly<Record<AccountRole, string>> = {
  PATIENT: 'Paciente',
  PROFESSIONAL: 'Profesional',
  ADMIN: 'Administrador',
};

// The platform runs in Colombia: dates read in Colombian time whatever the device says.
const DATE_TIME = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/Bogota',
});

/** FR-012: the administrator browses the registered accounts. */
@Component({
  selector: 'app-accounts-page',
  standalone: true,
  templateUrl: './accounts.page.html',
  styleUrl: './accounts.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountsPage {
  private readonly accounts = inject(AdminAccountsService);

  readonly roleLabels = ROLE_LABELS;
  readonly state = signal<ViewState>({ kind: 'loading' });
  readonly query = signal<AccountQuery>({ text: '', role: null, active: null, page: 1, limit: LIMIT });

  constructor() {
    this.load();
  }

  load(): void {
    this.state.set({ kind: 'loading' });
    this.accounts.list(this.query()).subscribe({
      next: (page) => this.state.set({ kind: 'ready', page }),
      error: (error: unknown) => this.state.set({ kind: 'error', message: errorMessage(error) }),
    });
  }

  search(text: string): void {
    this.update({ text });
  }

  filterRole(value: string): void {
    this.update({ role: value ? (value as AccountRole) : null });
  }

  filterStatus(value: string): void {
    this.update({ active: value === '' ? null : value === 'true' });
  }

  clearFilters(): void {
    this.update({ text: '', role: null, active: null });
  }

  goTo(page: number): void {
    this.query.update((query) => ({ ...query, page }));
    this.load();
  }

  lastAccess(value: string | null): string {
    return value ? DATE_TIME.format(new Date(value)) : 'Nunca';
  }

  /** Any change of the filters starts again from the first page. */
  private update(change: Partial<AccountQuery>): void {
    this.query.update((query) => ({ ...query, ...change, page: 1 }));
    this.load();
  }
}
