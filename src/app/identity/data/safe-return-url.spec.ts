import { safeReturnUrl } from './safe-return-url';

describe('safeReturnUrl', () => {
  it('keeps paths inside the application', () => {
    expect(safeReturnUrl('/appointment/new?day=2026-10-21')).toBe('/appointment/new?day=2026-10-21');
  });

  it.each([
    ['missing', null],
    ['empty', ''],
    ['absolute URL', 'https://evil.example/phish'],
    ['protocol-relative URL', '//evil.example'],
    ['backslash trick', '/\\evil.example'],
    ['javascript scheme', 'javascript:alert(1)'],
    ['relative path', 'dashboard'],
  ])('falls back to the home page for a %s', (_case, value) => {
    expect(safeReturnUrl(value)).toBe('/');
  });
});
