import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { ApiClientService } from 'shell/apiClient';
import { IdentityApiService, SignInResult } from './identity-api.service';

describe('IdentityApiService', () => {
  const result: SignInResult = {
    userId: '11111111-1111-4111-8111-111111111111',
    role: 'PATIENT',
    accessToken: 'header.payload.signature',
    tokenType: 'Bearer',
    expiresAt: '2026-10-21T15:00:00Z',
    refreshToken: 'refresh',
    refreshExpiresAt: '2026-10-28T15:00:00Z',
  };

  function setUp() {
    const post = vi.fn().mockReturnValue(of(result));
    TestBed.configureTestingModule({
      providers: [{ provide: ApiClientService, useValue: { post } }],
    });
    return { api: TestBed.inject(IdentityApiService), post };
  }

  it('signs in through the shell client with the identity-api contract', async () => {
    const { api, post } = setUp();

    const response = await firstValueFrom(
      api.signIn({ email: 'patient@example.com', password: 'Secret123!' }),
    );

    expect(response).toEqual(result);
    expect(post).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'patient@example.com', password: 'Secret123!' },
      expect.stringMatching(/^[0-9a-f-]{36}$/),
    );
  });

  it('sends a new idempotency key on every attempt', async () => {
    const { api, post } = setUp();
    const credentials = { email: 'patient@example.com', password: 'Secret123!' };

    await firstValueFrom(api.signIn(credentials));
    await firstValueFrom(api.signIn(credentials));

    expect(post.mock.calls[0][2]).not.toBe(post.mock.calls[1][2]);
  });
});
