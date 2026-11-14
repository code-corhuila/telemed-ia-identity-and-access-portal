/**
 * identity-api appends the reset token to the link as `#token=<value>`.
 * A fragment never reaches servers or Referer headers, so the page reads
 * it here and then removes it from the address bar.
 */
export function resetTokenFrom(fragment: string | null): string | null {
  return new URLSearchParams(fragment ?? '').get('token') || null;
}
