import { assetUrl } from './asset-url';

describe('assetUrl', () => {
  it('resolves assets against the remote bundle, not the page that hosts it', () => {
    const url = new URL(assetUrl('hero-medical.png'));

    expect(url.pathname.endsWith('/assets/hero-medical.png')).toBe(true);
    expect(url.href).toBe(new URL('assets/hero-medical.png', import.meta.url).href);
  });
});
