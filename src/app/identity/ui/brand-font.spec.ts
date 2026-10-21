import { BRAND_FONT_HREF, ensureBrandFont } from './brand-font';

describe('ensureBrandFont', () => {
  afterEach(() => {
    document.head.querySelectorAll('link[data-tm-font]').forEach((link) => link.remove());
  });

  it('adds the Inter stylesheet once, even when called by several pages', () => {
    ensureBrandFont(document);
    ensureBrandFont(document);

    const links = document.head.querySelectorAll<HTMLLinkElement>('link[data-tm-font]');
    expect(links.length).toBe(1);
    expect(links[0].rel).toBe('stylesheet');
    expect(links[0].href).toBe(BRAND_FONT_HREF);
  });
});
