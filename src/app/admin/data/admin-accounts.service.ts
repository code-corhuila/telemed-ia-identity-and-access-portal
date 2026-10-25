import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from 'shell/apiClient';

export type AccountRole = 'PATIENT' | 'PROFESSIONAL' | 'ADMIN';

/** AccountResponse of telemed-ia-identity-and-access-api (FR-012). */
export interface Account {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly identityDocument: string;
  readonly role: AccountRole;
  readonly active: boolean;
  readonly registrationDate: string;
  /** null until the first sign-in. */
  readonly lastAccess: string | null;
}

/** NORMA pagination: page from 1, newest registration first. */
export interface AccountPage {
  readonly data: readonly Account[];
  readonly meta: { readonly page: number; readonly limit: number; readonly total: number; readonly totalPages: number };
}

export interface AccountQuery {
  readonly text: string;
  readonly role: AccountRole | null;
  readonly active: boolean | null;
  readonly page: number;
  readonly limit: number;
}

const ACCOUNTS = '/auth/admin/accounts';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Account administration in identity-and-access-api, through the shell's
 * single HTTP client (NORMA 5.4.1). The API answers 403 to anyone but ADMIN.
 */
@Injectable({ providedIn: 'root' })
export class AdminAccountsService {
  private readonly api = inject(ApiClientService);

  list(query: AccountQuery): Observable<AccountPage> {
    const params: Record<string, string | number> = {};
    const text = query.text.trim();
    if (text) {
      params['q'] = text;
    }
    if (query.role) {
      params['role'] = query.role;
    }
    if (query.active !== null) {
      params['active'] = String(query.active);
    }
    params['page'] = query.page;
    params['limit'] = query.limit;

    return this.api.getWithParams<AccountPage>(ACCOUNTS, params);
  }

  get(id: string): Observable<Account> {
    return this.api.get<Account>(accountPath(id));
  }

  /** false blocks the access (and closes the sessions); true restores it. */
  changeStatus(id: string, active: boolean): Observable<Account> {
    return this.api.put<Account>(`${accountPath(id)}/status`, { active });
  }
}

/** The id comes from the URL: only a UUID may become part of the API path. */
function accountPath(id: string): string {
  if (!UUID.test(id)) {
    throw new Error('Account id must be a UUID.');
  }
  return `${ACCOUNTS}/${id}`;
}
