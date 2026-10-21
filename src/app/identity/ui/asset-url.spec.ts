import { assetUrl } from './asset-url';

describe('assetUrl', () => {
  it('resolves assets against the remote bundle, not the page that hosts it', () => {
    // The shell page lives on :4200; the remote chunk is served from :4206.
    const chunkUrl = 'http://localhost:4206/chunk-ABC123.js';

    expect(assetUrl('hero-medical.png', chunkUrl)).toBe(
      'http://localhost:4206/assets/hero-medical.png',
    );
  });

  it('defaults to the URL of the module that calls it', () => {
    expect(assetUrl('logo.svg')).toMatch(/^[a-z]+:\/\/.+\/assets\/logo\.svg$/);
  });
});
