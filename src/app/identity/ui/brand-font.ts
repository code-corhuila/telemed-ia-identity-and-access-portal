export const BRAND_FONT_HREF =
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap';

/**
 * The remote's index.html is not used inside the shell, so the layout
 * requests the brand font itself, once per document.
 */
export function ensureBrandFont(document: Document): void {
  if (document.head.querySelector('link[data-tm-font]')) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = BRAND_FONT_HREF;
  link.dataset['tmFont'] = '';
  document.head.appendChild(link);
}
