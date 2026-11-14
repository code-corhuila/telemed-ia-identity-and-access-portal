import { resetTokenFrom } from './reset-token';

describe('resetTokenFrom', () => {
  it('reads the token identity-api appends as #token=', () => {
    expect(resetTokenFrom('token=abc-123_XYZ')).toBe('abc-123_XYZ');
  });

  it('decodes an encoded token', () => {
    expect(resetTokenFrom('token=a%2Bb%3D')).toBe('a+b=');
  });

  it('has no token without a fragment or with an empty one', () => {
    expect(resetTokenFrom(null)).toBeNull();
    expect(resetTokenFrom('')).toBeNull();
    expect(resetTokenFrom('token=')).toBeNull();
    expect(resetTokenFrom('other=1')).toBeNull();
  });
});
