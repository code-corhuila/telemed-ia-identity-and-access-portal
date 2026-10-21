/**
 * Absolute URL of a file in `public/assets`.
 *
 * Inside the shell a relative `assets/...` would point to the shell's
 * origin; resolving against this module's URL keeps it on the remote's
 * origin, where the bundle chunks are served from the root.
 */
export function assetUrl(file: string, moduleUrl: string = import.meta.url): string {
  // Plain string handling: `new URL(..., import.meta.url)` is rewritten by
  // Vite in unit tests.
  const base = moduleUrl.slice(0, moduleUrl.lastIndexOf('/') + 1);
  return `${base}assets/${file}`;
}
