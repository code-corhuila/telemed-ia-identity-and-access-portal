/**
 * The shell's authGuard sends `returnUrl` in the query string, so it is
 * user-controlled: only paths inside the application are followed
 * (OWASP unvalidated redirects).
 */
export function safeReturnUrl(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/';
  }
  return value;
}
